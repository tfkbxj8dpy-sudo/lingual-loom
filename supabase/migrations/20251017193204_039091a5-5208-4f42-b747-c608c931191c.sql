-- Add image support to grammar rules
ALTER TABLE public.grammar_rules 
ADD COLUMN IF NOT EXISTS image_url TEXT;

-- Add exercise type and options to grammar exercises for interactive exercises
ALTER TABLE public.grammar_exercises 
ADD COLUMN IF NOT EXISTS exercise_type TEXT DEFAULT 'open_ended' CHECK (exercise_type IN ('open_ended', 'multiple_choice', 'fill_blank', 'true_false'));

ALTER TABLE public.grammar_exercises 
ADD COLUMN IF NOT EXISTS options JSONB;

-- Create storage bucket for grammar images if it doesn't exist
INSERT INTO storage.buckets (id, name, public)
VALUES ('grammar-images', 'grammar-images', true)
ON CONFLICT (id) DO NOTHING;

-- Create storage policies for grammar images
CREATE POLICY "Grammar images are publicly accessible" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'grammar-images');

CREATE POLICY "Authenticated users can upload grammar images" 
ON storage.objects 
FOR INSERT 
WITH CHECK (bucket_id = 'grammar-images' AND auth.role() = 'authenticated');

CREATE POLICY "Users can update their grammar images" 
ON storage.objects 
FOR UPDATE 
USING (bucket_id = 'grammar-images' AND auth.role() = 'authenticated');

CREATE POLICY "Users can delete their grammar images" 
ON storage.objects 
FOR DELETE 
USING (bucket_id = 'grammar-images' AND auth.role() = 'authenticated');