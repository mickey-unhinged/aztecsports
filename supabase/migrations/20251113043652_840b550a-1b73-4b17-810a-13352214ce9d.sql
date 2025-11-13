-- Create training_sessions table
CREATE TABLE public.training_sessions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  session_type TEXT NOT NULL DEFAULT 'practice',
  date TIMESTAMP WITH TIME ZONE NOT NULL,
  duration INTEGER NOT NULL DEFAULT 90,
  max_participants INTEGER DEFAULT 30,
  location TEXT NOT NULL,
  coach_name TEXT,
  published BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create training_bookings table
CREATE TABLE public.training_bookings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  session_id UUID NOT NULL REFERENCES public.training_sessions(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'confirmed',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, session_id)
);

-- Create payment_history table
CREATE TABLE public.payment_history (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  stripe_payment_id TEXT NOT NULL,
  stripe_subscription_id TEXT,
  amount INTEGER NOT NULL,
  currency TEXT NOT NULL DEFAULT 'kes',
  status TEXT NOT NULL,
  plan_name TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.training_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.training_bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payment_history ENABLE ROW LEVEL SECURITY;

-- Training sessions policies
CREATE POLICY "Public can read published training sessions"
ON public.training_sessions FOR SELECT
USING (published = true);

-- Training bookings policies
CREATE POLICY "Users can view their own bookings"
ON public.training_bookings FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own bookings"
ON public.training_bookings FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own bookings"
ON public.training_bookings FOR DELETE
USING (auth.uid() = user_id);

-- Payment history policies
CREATE POLICY "Users can view their own payment history"
ON public.payment_history FOR SELECT
USING (auth.uid() = user_id);