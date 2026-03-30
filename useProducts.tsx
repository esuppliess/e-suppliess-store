import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface SizeInventory {
  size: string;
  quantity: number;
}

export interface DbProduct {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  price: number;
  compare_at_price: number | null;
  category: 'hoodies' | 'jackets' | 'shoes' | 'bags' | 'scarves' | 'fragrance' | 'electronics' | 'accessories';
  brand: string;
  condition: 'new' | 'like-new' | 'good' | 'fair';
  sizes: SizeInventory[];
  images: string[];
  inventory_count: number;
  is_active: boolean;
  badge: string | null;
  subcategory_id: string | null;
  sort_order: number;
  is_best_seller: boolean;
  variant_group_id: string | null;
  variant_label: string | null;
  created_at: string;
  updated_at: string;
}

export interface ProductInsert {
  title: string;
  slug: string;
  description?: string | null;
  price: number;
  compare_at_price?: number | null;
  category: DbProduct['category'];
  brand: string;
  condition: DbProduct['condition'];
  sizes?: SizeInventory[];
  images?: string[];
  inventory_count?: number;
  is_active?: boolean;
  badge?: string | null;
  subcategory_id?: string | null;
  sort_order?: number;
  is_best_seller?: boolean;
  variant_group_id?: string | null;
  variant_label?: string | null;
}

export interface ProductUpdate extends Partial<ProductInsert> {
  id: string;
}

// Helper to map raw DB data to typed DbProduct
function mapToDbProduct(raw: any): DbProduct {
  return {
    ...raw,
    sizes: (raw.sizes || []) as SizeInventory[],
  };
}

// Fetch all active products (public)
export function useActiveProducts() {
  return useQuery({
    queryKey: ['products', 'active'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return (data || []).map(mapToDbProduct);
    },
  });
}

// Fetch all products (admin)
export function useAllProducts() {
  return useQuery({
    queryKey: ['products', 'all'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('sort_order', { ascending: true })
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return (data || []).map(mapToDbProduct);
    },
  });
}

// Fetch single product by slug
export function useProductBySlug(slug: string) {
  return useQuery({
    queryKey: ['products', 'slug', slug],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('slug', slug)
        .maybeSingle();
      
      if (error) throw error;
      return data ? mapToDbProduct(data) : null;
    },
    enabled: !!slug,
  });
}

// Create product
export function useCreateProduct() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (product: ProductInsert) => {
      const { data, error } = await supabase
        .from('products')
        .insert({
          ...product,
          sizes: product.sizes as any,
        })
        .select()
        .single();
      
      if (error) throw error;
      return mapToDbProduct(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
    },
  });
}

// Update product
export function useUpdateProduct() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, ...updates }: ProductUpdate) => {
      const { data, error } = await supabase
        .from('products')
        .update({
          ...updates,
          sizes: updates.sizes as any,
        })
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return mapToDbProduct(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
    },
  });
}

// Delete product
export function useDeleteProduct() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
    },
  });
}

// Update product sizes/inventory quickly
export function useQuickUpdateInventory() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, sizes }: { id: string; sizes: SizeInventory[] }) => {
      const inventory_count = sizes.reduce((sum, s) => sum + s.quantity, 0);
      const { error } = await supabase
        .from('products')
        .update({ sizes: sizes as any, inventory_count })
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
    },
  });
}

// Bulk update product order
export function useBulkUpdateOrder() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (updates: { id: string; sort_order: number }[]) => {
      // Update each product's sort order
      for (const update of updates) {
        const { error } = await supabase
          .from('products')
          .update({ sort_order: update.sort_order })
          .eq('id', update.id);
        
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
    },
  });
}

// Toggle best seller status
export function useToggleBestSeller() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, is_best_seller }: { id: string; is_best_seller: boolean }) => {
      const { error } = await supabase
        .from('products')
        .update({ is_best_seller })
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
    },
  });
}
