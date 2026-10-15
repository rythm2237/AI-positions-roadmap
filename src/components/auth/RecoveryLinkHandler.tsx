"use client";

import { useEffect, useRef, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { recoveryTokens, restoreRecoverySession } from "@/lib/auth/recovery";

export function RecoveryLinkHandler() {
  const operation = useRef<Promise<boolean> | null>(null);
  const [status, setStatus] = useState<"idle" | "checking" | "error">("idle");
  useEffect(() => {
    let active = true;
    if (!operation.current) {
      const fragment = window.location.hash;
      const tokens = recoveryTokens(fragment);
      if (!tokens && window.location.pathname !== "/auth/recovery") return;
      // Clear credentials from the address bar before initializing any Auth client.
      window.history.replaceState(null, "", window.location.pathname + window.location.search);
      operation.current = tokens ? restoreRecoverySession(createClient(), fragment).catch(() => false) : Promise.resolve(false);
    }
    setStatus("checking");
    operation.current.then(valid => {
      if (!active) return;
      if (valid) window.location.replace("/reset-password");
      else setStatus("error");
    });
    return () => { active = false; };
  }, []);
  if (status === "idle") return null;
  return <div className="fixed inset-0 z-[1000] grid place-items-center bg-slate-950 px-5"><section className="w-full max-w-md rounded-3xl border border-white/10 bg-slate-900 p-8">
    <h1 className="text-2xl font-semibold text-white">{status === "checking" ? "Verifying your reset link…" : "Request a new reset link"}</h1>
    <p role={status === "error" ? "alert" : "status"} className="mt-4 text-sm leading-6 text-slate-300">{status === "checking" ? "You’ll be taken to the page where you can choose your new password." : "This link is missing, expired, already used, or was requested before the recovery update. Request a fresh link and open the latest email."}</p>
    {status === "error" && <a href="/forgot-password" className="mt-6 inline-flex min-h-12 items-center rounded-xl bg-indigo-500 px-5 font-semibold text-white">Send a new reset link</a>}
  </section></div>;
}
