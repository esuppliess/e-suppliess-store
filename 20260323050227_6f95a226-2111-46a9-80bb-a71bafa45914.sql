ALTER TABLE public.products ADD COLUMN variant_group_id uuid DEFAULT NULL;
ALTER TABLE public.products ADD COLUMN variant_label text DEFAULT NULL;
CREATE INDEX idx_products_variant_group ON public.products(variant_group_id) WHERE variant_group_id IS NOT NULL;