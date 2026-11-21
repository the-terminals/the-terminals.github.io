/**
 * Local-only storage for /super-admin.
 * Reads and writes src/data/*.json through the dev-server endpoint in vite.config.ts,
 * so it only works while `npm run dev` is running. Commit and push the changed files yourself.
 */

export type DataFile = "areasOfWork.json" | "knowledge.json" | "playlists.json";

export async function loadFile<T>(file: DataFile): Promise<T> {
  const res = await fetch(`/__admin/data/${file}`, { cache: "no-store" });
  if (!res.ok) throw new Error(`Could not read src/data/${file}`);
  return res.json();
}

export async function saveFile<T>(file: DataFile, data: T): Promise<void> {
  const res = await fetch(`/__admin/data/${file}`, {
    method: "PUT",
    body: JSON.stringify(data, null, 2) + "\n",
  });
  if (!res.ok) throw new Error(`Could not write src/data/${file}: ${await res.text()}`);
}

/** Paths of uploaded book covers, e.g. "/images/books/my-cover.jpg". */
export async function listUploadedImages(): Promise<string[]> {
  const res = await fetch("/__admin/images", { cache: "no-store" });
  return res.ok ? res.json() : [];
}

/** Saves an image into public/images/books and returns its site path. */
export async function uploadImage(file: File): Promise<string> {
  const res = await fetch(`/__admin/images?name=${encodeURIComponent(file.name)}`, {
    method: "POST",
    body: file,
  });
  const body = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(body.error || "Upload failed");
  return body.path;
}

/** Saves a book PDF into public/pdfs/books and returns its site path. */
export async function uploadPdf(file: File): Promise<string> {
  const res = await fetch(`/__admin/pdfs?name=${encodeURIComponent(file.name)}`, {
    method: "POST",
    body: file,
  });
  const body = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(body.error || "Upload failed");
  return body.path;
}

export type FetchedPlaylist = {
  playlistId: string;
  title: string;
  videos: { videoId: string; title: string; duration?: string; isValid: boolean }[];
};

/** Asks the dev server to read every video of a YouTube playlist. */
export async function fetchYoutubePlaylist(url: string): Promise<FetchedPlaylist> {
  const res = await fetch("/__admin/youtube-playlist", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ url }),
  });
  const body = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(body.error || "Could not load this playlist.");
  return body;
}
