// src/pages/SeriesDetails.tsx
import { useState, useEffect, useRef } from "react";
import { useParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, Play, Download, Star, Tv, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import Hls from "hls.js";

const SeriesDetails = () => {
  const { id } = useParams();
  const [selectedSeason, setSelectedSeason] = useState(1);
  const [selectedEpisode, setSelectedEpisode] = useState(1);
  const [isPlaying, setIsPlaying] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const hlsRef = useRef<Hls | null>(null);

  // Fetch series info
  const { data: seriesInfo, isLoading: infoLoading } = useQuery({
    queryKey: ["series-info", id],
    queryFn: async () => {
      const res = await fetch(`https://movieapi.giftedtech.co.ke/api/info/${id}`);
      if (!res.ok) throw new Error("Failed to fetch series info");
      const data = await res.json();
      console.log("📺 Series Info Response:", data);
      console.log("🎬 Subject:", data?.results?.subject);
      console.log("📦 Resource:", data?.results?.resource);
      return data;
    },
  });

  // Fetch episode sources (with season/episode params)
  const { data: episodeSources, isLoading: sourcesLoading } = useQuery({
    queryKey: ["episode-sources", id, selectedSeason, selectedEpisode],
    queryFn: async () => {
      const res = await fetch(
        `https://movieapi.giftedtech.co.ke/api/sources/${id}?season=${selectedSeason}&episode=${selectedEpisode}`
      );
      if (!res.ok) throw new Error("Failed to fetch episode sources");
      const data = await res.json();
      console.log(`📺 Episode S${selectedSeason}E${selectedEpisode} Sources:`, data);
      return data;
    },
    enabled: !!selectedSeason && !!selectedEpisode,
  });

  // Video player setup with HLS
  useEffect(() => {
    if (!isPlaying || !episodeSources?.results?.[0] || !videoRef.current) return;
    
    const video = videoRef.current;
    const url = episodeSources.results[0].download_url;
    
    console.log("🎬 Loading episode:", url);

    // Destroy previous HLS instance
    if (hlsRef.current) {
      try {
        hlsRef.current.destroy();
      } catch (e) {
        console.error("HLS destroy error:", e);
      }
      hlsRef.current = null;
    }
    
    // HLS setup
    if (url.includes('.m3u8')) {
      if (Hls.isSupported()) {
        const hls = new Hls({
          enableWorker: true,
          lowLatencyMode: false,
          backBufferLength: 20,
          maxBufferLength: 30,
          maxMaxBufferLength: 60,
          maxBufferSize: 50 * 1000 * 1000,
        });

        hlsRef.current = hls;
        hls.loadSource(url);
        hls.attachMedia(video);

        hls.on(Hls.Events.MANIFEST_PARSED, () => {
          console.log("✅ Episode manifest parsed");
          video.play().catch(err => {
            console.error("Play error:", err);
            toast.error("Click play button to start");
          });
        });

        hls.on(Hls.Events.ERROR, (event, data) => {
          if (data.fatal) {
            console.error("❌ HLS Fatal Error:", data);
            toast.error("Playback error. Try another episode or quality.");
          }
        });
      } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = url;
        video.play().catch(err => {
          console.error("Native HLS play error:", err);
        });
      }
    } else {
      // Direct MP4
      video.src = url;
      video.play().catch(err => {
        console.error("Direct play error:", err);
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
  }, [isPlaying, episodeSources]);

  // Extract series data
  const series = seriesInfo?.results?.subject;
  const resource = seriesInfo?.results?.resource;

  // CRITICAL FIX: Get seasons from RESOURCE, not subject
  const getSeasons = () => {
    // Priority 1: Check resource.seasons (this is where season data usually is)
    if (resource?.seasons && Array.isArray(resource.seasons) && resource.seasons.length > 0) {
      console.log("✅ Found seasons in resource:", resource.seasons);
      return resource.seasons.map((s: any) => ({
        se: s.se || s.number,
        maxEp: s.maxEp || s.episodes || 10,
      }));
    }

    // Priority 2: Check subject.seasons (backup)
    if (series?.seasons && Array.isArray(series.seasons) && series.seasons.length > 0) {
      console.log("✅ Found seasons in subject:", series.seasons);
      return series.seasons.map((s: any) => ({
        se: s.se || s.number,
        maxEp: s.maxEp || s.episodes || 10,
      }));
    }

    // Priority 3: Parse from title (e.g., "Stranger Things S1-S4")
    if (series?.title) {
      const titleMatch = series.title.match(/S(\d+)-S(\d+)/i);
      if (titleMatch) {
        const startSeason = parseInt(titleMatch[1]);
        const endSeason = parseInt(titleMatch[2]);
        console.log(`✅ Parsed ${endSeason - startSeason + 1} seasons from title:`, series.title);
        
        const parsedSeasons = [];
        for (let i = startSeason; i <= endSeason; i++) {
          parsedSeasons.push({ se: i, maxEp: 10 }); // Default 10 episodes
        }
        return parsedSeasons;
      }
    }

    // Default fallback: 1 season with 10 episodes
    console.warn("⚠️ No season data found, using default");
    return [{ se: 1, maxEp: 10 }];
  };

  const seasons = getSeasons();
  
  const currentSeasonData = seasons.find(s => s.se === selectedSeason);
  const episodes = Array.from({ length: currentSeasonData?.maxEp || 10 }, (_, i) => i + 1);

  if (infoLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Skeleton className="h-8 w-32 mb-8" />
        <div className="grid md:grid-cols-[300px_1fr] gap-8">
          <Skeleton className="h-[450px] w-full rounded-lg" />
          <div className="space-y-4">
            <Skeleton className="h-12 w-3/4" />
            <Skeleton className="h-20 w-full" />
          </div>
        </div>
      </div>
    );
  }

  if (!series) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <h1 className="text-2xl font-bold mb-4">Series not found</h1>
        <Link to="/series">
          <Button variant="outline">Back to Series</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <Link to="/series">
        <Button variant="ghost" className="mb-6">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Series
        </Button>
      </Link>

      {/* Video Player */}
      {isPlaying && episodeSources?.results?.[0] && (
        <Card className="bg-card/50 border-border/50 mb-8">
          <CardContent className="p-0 relative">
            <Button
              size="sm"
              variant="ghost"
              className="absolute top-2 right-2 z-10 bg-black/50 hover:bg-black/70"
              onClick={() => {
                setIsPlaying(false);
              }}
            >
              <X className="h-4 w-4" />
            </Button>
            <div className="aspect-video bg-black">
              <video
                ref={videoRef}
                controls
                playsInline
                className="w-full h-full"
              />
            </div>
            <CardContent className="p-4 bg-background/50">
              <p className="text-sm text-muted-foreground">
                Playing: <span className="text-neon-purple font-semibold">
                  {series.title} - Season {selectedSeason} Episode {selectedEpisode}
                </span>
              </p>
            </CardContent>
          </CardContent>
        </Card>
      )}

      <div className="grid md:grid-cols-[300px_1fr] gap-8">
        <div>
          <img
            src={series.cover?.url}
            alt={series.title}
            className="w-full rounded-lg shadow-lg border border-border/50"
          />
        </div>
        
        <div className="space-y-6">
          <div>
            <h1 className="text-4xl font-bold neon-text mb-2">{series.title}</h1>
            <div className="flex flex-wrap gap-2 mb-4">
              {series.imdbRatingValue && (
                <Badge className="bg-yellow-500/20 text-yellow-500 border-yellow-500/30">
                  <Star className="h-3 w-3 mr-1 fill-yellow-500" />
                  {series.imdbRatingValue}
                </Badge>
              )}
              <Badge className="bg-neon-purple/20 text-neon-purple border-neon-purple/30">
                <Tv className="h-3 w-3 mr-1" />
                {seasons.length} Season{seasons.length !== 1 ? 's' : ''}
              </Badge>
            </div>
            {series.genre && (
              <div className="flex flex-wrap gap-2 mb-4">
                {series.genre.split(',').map((g: string) => (
                  <Badge key={g.trim()} variant="secondary">
                    {g.trim()}
                  </Badge>
                ))}
              </div>
            )}
          </div>

          {series.description && (
            <div>
              <h2 className="text-xl font-semibold mb-2">Description</h2>
              <p className="text-muted-foreground leading-relaxed">{series.description}</p>
            </div>
          )}

          {/* Season Selector */}
          <div>
            <h3 className="text-xl font-semibold mb-3">Select Season</h3>
            <div className="flex gap-2 flex-wrap">
              {seasons.map(season => (
                <Button
                  key={season.se}
                  variant={selectedSeason === season.se ? "default" : "outline"}
                  onClick={() => {
                    setSelectedSeason(season.se);
                    setSelectedEpisode(1);
                    setIsPlaying(false);
                  }}
                  className={selectedSeason === season.se ? "bg-neon-purple" : ""}
                >
                  Season {season.se}
                </Button>
              ))}
            </div>
          </div>

          {/* Episode Selector */}
          <div>
            <h3 className="text-xl font-semibold mb-3">
              Select Episode (Season {selectedSeason})
            </h3>
            <div className="grid grid-cols-5 gap-2">
              {episodes.map(ep => (
                <Button
                  key={ep}
                  variant={selectedEpisode === ep ? "default" : "outline"}
                  onClick={() => {
                    setSelectedEpisode(ep);
                    setIsPlaying(false);
                  }}
                  size="sm"
                  className={selectedEpisode === ep ? "bg-neon-cyan text-black" : ""}
                >
                  Ep {ep}
                </Button>
              ))}
            </div>
          </div>

          {/* Watch/Download Options */}
          {episodeSources?.results && episodeSources.results.length > 0 ? (
            <div>
              <h3 className="text-xl font-semibold mb-3">
                Watch S{selectedSeason}E{selectedEpisode}
              </h3>
              <div className="space-y-2">
                <Button
                  onClick={() => setIsPlaying(true)}
                  className="w-full bg-gradient-to-r from-neon-purple to-neon-pink"
                >
                  <Play className="mr-2 h-4 w-4" />
                  Stream Now
                </Button>
                
                {episodeSources.results.map((source: any, i: number) => (
                  <a key={i} href={source.download_url} target="_blank" rel="noopener noreferrer">
                    <Button variant="outline" className="w-full">
                      <Download className="mr-2 h-4 w-4" />
                      Download {source.quality}
                      {source.size && ` (${(parseInt(source.size) / (1024 * 1024)).toFixed(0)} MB)`}
                    </Button>
                  </a>
                ))}
              </div>
            </div>
          ) : sourcesLoading ? (
            <div className="text-center py-8">
              <div className="spinner mx-auto mb-4"></div>
              <p className="text-muted-foreground">Loading episode sources...</p>
            </div>
          ) : (
            <div className="text-center py-8 bg-card/30 rounded-lg border border-border/50">
              <p className="text-muted-foreground">
                No sources available for S{selectedSeason}E{selectedEpisode}
              </p>
              <p className="text-sm text-muted-foreground mt-2">
                Try selecting a different episode
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SeriesDetails;