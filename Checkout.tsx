import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ShoppingBag, ArrowLeft, CreditCard, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Layout } from '@/components/layout/Layout';
import { useCart } from '@/context/CartContext';
import { DELIVERY_OPTIONS } from '@/types/product';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export default function Checkout() {
  const { items, subtotal } = useCart();
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Get the primary delivery option from cart (use first item's option)
  const primaryDeliveryOption = items[0]?.deliveryOption || 'canada-shipping';

  const handleCheckout = async () => {
    if (!email) {
      toast.error('Please enter your email address');
      return;
    }

    setIsLoading(true);
    try {
      const response = await supabase.functions.invoke('create-checkout', {
        body: {
          items: items.map((item) => ({
            product: {
              id: item.product.id,
              title: item.product.title,
              price: item.product.price,
              images: item.product.images,
            },
            quantity: item.quantity,
            selectedSize: item.selectedSize,
            deliveryOption: item.deliveryOption,
          })),
          deliveryOption: primaryDeliveryOption,
          customerEmail: email,
        },
      });

      // Handle errors from the edge function
      if (response.error) {
        const errorData = response.data;
        console.error('[Checkout] Edge function error:', { error: response.error, data: errorData });

        if (errorData?.error === 'inventory_error' && errorData?.details) {
          const details = errorData.details as string[];
          details.forEach((msg: string) => toast.error(msg));
          return;
        }

        // Show the backend error message if available
        const backendMsg = errorData?.error || errorData?.message;
        if (backendMsg) {
          toast.error(backendMsg);
          return;
        }

        throw response.error;
      }

      if (response.data?.url) {
        window.location.href = response.data.url;
      } else {
        throw new Error('No checkout URL received');
      }
    } catch (err) {
      console.error('[Checkout] Checkout error:', err);
      const message = err instanceof Error ? err.message : 'Unknown error';
      toast.error(`Checkout failed: ${message}`);
    } finally {
      setIsLoading(false);
    }
  };

  if (items.length === 0) {
    return (
      <Layout>
        <div className="container mx-auto px-4 md:px-6 lg:px-10 py-16 text-center">
          <ShoppingBag className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
          <h1 className="text-2xl font-bold mb-4">Your Cart is Empty</h1>
          <p className="text-muted-foreground mb-8">
            Add some items to your cart to proceed to checkout.
          </p>
          <Button className="rounded-2xl" asChild>
            <Link to="/shop">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Continue Shopping
            </Link>
          </Button>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto px-4 md:px-6 lg:px-10 py-8 max-w-4xl">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8 pb-6 border-b border-foreground">
          <Button variant="ghost" size="icon" asChild>
            <Link to="/shop">
              <ArrowLeft className="h-5 w-5" />
            </Link>
          </Button>
          <h1 className="text-2xl font-bold">Checkout</h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Order Summary */}
          <div className="order-2 lg:order-1">
            <div className="border border-foreground p-6">
              <h2 className="section-heading mb-6">Order Summary</h2>
              
              <div className="space-y-4 mb-6">
                {items.map((item) => (
                  <div
                    key={`${item.product.id}-${item.selectedSize}`}
                    className="flex gap-4 pb-4 border-b border-foreground/20"
                  >
                    <div className="w-16 h-20 bg-background border border-foreground overflow-hidden flex-shrink-0">
                      <img
                        src={item.product.images[0]}
                        alt={item.product.title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium line-clamp-1">{item.product.title}</p>
                      <p className="text-xs text-muted-foreground">Size: {item.selectedSize}</p>
                      <p className="text-xs text-muted-foreground">
                        {DELIVERY_OPTIONS.find((d) => d.value === item.deliveryOption)?.label}
                      </p>
                      <div className="flex items-center justify-between mt-1">
                        <span className="text-xs text-muted-foreground">Qty: {item.quantity}</span>
                        <span className="text-sm font-bold">
                          ${(item.product.price * item.quantity).toFixed(2)}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span>${subtotal.toFixed(2)}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Shipping</span>
                  <span className="text-muted-foreground">Calculated at next step</span>
                </div>
                <div className="flex items-center justify-between text-lg font-bold pt-4 border-t border-foreground">
                  <span>Total</span>
                  <span>${subtotal.toFixed(2)} CAD</span>
                </div>
              </div>
            </div>
          </div>

          {/* Checkout Form */}
          <div className="order-1 lg:order-2">
            <div className="border border-foreground p-6">
              <h2 className="section-heading mb-6">Contact Information</h2>
              
              <div className="space-y-4 mb-6">
                <div>
                  <Label htmlFor="email" className="text-sm font-medium">
                    Email Address
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="your@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="mt-1 border-foreground"
                    required
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    We'll send your order confirmation here
                  </p>
                </div>
              </div>

              <div className="border border-foreground/20 p-4 mb-6 bg-secondary/30">
                <h3 className="font-bold text-sm mb-2">Secure Payment</h3>
                <p className="text-xs text-muted-foreground mb-3">
                  You'll be redirected to our secure payment partner to complete your purchase.
                </p>
                <div className="flex items-center gap-3 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <CreditCard className="h-4 w-4" />
                    Credit/Debit
                  </span>
                  <span>•</span>
                  <span>Apple Pay</span>
                </div>
              </div>

              <Button 
                className="w-full h-12 rounded-2xl font-bold" 
                onClick={handleCheckout}
                disabled={isLoading || !email}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Redirecting...
                  </>
                ) : (
                  <>
                    <CreditCard className="mr-2 h-4 w-4" />
                    Proceed to Payment
                  </>
                )}
              </Button>

              <p className="text-xs text-muted-foreground text-center mt-4">
                By completing your purchase, you agree to our{' '}
                <Link to="/terms" className="underline">Terms of Service</Link> and{' '}
                <Link to="/privacy" className="underline">Privacy Policy</Link>.
              </p>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
