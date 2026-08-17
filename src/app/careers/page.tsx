import Link from "next/link";
import { AVAILABLE_CAREERS, CAREER_DOMAINS } from "@/data/careerCatalog";
import { absoluteUrl, buildMetadata, seoConfig } from "@/lib/seo";

export const metadata = buildMetadata({
  title: "AI Careers & Career Roadmaps",
  description:
    "Explore practical career roadmaps across AI engineering, product, automation, consulting, data, cloud, cybersecurity, and AI marketing.",
  path: "/careers",
  keywords: [
    "AI careers",
    "AI career paths",
    "AI career roadmaps",
    "careers in artificial intelligence",
    "AI automation careers",
  ],
});

export default function CareersPage() {
  const pageUrl = absoluteUrl("/careers");
  const schemas = [
    {
      "@context": "https://schema.org",
      "@type": "CollectionPage",
      "@id": `${pageUrl}#webpage`,
      url: pageUrl,
      name: "AI Careers & Career Roadmaps",
      description:
        "Explore role-specific career roadmaps across AI engineering, product, automation, consulting, data, infrastructure, security, and marketing.",
      inLanguage: seoConfig.language,
      isPartOf: { "@id": `${absoluteUrl("/")}#website` },
    },
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "AI Career OS", item: absoluteUrl("/") },
        { "@type": "ListItem", position: 2, name: "Careers", item: pageUrl },
      ],
    },
    {
      "@context": "https://schema.org",
      "@type": "ItemList",
      name: "Available AI Career OS career roadmaps",
      numberOfItems: AVAILABLE_CAREERS.length,
      itemListElement: AVAILABLE_CAREERS.map((career, index) => ({
        "@type": "ListItem",
        position: index + 1,
        name: career.title,
        url: absoluteUrl(`/careers/${career.slug}`),
      })),
    },
  ];

  return (
    <div className="min-h-dvh bg-[#03050e] text-white">
      {schemas.map((schema) => (
        <script
          key={`${schema["@type"]}-${"name" in schema ? schema.name : "schema"}`}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(schema).replace(/</g, "\\u003c") }}
        />
      ))}

      <header className="sticky top-0 z-40 border-b border-white/[0.06] bg-[#03050e]/88 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-5 py-4 sm:px-8">
          <Link href="/" className="font-display text-sm font-semibold tracking-tight text-white sm:text-base">
            AI Career <span className="text-violet-300">OS</span>
          </Link>
          <nav className="flex items-center gap-4 text-xs font-medium text-slate-400 sm:text-sm" aria-label="Career hub navigation">
            <Link href="/methodology" className="transition hover:text-white">Methodology</Link>
            <Link href="/sources" className="transition hover:text-white">Sources</Link>
            <Link href="/login" className="transition hover:text-white">Sign in</Link>
          </nav>
        </div>
      </header>

      <main>
        <section className="border-b border-white/[0.06] px-5 py-16 sm:px-8 sm:py-20" aria-labelledby="careers-title">
          <div className="mx-auto max-w-5xl">
            <nav aria-label="Breadcrumb" className="text-xs text-slate-500">
              <Link href="/" className="transition hover:text-slate-300">Home</Link>
              <span className="mx-2" aria-hidden="true">/</span>
              <span aria-current="page" className="text-slate-300">Careers</span>
            </nav>
            <p className="mt-8 text-xs font-semibold uppercase tracking-[.2em] text-violet-300">Career Network</p>
            <h1 id="careers-title" className="mt-3 max-w-4xl font-display text-4xl font-bold tracking-tight text-white sm:text-5xl lg:text-6xl">
              Explore AI careers and practical career roadmaps.
            </h1>
            <p className="mt-6 max-w-3xl text-base leading-8 text-slate-300 sm:text-lg">
              Compare role-specific paths across AI engineering, product, automation, consulting, data, infrastructure, security, and marketing. Each available career opens a structured workspace built around skills, roadmaps, projects, learning, and job readiness.
            </p>
            <div className="mt-8 flex flex-wrap gap-2" aria-label="Career domains">
              {CAREER_DOMAINS.map((domain) => (
                <a
                  key={domain}
                  href={`#${domain.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "")}`}
                  className="rounded-full border border-white/10 bg-white/[0.035] px-3 py-2 text-xs font-medium text-slate-300 transition hover:border-violet-300/30 hover:text-white"
                >
                  {domain}
                </a>
              ))}
            </div>
          </div>
        </section>

        <div className="mx-auto max-w-7xl px-5 py-14 sm:px-8 sm:py-18">
          {CAREER_DOMAINS.map((domain) => {
            const careers = AVAILABLE_CAREERS.filter((career) => career.domain === domain);
            if (!careers.length) return null;
            const sectionId = domain.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

            return (
              <section key={domain} id={sectionId} className="scroll-mt-24 border-b border-white/[0.06] py-10 last:border-b-0" aria-labelledby={`${sectionId}-title`}>
                <div className="grid gap-7 lg:grid-cols-[minmax(0,0.32fr)_minmax(0,0.68fr)]">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[.18em] text-violet-300">{careers.length} available</p>
                    <h2 id={`${sectionId}-title`} className="mt-2 font-display text-2xl font-semibold text-white sm:text-3xl">{domain}</h2>
                  </div>
                  <div className="grid gap-4 md:grid-cols-2">
                    {careers.map((career) => (
                      <article key={career.id} className="group rounded-2xl border border-white/[0.08] bg-white/[0.025] p-5 transition hover:border-violet-300/25 hover:bg-white/[0.045]">
                        <h3 className="font-display text-lg font-semibold text-white sm:text-xl">
                          <Link href={`/careers/${career.slug}`} className="rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-400">
                            {career.title}
                          </Link>
                        </h3>
                        <p className="mt-3 text-sm leading-6 text-slate-400">{career.description}</p>
                        <Link href={`/careers/${career.slug}`} className="mt-4 inline-flex min-h-10 items-center text-sm font-semibold text-violet-300 transition group-hover:text-violet-200">
                          Explore roadmap <span className="ml-1" aria-hidden="true">→</span>
                        </Link>
                      </article>
                    ))}
                  </div>
                </div>
              </section>
            );
          })}
        </div>
      </main>

      <footer className="border-t border-white/[0.06] px-5 py-8 text-sm text-slate-500 sm:px-8">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4">
          <p>AI Career OS</p>
          <nav className="flex flex-wrap gap-4" aria-label="Footer navigation">
            <Link href="/legal" className="transition hover:text-slate-300">Legal</Link>
            <Link href="/legal/privacy" className="transition hover:text-slate-300">Privacy</Link>
            <Link href="/sources" className="transition hover:text-slate-300">Sources</Link>
          </nav>
        </div>
      </footer>
    </div>
  );
}
