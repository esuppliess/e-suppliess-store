import { useState, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Filter, X, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Checkbox } from '@/components/ui/checkbox';
import { Separator } from '@/components/ui/separator';
import { Layout } from '@/components/layout/Layout';
import { ProductCard } from '@/components/products/ProductCard';
import { useActiveProducts, DbProduct } from '@/hooks/useProducts';
import { useVariantMap, getVariantsForProduct } from '@/hooks/useVariants';
import { useCategories, Category } from '@/hooks/useCategories';
import { CONDITIONS } from '@/types/product';
import { cn } from '@/lib/utils';

const PRICE_RANGES = [
  { label: 'Under $100', min: 0, max: 100 },
  { label: '$100 - $200', min: 100, max: 200 },
  { label: '$200 - $300', min: 200, max: 300 },
  { label: 'Over $300', min: 300, max: Infinity },
];

interface FilterState {
  categories: string[];
  brands: string[];
  conditions: string[];
  priceRange: string | null;
}

// Convert DB product to the format expected by ProductCard
function mapDbProductToProduct(dbProduct: DbProduct) {
  return {
    id: dbProduct.id,
    title: dbProduct.title,
    slug: dbProduct.slug,
    description: dbProduct.description || '',
    price: Number(dbProduct.price),
    compareAtPrice: dbProduct.compare_at_price ? Number(dbProduct.compare_at_price) : undefined,
    category: dbProduct.category,
    brand: dbProduct.brand,
    condition: dbProduct.condition,
    sizes: dbProduct.sizes,
    images: dbProduct.images.length > 0 ? dbProduct.images : ['https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=600&h=800&fit=crop'],
    inventoryCount: dbProduct.inventory_count,
    isActive: dbProduct.is_active,
    badge: dbProduct.badge as 'new-in' | 'back-in-stock' | 'sold-out' | null,
    createdAt: dbProduct.created_at,
    updatedAt: dbProduct.updated_at,
  };
}

export default function Shop() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const { data: dbProducts, isLoading } = useActiveProducts();
  const { data: dynamicCategories = [] } = useCategories();
  const variantMap = useVariantMap(dbProducts);
  
  const initialCategory = searchParams.get('category');
  
  const [filters, setFilters] = useState<FilterState>({
    categories: initialCategory ? [initialCategory] : [],
    brands: [],
    conditions: [],
    priceRange: null,
  });

  // Get unique brands from products
  const BRANDS = useMemo(() => {
    if (!dbProducts) return [];
    return [...new Set(dbProducts.map((p) => p.brand))].sort();
  }, [dbProducts]);

  const filteredProducts = useMemo(() => {
    if (!dbProducts) return [];
    
    return dbProducts
      .map(mapDbProductToProduct)
      .filter((product) => {
        if (!product.isActive) return false;

        // Category filter
        if (filters.categories.length > 0 && !filters.categories.includes(product.category)) {
          return false;
        }

        // Brand filter
        if (filters.brands.length > 0 && !filters.brands.includes(product.brand)) {
          return false;
        }

        // Condition filter
        if (filters.conditions.length > 0 && !filters.conditions.includes(product.condition)) {
          return false;
        }

        // Price range filter
        if (filters.priceRange) {
          const range = PRICE_RANGES.find((r) => r.label === filters.priceRange);
          if (range && (product.price < range.min || product.price > range.max)) {
            return false;
          }
        }

        return true;
      });
  }, [dbProducts, filters]);

  const toggleFilter = (type: keyof FilterState, value: string) => {
    setFilters((prev) => {
      if (type === 'priceRange') {
        return { ...prev, priceRange: prev.priceRange === value ? null : value };
      }
      const current = prev[type] as string[];
      const updated = current.includes(value)
        ? current.filter((v) => v !== value)
        : [...current, value];
      return { ...prev, [type]: updated };
    });
  };

  const clearFilters = () => {
    setFilters({
      categories: [],
      brands: [],
      conditions: [],
      priceRange: null,
    });
    setSearchParams({});
  };

  const hasActiveFilters =
    filters.categories.length > 0 ||
    filters.brands.length > 0 ||
    filters.conditions.length > 0 ||
    filters.priceRange !== null;

  const FilterContent = () => (
    <div className="space-y-6">
      {/* Categories */}
      <div>
        <h4 className="section-heading mb-4">Category</h4>
        <div className="space-y-3">
          {dynamicCategories.map((cat) => (
            <label
              key={cat.id}
              className="flex items-center gap-3 cursor-pointer group"
            >
              <Checkbox
                checked={filters.categories.includes(cat.slug)}
                onCheckedChange={() => toggleFilter('categories', cat.slug)}
                className="border-foreground data-[state=checked]:bg-foreground data-[state=checked]:border-foreground rounded-none"
              />
              <span className="text-sm text-muted-foreground group-hover:text-foreground transition-colors">
                {cat.display_name}
              </span>
            </label>
          ))}
        </div>
      </div>

      <div className="h-px bg-foreground" />

      {/* Brands */}
      {BRANDS.length > 0 && (
        <>
          <div>
            <h4 className="section-heading mb-4">Brand</h4>
            <div className="space-y-3 max-h-48 overflow-y-auto">
              {BRANDS.map((brand) => (
                <label
                  key={brand}
                  className="flex items-center gap-3 cursor-pointer group"
                >
                  <Checkbox
                    checked={filters.brands.includes(brand)}
                    onCheckedChange={() => toggleFilter('brands', brand)}
                    className="border-foreground data-[state=checked]:bg-foreground data-[state=checked]:border-foreground rounded-none"
                  />
                  <span className="text-sm text-muted-foreground group-hover:text-foreground transition-colors">
                    {brand}
                  </span>
                </label>
              ))}
            </div>
          </div>
          <div className="h-px bg-foreground" />
        </>
      )}

      {/* Price Range */}
      <div>
        <h4 className="section-heading mb-4">Price</h4>
        <div className="space-y-3">
          {PRICE_RANGES.map((range) => (
            <label
              key={range.label}
              className="flex items-center gap-3 cursor-pointer group"
            >
              <Checkbox
                checked={filters.priceRange === range.label}
                onCheckedChange={() => toggleFilter('priceRange', range.label)}
                className="border-foreground data-[state=checked]:bg-foreground data-[state=checked]:border-foreground rounded-none"
              />
              <span className="text-sm text-muted-foreground group-hover:text-foreground transition-colors">
                {range.label}
              </span>
            </label>
          ))}
        </div>
      </div>

      <div className="h-px bg-foreground" />

      {/* Condition */}
      <div>
        <h4 className="section-heading mb-4">Condition</h4>
        <div className="space-y-3">
          {CONDITIONS.map((cond) => (
            <label
              key={cond.value}
              className="flex items-center gap-3 cursor-pointer group"
            >
              <Checkbox
                checked={filters.conditions.includes(cond.value)}
                onCheckedChange={() => toggleFilter('conditions', cond.value)}
                className="border-foreground data-[state=checked]:bg-foreground data-[state=checked]:border-foreground rounded-none"
              />
              <span className="text-sm text-muted-foreground group-hover:text-foreground transition-colors">
                {cond.label}
              </span>
            </label>
          ))}
        </div>
      </div>

      {hasActiveFilters && (
        <>
          <div className="h-px bg-foreground" />
          <Button
            variant="outline"
            className="w-full rounded-2xl border-foreground hover:bg-foreground hover:text-background"
            onClick={clearFilters}
          >
            Clear All Filters
          </Button>
        </>
      )}
    </div>
  );

  return (
    <Layout>
      <div className="container mx-auto px-4 md:px-6 lg:px-10 py-8 md:py-12">
        {/* Header */}
        <div className="mb-8 pb-6 border-b border-foreground">
          <h1 className="text-3xl md:text-4xl font-bold mb-2">Shop</h1>
          <p className="text-muted-foreground">
            {isLoading ? 'Loading...' : `${filteredProducts.length} ${filteredProducts.length === 1 ? 'product' : 'products'}`}
          </p>
        </div>

        <div className="flex gap-8 lg:gap-12">
          {/* Desktop Sidebar Filters */}
          <aside className="hidden lg:block w-64 flex-shrink-0">
            <div className="sticky top-24">
              <div className="flex items-center justify-between mb-6 pb-4 border-b border-foreground">
                <h3 className="section-heading">Filters</h3>
                {hasActiveFilters && (
                  <button
                    onClick={clearFilters}
                    className="text-xs text-muted-foreground hover:text-foreground transition-colors underline underline-offset-2"
                  >
                    Clear all
                  </button>
                )}
              </div>
              <FilterContent />
            </div>
          </aside>

          {/* Main Content */}
          <div className="flex-1">
            {/* Mobile Filter Button */}
            <div className="flex items-center justify-between mb-6 lg:hidden">
              <Sheet open={isFilterOpen} onOpenChange={setIsFilterOpen}>
                <SheetTrigger asChild>
                  <Button variant="outline" size="sm" className="rounded-2xl border-foreground">
                    <Filter className="h-4 w-4 mr-2" />
                    Filters
                    {hasActiveFilters && (
                      <span className="ml-2 h-5 w-5 flex items-center justify-center bg-foreground text-background text-xs rounded-full">
                        {filters.categories.length + filters.brands.length + filters.conditions.length + (filters.priceRange ? 1 : 0)}
                      </span>
                    )}
                  </Button>
                </SheetTrigger>
                <SheetContent side="left" className="w-[300px] bg-background border-r border-foreground">
                  <SheetHeader className="mb-6 pb-4 border-b border-foreground">
                    <SheetTitle className="section-heading">Filters</SheetTitle>
                  </SheetHeader>
                  <FilterContent />
                </SheetContent>
              </Sheet>
            </div>

            {/* Active Filters Pills */}
            {hasActiveFilters && (
              <div className="flex flex-wrap gap-2 mb-6">
                {filters.categories.map((catSlug) => {
                  const cat = dynamicCategories.find((c) => c.slug === catSlug);
                  return (
                    <button
                      key={catSlug}
                      onClick={() => toggleFilter('categories', catSlug)}
                      className="flex items-center gap-1 px-3 py-1.5 border border-foreground text-xs font-medium hover:bg-foreground hover:text-background transition-colors"
                    >
                      {cat?.display_name || catSlug}
                      <X className="h-3 w-3" />
                    </button>
                  );
                })}
                {filters.brands.map((brand) => (
                  <button
                    key={brand}
                    onClick={() => toggleFilter('brands', brand)}
                    className="flex items-center gap-1 px-3 py-1.5 border border-foreground text-xs font-medium hover:bg-foreground hover:text-background transition-colors"
                  >
                    {brand}
                    <X className="h-3 w-3" />
                  </button>
                ))}
                {filters.conditions.map((cond) => (
                  <button
                    key={cond}
                    onClick={() => toggleFilter('conditions', cond)}
                    className="flex items-center gap-1 px-3 py-1.5 border border-foreground text-xs font-medium hover:bg-foreground hover:text-background transition-colors"
                  >
                    {CONDITIONS.find((c) => c.value === cond)?.label}
                    <X className="h-3 w-3" />
                  </button>
                ))}
                {filters.priceRange && (
                  <button
                    onClick={() => toggleFilter('priceRange', filters.priceRange!)}
                    className="flex items-center gap-1 px-3 py-1.5 border border-foreground text-xs font-medium hover:bg-foreground hover:text-background transition-colors"
                  >
                    {filters.priceRange}
                    <X className="h-3 w-3" />
                  </button>
                )}
              </div>
            )}

            {/* Product Grid */}
            {isLoading ? (
              <div className="flex items-center justify-center py-16">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : filteredProducts.length > 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
                {filteredProducts.map((product) => {
                  const dbP = dbProducts?.find(p => p.id === product.id);
                  const variants = dbP ? getVariantsForProduct(dbP, variantMap) : undefined;
                  return <ProductCard key={product.id} product={product} variants={variants} />;
                })}
              </div>
            ) : (
              <div className="text-center py-16 border border-foreground">
                <p className="text-muted-foreground mb-4">
                  {hasActiveFilters ? 'No products found with the selected filters.' : 'No products available yet.'}
                </p>
                {hasActiveFilters && (
                  <Button variant="outline" onClick={clearFilters} className="rounded-2xl border-foreground">
                    Clear Filters
                  </Button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}
