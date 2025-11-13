import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Calendar, MapPin, Trophy } from "lucide-react";
import { format } from "date-fns";

export default function MatchDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const { data: match, isLoading } = useQuery({
    queryKey: ["match", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("matches")
        .select("*")
        .eq("id", id)
        .single();

      if (error) throw error;
      return data;
    },
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-sport-green-dark to-background p-4">
        <div className="container mx-auto max-w-4xl py-8">
          <Skeleton className="h-12 w-full mb-6" />
          <Skeleton className="h-64 w-full mb-6" />
          <Skeleton className="h-48 w-full" />
        </div>
      </div>
    );
  }

  if (!match) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Match not found</h2>
          <Button onClick={() => navigate("/")}>Back to Home</Button>
        </div>
      </div>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "live":
        return "bg-red-500";
      case "completed":
        return "bg-green-500";
      default:
        return "bg-blue-500";
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-sport-green-dark to-background">
      <div className="container mx-auto max-w-4xl p-4 py-8">
        <Button
          onClick={() => navigate("/")}
          variant="ghost"
          className="mb-6"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Home
        </Button>

        <Card className="glass-card p-8 mb-6">
          <div className="flex justify-between items-start mb-6">
            <div className="flex items-center gap-3">
              <Trophy className="w-6 h-6 text-primary" />
              <h1 className="text-3xl font-bold">{match.competition}</h1>
            </div>
            <Badge className={getStatusColor(match.status)}>
              {match.status.toUpperCase()}
            </Badge>
          </div>

          <div className="grid md:grid-cols-2 gap-8 mb-8">
            <div className="flex flex-col items-center text-center">
              {match.home_team_logo_url && (
                <img
                  src={match.home_team_logo_url}
                  alt={match.home_team_name}
                  className="w-24 h-24 object-contain mb-4"
                />
              )}
              <h2 className="text-2xl font-bold mb-2">{match.home_team_name}</h2>
              {match.status === "completed" && (
                <div className="text-5xl font-bold text-primary">
                  {match.home_team_score}
                </div>
              )}
            </div>

            <div className="flex flex-col items-center text-center">
              {match.away_team_logo_url && (
                <img
                  src={match.away_team_logo_url}
                  alt={match.away_team_name}
                  className="w-24 h-24 object-contain mb-4"
                />
              )}
              <h2 className="text-2xl font-bold mb-2">{match.away_team_name}</h2>
              {match.status === "completed" && (
                <div className="text-5xl font-bold text-primary">
                  {match.away_team_score}
                </div>
              )}
            </div>
          </div>

          <div className="flex flex-wrap gap-4 justify-center text-muted-foreground">
            <div className="flex items-center">
              <Calendar className="w-4 h-4 mr-2" />
              {format(new Date(match.date), "MMMM dd, yyyy 'at' hh:mm a")}
            </div>
            <div className="flex items-center">
              <MapPin className="w-4 h-4 mr-2" />
              {match.venue}
            </div>
          </div>
        </Card>

        {match.match_report && (
          <Card className="glass-card p-8 mb-6">
            <h3 className="text-2xl font-bold mb-4">Match Report</h3>
            <p className="text-muted-foreground leading-relaxed whitespace-pre-wrap">
              {match.match_report}
            </p>
          </Card>
        )}

        {match.highlights && (
          <Card className="glass-card p-8">
            <h3 className="text-2xl font-bold mb-4">Highlights</h3>
            <p className="text-muted-foreground leading-relaxed whitespace-pre-wrap">
              {match.highlights}
            </p>
          </Card>
        )}
      </div>
    </div>
  );
}