import fs from "node:fs";

const path = "src/data/careerTitleAliases.ts";
let source = fs.readFileSync(path, "utf8");

const entries = `
  "bi-developer": [
    { title: "Business Intelligence Developer", keywords: ["Business Intelligence Engineer"] },
    { title: "Power BI Developer", keywords: ["Microsoft Power BI Developer"] },
    { title: "BI Engineer", keywords: ["Business Intelligence Engineer"] },
    { title: "Analytics Developer", keywords: ["Analytical Applications Developer"] },
    { title: "Reporting Developer", keywords: ["Enterprise Reporting Developer"] },
    { title: "Semantic Model Developer", keywords: ["Tabular Model Developer"] },
  ],
  "ai-knowledge-engineer": [
    { title: "Knowledge Engineer", keywords: ["Enterprise Knowledge Engineer"] },
    { title: "Generative AI Knowledge Engineer", keywords: ["GenAI Knowledge Engineer"] },
    { title: "RAG Engineer", keywords: ["Retrieval Augmented Generation Engineer"] },
    { title: "AI Knowledge Architect", keywords: ["Knowledge Architecture Specialist"] },
    { title: "Knowledge Graph Engineer", keywords: ["Graph Knowledge Engineer"] },
    { title: "Search and Retrieval Engineer", keywords: ["AI Retrieval Engineer"] },
  ],
  "data-engineer": [
    { title: "Cloud Data Engineer", keywords: ["Data Engineer Cloud"] },
    { title: "Analytics Engineer", keywords: ["Analytics Data Engineer"] },
    { title: "Big Data Engineer", keywords: ["Distributed Data Engineer"] },
    { title: "Data Platform Engineer", keywords: ["Enterprise Data Platform Engineer"] },
    { title: "ETL Developer", keywords: ["ELT Developer", "Data Integration Developer"] },
    { title: "Streaming Data Engineer", keywords: ["Real-Time Data Engineer"] },
  ],
  "devops-engineer": [
    { title: "Cloud DevOps Engineer", keywords: ["DevOps Cloud Engineer"] },
    { title: "Platform Engineer", keywords: ["Developer Platform Engineer"] },
    { title: "Site Reliability Engineer", keywords: ["SRE"] },
    { title: "Infrastructure Automation Engineer", keywords: ["Infrastructure Engineer Automation"] },
    { title: "CI/CD Engineer", keywords: ["Continuous Delivery Engineer"] },
    { title: "DevSecOps Engineer", keywords: ["Secure DevOps Engineer"] },
  ],
  "business-ai-consultant": [
    { title: "Business AI Advisor", keywords: ["AI Business Advisor"] },
    { title: "AI Business Consultant", keywords: ["Artificial Intelligence Business Consultant"] },
    { title: "AI Opportunity Consultant", keywords: ["AI Use Case Consultant"] },
    { title: "AI Value Consultant", keywords: ["AI Business Value Consultant"] },
    { title: "Generative AI Business Consultant", keywords: ["GenAI Business Consultant"] },
    { title: "AI Business Solutions Consultant", keywords: ["Business AI Solutions Specialist"] },
  ],`;

if (!source.includes('"bi-developer": [')) {
  const marker = "\n};\n\nexport function normalizeCareerTitle";
  if (!source.includes(marker)) throw new Error("Career alias registry marker not found.");
  source = source.replace(marker, `${entries}\n};\n\nexport function normalizeCareerTitle`);
  fs.writeFileSync(path, source);
  console.log("Added aliases for BI Developer, AI Knowledge Engineer, Data Engineer, DevOps Engineer, and Business AI Consultant.");
} else {
  console.log("Aliases for activation batch six already exist.");
}
