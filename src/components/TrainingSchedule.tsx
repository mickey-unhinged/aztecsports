import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Calendar, Clock, MapPin, Users, UserCheck } from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";

export const TrainingSchedule = () => {
  const queryClient = useQueryClient();

  const { data: sessions, isLoading: sessionsLoading } = useQuery({
    queryKey: ["training-sessions"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("training_sessions")
        .select("*")
        .eq("published", true)
        .gte("date", new Date().toISOString())
        .order("date");

      if (error) throw error;
      return data;
    },
  });

  const { data: bookings } = useQuery({
    queryKey: ["user-bookings"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];

      const { data, error } = await supabase
        .from("training_bookings")
        .select("session_id")
        .eq("user_id", user.id);

      if (error) throw error;
      return data.map(b => b.session_id);
    },
  });

  const bookMutation = useMutation({
    mutationFn: async (sessionId: string) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { error } = await supabase
        .from("training_bookings")
        .insert({
          user_id: user.id,
          session_id: sessionId,
          status: "confirmed",
        });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user-bookings"] });
      toast.success("Training session booked successfully!");
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to book session");
    },
  });

  const cancelMutation = useMutation({
    mutationFn: async (sessionId: string) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { error } = await supabase
        .from("training_bookings")
        .delete()
        .eq("user_id", user.id)
        .eq("session_id", sessionId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user-bookings"] });
      toast.success("Booking cancelled");
    },
    onError: () => {
      toast.error("Failed to cancel booking");
    },
  });

  const isBooked = (sessionId: string) => bookings?.includes(sessionId);

  if (sessionsLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-40" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {sessions && sessions.length > 0 ? (
        sessions.map((session) => (
          <Card key={session.id} className="p-6">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-xl font-bold mb-2">{session.title}</h3>
                <p className="text-muted-foreground text-sm mb-3">
                  {session.description}
                </p>
              </div>
              <span className="bg-primary/10 text-primary px-3 py-1 rounded-full text-sm font-medium">
                {session.session_type}
              </span>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
              <div className="flex items-center text-sm">
                <Calendar className="w-4 h-4 mr-2 text-primary" />
                {format(new Date(session.date), "MMM dd, yyyy")}
              </div>
              <div className="flex items-center text-sm">
                <Clock className="w-4 h-4 mr-2 text-primary" />
                {format(new Date(session.date), "hh:mm a")} ({session.duration}min)
              </div>
              <div className="flex items-center text-sm">
                <MapPin className="w-4 h-4 mr-2 text-primary" />
                {session.location}
              </div>
              <div className="flex items-center text-sm">
                <Users className="w-4 h-4 mr-2 text-primary" />
                Max {session.max_participants}
              </div>
            </div>

            {session.coach_name && (
              <div className="flex items-center text-sm mb-4">
                <UserCheck className="w-4 h-4 mr-2 text-primary" />
                Coach: {session.coach_name}
              </div>
            )}

            {isBooked(session.id) ? (
              <Button
                onClick={() => cancelMutation.mutate(session.id)}
                variant="outline"
                disabled={cancelMutation.isPending}
              >
                Cancel Booking
              </Button>
            ) : (
              <Button
                onClick={() => bookMutation.mutate(session.id)}
                disabled={bookMutation.isPending}
              >
                Book Session
              </Button>
            )}
          </Card>
        ))
      ) : (
        <p className="text-center text-muted-foreground py-8">
          No upcoming training sessions available
        </p>
      )}
    </div>
  );
};