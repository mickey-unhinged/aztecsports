import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { User, LogOut, Trophy, Calendar, Bell, Clock, MapPin, Users, CreditCard, Dumbbell, Image } from "lucide-react";
import { toast } from "sonner";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TrainingSchedule } from "@/components/TrainingSchedule";
import { TrainingFeed } from "@/components/TrainingFeed";
import { AchievementsManager } from "@/components/AchievementsManager";
import { format } from "date-fns";
import { showNotificationWithSound } from "@/components/NotificationToast";

export default function Dashboard() {
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  // Fetch upcoming matches
  const { data: upcomingMatches } = useQuery({
    queryKey: ["upcoming-matches"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("matches")
        .select("*")
        .eq("status", "upcoming")
        .eq("published", true)
        .order("date", { ascending: true })
        .limit(3);

      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  // Fetch recent announcements
  const { data: announcements } = useQuery({
    queryKey: ["dashboard-announcements"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("announcements")
        .select("*")
        .eq("published", true)
        .order("created_at", { ascending: false })
        .limit(5);

      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  // Fetch payment history
  const { data: payments } = useQuery({
    queryKey: ["payment-history", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("payment_history")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  // Fetch training bookings
  const { data: bookings } = useQuery({
    queryKey: ["user-training-bookings", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("training_bookings")
        .select("*, training_sessions(*)")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  // Fetch user achievements
  const { data: achievements = [] } = useQuery({
    queryKey: ["user-achievements", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("user_achievements")
        .select("*")
        .eq("user_id", user?.id)
        .order("date_achieved", { ascending: false });

      if (error) throw error;
      return data || [];
    },
    enabled: !!user,
  });

  useEffect(() => {
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        navigate("/auth");
        return;
      }

      setUser(session.user);

      const { data: profileData } = await supabase
        .from("profiles")
        .select("*, membership_plans(*)")
        .eq("id", session.user.id)
        .single();

      setProfile(profileData);

      // Check if user has admin role
      const { data: roles } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", session.user.id)
        .eq("role", "admin")
        .single();

      if (roles) {
        setIsAdmin(true);
      }

      setLoading(false);
    };

    checkUser();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session) {
        navigate("/auth");
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    showNotificationWithSound("Signed out successfully", "success");
    navigate("/");
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-muted/50">
      <nav className="glass-card border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-primary">Aztec Sports</h1>
            <div className="flex items-center gap-2">
              {isAdmin && (
                <Button onClick={() => navigate("/admin")} variant="default" className="gap-2">
                  <Trophy className="w-4 h-4" />
                  Admin Dashboard
                </Button>
              )}
              <Button onClick={handleSignOut} variant="outline" className="gap-2">
                <LogOut className="w-4 h-4" />
                Sign Out
              </Button>
            </div>
          </div>
        </div>
      </nav>

      <div className="container mx-auto px-4 py-8">
        <div className="glass-card p-8 rounded-lg mb-8">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center">
              <User className="w-8 h-8 text-primary" />
            </div>
            <div>
              <h2 className="text-2xl font-bold">{profile?.full_name || user?.email}</h2>
              <p className="text-muted-foreground">{user?.email}</p>
            </div>
          </div>

          {profile?.membership_plans && (
            <div className="glass-card p-6 rounded-lg bg-primary/5">
              <h3 className="text-xl font-bold mb-2">{profile.membership_plans.name} Member</h3>
              <p className="text-muted-foreground mb-4">{profile.membership_plans.description}</p>
              <div className="flex items-center gap-2">
                <span className="px-3 py-1 rounded-full text-sm font-medium bg-primary/20 text-primary">
                  {profile.membership_status || "Active"}
                </span>
              </div>
            </div>
          )}
        </div>

        <div className="grid md:grid-cols-2 gap-6 mb-8">
          {/* Upcoming Matches */}
          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-primary" />
                Upcoming Matches
              </CardTitle>
              <CardDescription>Your next fixtures</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {upcomingMatches && upcomingMatches.length > 0 ? (
                upcomingMatches.map((match) => (
                  <div key={match.id} className="p-4 rounded-lg bg-muted/50 hover:bg-muted transition-colors">
                    <div className="flex items-center justify-between mb-2">
                      <Badge variant="outline">{match.competition}</Badge>
                      <span className="text-sm text-muted-foreground flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {new Date(match.date).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="font-semibold">{match.home_team_name} vs {match.away_team_name}</div>
                    <div className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
                      <MapPin className="w-3 h-3" />
                      {match.venue}
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-muted-foreground text-sm">No upcoming matches scheduled</p>
              )}
            </CardContent>
          </Card>

          {/* Recent Announcements */}
          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="w-5 h-5 text-primary" />
                Club News
              </CardTitle>
              <CardDescription>Latest updates and announcements</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {announcements && announcements.length > 0 ? (
                announcements.map((announcement) => (
                  <div key={announcement.id} className="p-4 rounded-lg bg-muted/50 hover:bg-muted transition-colors">
                    <div className="flex items-center justify-between mb-1">
                      <Badge variant="secondary">{announcement.category}</Badge>
                      {announcement.priority === "high" && (
                        <Badge variant="destructive" className="text-xs">High Priority</Badge>
                      )}
                    </div>
                    <h4 className="font-semibold mb-1">{announcement.title}</h4>
                    <p className="text-sm text-muted-foreground line-clamp-2">{announcement.excerpt}</p>
                  </div>
                ))
              ) : (
                <p className="text-muted-foreground text-sm">No announcements available</p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Quick Stats */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <Card className="glass-card hover:shadow-glow transition-all duration-300">
            <CardHeader className="pb-3">
              <Trophy className="w-12 h-12 text-primary mb-2" />
              <CardTitle>Achievements</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-primary mb-2">{achievements?.length || 0}</div>
              <p className="text-sm text-muted-foreground">Badges earned</p>
              {achievements && achievements.length > 0 && (
                <div className="mt-4 space-y-2">
                  {achievements.slice(0, 2).map((achievement) => (
                    <div key={achievement.id} className="text-xs p-2 rounded bg-muted/30">
                      <p className="font-medium truncate">{achievement.title}</p>
                      {achievement.date_achieved && (
                        <p className="text-muted-foreground">
                          {format(new Date(achievement.date_achieved), "PP")}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="glass-card hover:shadow-glow transition-all duration-300">
            <CardHeader className="pb-3">
              <Users className="w-12 h-12 text-primary mb-2" />
              <CardTitle>Training Sessions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-primary mb-2">
                {bookings?.length || 0}
              </div>
              <p className="text-sm text-muted-foreground">Booked sessions</p>
            </CardContent>
          </Card>

          <Card className="glass-card hover:shadow-glow transition-all duration-300">
            <CardHeader className="pb-3">
              <Clock className="w-12 h-12 text-primary mb-2" />
              <CardTitle>Membership Days</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-primary mb-2">
                {profile?.membership_start_date
                  ? Math.floor(
                      (new Date().getTime() - new Date(profile.membership_start_date).getTime()) /
                        (1000 * 60 * 60 * 24)
                    )
                  : "0"}
              </div>
              <p className="text-sm text-muted-foreground">Days active</p>
            </CardContent>
          </Card>
        </div>

        {/* Training and Payment Tabs */}
        <Tabs defaultValue="training" className="mb-8">
          <TabsList className="grid w-full grid-cols-2 md:grid-cols-4 gap-1">
            <TabsTrigger value="training" className="gap-2 text-xs md:text-sm">
              <Dumbbell className="w-4 h-4" />
              <span className="hidden sm:inline">Training</span>
            </TabsTrigger>
            <TabsTrigger value="feed" className="gap-2 text-xs md:text-sm">
              <Image className="w-4 h-4" />
              <span className="hidden sm:inline">Feed</span>
            </TabsTrigger>
            <TabsTrigger value="achievements" className="gap-2 text-xs md:text-sm">
              <Trophy className="w-4 h-4" />
              <span className="hidden sm:inline">Achievements</span>
            </TabsTrigger>
            <TabsTrigger value="payments" className="gap-2 text-xs md:text-sm">
              <CreditCard className="w-4 h-4" />
              <span className="hidden sm:inline">Payments</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="training" className="mt-6">
            <Card className="glass-card">
              <CardHeader>
                <CardTitle>Available Training Sessions</CardTitle>
                <CardDescription>Book your training sessions below</CardDescription>
              </CardHeader>
              <CardContent>
                <TrainingSchedule />
              </CardContent>
            </Card>

            {bookings && bookings.length > 0 && (
              <Card className="glass-card mt-6">
                <CardHeader>
                  <CardTitle>My Bookings</CardTitle>
                  <CardDescription>Your upcoming training sessions</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {bookings.map((booking: any) => (
                    <div key={booking.id} className="p-4 rounded-lg bg-muted/50">
                      <h4 className="font-semibold mb-2">{booking.training_sessions.title}</h4>
                      <div className="grid grid-cols-2 gap-2 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {format(new Date(booking.training_sessions.date), "MMM dd, yyyy")}
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {format(new Date(booking.training_sessions.date), "hh:mm a")}
                        </div>
                        <div className="flex items-center gap-1">
                          <MapPin className="w-3 h-3" />
                          {booking.training_sessions.location}
                        </div>
                        <Badge variant="outline" className="w-fit">
                          {booking.status}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="feed" className="mt-6">
            <TrainingFeed userId={user.id} />
          </TabsContent>

          <TabsContent value="achievements" className="mt-6">
            <AchievementsManager userId={user.id} />
          </TabsContent>

          <TabsContent value="payments" className="mt-6">
            <Card className="glass-card">
              <CardHeader>
                <CardTitle>Payment History</CardTitle>
                <CardDescription>Your membership transactions</CardDescription>
              </CardHeader>
              <CardContent>
                {payments && payments.length > 0 ? (
                  <div className="space-y-4">
                    {payments.map((payment) => (
                      <div key={payment.id} className="p-4 rounded-lg bg-muted/50 flex items-center justify-between">
                        <div>
                          <h4 className="font-semibold mb-1">{payment.plan_name}</h4>
                          <p className="text-sm text-muted-foreground">
                            {format(new Date(payment.created_at), "MMMM dd, yyyy")}
                          </p>
                        </div>
                        <div className="text-right">
                          <div className="text-lg font-bold text-primary">
                            {payment.currency.toUpperCase()} {(payment.amount / 100).toFixed(2)}
                          </div>
                          <Badge
                            variant={payment.status === "succeeded" ? "default" : "destructive"}
                            className="mt-1"
                          >
                            {payment.status}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted-foreground text-sm">No payment history available</p>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <div className="mt-8 text-center">
          <Button onClick={() => navigate("/")} variant="outline">
            Back to Home
          </Button>
        </div>
      </div>
    </div>
  );
}
