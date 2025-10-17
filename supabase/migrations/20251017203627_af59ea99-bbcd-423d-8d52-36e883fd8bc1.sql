-- Drop the existing restrictive policy
DROP POLICY IF EXISTS "Teachers can add feedback" ON public.review_feedback;

-- Create a more permissive policy for teachers
CREATE POLICY "Teachers can add feedback to shared language content"
ON public.review_feedback
FOR INSERT
WITH CHECK (
  auth.uid() = teacher_user_id AND
  EXISTS (
    SELECT 1 FROM languages
    WHERE user_id = auth.uid() 
    AND role = 'teacher'
  )
);