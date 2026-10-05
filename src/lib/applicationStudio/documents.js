import * as pdfjs from 'pdfjs-dist/build/pdf.mjs';
import mammoth from 'mammoth/mammoth.browser.js';
import {PDFDocument,rgb,PDFName,PDFString} from 'pdf-lib';
import fontkit from '@pdf-lib/fontkit';
import JSZip from 'jszip';
const ASSET_BASE=window.CAREER_ATELIER_CONFIG?.assetBase||'';
pdfjs.GlobalWorkerOptions.workerSrc=ASSET_BASE+'/assets/pdf.worker.min.mjs';
const MAX=10*1024*1024;
export async function extract(file){
 if(!file.size||file.size>MAX)throw Error('Choose a non-empty document smaller than 10 MB.');
 const ext=file.name.split('.').pop().toLowerCase();let text='';
 if(ext==='txt')text=await file.text();
 else if(['html','htm'].includes(ext)){const doc=new DOMParser().parseFromString(await file.text(),'text/html');doc.querySelectorAll('script,style,noscript,svg').forEach(n=>n.remove());doc.querySelectorAll('br').forEach(n=>n.replaceWith(doc.createTextNode('\n')));doc.querySelectorAll('p,div,li,h1,h2,h3,tr,section').forEach(n=>n.append(doc.createTextNode('\n')));text=doc.body.textContent;}
 else if(ext==='docx'){const buffer=await file.arrayBuffer();const zip=await JSZip.loadAsync(buffer);let expanded=0;for(const f of Object.values(zip.files)){if(f.dir)continue;expanded+=f._data?.uncompressedSize||0;if(expanded>40*1024*1024)throw Error('Expanded DOCX exceeds 40 MB.');}text=(await mammoth.extractRawText({arrayBuffer:buffer})).value;}
 else if(ext==='pdf'){let pdf;try{pdf=await pdfjs.getDocument({data:new Uint8Array(await file.arrayBuffer()),isEvalSupported:false}).promise;if(pdf.numPages>100)throw Error('PDF exceeds 100 pages.');for(let n=1;n<=pdf.numPages;n++){const page=await pdf.getPage(n);const content=await page.getTextContent();let lastY=null;for(const item of content.items){if(!('str' in item))continue;const y=item.transform[5];if(lastY!==null&&Math.abs(lastY-y)>3)text+='\n';text+=item.str+(item.hasEOL?'\n':' ');lastY=y;}text+='\n';}}catch(e){throw Error('PDF cannot be read. Use an unlocked text-based PDF or paste its text. '+(e.message||''));}finally{if(pdf)await pdf.destroy();}}
 else throw Error('Supported formats: PDF, DOCX, TXT and HTML.');
 text=text.trim();if(text.length<10)throw Error('No readable text found. Scanned PDFs need OCR.');if(text.length>100000)throw Error('Text exceeds 100,000 characters.');return text;
}
let fontCache;
async function fonts(){if(!fontCache)fontCache=Promise.all(['DejaVuSans.ttf','DejaVuSans-Bold.ttf'].map(async name=>{const r=await fetch(ASSET_BASE+'/fonts/'+name);if(!r.ok)throw Error('PDF font could not be loaded.');return new Uint8Array(await r.arrayBuffer());}));return fontCache;}
export async function pdf(doc){
 if(!Array.isArray(doc.sections)||!doc.sections.some(s=>s.text?.trim()))throw Error('No document content to export.');
 if(/[\u0600-\u06ff\u0590-\u05ff]/.test(JSON.stringify(doc)))throw Error('RTL PDF shaping is not supported. Use English, German or French.');
 const document=await PDFDocument.create();document.registerFontkit(fontkit);const [normalData,boldData]=await fonts();const normal=await document.embedFont(normalData,{subset:true}),bold=await document.embedFont(boldData,{subset:true});
 document.setTitle(doc.title||'Career document');const width=595.276,height=841.89,margin=42,usable=width-2*margin;let page,y;
 const colors={Professional:[.137,.294,.333],Modern:[.204,.278,.47],Minimal:[.13,.13,.13],Tech:[.19,.35,.27]},accent=rgb(...(colors[doc.template]||colors.Professional));
 const next=()=>{page=document.addPage([width,height]);y=height-40;page.drawText(String(document.getPageCount()),{x:width-margin-12,y:25,size:8,font:normal,color:rgb(.4,.45,.46)});};next();
 function room(space){if(y-space<42)next();}
 function lines(text,font,size){const result=[];for(const original of text.split('\n')){if(!original.trim()){result.push('');continue;}let line='';for(let word of original.trim().split(/\s+/)){if(font.widthOfTextAtSize(word,size)>usable){if(line){result.push(line);line='';}let part='';for(const char of word){if(font.widthOfTextAtSize(part+char,size)>usable){result.push(part);part='';}part+=char;}line=part;continue;}if(line&&font.widthOfTextAtSize(line+' '+word,size)>usable){result.push(line);line=word;}else line+=(line?' ':'')+word;}if(line)result.push(line);}return result;}
 function write(text,{font=normal,size=9.5,leading=14,color=rgb(.12,.16,.18),after=5}={}){for(const line of lines(text,font,size)){room(leading);if(line){page.drawText(line,{x:margin,y:y-size,size,font,color});const found=line.matchAll(/https:\/\/[^\s<>]+|[\w.+-]+@[\w.-]+\.[A-Za-z]{2,}/g);for(const match of found){const x=margin+font.widthOfTextAtSize(line.slice(0,match.index),size),w=font.widthOfTextAtSize(match[0],size);const annotation=document.context.register(document.context.obj({Type:'Annot',Subtype:'Link',Rect:[x,y-size-2,x+w,y+1],Border:[0,0,0],A:{Type:'Action',S:'URI',URI:PDFString.of(match[0].includes('@')?'mailto:'+match[0]:match[0])}}));let annots=page.node.lookup(PDFName.of('Annots'));if(!annots){annots=document.context.obj([]);page.node.set(PDFName.of('Annots'),annots);}annots.push(annotation);}}y-=leading;}y-=after;}
 if(doc.kind!=='cv')write(doc.title||'Letter',{font:bold,size:11,color:accent,after:8});
 for(let i=0;i<doc.sections.length;i++){const section=doc.sections[i];if(!section.text?.trim())continue;if(section.title&&section.title!=='Header'){room(55);y-=10;write(section.title,{font:bold,size:10.5,leading:15,color:accent,after:6});}if(i===0&&doc.kind==='cv'){const [name,...rest]=section.text.split('\n');write(name,{font:bold,size:22,leading:27,color:accent,after:8});if(rest.length)write(rest.join('\n'));}else write(section.text);}
 return new Blob([await document.save()],{type:'application/pdf'});
}
export async function applicationPackage(documents){if(documents.length!==3)throw Error('All three documents are required.');const zip=new JSZip();for(let i=0;i<3;i++)zip.file(['CV.pdf','Cover-Letter.pdf','Motivation-Letter.pdf'][i],await (await pdf(documents[i])).arrayBuffer());return zip.generateAsync({type:'blob'});}
window.CareerDocs={extract,pdf,applicationPackage};
