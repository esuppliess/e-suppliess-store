import { X, Minus, Plus, ShoppingBag, AlertTriangle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { useCart } from '@/context/CartContext';
import { cn } from '@/lib/utils';

export function CartDrawer() {
  const { items, isOpen, closeCart, removeFromCart, updateQuantity, subtotal, totalItems } = useCart();

  return (
    <Sheet open={isOpen} onOpenChange={closeCart}>
      <SheetContent className="w-full sm:max-w-md bg-background border-l border-foreground flex flex-col">
        <SheetHeader className="border-b border-foreground pb-4">
          <SheetTitle className="flex items-center gap-2 text-foreground section-heading">
            <ShoppingBag className="h-4 w-4" />
            Your Cart ({totalItems})
          </SheetTitle>
        </SheetHeader>

        {items.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center gap-4">
            <ShoppingBag className="h-16 w-16 text-muted-foreground" />
            <p className="text-muted-foreground">Your cart is empty</p>
            <Button onClick={closeCart} className="rounded-2xl" asChild>
              <Link to="/shop">Continue Shopping</Link>
            </Button>
          </div>
        ) : (
          <>
            <div className="flex-1 overflow-y-auto py-4">
              <div className="space-y-4">
                {items.map((item) => {
                  const sizeData = item.product.sizes.find(s => s.size === item.selectedSize);
                  const maxStock = sizeData?.quantity || 0;
                  const isOverStock = item.quantity > maxStock;
                  const isLowStock = maxStock > 0 && maxStock <= 3;

                  return (
                    <div
                      key={`${item.product.id}-${item.selectedSize}`}
                      className={cn(
                        "flex gap-4 pb-4 border-b border-foreground/20",
                        isOverStock && "bg-destructive/10 p-2 rounded"
                      )}
                    >
                      {/* Product Image */}
                      <div className="w-20 h-24 bg-background border border-foreground overflow-hidden flex-shrink-0">
                        <img
                          src={item.product.images[0]}
                          alt={item.product.title}
                          className="w-full h-full object-cover"
                        />
                      </div>

                      {/* Product Details */}
                      <div className="flex-1 min-w-0">
                        <Link
                          to={`/product/${item.product.slug}`}
                          className="text-sm font-medium hover:underline line-clamp-2"
                          onClick={closeCart}
                        >
                          {item.product.title}
                        </Link>
                        <p className="text-xs text-muted-foreground mt-1">
                          Size: {item.selectedSize}
                        </p>
                        <p className="text-sm font-bold mt-1">
                          ${item.product.price}
                        </p>

                        {/* Stock warning */}
                        {isOverStock && (
                          <p className="text-xs text-destructive flex items-center gap-1 mt-1">
                            <AlertTriangle className="h-3 w-3" />
                            Only {maxStock} available
                          </p>
                        )}
                        {!isOverStock && isLowStock && (
                          <p className="text-xs text-destructive/80 mt-1">
                            Only {maxStock} left
                          </p>
                        )}

                        {/* Quantity Controls */}
                        <div className="flex items-center gap-2 mt-2">
                          <button
                            onClick={() =>
                              updateQuantity(
                                item.product.id,
                                item.selectedSize,
                                item.quantity - 1
                              )
                            }
                            className="h-7 w-7 flex items-center justify-center border border-foreground hover:bg-foreground hover:text-background transition-colors"
                          >
                            <Minus className="h-3 w-3" />
                          </button>
                          <span className="text-sm w-6 text-center font-medium">{item.quantity}</span>
                          <button
                            onClick={() =>
                              updateQuantity(
                                item.product.id,
                                item.selectedSize,
                                item.quantity + 1
                              )
                            }
                            disabled={item.quantity >= maxStock}
                            className={cn(
                              "h-7 w-7 flex items-center justify-center border border-foreground transition-colors",
                              item.quantity >= maxStock
                                ? "opacity-50 cursor-not-allowed"
                                : "hover:bg-foreground hover:text-background"
                            )}
                          >
                            <Plus className="h-3 w-3" />
                          </button>
                        </div>
                      </div>

                      {/* Remove Button */}
                      <button
                        onClick={() => removeFromCart(item.product.id, item.selectedSize)}
                        className="text-muted-foreground hover:text-foreground transition-colors"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Footer */}
            <div className="border-t border-foreground pt-4 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Subtotal</span>
                <span className="text-lg font-bold">${subtotal.toFixed(2)}</span>
              </div>
              <p className="text-xs text-muted-foreground">
                Shipping calculated at checkout
              </p>
              <Button className="w-full h-12 text-base font-bold rounded-2xl" asChild>
                <Link to="/checkout" onClick={closeCart}>
                  Checkout
                </Link>
              </Button>
              <Button
                variant="outline"
                className="w-full rounded-2xl"
                onClick={closeCart}
                asChild
              >
                <Link to="/shop">Continue Shopping</Link>
              </Button>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}
