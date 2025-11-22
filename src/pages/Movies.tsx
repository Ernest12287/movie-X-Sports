import { useState } from "react";
import { Search, Film } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { MovieCard } from "@/components/MovieCard";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";

const Movies = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeSearch, setActiveSearch] = useState("");

  const { data, isLoading, error } = useQuery({
    queryKey: ["movies", activeSearch],
    queryFn: async () => {
      if (!activeSearch) return null;
      const response = await fetch(
        `https://movieapi.giftedtech.co.ke/api/search/${encodeURIComponent(activeSearch)}`
      );
      if (!response.ok) throw new Error("Failed to fetch movies");
      return response.json();
    },
    enabled: !!activeSearch,
  });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) {
      toast.error("Please enter a search term");
      return;
    }
    setActiveSearch(searchQuery);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold neon-text mb-2">Movies</h1>
        <p className="text-muted-foreground">Search and stream thousands of movies</p>
      </div>

      <form onSubmit={handleSearch} className="mb-8">
        <div className="flex gap-2 max-w-2xl">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search movies (e.g., Black Panther, Avengers...)"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-input border-border/50 focus:border-neon-pink"
            />
          </div>
          <Button type="submit" className="bg-gradient-to-r from-neon-pink to-neon-purple">
            Search
          </Button>
        </div>
      </form>

      {isLoading && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {Array.from({ length: 10 }).map((_, i) => (
            <div key={i} className="space-y-2">
              <Skeleton className="h-72 w-full rounded-lg" />
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-3 w-1/2" />
            </div>
          ))}
        </div>
      )}

      {error && (
        <div className="text-center py-12">
          <Film className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
          <p className="text-muted-foreground">Failed to load movies. Please try again.</p>
        </div>
      )}

      {!activeSearch && !isLoading && (
        <div className="text-center py-12">
          <Film className="h-16 w-16 mx-auto mb-4 text-neon-pink" />
          <h3 className="text-xl font-semibold mb-2">Search for Movies</h3>
          <p className="text-muted-foreground">
            Enter a movie title above to start browsing
          </p>
        </div>
      )}

      {data?.results?.items && data.results.items.length > 0 && (
        <div>
          <p className="text-sm text-muted-foreground mb-4">
            Found {data.results.pager.totalCount} results
          </p>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {data.results.items.map((movie: any) => (
              <MovieCard key={movie.subjectId} movie={movie} />
            ))}
          </div>
        </div>
      )}

      {data?.results?.items && data.results.items.length === 0 && (
        <div className="text-center py-12">
          <Film className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
          <p className="text-muted-foreground">No movies found. Try a different search.</p>
        </div>
      )}
    </div>
  );
};

export default Movies;
