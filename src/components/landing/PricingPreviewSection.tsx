// src/components/landing/PricingPreviewSection.tsx
// Three pricing tier cards — no real prices yet, ready for Stripe integration later.

import Link from "next/link";
import { pricingPlans } from "@/data/careerRoadmaps";
import { PricingPlan } from "@/types/career";

function PricingCard({ plan }: { plan: PricingPlan }) {
  return (
    <div
      className={`relative flex flex-col rounded-2xl border p-8 ${
        plan.highlighted
          ? "border-indigo-400 bg-indigo-600 text-white shadow-xl"
          : "border-gray-200 bg-white text-gray-900 shadow-sm"
      }`}
    >
      {/* Most popular badge */}
      {plan.highlighted && (
        <span className="absolute -top-3.5 left-1/2 -translate-x-1/2 rounded-full bg-amber-400 px-4 py-1 text-xs font-bold text-gray-900 shadow">
          Most Popular
        </span>
      )}

      {/* Plan name */}
      <h3
        className={`text-lg font-bold ${
          plan.highlighted ? "text-white" : "text-gray-900"
        }`}
      >
        {plan.name}
      </h3>

      {/* Pricing label */}
      <p
        className={`mt-3 text-2xl font-extrabold ${
          plan.highlighted ? "text-white" : "text-gray-900"
        }`}
      >
        {plan.pricingLabel}
      </p>

      {/* Divider */}
      <div
        className={`my-6 border-t ${
          plan.highlighted ? "border-indigo-400" : "border-gray-100"
        }`}
      />

      {/* Feature list */}
      <ul className="flex flex-1 flex-col gap-3">
        {plan.features.map((feature) => (
          <li key={feature} className="flex items-start gap-2.5 text-sm">
            {/* Checkmark */}
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className={`mt-0.5 h-4 w-4 shrink-0 ${
                plan.highlighted ? "text-indigo-200" : "text-indigo-500"
              }`}
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <polyline points="20 6 9 17 4 12" />
            </svg>
            <span className={plan.highlighted ? "text-indigo-100" : "text-gray-600"}>
              {feature}
            </span>
          </li>
        ))}
      </ul>

      {/* CTA */}
      <div className="mt-8">
        <Link
          href="#waitlist"
          className={`block w-full rounded-xl px-6 py-3 text-center text-sm font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 ${
            plan.highlighted
              ? "bg-white text-indigo-600 hover:bg-indigo-50 focus:ring-white"
              : "bg-indigo-600 text-white hover:bg-indigo-700 focus:ring-indigo-500"
          }`}
        >
          {plan.ctaLabel}
        </Link>
      </div>
    </div>
  );
}

export default function PricingPreviewSection() {
  return (
    <section id="pricing" className="bg-white px-4 py-20 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl">
        {/* Section header */}
        <div className="mb-14 text-center">
          <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
            Simple, transparent pricing
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-base text-gray-600">
            Start for free. Upgrade when you&apos;re ready to go deeper. Final
            pricing will be announced at launch — join the waitlist to get early
            access pricing.
          </p>
        </div>

        {/* Cards */}
        <div className="grid gap-8 sm:grid-cols-3">
          {pricingPlans.map((plan) => (
            <PricingCard key={plan.id} plan={plan} />
          ))}
        </div>
      </div>
    </section>
  );
}
