import { useState, useEffect } from 'react';
import { ExternalLink, Clock, Users, Star, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Layout } from '@/components/layout/Layout';
import { useVendorProducts, DbVendorProduct } from '@/hooks/useVendorProducts';
import { cn } from '@/lib/utils';

const PLACEHOLDER_IMAGE = '/placeholder.svg';

function CountdownTimer() {
  const [time, setTime] = useState({ hours: 23, minutes: 10, seconds: 0 });

  useEffect(() => {
    const timer = setInterval(() => {
      setTime((prev) => {
        let { hours, minutes, seconds } = prev;
        seconds--;
        if (seconds < 0) {
          seconds = 59;
          minutes--;
        }
        if (minutes < 0) {
          minutes = 59;
          hours--;
        }
        if (hours < 0) {
          hours = 23;
          minutes = 59;
          seconds = 59;
        }
        return { hours, minutes, seconds };
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  return (
    <div className="flex items-center gap-1 text-sm font-mono">
      <Clock className="h-4 w-4 text-destructive mr-1" />
      <span className="text-destructive font-bold">
        {String(time.hours).padStart(2, '0')}:{String(time.minutes).padStart(2, '0')}:
        {String(time.seconds).padStart(2, '0')}
      </span>
    </div>
  );
}

function VendorProductCard({
  product,
  onViewDetails,
}: {
  product: DbVendorProduct;
  onViewDetails: () => void;
}) {
  return (
    <div
      className={cn(
        'relative bg-background border border-foreground transition-all hover:bg-accent overflow-hidden flex flex-col',
        product.is_best_deal && 'ring-2 ring-foreground'
      )}
    >
      {/* Best Deal Badge */}
      {product.is_best_deal && (
        <div className="absolute top-3 right-3 z-10">
          <span className="bg-foreground text-background text-xs font-bold px-3 py-1 uppercase tracking-wider">
            Best Deal
          </span>
        </div>
      )}

      {/* Image */}
      <div className="aspect-[4/3] bg-muted border-b border-foreground flex-shrink-0">
        <img
          src={product.image_url || PLACEHOLDER_IMAGE}
          alt={product.title}
          className="w-full h-full object-cover"
        />
      </div>

      {/* Content */}
      <div className="p-6 flex flex-col flex-1">
        {/* Title & Description - Fixed height area */}
        <div className="flex-1 min-h-[80px]">
          <h3 className="text-xl font-bold mb-2 line-clamp-1">{product.title}</h3>
          <p className="text-sm text-muted-foreground line-clamp-2">{product.description}</p>
        </div>

        {/* Pricing - Always at same position */}
        <div className="flex items-center gap-3 mb-6 mt-4">
          <span className="text-3xl font-bold">${product.price}</span>
          <span className="text-lg text-muted-foreground line-through">
            ${product.original_price}
          </span>
          <span className="badge-outline">
            {Math.round((1 - product.price / product.original_price) * 100)}% OFF
          </span>
        </div>

        {/* Buttons - Always at bottom */}
        <div className="space-y-3">
          <Button
            variant="outline"
            className="w-full rounded-2xl"
            onClick={onViewDetails}
          >
            DETAILS +
          </Button>
          <Button
            className="w-full h-12 rounded-2xl text-base font-bold"
            asChild
          >
            <a
              href={product.beacons_url}
              target="_blank"
              rel="noopener noreferrer"
            >
              GET ACCESS
              <ExternalLink className="ml-2 h-4 w-4" />
            </a>
          </Button>
        </div>
      </div>
    </div>
  );
}

export default function Vendors() {
  const { data: vendors, isLoading } = useVendorProducts();
  const [selectedProduct, setSelectedProduct] = useState<DbVendorProduct | null>(null);

  return (
    <Layout>
      {/* Sticky Stats Bar */}
      <div className="sticky top-14 md:top-16 z-40 bg-background border-b border-foreground">
        <div className="container mx-auto px-4 md:px-6 lg:px-10 py-3">
          <div className="flex flex-wrap items-center justify-center gap-4 md:gap-8 text-sm">
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              <span className="font-bold">10,247</span>
              <span className="text-muted-foreground">happy customers</span>
            </div>
            <span className="hidden sm:block text-foreground">—</span>
            <div className="flex items-center gap-2">
              <Star className="h-4 w-4" />
              <span className="font-bold">4.98/5</span>
              <span className="text-muted-foreground">rating</span>
            </div>
            <span className="hidden sm:block text-foreground">—</span>
            <div className="flex items-center gap-2">
              <Eye className="h-4 w-4" />
              <span className="font-bold">54</span>
              <span className="text-muted-foreground">viewing now</span>
            </div>
            <span className="hidden sm:block text-foreground">—</span>
            <div className="flex items-center gap-1">
              <span className="text-muted-foreground text-xs">Price increasing in:</span>
              <CountdownTimer />
            </div>
          </div>
        </div>
      </div>

      {/* Hero Section */}
      <section className="py-16 md:py-24 border-b border-foreground">
        <div className="container mx-auto px-4 md:px-6 lg:px-10 text-center">
          <span className="section-heading text-muted-foreground">Exclusive Vendor Access</span>
          <h1 className="text-4xl md:text-6xl font-bold mt-4 mb-6">
            Get the Vendors
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-8 leading-relaxed">
            Skip years of trial and error. Get instant access to our verified vendor contacts 
            and start sourcing premium products at wholesale prices.
          </p>
        </div>
      </section>

      {/* Vendor Products Grid */}
      <section className="py-16 md:py-24">
        <div className="container mx-auto px-4 md:px-6 lg:px-10">
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="border border-foreground animate-pulse">
                  <div className="aspect-[4/3] bg-muted" />
                  <div className="p-6 space-y-4">
                    <div className="h-6 bg-muted rounded w-3/4" />
                    <div className="h-4 bg-muted rounded w-full" />
                    <div className="h-10 bg-muted rounded w-1/2" />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {vendors?.map((product) => (
                <VendorProductCard
                  key={product.id}
                  product={product}
                  onViewDetails={() => setSelectedProduct(product)}
                />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Section Divider */}
      <div className="section-divider" />

      {/* Trust Section */}
      <section className="py-16 md:py-24">
        <div className="container mx-auto px-4 md:px-6 lg:px-10">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div className="p-6 border border-foreground">
              <div className="w-12 h-12 mx-auto mb-4 border border-foreground flex items-center justify-center">
                <Clock className="h-6 w-6" />
              </div>
              <h3 className="font-bold mb-2">Instant Delivery</h3>
              <p className="text-sm text-muted-foreground">
                Get immediate access to your vendor lists after purchase
              </p>
            </div>
            <div className="p-6 border border-foreground">
              <div className="w-12 h-12 mx-auto mb-4 border border-foreground flex items-center justify-center">
                <Star className="h-6 w-6" />
              </div>
              <h3 className="font-bold mb-2">Verified Vendors</h3>
              <p className="text-sm text-muted-foreground">
                All vendors personally vetted and quality tested
              </p>
            </div>
            <div className="p-6 border border-foreground">
              <div className="w-12 h-12 mx-auto mb-4 border border-foreground flex items-center justify-center">
                <Users className="h-6 w-6" />
              </div>
              <h3 className="font-bold mb-2">Community Support</h3>
              <p className="text-sm text-muted-foreground">
                Join thousands of successful resellers
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Details Modal */}
      <Dialog open={!!selectedProduct} onOpenChange={() => setSelectedProduct(null)}>
        <DialogContent className="bg-background border border-foreground max-w-md rounded-none">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold">{selectedProduct?.title}</DialogTitle>
            <DialogDescription className="text-muted-foreground">
              {selectedProduct?.description}
            </DialogDescription>
          </DialogHeader>
          
          {/* Modal Image */}
          {selectedProduct?.image_url && (
            <div className="aspect-video bg-muted border border-foreground overflow-hidden">
              <img
                src={selectedProduct.image_url}
                alt={selectedProduct.title}
                className="w-full h-full object-cover"
              />
            </div>
          )}
          
          <div className="space-y-4 py-4">
            <div>
              <h4 className="section-heading mb-3">What's Included:</h4>
              <ul className="space-y-2">
                {selectedProduct?.features.map((feature, index) => (
                  <li key={index} className="flex items-start gap-2 text-sm">
                    <span className="mt-0.5">✓</span>
                    <span className="text-muted-foreground">{feature}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="pt-4 border-t border-foreground space-y-2">
              <p className="text-xs text-muted-foreground">
                <strong>Delivery Method:</strong> Instant digital access
              </p>
              <p className="text-xs text-muted-foreground">
                ⚠️ This is a digital product, not a physical item.
              </p>
              <p className="text-xs text-muted-foreground">
                🔒 All vendor information is confidential. Sharing is prohibited.
              </p>
            </div>
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-foreground">
            <div>
              <span className="text-2xl font-bold">
                ${selectedProduct?.price}
              </span>
              <span className="text-sm text-muted-foreground line-through ml-2">
                ${selectedProduct?.original_price}
              </span>
            </div>
            <Button className="rounded-2xl font-bold" asChild>
              <a
                href={selectedProduct?.beacons_url}
                target="_blank"
                rel="noopener noreferrer"
              >
                GET ACCESS
                <ExternalLink className="ml-2 h-4 w-4" />
              </a>
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </Layout>
  );
}
