let previewEditing=false,previewSelection=null;
function previewText(section,field='text',start=0,end){
 const runs=window.CareerDocs.inlineRuns(section,field,start,end);
 return runs.map(r=>{const f=window.CareerDocs.FONTS.find(f=>f.id===r.font);const css=[f?'font-family:'+JSON.stringify(f.family):'',r.size?'font-size:'+r.size+'pt':'',r.color?'color:'+r.color:'',r.bold!==undefined?'font-weight:'+(r.bold?700:400):''].filter(Boolean).join(';');return '<span'+(css?' style="'+esc(css)+'"':'')+'>'+esc(r.text)+'</span>';}).join('');
}
function previewEditToolbar(){return '<div class="preview-edit-toolbar"><button id="togglePreviewEdit" aria-pressed="'+previewEditing+'">'+(previewEditing?'Finish editing':'Edit on CV preview')+'</button>'+(previewEditing?'<span>Select text on the CV, then format it.</span><select id="inlineFont" aria-label="Selected text font"><option value="">Font</option>'+window.CareerDocs.fontsForLanguage(window.CareerDocs.FONTS,app().language).map(f=>'<option value="'+esc(f.id)+'">'+esc(f.label)+'</option>').join('')+'</select><input id="inlineSize" type="number" min="8" max="36" step="0.5" placeholder="pt" aria-label="Selected text size"><input id="inlineColor" type="color" value="#234b55" aria-label="Selected text color"><button id="inlineBold">Bold</button>':'')+'</div>';}
function installPreviewEditor(){const previewEditorBase=designAdvancedPanel;designAdvancedPanel=function(){return previewEditToolbar()+'<details><summary>Versions & advanced section management</summary>'+previewEditorBase()+'</details>';};const previewBindBase=bindEnhancements;bindEnhancements=function(){previewBindBase();bindPreviewEditor();};}
function bindPreviewEditor(){
 if($('togglePreviewEdit'))$('togglePreviewEdit').onclick=()=>{previewEditing=!previewEditing;previewSelection=null;render();};
 if(!previewEditing)return;
 document.querySelectorAll('#livePreview [data-cv-edit]').forEach(el=>{
  el.contentEditable='plaintext-only';el.spellcheck=true;
  el.onfocus=()=>snapshot();
  el.oninput=()=>{const s=app().cv.find(s=>s.id===el.dataset.cvEdit);if(!s)return;const field=el.dataset.cvField;
   const text=el.innerText??el.textContent;if(field==='title')s.displayTitle=text;else if(field==='name')s.text=[text,...s.text.split('\n').slice(1)].join('\n');else if(field==='contacts')s.text=s.text.split('\n')[0]+'\n'+text;else s.text=text;
   if(s.inlineStyles)delete s.inlineStyles[field==='title'?'title':'text'];app().final=false;app().pendingCVPlan=null;app().measuredPages=null;save();
  };
  el.onpaste=e=>{e.preventDefault();document.execCommand('insertText',false,e.clipboardData.getData('text/plain'));};
  el.onmouseup=el.onkeyup=()=>{const sel=window.getSelection();if(!sel?.rangeCount||sel.isCollapsed)return;const range=sel.getRangeAt(0);if(!el.contains(range.startContainer)||!el.contains(range.endContainer))return;const before=range.cloneRange();before.selectNodeContents(el);before.setEnd(range.startContainer,range.startOffset);previewSelection={id:el.dataset.cvEdit,field:el.dataset.cvField,start:before.toString().length,end:before.toString().length+range.toString().length};};
 });
 const apply=style=>{if(!previewSelection)return toast('Select text in the CV preview first.',true);const p=previewSelection,s=app().cv.find(s=>s.id===p.id);if(!s)return;snapshot();const offset=p.field==='contacts'?s.text.split('\n')[0].length+1:0;window.CareerDocs.formatSelection(s,p.field==='title'?'title':'text',p.start+offset,p.end+offset,style);app().final=false;app().measuredPages=null;save();$('livePreview').innerHTML=preview(app().cv);bindPreviewEditor();watchPreviews();};
 if($('inlineFont'))$('inlineFont').onchange=e=>{if(e.target.value)apply({font:e.target.value});};
 if($('inlineSize'))$('inlineSize').onchange=e=>apply({size:Number(e.target.value)});
 if($('inlineColor'))$('inlineColor').onchange=e=>apply({color:e.target.value});
 if($('inlineBold'))$('inlineBold').onclick=()=>apply({bold:true});
}
