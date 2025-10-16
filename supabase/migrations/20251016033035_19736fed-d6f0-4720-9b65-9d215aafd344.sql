-- Add role and teacher connection to languages table (if not already added)
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_schema = 'public' 
                 AND table_name = 'languages' 
                 AND column_name = 'role') THEN
    
    -- Create role enum
    CREATE TYPE public.language_role AS ENUM ('teacher', 'student');
    
    -- Add columns
    ALTER TABLE public.languages 
    ADD COLUMN role public.language_role DEFAULT 'student',
    ADD COLUMN teacher_user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL;
    
    -- Create index
    CREATE INDEX idx_languages_teacher_user_id ON public.languages(teacher_user_id);
  END IF;
END $$;

-- Update RLS policies to allow teachers to see their students' content
-- and students to see their teachers' content

-- Words table policy
DROP POLICY IF EXISTS "Users can manage own words" ON public.words;
DROP POLICY IF EXISTS "Users can manage own words or shared with teacher/student" ON public.words;

CREATE POLICY "Users can manage own words or shared with teacher/student" 
ON public.words 
FOR ALL 
USING (
  auth.uid() = user_id 
  OR EXISTS (
    SELECT 1 FROM public.languages l1
    JOIN public.languages l2 ON l1.teacher_user_id = l2.user_id OR l2.teacher_user_id = l1.user_id
    WHERE (l1.user_id = auth.uid() AND l2.user_id = words.user_id AND l1.id = words.language_id)
       OR (l2.user_id = auth.uid() AND l1.user_id = words.user_id AND l2.id = words.language_id)
  )
)
WITH CHECK (
  auth.uid() = user_id
  OR EXISTS (
    SELECT 1 FROM public.languages l1
    JOIN public.languages l2 ON l1.teacher_user_id = l2.user_id OR l2.teacher_user_id = l1.user_id
    WHERE (l1.user_id = auth.uid() AND l2.user_id = words.user_id AND l1.id = words.language_id)
       OR (l2.user_id = auth.uid() AND l1.user_id = words.user_id AND l2.id = words.language_id)
  )
);

-- Categories table policy
DROP POLICY IF EXISTS "Users can manage own categories" ON public.categories;
DROP POLICY IF EXISTS "Users can manage own categories or shared with teacher/student" ON public.categories;

CREATE POLICY "Users can manage own categories or shared with teacher/student" 
ON public.categories 
FOR ALL 
USING (
  auth.uid() = user_id
  OR EXISTS (
    SELECT 1 FROM public.languages l1
    JOIN public.languages l2 ON l1.teacher_user_id = l2.user_id OR l2.teacher_user_id = l1.user_id
    WHERE (l1.user_id = auth.uid() AND l2.user_id = categories.user_id AND l1.id = categories.language_id)
       OR (l2.user_id = auth.uid() AND l1.user_id = categories.user_id AND l2.id = categories.language_id)
  )
)
WITH CHECK (
  auth.uid() = user_id
  OR EXISTS (
    SELECT 1 FROM public.languages l1
    JOIN public.languages l2 ON l1.teacher_user_id = l2.user_id OR l2.teacher_user_id = l1.user_id
    WHERE (l1.user_id = auth.uid() AND l2.user_id = categories.user_id AND l1.id = categories.language_id)
       OR (l2.user_id = auth.uid() AND l1.user_id = categories.user_id AND l2.id = categories.language_id)
  )
);

-- Books table policy
DROP POLICY IF EXISTS "Users can manage own books" ON public.books;
DROP POLICY IF EXISTS "Users can manage own books or shared with teacher/student" ON public.books;

CREATE POLICY "Users can manage own books or shared with teacher/student" 
ON public.books 
FOR ALL 
USING (
  auth.uid() = user_id
  OR EXISTS (
    SELECT 1 FROM public.languages l1
    JOIN public.languages l2 ON l1.teacher_user_id = l2.user_id OR l2.teacher_user_id = l1.user_id
    WHERE (l1.user_id = auth.uid() AND l2.user_id = books.user_id AND l1.id = books.language_id)
       OR (l2.user_id = auth.uid() AND l1.user_id = books.user_id AND l2.id = books.language_id)
  )
)
WITH CHECK (
  auth.uid() = user_id
  OR EXISTS (
    SELECT 1 FROM public.languages l1
    JOIN public.languages l2 ON l1.teacher_user_id = l2.user_id OR l2.teacher_user_id = l1.user_id
    WHERE (l1.user_id = auth.uid() AND l2.user_id = books.user_id AND l1.id = books.language_id)
       OR (l2.user_id = auth.uid() AND l1.user_id = books.user_id AND l2.id = books.language_id)
  )
);

-- Movies table policy
DROP POLICY IF EXISTS "Users can manage own movies" ON public.movies;
DROP POLICY IF EXISTS "Users can manage own movies or shared with teacher/student" ON public.movies;

CREATE POLICY "Users can manage own movies or shared with teacher/student" 
ON public.movies 
FOR ALL 
USING (
  auth.uid() = user_id
  OR EXISTS (
    SELECT 1 FROM public.languages l1
    JOIN public.languages l2 ON l1.teacher_user_id = l2.user_id OR l2.teacher_user_id = l1.user_id
    WHERE (l1.user_id = auth.uid() AND l2.user_id = movies.user_id AND l1.id = movies.language_id)
       OR (l2.user_id = auth.uid() AND l1.user_id = movies.user_id AND l2.id = movies.language_id)
  )
)
WITH CHECK (
  auth.uid() = user_id
  OR EXISTS (
    SELECT 1 FROM public.languages l1
    JOIN public.languages l2 ON l1.teacher_user_id = l2.user_id OR l2.teacher_user_id = l1.user_id
    WHERE (l1.user_id = auth.uid() AND l2.user_id = movies.user_id AND l1.id = movies.language_id)
       OR (l2.user_id = auth.uid() AND l1.user_id = movies.user_id AND l2.id = movies.language_id)
  )
);

-- Music table policy
DROP POLICY IF EXISTS "Users can manage own music" ON public.music;
DROP POLICY IF EXISTS "Users can manage own music or shared with teacher/student" ON public.music;

CREATE POLICY "Users can manage own music or shared with teacher/student" 
ON public.music 
FOR ALL 
USING (
  auth.uid() = user_id
  OR EXISTS (
    SELECT 1 FROM public.languages l1
    JOIN public.languages l2 ON l1.teacher_user_id = l2.user_id OR l2.teacher_user_id = l1.user_id
    WHERE (l1.user_id = auth.uid() AND l2.user_id = music.user_id AND l1.id = music.language_id)
       OR (l2.user_id = auth.uid() AND l1.user_id = music.user_id AND l2.id = music.language_id)
  )
)
WITH CHECK (
  auth.uid() = user_id
  OR EXISTS (
    SELECT 1 FROM public.languages l1
    JOIN public.languages l2 ON l1.teacher_user_id = l2.user_id OR l2.teacher_user_id = l1.user_id
    WHERE (l1.user_id = auth.uid() AND l2.user_id = music.user_id AND l1.id = music.language_id)
       OR (l2.user_id = auth.uid() AND l1.user_id = music.user_id AND l2.id = music.language_id)
  )
);

-- Grammar rules table policy
DROP POLICY IF EXISTS "Users can manage own grammar rules" ON public.grammar_rules;
DROP POLICY IF EXISTS "Users can manage own grammar rules or shared with teacher/student" ON public.grammar_rules;

CREATE POLICY "Users can manage own grammar rules or shared with teacher/student" 
ON public.grammar_rules 
FOR ALL 
USING (
  auth.uid() = user_id
  OR EXISTS (
    SELECT 1 FROM public.languages l1
    JOIN public.languages l2 ON l1.teacher_user_id = l2.user_id OR l2.teacher_user_id = l1.user_id
    WHERE (l1.user_id = auth.uid() AND l2.user_id = grammar_rules.user_id AND l1.id = grammar_rules.language_id)
       OR (l2.user_id = auth.uid() AND l1.user_id = grammar_rules.user_id AND l2.id = grammar_rules.language_id)
  )
)
WITH CHECK (
  auth.uid() = user_id
  OR EXISTS (
    SELECT 1 FROM public.languages l1
    JOIN public.languages l2 ON l1.teacher_user_id = l2.user_id OR l2.teacher_user_id = l1.user_id
    WHERE (l1.user_id = auth.uid() AND l2.user_id = grammar_rules.user_id AND l1.id = grammar_rules.language_id)
       OR (l2.user_id = auth.uid() AND l1.user_id = grammar_rules.user_id AND l2.id = grammar_rules.language_id)
  )
);

-- Speaking topics table policy
DROP POLICY IF EXISTS "Users can manage own speaking topics" ON public.speaking_topics;
DROP POLICY IF EXISTS "Users can manage own speaking topics or shared with teacher/student" ON public.speaking_topics;

CREATE POLICY "Users can manage own speaking topics or shared with teacher/student" 
ON public.speaking_topics 
FOR ALL 
USING (
  auth.uid() = user_id
  OR EXISTS (
    SELECT 1 FROM public.languages l1
    JOIN public.languages l2 ON l1.teacher_user_id = l2.user_id OR l2.teacher_user_id = l1.user_id
    WHERE (l1.user_id = auth.uid() AND l2.user_id = speaking_topics.user_id AND l1.id = speaking_topics.language_id)
       OR (l2.user_id = auth.uid() AND l1.user_id = speaking_topics.user_id AND l2.id = speaking_topics.language_id)
  )
)
WITH CHECK (
  auth.uid() = user_id
  OR EXISTS (
    SELECT 1 FROM public.languages l1
    JOIN public.languages l2 ON l1.teacher_user_id = l2.user_id OR l2.teacher_user_id = l1.user_id
    WHERE (l1.user_id = auth.uid() AND l2.user_id = speaking_topics.user_id AND l1.id = speaking_topics.language_id)
       OR (l2.user_id = auth.uid() AND l1.user_id = speaking_topics.user_id AND l2.id = speaking_topics.language_id)
  )
);