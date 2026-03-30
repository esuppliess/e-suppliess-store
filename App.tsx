import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { CartProvider } from "@/context/CartContext";
import { AuthProvider } from "@/hooks/useAuth";
import { ProtectedAdminRoute } from "@/components/admin/ProtectedAdminRoute";
import Index from "./pages/Index";
import Shop from "./pages/Shop";
import Product from "./pages/Product";
import Vendors from "./pages/Vendors";
import Vouches from "./pages/Vouches";
import FAQs from "./pages/FAQs";
import Contact from "./pages/Contact";
import Shipping from "./pages/Shipping";
import Terms from "./pages/Terms";
import Privacy from "./pages/Privacy";
import Refunds from "./pages/Refunds";
import Checkout from "./pages/Checkout";
import CheckoutSuccess from "./pages/CheckoutSuccess";
import NotFound from "./pages/NotFound";
import AdminLogin from "./pages/AdminLogin";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminProducts from "./pages/admin/AdminProducts";
import AdminCategories from "./pages/admin/AdminCategories";
import AdminVendors from "./pages/admin/AdminVendors";
import AdminOrders from "./pages/admin/AdminOrders";
import AdminSettings from "./pages/admin/AdminSettings";
import AdminContent from "./pages/admin/AdminContent";
import AdminVouches from "./pages/admin/AdminVouches";
import AdminFAQs from "./pages/admin/AdminFAQs";
import { ScrollToTop } from "./components/layout/ScrollToTop";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <CartProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <ScrollToTop />
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/shop" element={<Shop />} />
              <Route path="/product/:slug" element={<Product />} />
              <Route path="/vendors" element={<Vendors />} />
              <Route path="/vouches" element={<Vouches />} />
              <Route path="/faqs" element={<FAQs />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/shipping" element={<Shipping />} />
              <Route path="/terms" element={<Terms />} />
              <Route path="/privacy" element={<Privacy />} />
              <Route path="/refunds" element={<Refunds />} />
              <Route path="/checkout" element={<Checkout />} />
              <Route path="/checkout/success" element={<CheckoutSuccess />} />
              
              {/* Admin Routes */}
              <Route path="/admin/login" element={<AdminLogin />} />
              <Route path="/admin" element={
                <ProtectedAdminRoute>
                  <AdminDashboard />
                </ProtectedAdminRoute>
              } />
              <Route path="/admin/products" element={
                <ProtectedAdminRoute>
                  <AdminProducts />
                </ProtectedAdminRoute>
              } />
              <Route path="/admin/categories" element={
                <ProtectedAdminRoute>
                  <AdminCategories />
                </ProtectedAdminRoute>
              } />
              <Route path="/admin/vendors" element={
                <ProtectedAdminRoute>
                  <AdminVendors />
                </ProtectedAdminRoute>
              } />
              <Route path="/admin/orders" element={
                <ProtectedAdminRoute>
                  <AdminOrders />
                </ProtectedAdminRoute>
              } />
              <Route path="/admin/settings" element={
                <ProtectedAdminRoute>
                  <AdminSettings />
                </ProtectedAdminRoute>
              } />
              <Route path="/admin/vouches" element={
                <ProtectedAdminRoute>
                  <AdminVouches />
                </ProtectedAdminRoute>
              } />
              <Route path="/admin/content" element={
                <ProtectedAdminRoute>
                  <AdminContent />
                </ProtectedAdminRoute>
              } />
              <Route path="/admin/faqs" element={
                <ProtectedAdminRoute>
                  <AdminFAQs />
                </ProtectedAdminRoute>
              } />
              
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </CartProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
