import CareerWorkspace from "@/components/career/CareerWorkspace";
import { aiWorkflowArchitectCareer } from "@/data/careers/ai-workflow-architect";

export const metadata = {
  title: "AI Workflow Architect Learning – AI Career OS",
  description:
    "Follow the AI Workflow Architect learning path, topic assessments, comprehensive step exams, projects, and portfolio work.",
};

export default function AIWorkflowArchitectLearningPage() {
  return <CareerWorkspace career={aiWorkflowArchitectCareer} initialSection="learning" />;
}
