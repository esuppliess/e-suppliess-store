import { useState, useMemo } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ChevronLeft, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Layout } from '@/components/layout/Layout';
import { ProductCard } from '@/components/products/ProductCard';
import { WhatToExpect } from '@/components/products/WhatToExpect';
import { useProductBySlug, useActiveProducts, DbProduct, SizeInventory } from '@/hooks/useProducts';
import { useVariantMap, getVariantsForProduct } from '@/hooks/useVariants';
import { DELIVERY_OPTIONS, type DeliveryOption, type Product as ProductType } from '@/types/product';
import { useCart } from '@/context/CartContext';
import { cn } from '@/lib/utils';

// Convert DB product to the format expected by components
function mapDbProductToProduct(dbProduct: DbProduct): ProductType {
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

export default function Product() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  
  const { data: dbProduct, isLoading } = useProductBySlug(slug || '');
  const { data: allProducts } = useActiveProducts();
  const variantMap = useVariantMap(allProducts);
  
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [selectedDelivery, setSelectedDelivery] = useState<DeliveryOption>('gta-meetup');
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

  // Get the product
  const product = useMemo(() => dbProduct ? mapDbProductToProduct(dbProduct) : null, [dbProduct]);
  const variants = useMemo(() => dbProduct ? getVariantsForProduct(dbProduct, variantMap) : undefined, [dbProduct, variantMap]);

  // Check if size is in stock
  const getSizeQuantity = (sizeName: string): number => {
    if (!product) return 0;
    const sizeData = product.sizes.find(s => s.size === sizeName);
    return sizeData?.quantity || 0;
  };

  // International shipping bypasses stock limits
  const isInternational = selectedDelivery === 'worldwide-agent';

  // Check if product is sold out (no sizes with inventory) — only for local/Canada
  const isSoldOut = useMemo(() => {
    if (!product) return true;
    if (product.badge === 'sold-out') return true;
    const totalInventory = product.sizes.reduce((sum, s) => sum + s.quantity, 0);
    return totalInventory === 0;
  }, [product]);

  // For international, never consider it sold out (as long as sizes exist)
  const effectivelySoldOut = isInternational ? false : isSoldOut;

  // Check if selected size is in stock
  const selectedSizeQuantity = selectedSize ? getSizeQuantity(selectedSize) : 0;
  const selectedSizeInStock = isInternational ? true : selectedSizeQuantity > 0;

  const hasMultipleSizes = product ? product.sizes.length > 1 : false;
  
  // Get related products
  const relatedProducts = useMemo(() => {
    if (!product || !allProducts) return [];
    return allProducts
      .filter((p) => p.category === product.category && p.id !== product.id && p.is_active)
      .slice(0, 4)
      .map(mapDbProductToProduct);
  }, [allProducts, product]);

  const handleAddToCart = () => {
    if (!product) return;
    if (!selectedSize && hasMultipleSizes) return;
    
    const sizeToAdd = selectedSize || (product.sizes[0]?.size || '');
    addToCart(product, sizeToAdd, selectedDelivery);
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-16 flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </Layout>
    );
  }

  if (!product) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-16 text-center">
          <h1 className="text-2xl font-bold mb-4">Product Not Found</h1>
          <p className="text-muted-foreground mb-8">
            The product you're looking for doesn't exist or has been removed.
          </p>
          <Button asChild>
            <Link to="/shop">Back to Shop</Link>
          </Button>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      {/* Breadcrumb */}
      <div className="container mx-auto px-4 md:px-6 lg:px-10 py-4 border-b border-foreground">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ChevronLeft className="h-4 w-4" />
          Back
        </button>
      </div>

      {/* Product Content */}
      <div className="container mx-auto px-4 md:px-6 lg:px-10 py-8 pb-32 lg:pb-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
          {/* Images */}
          <div className="space-y-4">
            {/* Main Image */}
            <div className="aspect-[3/4] bg-background border border-foreground overflow-hidden">
              <img
                src={product.images[selectedImageIndex]}
                alt={product.title}
                className={cn(
                  'w-full h-full object-cover',
                  effectivelySoldOut && 'opacity-50'
                )}
              />
            </div>

            {/* Thumbnail Grid */}
            {product.images.length > 1 && (
              <div className="grid grid-cols-4 gap-2">
                {product.images.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImageIndex(index)}
                    className={cn(
                      'aspect-square bg-background border overflow-hidden transition-all',
                      selectedImageIndex === index
                        ? 'border-foreground border-2'
                        : 'border-foreground/30 hover:border-foreground'
                    )}
                  >
                    <img
                      src={image}
                      alt={`${product.title} ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Details */}
          <div className="lg:sticky lg:top-24 lg:self-start space-y-6">
            {/* Brand & Title */}
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-widest mb-1">
                {product.brand}
              </p>
              <h1 className="text-2xl md:text-3xl font-bold">{product.title}</h1>
            </div>

            {/* Price & Badge */}
            <div className="flex items-center gap-4 pb-6 border-b border-foreground">
              <div className="flex items-center gap-2">
                <span className="text-2xl font-bold">${product.price}</span>
                {product.compareAtPrice && (
                  <span className="text-lg text-muted-foreground line-through">
                    ${product.compareAtPrice}
                  </span>
                )}
              </div>
              {product.badge && (
                <span className="badge-outline">
                  {product.badge === 'new-in' && 'New In'}
                  {product.badge === 'back-in-stock' && 'Back in Stock'}
                  {product.badge === 'sold-out' && 'Sold Out'}
                </span>
              )}
            </div>

            {/* Color / Style Variants */}
            {variants && variants.length > 1 && (
              <div>
                <span className="section-heading block mb-3">
                  Color / Style{dbProduct?.variant_label ? `: ${dbProduct.variant_label}` : ''}
                </span>
                <div className="flex flex-wrap gap-2">
                  {variants.map((v) => (
                    <Link
                      key={v.slug}
                      to={`/product/${v.slug}`}
                      className={cn(
                        'w-14 h-14 border overflow-hidden transition-all',
                        v.slug === product.slug
                          ? 'border-foreground border-2 ring-1 ring-foreground ring-offset-1 ring-offset-background'
                          : 'border-foreground/30 hover:border-foreground'
                      )}
                    >
                      <img src={v.image} alt={v.label} className="w-full h-full object-cover" />
                    </Link>
                  ))}
                </div>
              </div>
            )}

            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Condition:</span>
              <span className="text-sm font-medium capitalize">{product.condition}</span>
            </div>

            {/* Size Selector */}
            {product.sizes.length > 0 && (
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="section-heading">Size</span>
                  {hasMultipleSizes && !selectedSize && (
                    <span className="text-xs text-destructive">Please select a size</span>
                  )}
                </div>
                <div className="flex flex-wrap gap-2">
                  {product.sizes.map((sizeItem) => {
                    const isOutOfStock = !isInternational && sizeItem.quantity === 0;
                    return (
                      <button
                        key={sizeItem.size}
                        onClick={() => !isOutOfStock && setSelectedSize(sizeItem.size)}
                        disabled={effectivelySoldOut || isOutOfStock}
                        className={cn(
                          'h-10 min-w-[3rem] px-4 border text-sm font-medium transition-all relative',
                          selectedSize === sizeItem.size
                            ? 'border-foreground bg-foreground text-background'
                            : 'border-foreground hover:bg-foreground hover:text-background',
                          (effectivelySoldOut || isOutOfStock) && 'opacity-50 cursor-not-allowed line-through'
                        )}
                      >
                        {sizeItem.size}
                        {!isInternational && sizeItem.quantity > 0 && sizeItem.quantity <= 3 && (
                          <span className="absolute -top-2 -right-2 text-[10px] bg-destructive text-destructive-foreground px-1 rounded">
                            {sizeItem.quantity}
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Delivery Options */}
            <div>
              <span className="section-heading block mb-3">Delivery Option</span>
              <RadioGroup
                value={selectedDelivery}
                onValueChange={(value) => setSelectedDelivery(value as DeliveryOption)}
                className="space-y-2"
              >
                {DELIVERY_OPTIONS.map((option) => (
                  <div
                    key={option.value}
                    className={cn(
                      'flex items-start gap-3 p-4 border cursor-pointer transition-all',
                      selectedDelivery === option.value
                        ? 'border-foreground bg-accent'
                        : 'border-foreground/30 hover:border-foreground'
                    )}
                  >
                    <RadioGroupItem
                      value={option.value}
                      id={option.value}
                      className="mt-0.5 border-foreground"
                    />
                    <Label htmlFor={option.value} className="flex-1 cursor-pointer">
                      <span className="font-medium block">{option.label}</span>
                      <span className="text-xs text-muted-foreground block">
                        {option.description}
                      </span>
                      {option.detail && (
                        <span className="text-xs text-muted-foreground">
                          ({option.detail})
                        </span>
                      )}
                    </Label>
                  </div>
                ))}
              </RadioGroup>
              {isInternational && (
                <p className="text-xs text-muted-foreground mt-2">
                  All sizes available to order through our shipping partner — no stock limits.
                </p>
              )}
            </div>

            {/* Add to Cart Button */}
            <Button
              size="lg"
              className="w-full h-14 text-base font-bold rounded-2xl"
              onClick={handleAddToCart}
              disabled={effectivelySoldOut || (hasMultipleSizes && !selectedSize) || (selectedSize && !selectedSizeInStock)}
            >
              {effectivelySoldOut ? 'Sold Out' : selectedSize && !selectedSizeInStock ? 'Out of Stock' : 'Add to Cart'}
            </Button>

            {/* What to Expect */}
            <WhatToExpect />

            {/* Accordions */}
            <Accordion type="single" collapsible className="w-full border-t border-foreground">
              <AccordionItem value="details" className="border-b border-foreground">
                <AccordionTrigger className="section-heading hover:no-underline py-4">
                  Product Details
                </AccordionTrigger>
                <AccordionContent className="text-sm text-muted-foreground pb-4">
                  {product.description || 'No description available.'}
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="shipping" className="border-b border-foreground">
                <AccordionTrigger className="section-heading hover:no-underline py-4">
                  Shipping Information
                </AccordionTrigger>
                <AccordionContent className="text-sm text-muted-foreground space-y-3 pb-4">
                  <p><strong>Toronto / GTA Meetup:</strong> Free local pickup within the Greater Toronto Area. Appointment-based after checkout.</p>
                  <p><strong>Canada Shipping:</strong> Standard tracked shipping across Canada. 3–7 business days.</p>
                  <p><strong>International Shipping:</strong> Order any size — sourced and shipped worldwide through our verified partner. All sizes available, tracking provided.</p>
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="question" className="border-b border-foreground">
                <AccordionTrigger className="section-heading hover:no-underline py-4">
                  Ask a Question
                </AccordionTrigger>
                <AccordionContent className="text-sm text-muted-foreground pb-4">
                  <p className="mb-2">Have questions about this product?</p>
                  <Button variant="outline" size="sm" className="rounded-2xl" asChild>
                    <Link to="/contact">Contact Us</Link>
                  </Button>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>
        </div>

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <section className="mt-16 md:mt-24 pt-8 border-t border-foreground">
            <h2 className="section-heading mb-8">You May Also Like</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
              {relatedProducts.map((p) => {
                const dbP = allProducts?.find(ap => ap.id === p.id);
                const rv = dbP ? getVariantsForProduct(dbP, variantMap) : undefined;
                return <ProductCard key={p.id} product={p} variants={rv} />;
              })}
            </div>
          </section>
        )}
      </div>

      {/* Mobile Sticky Add to Cart Bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-background border-t border-foreground p-4 lg:hidden z-40">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="font-bold">${product.price}</p>
            {selectedSize && (
              <p className="text-xs text-muted-foreground">Size: {selectedSize}</p>
            )}
          </div>
          <Button
            size="lg"
            className="flex-1 h-12 font-bold rounded-2xl"
            onClick={handleAddToCart}
            disabled={effectivelySoldOut || (hasMultipleSizes && !selectedSize) || (selectedSize && !selectedSizeInStock)}
          >
            {effectivelySoldOut ? 'Sold Out' : 'Add to Cart'}
          </Button>
        </div>
      </div>
    </Layout>
  );
}
