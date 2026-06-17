// src/components/roadmap/RoadmapCTA.tsx
// Bottom call-to-action section on the roadmap detail page.
// Encourages users to start the free phase or join the waitlist for full access.

import Link from "next/link";
import { PositionStatus } from "@/types/career";

interface RoadmapCTAProps {
  status: PositionStatus;
  title: string;
}

export default function RoadmapCTA({ status, title }: RoadmapCTAProps) {
  const isMvpReady = status === "mvp-ready";

  return (
    <section className="bg-white px-4 py-16 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-4xl">
        <div className="rounded-2xl bg-gradient-to-br from-indigo-600 to-indigo-700 px-8 py-12 text-center shadow-lg">
          {isMvpReady ? (
            <>
              <h2 className="text-3xl font-extrabold text-white">
                Ready to start your journey?
              </h2>
              <p className="mx-auto mt-4 max-w-xl text-base text-indigo-100">
                Phase 1 of the <strong>{title}</strong> roadmap is completely
                free. No account needed — start learning right now.
              </p>
              <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
                <Link
                  href="/#waitlist"
                  className="w-full rounded-xl bg-white px-8 py-3.5 text-center text-base font-bold text-indigo-700 shadow-md transition-colors hover:bg-indigo-50 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-indigo-600 sm:w-auto"
                >
                  Start Free — Phase 1
                </Link>
                <Link
                  href="/#pricing"
                  className="w-full rounded-xl border border-indigo-300 bg-indigo-700 px-8 py-3.5 text-center text-base font-bold text-white transition-colors hover:bg-indigo-800 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-indigo-600 sm:w-auto"
                >
                  Unlock Full Roadmap
                </Link>
              </div>
            </>
          ) : (
            <>
              <h2 className="text-3xl font-extrabold text-white">
                This roadmap is coming soon
              </h2>
              <p className="mx-auto mt-4 max-w-xl text-base text-indigo-100">
                <strong>{title}</strong> is currently in development. Join the
                waitlist to get early access and a launch discount.
              </p>
              <div className="mt-8">
                <Link
                  href="/#waitlist"
                  className="inline-block rounded-xl bg-white px-10 py-3.5 text-base font-bold text-indigo-700 shadow-md transition-colors hover:bg-indigo-50 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-indigo-600"
                >
                  Join the Waitlist
                </Link>
              </div>
            </>
          )}
        </div>
      </div>
    </section>
  );
}
