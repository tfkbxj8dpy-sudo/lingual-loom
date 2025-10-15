-- Add columns to track word learning progress
ALTER TABLE public.words
ADD COLUMN IF NOT EXISTS forgot_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS learned BOOLEAN DEFAULT FALSE;

-- Add index for better performance when filtering
CREATE INDEX IF NOT EXISTS idx_words_forgot_count ON public.words(forgot_count);
CREATE INDEX IF NOT EXISTS idx_words_learned ON public.words(learned);