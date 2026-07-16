import CareerWorkspace from "@/components/career/CareerWorkspace";

export const metadata = {
  title: "AI Engineer Learning – AI Career OS",
  description: "Learn through the same stations and progress model as the AI Engineer Roadmap.",
};

export default function AIEngineerLearningPage() {
  return <CareerWorkspace initialSection="learning" />;
}
