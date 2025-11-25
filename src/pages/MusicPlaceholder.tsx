import React from "react";
import { Music, Search, Download, Headphones, Disc3, Radio } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

const MusicPlaceholder = () => {
  return (
    <div className="container mx-auto px-4 py-8">
      {/* Back Button */}
      <Link to="/">
        <Button variant="ghost" className="mb-6">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Home
        </Button>
      </Link>

      <div className="min-h-[70vh] flex items-center justify-center">
        <Card className="bg-card/50 border-border/50 backdrop-blur-sm max-w-2xl w-full p-8 md:p-12">
          <div className="text-center space-y-6">
            {/* Animated Music Icon */}
            <div className="relative inline-block">
              <div className="absolute inset-0 animate-ping">
                <Music className="h-24 w-24 text-neon-cyan opacity-20" />
              </div>
              <Music className="h-24 w-24 text-neon-cyan relative z-10" />
            </div>

            {/* Title */}
            <div>
              <h1 className="text-4xl md:text-5xl font-bold neon-text mb-3">
                🎵 Music Section
              </h1>
              <p className="text-xl text-neon-cyan font-semibold">
                Coming Soon!
              </p>
            </div>

            {/* Message */}
            <div className="space-y-4 text-muted-foreground">
              <p className="text-lg leading-relaxed">
                <span className="text-neon-pink font-bold">Creator Pease Ernest</span> is 
                currently looking for a reliable API to bring you the best music experience.
              </p>
              <p className="text-base">
                Soon you'll be able to:
              </p>
            </div>

            {/* Features Grid */}
            <div className="grid md:grid-cols-2 gap-4 mt-8">
              <div className="bg-background/30 p-4 rounded-lg border border-border/30 hover:border-neon-cyan/50 transition-all">
                <Search className="h-8 w-8 text-neon-cyan mx-auto mb-2" />
                <p className="text-sm font-semibold">Search Any Song</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Find your favorite tracks instantly
                </p>
              </div>

              <div className="bg-background/30 p-4 rounded-lg border border-border/30 hover:border-neon-purple/50 transition-all">
                <Download className="h-8 w-8 text-neon-purple mx-auto mb-2" />
                <p className="text-sm font-semibold">Download Music</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Get high-quality MP3 downloads
                </p>
              </div>

              <div className="bg-background/30 p-4 rounded-lg border border-border/30 hover:border-neon-pink/50 transition-all">
                <Headphones className="h-8 w-8 text-neon-pink mx-auto mb-2" />
                <p className="text-sm font-semibold">Stream Online</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Listen before you download
                </p>
              </div>

              <div className="bg-background/30 p-4 rounded-lg border border-border/30 hover:border-neon-yellow/50 transition-all">
                <Disc3 className="h-8 w-8 text-neon-yellow mx-auto mb-2" />
                <p className="text-sm font-semibold">Browse Albums</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Explore full albums and playlists
                </p>
              </div>
            </div>

            {/* Status Badge */}
            <div className="mt-8 inline-flex items-center gap-2 px-4 py-2 bg-neon-yellow/10 border border-neon-yellow/30 rounded-full">
              <Radio className="h-4 w-4 text-neon-yellow animate-pulse" />
              <span className="text-sm font-semibold text-neon-yellow">
                Under Development
              </span>
            </div>

            {/* Footer Message */}
            <div className="mt-6 pt-6 border-t border-border/30">
              <p className="text-sm text-muted-foreground">
                Stay tuned! This feature will be available soon. 🎶
              </p>
              <p className="text-xs text-muted-foreground mt-2">
                Check back regularly for updates
              </p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default MusicPlaceholder;