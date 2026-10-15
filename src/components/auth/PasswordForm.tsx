"use client";

import Link from "next/link";
import { useFormState, useFormStatus } from "react-dom";
import { useState } from "react";
import { loginWithPassword, registerWithPassword, requestPasswordReset, updatePassword } from "@/app/login/passwordActions";
import type { AuthFormState, PasswordMode } from "@/lib/auth/password";

const actions = { login: loginWithPassword, signup: registerWithPassword, forgot: requestPasswordReset, reset: updatePassword };
const labels = { login: "Sign in", signup: "Create account", forgot: "Send reset link", reset: "Save new password" };
function Submit({ mode }: { mode: PasswordMode }) {
  const { pending } = useFormStatus();
  return <button disabled={pending} className="min-h-12 w-full rounded-xl bg-indigo-500 px-4 font-semibold text-white transition hover:bg-indigo-400 disabled:cursor-wait disabled:opacity-60">{pending ? "Please wait…" : labels[mode]}</button>;
}
export function PasswordForm({ mode, next = "/dashboard" }: { mode: PasswordMode; next?: string }) {
  const [state, action] = useFormState<AuthFormState, FormData>(actions[mode], {});
  const [showPassword, setShowPassword] = useState(false);
  const inputClass = "input-field mt-2 min-h-12 w-full rounded-xl border border-white/15 bg-slate-950 px-3 text-white";
  const suffix = `?next=${encodeURIComponent(next)}`;
  return <form action={action} className="mt-7 space-y-5">
    <input type="hidden" name="next" value={next} />
    {mode !== "reset" && <label className="block text-sm text-slate-300" htmlFor="email">Email<input className={inputClass} id="email" name="email" type="email" autoComplete="email" maxLength={254} required /></label>}
    {mode !== "forgot" && <>
      <label className="block text-sm text-slate-300" htmlFor="password">{mode === "reset" ? "New password" : "Password"}<input className={inputClass} id="password" name="password" type={showPassword ? "text" : "password"} autoComplete={mode === "login" ? "current-password" : "new-password"} minLength={mode === "login" ? undefined : 8} maxLength={128} required aria-describedby={mode === "login" ? undefined : "password-help"} /></label>
      {mode !== "login" && <><p id="password-help" className="text-xs text-slate-400">Use at least 8 characters. A long, unique password is best.</p><label className="block text-sm text-slate-300" htmlFor="confirmPassword">Confirm password<input className={inputClass} id="confirmPassword" name="confirmPassword" type={showPassword ? "text" : "password"} autoComplete="new-password" minLength={8} maxLength={128} required /></label></>}
      <div className="flex flex-wrap items-center justify-between gap-3 text-sm"><label className="flex cursor-pointer items-center gap-2 text-slate-400"><input type="checkbox" checked={showPassword} onChange={event => setShowPassword(event.target.checked)} />Show password</label>{mode === "login" && <Link href="/forgot-password" className="text-indigo-300 hover:underline">Forgot password?</Link>}</div>
    </>}
    {state.error && <p role="alert" className="rounded-xl border border-rose-300/20 bg-rose-500/10 p-3 text-sm text-rose-200">{state.error}</p>}
    {state.message && <p role="status" className="rounded-xl border border-emerald-300/20 bg-emerald-500/10 p-3 text-sm text-emerald-200">{state.message}</p>}
    <Submit mode={mode} />
    {mode === "login" ? <p className="text-center text-sm text-slate-400">New here? <Link className="text-indigo-300 hover:underline" href={`/signup${suffix}`}>Create an account</Link></p> : <p className="text-center text-sm text-slate-400"><Link className="text-indigo-300 hover:underline" href={`/login${suffix}`}>Back to sign in</Link></p>}
  </form>;
}
