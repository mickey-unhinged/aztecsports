import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { toast } from "sonner";
import { Trophy, Plus, Pencil, Trash2, Calendar } from "lucide-react";
import { format } from "date-fns";

export const AchievementsManager = ({ userId }: { userId: string }) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    date_achieved: "",
  });

  const queryClient = useQueryClient();

  const { data: achievements, isLoading } = useQuery({
    queryKey: ["user-achievements", userId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("user_achievements")
        .select("*")
        .eq("user_id", userId)
        .order("date_achieved", { ascending: false });

      if (error) throw error;
      return data;
    },
  });

  const saveMutation = useMutation({
    mutationFn: async () => {
      if (editingId) {
        const { error } = await supabase
          .from("user_achievements")
          .update({
            title: formData.title,
            description: formData.description,
            date_achieved: formData.date_achieved || null,
            updated_at: new Date().toISOString(),
          })
          .eq("id", editingId);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("user_achievements")
          .insert({
            user_id: userId,
            title: formData.title,
            description: formData.description,
            date_achieved: formData.date_achieved || null,
          });

        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user-achievements", userId] });
      toast.success(editingId ? "Achievement updated!" : "Achievement added!");
      setIsDialogOpen(false);
      resetForm();
    },
    onError: () => {
      toast.error("Failed to save achievement");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("user_achievements")
        .delete()
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user-achievements", userId] });
      toast.success("Achievement deleted");
    },
    onError: () => {
      toast.error("Failed to delete achievement");
    },
  });

  const resetForm = () => {
    setFormData({ title: "", description: "", date_achieved: "" });
    setEditingId(null);
  };

  const handleEdit = (achievement: any) => {
    setEditingId(achievement.id);
    setFormData({
      title: achievement.title,
      description: achievement.description || "",
      date_achieved: achievement.date_achieved ? format(new Date(achievement.date_achieved), "yyyy-MM-dd") : "",
    });
    setIsDialogOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim()) {
      toast.error("Title is required");
      return;
    }
    saveMutation.mutate();
  };

  return (
    <Card className="glass-card border-0">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2">
          <Trophy className="w-5 h-5 text-primary" />
          My Achievements
        </CardTitle>
        <Dialog open={isDialogOpen} onOpenChange={(open) => {
          setIsDialogOpen(open);
          if (!open) resetForm();
        }}>
          <DialogTrigger asChild>
            <Button size="sm" className="gap-2">
              <Plus className="w-4 h-4" />
              Add Achievement
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {editingId ? "Edit Achievement" : "Add Achievement"}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <Input
                placeholder="Achievement Title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                maxLength={200}
                required
              />
              <Textarea
                placeholder="Description (optional)"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                maxLength={500}
              />
              <Input
                type="date"
                value={formData.date_achieved}
                onChange={(e) => setFormData({ ...formData, date_achieved: e.target.value })}
              />
              <Button type="submit" className="w-full">
                {editingId ? "Update" : "Add"} Achievement
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <p className="text-muted-foreground text-center py-4">Loading...</p>
        ) : achievements && achievements.length > 0 ? (
          <div className="space-y-3">
            {achievements.map((achievement) => (
              <div
                key={achievement.id}
                className="p-4 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1">
                    <h4 className="font-semibold mb-1">{achievement.title}</h4>
                    {achievement.description && (
                      <p className="text-sm text-muted-foreground mb-2">
                        {achievement.description}
                      </p>
                    )}
                    {achievement.date_achieved && (
                      <p className="text-xs text-muted-foreground flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {format(new Date(achievement.date_achieved), "PPP")}
                      </p>
                    )}
                  </div>
                  <div className="flex gap-1">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleEdit(achievement)}
                    >
                      <Pencil className="w-4 h-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => deleteMutation.mutate(achievement.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-muted-foreground text-center py-4">
            No achievements yet. Add your first achievement!
          </p>
        )}
      </CardContent>
    </Card>
  );
};
