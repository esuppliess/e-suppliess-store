import { Package, ShoppingCart, AlertTriangle, TrendingUp } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { useAllProducts } from '@/hooks/useProducts';
import { useOrders } from '@/hooks/useOrders';

export default function AdminDashboard() {
  const { data: products, isLoading: productsLoading } = useAllProducts();
  const { data: orders, isLoading: ordersLoading } = useOrders();

  const totalProducts = products?.length || 0;
  const inStockProducts = products?.filter(p => p.inventory_count > 0 && p.is_active).length || 0;
  const lowStockProducts = products?.filter(p => p.inventory_count > 0 && p.inventory_count <= 3).length || 0;
  const soldOutProducts = products?.filter(p => p.inventory_count === 0).length || 0;
  
  const totalOrders = orders?.length || 0;
  const pendingOrders = orders?.filter(o => o.status === 'pending').length || 0;
  const totalRevenue = orders?.reduce((sum, o) => sum + Number(o.total), 0) || 0;

  const recentOrders = orders?.slice(0, 5) || [];

  return (
    <AdminLayout>
      <div className="space-y-8">
        <div>
          <h1 className="text-2xl font-bold mb-1">Dashboard</h1>
          <p className="text-muted-foreground">Welcome to your admin dashboard</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="border-border">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Products</CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {productsLoading ? '...' : totalProducts}
              </div>
              <p className="text-xs text-muted-foreground">
                {inStockProducts} in stock
              </p>
            </CardContent>
          </Card>

          <Card className="border-border">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Low Stock</CardTitle>
              <AlertTriangle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {productsLoading ? '...' : lowStockProducts}
              </div>
              <p className="text-xs text-muted-foreground">
                {soldOutProducts} sold out
              </p>
            </CardContent>
          </Card>

          <Card className="border-border">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
              <ShoppingCart className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {ordersLoading ? '...' : totalOrders}
              </div>
              <p className="text-xs text-muted-foreground">
                {pendingOrders} pending
              </p>
            </CardContent>
          </Card>

          <Card className="border-border">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Revenue</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                ${ordersLoading ? '...' : totalRevenue.toFixed(2)}
              </div>
              <p className="text-xs text-muted-foreground">
                USD total
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Recent Orders */}
        <Card className="border-border">
          <CardHeader>
            <CardTitle>Recent Orders</CardTitle>
          </CardHeader>
          <CardContent>
            {ordersLoading ? (
              <p className="text-muted-foreground">Loading...</p>
            ) : recentOrders.length === 0 ? (
              <p className="text-muted-foreground">No orders yet</p>
            ) : (
              <div className="space-y-4">
                {recentOrders.map((order) => (
                  <div
                    key={order.id}
                    className="flex items-center justify-between py-3 border-b border-border last:border-0"
                  >
                    <div>
                      <p className="font-medium">{order.customer_email}</p>
                      <p className="text-sm text-muted-foreground">
                        {new Date(order.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">${Number(order.total).toFixed(2)}</p>
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        order.status === 'completed' ? 'bg-accent text-foreground' :
                        order.status === 'pending' ? 'bg-muted text-muted-foreground' :
                        'bg-accent text-foreground'
                      }`}>
                        {order.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card className="border-border">
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <a
                href="/admin/products"
                className="flex flex-col items-center gap-2 p-4 border border-border rounded-lg hover:bg-accent transition-colors"
              >
                <Package className="h-6 w-6" />
                <span className="text-sm font-medium">Add Product</span>
              </a>
              <a
                href="/admin/orders"
                className="flex flex-col items-center gap-2 p-4 border border-border rounded-lg hover:bg-accent transition-colors"
              >
                <ShoppingCart className="h-6 w-6" />
                <span className="text-sm font-medium">View Orders</span>
              </a>
              <a
                href="/admin/settings"
                className="flex flex-col items-center gap-2 p-4 border border-border rounded-lg hover:bg-accent transition-colors"
              >
                <Package className="h-6 w-6" />
                <span className="text-sm font-medium">Update Logo</span>
              </a>
              <a
                href="/"
                target="_blank"
                className="flex flex-col items-center gap-2 p-4 border border-border rounded-lg hover:bg-accent transition-colors"
              >
                <TrendingUp className="h-6 w-6" />
                <span className="text-sm font-medium">View Store</span>
              </a>
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}
