/**
 * Fetches every video of a public (or unlisted) YouTube playlist without an API key,
 * by reading the same data the playlist web page uses and following its continuation
 * tokens past the first 100 videos.
 *
 * Ported from kernel-cluster (engine/src/seerah/youtube-playlist.service.ts).
 * Runs only inside the Vite dev server (`npm run admin`), never in the browser or the live site.
 */

/* eslint-disable @typescript-eslint/no-explicit-any -- YouTube's page data is untyped JSON */

export interface PlaylistVideoInfo {
  videoId: string;
  title: string;
  duration?: string;
  isValid: boolean;
}

export interface PlaylistInfo {
  playlistId: string;
  title: string;
  videos: PlaylistVideoInfo[];
}

const BROWSER_UA =
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0 Safari/537.36";
const FETCH_TIMEOUT_MS = 15000;
const MAX_PAGES = 100; // 100 videos/page -> up to ~10,000 videos
const COMMON_HEADERS = {
  "User-Agent": BROWSER_UA,
  "Accept-Language": "en-US,en;q=0.9",
  // Skips the EU cookie-consent interstitial
  Cookie: "CONSENT=YES+1; SOCS=CAI",
};

export class PlaylistError extends Error {}

/** Accepts a playlist URL (…?list=PL…, or a watch URL with &list=) or a bare playlist id. */
export function extractPlaylistId(input: string): string {
  const raw = String(input ?? "").trim();
  if (!raw) throw new PlaylistError("Playlist link is required");
  if (/^[A-Za-z0-9_-]{10,}$/.test(raw) && !raw.includes(".")) return raw;
  try {
    const url = new URL(raw.startsWith("http") ? raw : `https://${raw}`);
    const id = url.searchParams.get("list");
    if (id) return id;
  } catch {
    /* fall through */
  }
  throw new PlaylistError('Could not find a playlist id. Paste a YouTube playlist link containing "list=".');
}

export async function fetchPlaylist(
  input: string,
  fetchImpl: typeof fetch = fetch,
): Promise<PlaylistInfo> {
  const playlistId = extractPlaylistId(input);
  const html = await get(
    `https://www.youtube.com/playlist?list=${encodeURIComponent(playlistId)}&hl=en`,
    fetchImpl,
  );

  const data = extractJson(html, "ytInitialData");
  if (!data) {
    throw new PlaylistError("Could not read this playlist from YouTube. Make sure it is public or unlisted.");
  }

  const apiKey = html.match(/"INNERTUBE_API_KEY":"([^"]+)"/)?.[1];
  const clientVersion = html.match(/"INNERTUBE_CONTEXT_CLIENT_VERSION":"([^"]+)"/)?.[1] ?? "2.20240101.00.00";

  const title: string = data?.metadata?.playlistMetadataRenderer?.title ?? "Playlist";

  let items: any[] = findFirstItems(data);
  if (!items.length) {
    throw new PlaylistError("No videos found. The playlist may be private, empty or invalid.");
  }

  const videos: PlaylistVideoInfo[] = [];
  let page = 0;
  while (items.length && page < MAX_PAGES) {
    let token: string | undefined;
    for (const item of items) {
      const r = item?.playlistVideoRenderer;
      const lockup = item?.lockupViewModel;
      if (r?.videoId) {
        // Legacy format
        videos.push(toVideo(r));
      } else if (lockup?.contentId) {
        // Current format (YouTube moved playlists to lockupViewModel)
        if (!lockup.contentType || lockup.contentType === "LOCKUP_CONTENT_TYPE_VIDEO") {
          videos.push(lockupToVideo(lockup));
        }
      } else if (item?.continuationItemRenderer) {
        token = item.continuationItemRenderer?.continuationEndpoint?.continuationCommand?.token;
      } else if (item?.continuationItemViewModel) {
        token =
          item.continuationItemViewModel?.continuationCommand?.innertubeCommand?.continuationCommand?.token ??
          item.continuationItemViewModel?.continuationCommand?.continuationCommand?.token;
      }
    }
    if (!token || !apiKey) break;
    items = await fetchContinuation(token, apiKey, clientVersion, fetchImpl);
    page++;
  }

  // Deduplicate (a playlist can contain the same video twice)
  const seen = new Set<string>();
  const unique = videos.filter((v) => (seen.has(v.videoId) ? false : (seen.add(v.videoId), true)));

  return { playlistId, title, videos: unique };
}

function toVideo(r: any): PlaylistVideoInfo {
  const videoId: string = r.videoId;
  const title: string =
    r.title?.runs?.map((x: any) => x.text).join("") ?? r.title?.simpleText ?? `YouTube Video (${videoId})`;
  // "[Private video]" / "[Deleted video]" entries are unplayable
  const isValid = r.isPlayable !== false && !/^\[(private|deleted) video\]$/i.test(title);
  return { videoId, title, duration: r.lengthText?.simpleText, isValid };
}

function lockupToVideo(l: any): PlaylistVideoInfo {
  const videoId: string = l.contentId;
  const title: string = l.metadata?.lockupMetadataViewModel?.title?.content ?? `YouTube Video (${videoId})`;
  // Duration lives in a thumbnail overlay badge, e.g. "1:03:20"
  let duration: string | undefined;
  const walk = (o: any): void => {
    if (!o || typeof o !== "object" || duration) return;
    const t = o.thumbnailBadgeViewModel?.text;
    if (typeof t === "string" && /^\d{1,2}(:\d{2}){1,2}$/.test(t)) {
      duration = t;
      return;
    }
    for (const k of Object.keys(o)) walk(o[k]);
  };
  walk(l.contentImage);
  const isValid = !/^\[?(private|deleted) video\]?$/i.test(title);
  return { videoId, title, duration, isValid };
}

async function fetchContinuation(
  token: string,
  apiKey: string,
  clientVersion: string,
  fetchImpl: typeof fetch,
): Promise<any[]> {
  const res = await fetchWithTimeout(
    `https://www.youtube.com/youtubei/v1/browse?key=${apiKey}`,
    {
      method: "POST",
      headers: { ...COMMON_HEADERS, "Content-Type": "application/json" },
      body: JSON.stringify({
        context: { client: { clientName: "WEB", clientVersion, hl: "en" } },
        continuation: token,
      }),
    },
    fetchImpl,
  );
  if (!res.ok) return [];
  const json: any = await res.json();
  const actions = json?.onResponseReceivedActions ?? [];
  for (const a of actions) {
    const list = a?.appendContinuationItemsAction?.continuationItems;
    if (Array.isArray(list)) return list;
  }
  return [];
}

function findFirstItems(data: any): any[] {
  const tabs = data?.contents?.twoColumnBrowseResultsRenderer?.tabs ?? [];
  for (const tab of tabs) {
    const sections = tab?.tabRenderer?.content?.sectionListRenderer?.contents ?? [];
    for (const s of sections) {
      const inner = s?.itemSectionRenderer?.contents ?? [];
      for (const c of inner) {
        const list = c?.playlistVideoListRenderer?.contents;
        if (Array.isArray(list)) return list;
      }
      // Current format: lockupViewModel items sit directly in the section
      if (inner.some((c: any) => c?.lockupViewModel)) return inner;
    }
  }
  return [];
}

/** Pulls `var <name> = {...};` out of the page by brace matching. */
function extractJson(html: string, name: string): any | null {
  const marker = html.indexOf(`${name} = `);
  const start = marker === -1 ? html.indexOf(`${name}=`) : marker;
  if (start === -1) return null;
  const open = html.indexOf("{", start);
  if (open === -1) return null;
  let depth = 0;
  let inStr = false;
  let esc = false;
  for (let i = open; i < html.length; i++) {
    const ch = html[i];
    if (inStr) {
      if (esc) esc = false;
      else if (ch === "\\") esc = true;
      else if (ch === '"') inStr = false;
      continue;
    }
    if (ch === '"') inStr = true;
    else if (ch === "{") depth++;
    else if (ch === "}") {
      depth--;
      if (depth === 0) {
        try {
          return JSON.parse(html.slice(open, i + 1));
        } catch {
          return null;
        }
      }
    }
  }
  return null;
}

async function get(url: string, fetchImpl: typeof fetch): Promise<string> {
  const res = await fetchWithTimeout(url, { headers: COMMON_HEADERS }, fetchImpl);
  if (!res.ok) throw new PlaylistError(`YouTube responded with ${res.status}`);
  return res.text();
}

async function fetchWithTimeout(url: string, init: RequestInit, fetchImpl: typeof fetch): Promise<Response> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
  try {
    return await fetchImpl(url, { ...init, signal: controller.signal });
  } catch {
    throw new PlaylistError("Could not reach YouTube. Check your internet connection and try again.");
  } finally {
    clearTimeout(timer);
  }
}
