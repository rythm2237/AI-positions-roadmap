// Geometry affects reading order only. No names or other facts are inferred.
export function pageText(raw,width,height){
 const items=raw.filter(i=>'str' in i&&i.str.trim()&&!(/^\s*\d+\s*$/.test(i.str)&&i.transform[5]<35));
 const lines=list=>{const sorted=[...list].sort((a,b)=>Math.abs(b.transform[5]-a.transform[5])>3?b.transform[5]-a.transform[5]:a.transform[4]-b.transform[4]);let y=null,out='';for(const i of sorted){if(y!==null&&Math.abs(y-i.transform[5])>3)out+='\n';else if(out&&!out.endsWith('\n'))out+=' ';out+=i.str.trim();y=i.transform[5];}return out;};
 const body=items.filter(i=>i.transform[5]<height*.93&&i.transform[5]>35);let best=null,run=0;
 for(let x=Math.floor(width*.2);x<width*.78;x++){if(!body.some(i=>i.transform[4]<x&&i.transform[4]+i.width>x)){run++;if(run>width*.025){const center=x-run/2,left=body.filter(i=>i.transform[4]+i.width<center),right=body.filter(i=>i.transform[4]>center);if(left.length>=4&&right.length>=4&&(!best||run>best.run))best={run,x:center};}}else run=0;}
 if(!best)return lines(items);
 const sideLeft=best.x<width*.5,left=items.filter(i=>i.transform[4]+i.width<=best.x),right=items.filter(i=>i.transform[4]>=best.x),spanning=items.filter(i=>!left.includes(i)&&!right.includes(i));
 const main=sideLeft?right:left,side=sideLeft?left:right;
 const sizes=body.map(i=>Math.abs(i.transform[3])).sort((a,b)=>a-b),median=sizes[Math.floor(sizes.length/2)]||10;
 const name=main.filter(i=>Math.abs(i.transform[3])>median*1.35&&i.transform[5]>height*.65).sort((a,b)=>b.transform[5]-a.transform[5])[0];
 let mast=[];if(name){const heading=main.filter(i=>i.transform[5]<name.transform[5]&&/^(summary|profile|professional summary|experience|work experience|education)$/i.test(i.str.trim())).sort((a,b)=>b.transform[5]-a.transform[5])[0];mast=main.filter(i=>i.transform[5]>= (heading?heading.transform[5]+3:name.transform[5]-55));}
 return [lines([...spanning,...mast]),lines(side),lines(main.filter(i=>!mast.includes(i)))].filter(Boolean).join('\n');
}
