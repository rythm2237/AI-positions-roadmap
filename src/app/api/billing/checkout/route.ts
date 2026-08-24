import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { updateBillingMetadata } from "@/lib/billing/entitlement";
import { siteUrl, stripePost, stripePriceId, type BillingInterval } from "@/lib/billing/stripe";

type StripeCustomer = { id: string };
type StripeCheckoutSession = { id: string; url: string | null };

export async function POST(request: Request) {
  if (process.env.NEXT_PUBLIC_ROLE_PATH_BILLING_ENABLED !== "true") {
    return NextResponse.json(
      { error: "AI Role Path is currently in Free Public Beta. Paid checkout is not active." },
      { status: 503 },
    );
  }

  try {
    const supabase = await createClient();
    const { data, error } = await supabase.auth.getUser();
    const user = data.user;
    if (error || !user) return NextResponse.json({ error: "Authentication required." }, { status: 401 });

    const body = await request.json().catch(() => ({}));
    const careerSlug = typeof body?.careerSlug === "string" ? body.careerSlug.slice(0, 120) : "";
    const interval: BillingInterval = body?.interval === "annual" ? "annual" : "monthly";
    let customerId = typeof user.app_metadata?.stripe_customer_id === "string" ? user.app_metadata.stripe_customer_id : "";

    if (!customerId) {
      const customerParams = new URLSearchParams();
      if (user.email) customerParams.set("email", user.email);
      customerParams.set("metadata[user_id]", user.id);
      customerParams.set("metadata[product]", "ai-role-path");
      const customer = await stripePost<StripeCustomer>("/customers", customerParams);
      customerId = customer.id;
      await updateBillingMetadata(user.id, { stripe_customer_id: customerId });
    }

    const root = siteUrl();
    const params = new URLSearchParams();
    params.set("mode", "subscription");
    params.set("customer", customerId);
    params.set("line_items[0][price]", stripePriceId(interval));
    params.set("line_items[0][quantity]", "1");
    params.set("client_reference_id", user.id);
    params.set("allow_promotion_codes", "true");
    params.set("success_url", `${root}/dashboard?billing=success&session_id={CHECKOUT_SESSION_ID}`);
    params.set("cancel_url", careerSlug ? `${root}/careers/${encodeURIComponent(careerSlug)}?billing=canceled` : `${root}/dashboard?billing=canceled`);
    params.set("metadata[user_id]", user.id);
    params.set("metadata[career_slug]", careerSlug);
    params.set("metadata[billing_interval]", interval);
    params.set("subscription_data[metadata][user_id]", user.id);
    params.set("subscription_data[metadata][plan]", "pro");
    params.set("subscription_data[metadata][billing_interval]", interval);

    const session = await stripePost<StripeCheckoutSession>("/checkout/sessions", params);
    if (!session.url) throw new Error("Stripe Checkout did not return a redirect URL.");
    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error("Billing checkout failed", error);
    return NextResponse.json({ error: error instanceof Error ? error.message : "Checkout could not be started." }, { status: 500 });
  }
}
