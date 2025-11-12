import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import { Calendar, MapPin, Trophy } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

export const Fixtures = () => {
  const { data: matches, isLoading } = useQuery({
    queryKey: ["matches"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("matches")
        .select("*")
        .eq("published", true)
        .order("date", { ascending: true })
        .limit(6);

      if (error) throw error;
      return data;
    },
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case "live":
        return "bg-red-500";
      case "completed":
        return "bg-green-500";
      case "upcoming":
        return "bg-blue-500";
      default:
        return "bg-gray-500";
    }
  };

  if (isLoading) {
    return (
      <section id="fixtures" className="py-20">
        <div className="container mx-auto px-4">
          <Skeleton className="h-12 w-64 mx-auto mb-12" />
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-64" />
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section id="fixtures" className="py-20">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-4xl md:text-5xl font-bold mb-4">Fixtures & Results</h2>
          <p className="text-xl text-muted-foreground">Stay updated with our latest matches</p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {matches && matches.length > 0 ? (
            matches.map((match) => (
              <div
                key={match.id}
                className="glass-card p-6 rounded-lg hover:shadow-glow transition-all duration-300"
              >
                <div className="flex items-center justify-between mb-4">
                  <Badge className={getStatusColor(match.status)}>
                    {match.status}
                  </Badge>
                  <div className="flex items-center text-sm text-muted-foreground">
                    <Trophy className="w-4 h-4 mr-1" />
                    {match.competition}
                  </div>
                </div>

                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3 flex-1">
                    {match.home_team_logo_url && (
                      <img src={match.home_team_logo_url} alt="" className="w-10 h-10" />
                    )}
                    <span className="font-semibold">{match.home_team_name}</span>
                  </div>
                  {match.status === "completed" && (
                    <span className="text-2xl font-bold text-primary mx-4">
                      {match.home_team_score} - {match.away_team_score}
                    </span>
                  )}
                  <div className="flex items-center gap-3 flex-1 justify-end">
                    <span className="font-semibold">{match.away_team_name}</span>
                    {match.away_team_logo_url && (
                      <img src={match.away_team_logo_url} alt="" className="w-10 h-10" />
                    )}
                  </div>
                </div>

                <div className="flex items-center text-sm text-muted-foreground gap-4">
                  <div className="flex items-center">
                    <Calendar className="w-4 h-4 mr-1" />
                    {format(new Date(match.date), "MMM dd, yyyy")}
                  </div>
                  <div className="flex items-center">
                    <MapPin className="w-4 h-4 mr-1" />
                    {match.venue}
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-full text-center text-muted-foreground py-12">
              No fixtures available at the moment
            </div>
          )}
        </div>
      </div>
    </section>
  );
};
