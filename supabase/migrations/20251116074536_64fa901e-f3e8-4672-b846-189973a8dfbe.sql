-- Add SELECT policy for admins to view contact form submissions
CREATE POLICY "Admins can view contact submissions"
ON public.contact_submissions
FOR SELECT
USING (public.has_role(auth.uid(), 'admin'::app_role));