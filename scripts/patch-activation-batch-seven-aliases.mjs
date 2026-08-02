import fs from "node:fs";

const path = "src/data/careerTitleAliases.ts";
let source = fs.readFileSync(path, "utf8");

const entries = `
  "cybersecurity-analyst": [
    { title: "Security Operations Analyst", keywords: ["SOC Analyst", "Cyber Security Operations Analyst"] },
    { title: "Information Security Analyst", keywords: ["InfoSec Analyst", "IT Security Analyst"] },
    { title: "Cyber Defense Analyst", keywords: ["Defensive Security Analyst"] },
    { title: "Incident Response Analyst", keywords: ["Cyber Incident Analyst", "DFIR Analyst"] },
    { title: "Threat Detection Analyst", keywords: ["Detection and Response Analyst"] },
    { title: "Cloud Security Analyst", keywords: ["Cloud Cybersecurity Analyst"] },
  ],
  "cloud-engineer": [
    { title: "Cloud Infrastructure Engineer", keywords: ["Cloud Infrastructure Specialist"] },
    { title: "Cloud Platform Engineer", keywords: ["Cloud Platform Specialist"] },
    { title: "Cloud Operations Engineer", keywords: ["Cloud Ops Engineer"] },
    { title: "Azure Cloud Engineer", keywords: ["Microsoft Azure Engineer"] },
    { title: "AWS Cloud Engineer", keywords: ["Amazon Web Services Cloud Engineer"] },
    { title: "Google Cloud Engineer", keywords: ["GCP Cloud Engineer"] },
  ],`;

if (!source.includes('"cybersecurity-analyst": [')) {
  const marker = /\r?\n};\r?\n\r?\nexport function normalizeCareerTitle/;
  if (!marker.test(source)) throw new Error("Career alias registry marker not found.");
  source = source.replace(marker, `${entries}\n};\n\nexport function normalizeCareerTitle`);
  fs.writeFileSync(path, source);
  console.log("Added aliases for Cybersecurity Analyst and Cloud Engineer.");
} else {
  console.log("Cybersecurity Analyst and Cloud Engineer aliases already exist.");
}
