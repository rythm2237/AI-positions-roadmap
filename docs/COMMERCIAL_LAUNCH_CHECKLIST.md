# AI Role Path — Commercial Launch Checklist

## Approved pricing

- Pro Monthly: **€19.90 / month**
- Pro Annual: **€199 / year**
- Annual saving versus 12 monthly payments: **€39.80 / year**

## Billing architecture

- Stripe-hosted Checkout
- Flat-rate Pro subscription
- Freemium entry tier
- Stripe Customer Portal for payment method/subscription management
- Cancel at period end as the default lifecycle
- Webhook-driven entitlement updates in Supabase app metadata
- Smart Retries / Stripe revenue recovery recommended

## Required production secrets

- `STRIPE_SECRET_KEY`
- `STRIPE_ROLE_PATH_PRO_MONTHLY_PRICE_ID`
- `STRIPE_ROLE_PATH_PRO_ANNUAL_PRICE_ID`
- `STRIPE_WEBHOOK_SECRET`

## Remaining launch blockers

1. Create the Live Stripe Product for AI Role Path Pro.
2. Create the recurring EUR monthly Price at €19.90.
3. Create the recurring EUR annual Price at €199.
4. Set both Price IDs in Vercel Production and Preview environments.
5. Configure the Stripe webhook endpoint at `https://www.airolepath.com/api/billing/webhook` and set its signing secret in Vercel.
6. Verify Customer Portal configuration and cancel-at-period-end behavior.
7. Complete one end-to-end subscription test, including entitlement activation and cancellation lifecycle.
8. Validate AI reviewer production credentials and migrate critical cross-device state from localStorage to Supabase before broad paid launch.

## Integrity rule

Do not grant Pro access from client state or a successful redirect alone. Pro entitlement is controlled by verified Stripe subscription lifecycle events and secure Supabase user metadata.
