"use client";

import { FormEvent, useState } from "react";
import LegalShell from "@/components/legal/LegalShell";

export default function WithdrawPage() {
  const [status, setStatus] = useState<"idle" | "sending" | "success" | "error">("idle");
  const [message, setMessage] = useState("");
  const [reference, setReference] = useState("");

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("sending");
    setMessage("");
    const form = new FormData(event.currentTarget);
    const payload = Object.fromEntries(form.entries());

    const response = await fetch("/api/legal/withdraw", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      setStatus("error");
      setMessage(data.error || "We could not submit your withdrawal request. Please contact support using the address in the Legal section.");
      return;
    }
    setStatus("success");
    setReference(data.reference || "");
    setMessage("Your withdrawal statement has been received. A confirmation has been sent to the email address you provided.");
    event.currentTarget.reset();
  }

  return (
    <LegalShell title="Withdraw from a contract" intro="Use this function to send an unambiguous withdrawal statement for an eligible consumer contract concluded online.">
      <p>This form does not require you to give a reason. Statutory eligibility and the legal effect of withdrawal depend on the type of service, timing, and any valid consent concerning immediate performance or digital content.</p>

      <form className="not-prose mt-8 grid gap-4" onSubmit={submit}>
        <label className="grid gap-1.5 text-sm font-medium text-slate-200">
          Full name
          <input name="name" required minLength={2} className="rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2.5 text-white outline-none focus:border-violet-400" />
        </label>
        <label className="grid gap-1.5 text-sm font-medium text-slate-200">
          Email used for the purchase
          <input name="email" type="email" required className="rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2.5 text-white outline-none focus:border-violet-400" />
        </label>
        <label className="grid gap-1.5 text-sm font-medium text-slate-200">
          Order / subscription reference
          <input name="orderReference" required className="rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2.5 text-white outline-none focus:border-violet-400" />
        </label>
        <label className="grid gap-1.5 text-sm font-medium text-slate-200">
          Optional note
          <textarea name="note" rows={4} className="rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2.5 text-white outline-none focus:border-violet-400" />
        </label>
        <label className="flex items-start gap-3 text-sm leading-6 text-slate-300">
          <input name="confirm" value="yes" type="checkbox" required className="mt-1" />
          <span>I clearly state that I want to withdraw from the identified contract.</span>
        </label>
        <button type="submit" disabled={status === "sending"} className="mt-2 rounded-xl bg-white px-4 py-3 text-sm font-semibold text-slate-950 disabled:opacity-60">
          {status === "sending" ? "Submitting…" : "Confirm withdrawal"}
        </button>
      </form>

      {message ? (
        <div className={`not-prose mt-5 rounded-xl border p-4 text-sm ${status === "success" ? "border-emerald-300/20 bg-emerald-300/[0.06] text-emerald-100" : "border-red-300/20 bg-red-300/[0.06] text-red-100"}`} role="status">
          {message}{reference ? <div className="mt-2 font-mono text-xs">Reference: {reference}</div> : null}
        </div>
      ) : null}
    </LegalShell>
  );
}
