import { useState } from 'react';
import { Search, ChevronDown, Package, Truck, Send, Copy, Check, MapPin, Mail, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { useOrders, useUpdateOrderStatus, useUpdateTrackingNumber, DbOrder, OrderItem, ShippingAddress } from '@/hooks/useOrders';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { supabase } from '@/integrations/supabase/client';

const ORDER_STATUSES: DbOrder['status'][] = ['pending', 'processing', 'shipped', 'completed', 'cancelled'];

const STATUS_COLORS: Record<DbOrder['status'], string> = {
  pending: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-500',
  processing: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-500',
  shipped: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-500',
  completed: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-500',
  cancelled: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-500',
};

function parseItems(items: unknown): OrderItem[] {
  if (Array.isArray(items)) return items as OrderItem[];
  return [];
}

function parseAddress(addr: unknown): ShippingAddress | null {
  if (!addr || typeof addr !== 'object') return null;
  return addr as ShippingAddress;
}

export default function AdminOrders() {
  const { data: orders, isLoading } = useOrders();
  const updateStatus = useUpdateOrderStatus();
  const updateTracking = useUpdateTrackingNumber();
  const { toast } = useToast();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedOrder, setSelectedOrder] = useState<DbOrder | null>(null);
  const [trackingInput, setTrackingInput] = useState('');
  const [isSendingTracking, setIsSendingTracking] = useState(false);
  const [copiedId, setCopiedId] = useState(false);

  const filteredOrders = orders?.filter((order) => {
    const query = searchQuery.toLowerCase();
    return (
      order.customer_email.toLowerCase().includes(query) ||
      order.id.toLowerCase().includes(query) ||
      (order.customer_name?.toLowerCase().includes(query))
    );
  }) || [];

  const handleStatusChange = async (orderId: string, newStatus: DbOrder['status']) => {
    try {
      await updateStatus.mutateAsync({ id: orderId, status: newStatus });
      if (selectedOrder?.id === orderId) {
        setSelectedOrder(prev => prev ? { ...prev, status: newStatus } : null);
      }
      toast({ title: `Order status updated to ${newStatus}` });
    } catch (error: any) {
      toast({ title: 'Failed to update status', description: error.message, variant: 'destructive' });
    }
  };

  const handleSaveTracking = async () => {
    if (!selectedOrder || !trackingInput.trim()) return;
    setIsSendingTracking(true);
    try {
      // Save tracking number and update status to shipped
      await updateTracking.mutateAsync({ id: selectedOrder.id, trackingNumber: trackingInput.trim() });
      
      // Send tracking email
      const { error } = await supabase.functions.invoke('send-tracking-email', {
        body: { orderId: selectedOrder.id, trackingNumber: trackingInput.trim() },
      });
      
      if (error) {
        console.error('Email send error:', error);
        toast({ title: 'Tracking saved', description: 'Tracking number saved but email could not be sent.', variant: 'default' });
      } else {
        toast({ title: 'Tracking saved & email sent', description: `Tracking email sent to ${selectedOrder.customer_email}` });
      }
      
      setSelectedOrder(prev => prev ? { ...prev, tracking_number: trackingInput.trim(), status: 'shipped' } : null);
      setTrackingInput('');
    } catch (error: any) {
      toast({ title: 'Failed to save tracking', description: error.message, variant: 'destructive' });
    } finally {
      setIsSendingTracking(false);
    }
  };

  const copyOrderId = () => {
    if (!selectedOrder) return;
    navigator.clipboard.writeText(selectedOrder.id);
    setCopiedId(true);
    setTimeout(() => setCopiedId(false), 2000);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit',
    });
  };

  const formatDeliveryOption = (option: DbOrder['delivery_option']) => {
    switch (option) {
      case 'gta-meetup': return 'GTA Meetup';
      case 'canada-shipping': return 'Canada Shipping';
      case 'worldwide-agent': return 'Worldwide Agent';
      default: return option;
    }
  };

  const openOrderDetail = (order: DbOrder) => {
    setSelectedOrder(order);
    setTrackingInput(order.tracking_number || '');
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold mb-1">Orders</h1>
          <p className="text-muted-foreground">{orders?.length || 0} total orders</p>
        </div>

        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by email, name, or order ID..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        {isLoading ? (
          <p className="text-muted-foreground">Loading orders...</p>
        ) : filteredOrders.length === 0 ? (
          <div className="text-center py-12 border border-dashed border-border rounded-lg">
            <Package className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">
              {searchQuery ? 'No orders match your search.' : 'No orders yet.'}
            </p>
          </div>
        ) : (
          <div className="border border-border rounded-lg overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Order</TableHead>
                  <TableHead className="hidden md:table-cell">Customer</TableHead>
                  <TableHead className="hidden lg:table-cell">Delivery</TableHead>
                  <TableHead className="hidden md:table-cell">Total</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="hidden sm:table-cell">Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredOrders.map((order) => (
                  <TableRow key={order.id} className="cursor-pointer" onClick={() => openOrderDetail(order)}>
                    <TableCell>
                      <p className="font-mono text-xs truncate max-w-[100px]">{order.id.slice(0, 8)}...</p>
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                      <div>
                        {order.customer_name && <p className="font-medium text-sm">{order.customer_name}</p>}
                        <p className="truncate max-w-[200px] text-sm text-muted-foreground">{order.customer_email}</p>
                      </div>
                    </TableCell>
                    <TableCell className="hidden lg:table-cell">{formatDeliveryOption(order.delivery_option)}</TableCell>
                    <TableCell className="hidden md:table-cell font-medium">${Number(order.total).toFixed(2)}</TableCell>
                    <TableCell onClick={(e) => e.stopPropagation()}>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm" className={cn('gap-1 capitalize font-normal', STATUS_COLORS[order.status])}>
                            {order.status}
                            <ChevronDown className="h-3 w-3" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="start">
                          {ORDER_STATUSES.map((status) => (
                            <DropdownMenuItem key={status} onClick={() => handleStatusChange(order.id, status)} className="capitalize">
                              {status}
                            </DropdownMenuItem>
                          ))}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                    <TableCell className="hidden sm:table-cell text-sm text-muted-foreground">
                      {new Date(order.created_at).toLocaleDateString()}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </div>

      {/* Expanded Order Detail Dialog */}
      <Dialog open={!!selectedOrder} onOpenChange={() => setSelectedOrder(null)}>
        <DialogContent className="bg-background border-border max-w-2xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <div className="flex items-center justify-between">
              <DialogTitle className="text-lg">Order Details</DialogTitle>
              {selectedOrder && (
                <Badge className={cn('capitalize', STATUS_COLORS[selectedOrder.status])}>
                  {selectedOrder.status}
                </Badge>
              )}
            </div>
          </DialogHeader>

          {selectedOrder && (() => {
            const items = parseItems(selectedOrder.items);
            const address = parseAddress(selectedOrder.shipping_address);
            return (
              <div className="space-y-6">
                {/* Order Meta */}
                <div className="flex items-center gap-3 text-sm text-muted-foreground">
                  <button onClick={copyOrderId} className="flex items-center gap-1 font-mono hover:text-foreground transition-colors">
                    {copiedId ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                    {selectedOrder.id.slice(0, 8)}...
                  </button>
                  <span>·</span>
                  <span>{formatDate(selectedOrder.created_at)}</span>
                  <span>·</span>
                  <span className="font-semibold text-foreground">${Number(selectedOrder.total).toFixed(2)} CAD</span>
                </div>

                <Separator />

                {/* Customer & Shipping - Side by Side */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Customer Info */}
                  <div className="space-y-3">
                    <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                      <User className="h-3.5 w-3.5" /> Customer
                    </h3>
                    <div className="space-y-2 text-sm">
                      {selectedOrder.customer_name && (
                        <p className="font-medium">{selectedOrder.customer_name}</p>
                      )}
                      <p className="flex items-center gap-2 text-muted-foreground">
                        <Mail className="h-3.5 w-3.5" />
                        {selectedOrder.customer_email}
                      </p>
                      <p className="flex items-center gap-2">
                        <Truck className="h-3.5 w-3.5 text-muted-foreground" />
                        {formatDeliveryOption(selectedOrder.delivery_option)}
                      </p>
                    </div>
                  </div>

                  {/* Shipping Address */}
                  <div className="space-y-3">
                    <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                      <MapPin className="h-3.5 w-3.5" /> Shipping Address
                    </h3>
                    {address ? (
                      <div className="text-sm space-y-0.5">
                        {address.line1 && <p>{address.line1}</p>}
                        {address.line2 && <p>{address.line2}</p>}
                        <p>
                          {[address.city, address.state, address.postal_code].filter(Boolean).join(', ')}
                        </p>
                        {address.country && <p className="text-muted-foreground">{address.country}</p>}
                      </div>
                    ) : (
                      <p className="text-sm text-muted-foreground italic">
                        {selectedOrder.delivery_option === 'gta-meetup' ? 'GTA Meetup — no shipping address' : 'No address provided'}
                      </p>
                    )}
                  </div>
                </div>

                <Separator />

                {/* Items */}
                <div className="space-y-3">
                  <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                    <Package className="h-3.5 w-3.5" /> Items ({items.length})
                  </h3>
                  <div className="space-y-3">
                    {items.length > 0 ? items.map((item, idx) => (
                      <div key={idx} className="flex items-center gap-3 p-3 bg-accent/50 rounded-lg">
                        {item.image && (
                          <img
                            src={item.image}
                            alt={item.title}
                            className="w-14 h-14 rounded-md object-cover flex-shrink-0"
                          />
                        )}
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm truncate">{item.title || 'Product'}</p>
                          <p className="text-xs text-muted-foreground">
                            {item.brand && `${item.brand} · `}Size: {item.size || 'N/A'} · Qty: {item.quantity || 1}
                          </p>
                        </div>
                        <p className="font-semibold text-sm flex-shrink-0">${Number(item.price || 0).toFixed(2)}</p>
                      </div>
                    )) : (
                      <p className="text-sm text-muted-foreground italic">No item details available</p>
                    )}
                  </div>
                </div>

                <Separator />

                {/* Tracking Number */}
                <div className="space-y-3">
                  <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                    <Truck className="h-3.5 w-3.5" /> Tracking
                  </h3>

                  {selectedOrder.tracking_number ? (
                    <div className="flex items-center gap-3 p-3 bg-accent/50 rounded-lg">
                      <div className="flex-1">
                        <p className="text-xs text-muted-foreground mb-0.5">Tracking Number</p>
                        <p className="font-mono font-semibold tracking-wide">{selectedOrder.tracking_number}</p>
                      </div>
                      <Badge className={STATUS_COLORS.shipped}>Shipped</Badge>
                    </div>
                  ) : (
                    <div className="flex gap-2">
                      <Input
                        placeholder="Enter tracking number..."
                        value={trackingInput}
                        onChange={(e) => setTrackingInput(e.target.value)}
                        className="font-mono"
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') handleSaveTracking();
                        }}
                      />
                      <Button
                        onClick={handleSaveTracking}
                        disabled={!trackingInput.trim() || isSendingTracking}
                        size="sm"
                        className="gap-1.5 flex-shrink-0"
                      >
                        <Send className="h-3.5 w-3.5" />
                        {isSendingTracking ? 'Sending...' : 'Save & Notify'}
                      </Button>
                    </div>
                  )}
                </div>

                {/* Notes */}
                {selectedOrder.notes && (
                  <>
                    <Separator />
                    <div className="space-y-2">
                      <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Notes</h3>
                      <p className="text-sm">{selectedOrder.notes}</p>
                    </div>
                  </>
                )}

                {/* Status Change */}
                <Separator />
                <div className="flex items-center justify-between">
                  <p className="text-sm text-muted-foreground">Change Status</p>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" size="sm" className={cn('gap-1 capitalize', STATUS_COLORS[selectedOrder.status])}>
                        {selectedOrder.status}
                        <ChevronDown className="h-3 w-3" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      {ORDER_STATUSES.map((status) => (
                        <DropdownMenuItem key={status} onClick={() => handleStatusChange(selectedOrder.id, status)} className="capitalize">
                          {status}
                        </DropdownMenuItem>
                      ))}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            );
          })()}
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
}
