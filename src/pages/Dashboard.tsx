import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { User, LogOut, Trophy, Calendar, Bell } from "lucide-react";
import { toast } from "sonner";

export default function Dashboard() {
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);

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
    toast.success("Signed out successfully");
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
            <h1 className="text-2xl font-bold text-primary">Aztec United</h1>
            <Button onClick={handleSignOut} variant="outline" className="gap-2">
              <LogOut className="w-4 h-4" />
              Sign Out
            </Button>
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

        <div className="grid md:grid-cols-3 gap-6">
          <div className="glass-card p-6 rounded-lg hover:shadow-glow transition-all duration-300">
            <Trophy className="w-12 h-12 text-primary mb-4" />
            <h3 className="text-xl font-bold mb-2">Your Achievements</h3>
            <p className="text-muted-foreground">Track your progress and milestones</p>
          </div>

          <div className="glass-card p-6 rounded-lg hover:shadow-glow transition-all duration-300">
            <Calendar className="w-12 h-12 text-primary mb-4" />
            <h3 className="text-xl font-bold mb-2">Training Schedule</h3>
            <p className="text-muted-foreground">View your personalized training plan</p>
          </div>

          <div className="glass-card p-6 rounded-lg hover:shadow-glow transition-all duration-300">
            <Bell className="w-12 h-12 text-primary mb-4" />
            <h3 className="text-xl font-bold mb-2">Notifications</h3>
            <p className="text-muted-foreground">Stay updated with club news</p>
          </div>
        </div>

        <div className="mt-8 text-center">
          <Button onClick={() => navigate("/")} variant="outline">
            Back to Home
          </Button>
        </div>
      </div>
    </div>
  );
}
