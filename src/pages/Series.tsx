// src/pages/Series.tsx
import { useState } from "react";
import { Link } from "react-router-dom";
import { Search, Tv, ArrowLeft } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { SeriesCard } from "@/components/SeriesCard";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";

const Series = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeSearch, setActiveSearch] = useState("");

  const { data, isLoading } = useQuery({
    queryKey: ["series", activeSearch],
    queryFn: async () => {
      if (!activeSearch) return null;
      const response = await fetch(
        `https://movieapi.giftedtech.co.ke/api/search/${encodeURIComponent(activeSearch)}`
      );
      if (!response.ok) throw new Error("Failed to fetch series");
      const result = await response.json();
      
      // Filter to only series (subjectType: 2)
      if (result?.results?.items) {
        const seriesItems = result.results.items.filter(
          (item: any) => item.subjectType === 2
        );
        
        // Group by base title (remove S1, S2, etc.)
        const grouped = new Map();
        
        seriesItems.forEach((item: any) => {
          const baseTitle = item.title.replace(/\s+S\d+$/i, '').trim();
          
          if (!grouped.has(baseTitle)) {
            grouped.set(baseTitle, {
              baseTitle,
              mainItem: item,
              seasons: []
            });
          }
          
          grouped.get(baseTitle).seasons.push(item);
        });
        
        // Sort seasons
        grouped.forEach((group) => {
          group.seasons.sort((a: any, b: any) => {
            const aNum = a.title.match(/S(\d+)/i)?.[1];
            const bNum = b.title.match(/S(\d+)/i)?.[1];
            return (parseInt(aNum || '0') - parseInt(bNum || '0'));
          });
        });
        
        result.results.groupedSeries = Array.from(grouped.values());
      }
      
      return result;
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
      <Link to="/">
        <Button variant="ghost" className="mb-4">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Home
        </Button>
      </Link>
      
      <div className="mb-8">
        <h1 className="text-4xl font-bold neon-text mb-2">TV Series</h1>
        <p className="text-muted-foreground">Browse series by season</p>
      </div>

      <form onSubmit={handleSearch} className="mb-8">
        <div className="flex gap-2 max-w-2xl">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search series..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <Button type="submit">Search</Button>
        </div>
      </form>

      {!activeSearch && (
        <div className="text-center py-12">
          <Tv className="h-16 w-16 mx-auto mb-4 text-neon-purple" />
          <p className="text-muted-foreground">Search for a series</p>
        </div>
      )}

      {isLoading && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <Skeleton key={i} className="h-72" />
          ))}
        </div>
      )}

      {data?.results?.groupedSeries && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {data.results.groupedSeries.map((group: any) => (
            <SeriesCard key={group.mainItem.subjectId} series={group.mainItem} />
          ))}
        </div>
      )}
    </div>
  );
};

export default Series;