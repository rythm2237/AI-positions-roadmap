import * as pdfjs from 'pdfjs-dist/build/pdf.mjs';
import JSZip from 'jszip';
import {inspectDesign} from './designImport.js';
import {sectionKind} from './contentEngine.mjs';
import {pageTextParts} from './pdfText.mjs';
const multiply=(a,b)=>pdfjs.Util.transform(a,b);
export function imageRects(ops,viewport){
 let matrix=[1,0,0,1,0,0];const stack=[],rects=[];
 for(let i=0;i<ops.fnArray.length;i++){
  const op=ops.fnArray[i],a=ops.argsArray[i];
  if(op===pdfjs.OPS.save)stack.push([...matrix]);
  else if(op===pdfjs.OPS.restore)matrix=stack.pop()||[1,0,0,1,0,0];
  else if(op===pdfjs.OPS.transform)matrix=multiply(matrix,a);
  else if([pdfjs.OPS.paintImageXObject,pdfjs.OPS.paintInlineImageXObject].includes(op)){
   const points=[[0,0],[1,0],[0,1],[1,1]].map(([x,y])=>[matrix[0]*x+matrix[2]*y+matrix[4],matrix[1]*x+matrix[3]*y+matrix[5]]).map(p=>viewport.convertToViewportPoint(...p));
   const xs=points.map(p=>p[0]),ys=points.map(p=>p[1]);rects.push({x:Math.min(...xs),y:Math.min(...ys),width:Math.max(...xs)-Math.min(...xs),height:Math.max(...ys)-Math.min(...ys)});
  }
 }
 return rects.filter(r=>{const ratio=r.width/r.height,area=r.width*r.height/(viewport.width*viewport.height);return ratio>.45&&ratio<1.45&&area>.008&&area<.3&&r.width>35&&r.height>40&&r.x>=0&&r.y>=0});
}
async function imageData(blob){const bitmap=await createImageBitmap(blob);try{const w=Math.min(320,bitmap.width),h=Math.round(bitmap.height*w/bitmap.width);const canvas=document.createElement('canvas');canvas.width=w;canvas.height=h;const ctx=canvas.getContext('2d');ctx.fillStyle='#fff';ctx.fillRect(0,0,w,h);ctx.drawImage(bitmap,0,0,w,h);return {data:canvas.toDataURL('image/jpeg',.9),ratio:bitmap.width/bitmap.height,width:bitmap.width,height:bitmap.height};}finally{bitmap.close()}}
export async function sourceAppearance(file){
 const style=await inspectDesign(file),photos=[],notes=[];let pdf;
 if(/\.pdf$/i.test(file.name)){
  try{
   pdf=await pdfjs.getDocument({data:new Uint8Array(await file.arrayBuffer()),isEvalSupported:false}).promise;
   const page=await pdf.getPage(1),viewport=page.getViewport({scale:1}),ops=await page.getOperatorList(),rects=imageRects(ops,viewport);
   const items=(await page.getTextContent()).items.filter(i=>'str' in i&&i.str.trim()),parts=pageTextParts(items,viewport.width,viewport.height);
   if(parts.columns)style.design.layout=parts.gutter<viewport.width*.5?'sidebar-left':'sidebar-right';
   const view=page.getViewport({scale:1000/viewport.width}),canvas=document.createElement('canvas');canvas.width=Math.ceil(view.width);canvas.height=Math.ceil(view.height);await page.render({canvasContext:canvas.getContext('2d'),viewport:view}).promise;const scale=view.width/viewport.width;
   // Portrait colors are not document branding. Estimate accent from the
   // remaining page, otherwise a skin tone can replace black section headings.
   const pixels=canvas.getContext('2d').getImageData(0,0,canvas.width,canvas.height).data,accentBins=new Map();
   for(let y=0;y<canvas.height;y+=3)for(let x=0;x<canvas.width;x+=3){if(rects.some(r=>x>=r.x*scale&&x<=(r.x+r.width)*scale&&y>=r.y*scale&&y<=(r.y+r.height)*scale))continue;const i=(y*canvas.width+x)*4,v=[pixels[i],pixels[i+1],pixels[i+2]];if(Math.max(...v)-Math.min(...v)<20||Math.min(...v)>220||Math.max(...v)<35)continue;const key=v.map(n=>Math.min(255,Math.round(n/16)*16)).join(',');accentBins.set(key,(accentBins.get(key)||0)+1);}
   const accent=[...accentBins].sort((a,b)=>b[1]-a[1])[0];style.design.accent=accent?'#'+accent[0].split(',').map(v=>Math.min(160,+v).toString(16).padStart(2,'0')).join(''):'#23313b';style.design.headingColor=style.design.accent;
   if(rects.length&&style.design.layout!=='single'){const r=rects[0],center=r.x+r.width/2,gutter=parts.gutter||viewport.width*(style.design.layout==='sidebar-left'?.33:.67);style.design.photoPlacement=(style.design.layout==='sidebar-left'?center<gutter:center>gutter)?'sidebar':'header';}
   if(style.design.layout!=='single'){
    const ctx=canvas.getContext('2d'),data=ctx.getImageData(0,0,canvas.width,canvas.height).data,bins=new Map(),left=style.design.layout==='sidebar-left';
    for(let y=Math.floor(canvas.height*.35);y<canvas.height*.85;y+=5)for(let x=Math.floor(canvas.width*(left?.05:.75));x<canvas.width*(left?.25:.95);x+=5){const i=(y*canvas.width+x)*4;const key=[data[i],data[i+1],data[i+2]].map(v=>Math.min(255,Math.round(v/16)*16)).join(',');bins.set(key,(bins.get(key)||0)+1);}
    const dominant=[...bins].sort((a,b)=>b[1]-a[1])[0];if(dominant)style.design.sideColor='#'+dominant[0].split(',').map(v=>(+v).toString(16).padStart(2,'0')).join('');
   }
   if(rects.length){
    for(const r of rects.slice(0,6)){const crop=document.createElement('canvas');crop.width=Math.round(r.width*scale);crop.height=Math.round(r.height*scale);crop.getContext('2d').drawImage(canvas,r.x*scale,r.y*scale,r.width*scale,r.height*scale,0,0,crop.width,crop.height);photos.push(crop.toDataURL('image/jpeg',.92));}
   }
   if(style.design.layout!=='single'){
    const sourceColumns={};
    for(const i of items){const kind=sectionKind(i.str.trim().replace(/:$/,''));if(kind==='other'||kind==='header')continue;const x=i.transform[4],gutter=parts.gutter||viewport.width*(style.design.layout==='sidebar-left'?.33:.67);sourceColumns[kind]=style.design.layout==='sidebar-left'?(x<gutter?'side':'main'):(x>gutter?'side':'main');}
    style.design.sourceColumns=sourceColumns;
   }
  }finally{if(pdf)await pdf.destroy()}
 }else if(/\.docx$/i.test(file.name)){
  const zip=await JSZip.loadAsync(await file.arrayBuffer());let size=0;for(const f of Object.values(zip.files)){size+=f._data?.uncompressedSize||0;if(size>40*1024*1024)throw Error('Expanded DOCX exceeds 40 MB.');}
  for(const f of Object.values(zip.files).filter(f=>/^word\/media\/.*\.(png|jpe?g)$/i.test(f.name)).slice(0,8)){const image=await imageData(new Blob([await f.async('uint8array')],{type:/\.png$/i.test(f.name)?'image/png':'image/jpeg'}));if(image.ratio>.45&&image.ratio<1.45&&image.width>80&&image.height>80)photos.push(image.data);}
 }
 if(photos.length>1)notes.push('More than one image was found. Select your portrait so a logo is not used by mistake.');
 if(!photos.length)notes.push('No separate portrait was recovered. If the original has one, add it here to keep it in the new CV.');
 return {design:style.design,photos,portrait:photos.length===1?photos[0]:null,notes,reference:style.reference};
}
