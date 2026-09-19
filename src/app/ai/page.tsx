import type { Metadata } from "next";
import { AIWorkspaceClient } from "@/components/ai-workspace/AIWorkspaceClient";

export const metadata: Metadata = {
  title: "AI Workspace | AI Role Path",
  description: "Private AI workspace for projects, skills, saved prompts and cost-aware AI execution.",
  robots: { index: false, follow: false, noarchive: true, nosnippet: true },
};

export default function AIWorkspacePage() {
  return <AIWorkspaceClient />;
}
