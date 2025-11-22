import { Link } from "react-router-dom";
import { Film, Tv, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

const Home = () => {
  return (
    <div className="min-h-[calc(100vh-200px)] flex items-center justify-center">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto text-center space-y-8">
          <h1 className="text-5xl md:text-7xl font-bold neon-text leading-tight">
            Welcome to<br />Ernest Palace
          </h1>
          
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Stream the latest movies and watch live sports channels from around the world. 
            Your entertainment destination awaits.
          </p>

          <div className="grid md:grid-cols-2 gap-6 mt-12">
            <Link to="/movies" className="group">
              <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-neon-pink/20 to-neon-purple/20 p-8 border border-neon-pink/30 hover-glow">
                <Film className="h-16 w-16 mb-4 text-neon-pink" />
                <h2 className="text-2xl font-bold mb-2">Movies</h2>
                <p className="text-muted-foreground mb-4">
                  Browse thousands of movies in HD quality with multiple download options
                </p>
                <Button variant="ghost" className="group-hover:translate-x-2 transition-transform">
                  Explore Movies <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </Link>

            <Link to="/sports" className="group">
              <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-neon-purple/20 to-neon-cyan/20 p-8 border border-neon-purple/30 hover-glow">
                <Tv className="h-16 w-16 mb-4 text-neon-purple" />
                <h2 className="text-2xl font-bold mb-2">Live Sports</h2>
                <p className="text-muted-foreground mb-4">
                  Watch live sports channels from around the world, streaming 24/7
                </p>
                <Button variant="ghost" className="group-hover:translate-x-2 transition-transform">
                  Watch Sports <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </Link>
          </div>

          <div className="mt-12 p-6 rounded-xl bg-card/50 border border-border/50">
            <p className="text-sm text-muted-foreground">
              <strong className="text-neon-pink">Note:</strong> We use IPTV links that may occasionally be unavailable. 
              If a stream doesn't work, try refreshing or come back later.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
