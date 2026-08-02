import CareerWorkspace from "@/components/career/CareerWorkspace";
import { aiWorkflowArchitectCareer } from "@/data/careers/ai-workflow-architect";

export const metadata = {
  title: "AI Workflow Architect – AI Career OS",
  description:
    "Learn to design governed human-and-AI workflows across agents, tools, systems, decisions, state, controls, and operations.",
};

export default function AIWorkflowArchitectPage() {
  return <CareerWorkspace career={aiWorkflowArchitectCareer} />;
}
