import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { CartItem, Product, DeliveryOption, SizeInventory } from '@/types/product';
import { toast } from 'sonner';

interface CartContextType {
  items: CartItem[];
  isOpen: boolean;
  openCart: () => void;
  closeCart: () => void;
  addToCart: (product: Product, size: string, deliveryOption: DeliveryOption) => void;
  removeFromCart: (productId: string, size: string) => void;
  updateQuantity: (productId: string, size: string, quantity: number) => void;
  clearCart: () => void;
  totalItems: number;
  subtotal: number;
  getAvailableStock: (productId: string, size: string, product: Product) => number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const CART_STORAGE_KEY = 'e-supplies-cart';

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isOpen, setIsOpen] = useState(false);

  // Load cart from localStorage on mount
  useEffect(() => {
    const savedCart = localStorage.getItem(CART_STORAGE_KEY);
    if (savedCart) {
      try {
        setItems(JSON.parse(savedCart));
      } catch (e) {
        console.error('Failed to parse cart from localStorage:', e);
      }
    }
  }, []);

  // Save cart to localStorage on change
  useEffect(() => {
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
  }, [items]);

  const openCart = () => setIsOpen(true);
  const closeCart = () => setIsOpen(false);

  // Get available stock for a variant, accounting for what's already in cart
  const getAvailableStock = (productId: string, size: string, product: Product): number => {
    const sizeData = product.sizes.find(s => s.size === size);
    const totalStock = sizeData?.quantity || 0;
    const inCart = items.find(item => item.product.id === productId && item.selectedSize === size)?.quantity || 0;
    return Math.max(totalStock - inCart, 0);
  };

  const addToCart = (product: Product, size: string, deliveryOption: DeliveryOption) => {
    const sizeData = product.sizes.find(s => s.size === size);
    const totalStock = sizeData?.quantity || 0;

    setItems((prevItems) => {
      const existingItem = prevItems.find(
        (item) => item.product.id === product.id && item.selectedSize === size
      );
      const currentQty = existingItem?.quantity || 0;

      if (currentQty + 1 > totalStock) {
        toast.error(`Only ${totalStock} left for Size ${size}.`);
        return prevItems;
      }

      if (existingItem) {
        return prevItems.map(item =>
          item.product.id === product.id && item.selectedSize === size
            ? { ...item, quantity: item.quantity + 1, deliveryOption }
            : item
        );
      }

      return [...prevItems, { product, quantity: 1, selectedSize: size, deliveryOption }];
    });
    openCart();
  };

  const removeFromCart = (productId: string, size: string) => {
    setItems((prevItems) =>
      prevItems.filter(
        (item) => !(item.product.id === productId && item.selectedSize === size)
      )
    );
  };

  const updateQuantity = (productId: string, size: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId, size);
      return;
    }

    setItems((prevItems) => {
      const item = prevItems.find(i => i.product.id === productId && i.selectedSize === size);
      if (!item) return prevItems;

      const sizeData = item.product.sizes.find(s => s.size === size);
      const maxStock = sizeData?.quantity || 0;

      if (quantity > maxStock) {
        toast.error(`Only ${maxStock} available for Size ${size}.`);
        return prevItems.map(i =>
          i.product.id === productId && i.selectedSize === size
            ? { ...i, quantity: maxStock }
            : i
        );
      }

      return prevItems.map(i =>
        i.product.id === productId && i.selectedSize === size
          ? { ...i, quantity }
          : i
      );
    });
  };

  const clearCart = () => {
    setItems([]);
  };

  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
  const subtotal = items.reduce((sum, item) => sum + item.product.price * item.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        items,
        isOpen,
        openCart,
        closeCart,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        totalItems,
        subtotal,
        getAvailableStock,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
