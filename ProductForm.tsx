import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { ImageUploader } from './ImageUploader';
import { SizeInventoryEditor, SizeInventory } from './SizeInventoryEditor';
import { DbProduct, ProductInsert, useCreateProduct, useUpdateProduct } from '@/hooks/useProducts';
import { useSubcategoriesByCategory } from '@/hooks/useSubcategories';
import { useCategories } from '@/hooks/useCategories';
import { useToast } from '@/hooks/use-toast';

const CONDITIONS = [
  { value: 'new', label: 'New' },
  { value: 'like-new', label: 'Like New' },
  { value: 'good', label: 'Good' },
  { value: 'fair', label: 'Fair' },
];

interface ProductFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  product?: DbProduct | null;
}

export function ProductForm({ open, onOpenChange, product }: ProductFormProps) {
  const isEditing = !!product;
  const { toast } = useToast();
  const createProduct = useCreateProduct();
  const updateProduct = useUpdateProduct();
  const { data: categories = [] } = useCategories();

  // Form state
  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [compareAtPrice, setCompareAtPrice] = useState('');
  const [categoryId, setCategoryId] = useState<string>('');
  const [brand, setBrand] = useState('');
  const [condition, setCondition] = useState<DbProduct['condition']>('new');
  const [sizes, setSizes] = useState<SizeInventory[]>([]);
  const [images, setImages] = useState<string[]>([]);
  const [isActive, setIsActive] = useState(true);
  const [badge, setBadge] = useState('');
  const [subcategoryId, setSubcategoryId] = useState<string | null>(null);
  const [variantGroupId, setVariantGroupId] = useState<string>('');
  const [variantLabel, setVariantLabel] = useState('');

  // Fetch subcategories based on selected category
  const { data: subcategories = [] } = useSubcategoriesByCategory(categoryId || null);

  // Set default category when categories load
  useEffect(() => {
    if (categories.length > 0 && !categoryId && !product) {
      setCategoryId(categories[0].id);
    }
  }, [categories, categoryId, product]);

  // Reset form when product changes
  useEffect(() => {
    if (product) {
      setTitle(product.title);
      setSlug(product.slug);
      setDescription(product.description || '');
      setPrice(String(product.price));
      setCompareAtPrice(product.compare_at_price ? String(product.compare_at_price) : '');
      // Find category by slug for backwards compatibility
      const cat = categories.find(c => c.slug === product.category);
      setCategoryId(cat?.id || '');
      setBrand(product.brand);
      setCondition(product.condition);
      setSizes(product.sizes || []);
      setImages(product.images);
      setIsActive(product.is_active);
      setBadge(product.badge || '');
      setSubcategoryId(product.subcategory_id);
      setVariantGroupId(product.variant_group_id || '');
      setVariantLabel(product.variant_label || '');
    } else {
      // Reset to defaults for new product
      setTitle('');
      setSlug('');
      setDescription('');
      setPrice('');
      setCompareAtPrice('');
      setCategoryId(categories[0]?.id || '');
      setBrand('');
      setCondition('new');
      setSizes([]);
      setImages([]);
      setIsActive(true);
      setBadge('');
      setSubcategoryId(null);
      setVariantGroupId('');
      setVariantLabel('');
    }
  }, [product, open, categories]);

  // Clear subcategory when category changes (if it's not valid)
  useEffect(() => {
    if (subcategoryId && subcategories.length > 0) {
      const isValid = subcategories.some(s => s.id === subcategoryId);
      if (!isValid) {
        setSubcategoryId(null);
      }
    }
  }, [categoryId, subcategories, subcategoryId]);

  // Auto-generate slug from title
  useEffect(() => {
    if (!isEditing && title) {
      const generatedSlug = title
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .trim();
      setSlug(generatedSlug);
    }
  }, [title, isEditing]);

  // Calculate total inventory from sizes
  const totalInventory = sizes.reduce((sum, s) => sum + s.quantity, 0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Basic validation
    if (!title.trim() || !slug.trim() || !price || !brand.trim() || !categoryId) {
      toast({
        title: 'Missing required fields',
        description: 'Please fill in title, slug, price, category, and brand.',
        variant: 'destructive',
      });
      return;
    }

    // Get category slug for backwards compatibility with enum
    const selectedCategory = categories.find(c => c.id === categoryId);
    if (!selectedCategory) {
      toast({
        title: 'Invalid category',
        description: 'Please select a valid category.',
        variant: 'destructive',
      });
      return;
    }

    const productData: ProductInsert = {
      title: title.trim(),
      slug: slug.trim(),
      description: description.trim() || null,
      price: parseFloat(price),
      compare_at_price: compareAtPrice ? parseFloat(compareAtPrice) : null,
      category: selectedCategory.slug as DbProduct['category'],
      brand: brand.trim(),
      condition,
      sizes,
      images,
      inventory_count: totalInventory,
      is_active: isActive,
      badge: badge.trim() || null,
      subcategory_id: subcategoryId,
      variant_group_id: variantGroupId.trim() || null,
      variant_label: variantLabel.trim() || null,
    };

    try {
      if (isEditing && product) {
        await updateProduct.mutateAsync({ id: product.id, ...productData });
        toast({ title: 'Product updated successfully' });
      } else {
        await createProduct.mutateAsync(productData);
        toast({ title: 'Product created successfully' });
      }
      onOpenChange(false);
    } catch (error: any) {
      toast({
        title: isEditing ? 'Failed to update product' : 'Failed to create product',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  const isLoading = createProduct.isPending || updateProduct.isPending;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-xl overflow-y-auto bg-background border-border">
        <SheetHeader>
          <SheetTitle>{isEditing ? 'Edit Product' : 'Add New Product'}</SheetTitle>
        </SheetHeader>

        <form onSubmit={handleSubmit} className="space-y-6 mt-6 pb-8">
          {/* Images */}
          <div className="space-y-2">
            <Label>Product Images</Label>
            <ImageUploader
              images={images}
              onImagesChange={setImages}
              bucket="product-images"
              maxImages={6}
            />
          </div>

          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="title">Title *</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Product title"
              required
            />
          </div>

          {/* Slug */}
          <div className="space-y-2">
            <Label htmlFor="slug">Slug *</Label>
            <Input
              id="slug"
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              placeholder="product-url-slug"
              required
            />
            <p className="text-xs text-muted-foreground">
              URL: /product/{slug || 'your-slug'}
            </p>
          </div>

          {/* Price Row */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="price">Price (USD) *</Label>
              <Input
                id="price"
                type="number"
                step="0.01"
                min="0"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder="0.00"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="compareAtPrice">Compare at Price</Label>
              <Input
                id="compareAtPrice"
                type="number"
                step="0.01"
                min="0"
                value={compareAtPrice}
                onChange={(e) => setCompareAtPrice(e.target.value)}
                placeholder="0.00"
              />
            </div>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Product description..."
              rows={4}
            />
          </div>

          {/* Category & Subcategory */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Category *</Label>
              <Select value={categoryId} onValueChange={setCategoryId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((cat) => (
                    <SelectItem key={cat.id} value={cat.id}>
                      {cat.display_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Subcategory</Label>
              <Select 
                value={subcategoryId || "none"} 
                onValueChange={(v) => setSubcategoryId(v === "none" ? null : v)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="None" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">None</SelectItem>
                  {subcategories.map((sub) => (
                    <SelectItem key={sub.id} value={sub.id}>
                      {sub.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {subcategories.length === 0 && categoryId && (
                <p className="text-xs text-muted-foreground">
                  No subcategories for this category yet
                </p>
              )}
            </div>
          </div>

          {/* Brand */}
          <div className="space-y-2">
            <Label htmlFor="brand">Brand *</Label>
            <Input
              id="brand"
              value={brand}
              onChange={(e) => setBrand(e.target.value)}
              placeholder="Brand name"
              required
            />
          </div>

          {/* Condition */}
          <div className="space-y-2">
            <Label>Condition</Label>
            <Select value={condition} onValueChange={(v) => setCondition(v as DbProduct['condition'])}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {CONDITIONS.map((cond) => (
                  <SelectItem key={cond.value} value={cond.value}>
                    {cond.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Sizes & Inventory */}
          <SizeInventoryEditor sizes={sizes} onChange={setSizes} />

          {/* Variant Group */}
          <div className="space-y-2 border-t border-border pt-4">
            <Label className="text-sm font-semibold">Color / Style Variants</Label>
            <p className="text-xs text-muted-foreground">
              To link products as color variants, give them the same Variant Group ID (any shared text like "jordan-4-group"). Each variant needs its own label (e.g. "Black", "White").
            </p>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="variantGroupId">Variant Group ID</Label>
              <Input
                id="variantGroupId"
                value={variantGroupId}
                onChange={(e) => setVariantGroupId(e.target.value)}
                placeholder="e.g. jordan-4-group"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="variantLabel">Variant Label</Label>
              <Input
                id="variantLabel"
                value={variantLabel}
                onChange={(e) => setVariantLabel(e.target.value)}
                placeholder="e.g. Black, Red, Blue"
              />
            </div>
          </div>

          {/* Badge */}
          <div className="space-y-2">
            <Label htmlFor="badge">Badge</Label>
            <Select value={badge || "none"} onValueChange={(v) => setBadge(v === "none" ? "" : v)}>
              <SelectTrigger>
                <SelectValue placeholder="No badge" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">No badge</SelectItem>
                <SelectItem value="new-in">New In</SelectItem>
                <SelectItem value="back-in-stock">Back in Stock</SelectItem>
                <SelectItem value="sold-out">Sold Out</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Active Toggle */}
          <div className="flex items-center justify-between py-4 border-t border-b border-border">
            <div>
              <Label htmlFor="isActive">Active / Visible</Label>
              <p className="text-xs text-muted-foreground">
                Show this product on the shop page
              </p>
            </div>
            <Switch
              id="isActive"
              checked={isActive}
              onCheckedChange={setIsActive}
            />
          </div>

          {/* Submit Buttons */}
          <div className="flex gap-3">
            <Button
              type="button"
              variant="outline"
              className="flex-1"
              onClick={() => onOpenChange(false)}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="flex-1"
              disabled={isLoading}
            >
              {isLoading ? 'Saving...' : isEditing ? 'Update Product' : 'Create Product'}
            </Button>
          </div>
        </form>
      </SheetContent>
    </Sheet>
  );
}
