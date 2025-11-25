import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Film, Tv, Loader2, Play } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";

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
  thumbnail: string;
  releaseDate: string;
  imdbRatingValue?: string;
  genre: string;
  subjectType: number; // 1 = movie, 2 = series
}

const Home = () => {
  const [channels, setChannels] = useState<Channel[]>([]);
  const [selectedChannel, setSelectedChannel] = useState<Channel | null>(null);
  const [loadingChannels, setLoadingChannels] = useState(true);

  // Fetch trending content
  const { data: trendingData, isLoading: trendingLoading } = useQuery({
    queryKey: ["trending"],
    queryFn: async () => {
      const response = await fetch("https://movieapi.giftedtech.co.ke/api/trending");
      if (!response.ok) throw new Error("Failed to fetch trending");
      return response.json();
    },
  });

  // Separate movies and series from trending data
  const getTrendingContent = () => {
    if (!trendingData?.results?.subjectList) return { movies: [], series: [] };

    const allItems = trendingData.results.subjectList;

    // Separate movies and series
    const movies: any[] = [];
    const series: any[] = [];

    allItems.forEach((item: any) => {
      // Item is already the subject, no need to extract
      if (item.subjectType === 1) {
        movies.push(item);
      } else if (item.subjectType === 2) {
        series.push(item);
      }
    });

    return {
      movies: movies.slice(0, 12), // Top 12 movies
      series: series.slice(0, 12)  // Top 12 series
    };
  };

  const { movies: trendingMovies, series: trendingSeries } = getTrendingContent();

  // Sports channels logic (unchanged)
  useEffect(() => {
    const fetchChannels = async () => {
      try {
        setLoadingChannels(true);
        console.log("🔍 Fetching IPTV channels...");
        
        const response = await fetch("https://iptv-org.github.io/iptv/categories/sports.m3u");
        const text = await response.text();
        
        console.log("✅ IPTV Response received, length:", text.length);
        
        const channelList: Channel[] = [];
        const lines = text.split("\n");
        
        for (let i = 0; i < lines.length; i++) {
          const line = lines[i].trim();
          
          if (line.includes("#EXTINF:")) {
            const nextLine = lines[i + 1]?.trim();
            
            const nameMatch = line.match(/,([^,]+)$/);
            const logoMatch = line.match(/tvg-logo="([^"]+)"/);
            const idMatch = line.match(/tvg-id="([^"]+)"/);
            
            if (nameMatch && nextLine && 
                !nextLine.startsWith("#") && 
                (nextLine.startsWith("http") || nextLine.startsWith("rtmp") || nextLine.startsWith("udp"))) {
              
              channelList.push({
                id: idMatch?.[1] || `channel-${channelList.length}`,
                name: nameMatch[1].trim(),
                logo: logoMatch?.[1] || "",
                url: nextLine,
              });
            }
          }
        }
        
        console.log("✅ Total channels parsed:", channelList.length);
        
        setChannels(channelList.slice(0, 20));
        if (channelList.length > 0) {
          setSelectedChannel(channelList[0]);
        } else {
          toast.error("No sports channels found");
        }
      } catch (error) {
        toast.error("Failed to load sports channels");
        console.error("❌ IPTV fetch error:", error);
      } finally {
        setLoadingChannels(false);
      }
    };

    fetchChannels();
  }, []);

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
                          onError={(e) => {
                            (e.target as HTMLImageElement).style.display = 'none';
                          }}
                        />
                      )}
                      <span className="font-semibold text-neon-cyan">{selectedChannel.name}</span>
                    </div>
                  </div>
                  <div className="aspect-video bg-black flex items-center justify-center">
                    <p className="text-gray-400">Click "View All →" to watch streams</p>
                  </div>
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
                  <Link
                    key={channel.id}
                    to="/sports"
                    className={`p-3 rounded-lg border transition-all hover-glow text-left block ${
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
                          loading="lazy"
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
                  </Link>
                ))}
              </div>
            </div>
          </div>
        )}
      </section>

      {/* Trending Movies Section */}
      <section>
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-3xl font-bold neon-text mb-2">🔥 Trending Movies</h2>
            <p className="text-muted-foreground">Hot movies everyone's watching right now</p>
          </div>
          <Link to="/movies" className="text-neon-pink hover:text-neon-purple transition-colors">
            Browse All Movies →
          </Link>
        </div>

        {trendingLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-12 w-12 animate-spin text-neon-pink" />
            <p className="ml-4 text-muted-foreground">Loading trending movies...</p>
          </div>
        ) : trendingMovies.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
            {trendingMovies.map((movie: any) => (
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
                    <div className="absolute top-2 right-2 bg-neon-pink px-2 py-1 rounded text-xs font-bold">
                      MOVIE
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
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <Film className="h-16 w-16 mx-auto mb-4 text-neon-pink" />
            <p className="text-muted-foreground">No trending movies available right now</p>
          </div>
        )}
      </section>

      {/* Trending Series Section */}
      <section>
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-3xl font-bold neon-text mb-2">🔥 Trending Series</h2>
            <p className="text-muted-foreground">Binge-worthy series everyone's talking about</p>
          </div>
          <Link to="/series" className="text-neon-purple hover:text-neon-pink transition-colors">
            Browse All Series →
          </Link>
        </div>

        {trendingLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-12 w-12 animate-spin text-neon-purple" />
            <p className="ml-4 text-muted-foreground">Loading trending series...</p>
          </div>
        ) : trendingSeries.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
            {trendingSeries.map((series: any) => (
              <Link key={series.subjectId} to={`/series/${series.subjectId}`}>
                <Card className="group overflow-hidden hover-glow border-border/50 bg-card/50 transition-all">
                  <div className="relative aspect-[2/3] overflow-hidden">
                    <img
                      src={series.cover?.url}
                      alt={series.title}
                      className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-110"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <Play className="h-12 w-12 text-white" />
                    </div>
                    <div className="absolute top-2 right-2 bg-neon-purple px-2 py-1 rounded text-xs font-bold flex items-center gap-1">
                      <Tv className="h-3 w-3" />
                      SERIES
                    </div>
                  </div>
                  <div className="p-3">
                    <h3 className="font-semibold text-sm line-clamp-1 mb-1">{series.title}</h3>
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span>{new Date(series.releaseDate).getFullYear()}</span>
                      {series.imdbRatingValue && (
                        <span className="text-neon-cyan">⭐ {series.imdbRatingValue}</span>
                      )}
                    </div>
                  </div>
                </Card>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <Tv className="h-16 w-16 mx-auto mb-4 text-neon-purple" />
            <p className="text-muted-foreground">No trending series available right now</p>
          </div>
        )}
      </section>
    </div>
  );
};

export default Home;