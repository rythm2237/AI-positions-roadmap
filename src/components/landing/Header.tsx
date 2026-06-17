// src/components/landing/Header.tsx
// Sticky top navigation with brand name, section links, and waitlist CTA.

import Link from "next/link";

export default function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-gray-100 bg-white/95 backdrop-blur-sm">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
        {/* Brand */}
        <Link href="/" className="flex items-center gap-2">
          <span className="text-xl font-bold text-gray-900 tracking-tight">
            AI Career Roadmaps
          </span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden items-center gap-6 md:flex" aria-label="Main navigation">
          <Link
            href="#roadmaps"
            className="text-sm font-medium text-gray-600 transition-colors hover:text-gray-900"
          >
            Roadmaps
          </Link>
          <Link
            href="#preview"
            className="text-sm font-medium text-gray-600 transition-colors hover:text-gray-900"
          >
            Preview
          </Link>
          <Link
            href="#how-it-works"
            className="text-sm font-medium text-gray-600 transition-colors hover:text-gray-900"
          >
            How It Works
          </Link>
          <Link
            href="#pricing"
            className="text-sm font-medium text-gray-600 transition-colors hover:text-gray-900"
          >
            Pricing
          </Link>
        </nav>

        {/* CTA */}
        <Link
          href="#waitlist"
          className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
        >
          Join Waitlist
        </Link>
      </div>
    </header>
  );
}
