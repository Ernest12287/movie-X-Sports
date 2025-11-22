import { Link } from "react-router-dom";
import { Star, Calendar } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

interface MovieCardProps {
  movie: any;
}

export const MovieCard = ({ movie }: MovieCardProps) => {
  return (
    <Link to={`/movie/${movie.subjectId}`}>
      <Card className="group overflow-hidden hover-glow border-border/50 bg-card/50 transition-all">
        <div className="relative aspect-[2/3] overflow-hidden">
          <img
            src={movie.thumbnail || movie.cover?.url}
            alt={movie.title}
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-110"
            loading="lazy"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
        </div>
        <CardContent className="p-3">
          <h3 className="font-semibold text-sm line-clamp-1 mb-1">{movie.title}</h3>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            {movie.imdbRatingValue && (
              <div className="flex items-center gap-1">
                <Star className="h-3 w-3 fill-yellow-500 text-yellow-500" />
                <span>{movie.imdbRatingValue}</span>
              </div>
            )}
            {movie.releaseDate && (
              <div className="flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                <span>{new Date(movie.releaseDate).getFullYear()}</span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </Link>
  );
};
