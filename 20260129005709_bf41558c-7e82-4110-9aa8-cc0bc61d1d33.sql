-- Create a table for all editable site content
CREATE TABLE public.site_content (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Hero Section
  hero_title text NOT NULL DEFAULT 'Curated Stock. Premium Sourcing.',
  hero_subtitle text NOT NULL DEFAULT 'Built for serious buyers.',
  hero_button_text text NOT NULL DEFAULT 'Shop Stock',
  hero_button_link text NOT NULL DEFAULT '/shop',
  hero_secondary_button_text text NOT NULL DEFAULT 'View Proof',
  hero_secondary_button_link text NOT NULL DEFAULT '/vouches',
  hero_images text[] DEFAULT ARRAY[
    'https://images.unsplash.com/photo-1523398002811-999ca8dec234?w=800&h=1000&fit=crop',
    'https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=800&h=1000&fit=crop',
    'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&h=1000&fit=crop'
  ],
  
  -- Featured Collection Section
  featured_label text NOT NULL DEFAULT 'Featured Collection',
  featured_title text NOT NULL DEFAULT 'Premium Hoodies',
  featured_description text NOT NULL DEFAULT 'Hand-picked selection of the finest hoodies. From essentials to rare finds, all authenticated and ready to ship.',
  featured_button_text text NOT NULL DEFAULT 'Shop Hoodies',
  featured_button_link text NOT NULL DEFAULT '/shop?category=hoodies',
  featured_image text DEFAULT 'https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=800&h=800&fit=crop',
  
  -- Shop the Look Section
  lifestyle_images text[] DEFAULT ARRAY[
    'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=600&h=400&fit=crop',
    'https://images.unsplash.com/photo-1509631179647-0177331693ae?w=600&h=400&fit=crop',
    'https://images.unsplash.com/photo-1487222477894-8943e31ef7b2?w=600&h=400&fit=crop',
    'https://images.unsplash.com/photo-1529139574466-a303027c1d8b?w=600&h=400&fit=crop'
  ],
  
  -- Vendors CTA Section
  vendors_label text NOT NULL DEFAULT 'Exclusive Access',
  vendors_title text NOT NULL DEFAULT 'Want the Vendors?',
  vendors_description text NOT NULL DEFAULT 'Get access to our premium vendor lists and start sourcing like a pro.',
  vendors_button_text text NOT NULL DEFAULT 'View Vendor Lists',
  vendors_image text DEFAULT 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1200&h=600&fit=crop',
  
  -- Social Links
  instagram_url text DEFAULT 'https://instagram.com/e_suppliess',
  tiktok_url text DEFAULT 'https://tiktok.com/@e_suppliess',
  tiktok_url_2 text DEFAULT 'https://tiktok.com/@e_suppliess2',
  discord_url text DEFAULT '#',
  
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.site_content ENABLE ROW LEVEL SECURITY;

-- Anyone can view site content
CREATE POLICY "Anyone can view site content"
ON public.site_content
FOR SELECT
USING (true);

-- Admins can update site content
CREATE POLICY "Admins can update site content"
ON public.site_content
FOR UPDATE
USING (has_role(auth.uid(), 'admin'::app_role));

-- Admins can insert site content
CREATE POLICY "Admins can insert site content"
ON public.site_content
FOR INSERT
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Create trigger for updated_at
CREATE TRIGGER update_site_content_updated_at
BEFORE UPDATE ON public.site_content
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Insert default row
INSERT INTO public.site_content (id) VALUES (gen_random_uuid());