import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Layout } from '@/components/layout/Layout';
import { ProductCard } from '@/components/products/ProductCard';
import { useActiveProducts, DbProduct } from '@/hooks/useProducts';
import { useVariantMap, getVariantsForProduct } from '@/hooks/useVariants';
import { useSiteContent } from '@/hooks/useSiteContent';

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
    images: dbProduct.images.length > 0 ? dbProduct.images : [],
    inventoryCount: dbProduct.inventory_count,
    isActive: dbProduct.is_active,
    badge: dbProduct.badge as 'new-in' | 'back-in-stock' | 'sold-out' | null,
    createdAt: dbProduct.created_at,
    updatedAt: dbProduct.updated_at,
  };
}

export default function Index() {
  const { data: dbProducts, isLoading } = useActiveProducts();
  const { data: content, isLoading: isContentLoading } = useSiteContent();
  const [shopLookIndex, setShopLookIndex] = useState(0);
  const variantMap = useVariantMap(dbProducts);

  // Use CMS content directly — no fallback stock images
  const heroImages = content?.hero_images || [];
  const lifestyleImages = content?.lifestyle_images || [];
  const lifestyleImageLinks = content?.lifestyle_image_links || [];

  // Get new arrivals (most recently created)
  const newArrivals = dbProducts
    ?.slice()
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice(0, 8)
    .map(mapDbProductToProduct) || [];

  // Get best sellers (admin-selected via is_best_seller flag)
  const bestSellers = dbProducts
    ?.filter(p => p.is_best_seller)
    .slice(0, 8)
    .map(mapDbProductToProduct) || [];

  // Featured products (hoodies category)
  const featuredProducts = dbProducts
    ?.filter(p => p.is_active && p.inventory_count > 0 && p.category === 'hoodies')
    .slice(0, 4)
    .map(mapDbProductToProduct) || [];

  if (isContentLoading) {
    return (
      <Layout>
        <div className="h-[85vh] md:h-[90vh] flex items-center justify-center bg-background">
          <Loader2 className="h-10 w-10 animate-spin text-muted-foreground" />
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      {/* Hero Section - 3 Panel Editorial */}
      {heroImages.length > 0 && (
        <section className="relative">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-px bg-foreground h-[85vh] md:h-[90vh]">
            {heroImages.map((image, index) => (
              <div key={index} className="relative overflow-hidden bg-background">
                <img
                  src={image}
                  alt={`Hero ${index + 1}`}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-foreground/80 via-foreground/30 to-transparent" />
              </div>
            ))}
          </div>
          
          {/* Hero Content Overlay */}
          <div className="absolute inset-0 flex items-end justify-center pb-16 md:pb-24">
            <div className="text-center px-4 max-w-2xl">
              <h1 className="text-3xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-4 animate-fade-up text-white drop-shadow-lg">
                {content?.hero_title || 'Curated Stock. Premium Sourcing.'}
              </h1>
              <p className="text-lg md:text-xl text-white/90 mb-8 animate-fade-up drop-shadow font-medium">
                {content?.hero_subtitle || 'Built for serious buyers.'}
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-fade-up">
                <Button
                  size="lg"
                  className="h-12 px-8 rounded-2xl text-base font-bold bg-white text-black hover:bg-white/90 border-0"
                  asChild
                >
                  <Link to={content?.hero_button_link || '/shop'}>
                    {content?.hero_button_text || 'Shop Stock'}
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
                <Button
                  variant="outline"
                  size="lg"
                  className="h-12 px-8 rounded-2xl text-base font-semibold border-2 border-white text-white bg-transparent hover:bg-white hover:text-black"
                  asChild
                >
                  <Link to={content?.hero_secondary_button_link || '/vouches'}>
                    {content?.hero_secondary_button_text || 'View Proof'}
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Section Divider */}
      <div className="section-divider" />

      {/* Product Grid with Tabs */}
      <section className="py-16 md:py-24">
        <div className="container mx-auto px-4 md:px-6 lg:px-10">
          {isLoading ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : newArrivals.length > 0 ? (
            <Tabs defaultValue="new-arrivals" className="w-full">
              <div className="flex items-center justify-center mb-10">
                <TabsList className="bg-transparent border-b border-foreground rounded-none p-0 h-auto gap-0">
                  <TabsTrigger
                    value="new-arrivals"
                    className="section-heading rounded-none border-b-2 border-transparent data-[state=active]:border-foreground data-[state=active]:text-foreground px-6 md:px-8 py-4 bg-transparent"
                  >
                    New Arrivals
                  </TabsTrigger>
                  <TabsTrigger
                    value="best-sellers"
                    className="section-heading rounded-none border-b-2 border-transparent data-[state=active]:border-foreground data-[state=active]:text-foreground px-6 md:px-8 py-4 bg-transparent"
                  >
                    Best Sellers
                  </TabsTrigger>
                </TabsList>
              </div>

              <TabsContent value="new-arrivals" className="mt-0">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
                  {newArrivals.map((product) => {
                    const dbP = dbProducts?.find(p => p.id === product.id);
                    const variants = dbP ? getVariantsForProduct(dbP, variantMap) : undefined;
                    return <ProductCard key={product.id} product={product} variants={variants} />;
                  })}
                </div>
              </TabsContent>

              <TabsContent value="best-sellers" className="mt-0">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
                  {bestSellers.map((product) => {
                    const dbP = dbProducts?.find(p => p.id === product.id);
                    const variants = dbP ? getVariantsForProduct(dbP, variantMap) : undefined;
                    return <ProductCard key={product.id} product={product} variants={variants} />;
                  })}
                </div>
              </TabsContent>
            </Tabs>
          ) : (
            <div className="text-center py-16 border border-foreground rounded-2xl">
              <p className="text-muted-foreground mb-4">No products available yet.</p>
              <p className="text-sm text-muted-foreground">
                Products will appear here once added through the admin dashboard.
              </p>
            </div>
          )}

          {newArrivals.length > 0 && (
            <div className="flex justify-center mt-12">
              <Button
                variant="outline"
                size="lg"
                className="rounded-2xl border-foreground hover:bg-foreground hover:text-background font-semibold px-8"
                asChild
              >
                <Link to="/shop">
                  View All Products
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
          )}
        </div>
      </section>

      {/* Section Divider */}
      <div className="section-divider" />

      {/* Featured Drops Section */}
      <section className="py-16 md:py-24">
        <div className="container mx-auto px-4 md:px-6 lg:px-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
            {/* Image with black border */}
            {content?.featured_image && (
              <div className="relative aspect-square overflow-hidden border border-foreground">
                <img
                  src={content.featured_image}
                  alt="Featured Drops"
                  className="w-full h-full object-cover"
                />
              </div>
            )}

            {/* Content */}
            <div className="lg:pl-8">
              <span className="section-heading text-muted-foreground mb-2 block">
                {content?.featured_label || 'Featured Collection'}
              </span>
              <h2 className="text-3xl md:text-4xl font-bold mt-2 mb-4">
                {content?.featured_title || 'Premium Hoodies'}
              </h2>
              <p className="text-muted-foreground mb-8 max-w-md leading-relaxed">
                {content?.featured_description || 'Hand-picked selection of the finest hoodies. From essentials to rare finds, all authenticated and ready to ship.'}
              </p>
              
              {featuredProducts.length > 0 && (
                <div className="grid grid-cols-2 gap-4 mb-8">
                  {featuredProducts.slice(0, 2).map((product) => {
                    const dbP = dbProducts?.find(p => p.id === product.id);
                    const variants = dbP ? getVariantsForProduct(dbP, variantMap) : undefined;
                    return <ProductCard key={product.id} product={product} variants={variants} />;
                  })}
                </div>
              )}

              <Button className="rounded-2xl px-8 font-semibold" asChild>
                <Link to={content?.featured_button_link || '/shop?category=hoodies'}>
                  {content?.featured_button_text || 'Shop Hoodies'}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Section Divider */}
      <div className="section-divider" />

      {/* Shop the Look Carousel */}
      <section className="py-16 md:py-24">
        <div className="container mx-auto px-4 md:px-6 lg:px-10">
          <div className="flex items-center justify-between mb-8">
            <h2 className="section-heading">Shop the Look</h2>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShopLookIndex(Math.max(0, shopLookIndex - 1))}
                disabled={shopLookIndex === 0}
                className="h-10 w-10 flex items-center justify-center border border-foreground hover:bg-foreground hover:text-background transition-all disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-foreground"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
              <button
                onClick={() => setShopLookIndex(Math.min(lifestyleImages.length - 1, shopLookIndex + 1))}
                disabled={shopLookIndex >= lifestyleImages.length - 1}
                className="h-10 w-10 flex items-center justify-center border border-foreground hover:bg-foreground hover:text-background transition-all disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-foreground"
              >
                <ChevronRight className="h-5 w-5" />
              </button>
            </div>
          </div>

          <div className="overflow-hidden">
            <div
              className="flex gap-4 transition-transform duration-500"
              style={{ transform: `translateX(-${shopLookIndex * (100 / 3 + 1.33)}%)` }}
            >
              {lifestyleImages.map((image, index) => {
                const categorySlug = lifestyleImageLinks[index];
                const linkTo = categorySlug ? `/shop?category=${categorySlug}` : '/shop';
                return (
                <Link
                  key={index}
                  to={linkTo}
                  className="flex-shrink-0 w-[85%] md:w-[calc(33.333%-1rem)] relative aspect-[3/2] overflow-hidden group cursor-pointer border border-foreground"
                >
                  <img
                    src={image}
                    alt={`Look ${index + 1}`}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-foreground/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  <div className="absolute bottom-4 left-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <Button size="sm" className="rounded-2xl font-semibold">
                      Shop this Look
                    </Button>
                  </div>
                </Link>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* Section Divider */}
      <div className="section-divider" />

      {/* Delivery Strip */}
      <section className="py-12">
        <div className="container mx-auto px-4 md:px-6 lg:px-10">
          <div className="flex flex-col md:flex-row items-center justify-center gap-8 md:gap-16">
            <div className="text-center">
              <p className="section-heading mb-1">Local Pickup</p>
              <p className="text-sm text-muted-foreground">Toronto/GTA Meetup</p>
            </div>
            <span className="hidden md:block text-foreground">—</span>
            <div className="text-center">
              <p className="section-heading mb-1">Nationwide</p>
              <p className="text-sm text-muted-foreground">Canada Shipping</p>
            </div>
            <span className="hidden md:block text-foreground">—</span>
            <div className="text-center">
              <p className="section-heading mb-1">Global</p>
              <p className="text-sm text-muted-foreground">Worldwide via Agent</p>
            </div>
          </div>
        </div>
      </section>

      {/* Section Divider */}
      <div className="section-divider" />

      {/* Vendors CTA */}
      <section className="py-16 md:py-24">
        <div className="container mx-auto px-4 md:px-6 lg:px-10">
          <div className="relative overflow-hidden border border-foreground">
            {content?.vendors_image && (
              <div className="absolute inset-0">
                <img
                  src={content.vendors_image}
                  alt="Vendors"
                  className="w-full h-full object-cover opacity-10"
                />
              </div>
            )}
            <div className="relative py-16 md:py-20 px-8 text-center">
              <span className="section-heading text-muted-foreground">
                {content?.vendors_label || 'Exclusive Access'}
              </span>
              <h2 className="text-3xl md:text-4xl font-bold mt-2 mb-4">
                {content?.vendors_title || 'Want the Vendors?'}
              </h2>
              <p className="text-muted-foreground mb-8 max-w-md mx-auto leading-relaxed">
                {content?.vendors_description || 'Get access to our premium vendor lists and start sourcing like a pro.'}
              </p>
              <Button
                size="lg"
                className="rounded-2xl text-base font-bold px-8"
                asChild
              >
                <Link to="/vendors">
                  {content?.vendors_button_text || 'View Vendor Lists'}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
}
