import { useParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, Star, Calendar, Clock, Download, Play, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { useEffect, useRef, useState } from "react";
import Hls from "hls.js";

const MovieDetails = () => {
  const { id } = useParams();
  const [selectedQuality, setSelectedQuality] = useState<any>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const hlsRef = useRef<Hls | null>(null);

  const { data: movieInfo, isLoading: infoLoading } = useQuery({
    queryKey: ["movie-info", id],
    queryFn: async () => {
      const response = await fetch(
        `https://movieapi.giftedtech.co.ke/api/info/${id}`
      );
      if (!response.ok) throw new Error("Failed to fetch movie info");
      const data = await response.json();
      console.log("📺 Movie/Series Info:", data);
      return data;
    },
  });

  const { data: sources, isLoading: sourcesLoading } = useQuery({
    queryKey: ["movie-sources", id],
    queryFn: async () => {
      const response = await fetch(
        `https://movieapi.giftedtech.co.ke/api/sources/${id}`
      );
      if (!response.ok) throw new Error("Failed to fetch sources");
      const data = await response.json();
      console.log("🎬 Sources Data:", data);
      console.log("📦 Sources Results:", data?.results);
      return data;
    },
  });

  useEffect(() => {
    if (!selectedQuality || !isPlaying || !videoRef.current) return;

    console.log("🎬 Loading movie:", selectedQuality.quality);
    console.log("🔗 URL:", selectedQuality.download_url);

    // Destroy previous instance
    if (hlsRef.current) {
      console.log("🗑️ Destroying previous HLS");
      try {
        hlsRef.current.destroy();
      } catch (e) {
        console.error("Destroy error:", e);
      }
      hlsRef.current = null;
    }

    const video = videoRef.current;
    const url = selectedQuality.download_url;

    // Check if it's HLS or direct MP4
    if (url.includes('.m3u8')) {
      if (Hls.isSupported()) {
        console.log("✅ HLS.js supported");

        const hls = new Hls({
          enableWorker: true,
          lowLatencyMode: false,
          backBufferLength: 20, // Keep 20s buffer behind
          maxBufferLength: 30, // 30s ahead buffer
          maxMaxBufferLength: 60, // Max 60s total
          maxBufferSize: 50 * 1000 * 1000, // 50MB max for movies
          maxBufferHole: 0.5,
          manifestLoadingTimeOut: 15000,
          manifestLoadingMaxRetry: 3,
          levelLoadingTimeOut: 15000,
          levelLoadingMaxRetry: 3,
          fragLoadingTimeOut: 30000, // 30s for large movie fragments
          fragLoadingMaxRetry: 4,
          debug: false
        });

        hlsRef.current = hls;
        hls.loadSource(url);
        hls.attachMedia(video);

        hls.on(Hls.Events.MANIFEST_PARSED, () => {
          console.log("✅ Manifest parsed");
          video.play().catch(err => {
            console.error("❌ Play error:", err);
            toast.error("Click play button to start");
          });
        });

        hls.on(Hls.Events.ERROR, (event, data) => {
          console.error("❌ HLS Error:", data.type, data.details);

          if (data.fatal) {
            switch (data.type) {
              case Hls.ErrorTypes.NETWORK_ERROR:
                console.error("💥 Network error");
                toast.error("Network error. Check your connection.");
                hls.startLoad();
                break;
              case Hls.ErrorTypes.MEDIA_ERROR:
                console.error("💥 Media error");
                toast.error("Media error. Trying to recover...");
                hls.recoverMediaError();
                break;
              default:
                console.error("💥 Fatal error");
                toast.error("Playback failed. Try downloading instead.");
                hls.destroy();
                hlsRef.current = null;
                break;
            }
          }
        });

      } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
        console.log("✅ Native HLS (Safari)");
        video.src = url;
        video.play().catch(err => {
          console.error("❌ Play error:", err);
          toast.error("Click play to start");
        });
      } else {
        toast.error("HLS not supported in this browser");
      }
    } else {
      // Direct MP4 playback
      console.log("📹 Direct MP4 playback");
      video.src = url;
      video.play().catch(err => {
        console.error("❌ Play error:", err);
        toast.error("Click play to start");
      });
    }

    return () => {
      if (hlsRef.current) {
        try {
          hlsRef.current.destroy();
        } catch (e) {
          console.error("Cleanup error:", e);
        }
        hlsRef.current = null;
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

      {/* Video Player - Full Width when playing */}
      {isPlaying && selectedQuality && (
        <Card className="bg-card/50 border-border/50 mb-8">
          <CardContent className="p-0 relative">
            <Button
              size="sm"
              variant="ghost"
              className="absolute top-2 right-2 z-10 bg-black/50 hover:bg-black/70"
              onClick={() => {
                setIsPlaying(false);
                setSelectedQuality(null);
              }}
            >
              <X className="h-4 w-4" />
            </Button>
            <div className="aspect-video bg-black">
              <video
                ref={videoRef}
                className="w-full h-full"
                controls
                playsInline
              />
            </div>
            <div className="p-4 bg-background/50">
              <p className="text-sm text-muted-foreground">
                Playing: <span className="text-neon-pink font-semibold">{selectedQuality.quality}</span>
              </p>
            </div>
          </CardContent>
        </Card>
      )}

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
              
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {sources.results.map((source: any, sourceIndex: number) => (
                  <Card key={`${source.id || sourceIndex}-${source.quality}`} className="bg-card/50 border-border/50 hover-glow transition-all">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between mb-3">
                        <div>
                          <p className="font-semibold text-neon-pink">{source.quality}</p>
                          <p className="text-xs text-muted-foreground">
                            {source.size ? `${(parseInt(source.size) / (1024 * 1024)).toFixed(0)} MB` : 'N/A'}
                          </p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          onClick={() => {
                            console.log("🎬 Selected:", source.quality, source.download_url);
                            setSelectedQuality(source);
                            setIsPlaying(true);
                            toast.success(`Loading ${source.quality} quality...`);
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