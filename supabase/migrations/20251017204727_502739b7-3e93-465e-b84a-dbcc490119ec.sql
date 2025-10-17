-- Add role column to profiles table
ALTER TABLE public.profiles 
ADD COLUMN role text CHECK (role IN ('teacher', 'student')) DEFAULT 'student';

-- Update the handle_new_user function to capture role from metadata
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, username, role)
  VALUES (
    new.id, 
    new.email,
    COALESCE(new.raw_user_meta_data->>'role', 'student')
  );
  RETURN new;
END;
$$;