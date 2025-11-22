import { useEffect, useState, useRef } from "react";
import { Tv, Loader2, RefreshCw } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import "@peaseernest/videoplayer/dist/videoplayer.css";

interface Channel {
  id: string;
  name: string;
  logo: string;
  url: string;
}

const Sports = () => {
  const [channels, setChannels] = useState<Channel[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedChannel, setSelectedChannel] = useState<Channel | null>(null);
  const playerRef = useRef<any>(null);

  useEffect(() => {
    fetchChannels();
  }, []);

  const fetchChannels = async () => {
    try {
      setLoading(true);
      const response = await fetch(
        "https://iptv-org.github.io/iptv/categories/sports.m3u"
      );
      const text = await response.text();
      
      const channelList: Channel[] = [];
      const lines = text.split("\n");
      
      for (let i = 0; i < lines.length; i++) {
        if (lines[i].startsWith("#EXTINF:")) {
          const nameMatch = lines[i].match(/,(.+)$/);
          const logoMatch = lines[i].match(/tvg-logo="([^"]+)"/);
          const idMatch = lines[i].match(/tvg-id="([^"]+)"/);
          const url = lines[i + 1]?.trim();
          
          if (nameMatch && url && url.startsWith("http")) {
            channelList.push({
              id: idMatch?.[1] || `channel-${i}`,
              name: nameMatch[1].trim(),
              logo: logoMatch?.[1] || "",
              url: url,
            });
          }
        }
      }
      
      setChannels(channelList);
      if (channelList.length > 0) {
        setSelectedChannel(channelList[0]);
      }
    } catch (error) {
      toast.error("Failed to load channels");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (selectedChannel && typeof window !== "undefined") {
      const loadPlayer = async () => {
        try {
          const videoplayer = (await import("@peaseernest/videoplayer")).default;
          
          if (playerRef.current) {
            playerRef.current.dispose();
          }
          
          videoplayer.init({
            sourceUrl: selectedChannel.url,
            stream: true,
            volume: true,
            pip: true,
            buffering: 60,
            autoplay: true,
          });
        } catch (error) {
          console.error("Player error:", error);
          toast.error("Failed to load video player");
        }
      };
      
      loadPlayer();
    }
  }, [selectedChannel]);

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8 flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-neon-purple mx-auto mb-4" />
          <p className="text-muted-foreground">Loading sports channels...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold neon-text mb-2">Live Sports</h1>
          <p className="text-muted-foreground">
            Watch live sports channels from around the world
          </p>
        </div>
        <Button
          onClick={fetchChannels}
          variant="outline"
          className="border-neon-purple/30 hover:bg-neon-purple/10"
        >
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>

      <div className="grid lg:grid-cols-[1fr_300px] gap-6">
        <div>
          {selectedChannel ? (
            <Card className="bg-card/50 border-border/50">
              <CardHeader>
                <CardTitle className="flex items-center gap-3">
                  {selectedChannel.logo && (
                    <img
                      src={selectedChannel.logo}
                      alt={selectedChannel.name}
                      className="h-8 w-8 rounded object-contain bg-white/10 p-1"
                    />
                  )}
                  <span className="neon-text">{selectedChannel.name}</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div data-videoplayer="sports-player" className="rounded-lg overflow-hidden"></div>
              </CardContent>
            </Card>
          ) : (
            <div className="text-center py-12">
              <Tv className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <p className="text-muted-foreground">Select a channel to start watching</p>
            </div>
          )}
        </div>

        <div>
          <Card className="bg-card/50 border-border/50 sticky top-24">
            <CardHeader>
              <CardTitle className="text-lg">Channels ({channels.length})</CardTitle>
            </CardHeader>
            <CardContent className="max-h-[600px] overflow-y-auto space-y-2">
              {channels.map((channel) => (
                <button
                  key={channel.id}
                  onClick={() => setSelectedChannel(channel)}
                  className={`w-full text-left p-3 rounded-lg border transition-all hover-glow ${
                    selectedChannel?.id === channel.id
                      ? "bg-neon-purple/20 border-neon-purple"
                      : "bg-background/50 border-border/30 hover:border-neon-purple/50"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    {channel.logo && (
                      <img
                        src={channel.logo}
                        alt={channel.name}
                        className="h-8 w-8 rounded object-contain bg-white/10 p-1"
                        loading="lazy"
                      />
                    )}
                    <span className="text-sm font-medium line-clamp-2">
                      {channel.name}
                    </span>
                  </div>
                </button>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Sports;
