import Link from "next/link";
import { redirect } from "next/navigation";
import { BrandLogoWithDescriptor } from "@/components/brand/BrandLogo";
import { getCurrentUser } from "@/lib/auth/session";
import { safeInternalRedirect } from "@/lib/auth/redirects";
import { privateRouteMetadata } from "@/lib/seo";
import { signInWithOAuth, signInWithPreviewCredentials } from "./actions";

export const metadata = privateRouteMetadata("Sign in");

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ next?: string; error?: string }> }) {
  if (await getCurrentUser()) redirect("/dashboard");
  const query = await searchParams;
  const next = safeInternalRedirect(query.next);
  const previewCredentialsEnabled =
    process.env.VERCEL_ENV === "preview" &&
    process.env.JOB_DISCOVERY_E2E_LOGIN_ENABLED === "true";
  return <main className="grid min-h-dvh place-items-center px-5 py-16"><section className="glass w-full max-w-md rounded-3xl border border-white/10 p-8 shadow-premium">
    <Link href="/" className="inline-flex rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-400" aria-label="Back to AI Role Path"><BrandLogoWithDescriptor className="h-12 w-auto" /></Link>
    <p className="eyebrow mt-8">Your private workspace</p><h1 className="mt-3 font-display text-3xl font-semibold text-white">Build your career identity</h1>
    <p className="mt-3 text-sm leading-6 text-slate-400">Save careers, manage resume versions, and track your readiness. No username required.</p>
    {query.error ? <p role="alert" className="mt-5 rounded-xl border border-rose-300/20 bg-rose-500/10 p-3 text-sm text-rose-200">Sign-in could not be completed. Please try again.</p> : null}
    <div className="mt-8 grid gap-3">{(["google", "github"] as const).map((provider) => <form key={provider} action={async () => { "use server"; await signInWithOAuth(provider, next); }}><button className="min-h-12 w-full rounded-xl border border-white/10 bg-white/[.045] px-4 text-sm font-semibold capitalize text-white transition hover:bg-white/[.09] focus-visible:ring-2 focus-visible:ring-indigo-400">Continue with {provider}</button></form>)}</div>
    {previewCredentialsEnabled ? <form className="mt-6 grid gap-3 border-t border-white/10 pt-6" action={async (formData) => { "use server"; await signInWithPreviewCredentials(formData, next); }}>
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-amber-200">Preview E2E access</p>
      <label className="grid gap-1.5 text-sm text-slate-300">Email<input name="email" type="email" autoComplete="username" required className="min-h-11 rounded-xl border border-white/10 bg-black/20 px-3 text-white outline-none focus-visible:ring-2 focus-visible:ring-indigo-400" /></label>
      <label className="grid gap-1.5 text-sm text-slate-300">Password<input name="password" type="password" autoComplete="current-password" required className="min-h-11 rounded-xl border border-white/10 bg-black/20 px-3 text-white outline-none focus-visible:ring-2 focus-visible:ring-indigo-400" /></label>
      <button className="min-h-12 rounded-xl bg-indigo-500 px-4 text-sm font-semibold text-white transition hover:bg-indigo-400 focus-visible:ring-2 focus-visible:ring-indigo-300">Sign in to Preview</button>
    </form> : null}
    <p className="mt-6 text-center text-xs text-slate-600">Secure OAuth authentication through Supabase.</p>
  </section></main>;
}
