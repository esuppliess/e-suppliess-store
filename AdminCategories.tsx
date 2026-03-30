import { useState } from 'react';
import { Plus, Edit, Trash2, Eye, EyeOff, FolderTree, Layers } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
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
import { AdminLayout } from '@/components/admin/AdminLayout';
import { 
  useAllCategories, 
  useCreateCategory, 
  useUpdateCategory, 
  useDeleteCategory,
  Category,
  CategoryInsert
} from '@/hooks/useCategories';
import { 
  useAllSubcategories, 
  useCreateSubcategory, 
  useUpdateSubcategory, 
  useDeleteSubcategory,
  Subcategory,
} from '@/hooks/useSubcategories';
import { useToast } from '@/hooks/use-toast';

export default function AdminCategories() {
  const { data: categories, isLoading: categoriesLoading } = useAllCategories();
  const { data: subcategories, isLoading: subcategoriesLoading } = useAllSubcategories();
  const createCategory = useCreateCategory();
  const updateCategory = useUpdateCategory();
  const deleteCategory = useDeleteCategory();
  const createSubcategory = useCreateSubcategory();
  const updateSubcategory = useUpdateSubcategory();
  const deleteSubcategory = useDeleteSubcategory();
  const { toast } = useToast();

  const [activeTab, setActiveTab] = useState('categories');

  // Category form state
  const [isCategoryFormOpen, setIsCategoryFormOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [deleteCategoryConfirm, setDeleteCategoryConfirm] = useState<Category | null>(null);
  const [catFormName, setCatFormName] = useState('');
  const [catFormSlug, setCatFormSlug] = useState('');
  const [catFormDisplayName, setCatFormDisplayName] = useState('');
  const [catFormIsActive, setCatFormIsActive] = useState(true);
  const [catFormSortOrder, setCatFormSortOrder] = useState('0');

  // Subcategory form state
  const [isSubFormOpen, setIsSubFormOpen] = useState(false);
  const [editingSubcategory, setEditingSubcategory] = useState<Subcategory | null>(null);
  const [deleteSubConfirm, setDeleteSubConfirm] = useState<Subcategory | null>(null);
  const [subFormName, setSubFormName] = useState('');
  const [subFormSlug, setSubFormSlug] = useState('');
  const [subFormCategoryId, setSubFormCategoryId] = useState<string>('');
  const [subFormIsActive, setSubFormIsActive] = useState(true);
  const [subFormSortOrder, setSubFormSortOrder] = useState('0');

  // Category form helpers
  const resetCategoryForm = () => {
    setCatFormName('');
    setCatFormSlug('');
    setCatFormDisplayName('');
    setCatFormIsActive(true);
    setCatFormSortOrder('0');
    setEditingCategory(null);
  };

  const openNewCategoryForm = () => {
    resetCategoryForm();
    setIsCategoryFormOpen(true);
  };

  const openEditCategoryForm = (category: Category) => {
    setEditingCategory(category);
    setCatFormName(category.name);
    setCatFormSlug(category.slug);
    setCatFormDisplayName(category.display_name);
    setCatFormIsActive(category.is_active);
    setCatFormSortOrder(String(category.sort_order));
    setIsCategoryFormOpen(true);
  };

  const handleCategoryNameChange = (value: string) => {
    setCatFormDisplayName(value);
    if (!editingCategory) {
      const slug = value
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .trim();
      setCatFormSlug(slug);
      setCatFormName(slug);
    }
  };

  const handleCategorySubmit = async () => {
    if (!catFormDisplayName.trim() || !catFormSlug.trim() || !catFormName.trim()) {
      toast({
        title: 'Missing required fields',
        description: 'Please fill in display name, name, and slug.',
        variant: 'destructive',
      });
      return;
    }

    try {
      if (editingCategory) {
        await updateCategory.mutateAsync({
          id: editingCategory.id,
          name: catFormName.trim(),
          slug: catFormSlug.trim(),
          display_name: catFormDisplayName.trim(),
          is_active: catFormIsActive,
          sort_order: parseInt(catFormSortOrder) || 0,
        });
        toast({ title: 'Category updated' });
      } else {
        await createCategory.mutateAsync({
          name: catFormName.trim(),
          slug: catFormSlug.trim(),
          display_name: catFormDisplayName.trim(),
          is_active: catFormIsActive,
          sort_order: parseInt(catFormSortOrder) || 0,
        });
        toast({ title: 'Category created' });
      }
      setIsCategoryFormOpen(false);
      resetCategoryForm();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  const handleDeleteCategory = async () => {
    if (!deleteCategoryConfirm) return;
    try {
      await deleteCategory.mutateAsync(deleteCategoryConfirm.id);
      toast({ title: 'Category deleted' });
    } catch (error: any) {
      toast({
        title: 'Failed to delete',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setDeleteCategoryConfirm(null);
    }
  };

  // Subcategory form helpers
  const resetSubForm = () => {
    setSubFormName('');
    setSubFormSlug('');
    setSubFormCategoryId('');
    setSubFormIsActive(true);
    setSubFormSortOrder('0');
    setEditingSubcategory(null);
  };

  const openNewSubForm = () => {
    resetSubForm();
    setIsSubFormOpen(true);
  };

  const openEditSubForm = (subcategory: Subcategory) => {
    setEditingSubcategory(subcategory);
    setSubFormName(subcategory.name);
    setSubFormSlug(subcategory.slug);
    // Find category_id from the subcategory if it exists
    setSubFormCategoryId(subcategory.category_id || '');
    setSubFormIsActive(subcategory.is_active);
    setSubFormSortOrder(String(subcategory.sort_order));
    setIsSubFormOpen(true);
  };

  const handleSubNameChange = (value: string) => {
    setSubFormName(value);
    if (!editingSubcategory) {
      const slug = value
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .trim();
      setSubFormSlug(slug);
    }
  };

  const handleSubSubmit = async () => {
    if (!subFormName.trim() || !subFormSlug.trim() || !subFormCategoryId) {
      toast({
        title: 'Missing required fields',
        description: 'Please fill in name, slug, and select a parent category.',
        variant: 'destructive',
      });
      return;
    }

    // Get the category slug for backwards compatibility with the enum
    const parentCategory = categories?.find(c => c.id === subFormCategoryId);
    if (!parentCategory) {
      toast({
        title: 'Invalid category',
        description: 'Please select a valid parent category.',
        variant: 'destructive',
      });
      return;
    }

    try {
      if (editingSubcategory) {
        await updateSubcategory.mutateAsync({
          id: editingSubcategory.id,
          name: subFormName.trim(),
          slug: subFormSlug.trim(),
          category: parentCategory.slug as any,
          category_id: subFormCategoryId,
          is_active: subFormIsActive,
          sort_order: parseInt(subFormSortOrder) || 0,
        });
        toast({ title: 'Subcategory updated' });
      } else {
        await createSubcategory.mutateAsync({
          name: subFormName.trim(),
          slug: subFormSlug.trim(),
          category: parentCategory.slug as any,
          category_id: subFormCategoryId,
          is_active: subFormIsActive,
          sort_order: parseInt(subFormSortOrder) || 0,
        });
        toast({ title: 'Subcategory created' });
      }
      setIsSubFormOpen(false);
      resetSubForm();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  const handleDeleteSub = async () => {
    if (!deleteSubConfirm) return;
    try {
      await deleteSubcategory.mutateAsync(deleteSubConfirm.id);
      toast({ title: 'Subcategory deleted' });
    } catch (error: any) {
      toast({
        title: 'Failed to delete',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setDeleteSubConfirm(null);
    }
  };

  // Group subcategories by category
  const groupedSubcategories = subcategories?.reduce((acc, sub) => {
    const catId = sub.category_id || sub.category;
    if (!acc[catId]) {
      acc[catId] = [];
    }
    acc[catId].push(sub);
    return acc;
  }, {} as Record<string, Subcategory[]>) || {};

  const isCategorySubmitting = createCategory.isPending || updateCategory.isPending;
  const isSubSubmitting = createSubcategory.isPending || updateSubcategory.isPending;

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold mb-1">Categories & Subcategories</h1>
          <p className="text-muted-foreground">
            Manage product categories and brand-level subcategories
          </p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full max-w-md grid-cols-2">
            <TabsTrigger value="categories" className="gap-2">
              <Layers className="h-4 w-4" />
              Categories
            </TabsTrigger>
            <TabsTrigger value="subcategories" className="gap-2">
              <FolderTree className="h-4 w-4" />
              Subcategories
            </TabsTrigger>
          </TabsList>

          {/* Categories Tab */}
          <TabsContent value="categories" className="space-y-4">
            <div className="flex justify-end">
              <Button onClick={openNewCategoryForm} className="gap-2">
                <Plus className="h-4 w-4" />
                Add Category
              </Button>
            </div>

            {categoriesLoading ? (
              <p className="text-muted-foreground">Loading categories...</p>
            ) : !categories || categories.length === 0 ? (
              <div className="text-center py-12 border border-dashed border-border rounded-lg">
                <Layers className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground mb-4">No categories yet.</p>
                <Button onClick={openNewCategoryForm} variant="outline">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Your First Category
                </Button>
              </div>
            ) : (
              <div className="border border-border rounded-lg overflow-hidden">
                <div className="divide-y divide-border">
                  {categories.map((cat) => (
                    <div
                      key={cat.id}
                      className="flex items-center justify-between px-4 py-3 hover:bg-accent/20 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div>
                          <p className="font-medium">{cat.display_name}</p>
                          <p className="text-xs text-muted-foreground">/{cat.slug}</p>
                        </div>
                        {cat.is_active ? (
                          <Badge variant="outline" className="gap-1 text-xs">
                            <Eye className="h-3 w-3" />
                            Active
                          </Badge>
                        ) : (
                          <Badge variant="secondary" className="gap-1 text-xs">
                            <EyeOff className="h-3 w-3" />
                            Hidden
                          </Badge>
                        )}
                        <Badge variant="secondary" className="text-xs">
                          Order: {cat.sort_order}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => openEditCategoryForm(cat)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setDeleteCategoryConfirm(cat)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </TabsContent>

          {/* Subcategories Tab */}
          <TabsContent value="subcategories" className="space-y-4">
            <div className="flex justify-end">
              <Button onClick={openNewSubForm} className="gap-2">
                <Plus className="h-4 w-4" />
                Add Subcategory
              </Button>
            </div>

            {subcategoriesLoading ? (
              <p className="text-muted-foreground">Loading subcategories...</p>
            ) : !subcategories || subcategories.length === 0 ? (
              <div className="text-center py-12 border border-dashed border-border rounded-lg">
                <FolderTree className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground mb-4">
                  No subcategories yet. Create subcategories to organize products by brand.
                </p>
                <Button onClick={openNewSubForm} variant="outline">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Your First Subcategory
                </Button>
              </div>
            ) : (
              <div className="space-y-6">
                {categories?.map((cat) => {
                  const subs = groupedSubcategories[cat.id] || groupedSubcategories[cat.slug];
                  if (!subs || subs.length === 0) return null;

                  return (
                    <div key={cat.id} className="border border-border rounded-lg overflow-hidden">
                      <div className="bg-accent/50 px-4 py-3 border-b border-border">
                        <h2 className="font-semibold">{cat.display_name}</h2>
                      </div>
                      <div className="divide-y divide-border">
                        {subs.map((sub) => (
                          <div
                            key={sub.id}
                            className="flex items-center justify-between px-4 py-3 hover:bg-accent/20 transition-colors"
                          >
                            <div className="flex items-center gap-3">
                              <div>
                                <p className="font-medium">{sub.name}</p>
                                <p className="text-xs text-muted-foreground">/{sub.slug}</p>
                              </div>
                              {sub.is_active ? (
                                <Badge variant="outline" className="gap-1 text-xs">
                                  <Eye className="h-3 w-3" />
                                  Active
                                </Badge>
                              ) : (
                                <Badge variant="secondary" className="gap-1 text-xs">
                                  <EyeOff className="h-3 w-3" />
                                  Hidden
                                </Badge>
                              )}
                            </div>
                            <div className="flex items-center gap-1">
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => openEditSubForm(sub)}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => setDeleteSubConfirm(sub)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>

      {/* Category Form Dialog */}
      <Dialog open={isCategoryFormOpen} onOpenChange={(open) => { setIsCategoryFormOpen(open); if (!open) resetCategoryForm(); }}>
        <DialogContent className="bg-background border-border">
          <DialogHeader>
            <DialogTitle>
              {editingCategory ? 'Edit Category' : 'New Category'}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="catDisplayName">Display Name *</Label>
              <Input
                id="catDisplayName"
                value={catFormDisplayName}
                onChange={(e) => handleCategoryNameChange(e.target.value)}
                placeholder="e.g., Hoodies & Sweaters"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="catName">Internal Name *</Label>
                <Input
                  id="catName"
                  value={catFormName}
                  onChange={(e) => setCatFormName(e.target.value)}
                  placeholder="hoodies"
                />
                <p className="text-xs text-muted-foreground">
                  Used for database references
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="catSlug">Slug *</Label>
                <Input
                  id="catSlug"
                  value={catFormSlug}
                  onChange={(e) => setCatFormSlug(e.target.value)}
                  placeholder="hoodies"
                />
                <p className="text-xs text-muted-foreground">
                  Used in URLs
                </p>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="catSortOrder">Sort Order</Label>
              <Input
                id="catSortOrder"
                type="number"
                value={catFormSortOrder}
                onChange={(e) => setCatFormSortOrder(e.target.value)}
                placeholder="0"
              />
              <p className="text-xs text-muted-foreground">
                Lower numbers appear first
              </p>
            </div>

            <div className="flex items-center justify-between pt-2">
              <div>
                <Label htmlFor="catIsActive">Active</Label>
                <p className="text-xs text-muted-foreground">
                  Show this category in shop filters
                </p>
              </div>
              <Switch
                id="catIsActive"
                checked={catFormIsActive}
                onCheckedChange={setCatFormIsActive}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCategoryFormOpen(false)} disabled={isCategorySubmitting}>
              Cancel
            </Button>
            <Button onClick={handleCategorySubmit} disabled={isCategorySubmitting}>
              {isCategorySubmitting ? 'Saving...' : editingCategory ? 'Update' : 'Create'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Subcategory Form Dialog */}
      <Dialog open={isSubFormOpen} onOpenChange={(open) => { setIsSubFormOpen(open); if (!open) resetSubForm(); }}>
        <DialogContent className="bg-background border-border">
          <DialogHeader>
            <DialogTitle>
              {editingSubcategory ? 'Edit Subcategory' : 'New Subcategory'}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="subName">Name *</Label>
              <Input
                id="subName"
                value={subFormName}
                onChange={(e) => handleSubNameChange(e.target.value)}
                placeholder="e.g., Denim Tear Hoodies"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="subSlug">Slug *</Label>
              <Input
                id="subSlug"
                value={subFormSlug}
                onChange={(e) => setSubFormSlug(e.target.value)}
                placeholder="denim-tear-hoodies"
              />
              <p className="text-xs text-muted-foreground">
                Used in URLs and filters
              </p>
            </div>

            <div className="space-y-2">
              <Label>Parent Category *</Label>
              <Select value={subFormCategoryId} onValueChange={setSubFormCategoryId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a category" />
                </SelectTrigger>
                <SelectContent>
                  {categories?.filter(c => c.is_active).map((cat) => (
                    <SelectItem key={cat.id} value={cat.id}>
                      {cat.display_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="subSortOrder">Sort Order</Label>
              <Input
                id="subSortOrder"
                type="number"
                value={subFormSortOrder}
                onChange={(e) => setSubFormSortOrder(e.target.value)}
                placeholder="0"
              />
              <p className="text-xs text-muted-foreground">
                Lower numbers appear first
              </p>
            </div>

            <div className="flex items-center justify-between pt-2">
              <div>
                <Label htmlFor="subIsActive">Active</Label>
                <p className="text-xs text-muted-foreground">
                  Show this subcategory in filters
                </p>
              </div>
              <Switch
                id="subIsActive"
                checked={subFormIsActive}
                onCheckedChange={setSubFormIsActive}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsSubFormOpen(false)} disabled={isSubSubmitting}>
              Cancel
            </Button>
            <Button onClick={handleSubSubmit} disabled={isSubSubmitting}>
              {isSubSubmitting ? 'Saving...' : editingSubcategory ? 'Update' : 'Create'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Category Confirmation */}
      <AlertDialog open={!!deleteCategoryConfirm} onOpenChange={() => setDeleteCategoryConfirm(null)}>
        <AlertDialogContent className="bg-background border-border">
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Category</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{deleteCategoryConfirm?.display_name}"? Products and subcategories using this category may be affected.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteCategory}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete Subcategory Confirmation */}
      <AlertDialog open={!!deleteSubConfirm} onOpenChange={() => setDeleteSubConfirm(null)}>
        <AlertDialogContent className="bg-background border-border">
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Subcategory</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{deleteSubConfirm?.name}"? Products using this subcategory will have their subcategory cleared.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteSub}
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
