import { ReactNode } from 'react';
import { Header } from './Header';
import { Footer } from './Footer';
import { TrustStrip } from './TrustStrip';
import { CartDrawer } from '@/components/cart/CartDrawer';

interface LayoutProps {
  children: ReactNode;
}

export function Layout({ children }: LayoutProps) {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 pt-14 md:pt-16">{children}</main>
      <TrustStrip />
      <Footer />
      <CartDrawer />
    </div>
  );
}
