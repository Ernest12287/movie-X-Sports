// src/components/SeriesCard.tsx
import { Link } from "react-router-dom";
import { Star, Calendar, Tv } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

interface SeriesCardProps {
  series: any;
}

export const SeriesCard = ({ series }: SeriesCardProps) => {
  return (
    <Link to={`/series/${series.subjectId}`}>
      <Card className="group overflow-hidden hover-glow border-border/50 bg-card/50 transition-all">
        <div className="relative aspect-[2/3] overflow-hidden">
          <img
            src={series.thumbnail || series.cover?.url}
            alt={series.title}
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-110"
            loading="lazy"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
          
          {/* Series Badge */}
          <div className="absolute top-2 right-2 bg-neon-purple px-2 py-1 rounded flex items-center gap-1 text-xs font-bold">
            <Tv className="h-3 w-3" />
            SERIES
          </div>
        </div>
        <CardContent className="p-3">
          <h3 className="font-semibold text-sm line-clamp-1 mb-1">{series.title}</h3>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            {series.imdbRatingValue && (
              <div className="flex items-center gap-1">
                <Star className="h-3 w-3 fill-yellow-500 text-yellow-500" />
                <span>{series.imdbRatingValue}</span>
              </div>
            )}
            {series.releaseDate && (
              <div className="flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                <span>{new Date(series.releaseDate).getFullYear()}</span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </Link>
  );
};