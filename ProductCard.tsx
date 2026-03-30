import { Link } from 'react-router-dom';
import { Product } from '@/types/product';
import { cn } from '@/lib/utils';

interface VariantInfo {
  slug: string;
  label: string;
  image: string;
}

interface ProductCardProps {
  product: Product;
  variants?: VariantInfo[];
}

export function ProductCard({ product, variants }: ProductCardProps) {
  // Calculate total inventory from sizes
  const totalInventory = product.sizes.reduce((sum, s) => sum + s.quantity, 0);
  const isSoldOut = product.badge === 'sold-out' || totalInventory === 0;

  return (
    <Link
      to={`/product/${product.slug}`}
      className="group block"
    >
      {/* Image Container with strong black border */}
      <div className="relative aspect-[3/4] bg-background rounded-none overflow-hidden mb-3 border border-foreground">
        {/* Badge - outlined black pill */}
        {product.badge && (
          <div className="absolute top-3 left-3 z-10">
            <span
              className={cn(
                'badge-outline inline-block',
                product.badge === 'sold-out' && 'bg-background/80'
              )}
            >
              {product.badge === 'new-in' && 'New In'}
              {product.badge === 'back-in-stock' && 'Back in Stock'}
              {product.badge === 'sold-out' && 'Sold Out'}
            </span>
          </div>
        )}

        {/* Product Images with hover swap + zoom */}
        <div className="product-image-swap w-full h-full">
          <img
            src={product.images[0]}
            alt={product.title}
            className={cn(
              'image-primary w-full h-full object-cover',
              isSoldOut && 'opacity-50'
            )}
            loading="lazy"
          />
          {product.images[1] && (
            <img
              src={product.images[1]}
              alt={`${product.title} - alternate`}
              className="image-secondary w-full h-full object-cover"
              loading="lazy"
            />
          )}
        </div>

        {/* Hover border emphasis */}
        <div className="absolute inset-0 border-2 border-transparent group-hover:border-foreground transition-colors pointer-events-none" />
      </div>

      {/* Product Info */}
      <div className="space-y-1">
        <p className="text-[11px] text-muted-foreground uppercase tracking-widest">
          {product.brand}
        </p>
        <h3 className="product-title group-hover:underline underline-offset-2">
          {product.title}
        </h3>
        <div className="flex items-center gap-2">
          <span className={cn('price', isSoldOut && 'text-muted-foreground')}>
            ${product.price}
          </span>
          {product.compareAtPrice && !isSoldOut && (
            <span className="text-xs text-muted-foreground line-through">
              ${product.compareAtPrice}
            </span>
          )}
        </div>

        {/* Variant color dots */}
        {variants && variants.length > 1 && (
          <div className="flex items-center gap-1.5 pt-1">
            {variants.map((v) => (
              <Link
                key={v.slug}
                to={`/product/${v.slug}`}
                onClick={(e) => e.stopPropagation()}
                title={v.label}
                className={cn(
                  'w-5 h-5 rounded-full border overflow-hidden transition-all',
                  v.slug === product.slug
                    ? 'border-foreground ring-1 ring-foreground ring-offset-1 ring-offset-background'
                    : 'border-foreground/40 hover:border-foreground'
                )}
              >
                <img src={v.image} alt={v.label} className="w-full h-full object-cover" />
              </Link>
            ))}
            <span className="text-[10px] text-muted-foreground ml-1">
              {variants.length} colors
            </span>
          </div>
        )}
      </div>
    </Link>
  );
}
