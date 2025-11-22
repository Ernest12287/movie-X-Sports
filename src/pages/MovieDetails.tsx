import { useParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, Star, Calendar, Clock, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";

const MovieDetails = () => {
  const { id } = useParams();

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
  if (!movie) return <div>Movie not found</div>;

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
              <h2 className="text-xl font-semibold mb-3">Download Links</h2>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {sources.results.map((source: any) => (
                  <a
                    key={source.id}
                    href={source.download_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block"
                  >
                    <Card className="bg-card/50 border-border/50 hover-glow transition-all cursor-pointer">
                      <CardContent className="p-4 flex items-center justify-between">
                        <div>
                          <p className="font-semibold text-neon-pink">{source.quality}</p>
                          <p className="text-xs text-muted-foreground">
                            {(parseInt(source.size) / (1024 * 1024)).toFixed(0)} MB
                          </p>
                        </div>
                        <Download className="h-5 w-5 text-neon-cyan" />
                      </CardContent>
                    </Card>
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

export default MovieDetails;
