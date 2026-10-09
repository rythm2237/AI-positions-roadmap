import {sectionKind} from './contentEngine.mjs';
// Geometry affects reading order only. No names or other facts are inferred.
export function pageTextParts(raw,width,height,inheritedGutter=null){
 const items=raw.filter(i=>'str' in i&&i.str.trim()&&!(/^\s*\d+\s*$/.test(i.str)&&i.transform[5]<35));
 const lines=list=>{const sorted=[...list].sort((a,b)=>Math.abs(b.transform[5]-a.transform[5])>3?b.transform[5]-a.transform[5]:a.transform[4]-b.transform[4]);let y=null,out='';for(const i of sorted){if(y!==null&&Math.abs(y-i.transform[5])>3)out+='\n';else if(out&&!out.endsWith('\n'))out+=' ';out+=i.str.trim();y=i.transform[5];}return out;};
 const body=items.filter(i=>i.transform[5]<height*.93&&i.transform[5]>35);let best=null,run=0,previous=-1;
 // A masthead or a long sidebar URL may cross a real column gutter. Requiring
 // an entirely empty vertical strip merged both columns in those documents.
 for(let x=Math.floor(width*.2);x<width*.78;x++){
  const crossing=body.filter(i=>i.transform[4]<x&&i.transform[4]+i.width>x).length;
  run=crossing===previous?run+1:1;previous=crossing;
  if(crossing>Math.max(3,body.length*.08)||run<=width*.025)continue;
  const center=x-run/2,left=body.filter(i=>i.transform[4]+i.width<=center),right=body.filter(i=>i.transform[4]>=center);
  const paired=left.filter(l=>right.some(r=>Math.abs(l.transform[5]-r.transform[5])<=3)).length;
  if(left.length>=4&&right.length>=4&&(crossing===0||paired>=3)&&(!best||crossing<best.crossing||crossing===best.crossing&&run>best.run))best={run,x:center,crossing};
 }
 if(!best&&inheritedGutter!==null){const crossing=body.filter(i=>i.transform[4]<inheritedGutter&&i.transform[4]+i.width>inheritedGutter).length;if(body.length>=4&&crossing<=Math.max(2,body.length*.08))best={x:inheritedGutter};}
 if(!best)return {columns:false,header:'',side:'',main:lines(items)};
 const sizes=body.map(i=>Math.abs(i.transform[3])).sort((a,b)=>a-b),median=sizes[Math.floor(sizes.length/2)]||10;
 const hasMasthead=items.some(i=>Math.abs(i.transform[3])>median*1.6&&i.transform[5]>height*.65&&sectionKind(i.str.trim())==='other');
 const firstHeading=hasMasthead?items.filter(i=>sectionKind(i.str.trim().replace(/:$/, ''))!=='other'&&i.str.trim()!=='Header').sort((a,b)=>b.transform[5]-a.transform[5])[0]:null;
 const spanning=firstHeading?items.filter(i=>i.transform[5]>firstHeading.transform[5]+3):[];
 const columnItems=items.filter(i=>!spanning.includes(i));
 // Below the masthead, text belongs to the column where it starts, including
 // overflowing contact links. Never interleave equal-baseline column lines.
 const sideLeft=best.x<width*.5,left=columnItems.filter(i=>i.transform[4]<best.x),right=columnItems.filter(i=>i.transform[4]>=best.x);
 const main=sideLeft?right:left,side=sideLeft?left:right;
 const name=main.filter(i=>Math.abs(i.transform[3])>median*1.35&&i.transform[5]>height*.65).sort((a,b)=>b.transform[5]-a.transform[5])[0];
 let mast=[];if(name){const heading=main.filter(i=>i.transform[5]<name.transform[5]&&/^(summary|profile|professional summary|experience|work experience|education)$/i.test(i.str.trim())).sort((a,b)=>b.transform[5]-a.transform[5])[0];mast=main.filter(i=>i.transform[5]>= (heading?heading.transform[5]+3:name.transform[5]-55));}
 return {columns:true,gutter:best.x,header:lines([...spanning,...mast]),side:lines(side),main:lines(main.filter(i=>!mast.includes(i)))};
}
export function pageText(raw,width,height){const p=pageTextParts(raw,width,height);return [p.header,p.side,p.main].filter(Boolean).join('\n');}
// Continue each column across pages before moving to the next column. Otherwise
// a sidebar certificate on page two becomes part of page one's experience.
export function documentText(pages){
 const output=[];let group=[];
 const flush=()=>{if(group.length)output.push(...['header','side','main'].map(key=>group.map(p=>p[key]).filter(Boolean).join('\n')).filter(Boolean));group=[];};
 let previousWidth=null;
 for(const page of pages){const p=pageTextParts(page.items,page.width,page.height,previousWidth===page.width?group.at(-1)?.gutter:null);if(p.columns)group.push(p);else{flush();output.push(p.main);}previousWidth=page.width;}flush();return output.join('\n');
}
