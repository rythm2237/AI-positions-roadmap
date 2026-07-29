// src/components/landing/Footer.tsx
// Public Beta footer aligned with the Landing Page's dark neural visual system.

import Link from "next/link";

const navLinks = [
  { label: "Explore Careers", href: "/#roadmaps" },
  { label: "How It Works", href: "/#how-it-works" },
  { label: "Register Interest", href: "/#waitlist" },
];

export default function Footer() {
  return (
    <footer className="border-t border-white/[0.06] bg-[#03050e] px-5 py-12 sm:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="flex flex-col items-start justify-between gap-8 sm:flex-row sm:items-center">
          {/* Brand */}
          <div className="max-w-xs">
            <p className="font-display text-base font-bold text-white">
              AI Career OS
            </p>
            <p className="mt-2 text-sm leading-6 text-slate-500">
              A personal Career Operating System for AI, Automation &amp; Digital Transformation.
            </p>
          </div>

          {/* Links */}
          <nav
            className="flex flex-wrap gap-x-6 gap-y-2"
            aria-label="Footer navigation"
          >
            {navLinks.map((link) => (
              <Link
                key={link.label}
                href={link.href}
                className="inline-flex min-h-11 items-center rounded-lg text-sm text-slate-500 transition-colors hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400"
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>

        {/* Bottom bar */}
        <div className="mt-10 border-t border-white/[0.06] pt-6 text-center text-xs text-slate-600">
          © {new Date().getFullYear()} AI Career OS. Public Beta.
        </div>
      </div>
    </footer>
  );
}
