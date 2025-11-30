import { useState, useRef, useEffect, useCallback } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { toast } from "sonner";
import { ImagePlus, Trash2, Loader2, Play, Pause, Volume2, VolumeX } from "lucide-react";
import { format } from "date-fns";

interface FeedPost {
  id: string;
  user_id: string;
  media_url: string;
  media_type: string;
  caption: string | null;
  created_at: string;
  profile?: { full_name: string | null };
}

const FeedItem = ({ 
  post, 
  isActive, 
  userId, 
  onDelete 
}: { 
  post: FeedPost; 
  isActive: boolean; 
  userId: string;
  onDelete: (id: string) => void;
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(true);

  useEffect(() => {
    if (!videoRef.current) return;
    
    if (isActive) {
      videoRef.current.play().catch(() => {});
      setIsPlaying(true);
    } else {
      videoRef.current.pause();
      videoRef.current.currentTime = 0;
      setIsPlaying(false);
    }
  }, [isActive]);

  const togglePlay = () => {
    if (!videoRef.current) return;
    
    if (isPlaying) {
      videoRef.current.pause();
      setIsPlaying(false);
    } else {
      videoRef.current.play().catch(() => {});
      setIsPlaying(true);
    }
  };

  const toggleMute = () => {
    if (!videoRef.current) return;
    videoRef.current.muted = !isMuted;
    setIsMuted(!isMuted);
  };

  return (
    <div className="relative h-full w-full bg-black rounded-lg overflow-hidden snap-start snap-always">
      {/* Media */}
      {post.media_type === "image" ? (
        <img
          src={post.media_url}
          alt="Training post"
          className="w-full h-full object-cover"
        />
      ) : (
        <>
          <video
            ref={videoRef}
            src={post.media_url}
            loop
            muted={isMuted}
            playsInline
            className="w-full h-full object-cover cursor-pointer"
            onClick={togglePlay}
          />
          
          {/* Play/Pause Overlay */}
          {!isPlaying && (
            <div 
              className="absolute inset-0 flex items-center justify-center cursor-pointer"
              onClick={togglePlay}
            >
              <div className="bg-black/50 rounded-full p-4">
                <Play className="w-12 h-12 text-white fill-white" />
              </div>
            </div>
          )}
          
          {/* Video Controls */}
          <div className="absolute right-4 bottom-24 flex flex-col gap-3">
            <Button
              variant="ghost"
              size="icon"
              className="bg-black/30 hover:bg-black/50 text-white rounded-full"
              onClick={toggleMute}
            >
              {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
            </Button>
          </div>
        </>
      )}
      
      {/* Overlay Info */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent pointer-events-none" />
      
      {/* User Info & Caption */}
      <div className="absolute bottom-0 left-0 right-16 p-6 text-white pointer-events-auto">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <Avatar className="border-2 border-white">
                <AvatarFallback className="bg-primary text-white">
                  {post.profile?.full_name?.[0] || "U"}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="font-semibold text-lg">
                  {post.profile?.full_name || "Member"}
                </p>
                <p className="text-xs text-gray-300">
                  {format(new Date(post.created_at), "PPp")}
                </p>
              </div>
            </div>
            {post.caption && (
              <p className="text-sm line-clamp-3">{post.caption}</p>
            )}
          </div>
          
          {/* Delete Button */}
          {post.user_id === userId && (
            <Button
              variant="destructive"
              size="sm"
              onClick={() => onDelete(post.id)}
              className="shrink-0"
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export const TrainingFeed = ({ userId }: { userId: string }) => {
  const [caption, setCaption] = useState("");
  const [mediaFile, setMediaFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const queryClient = useQueryClient();

  const { data: feedPosts, isLoading } = useQuery({
    queryKey: ["training-feed"],
    queryFn: async () => {
      const { data: posts, error } = await supabase
        .from("training_feed")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;

      const postsWithProfiles = await Promise.all(
        posts.map(async (post) => {
          const { data: profile } = await supabase
            .from("profiles")
            .select("full_name")
            .eq("id", post.user_id)
            .single();
          
          return { ...post, profile };
        })
      );

      return postsWithProfiles as FeedPost[];
    },
  });

  // Handle scroll to detect active item
  const handleScroll = useCallback(() => {
    if (!containerRef.current || !feedPosts) return;
    
    const container = containerRef.current;
    const scrollTop = container.scrollTop;
    const itemHeight = container.clientHeight;
    const newIndex = Math.round(scrollTop / itemHeight);
    
    if (newIndex !== activeIndex && newIndex >= 0 && newIndex < feedPosts.length) {
      setActiveIndex(newIndex);
    }
  }, [activeIndex, feedPosts]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    
    container.addEventListener("scroll", handleScroll);
    return () => container.removeEventListener("scroll", handleScroll);
  }, [handleScroll]);

  const uploadMutation = useMutation({
    mutationFn: async () => {
      if (!mediaFile) throw new Error("No file selected");

      setIsUploading(true);
      
      const fileExt = mediaFile.name.split('.').pop();
      const fileName = `${userId}-${Date.now()}.${fileExt}`;
      const filePath = `training-feed/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('training-media')
        .upload(filePath, mediaFile);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('training-media')
        .getPublicUrl(filePath);

      const mediaType = mediaFile.type.startsWith('video/') ? 'video' : 'image';
      
      const { error: insertError } = await supabase
        .from("training_feed")
        .insert({
          user_id: userId,
          caption: caption || null,
          media_url: publicUrl,
          media_type: mediaType,
        });

      if (insertError) throw insertError;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["training-feed"] });
      toast.success("Post shared successfully!");
      setCaption("");
      setMediaFile(null);
      setIsUploading(false);
    },
    onError: () => {
      toast.error("Failed to share post");
      setIsUploading(false);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (postId: string) => {
      const { error } = await supabase
        .from("training_feed")
        .delete()
        .eq("id", postId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["training-feed"] });
      toast.success("Post deleted");
    },
    onError: () => {
      toast.error("Failed to delete post");
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!mediaFile) {
      toast.error("Please select a photo or video");
      return;
    }
    uploadMutation.mutate();
  };

  const scrollToIndex = (index: number) => {
    if (!containerRef.current || !feedPosts) return;
    const itemHeight = containerRef.current.clientHeight;
    containerRef.current.scrollTo({
      top: index * itemHeight,
      behavior: "smooth"
    });
  };

  return (
    <div className="space-y-6">
      {/* Post Form */}
      <Card className="glass-card border-0">
        <CardHeader>
          <h3 className="text-xl font-bold">Share Your Training</h3>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <Textarea
              placeholder="Write a caption... (optional)"
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              maxLength={500}
              className="resize-none"
            />
            
            <div className="flex gap-2 items-center">
              <Input
                type="file"
                accept="image/*,video/*"
                onChange={(e) => setMediaFile(e.target.files?.[0] || null)}
                className="flex-1"
              />
              <Button 
                type="submit" 
                disabled={!mediaFile || isUploading}
                className="gap-2"
              >
                {isUploading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Uploading...
                  </>
                ) : (
                  <>
                    <ImagePlus className="w-4 h-4" />
                    Share
                  </>
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Feed Posts - TikTok Style */}
      {isLoading ? (
        <div className="text-center py-8">
          <Loader2 className="w-8 h-8 animate-spin mx-auto text-primary" />
        </div>
      ) : feedPosts && feedPosts.length > 0 ? (
        <div className="relative">
          <div
            ref={containerRef}
            className="h-[600px] overflow-y-scroll snap-y snap-mandatory rounded-lg scrollbar-hide"
            style={{ scrollSnapType: "y mandatory" }}
          >
            {feedPosts.map((post, index) => (
              <div 
                key={post.id} 
                className="h-[600px] snap-start"
                style={{ scrollSnapAlign: "start" }}
              >
                <FeedItem
                  post={post}
                  isActive={index === activeIndex}
                  userId={userId}
                  onDelete={(id) => deleteMutation.mutate(id)}
                />
              </div>
            ))}
          </div>
          
          {/* Dots Indicator */}
          <div className="absolute right-2 top-1/2 -translate-y-1/2 flex flex-col gap-1">
            {feedPosts.map((_, index) => (
              <button
                key={index}
                onClick={() => scrollToIndex(index)}
                className={`w-2 h-2 rounded-full transition-all ${
                  index === activeIndex 
                    ? "bg-primary h-4" 
                    : "bg-white/50 hover:bg-white/80"
                }`}
              />
            ))}
          </div>
        </div>
      ) : (
        <Card className="glass-card border-0">
          <CardContent className="py-8 text-center text-muted-foreground">
            No posts yet. Be the first to share your training!
          </CardContent>
        </Card>
      )}
    </div>
  );
};
