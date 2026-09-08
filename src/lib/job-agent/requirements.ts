import type { CanonicalJobCandidate } from "./contracts.ts";
import type { CareerEvidenceItem } from "../../types/jobAgent.ts";

const COMMON_SKILLS = [
  "Python", "TypeScript", "JavaScript", "Java", "C#", "SQL", "React", "Next.js", "Node.js", "AWS", "Azure", "GCP", "Docker", "Kubernetes", "Terraform",
  "Machine Learning", "Generative AI", "LLM", "RAG", "OpenAI", "AI Agents", "Prompt Engineering", "Power BI", "Power Automate", "Power Apps", "Power Platform",
  "Copilot Studio", "Microsoft Fabric", "Dataverse", "DAX", "Power Query", "Tableau", "Excel", "ETL", "Data Modeling", "Data Analysis", "REST API", "API Integration",
  "RPA", "UiPath", "n8n", "Zapier", "Stakeholder Management", "Requirements Gathering", "Business Analysis", "Process Mapping", "Digital Transformation", "Solution Design",
  "Prompt Design", "Retrieval-Augmented Generation", "Agentic Workflows", "Commercial Awareness",
  "Workshop Facilitation", "Business Case Development", "Solution Consulting",
  "Product Management", "Project Management", "Agile", "Scrum", "Git", "GitHub", "Supabase", "Vercel", "SEO", "Google Analytics",
];

const SKILL_ALIASES: Array<[string, RegExp]> = [
  ["Workshop Facilitation", /\b(?:workshops?|workshop facilitation|bedarfsanalysen?)\b/i],
  ["Business Case Development", /\b(?:business cases?|entscheidungsvorlagen?)\b/i],
  ["Solution Consulting", /\b(?:solution consulting|solutions? sales|lösungsvertrieb|kundenberatung)\b/i],
];

const requirementHeading = /^(?:main |key |principal(?:es)? )?(?:requirements?|qualifications?|exigences|anforderungen|qualifikationen|deine skills|dein profil|was du mitbringst)\b/i;
const sectionEnding = /^(?:responsibilities|description(?: du poste)?|benefits|about (?:the role|us)|responsabilit[eé]s|aufgaben|in deiner mission|deine aufgaben|wir bieten|du verdienst)\b/i;
const requiredWording = /\b(required|must|need|minimum|proficient|strong experience|vorausgesetzt|erforderlich|sehr gute|fundiert(?:e[snmr]?)?|erfahrung|kenntnisse)\b/i;
const preferredWording = /\b(preferred|nice to have|bonus|desirable|von vorteil|wünschenswert)\b/i;

const seniority = (text: string) => {
  const normalized = text.toLowerCase();
  if (/\b(intern|trainee|graduate)\b/.test(normalized)) return "entry";
  if (/\b(junior|jr\.?|entry.level)\b/.test(normalized)) return "junior";
  if (/\b(principal|staff|lead|head|director|vice president|vp)\b/.test(normalized)) return "lead";
  if (/\b(senior|sr\.?)\b/.test(normalized)) return "senior";
  if (/\b(mid|intermediate)\b/.test(normalized)) return "mid";
  return null;
};

export function enrichRequirements(job: CanonicalJobCandidate, evidence: CareerEvidenceItem[]): CanonicalJobCandidate {
  const clauses = job.description.split(/(?<=[.;:\n])\s+|\n+/).filter(Boolean);
  const knownSkills = [...new Set([...COMMON_SKILLS, ...evidence.map((item) => item.label)].filter((label) => label.length > 1))];
  const required = new Set(job.requiredSkills);
  const preferred = new Set(job.preferredSkills);
  let requirementSection = false;
  for (const clause of clauses) {
    const lower = clause.toLowerCase();
    if (requirementHeading.test(clause.trim())) {
      requirementSection = true;
      continue;
    }
    if (sectionEnding.test(clause.trim())) requirementSection = false;
    for (const skill of knownSkills) {
      if (!lower.includes(skill.toLowerCase())) continue;
      if (requirementSection || requiredWording.test(lower)) required.add(skill);
      else if (preferredWording.test(lower)) preferred.add(skill);
    }
    for (const [skill, pattern] of SKILL_ALIASES) {
      if (!pattern.test(clause)) continue;
      if (requirementSection || requiredWording.test(lower)) required.add(skill);
      else if (preferredWording.test(lower)) preferred.add(skill);
    }
  }
  const education = new Set(job.educationRequirements);
  const certifications = new Set(job.certificationRequirements);
  requirementSection = false;
  for (const clause of clauses) {
    if (requirementHeading.test(clause.trim())) {
      requirementSection = true;
      continue;
    }
    if (sectionEnding.test(clause.trim())) requirementSection = false;
    if (/\b(?:bachelor(?:'s)?|master(?:'s)?|ph\.?d\.?|doctorate|degree|studium|ausbildung)\b/i.test(clause) && (requirementSection || requiredWording.test(clause))) education.add(clause.trim().slice(0, 300));
    const certificate = clause.match(/\b(?:valid|required|must (?:hold|have)|certified)\b[^.!?\n]{0,100}\b(PMP|CPA|CFA|CISSP|CISM|CCNA|AWS Certified|Azure Certified|professional licen[cs]e|security clearance)\b/i)?.[1];
    if (certificate) certifications.add(certificate);
  }
  const visaSponsorship = /\b(?:visa )?sponsorship (?:is )?(?:available|provided|offered)\b/i.test(job.description) ? "available"
    : /\b(?:no|not) (?:visa )?sponsorship|must (?:already )?have (?:the )?(?:right|authorization) to work\b/i.test(job.description) ? "not_available" : job.visaSponsorship;
  const workplaceModel = job.workplaceModel !== "unknown" ? job.workplaceModel : /\bhybrid\b/i.test(job.description) ? "hybrid" : /\b(?:fully remote|remote role|work from home)\b/i.test(job.description) ? "remote" : /\b(?:on[- ]site|office[- ]based)\b/i.test(job.description) ? "on_site" : "unknown";
  return { ...job, seniority: job.seniority ?? seniority(job.title), workplaceModel, requiredSkills: [...required], preferredSkills: [...preferred], educationRequirements: [...education], certificationRequirements: [...certifications], visaSponsorship };
}
