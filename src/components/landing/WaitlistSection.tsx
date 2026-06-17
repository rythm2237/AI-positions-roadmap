"use client";

// src/components/landing/WaitlistSection.tsx
// Client component — uses React state for form submission and success message.
// Replace the handleSubmit body with a real API call (e.g. Resend, ConvertKit) later.

import { useState, FormEvent } from "react";
import { careerPositions } from "@/data/careerRoadmaps";

type FormState = "idle" | "submitting" | "success";

export default function WaitlistSection() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [interest, setInterest] = useState("");
  const [formState, setFormState] = useState<FormState>("idle");

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();

    // Guard: basic validation
    if (!name.trim() || !email.trim()) return;

    // Simulate submission (replace with real API call later)
    setFormState("submitting");
    setTimeout(() => {
      setFormState("success");
    }, 800);
  }

  return (
    <section id="waitlist" className="bg-indigo-600 px-4 py-20 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-2xl text-center">
        {/* Headline */}
        <h2 className="text-3xl font-extrabold text-white sm:text-4xl">
          Be the first to access the AI career roadmap platform.
        </h2>
        <p className="mx-auto mt-4 max-w-lg text-base text-indigo-200">
          Join the early access waitlist and get notified the moment your chosen
          roadmap goes live — plus early-bird pricing when we launch.
        </p>

        {/* Success state */}
        {formState === "success" ? (
          <div
            role="alert"
            className="mt-10 rounded-2xl bg-white/10 px-8 py-8 text-center backdrop-blur-sm"
          >
            <div className="mb-3 flex justify-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-10 w-10 text-emerald-300"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                <polyline points="22 4 12 14.01 9 11.01" />
              </svg>
            </div>
            <p className="text-xl font-bold text-white">
              Thanks! You&apos;re on the early access list.
            </p>
            <p className="mt-2 text-sm text-indigo-200">
              We&apos;ll reach out as soon as your roadmap is ready.
            </p>
          </div>
        ) : (
          /* Form */
          <form
            onSubmit={handleSubmit}
            className="mt-10 flex flex-col gap-4 text-left"
            noValidate
          >
            {/* Name */}
            <div>
              <label
                htmlFor="waitlist-name"
                className="mb-1.5 block text-sm font-medium text-indigo-100"
              >
                Your name
              </label>
              <input
                id="waitlist-name"
                type="text"
                required
                autoComplete="name"
                placeholder="Jane Smith"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full rounded-xl border border-indigo-400 bg-white/10 px-4 py-3 text-sm text-white placeholder-indigo-300 backdrop-blur-sm transition focus:border-white focus:outline-none focus:ring-2 focus:ring-white/50"
              />
            </div>

            {/* Email */}
            <div>
              <label
                htmlFor="waitlist-email"
                className="mb-1.5 block text-sm font-medium text-indigo-100"
              >
                Email address
              </label>
              <input
                id="waitlist-email"
                type="email"
                required
                autoComplete="email"
                placeholder="jane@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-xl border border-indigo-400 bg-white/10 px-4 py-3 text-sm text-white placeholder-indigo-300 backdrop-blur-sm transition focus:border-white focus:outline-none focus:ring-2 focus:ring-white/50"
              />
            </div>

            {/* Interest dropdown */}
            <div>
              <label
                htmlFor="waitlist-interest"
                className="mb-1.5 block text-sm font-medium text-indigo-100"
              >
                I&apos;m most interested in
              </label>
              <select
                id="waitlist-interest"
                value={interest}
                onChange={(e) => setInterest(e.target.value)}
                className="w-full rounded-xl border border-indigo-400 bg-indigo-700 px-4 py-3 text-sm text-white backdrop-blur-sm transition focus:border-white focus:outline-none focus:ring-2 focus:ring-white/50"
              >
                <option value="">Select a career path…</option>
                {careerPositions.map((pos) => (
                  <option key={pos.id} value={pos.id}>
                    {pos.title}
                  </option>
                ))}
              </select>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={formState === "submitting"}
              className="mt-2 w-full rounded-xl bg-white px-8 py-3.5 text-base font-semibold text-indigo-600 shadow-md transition-colors hover:bg-indigo-50 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-indigo-600 disabled:opacity-60"
            >
              {formState === "submitting" ? "Joining…" : "Join Waitlist"}
            </button>

            <p className="text-center text-xs text-indigo-300">
              No spam. Unsubscribe any time.
            </p>
          </form>
        )}
      </div>
    </section>
  );
}
