import { useState } from "react";
import { Download, ListVideo, Loader2, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import PlaylistVideos from "@/components/playlists/PlaylistVideos";
import { videoThumbnail, type Playlist, type PlaylistVideo } from "@/components/playlists/playlist";
import { useJsonFile } from "./useJsonFile";
import { fetchYoutubePlaylist } from "./storage";
import { ConfirmRemove, LoadState, PageHeader, RowActions } from "./AdminParts";

type Draft = {
  index: number | null; // null = new playlist
  name: string;
  url: string;
  id: string; // YouTube playlist id, set after fetching
  videos: PlaylistVideo[];
  fetchedUrl: string; // the link the current videos came from
  skipped: number; // private / deleted videos left out
};

/** Reads the playlist from YouTube and keeps only playable videos. */
const loadVideos = async (url: string) => {
  const res = await fetchYoutubePlaylist(url);
  const videos = res.videos
    .filter((v) => v.isValid)
    .map(({ videoId, title, duration }) => (duration ? { videoId, title, duration } : { videoId, title }));
  return { id: res.playlistId, title: res.title, videos, skipped: res.videos.length - videos.length };
};

const formatDate = (iso: string) =>
  iso ? new Date(iso).toLocaleDateString(undefined, { day: "numeric", month: "short", year: "numeric" }) : "";

const PlaylistsAdmin = () => {
  const { data, loading, saving, error, reload, save: saveFile } = useJsonFile<Playlist[]>("playlists.json");
  const [draft, setDraft] = useState<Draft | null>(null);
  const [fetching, setFetching] = useState(false);
  const [syncing, setSyncing] = useState<string | null>(null);
  const [preview, setPreview] = useState<Playlist | null>(null);
  const [removing, setRemoving] = useState<number | null>(null);

  const playlists = data ?? [];
  const busy = saving || fetching || syncing !== null;

  const openAdd = () =>
    setDraft({ index: null, name: "", url: "", id: "", videos: [], fetchedUrl: "", skipped: 0 });

  const openEdit = (index: number) => {
    const p = playlists[index];
    setDraft({ index, name: p.name, url: p.url, id: p.id, videos: p.videos, fetchedUrl: p.url, skipped: 0 });
  };

  const fetchDraft = async () => {
    if (!draft) return;
    setFetching(true);
    try {
      const res = await loadVideos(draft.url);
      const duplicate = playlists.findIndex((p) => p.id === res.id);
      if (duplicate !== -1 && duplicate !== draft.index) {
        toast.error(`This playlist is already added as “${playlists[duplicate].name}”.`);
        return;
      }
      setDraft((d) =>
        d
          ? {
              ...d,
              id: res.id,
              videos: res.videos,
              skipped: res.skipped,
              fetchedUrl: d.url,
              name: d.name.trim() ? d.name : res.title,
            }
          : d,
      );
      toast.success(`Found ${res.videos.length} videos`);
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setFetching(false);
    }
  };

  const saveDraft = async () => {
    if (!draft) return;
    const item: Playlist = {
      id: draft.id,
      name: draft.name.trim(),
      url: draft.url.trim(),
      videos: draft.videos,
      updatedAt: new Date().toISOString(),
    };
    const next =
      draft.index === null ? [...playlists, item] : playlists.map((p, i) => (i === draft.index ? item : p));
    if (await saveFile(next)) setDraft(null);
  };

  /** Re-reads a saved playlist from YouTube to pick up new or removed videos. */
  const sync = async (index: number) => {
    const p = playlists[index];
    setSyncing(p.id);
    try {
      const res = await loadVideos(p.url);
      const before = new Set(p.videos.map((v) => v.videoId));
      const added = res.videos.filter((v) => !before.has(v.videoId)).length;
      const removed = p.videos.length - (res.videos.length - added);
      const item = { ...p, videos: res.videos, updatedAt: new Date().toISOString() };
      if (await saveFile(playlists.map((x, i) => (i === index ? item : x)))) {
        toast.info(
          added || removed
            ? `${p.name}: ${added} new, ${removed} removed`
            : `${p.name} is already up to date`,
        );
      }
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setSyncing(null);
    }
  };

  const remove = async () => {
    if (removing === null) return;
    const index = removing;
    setRemoving(null);
    await saveFile(playlists.filter((_, i) => i !== index));
  };

  const linkChanged = !!draft && draft.url.trim() !== draft.fetchedUrl.trim();
  const canSave = !!draft && draft.name.trim() && draft.videos.length > 0 && !linkChanged;

  return (
    <div>
      <PageHeader
        title="Playlists"
        count={data ? playlists.length : undefined}
        addLabel="Add playlist"
        onAdd={openAdd}
        onReload={reload}
        disabled={loading || busy}
      />

      <LoadState loading={loading} error={error} onRetry={reload} />

      {data && !loading && (
        <Card className="divide-y divide-border">
          {playlists.map((p, i) => (
            <div key={p.id} className="flex items-center gap-3 p-3">
              <div className="h-12 w-20 shrink-0 overflow-hidden rounded bg-muted">
                {p.videos[0] && (
                  <img src={videoThumbnail(p.videos[0].videoId)} alt="" className="h-full w-full object-cover" />
                )}
              </div>
              <div className="min-w-0 flex-1">
                <p className="font-medium text-foreground truncate">{p.name}</p>
                <p className="text-sm text-muted-foreground truncate">
                  {p.videos.length} videos · updated {formatDate(p.updatedAt)}
                </p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => sync(i)}
                disabled={busy}
                title="Get the latest videos from YouTube"
              >
                <RefreshCw className={`h-4 w-4 ${syncing === p.id ? "animate-spin" : ""}`} />
                <span className="hidden sm:inline ml-1">Sync</span>
              </Button>
              <RowActions
                onPreview={() => setPreview(p)}
                onEdit={() => openEdit(i)}
                onRemove={() => setRemoving(i)}
                disabled={busy}
              />
            </div>
          ))}
          {playlists.length === 0 && (
            <div className="p-8 text-center text-muted-foreground">
              <ListVideo className="h-6 w-6 mx-auto mb-2" />
              No playlists yet. Click “Add playlist” and paste a YouTube playlist link.
            </div>
          )}
        </Card>
      )}

      {/* Add / edit */}
      <Dialog open={!!draft} onOpenChange={(o) => !o && !busy && setDraft(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{draft?.index === null ? "Add playlist" : "Edit playlist"}</DialogTitle>
          </DialogHeader>
          {draft && (
            <div className="grid gap-4">
              <div className="grid gap-1.5">
                <Label htmlFor="playlist-url">YouTube playlist link</Label>
                <div className="flex gap-2">
                  <Input
                    id="playlist-url"
                    placeholder="https://www.youtube.com/playlist?list=..."
                    value={draft.url}
                    onChange={(e) => setDraft({ ...draft, url: e.target.value })}
                    onKeyDown={(e) => e.key === "Enter" && draft.url.trim() && fetchDraft()}
                  />
                  <Button
                    type="button"
                    variant={linkChanged || draft.videos.length === 0 ? "default" : "outline"}
                    onClick={fetchDraft}
                    disabled={!draft.url.trim() || busy}
                    className="shrink-0"
                  >
                    {fetching ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Download className="h-4 w-4 mr-2" />}
                    {draft.videos.length && !linkChanged ? "Fetch again" : "Fetch videos"}
                  </Button>
                </div>
                {linkChanged && draft.videos.length > 0 && (
                  <p className="text-xs text-amber-700">The link changed. Fetch the videos again before saving.</p>
                )}
              </div>

              <div className="grid gap-1.5">
                <Label htmlFor="playlist-name">Name</Label>
                <Input
                  id="playlist-name"
                  placeholder="Filled in from YouTube; you can change it"
                  value={draft.name}
                  onChange={(e) => setDraft({ ...draft, name: e.target.value })}
                />
              </div>

              <div className="grid gap-1.5">
                <Label className="text-muted-foreground">
                  Videos{draft.videos.length > 0 && ` (${draft.videos.length})`}
                  {draft.skipped > 0 && ` · ${draft.skipped} private or deleted left out`}
                </Label>
                <div className="max-h-72 overflow-y-auto rounded-lg border border-border divide-y divide-border">
                  {fetching ? (
                    <div className="flex items-center justify-center gap-2 p-8 text-sm text-muted-foreground">
                      <Loader2 className="h-4 w-4 animate-spin" /> Reading the playlist from YouTube…
                    </div>
                  ) : draft.videos.length === 0 ? (
                    <p className="p-8 text-center text-sm text-muted-foreground">
                      Paste a playlist link and click “Fetch videos”.
                    </p>
                  ) : (
                    draft.videos.map((v, i) => (
                      <div key={v.videoId} className="flex items-center gap-3 p-2">
                        <span className="w-6 text-right text-xs text-muted-foreground">{i + 1}</span>
                        <img
                          src={videoThumbnail(v.videoId)}
                          alt=""
                          loading="lazy"
                          className="h-9 w-16 shrink-0 rounded object-cover bg-muted"
                        />
                        <span className="min-w-0 flex-1 truncate text-sm">{v.title}</span>
                        {v.duration && <span className="text-xs text-muted-foreground">{v.duration}</span>}
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="ghost" onClick={() => setDraft(null)} disabled={busy}>
              Cancel
            </Button>
            <Button onClick={saveDraft} disabled={!canSave || busy}>
              {saving ? "Saving…" : "Save"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Preview: same view as the public Playlists page */}
      <Dialog open={!!preview} onOpenChange={(o) => !o && setPreview(null)}>
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {preview?.name}
              <span className="ml-2 text-sm font-normal text-muted-foreground">{preview?.videos.length} videos</span>
            </DialogTitle>
          </DialogHeader>
          {preview && <PlaylistVideos playlist={preview} />}
        </DialogContent>
      </Dialog>

      <ConfirmRemove
        name={removing !== null ? (playlists[removing]?.name ?? "") : ""}
        open={removing !== null}
        onCancel={() => setRemoving(null)}
        onConfirm={remove}
      />
    </div>
  );
};

export default PlaylistsAdmin;
