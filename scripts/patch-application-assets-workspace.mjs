import fs from "node:fs";

const path = "src/components/career/jobs/JobLaunchWorkspace.tsx";
let source = fs.readFileSync(path, "utf8");

if (!source.includes('import { ApplicationAssetsWorkspace } from "@/components/career/jobs/ApplicationAssetsWorkspace";')) {
  source = source.replace(
    'import { getJobReadinessReport } from "@/lib/jobReadiness";',
    'import { getJobReadinessReport } from "@/lib/jobReadiness";\nimport { ApplicationAssetsWorkspace } from "@/components/career/jobs/ApplicationAssetsWorkspace";'
  );
}

const anchor = '      </section>\n\n      {saved.length > 0 ?';
if (!source.includes("ApplicationAssetsWorkspace career={career}")) {
  if (!source.includes(anchor)) throw new Error("Application assets insertion anchor changed.");
  source = source.replace(anchor, '      </section>\n\n      {current ? <ApplicationAssetsWorkspace career={career} input={current.input} result={current.result} /> : null}\n\n      {saved.length > 0 ?');
}

fs.writeFileSync(path, source);
console.log("Application assets workspace wired into Job Launch.");
