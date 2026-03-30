import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { Database } from '@/integrations/supabase/types';

type ProductCategory = Database['public']['Enums']['product_category'];

export interface Subcategory {
  id: string;
  name: string;
  slug: string;
  category: ProductCategory;
  category_id: string | null;
  is_active: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export interface SubcategoryInsert {
  name: string;
  slug: string;
  category: ProductCategory;
  category_id?: string | null;
  is_active?: boolean;
  sort_order?: number;
}

export interface SubcategoryUpdate extends Partial<SubcategoryInsert> {
  id: string;
}

// Fetch all subcategories (admin view)
export function useAllSubcategories() {
  return useQuery({
    queryKey: ['subcategories', 'all'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('subcategories')
        .select('*')
        .order('category', { ascending: true })
        .order('sort_order', { ascending: true })
        .order('name', { ascending: true });

      if (error) throw error;
      return data as Subcategory[];
    },
  });
}

// Fetch active subcategories (public view)
export function useSubcategories() {
  return useQuery({
    queryKey: ['subcategories', 'active'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('subcategories')
        .select('*')
        .eq('is_active', true)
        .order('sort_order', { ascending: true })
        .order('name', { ascending: true });

      if (error) throw error;
      return data as Subcategory[];
    },
  });
}

// Fetch subcategories by category (using category_id or legacy enum)
export function useSubcategoriesByCategory(categoryId: string | null) {
  return useQuery({
    queryKey: ['subcategories', 'by-category', categoryId],
    queryFn: async () => {
      if (!categoryId) return [];
      
      const { data, error } = await supabase
        .from('subcategories')
        .select('*')
        .eq('category_id', categoryId)
        .eq('is_active', true)
        .order('sort_order', { ascending: true })
        .order('name', { ascending: true });

      if (error) throw error;
      return data as Subcategory[];
    },
    enabled: !!categoryId,
  });
}

// Create subcategory
export function useCreateSubcategory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (subcategory: SubcategoryInsert) => {
      const { data, error } = await supabase
        .from('subcategories')
        .insert(subcategory)
        .select()
        .single();

      if (error) throw error;
      return data as Subcategory;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subcategories'] });
    },
  });
}

// Update subcategory
export function useUpdateSubcategory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...updates }: SubcategoryUpdate) => {
      const { data, error } = await supabase
        .from('subcategories')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data as Subcategory;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subcategories'] });
    },
  });
}

// Delete subcategory
export function useDeleteSubcategory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('subcategories')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subcategories'] });
    },
  });
}
