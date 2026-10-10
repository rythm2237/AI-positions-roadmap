import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import {planCV,fitCV,normalizeSection,sectionKind} from '../src/lib/applicationStudio/contentEngine.mjs';
import {structureSources,validateStructure} from '../src/lib/applicationStudio/structure.mjs';
import {renderPDF} from '../src/lib/applicationStudio/pdfRenderer.mjs';
import {FONTS} from '../src/lib/applicationStudio/design.mjs';
const sections=[{id:'h',title:'Header',text:'Taylor Example\ntaylor@example.invalid'},
 {id:'s',title:'Summary',text:'Summary Prepared operational reports and coordinated inventory planning.'},
 {id:'e',title:'Experience',text:'Operations Planner\nExample Co.\n2024 - Present\n• '+('Supported documented inventory decisions through accurate operational reporting '.repeat(12))},
 {id:'p',title:'Projects',text:'Reporting project\nDeveloped a documented inventory reporting dashboard.'},
 {id:'c',title:'Certifications',text:'Certifications\n'+Array.from({length:9},(_,i)=>'Certificate '+i+' | Example Provider | 2025').join('\n')},
 {id:'a',title:'Education',text:Array.from({length:8},(_,i)=>'Qualification '+i+' | Institute '+i+' | '+(2000+i)).join('\n')},
 {id:'x',title:'Volunteering',text:'Supported community learning sessions.'}];
const plan=planCV({sections,vacancy:'Required inventory analytics',template:'Harbor'});
assert(plan.sections.find(s=>s.title==='Selected Projects').headingLines.includes('Reporting project'));
for(const s of sections)assert(plan.sections.some(p=>sectionKind(p.title)===sectionKind(s.title)),'Lost section '+s.title);
for(let i=0;i<8;i++)assert(plan.sections.find(s=>s.title==='Education').text.includes('Qualification '+i));
for(let i=0;i<9;i++)assert(plan.sections.find(s=>s.title==='Certifications').text.includes('Certificate '+i));
assert.equal(normalizeSection(sections[1]).text,'Prepared operational reports and coordinated inventory planning.');
let measurements=0;await assert.rejects(fitCV({sections},async()=>{measurements++;return 4}),/No content was cut/);assert.equal(measurements,4);
const sources=structureSources('Taylor\nEducation\nBachelor | Example University | 2020');
const recovered=validateStructure({sections:[{title:'Header',items:[{kind:'heading',sourceIds:['L0']}]}]},sources);
assert(recovered.recovered);assert(recovered.sections.find(s=>s.title==='Education').text.includes('Bachelor | Example University | 2020'));
const structured=validateStructure({sections:[{title:'Header',items:[{kind:'heading',sourceIds:['L0']}]},{title:'Education',items:[{kind:'heading',sourceIds:['L1','L2']}]}]},sources);
assert.equal(structured.sections[1].text,'Bachelor | Example University | 2020');
assert.deepEqual(structured.sections[1].headingLines,['Bachelor | Example University | 2020']);
const fonts=async id=>{const f=FONTS.find(f=>f.id===id);return Promise.all(['.ttf','-Bold.ttf'].map(x=>fs.readFile('public/application-studio/fonts/'+f.file+x)))};
await fs.mkdir('tmp/cv-preservation',{recursive:true});
const pdf=await renderPDF({kind:'cv',sections:plan.sections,template:'Harbor'},fonts);
await fs.writeFile('tmp/cv-preservation/layout.pdf',new Uint8Array(await pdf.arrayBuffer()));
console.log('PASS: all source section kinds, 8 education records, 9 certificates, long experience evidence, unknown section, strict reconstruction coverage, no pressure trimming, and rendered sidebar PDF.');
