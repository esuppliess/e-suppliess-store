import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface OrderItem {
  productId: string;
  title: string;
  brand: string;
  size: string;
  quantity: number;
  price: number;
  image?: string;
  deliveryOption?: string;
}

export interface ShippingAddress {
  line1?: string;
  line2?: string;
  city?: string;
  state?: string;
  postal_code?: string;
  country?: string;
}

export interface DbOrder {
  id: string;
  stripe_session_id: string | null;
  customer_email: string;
  customer_name: string | null;
  items: unknown;
  total: number;
  delivery_option: 'gta-meetup' | 'canada-shipping' | 'worldwide-agent';
  shipping_address: unknown;
  status: 'pending' | 'processing' | 'shipped' | 'completed' | 'cancelled';
  notes: string | null;
  tracking_number: string | null;
  created_at: string;
  updated_at: string;
}

export function useOrders() {
  return useQuery({
    queryKey: ['orders'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return (data as unknown as DbOrder[]);
    },
  });
}

export function useUpdateOrderStatus() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, status, notes }: { id: string; status: DbOrder['status']; notes?: string }) => {
      const updates: Record<string, unknown> = { status };
      if (notes !== undefined) updates.notes = notes;
      
      const { data, error } = await supabase
        .from('orders')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data as unknown as DbOrder;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
    },
  });
}

export function useUpdateTrackingNumber() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, trackingNumber }: { id: string; trackingNumber: string }) => {
      const { data, error } = await supabase
        .from('orders')
        .update({ tracking_number: trackingNumber, status: 'shipped' as const } as Record<string, unknown>)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data as unknown as DbOrder;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
    },
  });
}
