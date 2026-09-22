import type { Metadata } from "next";
import { AIPluginsClient } from "@/components/ai-workspace/AIPluginsClient";

export const metadata: Metadata = {
  title: "Plugins & Tools | AI Role Path",
  description: "Provider-backed integrations and tool permissions for AI Workspace.",
  robots: { index: false, follow: false, noarchive: true, nosnippet: true },
};

export default function AIPluginsPage() {
  return <AIPluginsClient />;
}
