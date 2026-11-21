import { useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { ExternalLink, ListVideo } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import PlaylistVideos from "@/components/playlists/PlaylistVideos";
import { playlistUrl, type Playlist } from "@/components/playlists/playlist";
import playlistsData from "@/data/playlists.json";

const playlists = playlistsData as Playlist[];

const Playlists = () => {
  const [params, setParams] = useSearchParams();
  const selected = playlists.find((p) => p.id === params.get("list")) ?? playlists[0];

  useEffect(() => {
    document.title = "Playlists · The Terminals";
  }, []);

  const select = (id: string) => setParams({ list: id }, { replace: true });

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="pt-24 pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-8">
            <h1 className="text-3xl md:text-4xl font-display font-bold text-foreground">
              Video <span className="text-primary">Playlists</span>
            </h1>
            <p className="text-lg text-muted-foreground mt-2">
              Lectures and courses from our YouTube playlists
            </p>
          </div>

          {playlists.length === 0 ? (
            <div className="rounded-xl border border-dashed border-border py-16 text-center text-muted-foreground">
              <ListVideo className="h-8 w-8 mx-auto mb-3" />
              No playlists yet.
            </div>
          ) : (
            <>
              {/* Playlist picker */}
              <div className="flex gap-2 overflow-x-auto pb-2 mb-8 -mx-1 px-1" role="tablist">
                {playlists.map((p) => {
                  const active = p.id === selected?.id;
                  return (
                    <button
                      key={p.id}
                      type="button"
                      role="tab"
                      aria-selected={active}
                      onClick={() => select(p.id)}
                      className={`shrink-0 rounded-full border px-4 py-2 text-sm font-medium transition-colors ${
                        active
                          ? "border-primary bg-primary text-primary-foreground"
                          : "border-border bg-background text-foreground hover:bg-muted"
                      }`}
                    >
                      {p.name}
                      <span className={`ml-2 text-xs ${active ? "opacity-80" : "text-muted-foreground"}`}>
                        {p.videos.length}
                      </span>
                    </button>
                  );
                })}
              </div>

              {selected && (
                <section>
                  <div className="flex flex-wrap items-end justify-between gap-3 mb-5">
                    <div>
                      <h2 className="text-2xl font-display font-bold text-foreground">{selected.name}</h2>
                      <p className="text-sm text-muted-foreground">{selected.videos.length} videos</p>
                    </div>
                    <Button variant="outline" size="sm" asChild>
                      <a href={playlistUrl(selected.id)} target="_blank" rel="noreferrer">
                        <ExternalLink className="h-4 w-4 mr-2" /> Open on YouTube
                      </a>
                    </Button>
                  </div>
                  <PlaylistVideos key={selected.id} playlist={selected} />
                </section>
              )}
            </>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Playlists;
