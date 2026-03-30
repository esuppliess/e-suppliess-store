import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface DbVendorProduct {
  id: string;
  title: string;
  description: string | null;
  price: number;
  original_price: number;
  features: string[];
  is_best_deal: boolean;
  beacons_url: string;
  image_url: string | null;
  sort_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export function useVendorProducts() {
  return useQuery({
    queryKey: ['vendor-products'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('vendor_products')
        .select('*')
        .order('sort_order', { ascending: true });
      
      if (error) throw error;
      return data as DbVendorProduct[];
    },
  });
}

export function useVendorProductsAdmin() {
  return useQuery({
    queryKey: ['vendor-products-admin'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('vendor_products')
        .select('*')
        .order('sort_order', { ascending: true });
      
      if (error) throw error;
      return data as DbVendorProduct[];
    },
  });
}

export function useCreateVendorProduct() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (product: Omit<DbVendorProduct, 'id' | 'created_at' | 'updated_at'>) => {
      const { data, error } = await supabase
        .from('vendor_products')
        .insert(product)
        .select()
        .single();
      
      if (error) throw error;
      return data as DbVendorProduct;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vendor-products'] });
      queryClient.invalidateQueries({ queryKey: ['vendor-products-admin'] });
    },
  });
}

export function useUpdateVendorProduct() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<DbVendorProduct> & { id: string }) => {
      const { data, error } = await supabase
        .from('vendor_products')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data as DbVendorProduct;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vendor-products'] });
      queryClient.invalidateQueries({ queryKey: ['vendor-products-admin'] });
    },
  });
}

export function useDeleteVendorProduct() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('vendor_products')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vendor-products'] });
      queryClient.invalidateQueries({ queryKey: ['vendor-products-admin'] });
    },
  });
}

export function useReorderVendorProducts() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (products: { id: string; sort_order: number }[]) => {
      const promises = products.map(({ id, sort_order }) =>
        supabase
          .from('vendor_products')
          .update({ sort_order })
          .eq('id', id)
      );
      
      const results = await Promise.all(promises);
      const errors = results.filter(r => r.error);
      if (errors.length > 0) throw errors[0].error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vendor-products'] });
      queryClient.invalidateQueries({ queryKey: ['vendor-products-admin'] });
    },
  });
}
