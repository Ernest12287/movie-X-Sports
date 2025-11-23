import { useEffect, useState, useRef } from "react";
import { Link } from "react-router-dom";
import { Film, Tv, Loader2, Play } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";
import "@peaseernest/videoplayer/dist/videoplayer.css";

interface Channel {
  id: string;
  name: string;
  logo: string;
  url: string;
}

interface Movie {
  subjectId: string;
  title: string;
  cover: { url: string };
  releaseDate: string;
  imdbRatingValue?: string;
  genre: string;
}

const Home = () => {
  const [channels, setChannels] = useState<Channel[]>([]);
  const [selectedChannel, setSelectedChannel] = useState<Channel | null>(null);
  const [loadingChannels, setLoadingChannels] = useState(true);
  const playerRef = useRef<any>(null);

  const { data: moviesData } = useQuery({
    queryKey: ["homepage"],
    queryFn: async () => {
      const response = await fetch("https://movieapi.giftedtech.co.ke/api/homepage");
      if (!response.ok) throw new Error("Failed to fetch movies");
      return response.json();
    },
  });

  useEffect(() => {
    const fetchChannels = async () => {
      try {
        setLoadingChannels(true);
        const response = await fetch("https://iptv-org.github.io/iptv/categories/sports.m3u");
        const text = await response.text();
        
        console.log("IPTV Response received, length:", text.length);
        
        const channelList: Channel[] = [];
        const lines = text.split("\n");
        
        for (let i = 0; i < lines.length; i++) {
          if (lines[i].startsWith("#EXTINF:")) {
            const nameMatch = lines[i].match(/,(.+)$/);
            const logoMatch = lines[i].match(/tvg-logo="([^"]+)"/);
            const idMatch = lines[i].match(/tvg-id="([^"]+)"/);
            const url = lines[i + 1]?.trim();
            
            if (nameMatch && url && url.startsWith("http")) {
              channelList.push({
                id: idMatch?.[1] || `channel-${i}`,
                name: nameMatch[1].trim(),
                logo: logoMatch?.[1] || "",
                url: url,
              });
            }
          }
        }
        
        console.log("Total channels parsed:", channelList.length);
        console.log("First 3 channels:", channelList.slice(0, 3));
        
        setChannels(channelList.slice(0, 20)); // Increase to 20 channels
        if (channelList.length > 0) {
          setSelectedChannel(channelList[0]);
          console.log("Selected channel:", channelList[0]);
        } else {
          toast.error("No sports channels found");
        }
      } catch (error) {
        toast.error("Failed to load sports channels");
        console.error("IPTV fetch error:", error);
      } finally {
        setLoadingChannels(false);
      }
    };

    fetchChannels();
  }, []);

  useEffect(() => {
    if (selectedChannel && typeof window !== "undefined") {
      const loadPlayer = async () => {
        try {
          const videoplayer = (await import("@peaseernest/videoplayer")).default;
          
          if (playerRef.current) {
            playerRef.current.dispose();
            playerRef.current = null;
          }
          
          // Small delay to ensure DOM is ready
          setTimeout(() => {
            playerRef.current = videoplayer.init({
              sourceUrl: selectedChannel.url,
              stream: true,
              volume: true,
              pip: true,
              buffering: 60,
              autoplay: true,
            });
          }, 100);
        } catch (error) {
          console.error("Player error:", error);
          toast.error("Failed to load video player");
        }
      };
      
      loadPlayer();
    }
    
    return () => {
      if (playerRef.current) {
        try {
          playerRef.current.dispose();
        } catch (e) {
          console.error("Cleanup error:", e);
        }
      }
    };
  }, [selectedChannel]);

  const bannerMovies = moviesData?.results?.operatingList?.find((item: any) => item.type === "BANNER")?.banner?.items || [];
  const featuredMovies = bannerMovies.slice(0, 12);

  return (
    <div className="container mx-auto px-4 py-8 space-y-12">
      {/* Sports Section */}
      <section>
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-3xl font-bold neon-text mb-2">Live Sports</h2>
            <p className="text-muted-foreground">Watch live sports channels streaming 24/7</p>
          </div>
          <Link to="/sports" className="text-neon-purple hover:text-neon-pink transition-colors">
            View All →
          </Link>
        </div>

        {loadingChannels ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-12 w-12 animate-spin text-neon-purple" />
          </div>
        ) : channels.length === 0 ? (
          <div className="text-center py-12">
            <Tv className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
            <p className="text-muted-foreground mb-2">No sports channels available</p>
            <p className="text-sm text-muted-foreground">IPTV links may be temporarily unavailable. Please refresh.</p>
          </div>
        ) : (
          <div className="grid lg:grid-cols-[2fr_1fr] gap-6">
            <Card className="bg-card/50 border-border/50 overflow-hidden">
              {selectedChannel ? (
                <div>
                  <div className="p-4 bg-background/50 border-b border-border/50">
                    <div className="flex items-center gap-3">
                      {selectedChannel.logo && (
                        <img
                          src={selectedChannel.logo}
                          alt={selectedChannel.name}
                          className="h-8 w-8 rounded object-contain bg-white/10 p-1"
                        />
                      )}
                      <span className="font-semibold text-neon-cyan">{selectedChannel.name}</span>
                    </div>
                  </div>
                  <div data-videoplayer="home-sports" className="w-full aspect-video"></div>
                </div>
              ) : (
                <div className="aspect-video flex items-center justify-center">
                  <p className="text-muted-foreground">Select a channel to start watching</p>
                </div>
              )}
            </Card>
            
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground mb-2">Available Channels ({channels.length})</p>
              <div className="grid grid-cols-2 lg:grid-cols-1 gap-3 max-h-[500px] overflow-y-auto">
                {channels.map((channel) => (
                  <button
                    key={channel.id}
                    onClick={() => {
                      console.log("Switching to channel:", channel.name);
                      setSelectedChannel(channel);
                    }}
                    className={`p-3 rounded-lg border transition-all hover-glow text-left ${
                      selectedChannel?.id === channel.id
                        ? "bg-neon-purple/20 border-neon-purple"
                        : "bg-background/50 border-border/30 hover:border-neon-purple/50"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      {channel.logo ? (
                        <img
                          src={channel.logo}
                          alt={channel.name}
                          className="h-8 w-8 rounded object-contain bg-white/10 p-1"
                          onError={(e) => {
                            (e.target as HTMLImageElement).style.display = 'none';
                          }}
                        />
                      ) : (
                        <div className="h-8 w-8 rounded bg-neon-purple/20 flex items-center justify-center">
                          <Tv className="h-4 w-4 text-neon-purple" />
                        </div>
                      )}
                      <span className="text-sm font-medium line-clamp-2 flex-1">{channel.name}</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </section>

      {/* Movies Section */}
      <section>
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-3xl font-bold neon-text mb-2">Featured Movies</h2>
            <p className="text-muted-foreground">Stream thousands of movies in HD quality</p>
          </div>
          <Link to="/movies" className="text-neon-pink hover:text-neon-purple transition-colors">
            Browse All →
          </Link>
        </div>

        {featuredMovies.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
            {featuredMovies.map((item: any) => {
              const movie = item.subject;
              return (
                <Link key={movie.subjectId} to={`/movie/${movie.subjectId}`}>
                  <Card className="group overflow-hidden hover-glow border-border/50 bg-card/50 transition-all">
                    <div className="relative aspect-[2/3] overflow-hidden">
                      <img
                        src={movie.cover?.url}
                        alt={movie.title}
                        className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-110"
                        loading="lazy"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <Play className="h-12 w-12 text-white" />
                      </div>
                    </div>
                    <div className="p-3">
                      <h3 className="font-semibold text-sm line-clamp-1 mb-1">{movie.title}</h3>
                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <span>{new Date(movie.releaseDate).getFullYear()}</span>
                        {movie.imdbRatingValue && (
                          <span className="text-neon-cyan">⭐ {movie.imdbRatingValue}</span>
                        )}
                      </div>
                    </div>
                  </Card>
                </Link>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-12">
            <Film className="h-16 w-16 mx-auto mb-4 text-neon-pink" />
            <p className="text-muted-foreground">Loading featured movies...</p>
          </div>
        )}
      </section>
    </div>
  );
};

export default Home;
