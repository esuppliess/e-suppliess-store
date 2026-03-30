import { useState } from 'react';
import { Plus, Search, Edit, Trash2, Eye, EyeOff, Star, GripVertical, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
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
import { AdminLayout } from '@/components/admin/AdminLayout';
import { ProductForm } from '@/components/admin/ProductForm';
import { QuickInventoryEditor } from '@/components/admin/QuickInventoryEditor';
import { 
  useAllProducts, 
  useDeleteProduct, 
  useQuickUpdateInventory,
  useBulkUpdateOrder,
  useToggleBestSeller,
  DbProduct 
} from '@/hooks/useProducts';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

export default function AdminProducts() {
  const { data: products, isLoading } = useAllProducts();
  const deleteProduct = useDeleteProduct();
  const quickUpdateInventory = useQuickUpdateInventory();
  const bulkUpdateOrder = useBulkUpdateOrder();
  const toggleBestSeller = useToggleBestSeller();
  const { toast } = useToast();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<DbProduct | null>(null);
  const [deleteConfirmProduct, setDeleteConfirmProduct] = useState<DbProduct | null>(null);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);

  const filteredProducts = products?.filter((product) => {
    const query = searchQuery.toLowerCase();
    return (
      product.title.toLowerCase().includes(query) ||
      product.brand.toLowerCase().includes(query) ||
      product.category.toLowerCase().includes(query)
    );
  }) || [];

  const handleEdit = (product: DbProduct) => {
    setEditingProduct(product);
    setIsFormOpen(true);
  };

  const handleAddNew = () => {
    setEditingProduct(null);
    setIsFormOpen(true);
  };

  const handleDelete = async () => {
    if (!deleteConfirmProduct) return;
    
    try {
      await deleteProduct.mutateAsync(deleteConfirmProduct.id);
      toast({ title: 'Product deleted successfully' });
    } catch (error: any) {
      toast({
        title: 'Failed to delete product',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setDeleteConfirmProduct(null);
    }
  };

  const handleQuickInventoryUpdate = async (productId: string, sizes: any[]) => {
    try {
      await quickUpdateInventory.mutateAsync({ id: productId, sizes });
      toast({ title: 'Inventory updated' });
    } catch (error: any) {
      toast({
        title: 'Failed to update inventory',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  const handleToggleBestSeller = async (product: DbProduct) => {
    try {
      await toggleBestSeller.mutateAsync({ 
        id: product.id, 
        is_best_seller: !product.is_best_seller 
      });
      toast({ 
        title: product.is_best_seller ? 'Removed from best sellers' : 'Added to best sellers' 
      });
    } catch (error: any) {
      toast({
        title: 'Failed to update product',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  const handleDragStart = (index: number) => {
    setDraggedIndex(index);
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === index) return;
  };

  const handleDrop = async (e: React.DragEvent, dropIndex: number) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === dropIndex || !products) return;

    const reorderedProducts = [...filteredProducts];
    const [draggedProduct] = reorderedProducts.splice(draggedIndex, 1);
    reorderedProducts.splice(dropIndex, 0, draggedProduct);

    // Create updates for new sort order
    const updates = reorderedProducts.map((product, index) => ({
      id: product.id,
      sort_order: index,
    }));

    try {
      await bulkUpdateOrder.mutateAsync(updates);
      toast({ title: 'Product order updated' });
    } catch (error: any) {
      toast({
        title: 'Failed to reorder products',
        description: error.message,
        variant: 'destructive',
      });
    }

    setDraggedIndex(null);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
  };

  // Count low stock products
  const lowStockProducts = products?.filter(p => {
    const lowStockSizes = p.sizes.filter(s => s.quantity > 0 && s.quantity <= 3);
    return lowStockSizes.length > 0;
  }) || [];

  const outOfStockProducts = products?.filter(p => p.inventory_count === 0) || [];

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold mb-1">Products</h1>
            <p className="text-muted-foreground">
              {products?.length || 0} total products
            </p>
          </div>
          <Button onClick={handleAddNew} className="gap-2">
            <Plus className="h-4 w-4" />
            Add Product
          </Button>
        </div>

        {/* Stock Alerts */}
        {(lowStockProducts.length > 0 || outOfStockProducts.length > 0) && (
          <div className="flex flex-wrap gap-3">
            {outOfStockProducts.length > 0 && (
              <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-destructive/10 text-destructive text-sm">
                <AlertTriangle className="h-4 w-4" />
                <span>{outOfStockProducts.length} out of stock</span>
              </div>
            )}
            {lowStockProducts.length > 0 && (
              <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-yellow-100 text-yellow-700 text-sm">
                <AlertTriangle className="h-4 w-4" />
                <span>{lowStockProducts.length} low stock</span>
              </div>
            )}
          </div>
        )}

        {/* Search */}
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search products..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Products Table */}
        {isLoading ? (
          <p className="text-muted-foreground">Loading products...</p>
        ) : filteredProducts.length === 0 ? (
          <div className="text-center py-12 border border-dashed border-border rounded-lg">
            <p className="text-muted-foreground mb-4">
              {searchQuery ? 'No products match your search.' : 'No products yet.'}
            </p>
            {!searchQuery && (
              <Button onClick={handleAddNew} variant="outline">
                <Plus className="h-4 w-4 mr-2" />
                Add Your First Product
              </Button>
            )}
          </div>
        ) : (
          <div className="border border-border rounded-lg overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-10"></TableHead>
                  <TableHead className="w-16">Image</TableHead>
                  <TableHead>Product</TableHead>
                  <TableHead className="hidden md:table-cell">Category</TableHead>
                  <TableHead className="hidden md:table-cell">Price</TableHead>
                  <TableHead>Stock</TableHead>
                  <TableHead className="hidden sm:table-cell">Status</TableHead>
                  <TableHead className="w-28">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredProducts.map((product, index) => (
                  <TableRow 
                    key={product.id}
                    draggable={!searchQuery}
                    onDragStart={() => handleDragStart(index)}
                    onDragOver={(e) => handleDragOver(e, index)}
                    onDrop={(e) => handleDrop(e, index)}
                    onDragEnd={handleDragEnd}
                    className={cn(
                      draggedIndex === index && "opacity-50",
                      !searchQuery && "cursor-move"
                    )}
                  >
                    <TableCell className="px-2">
                      {!searchQuery && (
                        <GripVertical className="h-4 w-4 text-muted-foreground" />
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="h-12 w-12 bg-accent rounded overflow-hidden relative">
                        {product.images[0] ? (
                          <img
                            src={product.images[0]}
                            alt={product.title}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <div className="h-full w-full flex items-center justify-center text-muted-foreground text-xs">
                            No img
                          </div>
                        )}
                        {product.is_best_seller && (
                          <div className="absolute -top-1 -right-1 bg-yellow-400 rounded-full p-0.5">
                            <Star className="h-2.5 w-2.5 fill-current text-yellow-900" />
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium truncate max-w-[200px]">{product.title}</p>
                        <p className="text-xs text-muted-foreground">{product.brand}</p>
                      </div>
                    </TableCell>
                    <TableCell className="hidden md:table-cell capitalize">
                      {product.category}
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                      ${Number(product.price).toFixed(2)}
                    </TableCell>
                    <TableCell>
                      <QuickInventoryEditor
                        sizes={product.sizes}
                        onSave={(sizes) => handleQuickInventoryUpdate(product.id, sizes)}
                        isLoading={quickUpdateInventory.isPending}
                      />
                    </TableCell>
                    <TableCell className="hidden sm:table-cell">
                      <div className="flex items-center gap-2">
                        {product.is_active ? (
                          <Badge variant="outline" className="gap-1">
                            <Eye className="h-3 w-3" />
                            Active
                          </Badge>
                        ) : (
                          <Badge variant="secondary" className="gap-1">
                            <EyeOff className="h-3 w-3" />
                            Hidden
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleToggleBestSeller(product)}
                          title={product.is_best_seller ? "Remove from best sellers" : "Mark as best seller"}
                          className={cn(
                            product.is_best_seller && "text-yellow-600"
                          )}
                        >
                          <Star className={cn(
                            "h-4 w-4",
                            product.is_best_seller && "fill-current"
                          )} />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleEdit(product)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setDeleteConfirmProduct(product)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </div>

      {/* Product Form Sheet */}
      <ProductForm
        open={isFormOpen}
        onOpenChange={setIsFormOpen}
        product={editingProduct}
      />

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteConfirmProduct} onOpenChange={() => setDeleteConfirmProduct(null)}>
        <AlertDialogContent className="bg-background border-border">
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Product</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{deleteConfirmProduct?.title}"? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AdminLayout>
  );
}
