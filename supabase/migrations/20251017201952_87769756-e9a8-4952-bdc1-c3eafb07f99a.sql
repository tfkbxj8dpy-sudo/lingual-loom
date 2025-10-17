-- Delete all starter words from Basic Vocabulary category
DELETE FROM public.words
WHERE category_id IN (
  SELECT id FROM public.categories WHERE name = 'Basic Vocabulary'
);