-- Update the check constraint to include 'speaking'
ALTER TABLE public.review_feedback 
DROP CONSTRAINT IF EXISTS review_feedback_item_type_check;

ALTER TABLE public.review_feedback
ADD CONSTRAINT review_feedback_item_type_check 
CHECK (item_type IN ('book', 'music', 'movie', 'speaking'));