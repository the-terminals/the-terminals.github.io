export type PlaylistVideo = { videoId: string; title: string; duration?: string };

/** One YouTube playlist, as stored in src/data/playlists.json. `id` is the YouTube playlist id. */
export type Playlist = {
  id: string;
  name: string;
  url: string;
  videos: PlaylistVideo[];
  updatedAt: string;
};

export const videoThumbnail = (videoId: string) => `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`;
export const videoUrl = (videoId: string, playlistId?: string) =>
  `https://www.youtube.com/watch?v=${videoId}${playlistId ? `&list=${playlistId}` : ""}`;
export const playlistUrl = (playlistId: string) => `https://www.youtube.com/playlist?list=${playlistId}`;
