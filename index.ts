import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const logStep = (step: string, details?: unknown) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[VERIFY-PAYMENT] ${step}${detailsStr}`);
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    logStep("Function started");

    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeKey) throw new Error("STRIPE_SECRET_KEY is not set");

    const stripe = new Stripe(stripeKey, { apiVersion: "2025-08-27.basil" });

    const { sessionId } = await req.json();
    if (!sessionId || typeof sessionId !== 'string') throw new Error("Session ID is required");

    // Validate Stripe session ID format to prevent probing
    if (!sessionId.startsWith('cs_')) {
      return new Response(JSON.stringify({ error: "Invalid session ID" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      });
    }

    logStep("Session ID received", { sessionId });

    // Retrieve the session from Stripe
    const session = await stripe.checkout.sessions.retrieve(sessionId, {
      expand: ["line_items", "customer", "payment_intent"],
    });
    logStep("Session retrieved", { status: session.payment_status });

    if (session.payment_status !== "paid") {
      return new Response(JSON.stringify({ 
        success: false, 
        message: "Payment not completed" 
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }

    // Create order in database using service role
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    // Parse items from metadata
    const itemsJson = session.metadata?.items_json;
    const items = itemsJson ? JSON.parse(itemsJson) : [];
    const deliveryOption = session.metadata?.delivery_option || "canada-shipping";

    // Get customer details
    const customerEmail = session.customer_email || 
      (typeof session.customer === 'object' && session.customer?.email) || 
      "";
    const customerName = session.customer_details?.name || null;
    const shippingAddress = session.shipping_details?.address || session.customer_details?.address || null;

    logStep("Creating order", { 
      customerEmail, 
      itemCount: items.length,
      deliveryOption,
      total: session.amount_total 
    });

    // Check if order already exists
    const { data: existingOrder } = await supabaseAdmin
      .from("orders")
      .select("id")
      .eq("stripe_session_id", sessionId)
      .single();

    if (existingOrder) {
      logStep("Order already exists", { orderId: existingOrder.id });
      return new Response(JSON.stringify({ 
        success: true, 
        orderId: existingOrder.id,
        message: "Order already processed" 
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }

    // Create new order (upsert to prevent duplicates)
    const { data: order, error: orderError } = await supabaseAdmin
      .from("orders")
      .upsert({
        stripe_session_id: sessionId,
        customer_email: customerEmail,
        customer_name: customerName,
        items: items,
        total: (session.amount_total || 0) / 100,
        delivery_option: deliveryOption as "gta-meetup" | "canada-shipping" | "worldwide-agent",
        shipping_address: shippingAddress,
        status: "pending",
      }, { onConflict: 'stripe_session_id' })
      .select()
      .single();

    if (orderError) {
      logStep("Error creating order", { error: orderError.message });
      throw new Error(`Failed to create order: ${orderError.message}`);
    }

    logStep("Order created successfully", { orderId: order.id });

    return new Response(JSON.stringify({ 
      success: true, 
      orderId: order.id,
      message: "Payment verified and order created" 
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR", { message: errorMessage });
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
