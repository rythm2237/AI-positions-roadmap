import * as pdfjs from 'pdfjs-dist/build/pdf.mjs';
import JSZip from 'jszip';
import {designFor} from './design.mjs';
// A reference is visual input only. No reference text is returned or sent to AI.
export function visualStyle(canvas){
 const {width:w,height:h}=canvas,{data}=canvas.getContext('2d').getImageData(0,0,w,h),ink=Array(w).fill(0),bins=new Map();let topColor=0,leftColor=0,rightColor=0;
 for(let y=0;y<h;y+=2)for(let x=0;x<w;x+=2){const i=(y*w+x)*4,r=data[i],g=data[i+1],b=data[i+2],dark=Math.min(r,g,b)<205,chroma=Math.max(r,g,b)-Math.min(r,g,b);if(y>h*.22&&y<h*.91&&dark){ink[x]++;ink[Math.min(w-1,x+1)]++;}if(chroma>12&&Math.min(r,g,b)<205&&Math.max(r,g,b)>50){const key=[r,g,b].map(v=>Math.min(255,Math.round(v/16)*16)).join(',');bins.set(key,(bins.get(key)||0)+1);if(y<h*.2)topColor++;if(y>h*.22&&x<w*.32)leftColor++;if(y>h*.22&&x>w*.68)rightColor++;}}
 let accent='#234b55';const common=[...bins].sort((a,b)=>b[1]-a[1])[0];if(common)accent='#'+common[0].split(',').map(v=>(+v).toString(16).padStart(2,'0')).join('');
 // Find a real vertical gutter in the body; a wide name masthead must not hide it.
 let run=0,best=null;for(let x=Math.floor(w*.2);x<w*.8;x++){if(ink[x]<h*.003){run++;if(run>=w*.025){const center=x-run/2,li=ink.slice(0,Math.floor(center)).reduce((a,b)=>a+b,0),ri=ink.slice(Math.ceil(center)).reduce((a,b)=>a+b,0);if(li>w*h*.0015&&ri>w*h*.0015&&(!best||run>best.run))best={run,center};}}else run=0;}
 const rail=Math.max(leftColor,rightColor)>w*h*.025;
 const layout=rail?(leftColor>=rightColor?'sidebar-left':'sidebar-right'):best?(best.center<w*.5?'sidebar-left':'sidebar-right'):'single';
 return {accent,layout,header:topColor>w*h*.012?'banner':'plain'};
}
export async function inspectDesign(file){
 if(!file?.size||file.size>10*1024*1024)throw Error('Choose a non-empty design reference smaller than 10 MB.');
 const ext=file.name.split('.').pop().toLowerCase();let metadata={},canvas=document.createElement('canvas'),notes=[],geometry=false;
 if(ext==='pdf'){
  let pdf;try{pdf=await pdfjs.getDocument({data:new Uint8Array(await file.arrayBuffer()),isEvalSupported:false}).promise;const page=await pdf.getPage(1),vp=page.getViewport({scale:1}),view=page.getViewport({scale:360/vp.width});if(view.height>3000)throw Error('Reference page proportions are unsupported.');canvas.width=Math.ceil(view.width);canvas.height=Math.ceil(view.height);await page.render({canvasContext:canvas.getContext('2d'),viewport:view}).promise;metadata=visualStyle(canvas);const items=(await page.getTextContent()).items.filter(i=>'str' in i&&i.str.trim());const sizes=items.map(i=>Math.abs(i.transform[3])).filter(n=>n>=7&&n<=15).sort((a,b)=>a-b);if(sizes.length)metadata.size=sizes[Math.floor(sizes.length/2)];const bodyItems=items.filter(i=>i.transform[5]>35&&i.transform[5]<vp.height*.8);if(bodyItems.length)metadata.margin=Math.min(...bodyItems.map(i=>i.transform[4]));const header=items.filter(i=>i.transform[5]>vp.height*.82).sort((a,b)=>Math.abs(b.transform[3])-Math.abs(a.transform[3]))[0];if(header&&metadata.header!=='banner'){const center=header.transform[4]+header.width/2;metadata.header=Math.abs(center-vp.width/2)<vp.width*.1?'centered':'plain';}const fontNames=items.map(i=>{try{return page.commonObjs.get(i.fontName)?.name||''}catch{return ''}}).join(' ');metadata.font=/SansMono|Courier/i.test(fontNames)?'mono':/SerifCondensed/i.test(fontNames)?'editorial':/SansCondensed/i.test(fontNames)?'condensed':/Serif|Times|Georgia|Cambria/i.test(fontNames)?'serif':Object.values((await page.getTextContent()).styles).some(i=>/serif/i.test(i.fontFamily)&&!i.fontFamily.includes('sans'))?'serif':'sans';geometry=true;notes.push('First page measured locally: palette, body gutter, columns, name alignment, margins and body text size. Apply below to see these choices on your own CV.');}finally{if(pdf)await pdf.destroy();}
 }else if(['png','jpg','jpeg','webp'].includes(ext)){
  const bitmap=await createImageBitmap(file);try{if(bitmap.width*bitmap.height>20000000)throw Error('Reference image exceeds 20 million pixels.');canvas.width=360;canvas.height=Math.round(bitmap.height*360/bitmap.width);if(canvas.height>3000)throw Error('Reference image proportions are unsupported.');const ctx=canvas.getContext('2d');ctx.fillStyle='#fff';ctx.fillRect(0,0,canvas.width,canvas.height);ctx.drawImage(bitmap,0,0,canvas.width,canvas.height);metadata=visualStyle(canvas);notes.push('Image analyzed locally for color blocks and column balance. Typography and section semantics need manual refinement.');}finally{bitmap.close();}
 }else if(ext==='docx'){
  const zip=await JSZip.loadAsync(await file.arrayBuffer());let size=0;for(const f of Object.values(zip.files)){size+=f._data?.uncompressedSize||0;if(size>40*1024*1024)throw Error('Expanded DOCX exceeds 40 MB.');}
  const xml=(await zip.file('word/document.xml')?.async('string'))||'',styles=(await zip.file('word/styles.xml')?.async('string'))||'';
  const colors=[...((xml+styles).matchAll(/<w:color\b[^>]*w:val="([0-9A-Fa-f]{6})"/g))].map(m=>m[1]).filter(c=>!['000000','FFFFFF'].includes(c.toUpperCase()));if(colors.length)metadata.accent='#'+colors[0];metadata.layout=/<w:(?:cols\b[^>]*w:num="2"|tbl\b)/.test(xml)?'sidebar-left':'single';metadata.header=/<w:jc\b[^>]*w:val="center"/.test(xml)?'centered':'plain';metadata.font=/(Times|Georgia|Cambria)/i.test(styles)?'serif':'sans';notes.push('DOCX style hints extracted locally. Tables and custom positioning are approximated with supported layouts.');
 }else throw Error('Design references: PDF, DOCX, PNG, JPG or WebP.');
 const design=designFor('Professional',metadata);
 return {design,reference:{name:file.name,format:ext,notes,confidence:geometry?'Measured style hints':'Approximate visual hints'},preview:ext==='docx'?null:canvas.toDataURL('image/png')};
}
