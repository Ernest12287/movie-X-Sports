import { useParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, Star, Calendar, Clock, Download, Play } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { useEffect, useRef, useState } from "react";
import "@peaseernest/videoplayer/dist/videoplayer.css";

const MovieDetails = () => {
  const { id } = useParams();
  const [selectedQuality, setSelectedQuality] = useState<any>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const playerRef = useRef<any>(null);

  const { data: movieInfo, isLoading: infoLoading } = useQuery({
    queryKey: ["movie-info", id],
    queryFn: async () => {
      const response = await fetch(
        `https://movieapi.giftedtech.co.ke/api/info/${id}`
      );
      if (!response.ok) throw new Error("Failed to fetch movie info");
      return response.json();
    },
  });

  const { data: sources, isLoading: sourcesLoading } = useQuery({
    queryKey: ["movie-sources", id],
    queryFn: async () => {
      const response = await fetch(
        `https://movieapi.giftedtech.co.ke/api/sources/${id}`
      );
      if (!response.ok) throw new Error("Failed to fetch sources");
      return response.json();
    },
  });

  // MUST be before any early returns (Rules of Hooks)
  useEffect(() => {
    if (selectedQuality && isPlaying && typeof window !== "undefined") {
      const loadPlayer = async () => {
        try {
          const videoplayer = (await import("@peaseernest/videoplayer")).default;
          
          if (playerRef.current) {
            playerRef.current.dispose();
            playerRef.current = null;
          }
          
          setTimeout(() => {
            playerRef.current = videoplayer.init({
              sourceUrl: selectedQuality.download_url,
              stream: true,
              volume: true,
              pip: true,
              buffering: 80,
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
  }, [selectedQuality, isPlaying]);

  if (infoLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Skeleton className="h-8 w-32 mb-8" />
        <div className="grid md:grid-cols-[300px_1fr] gap-8">
          <Skeleton className="h-[450px] w-full rounded-lg" />
          <div className="space-y-4">
            <Skeleton className="h-12 w-3/4" />
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-32 w-full" />
          </div>
        </div>
      </div>
    );
  }

  const movie = movieInfo?.results?.subject;
  if (!movie) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <h1 className="text-2xl font-bold mb-4">Movie not found</h1>
        <Link to="/movies">
          <Button variant="outline">Back to Movies</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <Link to="/movies">
        <Button variant="ghost" className="mb-6">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Movies
        </Button>
      </Link>

      <div className="grid md:grid-cols-[300px_1fr] gap-8">
        <div>
          <img
            src={movie.cover?.url}
            alt={movie.title}
            className="w-full rounded-lg shadow-lg border border-border/50"
          />
        </div>

        <div className="space-y-6">
          <div>
            <h1 className="text-4xl font-bold neon-text mb-2">{movie.title}</h1>
            <div className="flex flex-wrap gap-2 mb-4">
              {movie.genre?.split(",").map((g: string) => (
                <Badge key={g} variant="secondary" className="bg-neon-purple/20 text-neon-purple border-neon-purple/30">
                  {g.trim()}
                </Badge>
              ))}
            </div>
            <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
              {movie.imdbRatingValue && (
                <div className="flex items-center gap-1">
                  <Star className="h-4 w-4 fill-yellow-500 text-yellow-500" />
                  <span className="font-semibold">{movie.imdbRatingValue}</span>
                  {movie.imdbRatingCount && (
                    <span className="text-xs">({movie.imdbRatingCount.toLocaleString()} votes)</span>
                  )}
                </div>
              )}
              {movie.releaseDate && (
                <div className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  <span>{new Date(movie.releaseDate).getFullYear()}</span>
                </div>
              )}
              {movie.duration && (
                <div className="flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  <span>{Math.floor(movie.duration / 60)} min</span>
                </div>
              )}
            </div>
          </div>

          <div>
            <h2 className="text-xl font-semibold mb-2">Description</h2>
            <p className="text-muted-foreground leading-relaxed">{movie.description}</p>
          </div>

          {movie.trailer?.videoAddress?.url && (
            <div>
              <h2 className="text-xl font-semibold mb-2">Trailer</h2>
              <video
                src={movie.trailer.videoAddress.url}
                controls
                className="w-full rounded-lg border border-border/50"
                poster={movie.trailer.cover?.url}
              />
            </div>
          )}

          {movieInfo.results.stars && movieInfo.results.stars.length > 0 && (
            <div>
              <h2 className="text-xl font-semibold mb-3">Cast</h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                {movieInfo.results.stars.slice(0, 8).map((star: any) => (
                  <Card key={star.staffId} className="bg-card/50 border-border/50">
                    <CardContent className="p-3">
                      {star.avatarUrl && (
                        <img
                          src={star.avatarUrl}
                          alt={star.name}
                          className="w-full aspect-square object-cover rounded-lg mb-2"
                        />
                      )}
                      <p className="font-medium text-sm line-clamp-1">{star.name}</p>
                      <p className="text-xs text-muted-foreground line-clamp-1">{star.character}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {sources?.results && sources.results.length > 0 && (
            <div>
              <h2 className="text-xl font-semibold mb-3">Watch & Download</h2>
              
              {isPlaying && selectedQuality && (
                <Card className="bg-card/50 border-border/50 mb-4">
                  <CardContent className="p-0">
                    <div data-videoplayer="movie-player" className="w-full"></div>
                  </CardContent>
                </Card>
              )}
              
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {sources.results.map((source: any) => (
                  <div key={source.id}>
                    <Card className="bg-card/50 border-border/50 hover-glow transition-all cursor-pointer">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between mb-3">
                          <div>
                            <p className="font-semibold text-neon-pink">{source.quality}</p>
                            <p className="text-xs text-muted-foreground">
                              {(parseInt(source.size) / (1024 * 1024)).toFixed(0)} MB
                            </p>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            onClick={() => {
                              setSelectedQuality(source);
                              setIsPlaying(true);
                            }}
                            className="flex-1 bg-gradient-to-r from-neon-purple to-neon-pink"
                          >
                            <Play className="h-3 w-3 mr-1" />
                            Stream
                          </Button>
                          <a
                            href={source.download_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex-1"
                          >
                            <Button size="sm" variant="outline" className="w-full">
                              <Download className="h-3 w-3 mr-1" />
                              Download
                            </Button>
                          </a>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MovieDetails;
