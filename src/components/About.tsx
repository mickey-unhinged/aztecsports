import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Target, Eye, Award, Users } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

const iconMap: Record<string, any> = {
  target: Target,
  eye: Eye,
  award: Award,
  users: Users,
};

export const About = () => {
  const { data: aboutData, isLoading } = useQuery({
    queryKey: ["about"],
    queryFn: async () => {
      const { data: about, error } = await supabase
        .from("about")
        .select("*")
        .single();

      if (error) throw error;

      const { data: values } = await supabase
        .from("about_values")
        .select("*")
        .eq("about_id", about.id)
        .order("order_index");

      const { data: team } = await supabase
        .from("team_members")
        .select("*")
        .eq("about_id", about.id)
        .order("order_index");

      const { data: stats } = await supabase
        .from("about_stats")
        .select("*")
        .eq("about_id", about.id)
        .order("order_index");

      return { ...about, values, team, stats };
    },
  });

  if (isLoading) {
    return (
      <section id="about" className="py-20 bg-muted/50">
        <div className="container mx-auto px-4">
          <Skeleton className="h-12 w-64 mx-auto mb-4" />
          <Skeleton className="h-6 w-96 mx-auto mb-12" />
        </div>
      </section>
    );
  }

  return (
    <section id="about" className="py-20 bg-muted/50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            {aboutData?.title || "About Us"}
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            {aboutData?.subtitle || "Building champions on and off the field"}
          </p>
        </div>

        {/* Mission & Vision */}
        <div className="grid md:grid-cols-2 gap-8 mb-16">
          <div className="glass-card p-8 rounded-lg hover:shadow-glow transition-all duration-300">
            <div className="flex items-center gap-3 mb-4">
              <Target className="w-8 h-8 text-primary" />
              <h3 className="text-2xl font-bold">Our Mission</h3>
            </div>
            <p className="text-muted-foreground leading-relaxed">
              {aboutData?.mission || "To develop world-class athletes through exceptional training, fostering excellence, teamwork, and sportsmanship."}
            </p>
          </div>

          <div className="glass-card p-8 rounded-lg hover:shadow-glow transition-all duration-300">
            <div className="flex items-center gap-3 mb-4">
              <Eye className="w-8 h-8 text-primary" />
              <h3 className="text-2xl font-bold">Our Vision</h3>
            </div>
            <p className="text-muted-foreground leading-relaxed">
              {aboutData?.vision || "To be the leading sports club recognized for producing champions and building strong character."}
            </p>
          </div>
        </div>

        {/* Core Values */}
        {aboutData?.values && aboutData.values.length > 0 && (
          <div className="mb-16">
            <h3 className="text-3xl font-bold text-center mb-8">Core Values</h3>
            <div className="grid md:grid-cols-3 gap-6">
              {aboutData.values.map((value: any) => {
                const IconComponent = iconMap[value.icon] || Award;
                return (
                  <div key={value.id} className="glass-card p-6 rounded-lg text-center hover:shadow-glow transition-all duration-300">
                    <IconComponent className="w-12 h-12 text-primary mx-auto mb-4" />
                    <h4 className="text-xl font-bold mb-2">{value.title}</h4>
                    <p className="text-muted-foreground">{value.description}</p>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Statistics */}
        {aboutData?.stats && aboutData.stats.length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-16">
            {aboutData.stats.map((stat: any) => (
              <div key={stat.id} className="text-center">
                <div className="text-4xl md:text-5xl font-bold text-primary mb-2">
                  {stat.number}
                </div>
                <div className="text-muted-foreground">{stat.label}</div>
              </div>
            ))}
          </div>
        )}

        {/* Team Members */}
        {aboutData?.team && aboutData.team.length > 0 && (
          <div>
            <h3 className="text-3xl font-bold text-center mb-8">Meet Our Team</h3>
            <div className="grid md:grid-cols-4 gap-6">
              {aboutData.team.map((member: any) => (
                <div key={member.id} className="glass-card p-6 rounded-lg text-center hover:shadow-glow transition-all duration-300">
                  {member.image_url && (
                    <img
                      src={member.image_url}
                      alt={member.name}
                      className="w-24 h-24 rounded-full mx-auto mb-4 object-cover border-4 border-primary/20"
                    />
                  )}
                  <h4 className="text-xl font-bold mb-1">{member.name}</h4>
                  <p className="text-muted-foreground">{member.role}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
};
