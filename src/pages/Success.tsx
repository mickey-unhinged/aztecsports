import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { CheckCircle, Loader2 } from "lucide-react";
import { toast } from "sonner";

export default function Success() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [processing, setProcessing] = useState(true);

  useEffect(() => {
    const sessionId = searchParams.get("session_id");
    
    if (!sessionId) {
      toast.error("Invalid payment session");
      navigate("/");
      return;
    }

    // Give Stripe webhook time to process
    const timer = setTimeout(() => {
      setProcessing(false);
      toast.success("Payment successful! Welcome to Aztec Sports!");
    }, 2000);

    return () => clearTimeout(timer);
  }, [searchParams, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-sport-green-dark to-background p-4">
      <div className="glass-card p-8 rounded-lg max-w-md w-full text-center">
        {processing ? (
          <>
            <Loader2 className="w-16 h-16 text-primary mx-auto mb-4 animate-spin" />
            <h1 className="text-2xl font-bold mb-4">Processing Payment...</h1>
            <p className="text-muted-foreground mb-6">
              Please wait while we confirm your membership
            </p>
          </>
        ) : (
          <>
            <CheckCircle className="w-16 h-16 text-primary mx-auto mb-4" />
            <h1 className="text-2xl font-bold mb-4">Payment Successful!</h1>
            <p className="text-muted-foreground mb-6">
              Welcome to Aztec Sports! Your membership has been activated.
            </p>
            <div className="space-y-3">
              <Button onClick={() => navigate("/dashboard")} className="w-full">
                Go to Dashboard
              </Button>
              <Button onClick={() => navigate("/")} variant="outline" className="w-full">
                Back to Home
              </Button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
