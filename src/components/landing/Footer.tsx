// src/components/landing/Footer.tsx
// Simple, clean footer with brand info and placeholder navigation links.

import Link from "next/link";

const navLinks = [
  { label: "Roadmaps", href: "#roadmaps" },
  { label: "Pricing", href: "#pricing" },
  { label: "About", href: "#" },
  { label: "Contact", href: "#" },
];

export default function Footer() {
  return (
    <footer className="border-t border-gray-100 bg-white px-4 py-12 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="flex flex-col items-start justify-between gap-8 sm:flex-row sm:items-center">
          {/* Brand */}
          <div className="max-w-xs">
            <p className="text-base font-bold text-gray-900">
              AI Career Roadmaps
            </p>
            <p className="mt-2 text-sm text-gray-500">
              Role-based AI career roadmaps to help you become job-ready with
              structured learning, real projects, and progress tracking.
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
                className="text-sm text-gray-500 transition-colors hover:text-gray-900"
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>

        {/* Bottom bar */}
        <div className="mt-10 border-t border-gray-100 pt-6 text-center text-xs text-gray-400">
          © {new Date().getFullYear()} AI Career Roadmaps. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
