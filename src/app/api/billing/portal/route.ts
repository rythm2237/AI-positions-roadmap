import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { siteUrl, stripePost } from "@/lib/billing/stripe";

type PortalSession = { url: string };

export async function POST() {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase.auth.getUser();
    const user = data.user;
    if (error || !user) return NextResponse.json({ error: "Authentication required." }, { status: 401 });

    const customerId = typeof user.app_metadata?.stripe_customer_id === "string" ? user.app_metadata.stripe_customer_id : "";
    if (!customerId) return NextResponse.json({ error: "No Stripe customer is linked to this account yet." }, { status: 400 });

    const params = new URLSearchParams();
    params.set("customer", customerId);
    params.set("return_url", `${siteUrl()}/dashboard?billing=portal-return`);
    const session = await stripePost<PortalSession>("/billing_portal/sessions", params);
    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error("Billing portal failed", error);
    return NextResponse.json({ error: error instanceof Error ? error.message : "Billing portal could not be opened." }, { status: 500 });
  }
}
