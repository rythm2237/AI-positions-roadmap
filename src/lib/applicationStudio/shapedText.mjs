import 'regenerator-runtime/runtime.js';
import bidiFactory from 'bidi-js';
import {beginText,endText,setFontAndSize,setTextMatrix,showText,setFillingRgbColor,PDFHexString,PDFOperator,PDFName} from 'pdf-lib';
const bidi=bidiFactory();
// UAX #9 visual runs; shape each logical run, not a character-reversed Arabic string.
export function shapedRuns(text,raw,direction='ltr'){
 const input=String(text).replace(/[•●▪]/g,'-');
 const embedding=bidi.getEmbeddingLevels(input,direction),indices=bidi.getReorderedIndices(input,embedding),mirrors=bidi.getMirroredCharactersMap(input,embedding),groups=[];
 for(const index of indices){const level=embedding.levels[index],last=groups.at(-1);if(last&&last.level===level&&Math.abs(index-last.indices.at(-1))===1)last.indices.push(index);else groups.push({level,indices:[index]});}
 return groups.map(group=>{const logical=group.indices.sort((a,b)=>a-b).map(i=>mirrors.get(i)||input[i]).join('');return {text:logical,start:group.indices[0],end:group.indices.at(-1)+1,rtl:!!(group.level%2),run:raw.layout(logical,undefined,undefined,undefined,group.level%2?'rtl':'ltr')};});
}
export function shapedWidth(text,raw,size,direction){return shapedRuns(text,raw,direction).reduce((total,{run})=>total+run.positions.reduce((n,p)=>n+p.xAdvance,0)*size/raw.unitsPerEm,0);}
export function drawShaped(page,text,{font,raw,size,x,y,color,direction='ltr'}){
 const key=page.node.newFontDictionary(font.name,font.ref),scale=size/raw.unitsPerEm;
 page.pushOperators(PDFOperator.of('BDC',[PDFName.of('Span'),page.doc.context.obj({ActualText:PDFHexString.fromText(String(text))})]));
 let cursor=x;
 for(const {text:logical,run} of shapedRuns(text,raw,direction)){
  // encodeText uses the same fontkit shaping and registers every glyph in the subset/ToUnicode map.
  const encoded=font.encodeText(logical).asString();
  if(encoded.length!==run.glyphs.length*4)throw Error('Font shaping could not be encoded safely. Choose another font.');
  for(let i=0;i<run.glyphs.length;i++){
   const position=run.positions[i];
   page.pushOperators(beginText(),setFillingRgbColor(color.red,color.green,color.blue),setFontAndSize(key,size),setTextMatrix(1,0,0,1,cursor+position.xOffset*scale,y+position.yOffset*scale),showText(PDFHexString.of(encoded.slice(i*4,i*4+4))),endText());
   cursor+=position.xAdvance*scale;
  }
 }
 page.pushOperators(PDFOperator.of('EMC'));
}

// Link rectangles follow visual bidi runs, including LTR emails inside RTL paragraphs.
export function shapedLinkRects(text,raw,size,direction,start,end){
 let x=0;const result=[];
 for(const group of shapedRuns(text,raw,direction)){
  const width=group.run.positions.reduce((n,p)=>n+p.xAdvance,0)*size/raw.unitsPerEm;
  const left=Math.max(start,group.start),right=Math.min(end,group.end);
  if(left<right){const before=group.rtl?group.text.slice(right-group.start):group.text.slice(0,left-group.start);const content=group.text.slice(left-group.start,right-group.start);result.push({x:x+shapedWidth(before,raw,size,group.rtl?'rtl':'ltr'),width:shapedWidth(content,raw,size,group.rtl?'rtl':'ltr')});}
  x+=width;
 }
 return result;
}
