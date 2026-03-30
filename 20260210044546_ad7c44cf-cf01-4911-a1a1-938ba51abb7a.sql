
-- Create inventory reservations table
CREATE TABLE public.inventory_reservations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  size TEXT NOT NULL,
  quantity INTEGER NOT NULL CHECK (quantity > 0),
  stripe_session_id TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'completed', 'released')),
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Index for fast lookups
CREATE INDEX idx_inventory_reservations_variant ON public.inventory_reservations (product_id, size, status);
CREATE INDEX idx_inventory_reservations_session ON public.inventory_reservations (stripe_session_id);
CREATE INDEX idx_inventory_reservations_expires ON public.inventory_reservations (expires_at) WHERE status = 'active';

-- Enable RLS (edge functions use service_role_key which bypasses RLS)
ALTER TABLE public.inventory_reservations ENABLE ROW LEVEL SECURITY;

-- No public access - only service role (edge functions) should touch this table
-- Admins can view for debugging
CREATE POLICY "Admins can view reservations"
ON public.inventory_reservations
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'::app_role));

-- Function: atomically reserve inventory for a single variant
CREATE OR REPLACE FUNCTION public.reserve_inventory(
  p_product_id UUID,
  p_size TEXT,
  p_quantity INTEGER,
  p_stripe_session_id TEXT,
  p_expires_at TIMESTAMP WITH TIME ZONE
) RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  current_stock INTEGER := 0;
  reserved_stock INTEGER := 0;
  size_data JSONB;
BEGIN
  -- Lock the product row
  SELECT sizes INTO size_data FROM products WHERE id = p_product_id FOR UPDATE;
  
  IF size_data IS NULL THEN
    RETURN FALSE;
  END IF;
  
  -- Find stock for this size
  FOR i IN 0..jsonb_array_length(size_data) - 1 LOOP
    IF size_data->i->>'size' = p_size THEN
      current_stock := (size_data->i->>'quantity')::INTEGER;
      EXIT;
    END IF;
  END LOOP;
  
  -- Get active (non-expired) reservations for this variant
  SELECT COALESCE(SUM(quantity), 0) INTO reserved_stock
  FROM inventory_reservations
  WHERE product_id = p_product_id
    AND size = p_size
    AND status = 'active'
    AND expires_at > now();
  
  -- Check availability
  IF (current_stock - reserved_stock) < p_quantity THEN
    RETURN FALSE;
  END IF;
  
  -- Create reservation
  INSERT INTO inventory_reservations (product_id, size, quantity, stripe_session_id, expires_at)
  VALUES (p_product_id, p_size, p_quantity, p_stripe_session_id, p_expires_at);
  
  RETURN TRUE;
END;
$$;

-- Function: finalize reservation (decrement actual stock after payment)
CREATE OR REPLACE FUNCTION public.finalize_reservation(p_stripe_session_id TEXT)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  res RECORD;
  size_data JSONB;
  new_sizes JSONB;
  current_qty INTEGER;
BEGIN
  FOR res IN
    SELECT * FROM inventory_reservations
    WHERE stripe_session_id = p_stripe_session_id AND status = 'active'
  LOOP
    -- Lock and get product sizes
    SELECT sizes INTO size_data FROM products WHERE id = res.product_id FOR UPDATE;
    
    IF size_data IS NULL THEN CONTINUE; END IF;
    
    -- Rebuild sizes array with decremented quantity
    new_sizes := '[]'::JSONB;
    FOR i IN 0..jsonb_array_length(size_data) - 1 LOOP
      IF size_data->i->>'size' = res.size THEN
        current_qty := GREATEST((size_data->i->>'quantity')::INTEGER - res.quantity, 0);
        new_sizes := new_sizes || jsonb_build_object('size', size_data->i->>'size', 'quantity', current_qty);
      ELSE
        new_sizes := new_sizes || size_data->i;
      END IF;
    END LOOP;
    
    -- Update product stock
    UPDATE products
    SET sizes = new_sizes,
        inventory_count = (SELECT COALESCE(SUM((elem->>'quantity')::INTEGER), 0) FROM jsonb_array_elements(new_sizes) AS elem)
    WHERE id = res.product_id;
    
    -- Mark reservation completed
    UPDATE inventory_reservations SET status = 'completed' WHERE id = res.id;
  END LOOP;
  
  RETURN TRUE;
END;
$$;

-- Function: release reservation (on payment failure/expiry)
CREATE OR REPLACE FUNCTION public.release_reservation(p_stripe_session_id TEXT)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  UPDATE inventory_reservations
  SET status = 'released'
  WHERE stripe_session_id = p_stripe_session_id AND status = 'active';
  
  RETURN TRUE;
END;
$$;

-- Function: get available stock for a variant (stock minus active reservations)
CREATE OR REPLACE FUNCTION public.get_available_stock(p_product_id UUID, p_size TEXT)
RETURNS INTEGER
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  current_stock INTEGER := 0;
  reserved_stock INTEGER := 0;
  size_data JSONB;
BEGIN
  SELECT sizes INTO size_data FROM products WHERE id = p_product_id;
  
  IF size_data IS NULL THEN RETURN 0; END IF;
  
  FOR i IN 0..jsonb_array_length(size_data) - 1 LOOP
    IF size_data->i->>'size' = p_size THEN
      current_stock := (size_data->i->>'quantity')::INTEGER;
      EXIT;
    END IF;
  END LOOP;
  
  SELECT COALESCE(SUM(quantity), 0) INTO reserved_stock
  FROM inventory_reservations
  WHERE product_id = p_product_id
    AND size = p_size
    AND status = 'active'
    AND expires_at > now();
  
  RETURN GREATEST(current_stock - reserved_stock, 0);
END;
$$;

-- Auto-cleanup: release expired reservations periodically
-- (Will also be checked inline during reserve_inventory since we filter by expires_at > now())
CREATE OR REPLACE FUNCTION public.cleanup_expired_reservations()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  UPDATE inventory_reservations
  SET status = 'released'
  WHERE status = 'active' AND expires_at <= now();
END;
$$;
