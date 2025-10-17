-- Add sentences array to grammar_exercises table
ALTER TABLE public.grammar_exercises
ADD COLUMN sentences TEXT[] DEFAULT ARRAY[]::TEXT[];