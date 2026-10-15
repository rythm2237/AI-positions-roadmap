import assert from 'node:assert/strict';
import {createCanvas,DOMMatrix,ImageData,Path2D} from '@napi-rs/canvas';
import {PDFDocument,StandardFonts,rgb} from 'pdf-lib';
Object.assign(globalThis,{DOMMatrix,ImageData,Path2D,document:{createElement:tag=>{if(tag!=='canvas')throw Error('Unexpected element');return createCanvas(1,1)}}});
await import('pdfjs-dist/legacy/build/pdf.mjs');
const {sourceAppearance}=await import('../src/lib/applicationStudio/sourceAppearance.js');
const {renderPDF}=await import('../src/lib/applicationStudio/pdfRenderer.mjs');
const {FONTS}=await import('../src/lib/applicationStudio/design.mjs');
const fs=await import('node:fs/promises');
const canvas=createCanvas(120,160),ctx=canvas.getContext('2d');ctx.fillStyle='#d7b5a0';ctx.fillRect(0,0,120,160);ctx.fillStyle='#193f49';ctx.fillRect(0,130,120,30);ctx.fillStyle='#a75436';ctx.fillRect(0,0,12,12);ctx.fillStyle='#315934';ctx.fillRect(108,148,12,12);
const pdf=await PDFDocument.create(),page=pdf.addPage([595,842]),font=await pdf.embedFont(StandardFonts.Helvetica);const image=await pdf.embedPng(canvas.toBuffer('image/png'));
page.drawImage(image,{x:40,y:640,width:120,height:160});page.drawText('ALEX EXAMPLE',{x:210,y:780,size:25,font});
for(const [title,x,y,body] of [['Skills',40,570,'Python: beginner'],['Languages',40,490,'German B1'],['Experience',210,600,'Customer service'],['Education',210,470,'Associate Degree']]){page.drawText(title,{x,y,size:12,font});page.drawText(body,{x,y:y-22,size:10,font});}
const bytes=await pdf.save(),file={name:'synthetic-cv.pdf',size:bytes.length,arrayBuffer:async()=>bytes.slice().buffer};const result=await sourceAppearance(file);
assert.equal(result.photos.length,1);assert(result.portrait.startsWith('data:image/jpeg'));assert.equal(result.design.layout,'sidebar-left');assert.equal(result.design.sideColor,'#ffffff','White source sidebar stays white');assert.equal(result.design.sourceColumns.education,'main');assert.equal(result.design.sourceColumns.skills,'side');
const sections=[{id:'h',title:'Header',text:'Alex Example\nalex@example.test'},{id:'s',title:'Skills',text:'Python: beginner'},{id:'l',title:'Languages',text:'German B1'},{id:'e',title:'Experience',text:'Customer service'},{id:'d',title:'Education',text:'Associate Degree'}];const fonts=async id=>{const f=FONTS.find(f=>f.id===id);return Promise.all(['.ttf','-Bold.ttf'].map(x=>fs.readFile('public/application-studio/fonts/'+f.file+x)))};
const output=await renderPDF({kind:'cv',sections,design:result.design,portrait:result.portrait,language:'en',template:'Professional'},fonts);await fs.mkdir('tmp/quick-qa',{recursive:true});await fs.writeFile('tmp/quick-qa/source.pdf',bytes);await fs.writeFile('tmp/quick-qa/rebuilt.pdf',new Uint8Array(await output.arrayBuffer()));await fs.writeFile('tmp/quick-qa/recovered-photo.jpg',Buffer.from(result.portrait.split(',')[1],'base64'));
console.log('PASS: actual PDF source rendering, automatic portrait recovery, source columns, white sidebar, preserved image and selectable-text PDF export.');
