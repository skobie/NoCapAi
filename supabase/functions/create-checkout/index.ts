import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2.57.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

const STRIPE_SECRET_KEY = Deno.env.get("STRIPE_SECRET_KEY")!;

const TOKEN_PACKAGES = {
  small: { tokens: 500, price: 99, name: "500 Tokens" },
  medium: { tokens: 3000, price: 499, name: "3,000 Tokens" },
  large: { tokens: 7000, price: 1000, name: "7,000 Tokens" },
};

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: "Missing authorization header" }),
        {
          status: 401,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      {
        global: {
          headers: { Authorization: authHeader },
        },
      }
    );

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        {
          status: 401,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const { packageType } = await req.json();

    if (!packageType || !TOKEN_PACKAGES[packageType as keyof typeof TOKEN_PACKAGES]) {
      return new Response(
        JSON.stringify({ error: "Invalid package type" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const selectedPackage = TOKEN_PACKAGES[packageType as keyof typeof TOKEN_PACKAGES];

    const checkoutSession = await fetch(
      "https://api.stripe.com/v1/checkout/sessions",
      {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${STRIPE_SECRET_KEY}`,
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({
          "mode": "payment",
          "success_url": `${req.headers.get("origin")}/success?session_id={CHECKOUT_SESSION_ID}`,
          "cancel_url": `${req.headers.get("origin")}/`,
          "line_items[0][price_data][currency]": "usd",
          "line_items[0][price_data][product_data][name]": selectedPackage.name,
          "line_items[0][price_data][product_data][description]": `Purchase ${selectedPackage.tokens} tokens for content scanning`,
          "line_items[0][price_data][unit_amount]": selectedPackage.price.toString(),
          "line_items[0][quantity]": "1",
          "client_reference_id": user.id,
          "metadata[user_id]": user.id,
          "metadata[tokens]": selectedPackage.tokens.toString(),
          "metadata[package_type]": packageType,
        }),
      }
    );

    if (!checkoutSession.ok) {
      const error = await checkoutSession.text();
      console.error("Stripe API error:", {
        status: checkoutSession.status,
        error: error,
        hasStripeKey: !!STRIPE_SECRET_KEY,
        keyPrefix: STRIPE_SECRET_KEY?.substring(0, 7)
      });
      return new Response(
        JSON.stringify({
          error: "Failed to create checkout session",
          details: error,
          status: checkoutSession.status
        }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const session = await checkoutSession.json();

    return new Response(
      JSON.stringify({ url: session.url, sessionId: session.id }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Error:", error);
    return new Response(
      JSON.stringify({ error: error.message || "Internal server error" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});