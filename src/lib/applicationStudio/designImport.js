import * as pdfjs from 'pdfjs-dist/build/pdf.mjs';
import JSZip from 'jszip';
import {designFor} from './design.mjs';
// A reference is visual input only. No reference text is returned or sent to AI.
function pixels(canvas){
 const {width:w,height:h}=canvas,ctx=canvas.getContext('2d'),{data}=ctx.getImageData(0,0,w,h),bins=new Map(),ink=Array(w).fill(0);let left=0,right=0,top=0;
 for(let y=0;y<h;y+=2)for(let x=0;x<w;x+=2){let i=(y*w+x)*4;const [r,g,b]=data.slice(i,i+3),v=Math.max(r,g,b)-Math.min(r,g,b);if(Math.min(r,g,b)<190){ink[x]++;if(y>h*.23)(x<w*.35?left++:right++);else top++;}if(v>28&&Math.min(r,g,b)<195&&Math.max(r,g,b)>55){const key=[r,g,b].map(v=>Math.round(v/24)*24).join(',');bins.set(key,(bins.get(key)||0)+1)}}
 let accent='#234b55';const common=[...bins].sort((a,b)=>b[1]-a[1])[0];if(common)accent='#'+common[0].split(',').map(v=>Math.min(255,+v).toString(16).padStart(2,'0')).join('');
 const candidates=[];for(let x=Math.floor(w*.25);x<w*.55;x+=2)candidates.push({x,n:ink.slice(x,x+8).reduce((a,b)=>a+b,0)});candidates.sort((a,b)=>a.n-b.n);const gap=candidates[0];const hasGap=gap&&gap.n<3&&left>h*.3&&right>h;
 let coloredTop=0,coloredLeft=0,coloredRight=0;
 for(let y=0;y<h;y+=4)for(let x=0;x<w;x+=4){let i=(y*w+x)*4;const r=data[i],g=data[i+1],b=data[i+2];if(Math.max(r,g,b)-Math.min(r,g,b)>25&&Math.min(r,g,b)<200){if(y<h*.18)coloredTop++;if(y>h*.2&&x<w*.25)coloredLeft++;if(y>h*.2&&x>w*.75)coloredRight++;}}
 const rail=Math.max(coloredLeft,coloredRight)>w*h/400;
 return {accent,layout:rail?(coloredLeft>=coloredRight?'sidebar-left':'sidebar-right'):hasGap?'sidebar-left':'single',header:coloredTop>w*h/600?'banner':'plain'};
}
export async function inspectDesign(file){
 if(!file?.size||file.size>10*1024*1024)throw Error('Choose a non-empty design reference smaller than 10 MB.');
 const ext=file.name.split('.').pop().toLowerCase();let metadata={},canvas=document.createElement('canvas'),notes=[],geometry=false;
 if(ext==='pdf'){
  let pdf;try{pdf=await pdfjs.getDocument({data:new Uint8Array(await file.arrayBuffer()),isEvalSupported:false}).promise;const page=await pdf.getPage(1),vp=page.getViewport({scale:1}),view=page.getViewport({scale:360/vp.width});if(view.height>3000)throw Error('Reference page proportions are unsupported.');canvas.width=Math.ceil(view.width);canvas.height=Math.ceil(view.height);await page.render({canvasContext:canvas.getContext('2d'),viewport:view}).promise;metadata=pixels(canvas);const items=(await page.getTextContent()).items.filter(i=>'str' in i&&i.str.trim());const sizes=items.map(i=>Math.abs(i.transform[3])).filter(n=>n>=7&&n<=15).sort((a,b)=>a-b);if(sizes.length)metadata.size=sizes[Math.floor(sizes.length/2)];const header=items.filter(i=>i.transform[5]>vp.height*.82).sort((a,b)=>Math.abs(b.transform[3])-Math.abs(a.transform[3]))[0];if(header&&metadata.header!=='banner'){const center=header.transform[4]+header.width/2;metadata.header=Math.abs(center-vp.width/2)<vp.width*.1?'centered':'plain';}metadata.font=Object.values((await page.getTextContent()).styles).some(i=>/serif/i.test(i.fontFamily)&&!i.fontFamily.includes('sans'))?'serif':'sans';geometry=true;notes.push('First page analyzed locally: color, column balance, name alignment and text size.');}finally{if(pdf)await pdf.destroy();}
 }else if(['png','jpg','jpeg','webp'].includes(ext)){
  const bitmap=await createImageBitmap(file);try{if(bitmap.width*bitmap.height>20000000)throw Error('Reference image exceeds 20 million pixels.');canvas.width=360;canvas.height=Math.round(bitmap.height*360/bitmap.width);if(canvas.height>3000)throw Error('Reference image proportions are unsupported.');const ctx=canvas.getContext('2d');ctx.fillStyle='#fff';ctx.fillRect(0,0,canvas.width,canvas.height);ctx.drawImage(bitmap,0,0,canvas.width,canvas.height);metadata=pixels(canvas);notes.push('Image analyzed locally for color blocks and column balance. Typography and section semantics need manual refinement.');}finally{bitmap.close();}
 }else if(ext==='docx'){
  const zip=await JSZip.loadAsync(await file.arrayBuffer());let size=0;for(const f of Object.values(zip.files)){size+=f._data?.uncompressedSize||0;if(size>40*1024*1024)throw Error('Expanded DOCX exceeds 40 MB.');}
  const xml=(await zip.file('word/document.xml')?.async('string'))||'',styles=(await zip.file('word/styles.xml')?.async('string'))||'';
  const colors=[...((xml+styles).matchAll(/<w:color\b[^>]*w:val="([0-9A-Fa-f]{6})"/g))].map(m=>m[1]).filter(c=>!['000000','FFFFFF'].includes(c.toUpperCase()));if(colors.length)metadata.accent='#'+colors[0];metadata.layout=/<w:(?:cols\b[^>]*w:num="2"|tbl\b)/.test(xml)?'sidebar-left':'single';metadata.header=/<w:jc\b[^>]*w:val="center"/.test(xml)?'centered':'plain';metadata.font=/(Times|Georgia|Cambria)/i.test(styles)?'serif':'sans';notes.push('DOCX style hints extracted locally. Tables and custom positioning are approximated with supported layouts.');
 }else throw Error('Design references: PDF, DOCX, PNG, JPG or WebP.');
 const design=designFor('Professional',metadata);
 return {design,reference:{name:file.name,format:ext,notes,confidence:geometry?'Measured style hints':'Approximate visual hints'},preview:ext==='docx'?null:canvas.toDataURL('image/png')};
}
