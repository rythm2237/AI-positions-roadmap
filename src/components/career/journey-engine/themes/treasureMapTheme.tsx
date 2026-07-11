import React from "react";
import type { CareerJourneyStage, CareerJourneyTerrainType } from "@/types/careerWorkspace";
import type { JourneyThemeDefinition } from "../types";

export const treasureMapTheme: JourneyThemeDefinition = {
  id: "treasure-map",
  name: "Hand-drawn career map",
  layers: ["background", "terrain", "road", "landmark", "station", "overlay"],
  defaultTerrainByStage: {
    orientation: ["symbol"], foundation: ["forest"], "core-skills": ["mountain"], tools: ["village"],
    projects: ["port"], portfolio: ["ruins"], resume: ["bridge"], profile: ["symbol"],
    "job-search": ["village"], jobs: ["symbol"], interview: ["bridge"], assessment: ["mountain"], ready: ["symbol"],
  },
};

export function terrainForStage(stage: CareerJourneyStage): CareerJourneyTerrainType[] {
  return stage.terrain?.length ? stage.terrain : treasureMapTheme.defaultTerrainByStage[stage.type] ?? ["symbol"];
}

type SketchProps = { stage: CareerJourneyStage; active: boolean; technologyLevel?: number };

export function LandmarkSymbol({ stage, active, technologyLevel = 0 }: SketchProps) {
  const progress = Math.max(0, Math.min(1, technologyLevel));
  const ink = progress > .66 ? "#455f68" : progress > .35 ? "#56646a" : "#625f58";
  const accent = progress > .72 ? "#6398a3" : progress > .38 ? "#748890" : "#777269";
  const common = { stroke: ink, strokeWidth: active ? 2.3 : 1.8, strokeLinecap: "round" as const, strokeLinejoin: "round" as const };
  const type = stage.type;

  return (
    <svg viewBox="0 0 150 112" className="h-[5.75rem] w-[7.5rem] overflow-visible" fill="none" aria-hidden="true">
      <path d="M12 99c34-4 88 5 128-2" stroke="#8b867d" strokeWidth="1.2" strokeDasharray="2 4"/>
      {type === "orientation" ? <g {...common}><path d="M48 96V28m0 9h50l-10 11 10 11H48M48 65H18l9 10-9 10h30"/><path d="M67 96V70h42v26M73 70l15-15 15 15"/></g> : null}
      {type === "foundation" ? <g {...common}><path d="M52 96V65h53v31M44 67l34-25 35 25M77 96V77h15v19"/><path d="M21 96V62m-13 7 13-31 14 31m-21 5h14"/></g> : null}
      {type === "core-skills" || type === "assessment" ? <g {...common}><path d="m9 97 38-65 25 39 17-29 52 55"/><path d="M47 32v-18h28l-8 7 8 7H47"/><path d="m31 59 16-27 11 17" stroke="#aaa49a"/></g> : null}
      {type === "tools" ? <g {...common}><path d="M26 96V41h96v55M20 42l18-17 13 14 20-18 15 18 18-15 24 18M43 96V69h25v27M88 59h20v18H88"/><path d="m73 47 8-8m-4 12 10-10" stroke={accent}/></g> : null}
      {type === "projects" ? <g {...common}><path d="M11 94h130M27 94V54h92v40M18 55h110M37 54V34m70 20V25M107 25l22 12-22 10M50 94V69h25v25"/><path d="M18 103c21-9 35 8 54 0s34 8 55 0" stroke={accent}/></g> : null}
      {type === "portfolio" ? <g {...common}><path d="M20 91V38h48c9 0 14 5 14 12v47c0-7-5-12-14-12H20Zm62 6V50c0-7 5-12 14-12h35v53H96c-9 0-14 3-14 6Z"/><path d="M31 53h25m-25 11h28m38-11h23m-23 11h23" stroke="#918c83"/></g> : null}
      {type === "resume" || type === "profile" ? <g {...common}><path d="M18 96V57h18V38h21v19h37V37h22v20h17v39M8 96h134M46 96V72h56v24"/><path d="M62 54c8-12 18-12 26 0" stroke={accent}/></g> : null}
      {type === "job-search" || type === "jobs" ? <g {...common}><path d="M19 96V31h112v65M34 48h36v20H34m51-20h30M85 60h30M34 79h81"/><circle cx="124" cy="26" r="9"/><path d="m131 33 10 10"/></g> : null}
      {type === "interview" ? <g {...common}><path d="M14 96h124M24 96V56h20V36h20v20h24V36h20v20h20v40M45 96V72h62v24"/><path d="M64 36c5-12 18-12 24 0" stroke={accent}/></g> : null}
      {type === "ready" ? <g {...common}><path d="M40 97 58 68h10V31h14V12h14v19h12v37h10l17 29M75 97V62h27v35"/><path d="M89 9v-7m-9 10-5-6m24 6 6-6" stroke={accent}/><g stroke={accent} strokeWidth="1.2"><circle cx="33" cy="52" r="3"/><circle cx="125" cy="41" r="3"/><path d="M36 52h18m54-11h14M33 49V35m92 3V23"/></g></g> : null}
      {progress > .4 ? <g stroke={accent} strokeWidth="1" opacity={.35 + progress * .35}><path d="M6 18h24m-12-9v18M122 17h21M132 7v20"/>{progress > .68 ? <><circle cx="14" cy="34" r="3"/><circle cx="136" cy="55" r="3"/><path d="m17 34 18 9m98 12-18 9"/></> : null}</g> : null}
      {active ? <path d="M20 104c28 6 76 5 112-1" stroke={accent} strokeWidth="2.4" strokeLinecap="round" className="journey-pencil-underline"/> : null}
    </svg>
  );
}

export function TreasureTerrainFeature({ stage, technologyLevel = 0 }: { stage: CareerJourneyStage; technologyLevel?: number }) {
  const progress = Math.max(0, Math.min(1, technologyLevel));
  return (
    <svg className="pointer-events-none absolute h-40 w-52 overflow-visible max-sm:opacity-50" style={{ left: stage.x - 104, top: stage.y - 60 }} viewBox="0 0 208 160" fill="none" aria-hidden="true">
      {progress < .35 ? <><path d="M4 130c40-34 77 20 122-8s64 1 84-12" stroke="#aaa49a" strokeWidth="1" strokeDasharray="4 8"/><path d="M18 51c24-16 46-13 65 4" stroke="#b6b0a6" strokeWidth="1"/></> : null}
      {progress >= .35 && progress < .7 ? <g stroke="#8d9697" strokeWidth="1" opacity=".55"><path d="M12 18h55M12 27h36M147 120h48M176 94v42"/><path d="m164 25 25 14-25 14Z"/></g> : null}
      {progress >= .7 ? <g stroke="#6f9aa2" strokeWidth="1" opacity=".58"><path d="M10 35h34l18 18h32m45-24h48M154 16v26"/><circle cx="10" cy="35" r="3"/><circle cx="94" cy="53" r="3"/><circle cx="139" cy="29" r="3"/><circle cx="187" cy="29" r="3"/><path d="M35 118h28l14-14h39l18 18h56" strokeDasharray="3 4"/></g> : null}
    </svg>
  );
}

export function InfiniteLeatherBackground() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden bg-[#a9825f]" aria-hidden="true">
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: [
            "radial-gradient(ellipse at 18% 24%, rgba(240,219,184,.17) 0, transparent 38%)",
            "radial-gradient(ellipse at 78% 72%, rgba(73,47,30,.16) 0, transparent 44%)",
            "linear-gradient(118deg, rgba(244,226,195,.10), transparent 31%, rgba(74,48,31,.09) 67%, rgba(231,207,169,.08))",
          ].join(","),
        }}
      />
      <div
        className="absolute inset-0 opacity-[.22] mix-blend-multiply"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 192 192' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='leather'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.075 .32' numOctaves='3' seed='17' stitchTiles='stitch' result='n'/%3E%3CfeColorMatrix in='n' type='saturate' values='0'/%3E%3C/filter%3E%3Crect width='192' height='192' filter='url(%23leather)' opacity='.38'/%3E%3C/svg%3E")`,
          backgroundRepeat: "repeat",
          backgroundSize: "192px 192px",
        }}
      />
      <div
        className="absolute inset-0 opacity-[.16]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 317 271' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' stroke='%236b4026' stroke-linecap='round'%3E%3Cpath d='M-18 74C58 48 91 102 164 76S279 49 335 83' opacity='.24'/%3E%3Cpath d='M42 215c48-25 82 17 132-9s87-8 154-31' opacity='.16'/%3E%3Cpath d='M113-12c-7 48 19 69 6 119s5 91-8 176' opacity='.12'/%3E%3Cpath d='m251 29 22-8m-31 181 17 5M67 149l12-4' opacity='.28'/%3E%3C/g%3E%3C/svg%3E")`,
          backgroundRepeat: "repeat",
          backgroundSize: "317px 271px",
        }}
      />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_52%,rgba(77,42,20,.16)_100%)]" />
    </div>
  );
}

export function TreasureMapSurface({ width, height, children }: { width: number; height: number; children: React.ReactNode }) {
  return (
    <div className="absolute inset-0 overflow-visible">
      <svg className="absolute inset-0 h-full w-full" viewBox={`0 0 ${width} ${height}`} fill="none" aria-hidden="true">
        <path d={`M${width*.27} -40C${width*.3} ${height*.22} ${width*.18} ${height*.42} ${width*.24} ${height+30}`} stroke="rgba(104,61,31,.18)" strokeWidth="3"/>
        <path d={`M-30 ${height*.62}C${width*.2} ${height*.58} ${width*.5} ${height*.7} ${width+30} ${height*.57}`} stroke="rgba(104,61,31,.15)" strokeWidth="4"/>
        <path d={`M${width*.72} -30C${width*.67} ${height*.25} ${width*.8} ${height*.52} ${width*.74} ${height+30}`} stroke="rgba(255,232,190,.22)" strokeWidth="5"/>
        <g opacity=".3" stroke="#74492d" strokeWidth="1"><path d={`M${width*.61} ${height*.62}h210l40 42h180`}/><path d={`M${width*.74} ${height*.77}h230`} strokeDasharray="4 7"/>{[0,1,2,3].map(i=><circle key={i} cx={width*.72+i*70} cy={height*.84+(i%2)*20} r="5"/>)}</g>
        <g opacity=".22" stroke="#68432b"><path d="M85 120h170M85 132h110"/><path d={`M${width-330} 115h220M${width-330} 127h140`}/></g>
      </svg>
      {children}
    </div>
  );
}
