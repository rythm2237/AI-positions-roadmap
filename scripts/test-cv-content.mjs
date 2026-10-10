import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import {PDFDocument,PDFName} from 'pdf-lib';
import {FONTS,TEMPLATES} from '../src/lib/applicationStudio/design.mjs';
import {planCV,fitCV,parseProfile,nearDuplicate,isMetaContent,relevanceScore,validateCV,validateRewrites,wordCount} from '../src/lib/applicationStudio/contentEngine.mjs';
import {renderPDF} from '../src/lib/applicationStudio/pdfRenderer.mjs';
const out='tmp/cv-content-qa';await fs.mkdir(out,{recursive:true});
const cache=new Map();
const fonts=async id=>{if(!cache.has(id)){const f=FONTS.find(f=>f.id===id);cache.set(id,await Promise.all(['.ttf','-Bold.ttf'].map(x=>fs.readFile('public/application-studio/fonts/'+f.file+x))));}return cache.get(id);};
const role=(name,date,topic,n)=>`${name} — Example Company\n${date}\n`+Array.from({length:n},(_,i)=>`• ${['Developed','Coordinated','Implemented','Created','Delivered','Analysed'][i%6]} ${topic} ${i+1} using documented methods and practical team collaboration. Improved reporting visibility for colleagues.`).join('\n');
const broad=`Alex Synthetic\nBusiness Automation Specialist\nalex@example.test | +1 202 555 0111 | https://www.linkedin.com/in/alex-synthetic?tracking=fixture\nProfessional Summary\nBuilt business automation workflows and operational analytics for daily planning. Developed decision support tools and coordinated inventory operations with purchasing teams. ${'Created practical AI workflow projects using documented requirements and reviewed source data. '.repeat(8)}\nSkills\nAI automation; Workflow design; Power BI; Operational analytics; Inventory planning; Process improvement; SQL; Web development; Digital marketing; Advertising; Graphic design; IT support; Communication; Training; Stakeholder coordination; Content marketing\nExperience\n${role('AI Product Builder','2025 – Present','AI automation workflow and business analytics project',12)}\n${role('Fulfilment Planner','2022 – 2025','inventory planning and replenishment reporting',10)}\n${role('Marketing Specialist','2019 – 2022','digital marketing campaign',10)}\n${role('Web Developer','2016 – 2019','web development portfolio',10)}\n${role('Advertising Manager','2010 – 2016','advertising design project',10)}\n${role('IT Support Technician','2004 – 2010','IT support service',10)}\nProjects\nAutomation dashboard — Example project\nDeveloped an AI automation dashboard for business reporting and documented workflow requirements.\nInventory tool — Example project\nCreated an inventory planning tool with operational analytics and replenishment reports.\nEducation\nBachelor of Business Management\nExample University | 2004\nBachelor of Industrial Management\nExample Institute | 2008\nCertifications\nWorkflow Automation Certificate | Example Provider | 2025\nWeb Development Certificate | Example Provider | 2017\nLanguages\nEnglish | Fluent\nGerman | Intermediate`;
const vacancy='Business Automation Specialist. Required: AI automation, workflow design, business analytics and reporting. Preferred: operational process improvement and inventory planning.';
const original=parseProfile(broad),snapshot=JSON.stringify(original);
assert(nearDuplicate('Developed inventory reporting workflows for team coordination.','Developed reporting workflows for inventory team coordination.'));
assert(!nearDuplicate('Power BI','Built a Power BI warehouse reporting dashboard for stock planning.'));
assert(isMetaContent('No specific vocational training in production planning is indicated.'));
assert(isMetaContent('Page of'));
assert(!isMetaContent('Completed vocational training in production planning.'));
assert(relevanceScore('Built AI automation workflows and business reporting.',{vacancy,targetRole:'Business Automation Specialist'}).total>relevanceScore('Designed old advertising banners.',{vacancy,targetRole:'Business Automation Specialist'}).total);
const plan=planCV({sections:original,vacancy,targetRole:'Business Automation Specialist'});
assert.equal(JSON.stringify(original),snapshot);
assert(plan.sections.find(s=>s.title==='Professional Summary').text.split(/\s+/).length<=100);
assert(plan.sections.find(s=>s.title==='Core Skills').text.split('\n').length<=12);
assert(plan.sections.find(s=>s.title==='Additional Experience').text.includes('Advertising Manager'));
assert(plan.sections.find(s=>s.title==='Experience').text.includes('AI Product Builder'));
assert(plan.evidence.some(e=>!e.included));
assert(plan.evidence.filter(e=>e.included).every(e=>broad.replace(/\s+/g,' ').includes(e.text.replace(/\s+/g,' '))));
assert(validateCV(plan.sections).valid);
const e=plan.evidence.find(e=>e.included&&e.kind==='experience');
assert.equal(validateRewrites({rewrites:[{text:'Reduced costs by 80% using Kubernetes.',evidenceIds:[e.id]}]},plan).accepted.length,0);
assert.equal(validateRewrites({rewrites:[{text:'The candidate appears to be qualified.',evidenceIds:[e.id]}]},plan).accepted.length,0);
assert.equal(validateRewrites({rewrites:[{text:e.output,evidenceIds:[e.id]}]},plan).accepted.length,1);
assert.throws(()=>validateRewrites({garbage:true},plan));
const infected=parseProfile(broad+'\nNo specific vocational training in production planning is indicated.');
assert(!planCV({sections:infected,vacancy}).sections.some(s=>isMetaContent(s.text)));
const portrait='data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVQIHWP4z8DwHwAFgAI/ScLbtAAAAABJRU5ErkJggg==';
const cases={
 broad,
 experienced:`Sam Example\nsam@example.test\nSummary\nCoordinated operational planning and reliable inventory records.\nExperience\n${role('Operations Coordinator','2021 – Present','inventory reporting',10)}\nSkills\nExcel; Inventory planning\nEducation\nBA Business | Example University`,
 junior:'Lee Example\nlee@example.test\nSummary\nCompleted business studies and a documented reporting project.\nProjects\nReporting project — Example College\nDeveloped an Excel report for a coursework inventory exercise.\nEducation\nBA Business | Example College\nSkills\nExcel; Reporting',
 changer:broad.replace('Business Automation Specialist','Operations Coordinator'),
 manyProjects:broad+'\nProjects\n'+Array.from({length:30},(_,i)=>`Project ${i} — Example\nBuilt workflow automation project ${i} for operational reporting.`).join('\n'),
 noJD:broad,
 withJD:broad,
 photo:broad,
 linkedInLong:broad+'\nAbout me\n'+('Long background detail, career aspirations and personal story. '.repeat(600)),
 forbidden:broad+'\nCertifications\nNo specific vocational training in production planning is indicated.',
};
const beforePages=(await renderPDF({kind:'cv',template:'Professional',sections:original,measure:true},fonts)).pages;
assert(beforePages>2);await assert.rejects(renderPDF({kind:'cv',template:'Professional',sections:original},fonts),/two-page/);
const results=[];
for(const template of TEMPLATES){
 for(const [name,source] of Object.entries(cases)){
  const input={source,vacancy:name==='noJD'?'':vacancy,targetRole:'Business Automation Specialist',template:template.name,portrait:name==='photo'?portrait:null};
  const p=await fitCV(input,async sections=>(await renderPDF({kind:'cv',...input,sections,measure:true},fonts)).pages);
  assert(p.measuredPages<=2);assert.equal(p.cvGenerationVersion,2);
  const doc={kind:'cv',...input,sections:p.sections,cvGenerationVersion:2,maxPages:2};
  const bytes=new Uint8Array(await (await renderPDF(doc,fonts)).arrayBuffer());const pdf=await PDFDocument.load(bytes);
  assert(pdf.getPageCount()<=2);
  if(name==='broad'||name==='photo')await fs.writeFile(`${out}/${template.name}-${name}.pdf`,bytes);
  const annots=pdf.getPage(0).node.lookup(PDFName.of('Annots'));
  if(name==='broad')assert(annots?.size()>0,'Contact link annotations retained');
  results.push({template:template.name,case:name,pages:pdf.getPageCount(),words:p.wordCount,excluded:p.evidence.filter(e=>!e.included).length});
 }
}
assert(beforePages>=4,'Before fixture must reproduce a multi-page profile');
await fs.writeFile(out+'/report.json',JSON.stringify({beforePages,results},null,2));
console.log(`CV content PASS: ${Object.keys(cases).length} profiles × ${TEMPLATES.length} templates; before ${beforePages} pages, after 1–2; evidence provenance, source preservation, budgets, duplicate filter, forbidden comments, AI rejection and actual PDF page checks.`);
