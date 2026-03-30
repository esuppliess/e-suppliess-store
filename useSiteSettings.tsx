import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface SiteSettings {
  id: string;
  logo_url: string | null;
  updated_at: string;
}

export function useSiteSettings() {
  return useQuery({
    queryKey: ['site-settings'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('site_settings')
        .select('*')
        .limit(1)
        .maybeSingle();
      
      if (error) throw error;
      return data as SiteSettings | null;
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

export function useUpdateSiteSettings() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, logo_url }: { id: string; logo_url: string | null }) => {
      const { data, error } = await supabase
        .from('site_settings')
        .update({ logo_url })
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['site-settings'] });
    },
  });
}
