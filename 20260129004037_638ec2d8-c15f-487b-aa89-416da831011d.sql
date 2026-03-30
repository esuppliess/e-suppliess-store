-- Drop existing policies that may have gaps
DROP POLICY IF EXISTS "Authenticated users can create their own orders" ON public.orders;
DROP POLICY IF EXISTS "Users can view their own orders" ON public.orders;
DROP POLICY IF EXISTS "admins_can_select_orders" ON public.orders;
DROP POLICY IF EXISTS "admins_can_update_orders" ON public.orders;

-- Create secure INSERT policy - only authenticated users can create orders with their own email
CREATE POLICY "Authenticated users can create orders"
ON public.orders
FOR INSERT
TO authenticated
WITH CHECK (
  auth.uid() IS NOT NULL 
  AND customer_email = (SELECT email FROM auth.users WHERE id = auth.uid())
);

-- Create secure SELECT policy - users can only view their own orders
CREATE POLICY "Users can view own orders"
ON public.orders
FOR SELECT
TO authenticated
USING (
  auth.uid() IS NOT NULL 
  AND customer_email = (SELECT email FROM auth.users WHERE id = auth.uid())
);

-- Create secure SELECT policy for admins
CREATE POLICY "Admins can view all orders"
ON public.orders
FOR SELECT
TO authenticated
USING (
  auth.uid() IS NOT NULL 
  AND public.has_role(auth.uid(), 'admin')
);

-- Create secure UPDATE policy for admins only
CREATE POLICY "Admins can update orders"
ON public.orders
FOR UPDATE
TO authenticated
USING (
  auth.uid() IS NOT NULL 
  AND public.has_role(auth.uid(), 'admin')
)
WITH CHECK (
  auth.uid() IS NOT NULL 
  AND public.has_role(auth.uid(), 'admin')
);