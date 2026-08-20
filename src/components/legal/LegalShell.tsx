import Link from "next/link";
import type { ReactNode } from "react";

const legalLinks = [
  ["Legal hub", "/legal"],
  ["Terms", "/legal/terms"],
  ["Privacy", "/legal/privacy"],
  ["Cookies", "/legal/cookies"],
  ["Refunds & cancellation", "/legal/refunds"],
  ["Withdraw from a contract", "/legal/withdraw"],
] as const;

export default function LegalShell({ title, intro, children }: { title: string; intro?: string; children: ReactNode }) {
  return (
    <main className="min-h-screen bg-[#03050e] px-5 py-14 text-slate-200 sm:px-8 sm:py-20">
      <div className="mx-auto max-w-4xl">
        <Link href="/" className="text-sm font-semibold text-violet-300 hover:text-violet-200">← AI Role Path</Link>
        <div className="mt-8 rounded-3xl border border-white/10 bg-white/[0.025] p-6 sm:p-9">
          <p className="text-xs font-semibold uppercase tracking-[.2em] text-violet-300">Legal & consumer information</p>
          <h1 className="mt-3 font-display text-3xl font-bold tracking-tight text-white sm:text-4xl">{title}</h1>
          {intro ? <p className="mt-4 text-sm leading-7 text-slate-400 sm:text-base">{intro}</p> : null}
          <nav className="mt-7 flex flex-wrap gap-2" aria-label="Legal navigation">
            {legalLinks.map(([label, href]) => (
              <Link key={href} href={href} className="rounded-full border border-white/10 bg-white/[0.035] px-3 py-1.5 text-xs font-semibold text-slate-300 hover:border-violet-300/30 hover:text-white">
                {label}
              </Link>
            ))}
          </nav>
          <div className="prose prose-invert mt-10 max-w-none prose-headings:font-display prose-headings:text-white prose-p:text-slate-300 prose-li:text-slate-300 prose-a:text-violet-300 prose-strong:text-white">
            {children}
          </div>
        </div>
      </div>
    </main>
  );
}
