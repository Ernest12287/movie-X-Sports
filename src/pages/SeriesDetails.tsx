// src/pages/SeriesDetails.tsx
import { useState, useEffect, useRef } from "react";
import { useParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, Play, Download, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Hls from "hls.js";

const SeriesDetails = () => {
  const { id } = useParams();
  const [selectedSeason, setSelectedSeason] = useState(1);
  const [selectedEpisode, setSelectedEpisode] = useState(1);
  const [isPlaying, setIsPlaying] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  // Fetch series info
  const { data: seriesInfo } = useQuery({
    queryKey: ["series-info", id],
    queryFn: async () => {
      const res = await fetch(`https://movieapi.giftedtech.co.ke/api/info/${id}`);
      return res.json();
    },
  });

  // Fetch episode sources (with season/episode params)
  const { data: episodeSources } = useQuery({
    queryKey: ["episode-sources", id, selectedSeason, selectedEpisode],
    queryFn: async () => {
      const res = await fetch(
        `https://movieapi.giftedtech.co.ke/api/sources/${id}?season=${selectedSeason}&episode=${selectedEpisode}`
      );
      return res.json();
    },
    enabled: !!selectedSeason && !!selectedEpisode,
  });

  // Video player setup
  useEffect(() => {
    if (!isPlaying || !episodeSources?.results?.[0]) return;
    
    const video = videoRef.current;
    const url = episodeSources.results[0].download_url;
    
    // HLS setup (same as your movies)
    if (url.includes('.m3u8') && Hls.isSupported()) {
      const hls = new Hls();
      hls.loadSource(url);
      hls.attachMedia(video);
    } else {
      video.src = url;
    }
  }, [isPlaying, episodeSources]);

  const series = seriesInfo?.results?.subject;
  const seasons = series?.seasons || [{ se: 1, maxEp: 10 }];
  
  const currentSeasonData = seasons.find(s => s.se === selectedSeason);
  const episodes = Array.from({ length: currentSeasonData?.maxEp || 10 }, (_, i) => i + 1);

  return (
    <div className="container mx-auto px-4 py-8">
      <Link to="/series">
        <Button variant="ghost" className="mb-6">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Series
        </Button>
      </Link>

      {/* Video Player */}
      {isPlaying && (
        <Card className="mb-8">
          <video ref={videoRef} controls className="w-full aspect-video" />
          <CardContent className="p-4">
            <p>Playing: S{selectedSeason}E{selectedEpisode}</p>
          </CardContent>
        </Card>
      )}

      <div className="grid md:grid-cols-[300px_1fr] gap-8">
        <img src={series?.cover?.url} className="w-full rounded-lg" />
        
        <div className="space-y-6">
          <div>
            <h1 className="text-4xl font-bold neon-text">{series?.title}</h1>
            <div className="flex gap-2 mt-2">
              {series?.imdbRatingValue && (
                <Badge><Star className="h-3 w-3 mr-1" />{series.imdbRatingValue}</Badge>
              )}
              <Badge>{seasons.length} Seasons</Badge>
            </div>
          </div>

          {/* Season Selector */}
          <div>
            <h3 className="text-xl font-semibold mb-2">Select Season</h3>
            <div className="flex gap-2 flex-wrap">
              {seasons.map(season => (
                <Button
                  key={season.se}
                  variant={selectedSeason === season.se ? "default" : "outline"}
                  onClick={() => {
                    setSelectedSeason(season.se);
                    setSelectedEpisode(1);
                  }}
                >
                  Season {season.se}
                </Button>
              ))}
            </div>
          </div>

          {/* Episode Selector */}
          <div>
            <h3 className="text-xl font-semibold mb-2">Select Episode</h3>
            <div className="grid grid-cols-5 gap-2">
              {episodes.map(ep => (
                <Button
                  key={ep}
                  variant={selectedEpisode === ep ? "default" : "outline"}
                  onClick={() => setSelectedEpisode(ep)}
                  size="sm"
                >
                  Ep {ep}
                </Button>
              ))}
            </div>
          </div>

          {/* Watch/Download Options */}
          {episodeSources?.results && (
            <div>
              <h3 className="text-xl font-semibold mb-2">
                Watch S{selectedSeason}E{selectedEpisode}
              </h3>
              <div className="space-y-2">
                <Button
                  onClick={() => setIsPlaying(true)}
                  className="w-full"
                >
                  <Play className="mr-2 h-4 w-4" />
                  Stream Now
                </Button>
                
                {episodeSources.results.map((source: any, i: number) => (
                  <a key={i} href={source.download_url} target="_blank">
                    <Button variant="outline" className="w-full">
                      <Download className="mr-2 h-4 w-4" />
                      Download {source.quality}
                    </Button>
                  </a>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SeriesDetails;