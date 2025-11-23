import { useEffect, useState, useRef } from "react";
import { Tv, Loader2, RefreshCw, AlertCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Hls from "hls.js";

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
  const [error, setError] = useState<string>("");
  const videoRef = useRef<HTMLVideoElement>(null);
  const hlsRef = useRef<Hls | null>(null);

  useEffect(() => {
    fetchChannels();
    
    return () => {
      if (hlsRef.current) {
        hlsRef.current.destroy();
      }
    };
  }, []);

  const fetchChannels = async () => {
    try {
      setLoading(true);
      setError("");
      console.log("🔍 Fetching IPTV channels...");
      
      const response = await fetch(
        "https://iptv-org.github.io/iptv/categories/sports.m3u"
      );
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
      
      const text = await response.text();
      
      console.log("✅ Response received, length:", text.length);
      console.log("📄 First 500 chars:", text.substring(0, 500));
      
      // Parse M3U
      const channelList: Channel[] = [];
      const lines = text.split("\n");
      
      console.log("📊 Total lines:", lines.length);
      console.log("🔎 First 10 lines:", lines.slice(0, 10));
      
      for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim();
        
        if (line.includes("#EXTINF:")) {
          const nextLine = lines[i + 1]?.trim();
          
          // Extract channel name (everything after the last comma)
          const nameMatch = line.match(/,([^,]+)$/);
          
          // Extract logo
          const logoMatch = line.match(/tvg-logo="([^"]+)"/);
          
          // Extract ID  
          const idMatch = line.match(/tvg-id="([^"]+)"/);
          
          // Check if next line is a URL
          if (nameMatch && nextLine && 
              !nextLine.startsWith("#") && 
              (nextLine.startsWith("http") || nextLine.startsWith("rtmp") || nextLine.startsWith("udp"))) {
            
            const channel = {
              id: idMatch?.[1] || `channel-${channelList.length}`,
              name: nameMatch[1].trim(),
              logo: logoMatch?.[1] || "",
              url: nextLine,
            };
            
            channelList.push(channel);
            
            // Log first 3 channels
            if (channelList.length <= 3) {
              console.log(`✨ Channel ${channelList.length}:`, channel.name, channel.url.substring(0, 50));
            }
          }
        }
      }
      
      console.log("✅ Total channels parsed:", channelList.length);
      
      if (channelList.length === 0) {
        setError("No channels found. Check console logs.");
        console.log("⚠️ Full response (first 1000 chars):", text.substring(0, 1000));
      } else {
        setChannels(channelList);
        setSelectedChannel(channelList[0]);
      }
      
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : "Unknown error";
      console.error("❌ Fetch error:", error);
      setError(`Failed to load channels: ${errorMsg}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!selectedChannel || !videoRef.current) return;
    
    console.log("🎬 Loading channel:", selectedChannel.name);
    console.log("🔗 URL:", selectedChannel.url);
    
    // Destroy previous HLS instance
    if (hlsRef.current) {
      console.log("🗑️ Destroying previous HLS instance");
      try {
        hlsRef.current.destroy();
      } catch (e) {
        console.error("Error destroying HLS:", e);
      }
      hlsRef.current = null;
    }
    
    const video = videoRef.current;
    let errorCount = 0;
    const MAX_ERRORS = 3; // Stop after 3 errors
    
    // Check if it's an HLS stream
    if (selectedChannel.url.includes('.m3u8')) {
      if (Hls.isSupported()) {
        console.log("✅ HLS.js is supported");
        
        const hls = new Hls({
          enableWorker: true,
          lowLatencyMode: false, // Disable low latency to reduce buffer issues
          backBufferLength: 30, // Reduce buffer from 90 to 30
          maxBufferLength: 30, // Maximum buffer length
          maxMaxBufferLength: 60, // Absolute max buffer
          maxBufferSize: 30 * 1000 * 1000, // 30MB max buffer size
          maxBufferHole: 0.5, // Fill buffer holes faster
          highBufferWatchdogPeriod: 2, // Check buffer health every 2s
          nudgeMaxRetry: 3, // Retry nudging only 3 times
          manifestLoadingTimeOut: 10000, // 10s timeout for manifest
          manifestLoadingMaxRetry: 2, // Only retry manifest 2 times
          levelLoadingTimeOut: 10000, // 10s timeout for level loading
          levelLoadingMaxRetry: 2, // Only retry level 2 times
          fragLoadingTimeOut: 20000, // 20s timeout for fragments
          fragLoadingMaxRetry: 3, // Only retry fragments 3 times
          debug: false
        });
        
        hlsRef.current = hls;
        
        hls.loadSource(selectedChannel.url);
        hls.attachMedia(video);
        
        hls.on(Hls.Events.MANIFEST_PARSED, () => {
          console.log("✅ Manifest parsed successfully");
          setError(""); // Clear errors on success
          video.play().catch(err => {
            console.error("❌ Play error:", err);
            setError("Autoplay blocked. Click the play button.");
          });
        });
        
        hls.on(Hls.Events.ERROR, (event, data) => {
          errorCount++;
          console.error(`❌ HLS Error (${errorCount}/${MAX_ERRORS}):`, data.type, data.details);
          
          // Stop after max errors to prevent infinite loops
          if (errorCount >= MAX_ERRORS) {
            console.error("💥 Max errors reached, stopping stream");
            setError("Stream unavailable. This channel may be offline or geo-blocked. Try another channel.");
            hls.destroy();
            hlsRef.current = null;
            return;
          }
          
          if (data.fatal) {
            switch (data.type) {
              case Hls.ErrorTypes.NETWORK_ERROR:
                console.error("💥 Fatal network error - attempting recovery");
                setError("Network error. Retrying...");
                setTimeout(() => {
                  if (hlsRef.current) {
                    hls.startLoad();
                  }
                }, 1000);
                break;
              case Hls.ErrorTypes.MEDIA_ERROR:
                console.error("💥 Fatal media error - attempting recovery");
                setError("Media error. Retrying...");
                setTimeout(() => {
                  if (hlsRef.current) {
                    hls.recoverMediaError();
                  }
                }, 1000);
                break;
              default:
                console.error("💥 Fatal error - stream failed");
                setError("Stream failed. Try another channel.");
                hls.destroy();
                hlsRef.current = null;
                break;
            }
          }
        });
        
      } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
        console.log("✅ Native HLS support (Safari)");
        video.src = selectedChannel.url;
        video.play().catch(err => {
          console.error("❌ Native play error:", err);
          setError("Autoplay blocked. Click the play button.");
        });
      } else {
        console.error("❌ HLS not supported");
        setError("HLS streams not supported in this browser");
      }
    } else {
      // Direct video playback
      console.log("📹 Direct video playback");
      video.src = selectedChannel.url;
      video.play().catch(err => {
        console.error("❌ Direct play error:", err);
        setError("Failed to play stream");
      });
    }
    
    // Cleanup function
    return () => {
      if (hlsRef.current) {
        try {
          hlsRef.current.destroy();
        } catch (e) {
          console.error("Cleanup error:", e);
        }
        hlsRef.current = null;
      }
    };
    
  }, [selectedChannel]);

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8 flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-purple-500 mx-auto mb-4" />
          <p className="text-gray-400">Loading sports channels...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-purple-400 mb-2">Live Sports</h1>
            <p className="text-gray-400">
              Watch live sports channels from around the world
            </p>
          </div>
          <Button
            onClick={fetchChannels}
            className="bg-purple-600 hover:bg-purple-700"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-900/20 border border-red-500/50 rounded-lg flex items-start gap-3">
          <AlertCircle className="h-5 w-5 text-red-400 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="text-red-400 text-sm font-medium">{error}</p>
            <p className="text-red-400/70 text-xs mt-2">
              Check browser console (F12) for detailed logs
            </p>
          </div>
        </div>
      )}

      <div className="grid lg:grid-cols-[1fr_300px] gap-6">
        <div>
          {selectedChannel ? (
            <Card className="bg-gray-900 border-gray-800">
              <CardHeader>
                <CardTitle className="flex items-center gap-3">
                  {selectedChannel.logo && (
                    <img
                      src={selectedChannel.logo}
                      alt={selectedChannel.name}
                      className="h-8 w-8 rounded object-contain bg-white/10 p-1"
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = 'none';
                      }}
                    />
                  )}
                  <span className="text-purple-400">{selectedChannel.name}</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="rounded-lg overflow-hidden bg-black aspect-video">
                  <video
                    ref={videoRef}
                    className="w-full h-full"
                    controls
                    playsInline
                  />
                </div>
                <p className="text-xs text-gray-500 mt-3 break-all">
                  {selectedChannel.url}
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="text-center py-12">
              <Tv className="h-12 w-12 mx-auto mb-4 text-gray-600" />
              <p className="text-gray-400">
                {channels.length === 0 ? "No channels available" : "Select a channel to start watching"}
              </p>
            </div>
          )}
        </div>

        <div>
          <Card className="bg-gray-900 border-gray-800 sticky top-24">
            <CardHeader>
              <CardTitle className="text-lg">
                Channels ({channels.length})
              </CardTitle>
            </CardHeader>
            <CardContent className="max-h-[600px] overflow-y-auto space-y-2">
              {channels.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-sm text-gray-400">No channels loaded</p>
                  <p className="text-xs text-gray-500 mt-2">Click refresh to try again</p>
                </div>
              ) : (
                channels.map((channel) => (
                  <button
                    key={channel.id}
                    onClick={() => {
                      console.log("📺 Switching to:", channel.name);
                      setSelectedChannel(channel);
                      setError("");
                    }}
                    className={`w-full text-left p-3 rounded-lg border transition-all ${
                      selectedChannel?.id === channel.id
                        ? "bg-purple-900/40 border-purple-500"
                        : "bg-gray-800/50 border-gray-700 hover:border-purple-500/50"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      {channel.logo ? (
                        <img
                          src={channel.logo}
                          alt={channel.name}
                          className="h-8 w-8 rounded object-contain bg-white/10 p-1"
                          loading="lazy"
                          onError={(e) => {
                            (e.target as HTMLImageElement).style.display = 'none';
                          }}
                        />
                      ) : (
                        <div className="h-8 w-8 rounded bg-purple-900/40 flex items-center justify-center">
                          <Tv className="h-4 w-4 text-purple-400" />
                        </div>
                      )}
                      <span className="text-sm font-medium line-clamp-2">
                        {channel.name}
                      </span>
                    </div>
                  </button>
                ))
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Sports;