import { useState } from 'react';
import { ArrowUp, ArrowDown, Pencil, Trash2, Plus, Image as ImageIcon, GripVertical } from 'lucide-react';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { toast } from 'sonner';
import {
  useVendorProductsAdmin,
  useCreateVendorProduct,
  useUpdateVendorProduct,
  useDeleteVendorProduct,
  useReorderVendorProducts,
  DbVendorProduct,
} from '@/hooks/useVendorProducts';
import { supabase } from '@/integrations/supabase/client';

const PLACEHOLDER_IMAGE = '/placeholder.svg';

export default function AdminVendors() {
  const { data: vendors, isLoading } = useVendorProductsAdmin();
  const createMutation = useCreateVendorProduct();
  const updateMutation = useUpdateVendorProduct();
  const deleteMutation = useDeleteVendorProduct();
  const reorderMutation = useReorderVendorProducts();

  const [editingVendor, setEditingVendor] = useState<DbVendorProduct | null>(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [uploadingImageFor, setUploadingImageFor] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    price: 0,
    original_price: 0,
    features: '',
    is_best_deal: false,
    beacons_url: '',
    image_url: '',
    is_active: true,
  });

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      price: 0,
      original_price: 0,
      features: '',
      is_best_deal: false,
      beacons_url: '',
      image_url: '',
      is_active: true,
    });
  };

  const openEditDialog = (vendor: DbVendorProduct) => {
    setEditingVendor(vendor);
    setFormData({
      title: vendor.title,
      description: vendor.description || '',
      price: vendor.price,
      original_price: vendor.original_price,
      features: vendor.features.join('\n'),
      is_best_deal: vendor.is_best_deal,
      beacons_url: vendor.beacons_url,
      image_url: vendor.image_url || '',
      is_active: vendor.is_active,
    });
  };

  const handleSave = async () => {
    const featuresArray = formData.features
      .split('\n')
      .map(f => f.trim())
      .filter(f => f.length > 0);

    const payload = {
      title: formData.title,
      description: formData.description || null,
      price: formData.price,
      original_price: formData.original_price,
      features: featuresArray,
      is_best_deal: formData.is_best_deal,
      beacons_url: formData.beacons_url,
      image_url: formData.image_url || null,
      is_active: formData.is_active,
    };

    try {
      if (editingVendor) {
        await updateMutation.mutateAsync({ id: editingVendor.id, ...payload });
        toast.success('Vendor product updated');
      } else {
        const maxOrder = vendors?.reduce((max, v) => Math.max(max, v.sort_order), 0) || 0;
        await createMutation.mutateAsync({ ...payload, sort_order: maxOrder + 1 });
        toast.success('Vendor product created');
      }
      setEditingVendor(null);
      setIsCreateDialogOpen(false);
      resetForm();
    } catch (error) {
      toast.error('Failed to save vendor product');
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await deleteMutation.mutateAsync(deleteId);
      toast.success('Vendor product deleted');
      setDeleteId(null);
    } catch (error) {
      toast.error('Failed to delete vendor product');
    }
  };

  const handleMoveUp = async (index: number) => {
    if (!vendors || index === 0) return;
    const newOrder = [...vendors];
    [newOrder[index], newOrder[index - 1]] = [newOrder[index - 1], newOrder[index]];
    
    const updates = newOrder.map((v, i) => ({ id: v.id, sort_order: i + 1 }));
    try {
      await reorderMutation.mutateAsync(updates);
      toast.success('Order updated');
    } catch (error) {
      toast.error('Failed to reorder');
    }
  };

  const handleMoveDown = async (index: number) => {
    if (!vendors || index === vendors.length - 1) return;
    const newOrder = [...vendors];
    [newOrder[index], newOrder[index + 1]] = [newOrder[index + 1], newOrder[index]];
    
    const updates = newOrder.map((v, i) => ({ id: v.id, sort_order: i + 1 }));
    try {
      await reorderMutation.mutateAsync(updates);
      toast.success('Order updated');
    } catch (error) {
      toast.error('Failed to reorder');
    }
  };

  const handleImageUpload = async (vendorId: string, file: File) => {
    setUploadingImageFor(vendorId);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `vendor-${vendorId}-${Date.now()}.${fileExt}`;
      const filePath = `vendors/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('product-images')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('product-images')
        .getPublicUrl(filePath);

      await updateMutation.mutateAsync({ id: vendorId, image_url: publicUrl });
      toast.success('Image uploaded');
    } catch (error) {
      toast.error('Failed to upload image');
    } finally {
      setUploadingImageFor(null);
    }
  };

  const handleFormImageUpload = async (file: File) => {
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `vendor-new-${Date.now()}.${fileExt}`;
      const filePath = `vendors/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('product-images')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('product-images')
        .getPublicUrl(filePath);

      setFormData(prev => ({ ...prev, image_url: publicUrl }));
      toast.success('Image uploaded');
    } catch (error) {
      toast.error('Failed to upload image');
    }
  };

  if (isLoading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64">
          <p className="text-muted-foreground">Loading vendors...</p>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Vendor Products</h1>
            <p className="text-sm text-muted-foreground">
              Manage vendor lists shown on the /vendors page
            </p>
          </div>
          <Button onClick={() => { resetForm(); setIsCreateDialogOpen(true); }}>
            <Plus className="h-4 w-4 mr-2" />
            Add Vendor Product
          </Button>
        </div>

        <div className="border border-foreground">
          {vendors?.map((vendor, index) => (
            <div
              key={vendor.id}
              className="flex items-center gap-4 p-4 border-b border-foreground last:border-b-0"
            >
              {/* Reorder buttons */}
              <div className="flex flex-col gap-1">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6"
                  onClick={() => handleMoveUp(index)}
                  disabled={index === 0 || reorderMutation.isPending}
                >
                  <ArrowUp className="h-3 w-3" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6"
                  onClick={() => handleMoveDown(index)}
                  disabled={index === (vendors?.length || 0) - 1 || reorderMutation.isPending}
                >
                  <ArrowDown className="h-3 w-3" />
                </Button>
              </div>

              {/* Image */}
              <div className="relative w-16 h-16 border border-foreground flex-shrink-0 bg-muted">
                <img
                  src={vendor.image_url || PLACEHOLDER_IMAGE}
                  alt={vendor.title}
                  className="w-full h-full object-cover"
                />
                <label className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 hover:opacity-100 transition-opacity cursor-pointer">
                  <ImageIcon className="h-5 w-5 text-white" />
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleImageUpload(vendor.id, file);
                    }}
                    disabled={uploadingImageFor === vendor.id}
                  />
                </label>
                {uploadingImageFor === vendor.id && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                    <span className="text-xs text-white">Uploading...</span>
                  </div>
                )}
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold truncate">{vendor.title}</h3>
                  {vendor.is_best_deal && (
                    <span className="text-xs bg-foreground text-background px-2 py-0.5">
                      Best Deal
                    </span>
                  )}
                  {!vendor.is_active && (
                    <span className="text-xs border border-foreground px-2 py-0.5 text-muted-foreground">
                      Hidden
                    </span>
                  )}
                </div>
                <p className="text-sm text-muted-foreground truncate">{vendor.description}</p>
                <p className="text-sm font-medium mt-1">
                  ${vendor.price} <span className="text-muted-foreground line-through">${vendor.original_price}</span>
                </p>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => openEditDialog(vendor)}
                >
                  <Pencil className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setDeleteId(vendor.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}

          {(!vendors || vendors.length === 0) && (
            <div className="p-8 text-center text-muted-foreground">
              No vendor products yet. Add one to get started.
            </div>
          )}
        </div>
      </div>

      {/* Create/Edit Dialog */}
      <Dialog
        open={isCreateDialogOpen || !!editingVendor}
        onOpenChange={(open) => {
          if (!open) {
            setIsCreateDialogOpen(false);
            setEditingVendor(null);
            resetForm();
          }
        }}
      >
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingVendor ? 'Edit Vendor Product' : 'Add Vendor Product'}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {/* Image */}
            <div>
              <Label>Image</Label>
              <div className="mt-2 flex items-center gap-4">
                <div className="w-24 h-24 border border-foreground bg-muted flex items-center justify-center">
                  {formData.image_url ? (
                    <img
                      src={formData.image_url}
                      alt="Preview"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <ImageIcon className="h-8 w-8 text-muted-foreground" />
                  )}
                </div>
                <div className="flex-1">
                  <Input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleFormImageUpload(file);
                    }}
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Or paste URL:
                  </p>
                  <Input
                    placeholder="https://..."
                    value={formData.image_url}
                    onChange={(e) => setFormData(prev => ({ ...prev, image_url: e.target.value }))}
                    className="mt-1"
                  />
                </div>
              </div>
            </div>

            <div>
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              />
            </div>

            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="price">Price ($)</Label>
                <Input
                  id="price"
                  type="number"
                  value={formData.price}
                  onChange={(e) => setFormData(prev => ({ ...prev, price: parseFloat(e.target.value) || 0 }))}
                />
              </div>
              <div>
                <Label htmlFor="original_price">Original Price ($)</Label>
                <Input
                  id="original_price"
                  type="number"
                  value={formData.original_price}
                  onChange={(e) => setFormData(prev => ({ ...prev, original_price: parseFloat(e.target.value) || 0 }))}
                />
              </div>
            </div>

            <div>
              <Label htmlFor="features">Features (one per line)</Label>
              <Textarea
                id="features"
                rows={5}
                value={formData.features}
                onChange={(e) => setFormData(prev => ({ ...prev, features: e.target.value }))}
                placeholder="10+ verified vendors&#10;Direct contact information&#10;Pricing guides included"
              />
            </div>

            <div>
              <Label htmlFor="beacons_url">Beacons URL</Label>
              <Input
                id="beacons_url"
                value={formData.beacons_url}
                onChange={(e) => setFormData(prev => ({ ...prev, beacons_url: e.target.value }))}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Switch
                  id="is_best_deal"
                  checked={formData.is_best_deal}
                  onCheckedChange={(checked) => setFormData(prev => ({ ...prev, is_best_deal: checked }))}
                />
                <Label htmlFor="is_best_deal">Mark as Best Deal</Label>
              </div>
              <div className="flex items-center gap-2">
                <Switch
                  id="is_active"
                  checked={formData.is_active}
                  onCheckedChange={(checked) => setFormData(prev => ({ ...prev, is_active: checked }))}
                />
                <Label htmlFor="is_active">Active</Label>
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-2">
            <Button
              variant="outline"
              onClick={() => {
                setIsCreateDialogOpen(false);
                setEditingVendor(null);
                resetForm();
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              disabled={createMutation.isPending || updateMutation.isPending}
            >
              {createMutation.isPending || updateMutation.isPending ? 'Saving...' : 'Save'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Vendor Product?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. The vendor product will be permanently removed.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AdminLayout>
  );
}
