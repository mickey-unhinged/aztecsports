import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Bell, Calendar } from "lucide-react";

export const Announcements = () => {
  const { data: announcements, isLoading } = useQuery({
    queryKey: ["announcements"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("announcements")
        .select("*")
        .eq("published", true)
        .order("created_at", { ascending: false })
        .limit(6);

      if (error) throw error;
      return data;
    },
  });

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "news":
        return "bg-blue-500";
      case "event":
        return "bg-purple-500";
      case "update":
        return "bg-green-500";
      case "alert":
        return "bg-red-500";
      default:
        return "bg-gray-500";
    }
  };

  if (isLoading) {
    return (
      <section id="announcements" className="py-20 bg-muted/50">
        <div className="container mx-auto px-4">
          <Skeleton className="h-12 w-64 mx-auto mb-12" />
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-80" />
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section id="announcements" className="py-20 bg-muted/50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-4xl md:text-5xl font-bold mb-4">Latest News</h2>
          <p className="text-xl text-muted-foreground">Stay informed with our latest updates</p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {announcements && announcements.length > 0 ? (
            announcements.map((announcement) => (
              <div
                key={announcement.id}
                className="glass-card rounded-lg overflow-hidden hover:shadow-glow transition-all duration-300 group cursor-pointer"
              >
                {announcement.featured_image_url && (
                  <div className="h-48 overflow-hidden">
                    <img
                      src={announcement.featured_image_url}
                      alt={announcement.title}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                    />
                  </div>
                )}
                <div className="p-6">
                  <div className="flex items-center justify-between mb-3">
                    <Badge className={getCategoryColor(announcement.category)}>
                      {announcement.category}
                    </Badge>
                    {announcement.priority === "high" && (
                      <Bell className="w-4 h-4 text-red-500 animate-pulse" />
                    )}
                  </div>
                  <h3 className="text-xl font-bold mb-2 group-hover:text-primary transition-colors">
                    {announcement.title}
                  </h3>
                  <p className="text-muted-foreground mb-4 line-clamp-3">
                    {announcement.excerpt}
                  </p>
                  <div className="flex items-center text-sm text-muted-foreground">
                    <Calendar className="w-4 h-4 mr-1" />
                    {format(new Date(announcement.created_at), "MMM dd, yyyy")}
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-full text-center text-muted-foreground py-12">
              No announcements available at the moment
            </div>
          )}
        </div>
      </div>
    </section>
  );
};
