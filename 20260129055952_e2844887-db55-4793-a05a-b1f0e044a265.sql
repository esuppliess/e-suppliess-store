-- Add sort_order and is_best_seller columns to products table
ALTER TABLE public.products 
ADD COLUMN sort_order integer NOT NULL DEFAULT 0,
ADD COLUMN is_best_seller boolean NOT NULL DEFAULT false;

-- Create index for efficient sorting
CREATE INDEX idx_products_sort_order ON public.products(sort_order);
CREATE INDEX idx_products_best_seller ON public.products(is_best_seller) WHERE is_best_seller = true;