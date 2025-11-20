-- Create user_achievements table for editable achievements
CREATE TABLE IF NOT EXISTS public.user_achievements (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  date_achieved TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create training_feed table for sharing training pictures/videos
CREATE TABLE IF NOT EXISTS public.training_feed (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  caption TEXT,
  media_url TEXT NOT NULL,
  media_type TEXT NOT NULL CHECK (media_type IN ('image', 'video')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.user_achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.training_feed ENABLE ROW LEVEL SECURITY;

-- RLS policies for user_achievements
CREATE POLICY "Users can view all achievements"
  ON public.user_achievements FOR SELECT
  USING (true);

CREATE POLICY "Users can insert their own achievements"
  ON public.user_achievements FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own achievements"
  ON public.user_achievements FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own achievements"
  ON public.user_achievements FOR DELETE
  USING (auth.uid() = user_id);

-- RLS policies for training_feed
CREATE POLICY "All authenticated users can view feed"
  ON public.training_feed FOR SELECT
  USING (auth.role() = 'authenticated');

CREATE POLICY "Users can insert their own posts"
  ON public.training_feed FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own posts"
  ON public.training_feed FOR DELETE
  USING (auth.uid() = user_id);

-- Update contact_info with new values
UPDATE public.contact_info 
SET 
  email = 'aztecsports182@gmail.com',
  phone = '+254797952112',
  updated_at = now()
WHERE id IS NOT NULL;

-- Update Instagram social link or insert if not exists
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM public.social_links WHERE platform = 'Instagram') THEN
    UPDATE public.social_links
    SET url = 'https://www.instagram.com/aztec_sports?igsh=MTV2ZGhmN283Y2N1aw=='
    WHERE platform = 'Instagram';
  ELSE
    INSERT INTO public.social_links (platform, url, icon, contact_info_id)
    SELECT 'Instagram', 'https://www.instagram.com/aztec_sports?igsh=MTV2ZGhmN283Y2N1aw==', 'instagram', id
    FROM public.contact_info
    LIMIT 1;
  END IF;
END $$;