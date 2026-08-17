"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

const STORAGE_KEY = "career-os-cookie-consent-v1";
const EVENT_NAME = "career-os:consent-changed";

export type ConsentState = {
  necessary: true;
  analytics: boolean;
  updatedAt: string;
};

function saveConsent(analytics: boolean) {
  const value: ConsentState = {
    necessary: true,
    analytics,
    updatedAt: new Date().toISOString(),
  };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(value));
  window.dispatchEvent(new CustomEvent(EVENT_NAME, { detail: value }));
}

export function readConsent(): ConsentState | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<ConsentState>;
    if (typeof parsed.analytics !== "boolean") return null;
    return { necessary: true, analytics: parsed.analytics, updatedAt: parsed.updatedAt || "" };
  } catch {
    return null;
  }
}

export const consentStorageKey = STORAGE_KEY;
export const consentEventName = EVENT_NAME;

export default function CookieConsent() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    setVisible(readConsent() === null);
    const open = () => setVisible(true);
    window.addEventListener("career-os:open-cookie-settings", open);
    return () => window.removeEventListener("career-os:open-cookie-settings", open);
  }, []);

  if (!visible) return null;

  return (
    <div className="fixed inset-x-3 bottom-3 z-[100] mx-auto max-w-3xl rounded-2xl border border-white/15 bg-[#080b19]/95 p-5 text-slate-200 shadow-2xl backdrop-blur-xl sm:inset-x-6 sm:p-6" role="dialog" aria-live="polite" aria-label="Cookie choices">
      <h2 className="font-display text-lg font-semibold text-white">Your privacy choices</h2>
      <p className="mt-2 text-sm leading-6 text-slate-400">
        We use strictly necessary storage to operate the service. Analytics cookies and tags are optional and remain disabled unless you accept them. You can change your choice later.
      </p>
      <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:items-center">
        <button
          type="button"
          onClick={() => {
            saveConsent(true);
            setVisible(false);
          }}
          className="rounded-xl bg-white px-4 py-2.5 text-sm font-semibold text-slate-950 hover:bg-violet-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-400"
        >
          Accept analytics
        </button>
        <button
          type="button"
          onClick={() => {
            saveConsent(false);
            setVisible(false);
          }}
          className="rounded-xl border border-white/15 bg-white/[0.04] px-4 py-2.5 text-sm font-semibold text-white hover:bg-white/[0.08] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-400"
        >
          Reject non-essential
        </button>
        <Link href="/legal/cookies" className="px-2 py-2 text-sm text-violet-300 hover:text-violet-200">
          Cookie details
        </Link>
      </div>
    </div>
  );
}
