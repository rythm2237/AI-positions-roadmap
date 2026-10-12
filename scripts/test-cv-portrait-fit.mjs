import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import {createCanvas,DOMMatrix,ImageData,Path2D} from '@napi-rs/canvas';
import {FONTS} from '../src/lib/applicationStudio/design.mjs';
import {renderPDF} from '../src/lib/applicationStudio/pdfRenderer.mjs';
globalThis.DOMMatrix=DOMMatrix;globalThis.ImageData=ImageData;globalThis.Path2D=Path2D;
const pdfjs=await import('pdfjs-dist/legacy/build/pdf.mjs');
const source=createCanvas(200,400),c=source.getContext('2d');c.fillStyle='#77aa88';c.fillRect(0,0,200,400);c.fillStyle='#ee3344';c.fillRect(0,0,200,30);c.fillStyle='#3366ee';c.fillRect(0,370,200,30);
const portrait=source.toDataURL('image/png'),fonts=async id=>{const f=FONTS.find(f=>f.id===id);return Promise.all(['.ttf','-Bold.ttf'].map(x=>fs.readFile('public/application-studio/fonts/'+f.file+x)))};
for(const [template,placement] of [['Harbor','header'],['Summit','sidebar'],['Blush','header']]){
 const blob=await renderPDF({kind:'cv',template,portrait,design:{photoPlacement:placement},sections:[{title:'Header',text:'Taylor Example\ntaylor@example.test'},{title:'Experience',text:'Operations Planner\n2024 - Present\nPrepared inventory reports.'},{title:'Education',text:'Bachelor of Business — Example University — 2019'}]},fonts);
 const data=new Uint8Array(await blob.arrayBuffer()),pdf=await pdfjs.getDocument({data,isEvalSupported:false}).promise,page=await pdf.getPage(1),ops=await page.getOperatorList();let transform=[1,0,0,1,0,0],stack=[],found=false;const multiply=(a,b)=>[a[0]*b[0]+a[2]*b[1],a[1]*b[0]+a[3]*b[1],a[0]*b[2]+a[2]*b[3],a[1]*b[2]+a[3]*b[3],a[0]*b[4]+a[2]*b[5]+a[4],a[1]*b[4]+a[3]*b[5]+a[5]];for(let i=0;i<ops.fnArray.length;i++){const op=ops.fnArray[i];if(op===pdfjs.OPS.save)stack.push([...transform]);else if(op===pdfjs.OPS.restore)transform=stack.pop();else if(op===pdfjs.OPS.transform)transform=multiply(transform,ops.argsArray[i]);else if(op===pdfjs.OPS.paintImageXObject){found=true;break;}}assert(found);

 assert(transform);assert(Math.abs(transform[0]/transform[3]-.5)<.001,'PDF portrait preserves source aspect ratio');assert(Math.max(transform[0],transform[3])<=64);if(template!=='Blush')assert(Math.hypot(transform[0],transform[3])<=64,'All four photo corners fit inside the circle; none are clipped');
 if(template==='Harbor'){await fs.mkdir('tmp/cv-portrait-fit',{recursive:true});await fs.writeFile('tmp/cv-portrait-fit/proof.pdf',new Uint8Array(await blob.arrayBuffer()));}
 await pdf.destroy();
}
console.log('PASS: actual PDF image transforms preserve portrait aspect ratio and all corners in header, sidebar and square layouts.');
