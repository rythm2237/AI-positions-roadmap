import Link from "next/link";
import { buildMetadata } from "@/lib/seo";

export const metadata = buildMetadata({ title: "Security", description: "How AI Role Path approaches account, application, infrastructure, and data security.", path: "/security" });

const controls = [
  ["Account security", "Protected areas require an authenticated session before access."],
  ["Authorization", "Server-side authorization and database access policies are used to separate protected user data and administrative functions from public content."],
  ["Data transport", "Production traffic is served over HTTPS. Service credentials are kept out of client-side source code and supplied through protected environment configuration."],
  ["Production operations", "The application uses versioned source control and managed deployment history so changes can be reviewed and rolled back when necessary."],
  ["Application boundaries", "Public career content is separated from authenticated tools and internal administrative workflows."],
] as const;

export default function SecurityPage() {
  return <main className="min-h-screen bg-[#03050e] px-5 py-14 text-slate-200 sm:px-8 sm:py-20"><div className="mx-auto max-w-5xl">
    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-violet-300">Trust</p><h1 className="mt-3 font-display text-4xl font-bold tracking-tight text-white sm:text-5xl">Security at AI Role Path</h1>
    <p className="mt-5 max-w-3xl text-base leading-8 text-slate-400">AI Role Path is built with layered controls across authentication, authorization, deployment, and data access. This page describes the current product security posture without claiming certifications that have not been obtained.</p>
    <div className="mt-10 grid gap-4 sm:grid-cols-2">{controls.map(([title, description]) => <section key={title} className="rounded-2xl border border-white/10 bg-white/[0.025] p-5"><h2 className="font-display text-lg font-semibold text-white">{title}</h2><p className="mt-2 text-sm leading-7 text-slate-400">{description}</p></section>)}</div>
    <section className="mt-10 rounded-2xl border border-amber-300/15 bg-amber-300/[0.045] p-5"><h2 className="font-display text-lg font-semibold text-white">Responsible disclosure</h2><p className="mt-2 text-sm leading-7 text-slate-300">If you believe you found a security issue, do not publish sensitive details publicly. Contact us through the <Link href="/contact" className="font-semibold text-violet-300 hover:text-violet-200">contact page</Link> with a concise description and reproduction steps.</p></section>
  </div></main>;
}
