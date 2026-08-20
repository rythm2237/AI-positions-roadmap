import Link from "next/link";
import { legalOperator } from "@/lib/legal";
import { buildMetadata } from "@/lib/seo";

export const metadata = buildMetadata({
  title: "Data Requests",
  description: "How to submit a privacy or personal-data request to AI Role Path.",
  path: "/data-requests",
});

export default function DataRequestsPage() {
  return (
    <main className="min-h-screen bg-[#03050e] px-5 py-14 text-slate-200 sm:px-8 sm:py-20">
      <div className="mx-auto max-w-4xl">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-violet-300">Privacy</p>
        <h1 className="mt-3 font-display text-4xl font-bold tracking-tight text-white sm:text-5xl">Data requests</h1>
        <p className="mt-5 max-w-3xl text-base leading-8 text-slate-400">
          To ask about access, correction, deletion, restriction, portability, or another privacy matter relating to your personal data, contact our legal/privacy address.
        </p>

        <section className="mt-10 rounded-2xl border border-white/10 bg-white/[0.025] p-6">
          <h2 className="font-display text-xl font-semibold text-white">Submit a request</h2>
          <p className="mt-3 text-sm leading-7 text-slate-300">
            Email <a href={`mailto:${legalOperator.contactEmail}`} className="font-semibold text-violet-300 hover:text-violet-200">{legalOperator.contactEmail}</a>. State the type of request and the account email involved. We may need to verify identity before acting on a request.
          </p>
        </section>

        <div className="mt-8 flex flex-wrap gap-4 text-sm">
          <Link href="/legal/privacy" className="font-semibold text-violet-300 hover:text-violet-200">Privacy notice →</Link>
          <Link href="/contact" className="font-semibold text-violet-300 hover:text-violet-200">Contact →</Link>
        </div>
      </div>
    </main>
  );
}
