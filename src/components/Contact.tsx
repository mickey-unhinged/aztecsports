import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { MapPin, Phone, Mail } from "lucide-react";
import { toast } from "sonner";

export const Contact = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { data: contactInfo } = useQuery({
    queryKey: ["contact-info"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("contact_info")
        .select("*, social_links(*)")
        .single();

      if (error) throw error;
      return data;
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const { error } = await supabase
        .from("contact_submissions")
        .insert([formData]);

      if (error) throw error;

      toast.success("Message sent successfully!");
      setFormData({ name: "", email: "", subject: "", message: "" });
    } catch (error) {
      toast.error("Failed to send message. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section id="contact" className="py-20 bg-muted/50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-4xl md:text-5xl font-bold mb-4">Get In Touch</h2>
          <p className="text-xl text-muted-foreground">We'd love to hear from you</p>
        </div>

        <div className="grid md:grid-cols-2 gap-12 max-w-6xl mx-auto">
          <div className="glass-card p-8 rounded-lg">
            <h3 className="text-2xl font-bold mb-6">Contact Information</h3>
            
            {contactInfo && (
              <div className="space-y-6">
                <a 
                  href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(contactInfo.address)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-start gap-4 group hover:bg-primary/5 p-2 -m-2 rounded-lg transition-colors"
                >
                  <MapPin className="w-6 h-6 text-primary flex-shrink-0 group-hover:scale-110 transition-transform" />
                  <div>
                    <h4 className="font-semibold mb-1">Address</h4>
                    <p className="text-muted-foreground group-hover:text-primary transition-colors">{contactInfo.address}</p>
                  </div>
                </a>

                <a 
                  href={`tel:${contactInfo.phone.replace(/\s/g, '')}`}
                  className="flex items-start gap-4 group hover:bg-primary/5 p-2 -m-2 rounded-lg transition-colors"
                >
                  <Phone className="w-6 h-6 text-primary flex-shrink-0 group-hover:scale-110 transition-transform" />
                  <div>
                    <h4 className="font-semibold mb-1">Phone</h4>
                    <p className="text-muted-foreground group-hover:text-primary transition-colors">{contactInfo.phone}</p>
                  </div>
                </a>

                <a 
                  href={`mailto:${contactInfo.email}`}
                  className="flex items-start gap-4 group hover:bg-primary/5 p-2 -m-2 rounded-lg transition-colors"
                >
                  <Mail className="w-6 h-6 text-primary flex-shrink-0 group-hover:scale-110 transition-transform" />
                  <div>
                    <h4 className="font-semibold mb-1">Email</h4>
                    <p className="text-muted-foreground group-hover:text-primary transition-colors">{contactInfo.email}</p>
                  </div>
                </a>
              </div>
            )}
          </div>

          <form onSubmit={handleSubmit} className="glass-card p-8 rounded-lg space-y-6">
            <div>
              <Input
                placeholder="Your Name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                maxLength={100}
                required
              />
            </div>
            <div>
              <Input
                type="email"
                placeholder="Your Email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                maxLength={255}
                required
              />
            </div>
            <div>
              <Input
                placeholder="Subject"
                value={formData.subject}
                onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                maxLength={200}
                required
              />
            </div>
            <div>
              <Textarea
                placeholder="Your Message"
                value={formData.message}
                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                maxLength={2000}
                required
                rows={5}
              />
            </div>
            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? "Sending..." : "Send Message"}
            </Button>
          </form>
        </div>
      </div>
    </section>
  );
};
