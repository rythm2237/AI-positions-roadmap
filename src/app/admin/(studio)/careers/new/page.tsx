import Link from "next/link";
import GenerativeCareerBuilder from "@/components/admin/GenerativeCareerBuilder";
import { findCareerBySlug } from "@/data/careerCatalog";

export default async function NewCareerPage({ searchParams }: { searchParams: Promise<{ catalog?: string }> }) {
  const query = await searchParams;
  const catalog = query.catalog ? findCareerBySlug(query.catalog) : undefined;
  return (
    <main className="p-4 sm:p-8 lg:p-10">
      <Link href="/admin/careers" className="text-sm text-cyan-300 underline underline-offset-4">← Career inventory</Link>
      <div className="mt-6 max-w-3xl">
        <p className="eyebrow">AI-native content operations</p>
        <h2 className="mt-3 font-display text-3xl font-semibold text-white sm:text-4xl">Create a complete Career in a few clicks</h2>
        <p className="mt-3 text-sm leading-6 text-slate-400 sm:text-base">
          Start with one title. Career OS generates a standards-aligned draft, keeps learning-source research separate, and guides you through review before anything can be published.
        </p>
      </div>
      <div className="mt-8 max-w-7xl">
        <GenerativeCareerBuilder initialTitle={catalog?.title ?? ""} />
      </div>
    </main>
  );
}
