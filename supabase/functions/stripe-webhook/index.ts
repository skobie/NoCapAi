import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2.57.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

const STRIPE_SECRET_KEY = Deno.env.get("STRIPE_SECRET_KEY")!;
const STRIPE_WEBHOOK_SECRET = Deno.env.get("STRIPE_WEBHOOK_SECRET");

async function verifySignature(
  payload: string,
  signature: string,
  secret: string
): Promise<boolean> {
  const encoder = new TextEncoder();
  const data = encoder.encode(payload);
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["verify"]
  );
  
  const signatureParts = signature.split(",");
  const timestamp = signatureParts.find(p => p.startsWith("t="))?.split("=")[1];
  const signatures = signatureParts.filter(p => p.startsWith("v1=")).map(p => p.split("=")[1]);
  
  const signedPayload = `${timestamp}.${payload}`;
  
  for (const sig of signatures) {
    const signatureBytes = new Uint8Array(
      sig.match(/.{1,2}/g)!.map(byte => parseInt(byte, 16))
    );
    
    const isValid = await crypto.subtle.verify(
      "HMAC",
      key,
      signatureBytes,
      encoder.encode(signedPayload)
    );
    
    if (isValid) return true;
  }
  
  return false;
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const signature = req.headers.get("stripe-signature");
    const payload = await req.text();

    if (STRIPE_WEBHOOK_SECRET && signature) {
      const isValid = await verifySignature(payload, signature, STRIPE_WEBHOOK_SECRET);
      if (!isValid) {
        console.error("Invalid signature");
        return new Response(
          JSON.stringify({ error: "Invalid signature" }),
          {
            status: 400,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }
    }

    const event = JSON.parse(payload);

    if (event.type === "checkout.session.completed") {
      const session = event.data.object;
      const userId = session.metadata?.user_id || session.client_reference_id;
      const tokens = parseInt(session.metadata?.tokens || "0");
      const paymentIntentId = session.payment_intent;

      if (!userId || !tokens) {
        console.error("Missing user_id or tokens in webhook", { userId, tokens });
        return new Response(
          JSON.stringify({ error: "Invalid webhook data" }),
          {
            status: 400,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }

      const supabase = createClient(
        Deno.env.get("SUPABASE_URL")!,
        Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
      );

      const { data: currentBalance, error: balanceError } = await supabase
        .from("token_balances")
        .select("balance")
        .eq("user_id", userId)
        .maybeSingle();

      if (balanceError) {
        console.error("Error fetching balance:", balanceError);
        return new Response(
          JSON.stringify({ error: "Database error" }),
          {
            status: 500,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }

      const oldBalance = currentBalance?.balance || 0;
      const newBalance = oldBalance + tokens;

      const { error: updateError } = await supabase
        .from("token_balances")
        .upsert({
          user_id: userId,
          balance: newBalance,
          updated_at: new Date().toISOString(),
        });

      if (updateError) {
        console.error("Error updating balance:", updateError);
        return new Response(
          JSON.stringify({ error: "Failed to update balance" }),
          {
            status: 500,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }

      const { error: txError } = await supabase
        .from("token_transactions")
        .insert({
          user_id: userId,
          type: "purchase",
          amount: tokens,
          balance_after: newBalance,
          description: `Purchased ${tokens} tokens`,
          stripe_payment_id: paymentIntentId,
          metadata: {
            session_id: session.id,
            amount_paid: session.amount_total,
            currency: session.currency,
          },
        });

      if (txError) {
        console.error("Error recording transaction:", txError);
      }

      console.log(`Successfully credited ${tokens} tokens to user ${userId}`);
    }

    return new Response(
      JSON.stringify({ received: true }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Webhook error:", error);
    return new Response(
      JSON.stringify({ error: error.message || "Internal server error" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});