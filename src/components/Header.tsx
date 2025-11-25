import { Link } from "react-router-dom";
import { Film, Tv, AlertCircle, Music } from "lucide-react"; // Add Music icon
import logo from "@/assets/logo.jpeg";
import { Alert, AlertDescription } from "@/components/ui/alert";

export const Header = () => {
  return (
    <header className="sticky top-0 z-50 border-b border-border/50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
      <Alert className="rounded-none border-x-0 border-t-0 border-neon-pink/30 bg-card/50">
        <AlertCircle className="h-4 w-4 text-neon-pink" />
        <AlertDescription className="text-xs">
          We use IPTV links that may crash anytime. Just refresh the website and hope it works!
        </AlertDescription>
      </Alert>
      
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          <Link to="/" className="flex items-center gap-3 group">
            <img 
              src={logo} 
              alt="Ernest Palace" 
              className="h-10 w-10 rounded-lg object-cover ring-2 ring-neon-pink/50 group-hover:ring-neon-pink transition-all"
            />
            <div>
              <h1 className="text-xl font-bold neon-text">ERNEST PALACE</h1>
              <p className="text-xs text-muted-foreground">by Ernest Tech House</p>
            </div>
          </Link>

          <nav className="flex items-center gap-6">
            <Link 
              to="/movies" 
              className="flex items-center gap-2 text-sm font-medium transition-colors hover:text-neon-pink"
            >
              <Film className="h-4 w-4" />
              Movies
            </Link>
            <Link 
              to="/series" 
              className="flex items-center gap-2 text-sm font-medium transition-colors hover:text-neon-purple"
            >
              <Tv className="h-4 w-4" />
              Series
            </Link>
            <Link 
              to="/sports" 
              className="flex items-center gap-2 text-sm font-medium transition-colors hover:text-neon-cyan"
            >
              <Tv className="h-4 w-4" />
              Sports
            </Link>
            {/* NEW MUSIC LINK */}
            <Link 
              to="/music" 
              className="flex items-center gap-2 text-sm font-medium transition-colors hover:text-neon-yellow"
            >
              <Music className="h-4 w-4" />
              Music
            </Link>
            <a
              href="https://t.me/ernesttechhouse"
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-lg bg-gradient-to-r from-neon-pink to-neon-purple px-4 py-2 text-sm font-medium text-white transition-all hover:shadow-lg hover:shadow-neon-pink/50"
            >
              Join Telegram
            </a>
          </nav>
        </div>
      </div>
    </header>
  );
};