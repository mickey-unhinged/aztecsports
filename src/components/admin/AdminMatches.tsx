import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { z } from "zod";

const matchSchema = z.object({
  home_team_name: z.string().trim().min(1, "Home team name is required").max(100, "Home team name must be less than 100 characters"),
  away_team_name: z.string().trim().min(1, "Away team name is required").max(100, "Away team name must be less than 100 characters"),
  date: z.string().min(1, "Date is required"),
  venue: z.string().trim().min(1, "Venue is required").max(200, "Venue must be less than 200 characters"),
  competition: z.string().trim().min(1, "Competition is required").max(100, "Competition must be less than 100 characters"),
  status: z.enum(["upcoming", "live", "completed"]),
  home_team_score: z.number().int().min(0, "Score must be 0 or greater").max(999, "Score must be less than 1000"),
  away_team_score: z.number().int().min(0, "Score must be 0 or greater").max(999, "Score must be less than 1000"),
  published: z.boolean(),
});

const AdminMatches = () => {
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [editingMatch, setEditingMatch] = useState<any>(null);
  const [formData, setFormData] = useState({
    home_team_name: "",
    away_team_name: "",
    date: "",
    venue: "",
    competition: "",
    status: "upcoming",
    home_team_score: 0,
    away_team_score: 0,
    published: true,
  });

  const { data: matches } = useQuery({
    queryKey: ["admin-matches"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("matches")
        .select("*")
        .order("date", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: any) => {
      const { error } = await supabase.from("matches").insert(data);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-matches"] });
      toast.success("Match created successfully");
      setOpen(false);
      resetForm();
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      const { error } = await supabase.from("matches").update(data).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-matches"] });
      toast.success("Match updated successfully");
      setOpen(false);
      resetForm();
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("matches").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-matches"] });
      toast.success("Match deleted successfully");
    },
  });

  const resetForm = () => {
    setFormData({
      home_team_name: "",
      away_team_name: "",
      date: "",
      venue: "",
      competition: "",
      status: "upcoming",
      home_team_score: 0,
      away_team_score: 0,
      published: true,
    });
    setEditingMatch(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const validatedData = matchSchema.parse(formData);
      if (editingMatch) {
        updateMutation.mutate({ id: editingMatch.id, data: validatedData });
      } else {
        createMutation.mutate(validatedData);
      }
    } catch (error) {
      if (error instanceof z.ZodError) {
        toast.error(error.errors[0].message);
      }
    }
  };

  const handleEdit = (match: any) => {
    setEditingMatch(match);
    setFormData({
      home_team_name: match.home_team_name,
      away_team_name: match.away_team_name,
      date: match.date,
      venue: match.venue,
      competition: match.competition,
      status: match.status,
      home_team_score: match.home_team_score || 0,
      away_team_score: match.away_team_score || 0,
      published: match.published,
    });
    setOpen(true);
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Manage Matches</CardTitle>
            <CardDescription>Create and manage match fixtures</CardDescription>
          </div>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => { resetForm(); setOpen(true); }}>
                <Plus className="h-4 w-4 mr-2" />
                Add Match
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>{editingMatch ? "Edit Match" : "Create New Match"}</DialogTitle>
                <DialogDescription>Fill in the match details below</DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="home_team">Home Team</Label>
                    <Input
                      id="home_team"
                      value={formData.home_team_name}
                      onChange={(e) => setFormData({ ...formData, home_team_name: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="away_team">Away Team</Label>
                    <Input
                      id="away_team"
                      value={formData.away_team_name}
                      onChange={(e) => setFormData({ ...formData, away_team_name: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="date">Date & Time</Label>
                    <Input
                      id="date"
                      type="datetime-local"
                      value={formData.date}
                      onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="venue">Venue</Label>
                    <Input
                      id="venue"
                      value={formData.venue}
                      onChange={(e) => setFormData({ ...formData, venue: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="competition">Competition</Label>
                    <Input
                      id="competition"
                      value={formData.competition}
                      onChange={(e) => setFormData({ ...formData, competition: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="status">Status</Label>
                    <Select value={formData.status} onValueChange={(value) => setFormData({ ...formData, status: value })}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="upcoming">Upcoming</SelectItem>
                        <SelectItem value="live">Live</SelectItem>
                        <SelectItem value="completed">Completed</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="home_score">Home Score</Label>
                    <Input
                      id="home_score"
                      type="number"
                      value={formData.home_team_score}
                      onChange={(e) => setFormData({ ...formData, home_team_score: parseInt(e.target.value) })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="away_score">Away Score</Label>
                    <Input
                      id="away_score"
                      type="number"
                      value={formData.away_team_score}
                      onChange={(e) => setFormData({ ...formData, away_team_score: parseInt(e.target.value) })}
                    />
                  </div>
                </div>
                <div className="flex justify-end gap-2">
                  <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit">
                    {editingMatch ? "Update" : "Create"} Match
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Home Team</TableHead>
              <TableHead>Away Team</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Venue</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Score</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {matches?.map((match) => (
              <TableRow key={match.id}>
                <TableCell>{match.home_team_name}</TableCell>
                <TableCell>{match.away_team_name}</TableCell>
                <TableCell>{new Date(match.date).toLocaleDateString()}</TableCell>
                <TableCell>{match.venue}</TableCell>
                <TableCell>{match.status}</TableCell>
                <TableCell>
                  {match.home_team_score} - {match.away_team_score}
                </TableCell>
                <TableCell>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" onClick={() => handleEdit(match)}>
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => deleteMutation.mutate(match.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};

export default AdminMatches;
