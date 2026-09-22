import type { Metadata } from "next";
import { AIKnowledgeClient } from "@/components/ai-workspace/AIKnowledgeClient";

export const metadata: Metadata = {
  title: "Knowledge & Memory | AI Role Path",
  description: "Private project files and controlled memory for AI Workspace.",
  robots: { index: false, follow: false, noarchive: true, nosnippet: true },
};

export default function AIKnowledgePage() {
  return <AIKnowledgeClient />;
}
