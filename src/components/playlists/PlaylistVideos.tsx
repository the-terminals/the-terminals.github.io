import { useState } from "react";
import { ChevronLeft, ChevronRight, ExternalLink, Play } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";

import { videoThumbnail, videoUrl, type Playlist, type PlaylistVideo } from "./playlist";

export type { Playlist, PlaylistVideo };

export const VideoCard = ({
  video,
  index,
  onPlay,
}: {
  video: PlaylistVideo;
  index: number;
  onPlay: () => void;
}) => (
  <button
    type="button"
    onClick={onPlay}
    className="group text-left rounded-xl overflow-hidden bg-card shadow-elegant transition-all duration-300 hover:shadow-xl hover:-translate-y-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
  >
    <div className="relative aspect-video bg-muted overflow-hidden">
      <img
        src={videoThumbnail(video.videoId)}
        alt=""
        loading="lazy"
        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
      />
      <span className="absolute inset-0 flex items-center justify-center bg-black/0 transition-colors group-hover:bg-black/40">
        <span className="flex h-12 w-12 items-center justify-center rounded-full bg-primary text-primary-foreground opacity-0 scale-90 transition-all group-hover:opacity-100 group-hover:scale-100">
          <Play className="h-5 w-5 ml-0.5 fill-current" />
        </span>
      </span>
      {video.duration && (
        <span className="absolute bottom-2 right-2 rounded bg-black/75 px-1.5 py-0.5 text-[11px] font-medium text-white">
          {video.duration}
        </span>
      )}
    </div>
    <div className="p-3 flex gap-2">
      <span className="text-xs font-semibold text-muted-foreground pt-0.5 shrink-0">{index + 1}.</span>
      <h3 className="text-sm font-medium text-foreground line-clamp-2">{video.title}</h3>
    </div>
  </button>
);

/** Grid of a playlist's videos; clicking one plays it in a dialog. */
const PlaylistVideos = ({ playlist }: { playlist: Playlist }) => {
  const [playing, setPlaying] = useState<number | null>(null);
  const videos = playlist.videos;
  const current = playing !== null ? videos[playing] : null;

  if (videos.length === 0) {
    return <p className="py-12 text-center text-muted-foreground">This playlist has no videos yet.</p>;
  }

  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
        {videos.map((video, i) => (
          <VideoCard key={video.videoId} video={video} index={i} onPlay={() => setPlaying(i)} />
        ))}
      </div>

      <Dialog open={current !== null} onOpenChange={(o) => !o && setPlaying(null)}>
        <DialogContent className="max-w-4xl p-0 overflow-hidden gap-0">
          {current && playing !== null && (
            <>
              <div className="aspect-video bg-black">
                <iframe
                  key={current.videoId}
                  src={`https://www.youtube-nocookie.com/embed/${current.videoId}?autoplay=1&rel=0`}
                  title={current.title}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  className="w-full h-full"
                />
              </div>
              <div className="p-4 space-y-3">
                <div>
                  <DialogTitle className="text-base leading-snug pr-6">{current.title}</DialogTitle>
                  <DialogDescription className="mt-1">
                    {playlist.name} · {playing + 1} of {videos.length}
                  </DialogDescription>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <Button variant="outline" size="sm" disabled={playing === 0} onClick={() => setPlaying(playing - 1)}>
                    <ChevronLeft className="h-4 w-4 mr-1" /> Previous
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={playing === videos.length - 1}
                    onClick={() => setPlaying(playing + 1)}
                  >
                    Next <ChevronRight className="h-4 w-4 ml-1" />
                  </Button>
                  <Button variant="ghost" size="sm" asChild className="ml-auto">
                    <a href={videoUrl(current.videoId, playlist.id)} target="_blank" rel="noreferrer">
                      <ExternalLink className="h-4 w-4 mr-1" /> Open on YouTube
                    </a>
                  </Button>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};

export default PlaylistVideos;
