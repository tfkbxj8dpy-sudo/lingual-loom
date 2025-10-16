-- Update the create_starter_language_data function to support role parameter
CREATE OR REPLACE FUNCTION public.create_starter_language_data(
  p_user_id uuid, 
  p_language_name text, 
  p_flag_emoji text,
  p_role public.language_role DEFAULT 'student',
  p_teacher_user_id uuid DEFAULT NULL
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  v_language_id UUID;
  v_category_id UUID;
BEGIN
  -- Insert language
  INSERT INTO public.languages (user_id, name, flag_emoji, role, teacher_user_id)
  VALUES (p_user_id, p_language_name, p_flag_emoji, p_role, p_teacher_user_id)
  RETURNING id INTO v_language_id;

  -- Insert common categories for this language
  INSERT INTO public.categories (user_id, language_id, name, color) VALUES
    (p_user_id, v_language_id, 'Basic Vocabulary', '#3B82F6'),
    (p_user_id, v_language_id, 'Food & Dining', '#10B981'),
    (p_user_id, v_language_id, 'Travel & Transportation', '#F59E0B'),
    (p_user_id, v_language_id, 'Work & Business', '#8B5CF6'),
    (p_user_id, v_language_id, 'Daily Activities', '#EC4899'),
    (p_user_id, v_language_id, 'Nature & Weather', '#14B8A6');

  -- Get the Basic Vocabulary category ID
  SELECT id INTO v_category_id 
  FROM public.categories 
  WHERE user_id = p_user_id 
    AND language_id = v_language_id 
    AND name = 'Basic Vocabulary'
  LIMIT 1;

  -- Insert starter words based on language
  CASE p_language_name
    WHEN 'English' THEN
      INSERT INTO public.words (user_id, language_id, category_id, word, definition, example_sentence, difficulty) VALUES
        (p_user_id, v_language_id, v_category_id, 'hello', 'A greeting', 'Hello, how are you?', 'easy'),
        (p_user_id, v_language_id, v_category_id, 'goodbye', 'A parting phrase', 'Goodbye, see you tomorrow!', 'easy'),
        (p_user_id, v_language_id, v_category_id, 'thank you', 'Expression of gratitude', 'Thank you for your help.', 'easy'),
        (p_user_id, v_language_id, v_category_id, 'please', 'Polite request word', 'Please pass the salt.', 'easy'),
        (p_user_id, v_language_id, v_category_id, 'water', 'H2O, essential liquid', 'Can I have some water?', 'easy');
    
    WHEN 'Spanish' THEN
      INSERT INTO public.words (user_id, language_id, category_id, word, definition, example_sentence, difficulty) VALUES
        (p_user_id, v_language_id, v_category_id, 'hola', 'Hello/Hi', '¡Hola! ¿Cómo estás?', 'easy'),
        (p_user_id, v_language_id, v_category_id, 'adiós', 'Goodbye', 'Adiós, hasta mañana.', 'easy'),
        (p_user_id, v_language_id, v_category_id, 'gracias', 'Thank you', 'Gracias por tu ayuda.', 'easy'),
        (p_user_id, v_language_id, v_category_id, 'por favor', 'Please', 'Por favor, pasa la sal.', 'easy'),
        (p_user_id, v_language_id, v_category_id, 'agua', 'Water', '¿Puedo tomar agua?', 'easy');
    
    WHEN 'French' THEN
      INSERT INTO public.words (user_id, language_id, category_id, word, definition, example_sentence, difficulty) VALUES
        (p_user_id, v_language_id, v_category_id, 'bonjour', 'Hello/Good day', 'Bonjour! Comment allez-vous?', 'easy'),
        (p_user_id, v_language_id, v_category_id, 'au revoir', 'Goodbye', 'Au revoir, à demain!', 'easy'),
        (p_user_id, v_language_id, v_category_id, 'merci', 'Thank you', 'Merci pour votre aide.', 'easy'),
        (p_user_id, v_language_id, v_category_id, 's''il vous plaît', 'Please (formal)', 'S''il vous plaît, passez le sel.', 'easy'),
        (p_user_id, v_language_id, v_category_id, 'eau', 'Water', 'Puis-je avoir de l''eau?', 'easy');
    
    WHEN 'German' THEN
      INSERT INTO public.words (user_id, language_id, category_id, word, definition, example_sentence, difficulty) VALUES
        (p_user_id, v_language_id, v_category_id, 'hallo', 'Hello', 'Hallo! Wie geht es dir?', 'easy'),
        (p_user_id, v_language_id, v_category_id, 'auf Wiedersehen', 'Goodbye', 'Auf Wiedersehen, bis morgen!', 'easy'),
        (p_user_id, v_language_id, v_category_id, 'danke', 'Thank you', 'Danke für deine Hilfe.', 'easy'),
        (p_user_id, v_language_id, v_category_id, 'bitte', 'Please/You''re welcome', 'Bitte, reich mir das Salz.', 'easy'),
        (p_user_id, v_language_id, v_category_id, 'Wasser', 'Water', 'Kann ich etwas Wasser haben?', 'easy');
    
    WHEN 'Portuguese' THEN
      INSERT INTO public.words (user_id, language_id, category_id, word, definition, example_sentence, difficulty) VALUES
        (p_user_id, v_language_id, v_category_id, 'olá', 'Hello', 'Olá! Como você está?', 'easy'),
        (p_user_id, v_language_id, v_category_id, 'adeus', 'Goodbye', 'Adeus, até amanhã!', 'easy'),
        (p_user_id, v_language_id, v_category_id, 'obrigado', 'Thank you (said by male)', 'Obrigado pela sua ajuda.', 'easy'),
        (p_user_id, v_language_id, v_category_id, 'por favor', 'Please', 'Por favor, passe o sal.', 'easy'),
        (p_user_id, v_language_id, v_category_id, 'água', 'Water', 'Posso ter um pouco de água?', 'easy');
    
    WHEN 'Italian' THEN
      INSERT INTO public.words (user_id, language_id, category_id, word, definition, example_sentence, difficulty) VALUES
        (p_user_id, v_language_id, v_category_id, 'ciao', 'Hello/Goodbye (informal)', 'Ciao! Come stai?', 'easy'),
        (p_user_id, v_language_id, v_category_id, 'arrivederci', 'Goodbye (formal)', 'Arrivederci, a domani!', 'easy'),
        (p_user_id, v_language_id, v_category_id, 'grazie', 'Thank you', 'Grazie per il tuo aiuto.', 'easy'),
        (p_user_id, v_language_id, v_category_id, 'per favore', 'Please', 'Per favore, passa il sale.', 'easy'),
        (p_user_id, v_language_id, v_category_id, 'acqua', 'Water', 'Posso avere dell''acqua?', 'easy');
  END CASE;

  RETURN v_language_id;
END;
$function$;