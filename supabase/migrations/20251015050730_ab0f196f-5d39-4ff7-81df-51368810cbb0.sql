-- Create storage buckets for covers/posters
INSERT INTO storage.buckets (id, name, public) VALUES ('covers', 'covers', true);

-- Create storage policies for covers
CREATE POLICY "Covers are publicly accessible" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'covers');

CREATE POLICY "Users can upload covers" 
ON storage.objects 
FOR INSERT 
WITH CHECK (bucket_id = 'covers' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can update their own covers" 
ON storage.objects 
FOR UPDATE 
USING (bucket_id = 'covers' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete their own covers" 
ON storage.objects 
FOR DELETE 
USING (bucket_id = 'covers' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Add image_url columns to tables
ALTER TABLE public.books ADD COLUMN cover_url text;
ALTER TABLE public.movies ADD COLUMN poster_url text;
ALTER TABLE public.music ADD COLUMN cover_url text;