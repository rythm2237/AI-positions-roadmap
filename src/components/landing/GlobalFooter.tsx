"use client";

// Production redeploy marker: global footer rollout finalized.
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { BrandLogoWithDescriptor } from "@/components/brand/BrandLogo";
import CookieSettingsButton from "@/components/legal/CookieSettingsButton";

const footerGroups = [
  {
    title: "Explore",
    links: [
      ["Careers", "/careers"],
      ["Career Intelligence", "/career-intelligence"],
      ["CV Analyzer", "/cv-analyzer"],
      ["Methodology", "/methodology"],
      ["Sources", "/sources"],
    ],
  },
  {
    title: "Trust",
    links: [
      ["Security", "/security"],
      ["AI Transparency", "/ai-transparency"],
      ["Data & Privacy", "/legal/privacy"],
    ],
  },
  {
    title: "Legal",
    links: [
      ["Privacy", "/legal/privacy"],
      ["Terms", "/legal/terms"],
      ["Cookies", "/legal/cookies"],
      ["Refunds", "/legal/refunds"],
      ["Data Requests", "/data-requests"],
      ["Legal", "/legal"],
    ],
  },
  {
    title: "Help",
    links: [
      ["Support", "/support"],
      ["Contact", "/contact"],
      ["Methodology", "/methodology"],
      ["Sources", "/sources"],
    ],
  },
] as const;

function FooterContents({ compact = false }: { compact?: boolean }) {
  return (
    <div className={compact ? "mx-auto max-w-7xl px-5 py-7 sm:px-8" : "mx-auto max-w-7xl px-5 py-12 sm:px-8"}>
      <div className="grid gap-9 lg:grid-cols-[1.45fr_repeat(4,minmax(0,1fr))] lg:gap-8">
        <div className="max-w-sm">
          <BrandLogoWithDescriptor className="h-11 w-auto" />
          <p className="mt-4 text-sm leading-6 text-slate-400">
            Practical role paths, learning roadmaps, career intelligence, and AI-assisted tools for building evidence toward your next role.
          </p>
        </div>

        {footerGroups.map((group) => (
          <nav key={group.title} aria-label={`${group.title} footer navigation`}>
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">{group.title}</p>
            <div className="mt-3 grid gap-1.5">
              {group.links.map(([label, href]) => (
                <Link
                  key={`${group.title}-${href}`}
                  href={href}
                  className="w-fit rounded-md py-1 text-sm text-slate-400 transition hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-400"
                >
                  {label}
                </Link>
              ))}
              {group.title === "Legal" ? <CookieSettingsButton /> : null}
            </div>
          </nav>
        ))}
      </div>

      <div className="mt-9 flex flex-col gap-3 border-t border-white/[0.07] pt-5 text-xs text-slate-600 sm:flex-row sm:items-center sm:justify-between">
        <span>© {new Date().getFullYear()} AI Role Path. Public Beta.</span>
        <span>Career guidance is informational and should be validated against current market requirements.</span>
      </div>
    </div>
  );
}

function LandingFooterDrawer() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
    const close = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", close);
    return () => window.removeEventListener("keydown", close);
  }, [open]);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="fixed bottom-0 left-1/2 z-[62] flex -translate-x-1/2 items-center gap-2 rounded-t-2xl border border-b-0 border-white/10 bg-[#070919]/92 px-4 py-2 text-xs font-semibold text-slate-300 shadow-2xl backdrop-blur-xl transition hover:bg-[#0a0d20] hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-400 sm:px-5"
        aria-haspopup="dialog"
        aria-expanded={open}
      >
        <span>Info · Trust · Legal · Help</span>
        <span aria-hidden="true">⌃</span>
      </button>

      {open ? (
        <>
          <button
            type="button"
            aria-label="Close footer"
            onClick={() => setOpen(false)}
            className="fixed inset-0 z-[89] bg-black/65 backdrop-blur-sm"
          />

          <section
            role="dialog"
            aria-modal="true"
            aria-label="AI Role Path information and footer navigation"
            className="fixed inset-x-0 bottom-0 z-[90] max-h-[78dvh] overflow-y-auto overscroll-contain rounded-t-[28px] border-t border-white/10 bg-[#050817]/98 shadow-[0_-22px_70px_rgba(0,0,0,.45)] backdrop-blur-2xl"
          >
            <div className="sticky top-0 z-10 flex items-center justify-between border-b border-white/[0.07] bg-[#050817]/94 px-5 py-3 backdrop-blur-xl sm:px-8">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-violet-300">AI Role Path</p>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="grid h-9 w-9 place-items-center rounded-xl border border-white/10 text-lg text-slate-300 transition hover:bg-white/[0.05] hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-400"
                aria-label="Close footer"
                autoFocus
              >
                ×
              </button>
            </div>
            <FooterContents compact />
          </section>
        </>
      ) : null}
    </>
  );
}

export default function GlobalFooter() {
  const pathname = usePathname();

  if (pathname.startsWith("/admin")) return null;
  if (pathname === "/") return <LandingFooterDrawer />;

  return (
    <footer className="border-t border-white/[0.07] bg-[#03050e] text-slate-200">
      <FooterContents />
    </footer>
  );
}
