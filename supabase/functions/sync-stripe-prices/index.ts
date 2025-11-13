import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0?target=deno";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const stripeSecretKey = Deno.env.get("STRIPE_SECRET_KEY");
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!stripeSecretKey) throw new Error("Missing STRIPE_SECRET_KEY");
    if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) throw new Error("Supabase env not configured");

    const stripe = new Stripe(stripeSecretKey, {
      apiVersion: "2023-10-16",
      httpClient: Stripe.createFetchHttpClient(),
    });

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    // Fetch plans missing a Stripe price id
    const { data: plans, error: plansError } = await supabase
      .from("membership_plans")
      .select("id, name, description, price, period, stripe_price_id")
      .is("stripe_price_id", null);

    if (plansError) throw plansError;

    const results: any[] = [];

    for (const plan of plans ?? []) {
      try {
        // Parse numeric price, removing commas and non-digits
        const numeric = parseInt(String(plan.price || "").replace(/[^0-9]/g, ""), 10);
        if (!numeric || isNaN(numeric)) {
          throw new Error(`Plan ${plan.name} has invalid price value: ${plan.price}`);
        }
        // Stripe uses the smallest currency unit for most currencies including KES
        const unitAmount = numeric * 100; // e.g., 2500 -> 250000
        const interval = plan.period === "year" ? "year" : "month";

        const price = await stripe.prices.create({
          currency: "kes",
          unit_amount: unitAmount,
          recurring: { interval },
          product_data: {
            name: plan.name,
          },
        });

        const { error: updateError } = await supabase
          .from("membership_plans")
          .update({ stripe_price_id: price.id })
          .eq("id", plan.id);
        if (updateError) throw updateError;

        results.push({ planId: plan.id, planName: plan.name, priceId: price.id, status: "updated" });
      } catch (innerErr: any) {
        console.error("Failed to sync plan", { plan, error: innerErr?.message });
        results.push({ planId: plan?.id, planName: plan?.name, error: innerErr?.message, status: "failed" });
      }
    }

    return new Response(JSON.stringify({ ok: true, results }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error: any) {
    console.error("sync-stripe-prices error", error);
    return new Response(JSON.stringify({ ok: false, error: error.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
