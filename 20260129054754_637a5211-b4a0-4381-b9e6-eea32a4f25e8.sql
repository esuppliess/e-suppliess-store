-- Migrate sizes from text[] to jsonb for per-size inventory
-- New format: [{size: string, quantity: number}, ...]

-- First, convert existing sizes data to new format
-- Each existing size will get a default quantity of inventory_count divided by number of sizes

-- Step 1: Add a new temporary column
ALTER TABLE public.products ADD COLUMN sizes_inventory jsonb DEFAULT '[]'::jsonb;

-- Step 2: Migrate existing data
UPDATE public.products
SET sizes_inventory = (
  SELECT COALESCE(
    jsonb_agg(
      jsonb_build_object(
        'size', s,
        'quantity', GREATEST(1, FLOOR(inventory_count::numeric / GREATEST(array_length(sizes, 1), 1)))
      )
    ),
    '[]'::jsonb
  )
  FROM unnest(sizes) AS s
)
WHERE sizes IS NOT NULL AND array_length(sizes, 1) > 0;

-- Step 3: Drop the old sizes column
ALTER TABLE public.products DROP COLUMN sizes;

-- Step 4: Rename the new column to sizes
ALTER TABLE public.products RENAME COLUMN sizes_inventory TO sizes;

-- Step 5: Update default
ALTER TABLE public.products ALTER COLUMN sizes SET DEFAULT '[]'::jsonb;