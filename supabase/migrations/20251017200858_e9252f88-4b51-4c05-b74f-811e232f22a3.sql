-- Add questions array to store multiple question-answer pairs per exercise
ALTER TABLE public.grammar_exercises
ADD COLUMN questions JSONB DEFAULT '[]'::JSONB;

-- Add a comment to describe the structure
COMMENT ON COLUMN public.grammar_exercises.questions IS 'Array of question objects: [{question: string, answer: string}]';