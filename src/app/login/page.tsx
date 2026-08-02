import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/session";
import { safeInternalRedirect } from "@/lib/auth/redirects";
import { signInWithOAuth } from "./actions";

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ next?: string; error?: string }> }) {
  if (await getCurrentUser()) redirect("/dashboard");
  const query = await searchParams;
  const next = safeInternalRedirect(query.next);
  return <main className="grid min-h-dvh place-items-center px-5 py-16"><section className="glass w-full max-w-md rounded-3xl border border-white/10 p-8 shadow-premium">
    <Link href="/" className="text-sm text-indigo-300">← AI Career OS</Link>
    <p className="eyebrow mt-8">Your private workspace</p><h1 className="mt-3 font-display text-3xl font-semibold text-white">Build your career identity</h1>
    <p className="mt-3 text-sm leading-6 text-slate-400">Save careers, manage resume versions, and track your readiness. No username required.</p>
    {query.error ? <p role="alert" className="mt-5 rounded-xl border border-rose-300/20 bg-rose-500/10 p-3 text-sm text-rose-200">Sign-in could not be completed. Please try again.</p> : null}
    <div className="mt-8 grid gap-3">{(["google", "github"] as const).map((provider) => <form key={provider} action={async () => { "use server"; await signInWithOAuth(provider, next); }}><button className="min-h-12 w-full rounded-xl border border-white/10 bg-white/[.045] px-4 text-sm font-semibold capitalize text-white transition hover:bg-white/[.09] focus-visible:ring-2 focus-visible:ring-indigo-400">Continue with {provider}</button></form>)}</div>
    <p className="mt-6 text-center text-xs text-slate-600">Secure OAuth authentication through Supabase.</p>
  </section></main>;
}
