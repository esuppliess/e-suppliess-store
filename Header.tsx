import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, Search, ShoppingBag } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { useCart } from '@/context/CartContext';
import { useSiteSettings } from '@/hooks/useSiteSettings';
import { cn } from '@/lib/utils';

const NAV_LINKS = [
  { href: '/shop', label: 'Shop' },
  { href: '/vendors', label: 'Vendors' },
  { href: '/vouches', label: 'Vouches' },
  { href: '/faqs', label: 'FAQs' },
  { href: '/contact', label: 'Contact' },
];

export function Header() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { totalItems, openCart } = useCart();
  const { data: settings } = useSiteSettings();
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location.pathname]);

  return (
    <header
      className={cn(
        'fixed top-0 left-0 right-0 z-50 transition-all duration-300 bg-background border-b border-foreground'
      )}
    >
      <div className="container mx-auto px-4 md:px-6 lg:px-10">
        <div className="flex items-center justify-between h-14 md:h-16">
          {/* Left - Logo */}
          <div className="flex items-center w-1/4">
            <Link to="/" className="flex items-center">
              {settings?.logo_url ? (
                <img
                  src={settings.logo_url}
                  alt="E Supplies"
                  className="h-6 md:h-8 max-w-[120px] md:max-w-[160px] object-contain"
                />
              ) : (
                <span className="text-lg md:text-xl font-bold tracking-tight">
                  E SUPPLIES
                </span>
              )}
            </Link>
          </div>

          {/* Center - Nav Links (desktop) */}
          <nav className="hidden md:flex items-center justify-center gap-8">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                to={link.href}
                className={cn(
                  'text-xs font-bold uppercase tracking-widest transition-colors hover:text-foreground hover:underline underline-offset-4 pb-0.5',
                  location.pathname === link.href
                    ? 'text-foreground underline'
                    : 'text-muted-foreground'
                )}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Right - Search & Cart (desktop) / Menu & Cart (mobile) */}
          <div className="flex items-center justify-end gap-1 w-1/4">
            <Button
              variant="ghost"
              size="icon"
              className="hover:bg-transparent hidden md:flex"
            >
              <Search className="h-5 w-5" />
              <span className="sr-only">Search</span>
            </Button>

            <Button
              variant="ghost"
              size="icon"
              className="hover:bg-transparent relative"
              onClick={openCart}
            >
              <ShoppingBag className="h-5 w-5" />
              {totalItems > 0 && (
                <span className="absolute -top-1 -right-1 h-4 w-4 flex items-center justify-center bg-foreground text-background text-[10px] font-bold rounded-full">
                  {totalItems}
                </span>
              )}
              <span className="sr-only">Cart ({totalItems} items)</span>
            </Button>

            {/* Mobile Menu Toggle */}
            <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
              <SheetTrigger asChild className="md:hidden">
                <Button variant="ghost" size="icon" className="hover:bg-transparent">
                  <Menu className="h-5 w-5" />
                  <span className="sr-only">Menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[280px] bg-background border-l border-foreground">
                <nav className="flex flex-col gap-6 mt-8">
                  <Link
                    to="/"
                    className={cn(
                      'text-base font-medium tracking-wide transition-colors hover:text-muted-foreground',
                      location.pathname === '/' ? 'text-foreground' : 'text-muted-foreground'
                    )}
                  >
                    Home
                  </Link>
                  {NAV_LINKS.map((link) => (
                    <Link
                      key={link.href}
                      to={link.href}
                      className={cn(
                        'text-base font-medium tracking-wide transition-colors hover:text-muted-foreground',
                        location.pathname === link.href
                          ? 'text-foreground'
                          : 'text-muted-foreground'
                      )}
                    >
                      {link.label}
                    </Link>
                  ))}
                </nav>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  );
}
