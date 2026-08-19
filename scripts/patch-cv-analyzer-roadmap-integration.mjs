import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const headerPath = path.join(root, "src/components/landing/Header.tsx");
const workspacePath = path.join(root, "src/components/career/CareerWorkspace.tsx");
const tourPath = path.join(root, "src/components/onboarding/FirstVisitGuidedTour.tsx");
const clientPath = path.join(root, "src/components/cv-analyzer/CVAnalyzerClient.tsx");

function read(file) {
  return fs.readFileSync(file, "utf8");
}

function write(file, value) {
  fs.writeFileSync(file, value);
}

let header = read(headerPath);
header = header.replace('  { kind: "link", label: "CV Analyzer", href: "/cv-analyzer" },\n', "");

const oldSteps = `const STEPS = [
  ["Explore", "Compare focused AI career directions."],
  ["Analyze", "Upload or build your CV to understand strengths, gaps, and role fit."],
  ["Choose", "Select the role that fits your goals and background."],
  ["Learn", "Follow one connected roadmap and learning journey."],
  ["Prove", "Build projects, portfolio evidence, and job readiness."],
] as const;`;
const newSteps = `const STEPS = [
  ["Explore", "Compare focused AI career directions."],
  ["Choose", "Select the role that fits your goals and background."],
  ["Learn", "Follow one connected roadmap and learning journey."],
  ["Prove", "Build projects and portfolio evidence for the role."],
  ["Prepare", "When your evidence is ready, analyze and tailor your CV inside Job Preparation."],
] as const;`;
if (header.includes(oldSteps)) header = header.replace(oldSteps, newSteps);
header = header.replace(
  "Career OS connects discovery, CV analysis, Roadmap, Learning, projects, portfolio evidence, and job preparation in one coherent journey.",
  "Career OS connects discovery, Roadmap, Learning, projects, portfolio evidence, CV preparation, and applications in one coherent journey.",
);
header = header.replace(
  "ANALYZE → CHOOSE → LEARN → BUILD → PROVE → APPLY",
  "CHOOSE → LEARN → BUILD → PROVE → PREPARE → APPLY",
);
if (header.includes('{ kind: "link", label: "CV Analyzer"')) {
  throw new Error("CV Analyzer is still exposed in primary navigation.");
}
write(headerPath, header);

let workspace = read(workspacePath);
const oldResumeStep = `    {
      title: "Resume",
      purpose: "Turn project decisions and measurable outcomes into concise, role-specific evidence.",
      status: hasProjectProof ? "Proof available" : "Needs project evidence",
      href: getSectionHref("project"),
      action: hasProjectProof ? "Review project evidence" : "Build project evidence",
    },`;
const newResumeStep = `    {
      title: "CV / Resume",
      purpose: "Turn project decisions and measurable outcomes into concise, role-specific evidence, then test the CV against this career before applying.",
      status: hasProjectProof ? "Ready for CV analysis" : "Needs project evidence",
      href: hasProjectProof ? \`/cv-analyzer?target=\${encodeURIComponent(career.title)}&career=\${encodeURIComponent(career.slug)}&source=roadmap\` : getSectionHref("project"),
      action: hasProjectProof ? "Analyze CV for this career" : "Build project evidence",
    },`;
if (workspace.includes(oldResumeStep)) workspace = workspace.replace(oldResumeStep, newResumeStep);

const oldRecommended = `<div className="mt-8 rounded-2xl border border-indigo-300/15 bg-indigo-500/[0.06] p-5">
            <p className="text-sm font-semibold text-indigo-100">Recommended next step</p>
            <p className="mt-2 text-sm leading-6 text-slate-300">{hasProjectProof ? "Shape your strongest completed project into a concise case study." : "Complete one practical project before drafting application claims."}</p>
            <Link href={getSectionHref("project")} className="mt-4 inline-flex min-h-11 items-center rounded-xl border border-indigo-300/25 px-4 py-2 text-sm font-semibold text-indigo-100 hover:bg-indigo-400/10">
              {hasProjectProof ? "Review project proof" : "Go to projects"}
            </Link>
          </div>`;
const newRecommended = `<div className="mt-8 rounded-2xl border border-indigo-300/15 bg-indigo-500/[0.06] p-5" data-help-title="CV preparation" data-help-description="Once you have project evidence, use the CV Analyzer here to assess and tailor your CV for this specific career before moving into applications.">
            <p className="text-sm font-semibold text-indigo-100">Recommended next step</p>
            <p className="mt-2 text-sm leading-6 text-slate-300">{hasProjectProof ? \`Your evidence is ready for CV preparation. Analyze your current CV against \${career.title}, then close the highest-value gaps before applying.\` : "Complete one practical project before drafting application claims."}</p>
            <Link href={hasProjectProof ? \`/cv-analyzer?target=\${encodeURIComponent(career.title)}&career=\${encodeURIComponent(career.slug)}&source=roadmap\` : getSectionHref("project")} className="mt-4 inline-flex min-h-11 items-center rounded-xl border border-indigo-300/25 px-4 py-2 text-sm font-semibold text-indigo-100 hover:bg-indigo-400/10">
              {hasProjectProof ? "Open CV Analyzer" : "Go to projects"}
            </Link>
          </div>`;
if (workspace.includes(oldRecommended)) workspace = workspace.replace(oldRecommended, newRecommended);

if (!workspace.includes("Analyze CV for this career") || !workspace.includes('data-help-title="CV preparation"')) {
  throw new Error("CV Analyzer was not integrated into the shared Job Preparation module.");
}
write(workspacePath, workspace);

let tour = read(tourPath);
tour = tour.replace(
  "In about a minute, we’ll show you how to discover a career, analyze your CV, understand your roadmap, build evidence, and prepare for opportunities.",
  "In about a minute, we’ll show you how to discover a career, follow its roadmap, build evidence, prepare your CV, and move toward opportunities.",
);
tour = tour.replace(
  "Use the top navigation to browse Careers, open the CV Analyzer, understand how Career OS works, and return to the Universe whenever you want.",
  "Use the top navigation to browse Careers, understand how Career OS works, and return to the Universe whenever you want.",
);
tour = tour.replace(/  \{\n    id: "cv-analyzer",[\s\S]*?  \},\n  \{\n    id: "cv-input",[\s\S]*?  \},\n/, "");
tour = tour.replace('eyebrow: "05 · Compare"', 'eyebrow: "03 · Compare"');
tour = tour.replace('eyebrow: "06 · Choose"', 'eyebrow: "04 · Choose"');
tour = tour.replace('eyebrow: "07 · Build your path"', 'eyebrow: "05 · Build your path"');
tour = tour.replace(
  "A Career Workspace brings Roadmap, Learning, Projects, Portfolio evidence, Jobs, Interview preparation, and career intelligence into one connected journey.",
  "A Career Workspace connects Roadmap, Learning, Projects and Portfolio evidence. When you reach Job Preparation, the CV Analyzer appears there so CV work happens in context—not as a disconnected homepage tool.",
);
tour = tour.replace(
  "Analyze your starting point, choose a role, close the highest-value gaps, build evidence, and prepare for real opportunities. You can restart this tour any time from the Tour button.",
  "Choose a role, close the highest-value gaps, build evidence, then use Job Preparation to analyze your CV before moving into applications. You can restart this tour any time from the Tour button.",
);
tour = tour.replace(
  "We’ll show you Career discovery, CV analysis, Career Workspaces, and how the system connects gaps to learning and evidence.",
  "We’ll show you Career discovery, Career Workspaces, and how the system connects learning, evidence, CV preparation and applications.",
);
if (tour.includes('route: "/cv-analyzer"')) {
  throw new Error("Guided Tour still treats CV Analyzer as a standalone early-stage destination.");
}
write(tourPath, tour);

let client = read(clientPath);
if (!client.includes("initialTargetPosition")) {
  client = client.replace(
    "export default function CVAnalyzerClient() {",
    'export default function CVAnalyzerClient({ initialTargetPosition = "" }: { initialTargetPosition?: string }) {',
  );
  client = client.replace(
    '  const [profile, setProfile] = useState<Profile>(initialProfile);',
    '  const [profile, setProfile] = useState<Profile>(() => ({ ...initialProfile, targetPosition: initialTargetPosition, openToSuggestions: !initialTargetPosition }));',
  );
}
if (!client.includes("initialTargetPosition")) {
  throw new Error("CV Analyzer target-career context was not wired into the client.");
}
write(clientPath, client);

console.log("CV Analyzer roadmap integration applied: homepage nav removed, Job Preparation CTA added, tour repositioned, and target career context enabled.");
