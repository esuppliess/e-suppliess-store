-- Create categories table to replace the enum
CREATE TABLE public.categories (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL,
  slug text NOT NULL UNIQUE,
  display_name text NOT NULL,
  is_active boolean NOT NULL DEFAULT true,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;

-- Anyone can view active categories
CREATE POLICY "Anyone can view active categories"
ON public.categories
FOR SELECT
USING (is_active = true);

-- Admins can view all categories
CREATE POLICY "Admins can view all categories"
ON public.categories
FOR SELECT
USING (has_role(auth.uid(), 'admin'));

-- Admins can insert categories
CREATE POLICY "Admins can insert categories"
ON public.categories
FOR INSERT
WITH CHECK (has_role(auth.uid(), 'admin'));

-- Admins can update categories
CREATE POLICY "Admins can update categories"
ON public.categories
FOR UPDATE
USING (has_role(auth.uid(), 'admin'));

-- Admins can delete categories
CREATE POLICY "Admins can delete categories"
ON public.categories
FOR DELETE
USING (has_role(auth.uid(), 'admin'));

-- Seed with existing enum values
INSERT INTO public.categories (name, slug, display_name, sort_order) VALUES
  ('hoodies', 'hoodies', 'Hoodies', 1),
  ('jackets', 'jackets', 'Jackets', 2),
  ('shoes', 'shoes', 'Shoes', 3),
  ('bags', 'bags', 'Bags', 4),
  ('scarves', 'scarves', 'Scarves', 5),
  ('fragrance', 'fragrance', 'Fragrance', 6),
  ('electronics', 'electronics', 'Electronics', 7),
  ('accessories', 'accessories', 'Accessories', 8);

-- Add category_id to products table (will migrate data next)
ALTER TABLE public.products ADD COLUMN category_id uuid REFERENCES public.categories(id);

-- Migrate existing product categories to category_id
UPDATE public.products p
SET category_id = c.id
FROM public.categories c
WHERE p.category::text = c.slug;

-- Update subcategories to reference categories table
ALTER TABLE public.subcategories ADD COLUMN category_id uuid REFERENCES public.categories(id);

-- Migrate existing subcategory categories
UPDATE public.subcategories s
SET category_id = c.id
FROM public.categories c
WHERE s.category::text = c.slug;

-- Add trigger for updated_at
CREATE TRIGGER update_categories_updated_at
BEFORE UPDATE ON public.categories
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();