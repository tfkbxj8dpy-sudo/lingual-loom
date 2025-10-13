-- Create profiles table for user data
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Create languages table
CREATE TABLE public.languages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  flag_emoji TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.languages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own languages" ON public.languages
  FOR ALL USING (auth.uid() = user_id);

-- Create categories table for organizing words
CREATE TABLE public.categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  language_id UUID NOT NULL REFERENCES public.languages(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  color TEXT DEFAULT '#6B7280',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own categories" ON public.categories
  FOR ALL USING (auth.uid() = user_id);

-- Create words table for dictionary
CREATE TABLE public.words (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  language_id UUID NOT NULL REFERENCES public.languages(id) ON DELETE CASCADE,
  category_id UUID REFERENCES public.categories(id) ON DELETE SET NULL,
  word TEXT NOT NULL,
  definition TEXT NOT NULL,
  example_sentence TEXT,
  image_url TEXT,
  difficulty TEXT CHECK (difficulty IN ('easy', 'medium', 'hard')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.words ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own words" ON public.words
  FOR ALL USING (auth.uid() = user_id);

-- Create movies table
CREATE TABLE public.movies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  language_id UUID NOT NULL REFERENCES public.languages(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  review TEXT,
  summary TEXT,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.movies ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own movies" ON public.movies
  FOR ALL USING (auth.uid() = user_id);

-- Create movie_vocabulary table
CREATE TABLE public.movie_vocabulary (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  movie_id UUID NOT NULL REFERENCES public.movies(id) ON DELETE CASCADE,
  word TEXT NOT NULL,
  definition TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.movie_vocabulary ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage movie vocabulary" ON public.movie_vocabulary
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.movies
      WHERE movies.id = movie_vocabulary.movie_id
      AND movies.user_id = auth.uid()
    )
  );

-- Create books table
CREATE TABLE public.books (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  language_id UUID NOT NULL REFERENCES public.languages(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  author TEXT,
  review TEXT,
  summary TEXT,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.books ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own books" ON public.books
  FOR ALL USING (auth.uid() = user_id);

-- Create book_vocabulary table
CREATE TABLE public.book_vocabulary (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  book_id UUID NOT NULL REFERENCES public.books(id) ON DELETE CASCADE,
  word TEXT NOT NULL,
  definition TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.book_vocabulary ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage book vocabulary" ON public.book_vocabulary
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.books
      WHERE books.id = book_vocabulary.book_id
      AND books.user_id = auth.uid()
    )
  );

-- Create music table
CREATE TABLE public.music (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  language_id UUID NOT NULL REFERENCES public.languages(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  artist TEXT,
  lyrics TEXT,
  translation TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.music ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own music" ON public.music
  FOR ALL USING (auth.uid() = user_id);

-- Create speaking_topics table
CREATE TABLE public.speaking_topics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  language_id UUID NOT NULL REFERENCES public.languages(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.speaking_topics ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own speaking topics" ON public.speaking_topics
  FOR ALL USING (auth.uid() = user_id);

-- Create speaking_questions table
CREATE TABLE public.speaking_questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  topic_id UUID NOT NULL REFERENCES public.speaking_topics(id) ON DELETE CASCADE,
  question TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.speaking_questions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage speaking questions" ON public.speaking_questions
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.speaking_topics
      WHERE speaking_topics.id = speaking_questions.topic_id
      AND speaking_topics.user_id = auth.uid()
    )
  );

-- Create speaking_recordings table
CREATE TABLE public.speaking_recordings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  question_id UUID NOT NULL REFERENCES public.speaking_questions(id) ON DELETE CASCADE,
  recording_url TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.speaking_recordings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own recordings" ON public.speaking_recordings
  FOR ALL USING (auth.uid() = user_id);

-- Create grammar_rules table
CREATE TABLE public.grammar_rules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  language_id UUID NOT NULL REFERENCES public.languages(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.grammar_rules ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own grammar rules" ON public.grammar_rules
  FOR ALL USING (auth.uid() = user_id);

-- Create grammar_exercises table
CREATE TABLE public.grammar_exercises (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  rule_id UUID NOT NULL REFERENCES public.grammar_rules(id) ON DELETE CASCADE,
  question TEXT NOT NULL,
  answer TEXT NOT NULL,
  explanation TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.grammar_exercises ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage grammar exercises" ON public.grammar_exercises
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.grammar_rules
      WHERE grammar_rules.id = grammar_exercises.rule_id
      AND grammar_rules.user_id = auth.uid()
    )
  );

-- Create function to handle new user profiles
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, username)
  VALUES (new.id, new.email);
  RETURN new;
END;
$$;

-- Create trigger for new user profiles
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();