import Link from "next/link";
import { legalOperator } from "@/lib/legal";
import { buildMetadata } from "@/lib/seo";

export const metadata = buildMetadata({ title: "Support", description: "Get help with AI Role Path accounts, career tools, data, billing, and product issues.", path: "/support" });

const topics = [
  ["Account & access", "Sign-in, account access, protected pages, and account-related issues."],
  ["Career tools", "CV Analyzer, roadmaps, career intelligence, learning paths, and other product workflows."],
  ["Data & privacy", "Questions about personal data, privacy choices, cookies, or data requests."],
  ["Billing & refunds", "Questions about paid access, cancellation, withdrawal, or refunds when paid services are enabled."],
] as const;

export default function SupportPage() {
  return <main className="min-h-screen bg-[#03050e] px-5 py-14 text-slate-200 sm:px-8 sm:py-20"><div className="mx-auto max-w-5xl">
    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-violet-300">Help</p><h1 className="mt-3 font-display text-4xl font-bold tracking-tight text-white sm:text-5xl">Support</h1>
    <p className="mt-5 max-w-3xl text-base leading-8 text-slate-400">For product or account issues, send a concise description of what happened, the page you were using, and any error message you saw. Do not send passwords, private API keys, or unnecessary sensitive data.</p>
    <div className="mt-10 grid gap-4 sm:grid-cols-2">{topics.map(([title, description]) => <section key={title} className="rounded-2xl border border-white/10 bg-white/[0.025] p-5"><h2 className="font-display text-lg font-semibold text-white">{title}</h2><p className="mt-2 text-sm leading-7 text-slate-400">{description}</p></section>)}</div>
    <section className="mt-10 rounded-2xl border border-violet-300/15 bg-violet-500/[0.055] p-6"><h2 className="font-display text-xl font-semibold text-white">Contact support</h2><p className="mt-3 text-sm leading-7 text-slate-300">Email <a className="font-semibold text-violet-300 hover:text-violet-200" href={`mailto:${legalOperator.supportEmail}`}>{legalOperator.supportEmail}</a>. Include the affected page and enough detail for us to reproduce the problem.</p></section>
    <div className="mt-8 flex gap-4 text-sm"><Link href="/contact" className="font-semibold text-violet-300 hover:text-violet-200">General contact →</Link><Link href="/legal" className="font-semibold text-violet-300 hover:text-violet-200">Legal information →</Link></div>
  </div></main>;
}
