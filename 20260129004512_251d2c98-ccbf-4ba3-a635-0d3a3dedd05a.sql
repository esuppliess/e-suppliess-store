-- Create vendor_products table
CREATE TABLE public.vendor_products (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  price NUMERIC NOT NULL,
  original_price NUMERIC NOT NULL,
  features TEXT[] DEFAULT '{}',
  is_best_deal BOOLEAN DEFAULT false,
  beacons_url TEXT NOT NULL,
  image_url TEXT,
  sort_order INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.vendor_products ENABLE ROW LEVEL SECURITY;

-- Public can view active vendor products
CREATE POLICY "Anyone can view active vendor products"
ON public.vendor_products
FOR SELECT
USING (is_active = true);

-- Admins can view all vendor products
CREATE POLICY "Admins can view all vendor products"
ON public.vendor_products
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Admins can insert vendor products
CREATE POLICY "Admins can insert vendor products"
ON public.vendor_products
FOR INSERT
TO authenticated
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Admins can update vendor products
CREATE POLICY "Admins can update vendor products"
ON public.vendor_products
FOR UPDATE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Admins can delete vendor products
CREATE POLICY "Admins can delete vendor products"
ON public.vendor_products
FOR DELETE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Add trigger for updated_at
CREATE TRIGGER update_vendor_products_updated_at
BEFORE UPDATE ON public.vendor_products
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Insert initial vendor products from existing data
INSERT INTO public.vendor_products (title, description, price, original_price, features, is_best_deal, beacons_url, sort_order) VALUES
('Clothing Vendor List', 'Premium clothing vendor contacts for hoodies, jackets, and more.', 25, 50, ARRAY['10+ verified clothing vendors', 'Direct contact information', 'Pricing guides included', 'Quality ratings for each vendor', 'Instant digital delivery'], false, 'https://beacons.ai/e_suppliess', 1),
('Shoe Vendor List', 'Exclusive sneaker and footwear vendor contacts.', 25, 50, ARRAY['8+ verified shoe vendors', 'Jordan, Yeezy, Nike sources', 'Bulk pricing available', 'Authentication tips included', 'Instant digital delivery'], false, 'https://beacons.ai/e_suppliess', 2),
('AirPods & Electronics', 'Tech vendor contacts for electronics and accessories.', 20, 40, ARRAY['5+ verified electronics vendors', 'AirPods, Beats, accessories', 'Wholesale pricing info', 'Shipping guides included', 'Instant digital delivery'], false, 'https://beacons.ai/e_suppliess', 3),
('Cologne Vendor List', 'Fragrance vendor contacts for premium scents.', 20, 40, ARRAY['6+ verified fragrance vendors', 'Designer cologne sources', 'Authenticity verification tips', 'Pricing comparisons', 'Instant digital delivery'], false, 'https://beacons.ai/e_suppliess', 4),
('Bag & Purse Vendors', 'Premium bag and purse vendor contacts.', 25, 50, ARRAY['7+ verified bag vendors', 'Designer bag sources', 'Quality grading system', 'Import guides included', 'Instant digital delivery'], false, 'https://beacons.ai/e_suppliess', 5),
('Full Vendor Bundle', 'Complete access to ALL vendor lists at a massive discount.', 75, 230, ARRAY['ALL 5 vendor lists included', '35+ total verified vendors', 'Lifetime updates', 'Priority support access', 'Bonus: Reselling starter guide', 'Instant digital delivery'], true, 'https://beacons.ai/e_suppliess', 6);