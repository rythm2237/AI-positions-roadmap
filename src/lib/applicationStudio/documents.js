import {LANGUAGES,languageFor,detectLanguage,fontsForLanguage,validateTranslation} from './languages.mjs';
import {renderPDF} from './pdfRenderer.mjs';
import * as pdfjs from 'pdfjs-dist/build/pdf.mjs';
import mammoth from 'mammoth/mammoth.browser.js';
import {PDFDocument,rgb,PDFName,PDFString} from 'pdf-lib';
import fontkit from '@pdf-lib/fontkit';
import JSZip from 'jszip';
import {TEMPLATES,FONTS,designFor,splitSections,flowText,photoData,colorInk} from './design.mjs';
import {inspectDesign} from './designImport.js';
import {pageText} from './pdfText.mjs';
import {recruiterAssessment} from './recruiter.mjs';
import {inlineRuns,formatSelection,editStyledText} from './inlineStyles.mjs';
import {parseProfile,normalizeSection,planCV,relevanceScore,fitCV,validateCV,approximatePages} from './contentEngine.mjs';
const ASSET_BASE=window.CAREER_ATELIER_CONFIG?.assetBase||'';
pdfjs.GlobalWorkerOptions.workerSrc=ASSET_BASE+'/assets/pdf.worker.min.mjs';
const MAX=10*1024*1024;
export async function extract(file){
 if(!file.size||file.size>MAX)throw Error('Choose a non-empty document smaller than 10 MB.');
 const ext=file.name.split('.').pop().toLowerCase();let text='';
 if(ext==='txt')text=await file.text();
 else if(['html','htm'].includes(ext)){const doc=new DOMParser().parseFromString(await file.text(),'text/html');doc.querySelectorAll('script,style,noscript,svg').forEach(n=>n.remove());doc.querySelectorAll('br').forEach(n=>n.replaceWith(doc.createTextNode('\n')));doc.querySelectorAll('p,div,li,h1,h2,h3,tr,section').forEach(n=>n.append(doc.createTextNode('\n')));text=doc.body.textContent;}
 else if(ext==='docx'){const buffer=await file.arrayBuffer();const zip=await JSZip.loadAsync(buffer);let expanded=0;for(const f of Object.values(zip.files)){if(f.dir)continue;expanded+=f._data?.uncompressedSize||0;if(expanded>40*1024*1024)throw Error('Expanded DOCX exceeds 40 MB.');}text=(await mammoth.extractRawText({arrayBuffer:buffer})).value;}
 else if(ext==='pdf'){let pdf;try{pdf=await pdfjs.getDocument({data:new Uint8Array(await file.arrayBuffer()),isEvalSupported:false}).promise;if(pdf.numPages>100)throw Error('PDF exceeds 100 pages.');for(let n=1;n<=pdf.numPages;n++){const page=await pdf.getPage(n);const content=await page.getTextContent();const viewport=page.getViewport({scale:1});text+=pageText(content.items,viewport.width,viewport.height);text+='\n';}}catch(e){throw Error('PDF cannot be read. Use an unlocked text-based PDF or paste its text. '+(e.message||''));}finally{if(pdf)await pdf.destroy();}}
 else throw Error('Supported formats: PDF, DOCX, TXT and HTML.');
 text=text.trim();if(text.length<10)throw Error('No readable text found. Scanned PDFs need OCR.');if(text.length>100000)throw Error('Text exceeds 100,000 characters.');return text;
}
const fontCache=new Map();
async function fonts(id){const f=FONTS.find(f=>f.id===id)||FONTS[0];if(!fontCache.has(f.id))fontCache.set(f.id,Promise.all([f.file+'.ttf',f.file+'-Bold.ttf'].map(async name=>{const r=await fetch(ASSET_BASE+'/fonts/'+name);if(!r.ok)throw Error('PDF font could not be loaded.');return new Uint8Array(await r.arrayBuffer());})).catch(e=>{fontCache.delete(f.id);throw e}));return fontCache.get(f.id);}
export async function pdf(doc){return renderPDF(doc,fonts);}
export async function optimiseCV(input){return fitCV(input,async sections=>(await renderPDF({kind:'cv',...input,sections,measure:true},fonts)).pages);}
export async function measureCV(doc){return (await renderPDF({...doc,measure:true},fonts)).pages;}
export async function applicationPackage(documents){if(!documents.length)throw Error('No documents to export.');const zip=new JSZip();for(let i=0;i<documents.length;i++)zip.file(documents[i].kind==='cv'?'CV.pdf':documents[i].kind==='cover'?'Cover-Letter.pdf':'Motivation-Letter.pdf',await (await pdf(documents[i])).arrayBuffer());return zip.generateAsync({type:'blob'});}
window.CareerDocs={editStyledText,inlineRuns,formatSelection,LANGUAGES,languageFor,detectLanguage,fontsForLanguage,validateTranslation,extract,pdf,applicationPackage,inspectDesign,TEMPLATES,FONTS,designFor,splitSections,flowText,photoData,colorInk,optimiseCV,measureCV,parseProfile,normalizeSection,planCV,relevanceScore,validateCV,approximatePages};
window.CareerRecruiter={assess:recruiterAssessment};
