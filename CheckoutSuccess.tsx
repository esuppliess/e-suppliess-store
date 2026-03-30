import { useEffect, useState, useRef, useCallback } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { CheckCircle, Package, ArrowRight, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Layout } from '@/components/layout/Layout';
import { useCart } from '@/context/CartContext';
import { supabase } from '@/integrations/supabase/client';

export default function CheckoutSuccess() {
  const [searchParams] = useSearchParams();
  const sessionId = searchParams.get('session_id');
  const { clearCart } = useCart();
  const [verifying, setVerifying] = useState(true);
  const [orderId, setOrderId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const hasVerified = useRef(false);

  const stableClearCart = useCallback(clearCart, []);

  useEffect(() => {
    if (hasVerified.current) return;
    hasVerified.current = true;

    const verifyPayment = async () => {
      if (!sessionId) {
        setError('No session ID found');
        setVerifying(false);
        return;
      }

      try {
        const { data, error: fnError } = await supabase.functions.invoke('verify-payment', {
          body: { sessionId },
        });

        if (fnError) throw fnError;

        if (data.success) {
          setOrderId(data.orderId);
          stableClearCart();
        } else {
          setError(data.message || 'Payment verification failed');
        }
      } catch (err) {
        console.error('Payment verification error:', err);
        setError('Failed to verify payment. Please contact support.');
      } finally {
        setVerifying(false);
      }
    };

    verifyPayment();
  }, [sessionId, stableClearCart]);

  if (verifying) {
    return (
      <Layout>
        <div className="container mx-auto px-4 md:px-6 lg:px-10 py-16 text-center">
          <Loader2 className="h-12 w-12 mx-auto animate-spin text-foreground mb-4" />
          <h1 className="text-2xl font-bold mb-2">Verifying Payment...</h1>
          <p className="text-muted-foreground">Please wait while we confirm your order.</p>
        </div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout>
        <div className="container mx-auto px-4 md:px-6 lg:px-10 py-16 text-center">
          <div className="max-w-md mx-auto">
            <div className="w-16 h-16 mx-auto mb-6 rounded-full border-2 border-foreground flex items-center justify-center">
              <span className="text-2xl">!</span>
            </div>
            <h1 className="text-2xl font-bold mb-4">Something Went Wrong</h1>
            <p className="text-muted-foreground mb-8">{error}</p>
            <Button className="rounded-2xl" asChild>
              <Link to="/contact">Contact Support</Link>
            </Button>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto px-4 md:px-6 lg:px-10 py-16 text-center">
        <div className="max-w-md mx-auto">
          <div className="w-20 h-20 mx-auto mb-6 rounded-full border-2 border-foreground flex items-center justify-center bg-foreground">
            <CheckCircle className="h-10 w-10 text-background" />
          </div>
          
          <h1 className="text-3xl font-bold mb-4">Order Confirmed!</h1>
          <p className="text-muted-foreground mb-2">
            Thank you for your purchase. We've received your order and will begin processing it shortly.
          </p>
          
          {orderId && (
            <p className="text-sm text-muted-foreground mb-8">
              Order ID: <span className="font-mono font-medium text-foreground">{orderId.slice(0, 8).toUpperCase()}</span>
            </p>
          )}

          <div className="border border-foreground p-6 mb-8 text-left">
            <div className="flex items-start gap-4">
              <Package className="h-6 w-6 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="font-bold mb-1">What's Next?</h3>
                <ul className="text-sm text-muted-foreground space-y-2">
                  <li>• You'll receive an email confirmation shortly</li>
                  <li>• We'll notify you when your order ships</li>
                  <li>• For GTA meetups, we'll reach out to coordinate</li>
                </ul>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button className="rounded-2xl" asChild>
              <Link to="/shop">
                Continue Shopping
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button variant="outline" className="rounded-2xl" asChild>
              <Link to="/contact">Need Help?</Link>
            </Button>
          </div>
        </div>
      </div>
    </Layout>
  );
}
