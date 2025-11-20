-- Create storage bucket for training feed media
INSERT INTO storage.buckets (id, name, public) 
VALUES ('training-media', 'training-media', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for training media
CREATE POLICY "Authenticated users can view training media"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'training-media' AND auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can upload training media"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'training-media' AND auth.role() = 'authenticated');

CREATE POLICY "Users can delete their own training media"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'training-media' AND auth.uid()::text = (storage.foldername(name))[1]);