import fs from "node:fs";

const path = "src/data/careerTitleAliases.ts";
let source = fs.readFileSync(path, "utf8");

const entries = `
  "ai-adoption-consultant": [
    { title: "AI Change Management Consultant", keywords: ["AI Change Consultant", "AI Change Manager"] },
    { title: "AI Enablement Consultant", keywords: ["AI Workforce Enablement Consultant", "AI Enablement Lead"] },
    { title: "AI Adoption Specialist", keywords: ["AI Adoption Lead", "Generative AI Adoption Specialist"] },
    { title: "AI Workforce Transformation Consultant", keywords: ["AI Workforce Consultant"] },
    { title: "GenAI Adoption Consultant", keywords: ["Generative AI Adoption Consultant"] },
    { title: "AI Learning and Adoption Consultant", keywords: ["AI Training and Adoption Consultant"] },
  ],
  "microsoft-copilot-consultant": [
    { title: "Microsoft 365 Copilot Consultant", keywords: ["M365 Copilot Consultant"] },
    { title: "Copilot Studio Consultant", keywords: ["Microsoft Copilot Studio Specialist"] },
    { title: "Microsoft Copilot Specialist", keywords: ["Copilot Solutions Specialist"] },
    { title: "Copilot Adoption Consultant", keywords: ["Microsoft Copilot Adoption Lead"] },
    { title: "Power Platform Copilot Consultant", keywords: ["Microsoft Power Platform AI Consultant"] },
    { title: "Copilot Solutions Architect", keywords: ["Microsoft Copilot Architect"] },
  ],
  "ai-marketing-specialist": [
    { title: "Generative AI Marketing Specialist", keywords: ["GenAI Marketing Specialist"] },
    { title: "AI Growth Marketing Specialist", keywords: ["AI Growth Marketer"] },
    { title: "AI Marketing Automation Specialist", keywords: ["AI Campaign Automation Specialist"] },
    { title: "AI Digital Marketing Specialist", keywords: ["Artificial Intelligence Marketing Specialist"] },
    { title: "AI Performance Marketing Specialist", keywords: ["AI Performance Marketer"] },
    { title: "AI Lifecycle Marketing Specialist", keywords: ["AI CRM Marketing Specialist"] },
  ],
  "data-analyst": [
    { title: "Business Data Analyst", keywords: ["Business Analyst Data"] },
    { title: "BI Analyst", keywords: ["Business Intelligence Analyst"] },
    { title: "Reporting Analyst", keywords: ["Data Reporting Analyst"] },
    { title: "Product Data Analyst", keywords: ["Product Analyst"] },
    { title: "Operations Data Analyst", keywords: ["Operations Analyst"] },
    { title: "Insights Analyst", keywords: ["Data Insights Analyst"] },
  ],
  "data-scientist": [
    { title: "Applied Data Scientist", keywords: ["Applied Scientist Data"] },
    { title: "Machine Learning Data Scientist", keywords: ["ML Data Scientist"] },
    { title: "Product Data Scientist", keywords: ["Data Scientist Product"] },
    { title: "Decision Scientist", keywords: ["Decision Science Analyst"] },
    { title: "Research Data Scientist", keywords: ["Data Science Researcher"] },
    { title: "Statistical Data Scientist", keywords: ["Statistical Scientist"] },
  ],`;

if (!source.includes('"ai-adoption-consultant": [')) {
  const marker = "\n};\n\nexport function normalizeCareerTitle";
  if (!source.includes(marker)) throw new Error("Career alias registry marker not found.");
  source = source.replace(marker, `${entries}\n};\n\nexport function normalizeCareerTitle`);
  fs.writeFileSync(path, source);
  console.log("Added aliases for five activated careers.");
} else {
  console.log("Aliases for five activated careers already exist.");
}
