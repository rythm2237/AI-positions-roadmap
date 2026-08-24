import fs from "node:fs";

const path = "src/components/career/CareerWorkspace.tsx";
let source = fs.readFileSync(path, "utf8");

function replaceOnce(label, before, after) {
  if (source.includes(after)) return;
  if (!source.includes(before)) {
    throw new Error(`zero-to-hired patch failed: ${label}`);
  }
  source = source.replace(before, after);
}

replaceOnce(
  "readiness panel import",
  'import CareerTitleAliasPanel from "@/components/career/CareerTitleAliasPanel";\n',
  'import CareerTitleAliasPanel from "@/components/career/CareerTitleAliasPanel";\nimport CareerReadinessPanel from "@/components/career/CareerReadinessPanel";\n'
);

replaceOnce(
  "hero progress prop",
  '              <HeroScene\n                key="hero"\n                stats={stats}\n',
  '              <HeroScene\n                key="hero"\n                stats={stats}\n                progress={progress}\n'
);

replaceOnce(
  "hero progress argument",
  'function HeroScene({\n  stats,\n  bookmarked,',
  'function HeroScene({\n  stats,\n  progress,\n  bookmarked,'
);

replaceOnce(
  "hero progress type",
  '  stats: ReturnType<typeof getCareerWorkspaceStats>;\n  bookmarked: boolean;',
  '  stats: ReturnType<typeof getCareerWorkspaceStats>;\n  progress: CareerWorkspaceProgress;\n  bookmarked: boolean;'
);

replaceOnce(
  "hero scroll container",
  '      className="relative h-full overflow-hidden px-4 py-5 pb-24 lg:px-8 lg:pb-5"',
  '      className="relative h-full overflow-y-auto px-4 py-5 pb-24 lg:px-8 lg:pb-5"'
);

replaceOnce(
  "hero scroll content sizing",
  '      <div className="relative z-10 mx-auto flex h-full max-w-7xl flex-col justify-center">',
  '      <div className="relative z-10 mx-auto flex min-h-full max-w-7xl flex-col justify-center">'
);

replaceOnce(
  "hero readiness panel",
  '          {hasProgress ? <div className="grid gap-4 sm:grid-cols-[1fr_auto_auto] sm:items-end">\n            <ProgressBar value={stats.overallProgress} label="Journey progress" />\n            <p className="text-sm text-slate-300"><strong className="text-white">{stats.completedProjects}</strong> projects completed</p>\n            <p className="text-sm text-slate-300"><strong className="text-white">{stats.notesCount}</strong> saved notes</p>\n          </div> : <p className="text-sm text-slate-400">No journey progress recorded yet. Start at the first station when you are ready.</p>}\n        </div>\n      </div>\n    </motion.section>',
  '          {hasProgress ? <div className="grid gap-4 sm:grid-cols-[1fr_auto_auto] sm:items-end">\n            <ProgressBar value={stats.overallProgress} label="Journey progress" />\n            <p className="text-sm text-slate-300"><strong className="text-white">{stats.completedProjects}</strong> projects completed</p>\n            <p className="text-sm text-slate-300"><strong className="text-white">{stats.notesCount}</strong> saved notes</p>\n          </div> : <p className="text-sm text-slate-400">No journey progress recorded yet. Start at the first station when you are ready.</p>}\n        </div>\n        <CareerReadinessPanel career={career} progress={progress} />\n      </div>\n    </motion.section>'
);

fs.writeFileSync(path, source);
console.log("Zero-to-hired phase one workspace patch applied.");
