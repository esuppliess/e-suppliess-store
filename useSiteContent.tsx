import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface SiteContent {
  id: string;
  // Hero Section
  hero_title: string;
  hero_subtitle: string;
  hero_button_text: string;
  hero_button_link: string;
  hero_secondary_button_text: string;
  hero_secondary_button_link: string;
  hero_images: string[];
  // Featured Collection
  featured_label: string;
  featured_title: string;
  featured_description: string;
  featured_button_text: string;
  featured_button_link: string;
  featured_image: string | null;
  // Lifestyle Images
  lifestyle_images: string[];
  lifestyle_image_links: string[];
  // Vendors CTA
  vendors_label: string;
  vendors_title: string;
  vendors_description: string;
  vendors_button_text: string;
  vendors_image: string | null;
  // Social Links
  instagram_url: string | null;
  tiktok_url: string | null;
  tiktok_url_2: string | null;
  discord_url: string | null;
  updated_at: string;
}

export function useSiteContent() {
  return useQuery({
    queryKey: ['site-content'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('site_content')
        .select('*')
        .limit(1)
        .maybeSingle();
      
      if (error) throw error;
      return data as SiteContent | null;
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

export function useUpdateSiteContent() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<SiteContent> & { id: string }) => {
      const { data, error } = await supabase
        .from('site_content')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['site-content'] });
    },
  });
}
