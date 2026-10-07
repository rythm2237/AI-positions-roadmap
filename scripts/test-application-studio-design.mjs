import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import {DOMMatrix,ImageData,Path2D} from '@napi-rs/canvas';
import {PDFDocument,PDFName} from 'pdf-lib';
import {TEMPLATES,FONTS,designFor,photoData} from '../src/lib/applicationStudio/design.mjs';
import {renderPDF} from '../src/lib/applicationStudio/pdfRenderer.mjs';
globalThis.DOMMatrix=DOMMatrix;globalThis.ImageData=ImageData;globalThis.Path2D=Path2D;
const pdfjs=await import('pdfjs-dist/legacy/build/pdf.mjs');
const portrait='data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVQIHWP4z8DwHwAFgAI/ScLbtAAAAABJRU5ErkJggg==';
const fonts=new Map();const loadFonts=async id=>{if(!fonts.has(id)){const f=FONTS.find(f=>f.id===id);fonts.set(id,await Promise.all([f.file+'.ttf',f.file+'-Bold.ttf'].map(n=>fs.readFile(path.join('public/application-studio/fonts',n)))));}return fonts.get(id);};
assert.equal(photoData('data:image/svg+xml;base64,AAA'),null);assert.equal(photoData('https://elsewhere.example/photo.png'),null);assert.equal(designFor('Sage',{size:4,margin:0}).size,10);
for(const template of TEMPLATES){for(const dense of [false,true]){
 const sections=[{title:'Header',text:'Taylor Example\nOperations specialist · taylor@example.com'}, {title:'Professional Summary',text:'Experienced in inventory planning and verified operational delivery.'},{title:'Experience',text:Array.from({length:dense?85:6},(_,i)=>`• Record ${i+1}: Coordinated daily inventory handovers and maintained accurate stock records.`).join('\n')},{title:'Skills',text:'Inventory planning\nExcel\nReporting'},{title:'Education',text:'Verified degree\nExample institution'},{title:'Projects',text:'FINAL_CONTENT_PROOF'}];
 const blob=await renderPDF({kind:'cv',template:template.name,portrait,sections},loadFonts);const bytes=new Uint8Array(await blob.arrayBuffer());const parsed=await PDFDocument.load(bytes);
 for(const page of parsed.getPages()){const {width,height}=page.getSize();assert(Math.abs(width-595.276)<.1);assert(Math.abs(height-841.89)<.1);}
 if(dense)assert(parsed.getPageCount()>1);const objects=parsed.context.lookup(parsed.getPages()[0].node.Resources().get(PDFName.of('XObject')));assert(objects&&objects.keys().length>0);
 const pdf=await pdfjs.getDocument({data:bytes,isEvalSupported:false}).promise;let text='';for(let n=1;n<=pdf.numPages;n++)text+=(await (await pdf.getPage(n)).getTextContent()).items.map(x=>x.str||'').join(' ');assert(text.includes('Taylor Example'));assert(text.includes('FINAL_CONTENT_PROOF'));assert(text.includes(dense?'Record 85':'Record 6'));assert(!text.includes('Richard Sanchez'));await pdf.destroy();
}}
console.log('Design PDF PASS: 14 templates × short/long CV, portraits, A4 pagination, preserved final content and safe photo inputs.');
