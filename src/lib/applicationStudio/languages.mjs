export const LANGUAGES = [
 {id:'en',name:'English',label:'English',script:'latin'},
 {id:'es',name:'Spanish',label:'Español · Spanish',script:'latin'},
 {id:'fr',name:'French',label:'Français · French',script:'latin'},
 {id:'pt',name:'Portuguese',label:'Português · Portuguese',script:'latin'},
 {id:'de',name:'German',label:'Deutsch · German',script:'latin'},
 {id:'it',name:'Italian',label:'Italiano · Italian',script:'latin'},
 {id:'tr',name:'Turkish',label:'Türkçe · Turkish',script:'latin'},
 {id:'hu',name:'Hungarian',label:'Magyar · Hungarian',script:'latin'},
 {id:'ru',name:'Russian',label:'Русский · Russian',script:'cyrillic'},
 {id:'hi',name:'Hindi',label:'हिन्दी · Hindi',script:'devanagari'},
 {id:'ar',name:'Arabic',label:'العربية · Arabic',script:'arabic',dir:'rtl'},
 {id:'ur',name:'Urdu',label:'اردو · Urdu',script:'arabic',dir:'rtl'},
 {id:'fa',name:'Persian',label:'فارسی · Persian',script:'arabic',dir:'rtl'},
];
export function languageFor(value){return LANGUAGES.find(l=>l.id===value||l.name===value)||LANGUAGES[0];}
export function detectLanguage(text){const letters=String(text).match(/\p{L}/gu)||[],total=letters.length||1;const share=re=>letters.filter(c=>re.test(c)).length/total;return share(/[\u0600-\u06ff]/)>.25?(/[پچژگکی]/.test(text)?'fa':'ar'):share(/[\u0900-\u097f]/)>.25?'hi':share(/[\u0400-\u04ff]/)>.25?'ru':'en';}
export const SCRIPT_FONTS = [
 ...['vazirmatn','notosansarabic','notonaskharabic','amiri','markazitext'].map((id,i)=>({id,file:id,label:['Vazirmatn','Noto Sans Arabic','Noto Naskh Arabic','Amiri','Markazi Text'][i],family:'CV '+id,script:'arabic'})),
 ...['notosansdevanagari','notoserifdevanagari','mukta','hind','martel'].map((id,i)=>({id,file:id,label:['Noto Sans Devanagari','Noto Serif Devanagari','Mukta','Hind','Martel'][i],family:'CV '+id,script:'devanagari'})),
];
export function fontsForLanguage(fonts,value){const script=languageFor(value).script;return fonts.filter(f=>script==='arabic'||script==='devanagari'?f.script===script:!f.script);}
const protectedItems=text=>String(text).match(/https?:\/\/[^\s<>]+|(?:www\.)[^\s<>]+|[\w.+-]+@[\w.-]+\.[A-Za-z]{2,}|\+?\p{Nd}[\p{Nd}.,٪%+/-]*/gu)||[];
export function validateTranslation(value,sections,target){
 const lang=LANGUAGES.find(l=>l.id===target);
 if(!lang||!value||value.targetLanguage!==target||!Array.isArray(value.sections)||value.sections.length!==sections.length)throw Error('Translation response does not match the requested language or CV structure.');
 const output=sections.map((source,i)=>{
  const translated=value.sections[i];
  if(!translated||translated.id!==source.id||typeof translated.text!=='string'||!translated.text.trim()||translated.text.length>Math.max(1000,source.text.length*4)||typeof translated.displayTitle!=='string'||translated.displayTitle.length>150)throw Error('Translation has invalid or missing sections.');
  const before=protectedItems(source.text).sort(),after=protectedItems(translated.text).sort();
  if(JSON.stringify(before)!==JSON.stringify(after))throw Error('Translation changed numbers or contact links. Current CV preserved.');
  if(/the (candidate|applicant) (appears|seems)|chain.of.thought|^\s*page\s*of\s*$/im.test(translated.text))throw Error('Translation contains analysis commentary.');
  return {...source,text:translated.text,displayTitle:source.title==='Header'?'':translated.displayTitle};
 });
 const prose=sections.filter(s=>s.title!=='Header'&&s.text.trim().split(/\s+/).length>5);
 if(prose.length&&prose.every(s=>output.find(o=>o.id===s.id)?.text.trim()===s.text.trim()))throw Error('The provider returned untranslated CV text. Your CV is unchanged.');
 const text=output.map(s=>s.text).join('\n');
 const scriptRE={arabic:/[\u0600-\u06ff]/,devanagari:/[\u0900-\u097f]/,cyrillic:/[\u0400-\u04ff]/};
 if(scriptRE[lang.script]&&!scriptRE[lang.script].test(text))throw Error('Translation does not contain the expected writing system.');
 const body=output.filter(s=>s.title!=='Header'&&!/skills|languages|certif/i.test(s.title)).map(s=>s.text).join(' '),letters=body.match(/\p{L}/gu)||[];if(scriptRE[lang.script]&&letters.length>40&&letters.filter(c=>scriptRE[lang.script].test(c)).length/letters.length<.15)throw Error('Translation left most CV prose in another writing system. Your current CV is preserved.');
 return {targetLanguage:target,sections:output};
}

const LOCAL_HEADINGS={
 'Professional Summary':['خلاصه حرفه‌ای','خلاصه حرفه ای','درباره من','الملخص المهني','نبذة عني','पेशेवर सारांश','सारांश','Профиль','Профессиональное резюме','Resumen profesional','Resumo profissional','Profilo'],
 'Experience':['تجربه کاری','سوابق کاری','سوابق شغلی','الخبرة المهنية','الخبرات العملية','कार्य अनुभव','अनुभव','Опыт работы','Experiencia laboral','Experiência profissional','Esperienza lavorativa','İş deneyimi'],
 'Skills':['مهارت‌ها','مهارت ها','مهارتها','المهارات','कौशल','Навыки','Habilidades','Competenze','Beceriler'],
 'Education':['تحصیلات','سوابق تحصیلی','التعليم','शिक्षा','Образование','Educación','Educação','Istruzione','Eğitim'],
 'Languages':['زبان‌ها','زبان ها','اللغات','भाषाएँ','Языки','Idiomas','Lingue','Diller'],
 'Projects':['پروژه‌ها','پروژه ها','المشاريع','परियोजनाएँ','Проекты','Proyectos','Projetos','Progetti'],
 'Certifications':['گواهینامه‌ها','گواهینامه ها','دوره‌ها','الشهادات','प्रमाणपत्र','Сертификаты','Certificaciones','Certificações','Certificazioni']
};
export function canonicalHeading(value){const text=String(value).trim().replace(/:$/,'');return Object.entries(LOCAL_HEADINGS).find(([,labels])=>labels.some(l=>l.toLocaleLowerCase()===text.toLocaleLowerCase()))?.[0]||text;}
