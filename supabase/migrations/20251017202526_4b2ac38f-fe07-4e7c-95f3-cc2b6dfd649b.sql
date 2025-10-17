-- Create function to update timestamps (if not exists)
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create table for teacher feedback on reviews
CREATE TABLE public.review_feedback (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  student_user_id UUID NOT NULL,
  teacher_user_id UUID NOT NULL,
  item_type TEXT NOT NULL CHECK (item_type IN ('book', 'music', 'movie')),
  item_id UUID NOT NULL,
  feedback TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.review_feedback ENABLE ROW LEVEL SECURITY;

-- Policy: Students can view feedback on their own items
CREATE POLICY "Students can view own feedback"
ON public.review_feedback
FOR SELECT
USING (auth.uid() = student_user_id);

-- Policy: Teachers can view feedback they gave
CREATE POLICY "Teachers can view their feedback"
ON public.review_feedback
FOR SELECT
USING (auth.uid() = teacher_user_id);

-- Policy: Teachers can add feedback to their students' reviews
CREATE POLICY "Teachers can add feedback"
ON public.review_feedback
FOR INSERT
WITH CHECK (
  auth.uid() = teacher_user_id AND
  EXISTS (
    SELECT 1 FROM languages l1
    JOIN languages l2 ON (l1.teacher_user_id = l2.user_id OR l2.teacher_user_id = l1.user_id)
    WHERE l1.user_id = auth.uid() AND l2.user_id = student_user_id
  )
);

-- Policy: Teachers can update their own feedback
CREATE POLICY "Teachers can update own feedback"
ON public.review_feedback
FOR UPDATE
USING (auth.uid() = teacher_user_id);

-- Policy: Teachers can delete their own feedback
CREATE POLICY "Teachers can delete own feedback"
ON public.review_feedback
FOR DELETE
USING (auth.uid() = teacher_user_id);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_review_feedback_updated_at
BEFORE UPDATE ON public.review_feedback
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();