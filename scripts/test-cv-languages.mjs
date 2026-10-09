import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import {renderPDF} from '../src/lib/applicationStudio/pdfRenderer.mjs';
import {FONTS,TEMPLATES,designFor} from '../src/lib/applicationStudio/design.mjs';
import {LANGUAGES,fontsForLanguage,validateTranslation} from '../src/lib/applicationStudio/languages.mjs';
import {translationContext} from '../src/lib/applicationStudio/translation.mjs';
import {parseProfile,planCV} from '../src/lib/applicationStudio/contentEngine.mjs';
assert(LANGUAGES.length>=11);assert(LANGUAGES.some(l=>l.id==='fa'));
for(const language of LANGUAGES)assert(fontsForLanguage(FONTS,language.id).length>=5);
const input=[{id:'h',title:'Header',text:'Taylor Example\ntaylor@example.invalid | https://example.invalid'},{id:'e',title:'Experience',text:'Prepared reports in 2025 with Power BI.'}];
const output={targetLanguage:'fa',sections:[{id:'h',displayTitle:'',text:input[0].text},{id:'e',displayTitle:'تجربه کاری',text:'تهیه گزارش در 2025 با Power BI.'}]};
const original=JSON.stringify(input);assert.equal(validateTranslation(output,input,'fa').sections[1].title,'Experience');assert.equal(JSON.stringify(input),original);
for(const change of [x=>x.sections.reverse(),x=>x.sections[1].text+=' 30%',x=>x.sections[0].text=x.sections[0].text.replace('taylor@','other@'),x=>x.targetLanguage='en']){const altered=structuredClone(output);change(altered);assert.throws(()=>validateTranslation(altered,input,'fa'));}
assert.throws(()=>translationContext({language:'zz',cv:input}));assert.deepEqual(Object.keys(translationContext({language:'fa',sourceLanguage:'en',cv:input,companyResearch:'private'})),['targetLanguage','targetLanguageName','sourceLanguage','sections']);
const fa=parseProfile('علی رضایی\nali@example.invalid\nتجربه کاری\nتهیه گزارش در سال 2025.\nمهارت‌ها\nتحلیل داده، Excel');assert.equal(fa[1].title,'Experience');assert.equal(fa[1].displayTitle,'تجربه کاری');const plan=planCV({sections:fa});assert(plan.sections.some(s=>s.displayTitle==='مهارت‌ها'));
const samples={fa:[{id:'h',title:'Header',text:'علی رضایی\nali@example.invalid | https://example.invalid | 2025'},{id:'e',title:'Experience',displayTitle:'تجربه کاری',text:'توسعه داشبورد Power BI برای برنامه‌ریزی موجودی در سال 2025.\nهماهنگی با تیم و بهبود کیفیت گزارش‌ها.'},{id:'s',title:'Skills',displayTitle:'مهارت‌ها',text:'تحلیل داده، برنامه‌ریزی، Excel'}],hi:[{id:'h',title:'Header',text:'राहुल शर्मा\nrahul@example.invalid | 2025'},{id:'e',title:'Experience',displayTitle:'कार्य अनुभव',text:'रिपोर्ट तैयार की और टीम के साथ समन्वय किया।\nPower BI के साथ डेटा विश्लेषण किया।'},{id:'s',title:'Skills',displayTitle:'कौशल',text:'डेटा विश्लेषण, Excel'}],ru:[{id:'h',title:'Header',text:'Анна Иванова\nanna@example.invalid | 2025'},{id:'e',title:'Experience',displayTitle:'Опыт работы',text:'Анализ данных и подготовка отчетов.'}]};
const loadFonts=async id=>{const f=FONTS.find(f=>f.id===id);return Promise.all(['','-Bold'].map(s=>fs.readFile('public/application-studio/fonts/'+f.file+s+'.ttf')));};
let count=0;await fs.mkdir('tmp/language-tests',{recursive:true});
for(const lang of ['fa','hi','ru'])for(const f of fontsForLanguage(FONTS,lang)){const doc={kind:'cv',template:'Modern',language:lang,design:{language:lang,font:f.id},sections:samples[lang]};assert.equal((await renderPDF({...doc,measure:true},loadFonts)).pages,1);const blob=await renderPDF(doc,loadFonts);await fs.writeFile(`tmp/language-tests/${lang}-${f.id}.pdf`,Buffer.from(await blob.arrayBuffer()));count++;}
for(const t of TEMPLATES){const d=designFor(t.name,{language:'fa'});assert.equal(d.direction,'rtl');if(t.layout==='sidebar-left')assert.equal(d.layout,'sidebar-right');assert.equal((await renderPDF({kind:'cv',template:t.name,language:'fa',sections:samples.fa,measure:true},loadFonts)).pages,1);count++;}
for(const lang of LANGUAGES.filter(l=>l.script==='latin'))assert.equal((await renderPDF({kind:'cv',language:lang.id,sections:input,measure:true},loadFonts)).pages,1);
console.log(`Languages PASS: ${LANGUAGES.length} languages; 5 fonts/script; ${count} complex-script/template combinations; faithful translation validation, contact/number protection, canonical localized sections and actual A4 PDF pagination.`);
