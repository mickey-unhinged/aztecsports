import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0?target=deno";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.81.1";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const stripeSecretKey = Deno.env.get('STRIPE_SECRET_KEY');
    const webhookSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET');
    
    if (!stripeSecretKey) {
      throw new Error('Stripe secret key not configured');
    }

    const stripe = new Stripe(stripeSecretKey, {
      apiVersion: '2023-10-16',
      httpClient: Stripe.createFetchHttpClient(),
    });

    const signature = req.headers.get('stripe-signature');
    const body = await req.text();

    let event;
    
    if (webhookSecret && signature) {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
    } else {
      event = JSON.parse(body);
    }

    console.log('Webhook event received:', event.type);

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Handle different event types
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object;
        const userId = session.metadata?.userId;
        const planName = session.metadata?.planName;

        if (userId && planName) {
          console.log('Processing successful checkout for user:', userId);

          // Get subscription details
          const subscription = await stripe.subscriptions.retrieve(session.subscription as string);
          
          // Calculate membership dates
          const startDate = new Date(subscription.current_period_start * 1000);
          const endDate = new Date(subscription.current_period_end * 1000);

          // Update user profile
          const { error: profileError } = await supabase
            .from('profiles')
            .update({
              membership_status: 'active',
              membership_start_date: startDate.toISOString(),
              membership_end_date: endDate.toISOString(),
            })
            .eq('id', userId);

          if (profileError) {
            console.error('Error updating profile:', profileError);
          } else {
            console.log('Profile updated successfully');
          }

          // Record payment history
          const { error: paymentError } = await supabase
            .from('payment_history')
            .insert({
              user_id: userId,
              stripe_payment_id: session.payment_intent as string,
              stripe_subscription_id: session.subscription as string,
              amount: session.amount_total || 0,
              currency: session.currency || 'kes',
              status: 'succeeded',
              plan_name: planName,
            });

          if (paymentError) {
            console.error('Error recording payment:', paymentError);
          }
        }
        break;
      }

      case 'customer.subscription.updated':
      case 'customer.subscription.deleted': {
        const subscription = event.data.object;
        
        // Find user by subscription ID
        const { data: payments } = await supabase
          .from('payment_history')
          .select('user_id')
          .eq('stripe_subscription_id', subscription.id)
          .limit(1);

        if (payments && payments.length > 0) {
          const userId = payments[0].user_id;
          const status = subscription.status === 'active' ? 'active' : 'inactive';

          await supabase
            .from('profiles')
            .update({
              membership_status: status,
              membership_end_date: new Date(subscription.current_period_end * 1000).toISOString(),
            })
            .eq('id', userId);

          console.log(`Subscription ${event.type} for user ${userId}`);
        }
        break;
      }

      case 'invoice.payment_succeeded': {
        const invoice = event.data.object;
        
        if (invoice.subscription) {
          const { data: payments } = await supabase
            .from('payment_history')
            .select('user_id, plan_name')
            .eq('stripe_subscription_id', invoice.subscription)
            .limit(1);

          if (payments && payments.length > 0) {
            await supabase
              .from('payment_history')
              .insert({
                user_id: payments[0].user_id,
                stripe_payment_id: invoice.payment_intent as string,
                stripe_subscription_id: invoice.subscription as string,
                amount: invoice.amount_paid || 0,
                currency: invoice.currency || 'kes',
                status: 'succeeded',
                plan_name: payments[0].plan_name,
              });

            console.log('Payment recorded for renewal');
          }
        }
        break;
      }

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return new Response(JSON.stringify({ received: true }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });
  } catch (error: any) {
    console.error('Webhook error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    );
  }
});