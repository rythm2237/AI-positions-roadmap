// Offset-based formatting; never store arbitrary HTML from a contenteditable.
export function inlineRuns(section,field='text',start=0,end){
 const text=String(field==='title'?(section.displayTitle||section.title):section.text||'');end=Math.min(end??text.length,text.length);
 const styles=(section.inlineStyles?.[field]||[]).slice(-200).filter(s=>Number.isInteger(s.start)&&Number.isInteger(s.end)&&s.start>=0&&s.end>s.start&&s.end<=text.length);
 const cuts=[...new Set([start,end,...styles.flatMap(s=>[Math.max(start,Math.min(end,s.start)),Math.max(start,Math.min(end,s.end))])])].sort((a,b)=>a-b);
 return cuts.slice(0,-1).map((a,i)=>{const b=cuts[i+1],style={};for(const s of styles.filter(s=>s.start<=a&&s.end>=b)){if(typeof s.font==='string'&&/^[a-z0-9-]+$/i.test(s.font))style.font=s.font;if(/^#[0-9a-f]{6}$/i.test(s.color))style.color=s.color;if(Number.isFinite(s.size))style.size=Math.max(8,Math.min(36,s.size));if(typeof s.bold==='boolean')style.bold=s.bold;}return {text:text.slice(a,b),start:a,end:b,...style};});
}
export function formatSelection(section,field,start,end,style){
 const text=field==='title'?(section.displayTitle||section.title):section.text;
 if(start<0||end>text.length||end<=start)return false;
 section.inlineStyles={...section.inlineStyles,[field]:[...(section.inlineStyles?.[field]||[]),{start,end,...style}].slice(-200)};return true;
}
export function editStyledText(section,field,next){
 const old=String(field==='title'?(section.displayTitle||section.title):section.text||'');let prefix=0,suffix=0;
 while(prefix<old.length&&prefix<next.length&&old[prefix]===next[prefix])prefix++;
 while(suffix<old.length-prefix&&suffix<next.length-prefix&&old[old.length-1-suffix]===next[next.length-1-suffix])suffix++;
 const removedEnd=old.length-suffix,insertedEnd=next.length-suffix,delta=next.length-old.length;
 if(section.inlineStyles?.[field])section.inlineStyles[field]=section.inlineStyles[field].map(s=>s.end<=prefix?s:s.start>=removedEnd?{...s,start:s.start+delta,end:s.end+delta}:{...s,start:Math.min(s.start,prefix),end:Math.max(insertedEnd,s.end+delta)}).filter(s=>s.start>=0&&s.end>s.start&&s.end<=next.length);
 if(field==='title')section.displayTitle=next;else section.text=next;
}
