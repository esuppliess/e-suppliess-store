import { ReactNode } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Package, 
  ShoppingCart, 
  Image, 
  LogOut,
  Home,
  Users,
  FileText,
  FolderTree,
  MessageSquare,
  HelpCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { cn } from '@/lib/utils';

interface AdminLayoutProps {
  children: ReactNode;
}

const NAV_ITEMS = [
  { href: '/admin', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/admin/products', label: 'Products', icon: Package },
  { href: '/admin/categories', label: 'Categories', icon: FolderTree },
  { href: '/admin/vendors', label: 'Vendors', icon: Users },
  { href: '/admin/orders', label: 'Orders', icon: ShoppingCart },
  { href: '/admin/vouches', label: 'Vouches', icon: MessageSquare },
  { href: '/admin/faqs', label: 'FAQs', icon: HelpCircle },
  { href: '/admin/content', label: 'Site Content', icon: FileText },
  { href: '/admin/settings', label: 'Logo & Settings', icon: Image },
];

export function AdminLayout({ children }: AdminLayoutProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const { signOut, user } = useAuth();

  const handleSignOut = async () => {
    await signOut();
    navigate('/admin/login');
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Top Header */}
      <header className="sticky top-0 z-50 border-b border-border bg-background">
        <div className="flex items-center justify-between h-16 px-4 md:px-6">
          <div className="flex items-center gap-4">
            <Link to="/admin" className="font-bold text-lg">
              E SUPPLIES
            </Link>
            <span className="text-xs text-muted-foreground bg-accent px-2 py-1 rounded">
              Admin
            </span>
          </div>
          
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" asChild>
              <Link to="/" className="gap-2">
                <Home className="h-4 w-4" />
                <span className="hidden md:inline">View Site</span>
              </Link>
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleSignOut}
              className="gap-2"
            >
              <LogOut className="h-4 w-4" />
              <span className="hidden md:inline">Sign Out</span>
            </Button>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <aside className="hidden md:block w-64 border-r border-border min-h-[calc(100vh-4rem)] sticky top-16">
          <nav className="p-4 space-y-1">
            {NAV_ITEMS.map((item) => {
              const isActive = location.pathname === item.href;
              return (
                <Link
                  key={item.href}
                  to={item.href}
                  className={cn(
                    'flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors',
                    isActive
                      ? 'bg-foreground text-background'
                      : 'text-muted-foreground hover:text-foreground hover:bg-accent'
                  )}
                >
                  <item.icon className="h-5 w-5" />
                  {item.label}
                </Link>
              );
            })}
          </nav>
          
          {user && (
            <div className="absolute bottom-4 left-4 right-4">
              <p className="text-xs text-muted-foreground truncate">
                {user.email}
              </p>
            </div>
          )}
        </aside>

        {/* Mobile Bottom Nav */}
        <nav className="md:hidden fixed bottom-0 left-0 right-0 border-t border-border bg-background z-40">
          <div className="grid grid-cols-7 h-16">
            {NAV_ITEMS.map((item) => {
              const isActive = location.pathname === item.href;
              return (
                <Link
                  key={item.href}
                  to={item.href}
                  className={cn(
                    'flex flex-col items-center justify-center gap-1 text-xs transition-colors',
                    isActive
                      ? 'text-foreground'
                      : 'text-muted-foreground'
                  )}
                >
                  <item.icon className="h-5 w-5" />
                  <span className="truncate">{item.label.split(' ')[0]}</span>
                </Link>
              );
            })}
          </div>
        </nav>

        {/* Main Content */}
        <main className="flex-1 p-4 md:p-6 pb-20 md:pb-6">
          {children}
        </main>
      </div>
    </div>
  );
}
