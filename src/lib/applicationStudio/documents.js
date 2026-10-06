import * as pdfjs from 'pdfjs-dist/build/pdf.mjs';
import mammoth from 'mammoth/mammoth.browser.js';
import {PDFDocument,rgb,PDFName,PDFString} from 'pdf-lib';
import fontkit from '@pdf-lib/fontkit';
import JSZip from 'jszip';
import {TEMPLATES,FONTS,designFor,splitSections,flowText} from './design.mjs';
import {inspectDesign} from './designImport.js';
import {pageText} from './pdfText.mjs';
import {recruiterAssessment} from './recruiter.mjs';
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
export async function pdf(doc){
 if(!Array.isArray(doc.sections)||!doc.sections.some(s=>s.text?.trim()))throw Error('No document content to export.');
 if(/[\u0600-\u06ff\u0590-\u05ff]/.test(JSON.stringify(doc.sections)))throw Error('RTL PDF shaping is not supported. Use English, German or French.');
 const d=designFor(doc.template,doc.design),document=await PDFDocument.create();document.registerFontkit(fontkit);const data=await fonts(d.font);
 const normal=await document.embedFont(data[0],{subset:true}),bold=await document.embedFont(data[1],{subset:true});
 document.setTitle(doc.title||'Career document');const width=595.276,height=841.89,margin=d.margin,bottom=40,accent=rgb(...d.accent.slice(1).match(/../g).map(x=>parseInt(x,16)/255)),ink=rgb(.12,.16,.18),white=rgb(1,1,1);
 const columns=doc.kind==='cv'&&d.layout!=='single'&&splitSections(doc.sections).side.length>0,sideWidth=columns?132:0,gap=24,mainWidth=width-2*margin-sideWidth-(columns?gap:0),sideX=d.layout==='sidebar-right'?width-margin-sideWidth:margin,mainX=columns&&d.layout==='sidebar-left'?margin+sideWidth+gap:margin;
 const pages=[],tops=[];
 function pageAt(index){while(pages.length<=index){const p=document.addPage([width,height]);if(columns&&pages.length>0)p.drawRectangle({x:sideX-10,y:bottom-8,width:sideWidth+20,height:height-margin-bottom+8,color:rgb(.94,.95,.97)});if(d.header==='rail')p.drawRectangle({x:margin-15,y:bottom,width:3,height:height-margin-bottom,color:accent});p.drawText(String(pages.length+1),{x:width-margin-12,y:23,size:8,font:normal,color:rgb(.4,.45,.46)});pages.push(p);tops.push(height-margin);}return pages[index];}pageAt(0);
 function wrap(text,font,size,w){const result=[];for(const original of String(text).split('\n')){if(!original.trim()){result.push('');continue;}let line='';for(const word of original.trim().split(/\s+/)){if(font.widthOfTextAtSize(word,size)>w){if(line){result.push(line);line='';}let part='';for(const char of word){if(font.widthOfTextAtSize(part+char,size)>w){result.push(part);part='';}part+=char;}line=part;continue;}if(line&&font.widthOfTextAtSize(line+' '+word,size)>w){result.push(line);line=word;}else line+=(line?' ':'')+word;}if(line)result.push(line);}return result;}
 function write(flow,text,{font=normal,size=d.size,leading=d.size*1.48,color=ink,after=5,align='left'}={}){for(const line of wrap(text,font,size,flow.w)){if(!line.trim()){flow.y-=leading*.28;continue;}if(flow.y-leading<bottom){flow.i++;pageAt(flow.i);flow.y=tops[flow.i];}const p=pageAt(flow.i),x=flow.x+(align==='center'?(flow.w-font.widthOfTextAtSize(line,size))/2:0);if(line){p.drawText(line,{x,y:flow.y-size,size,font,color});for(const match of line.matchAll(/https:\/\/[^\s<>]+|[\w.+-]+@[\w.-]+\.[A-Za-z]{2,}/g)){const linkX=x+font.widthOfTextAtSize(line.slice(0,match.index),size),w=font.widthOfTextAtSize(match[0],size),annotation=document.context.register(document.context.obj({Type:'Annot',Subtype:'Link',Rect:[linkX,flow.y-size-2,linkX+w,flow.y+1],Border:[0,0,0],A:{Type:'Action',S:'URI',URI:PDFString.of(match[0].includes('@')?'mailto:'+match[0]:match[0])}}));let annots=p.node.lookup(PDFName.of('Annots'));if(!annots){annots=document.context.obj([]);p.node.set(PDFName.of('Annots'),annots);}annots.push(annotation);}}flow.y-=leading;}flow.y-=after;}
 const group=splitSections(doc.sections),header=doc.kind==='cv'?group.header:null,bodyTop=height-margin;
 const mast={i:0,x:margin,y:bodyTop,w:width-margin*2};
 if(header){const [name,...rest]=header.text.split('\n');const headerHeight=wrap(name,bold,27,mast.w).length*33+wrap(rest.join('\n'),normal,d.size,mast.w).length*d.size*1.48+35;if(headerHeight>height/2)throw Error('Header is too long. Move experience and skills into separate sections before exporting.');if(d.header==='banner'){const nameLines=wrap(name,bold,27,mast.w),contactLines=wrap(rest.join('\n'),normal,d.size,mast.w),block=nameLines.length*33+contactLines.length*d.size*1.48+35;if(block>height/2)throw Error('Header is too long for a banner. Choose another layout or move details to a section.');pages[0].drawRectangle({x:margin-12,y:mast.y-block,width:mast.w+24,height:block+12,color:accent});}write(mast,name,{font:bold,size:27,leading:33,color:d.header==='banner'?white:accent,align:d.header==='centered'?'center':'left',after:9});write(mast,rest.join('\n'),{leading:d.size*1.4,color:d.header==='banner'?white:ink,align:d.header==='centered'?'center':'left',after:20});}
 const startY=mast.y;
 if(columns)pages[0].drawRectangle({x:sideX-10,y:bottom-8,width:sideWidth+20,height:Math.max(0,startY-bottom+8),color:rgb(.94,.95,.97)});
 function sections(list,x,w){const f={i:0,x,y:startY,w};if(doc.kind!=='cv')write(f,doc.title||'Letter',{font:bold,size:12,color:accent,after:15});for(const s of list){if(!s.text?.trim())continue;if(s.title&&s.title!=='Header'){if(f.y-55<bottom){f.i++;pageAt(f.i);f.y=tops[f.i];}f.y-=10;write(f,d.heading==='uppercase'?s.title.toUpperCase():s.title,{font:bold,size:d.size+1,leading:d.size*1.5,color:accent,after:7});if(d.heading==='rule')pageAt(f.i).drawLine({start:{x,y:f.y+3},end:{x:x+w,y:f.y+3},thickness:.5,color:accent});}write(f,flowText(s),{leading:d.size*1.4,after:7});} }
 if(columns){sections(group.main,mainX,mainWidth);sections(group.side,sideX,sideWidth);}else sections(header?doc.sections.slice(1):doc.sections,margin,width-2*margin);
 return new Blob([await document.save()],{type:'application/pdf'});
}
export async function applicationPackage(documents){if(!documents.length)throw Error('No documents to export.');const zip=new JSZip();for(let i=0;i<documents.length;i++)zip.file(documents[i].kind==='cv'?'CV.pdf':documents[i].kind==='cover'?'Cover-Letter.pdf':'Motivation-Letter.pdf',await (await pdf(documents[i])).arrayBuffer());return zip.generateAsync({type:'blob'});}
window.CareerDocs={extract,pdf,applicationPackage,inspectDesign,TEMPLATES,FONTS,designFor,splitSections,flowText};
window.CareerRecruiter={assess:recruiterAssessment};
