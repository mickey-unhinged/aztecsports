import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { toast } from "sonner";
import { ImagePlus, Video, Trash2, Loader2 } from "lucide-react";
import { format } from "date-fns";

export const TrainingFeed = ({ userId }: { userId: string }) => {
  const [caption, setCaption] = useState("");
  const [mediaFile, setMediaFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const queryClient = useQueryClient();

  const { data: feedPosts, isLoading } = useQuery({
    queryKey: ["training-feed"],
    queryFn: async () => {
      const { data: posts, error } = await supabase
        .from("training_feed")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;

      // Fetch profile info for each post
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

      return postsWithProfiles;
    },
  });

  const uploadMutation = useMutation({
    mutationFn: async () => {
      if (!mediaFile) throw new Error("No file selected");

      setIsUploading(true);
      
      // Upload to Supabase Storage
      const fileExt = mediaFile.name.split('.').pop();
      const fileName = `${userId}-${Date.now()}.${fileExt}`;
      const filePath = `training-feed/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('training-media')
        .upload(filePath, mediaFile);

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('training-media')
        .getPublicUrl(filePath);

      // Insert into feed
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

      {/* Feed Posts */}
      {isLoading ? (
        <div className="text-center py-8">
          <Loader2 className="w-8 h-8 animate-spin mx-auto text-primary" />
        </div>
      ) : feedPosts && feedPosts.length > 0 ? (
        <div className="space-y-4">
          {feedPosts.map((post) => (
            <Card key={post.id} className="glass-card border-0">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Avatar>
                      <AvatarFallback>
                        {post.profile?.full_name?.[0] || "U"}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-semibold">
                        {post.profile?.full_name || "Member"}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {format(new Date(post.created_at), "PPp")}
                      </p>
                    </div>
                  </div>
                  {post.user_id === userId && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => deleteMutation.mutate(post.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                {post.caption && <p>{post.caption}</p>}
                
                {post.media_type === "image" ? (
                  <img
                    src={post.media_url}
                    alt="Training post"
                    className="w-full rounded-lg"
                  />
                ) : (
                  <video
                    src={post.media_url}
                    controls
                    className="w-full rounded-lg"
                  />
                )}
              </CardContent>
            </Card>
          ))}
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
