import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useState } from "react";

export const Membership = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const { data: plans, isLoading } = useQuery({
    queryKey: ["membership-plans"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("membership_plans")
        .select("*")
        .eq("published", true)
        .order("order_index");

      if (error) throw error;
      return data;
    },
  });

  const handleJoin = async (plan: any) => {
    setLoading(true);
    try {
      // Check if user is authenticated
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        // Redirect to auth with selected plan
        navigate("/auth", { state: { selectedPlan: plan } });
        return;
      }

      // Check if plan has Stripe price ID
      if (!plan.stripe_price_id) {
        toast.error("Payment system not configured for this plan");
        setLoading(false);
        return;
      }

      // Create checkout session
      const { data, error } = await supabase.functions.invoke('create-checkout', {
        body: {
          priceId: plan.stripe_price_id,
          planName: plan.name,
          userId: session.user.id,
          userEmail: session.user.email,
        },
      });

      if (error) throw error;

      if (data?.url) {
        // Redirect to Stripe checkout
        window.location.href = data.url;
      } else {
        throw new Error('No checkout URL received');
      }
    } catch (error) {
      console.error('Checkout error:', error);
      toast.error("Failed to start checkout process");
      setLoading(false);
    }
  };

  if (isLoading) {
    return (
      <section id="membership" className="py-20">
        <div className="container mx-auto px-4">
          <Skeleton className="h-12 w-64 mx-auto mb-12" />
          <div className="grid md:grid-cols-3 gap-8">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-96" />
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section id="membership" className="py-20">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-4xl md:text-5xl font-bold mb-4">Membership Plans</h2>
          <p className="text-xl text-muted-foreground">Choose the perfect plan for your journey</p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {plans && plans.length > 0 ? (
            plans.map((plan) => (
              <div
                key={plan.id}
                className={`glass-card p-8 rounded-lg hover:shadow-glow transition-all duration-300 ${
                  plan.featured ? "border-2 border-primary shadow-glow scale-105" : ""
                }`}
              >
                {plan.featured && (
                  <div className="bg-primary text-primary-foreground text-sm font-bold py-1 px-3 rounded-full inline-block mb-4">
                    MOST POPULAR
                  </div>
                )}
                <div className="text-4xl mb-4">{plan.icon}</div>
                <h3 className="text-2xl font-bold mb-2">{plan.name}</h3>
                <p className="text-muted-foreground mb-6">{plan.description}</p>
                <div className="mb-6">
                  <span className="text-4xl font-bold text-primary">KES {plan.price}</span>
                  <span className="text-muted-foreground">/{plan.period}</span>
                </div>
                <ul className="space-y-3 mb-8">
                  {plan.features?.map((feature: string, index: number) => (
                    <li key={index} className="flex items-start">
                      <Check className="w-5 h-5 text-primary mr-2 flex-shrink-0 mt-0.5" />
                      <span className="text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>
                <Button
                  onClick={() => handleJoin(plan)}
                  className="w-full"
                  variant={plan.featured ? "default" : "outline"}
                  disabled={loading}
                >
                  {loading ? "Processing..." : (plan.button_text || "Get Started")}
                </Button>
              </div>
            ))
          ) : (
            <div className="col-span-full text-center text-muted-foreground py-12">
              Membership plans coming soon
            </div>
          )}
        </div>
      </div>
    </section>
  );
};
