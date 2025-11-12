import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { XCircle } from "lucide-react";

export default function Cancel() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-sport-green-dark to-background p-4">
      <div className="glass-card p-8 rounded-lg max-w-md w-full text-center">
        <XCircle className="w-16 h-16 text-destructive mx-auto mb-4" />
        <h1 className="text-2xl font-bold mb-4">Payment Cancelled</h1>
        <p className="text-muted-foreground mb-6">
          Your payment was cancelled. No charges were made.
        </p>
        <div className="space-y-3">
          <Button onClick={() => navigate("/#membership")} className="w-full">
            Try Again
          </Button>
          <Button onClick={() => navigate("/")} variant="outline" className="w-full">
            Back to Home
          </Button>
        </div>
      </div>
    </div>
  );
}
