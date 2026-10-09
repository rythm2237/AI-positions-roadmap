import {canonicalHeading} from './languages.mjs';
import { designFor } from './design.mjs';

// A selective, reversible view over user sources. Never mutates the source profile.
export const GENERATION_VERSION = 2;
const WORDS = /[\p{L}\p{N}][\p{L}\p{N}+.#'/-]*/gu;
export const wordCount = text => (String(text || '').match(WORDS) || []).length;
const stop = new Set('specialist professional senior junior required preferred essential mandatory minimum role responsibilities experience years the a an and or of to in on for with from by as is are was were this that i my have has had at be been using used'.split(' '));
const norm = text => String(text).toLowerCase().normalize('NFKC').replace(/[^\p{L}\p{N}+#.]+/gu, ' ').trim();
const tokens = text => new Set((norm(text).match(WORDS) || []).filter(x => x.length > 2 && !stop.has(x)));
const copy = value => JSON.parse(JSON.stringify(value));
export function isMetaContent(text) {
  return /(?:the (?:candidate|applicant) (?:appears|may|seems)|no (?:specific .{0,60}?|supporting )?(?:evidence|training|qualification|certification|vocational training).{0,70}?(?:found|indicated|provided|available)|based on (?:the |your )?(?:provided |supplied )?(?:cv|resume)|it is recommended|missing information|this suggests|match score|chain.of.thought|^\s*page\s*(?:\d+\s*)?of\s*\d*\s*$)/i.test(String(text));
}
export function nearDuplicate(a, b) {
  const x = tokens(a), y = tokens(b);
  if (!x.size || !y.size) return norm(a) === norm(b);
  let intersection = 0; for (const t of x) if (y.has(t)) intersection++;
  return intersection / Math.min(x.size, y.size) >= .88 && Math.min(x.size, y.size) / Math.max(x.size, y.size) >= .65;
}
const kinds = [
  ['summary', /^(professional summary|summary|profile|profil|about(?: me)?|personal statement)$/i],
  ['experience', /^(work experience|professional experience|employment(?: history)?|career history|experience|berufserfahrung|expérience(?: professionnelle)?)$/i],
  ['skills', /^(core skills|skills|technical skills|top skills|competencies|kenntnisse|compétences)$/i],
  ['projects', /^(selected projects|key projects|projects|portfolio|achievements|key achievements)$/i],
  ['education', /^(education|academic background|ausbildung|formation)$/i],
  ['certifications', /^(certifications|certificates|training(?: and courses)?|courses)$/i],
  ['development', /^professional development$/i],
  ['languages', /^(languages|language skills|sprachen|langues)$/i],
  ['additional', /^(additional experience|earlier experience)$/i],
];
export const sectionKind = title => title === 'Header' ? 'header' : kinds.find(([, re]) => re.test(canonicalHeading(title)))?.[0] || 'other';
export function parseProfile(text) {
  const sections = []; let current = { id: 'source-0', title: 'Header', text: '' };
  for (const raw of String(text || '').replace(/\r/g, '').split('\n')) {
    const line = raw.trim();
    if (sectionKind(line) !== 'other' && line !== 'Header' && !/^\s*[•*-]/.test(raw)) {
      if (current.text.trim()) sections.push(current);
      current = { id: `source-${sections.length}`, title: canonicalHeading(line), displayTitle: canonicalHeading(line)!==line.replace(/:$/, '')?line.replace(/:$/, ''):undefined, text: '' };
    } else current.text += (current.text ? '\n' : '') + raw;
  }
  if (current.text.trim()) sections.push(current);
  return sections.map(normalizeSection);
}

// Extraction wraps are not semantic bullets. Preserve records, rejoin prose only.
export function normalizeSection(section){
 if(section.inlineStyles?.text?.length)return {...section};
 const kind=sectionKind(section.title),lines=section.text.split('\n'),out=[];
 const heading=String(section.displayTitle||section.title).replace(/:$/, '').trim();
 if(lines.length){const first=lines[0].replace(/^\s*[•*-]\s*/, '').trim();
  if(first.toLowerCase()===heading.toLowerCase()||sectionKind(first)===kind&&kind!=='other')lines.shift();
  else if(first.toLowerCase().startsWith(heading.toLowerCase()+' '))lines[0]=first.slice(heading.length).trim();
 }
 for(const raw of lines){
  const line=raw.trim();
  if(!line){if(out.at(-1)!=='')out.push('');continue;}
  if(/^page\s*(?:\d+\s*)?(?:of\s*\d*)?$/i.test(line))continue;
  const prev=out.at(-1)||'';
  const continuation=prev&&!/[.!?]$/.test(prev)&&!/^\s*[•*-]/.test(line)&&!/^\s*\d/.test(line)&&(
   kind==='summary'||kind==='education'&&(/^(?:degree|diploma|bachelor|master)\b/i.test(line)&&!/\b(?:degree|diploma|bachelor|master|19\d{2}|20\d{2})\b/i.test(prev)||/[,(–-]$/.test(prev)||prev.split('(').length>prev.split(')').length)||kind==='certifications'&&(/(?:\b(?:for|of|the|and)|[/-])$/i.test(prev)||/^(?:Level|Business competence)\b/.test(line))||kind==='experience'&&(/^(?:[a-z]|and |or |with |to |for |in )/.test(line)||/\b(?:and|or|with|to|for|in|that|the|of|a)$/i.test(prev)));
  if(continuation)out[out.length-1]=prev+' '+line;else out.push(line);
 }
 return {...section,text:out.join('\n')};
}

export function jobRequirements(vacancy = '', targetRole = '') {
  return String(vacancy).split(/\n|(?<=[.!?;])\s+/).map(x => x.trim()).filter(Boolean).slice(0, 150).map((text, i) => ({
    id: `requirement-${i}`, text,
    priority: /must|required|essential|minimum|mandatory/i.test(text) ? 'must' : /prefer|desirab|advantage/i.test(text) ? 'high' : 'medium',
    category: /certif|degree|diploma|licen[cs]/i.test(text) ? 'qualification' : /language|fluent|english|german|french/i.test(text) ? 'language' : /lead|manage.*team/i.test(text) ? 'leadership' : /location|relocat|visa|permit/i.test(text) ? 'location' : /\b(?:tools?|technolog|software|platform|sql|python|power bi|sap)\b/i.test(text) ? 'tools' : /years|senior|junior/i.test(text) ? 'seniority' : 'responsibility',
    targetRole,
  }));
}

export function relevanceScore(text, { vacancy = '', targetRole = '', year = new Date().getUTCFullYear() } = {}) {
  const t = tokens(text), target = tokens(targetRole), requirements = jobRequirements(vacancy, targetRole);
  const overlap = set => [...set].filter(x => t.has(x)).length;
  const job = target.size ? Math.min(30, 30 * overlap(target) / target.size) : 12;
  const all = tokens(vacancy), hits = overlap(all);
  const skill = vacancy ? Math.min(20, hits * 3) : 8;
    const phrases=String(vacancy).toLowerCase().split(/[,:;.\n]/).flatMap(x=>x.split(/\band\b/)).map(x=>[...tokens(x)].join(' ')).filter(x=>x.split(' ').length>=2&&x.split(' ').length<=5);
  const conceptGroups=[['analytics','analysis','reporting','power bi','sql','excel'],['automation','automated','workflow','power automate','n8n'],['inventory','replenishment','stock planning','fulfilment']];
  const concepts=conceptGroups.filter(g=>g.some(term=>norm(vacancy).includes(term))&&g.some(term=>norm(text).includes(term))).length;
  const domain = vacancy ? Math.min(15, phrases.filter(p=>norm(text).includes(p)).length*5+concepts*10) : 6;
  const evidence = /\b(built|developed|led|implemented|delivered|coordinated|analysed|analyzed|created|automated|designed|managed)\b/i.test(text) ? 15 : 6;
  const dates = String(text).match(/\b(?:19|20)\d{2}\b/g)?.map(Number) || [];
  const age = dates.length ? Math.max(0, year - Math.max(...dates)) : null;
  const recency = /present|current|ongoing/i.test(text) ? 10 : age === null ? 5 : age <= 5 ? 10 : age <= 10 ? 6 : 2;
  const impact = /\d+(?:\.\d+)?\s*%|\b(reduced|improved|saving|saved|increased|result|visibility|accuracy|efficien|availability)\b/i.test(text) ? 10 : 3;
  const dimensions = { job: Math.round(job), skill, domain, evidence, recency, impact };
  return { total: Object.values(dimensions).reduce((a, b) => a + b, 0), dimensions };
}

const bullet = /^\s*(?:[•●▪*-]|\d+[.)])\s+/;
const dates = /\b(?:19|20)\d{2}\b/;
function records(section) {
  const lines = section.text.split('\n').map(x => x.trim()).filter(Boolean);
  const blocks = []; let block = null;
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i], next = lines[i + 1] || '';
    const heading = !bullet.test(line) && (section.headingLines?.includes(line)||sectionKind(section.title)==='projects'&&wordCount(line)<8&&next&&wordCount(next)>5||dates.test(line) || dates.test(next) || dates.test(lines[i+2]||'')&&wordCount(line)<8&&wordCount(next)<8&&!bullet.test(next) || /\s[—|–]\s|\s·\s/.test(line) || block?.items.length && bullet.test(next) && wordCount(line)<8) && wordCount(line) < 28;
    if(heading&&block&&!block.items.length&&!block.heading.some(t=>dates.test(t))){block.heading.push(line);continue;}
    if (heading && !(dates.test(line) && block && !block.items.length && block.heading.length < 3)) {
      if (block) blocks.push(block);
      block = { heading: [line], items: [] };
    } else if (block && !bullet.test(line) && !block.items.length && (dates.test(line) || wordCount(line) < 7 && i + 1 < lines.length && bullet.test(next))) block.heading.push(line);
    else { if (!block) block = { heading: [], items: [] }; block.items.push(line.replace(bullet, '')); }
  }
  if (block) blocks.push(block);
  return blocks;
}
function sentences(text) { return String(text).split(/(?<=[.!?])\s+(?=[\p{Lu}\d])/u).map(x => x.trim()).filter(Boolean); }
function concise(text, max) {
  if (wordCount(text) <= max) return text;
  const parts = sentences(text); let result = '';
  for (const s of parts) if (wordCount(result + ' ' + s) <= max) result += (result ? ' ' : '') + s;
  // No mid-sentence cuts or inferred outcomes. Oversized facts stay available in the exclusion ledger.
  return result || null;
}
export function capacityProfile(template, custom, portrait) {
  const d = designFor(template, custom), side = d.layout !== 'single';
  const available = (595 - 2 * d.margin) / 511 * (10 / d.size);
  return { preferredPages: 2, summaryWords: side ? 65 : 90, skillCount: side ? 10 : 12, projectCount: 2, wordBudget: Math.floor((side ? 650 : 820) * available - (portrait ? 35 : 0)), sidebarWords: Math.floor(155 * available), experienceBullets: [6, 4, 2] };
}

export function planCV(input, { pressure = 0 } = {}) {
  const source = copy(input.sections?.length ? input.sections : parseProfile(input.source || '')).map(normalizeSection);
  if (!source.length) throw Error('Confirm a source CV before optimising.');
  const ctx = { vacancy: input.vacancy || '', targetRole: input.targetRole || '', year: input.year || new Date().getUTCFullYear() };
  const capacity = capacityProfile(input.template, input.design, input.portrait);
  const budget = Math.max(230, capacity.wordBudget - pressure * 85);
  const ledger = [], selected = [], seen = [];
  let seq = 0;
  function item(text, kind, origin, sectionTitle, roleHeading = '') {
    const id = `evidence-${seq++}`;
    const e = { id, text, kind, sectionId: origin, sectionTitle, roleHeading, ...relevanceScore(roleHeading + ' ' + text, ctx), included: false, reason: '' };
    ledger.push(e); return e;
  }
  function take(e, reason, maxWords = Infinity) {
    if (isMetaContent(e.text)) { e.reason = 'Analysis or document artifact; excluded from CV'; return null; }
    if (ledger.some(s => s!==e&&s.included&&s.sectionId===e.sectionId&&nearDuplicate(s.text, e.text))) { e.reason = 'Repeated evidence within this section'; return null; }
    const text = concise(e.text, maxWords)||e.text;
    e.included = true; e.reason = reason; e.output = text; seen.push(text); return text;
  }
  function add(title, lines, ids = []) {
    const text = lines.filter(Boolean).join('\n'); if (text.trim()) selected.push({ id: `cv2-${selected.length}`, title, displayTitle:source.find(s=>sectionKind(s.title)===sectionKind(title))?.displayTitle, text, evidenceIds: ids });
  }
  const header = source.find(s => sectionKind(s.title) === 'header');
  if (header) add('Header', header.text.split('\n').filter(x => !isMetaContent(x)&&!/^Contact$|^\(LinkedIn\)$/i.test(x.trim())));
  const summary = source.filter(s => sectionKind(s.title) === 'summary').flatMap(s => sentences(s.text.replace(/\n/g, ' ')).map(t => item(t, 'summary', s.id, s.title)));
  let summaryWords = 0; const summaryText = [], summaryIds = [];
  for (const e of summary.sort((a, b) => b.total - a.total)) {
    if (summaryWords + wordCount(e.text) > capacity.summaryWords) { e.reason = 'Summary word budget'; continue; }
    const t = take(e, 'Concise source summary'); if (t) { summaryText.push(t); summaryIds.push(e.id); summaryWords += wordCount(t); }
  }
  add('Professional Summary', [summaryText.join(' ')], summaryIds);
  const skills = source.filter(s => sectionKind(s.title) === 'skills').flatMap(s => s.text.split(/\n|;|,(?![^()]*\))/).map(t => t.replace(bullet, '').trim()).filter(Boolean).map(t => item(t, 'skill', s.id, s.title)));
  const skillText = [], skillIds = [];
  for (const e of skills.sort((a, b) => b.total - a.total)) {
    if(ctx.vacancy&&e.total<24){e.reason='Low target relevance; skill remains in profile';continue;}
    if (skillText.length >= Math.max(6, capacity.skillCount - pressure)) { e.reason = 'Core skills budget'; continue; }
    const t = take(e, 'Relevant source skill', 8); if (t) { skillText.push(t); skillIds.push(e.id); }
  }
  add('Core Skills', skillText, skillIds);
  const roles = source.filter(s => sectionKind(s.title) === 'experience').flatMap(s => records(s).map(r => ({ ...r, section: s, score: relevanceScore(r.heading.join(' ') + ' ' + r.items.join(' '), ctx).total })));
  const recency=r=>/present|current|ongoing/i.test(r.heading.join(' '))?9999:Math.max(0,...(r.heading.join(' ').match(/\b(?:19|20)\d{2}\b/g)||[]).map(Number));
  roles.sort((a,b)=>recency(b)-recency(a)||b.score-a.score);
  const experience = [], experienceIds = [], additional = [], additionalIds = [];
  for (let n = 0; n < roles.length; n++) {
    const r = roles[n], heading = r.heading.filter(t => !isMetaContent(t)).join('\n');
    const dated = heading.match(/\b(?:19|20)\d{2}\b/g)?.map(Number) || [];
    const age = dated.length && !/present|current/i.test(heading) ? ctx.year - Math.max(...dated) : 0;
    const low = n >= Math.max(2, 3 - pressure) || (ctx.vacancy && r.score < 35 && n > 0) || (age>10&&r.score<75&&n>0);
    const entries = r.items.map(t => item(t, 'experience', r.section.id, r.section.title, heading)).sort((a, b) => b.total - a.total);
    const limit = low ? 0 : Math.max(1, (age > 10 && r.score < 80 ? 1 : capacity.experienceBullets[Math.min(n, 2)]) - pressure);
    let count = 0; const lines = [];
    for (const e of entries) {
      if (count >= limit) { e.reason = low ? 'Lower relevance; role retained briefly' : 'Role bullet budget'; continue; }
      const t = take(e, 'Role relevance and evidence strength', 32); if (t) { lines.push('• ' + t); count++; experienceIds.push(e.id); }
    }
    if (heading && low) { additional.push(heading.replace(/\n/g, ' | ')); additionalIds.push(...entries.filter(e=>e.included).map(e => e.id)); }
    else if (heading || lines.length) experience.push([heading, ...lines].filter(Boolean).join('\n'));
  }
  add('Experience', [experience.join('\n\n')], experienceIds);
  const experienceSection=selected.find(s=>s.title==='Experience');
  if(experienceSection)experienceSection.headingLines=roles.flatMap(r=>r.heading);
  const projects = source.filter(s => sectionKind(s.title) === 'projects').flatMap(s => records(s).map(r => ({...r, section: s, score: relevanceScore(r.heading.join(' ') + ' ' + r.items.join(' '), ctx).total })));
  const projectText = [], projectIds = [];
  for (const r of projects.sort((a, b) => b.score - a.score)) {
    const text = [...r.heading, ...r.items].join('\n'), e = item(text, 'project', r.section.id, r.section.title);
    if (projectText.length >= Math.max(0, capacity.projectCount - pressure)) { e.reason = 'Selected project budget'; continue; }
    if (ctx.vacancy && e.total < 40) { e.reason = 'Low relevance to target'; continue; }
    const t = take(e, 'Relevant selected project'); if (t) { projectText.push(t); projectIds.push(e.id); }
  }
  add('Selected Projects', projectText, projectIds);
  const projectSection=selected.find(s=>s.title==='Selected Projects');
  if(projectSection)projectSection.headingLines=projects.flatMap(r=>r.heading);
  for (const [kind, title] of [['education','Education'],['certifications','Certifications'],['languages','Languages'],['additional','Additional Experience']]) {
    const entries = source.filter(s => sectionKind(s.title) === kind).flatMap(s => s.text.split('\n').map(t => t.trim()).filter(Boolean).map(t => item(t.replace(bullet,''),kind,s.id,s.title)));
    const lines = [], ids = [];
    for (const e of (kind==='education'||kind==='languages'?entries:entries.sort((a,b)=>b.total-a.total))) {
      // Credentials, institutions, dates and languages are facts, not a line budget.
      if(isMetaContent(e.text)){e.reason='Document artifact';continue;}
      e.included=true;e.output=e.text;e.reason='Protected qualification or history';lines.push(e.text);ids.push(e.id);
    }
    if (kind === 'additional') add(title,[...additional,...lines], [...additionalIds,...ids]); else add(title,kind==='certifications'?lines.map(t=>'• '+t):lines,ids);
  }
  for(const s of source.filter(s=>sectionKind(s.title)==='development'))selected.push({...s,id:s.id||'development',text:s.text});
  // Unknown sections and sections with no safely concise result stay visible for review.
  // A layout constraint must never be used as permission to remove a source section.
  for(const s of source){
    const kind=sectionKind(s.title);
    if(kind==='other'||!selected.some(p=>sectionKind(p.title)===kind)){
      const text=s.text.split('\n').filter(t=>!isMetaContent(t)).join('\n').trim();
      if(text)selected.push({...s,text,evidenceIds:[]});
    }
  }
  const count = () => wordCount(selected.map(s=>s.text).join(' '));
  const sections = selected.filter(s=>s.text.trim());
  if(designFor(input.template,input.design).layout==='single'){const skillsSection=sections.find(s=>s.title==='Core Skills');if(skillsSection)skillsSection.text=skillsSection.text.split('\n').join('; ');}
  return { cvGenerationVersion: GENERATION_VERSION, createdAt: new Date().toISOString(), targetRole: ctx.targetRole, vacancy: ctx.vacancy, mode: ctx.vacancy ? 'targeted' : 'general', sourceSections: source, sections, evidence: ledger, requirements: jobRequirements(ctx.vacancy,ctx.targetRole), capacity, pressure, wordCount: count(), estimatedPages: Math.max(1,Math.ceil(count()/Math.max(220,capacity.wordBudget/2))), warnings: roles.some(r=>!r.heading.length)?['Some employment headings could not be identified. Review role titles and dates.']:[], approved: false };
}

export function validateCV(sections, { maxSummary = 100 } = {}) {
  const issues = [], summaries=sections.filter(s=>sectionKind(s.title)==='summary');
  if (summaries.some(s=>wordCount(s.text)>maxSummary)) issues.push('Summary exceeds 100 words');
  const lines = sections.flatMap(s=>s.text.split('\n')).filter(Boolean);
  if (lines.some(isMetaContent)) issues.push('Analysis or document artifacts must be removed');
  if (sections.filter(s=>sectionKind(s.title)==='skills').some(s=>s.text.split(/\n|;/).filter(Boolean).length>15)) issues.push('Too many core skills');
  return { valid: !issues.length, issues, wordCount: wordCount(lines.join(' ')) };
}

// Fail closed for AI rewrites: source IDs alone do not establish factual support.
// Conservative lexical verification intentionally rejects unverifiable paraphrases.
const rewriteStop = new Set([...stop, ...'professional experience supporting brings bringing through while into across relevant work role'.split(' ')]);
export function validateRewrites(value, plan) {
  if (!value || !Array.isArray(value.rewrites) || value.rewrites.length > 50) throw Error('Invalid CV rewrite response');
  const accepted=[], rejected=[];
  for (const r of value.rewrites) {
    const facts=Array.isArray(r.evidenceIds)?r.evidenceIds.map(id=>plan.evidence.find(e=>e.id===id&&e.included)):[];
    const text=typeof r.text==='string'?r.text.trim():'';
    const fact=facts[0];
    const source=facts.filter(Boolean).map(e=>e.text).join(' '), sourceTokens=tokens(source);
    const unsupported=[...tokens(text)].filter(t=>!sourceTokens.has(t)&&!rewriteStop.has(t));
    const numbers=text.match(/\d+(?:[.,]\d+)?/g)||[];
    if(!fact||facts.some(e=>!e)||r.evidenceIds.length!==1||!text||isMetaContent(text)||wordCount(text)>32||unsupported.length||numbers.some(n=>!source.includes(n))) {rejected.push(r);continue;}
    accepted.push({evidenceId:fact.id,original:fact.output,text});
  }
  return {accepted,rejected};
}

export async function fitCV(input, measure) {
  const plan=planCV(input),pages=await measure(plan.sections);
  if(pages<=2)return {...plan,measuredPages:pages};
  throw Error(`The section-preserving draft needs ${pages} pages. No content was cut to meet the page limit. Choose an extended CV or review individual section wording and layout; your current CV remains unchanged.`);
}

export function approximatePages(sections, template, design, portrait) {
  const c=capacityProfile(template,design,portrait);
  return Math.max(1, Math.ceil(wordCount(sections.map(s=>s.text).join(' '))/(c.wordBudget/2)));
}
