import { NextResponse } from "next/server";
import { planForSubscriptionStatus, updateBillingMetadata, type BillingStatus } from "@/lib/billing/entitlement";
import { stripeGet, verifyStripeWebhook } from "@/lib/billing/stripe";

type StripeEvent = { id: string; type: string; data: { object: Record<string, unknown> } };
type StripeSubscription = { id: string; status: BillingStatus; customer: string | { id: string }; metadata?: Record<string, string>; current_period_end?: number; cancel_at_period_end?: boolean };
type StripeCustomer = { id: string; metadata?: Record<string, string> };

async function userIdFromCustomer(customer: string | { id: string } | null | undefined): Promise<string | null> {
  const id = typeof customer === "string" ? customer : customer?.id;
  if (!id) return null;
  const record = await stripeGet<StripeCustomer>(`/customers/${encodeURIComponent(id)}`);
  return record.metadata?.user_id || null;
}

async function syncSubscription(subscription: StripeSubscription) {
  const userId = subscription.metadata?.user_id || await userIdFromCustomer(subscription.customer);
  if (!userId) return;
  await updateBillingMetadata(userId, {
    role_path_plan: planForSubscriptionStatus(subscription.status),
    role_path_billing_status: subscription.status,
    stripe_subscription_id: subscription.id,
    stripe_customer_id: typeof subscription.customer === "string" ? subscription.customer : subscription.customer.id,
    role_path_cancel_at_period_end: Boolean(subscription.cancel_at_period_end),
    role_path_current_period_end: subscription.current_period_end ?? null,
    role_path_billing_updated_at: new Date().toISOString(),
  });
}

export async function POST(request: Request) {
  const raw = await request.text();
  try {
    verifyStripeWebhook(raw, request.headers.get("stripe-signature"));
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Invalid Stripe webhook." }, { status: 400 });
  }

  try {
    const event = JSON.parse(raw) as StripeEvent;
    const object = event.data.object;

    if (event.type === "customer.subscription.created" || event.type === "customer.subscription.updated" || event.type === "customer.subscription.deleted") {
      await syncSubscription(object as unknown as StripeSubscription);
    } else if (event.type === "checkout.session.completed") {
      const userId = typeof object.client_reference_id === "string" ? object.client_reference_id : null;
      const subscriptionId = typeof object.subscription === "string" ? object.subscription : null;
      const customerId = typeof object.customer === "string" ? object.customer : null;
      if (userId && subscriptionId) {
        const subscription = await stripeGet<StripeSubscription>(`/subscriptions/${encodeURIComponent(subscriptionId)}`);
        await syncSubscription(subscription);
      } else if (userId && customerId) {
        await updateBillingMetadata(userId, { stripe_customer_id: customerId, role_path_billing_updated_at: new Date().toISOString() });
      }
    } else if (event.type === "invoice.payment_failed") {
      const subscriptionId = typeof object.subscription === "string" ? object.subscription : null;
      if (subscriptionId) {
        const subscription = await stripeGet<StripeSubscription>(`/subscriptions/${encodeURIComponent(subscriptionId)}`);
        await syncSubscription({ ...subscription, status: "past_due" });
      }
    } else if (event.type === "charge.refunded") {
      const customerId = typeof object.customer === "string" ? object.customer : null;
      const userId = await userIdFromCustomer(customerId);
      if (userId) {
        await updateBillingMetadata(userId, {
          role_path_last_refund_at: new Date().toISOString(),
          role_path_last_refund_charge_id: typeof object.id === "string" ? object.id : null,
        });
      }
    }

    return NextResponse.json({ received: true, eventId: event.id });
  } catch (error) {
    console.error("Stripe webhook processing failed", error);
    return NextResponse.json({ error: "Webhook processing failed." }, { status: 500 });
  }
}
