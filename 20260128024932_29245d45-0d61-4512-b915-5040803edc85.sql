-- Drop the overly permissive "Anyone can create orders" policy
DROP POLICY IF EXISTS "Anyone can create orders" ON public.orders;

-- Create a more secure policy: only authenticated users can create orders with their own email
CREATE POLICY "Authenticated users can create their own orders"
  ON public.orders FOR INSERT
  TO authenticated
  WITH CHECK (
    customer_email = (SELECT email FROM auth.users WHERE id = auth.uid())
  );

-- Allow users to view their own orders
CREATE POLICY "Users can view their own orders"
  ON public.orders FOR SELECT
  TO authenticated
  USING (
    customer_email = (SELECT email FROM auth.users WHERE id = auth.uid())
    OR public.has_role(auth.uid(), 'admin')
  );