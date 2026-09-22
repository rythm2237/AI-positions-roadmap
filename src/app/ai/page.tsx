import Link from "next/link";
import type { Metadata } from "next";
import { AIWorkspaceClient } from "@/components/ai-workspace/AIWorkspaceClient";

export const metadata: Metadata = {
  title: "AI Workspace | AI Role Path",
  description: "Private AI workspace for projects, skills, saved prompts and cost-aware AI execution.",
  robots: { index: false, follow: false, noarchive: true, nosnippet: true },
};

export default function AIWorkspacePage() {
  return <>
    <AIWorkspaceClient />
    <div className="fixed bottom-[max(84px,calc(env(safe-area-inset-bottom)+72px))] left-4 z-[70] flex gap-2 lg:left-[302px]">
      <Link href="/ai/knowledge" className="rounded-full border border-cyan-300/15 bg-[#101522]/95 px-3 py-2 text-xs font-semibold text-cyan-100 shadow-xl backdrop-blur-xl transition hover:border-cyan-300/30 hover:bg-[#151b2a]" aria-label="Open project knowledge and memory">Knowledge & Memory</Link>
      <Link href="/ai/plugins" className="rounded-full border border-violet-300/15 bg-[#101522]/95 px-3 py-2 text-xs font-semibold text-violet-100 shadow-xl backdrop-blur-xl transition hover:border-violet-300/30 hover:bg-[#151b2a]" aria-label="Open plugins and tools">Plugins & Tools</Link>
    </div>
  </>;
}
