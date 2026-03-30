import { useMemo } from 'react';
import { DbProduct } from './useProducts';

export interface VariantInfo {
  slug: string;
  label: string;
  image: string;
}

/**
 * Build a map of variant_group_id -> VariantInfo[] from a list of products.
 * Products without a variant_group_id are excluded.
 */
export function buildVariantMap(products: DbProduct[] | undefined): Map<string, VariantInfo[]> {
  const map = new Map<string, VariantInfo[]>();
  if (!products) return map;

  for (const p of products) {
    if (!p.variant_group_id) continue;
    const existing = map.get(p.variant_group_id) || [];
    existing.push({
      slug: p.slug,
      label: p.variant_label || p.title,
      image: p.images?.[0] || '',
    });
    map.set(p.variant_group_id, existing);
  }
  return map;
}

/**
 * Get variant info for a specific product from a variant map.
 */
export function getVariantsForProduct(
  product: DbProduct,
  variantMap: Map<string, VariantInfo[]>
): VariantInfo[] | undefined {
  if (!product.variant_group_id) return undefined;
  const variants = variantMap.get(product.variant_group_id);
  return variants && variants.length > 1 ? variants : undefined;
}

/**
 * Hook that returns variant map from a product list.
 */
export function useVariantMap(products: DbProduct[] | undefined) {
  return useMemo(() => buildVariantMap(products), [products]);
}
