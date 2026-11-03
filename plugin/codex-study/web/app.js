const $ = id => document.getElementById(id);
const el = (tag, text, cls) => { const n = document.createElement(tag); if(text!==undefined)n.textContent=text;if(cls)n.className=cls;return n; };
const button = (text, fn, cls) => { const n=el('button',text,cls);n.type='button';n.onclick=fn;return n; };
const kinds={word:'单词',phrase:'短语',sentence:'句子',question:'疑问'};
let data, current, part='reading', tool='tray', selected=null, seq=0, connected=false, saveQueue=Promise.resolve();
const pending=new Map();
const local = location.protocol === 'http:' && location.hostname === '127.0.0.1';
function toast(text){$('toast').textContent=text;$('toast').style.display='block';clearTimeout(toast.timer);toast.timer=setTimeout(()=>$('toast').style.display='none',5000);}
function rpc(method, params={}) {
  const id=++seq;
  return new Promise((resolve,reject)=>{
    const timeout=setTimeout(()=>{pending.delete(id);reject(Error('连接超时；内容仍保留在界面中，请重试'));},params?.arguments?.action==='import_preview'?300000:20000);
    pending.set(id,{resolve:v=>{clearTimeout(timeout);resolve(v);},reject:e=>{clearTimeout(timeout);reject(e);}});
    window.parent.postMessage({jsonrpc:'2.0',id,method,params},'*');
  });
}
window.addEventListener('message',e=>{
  if(e.source!==window.parent || e.data?.jsonrpc!=='2.0')return;
  const m=e.data;
  if(m.id!==undefined && pending.has(m.id)){const p=pending.get(m.id);pending.delete(m.id);m.error?p.reject(Error(m.error.message)):p.resolve(m.result);return;}
  if(m.method==='ui/notifications/tool-result' && m.params?.structuredContent?.units){data=m.params.structuredContent;ready();}
});
async function call(name,args={}) {
  let response;
  if(local){const r=await fetch('/api',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({name,args})});if(!r.ok)throw Error('本地连接失败');response=await r.json();}
  else response=await rpc('tools/call',{name,arguments:args});
  if(response.isError)throw Error(response.content?.[0]?.text??'操作未完成');
  return response.structuredContent;
}
async function refresh(){try{data=await call('read_study',{examId:data?.exam?.id});ready();}catch(e){toast(e.message);$('save').textContent='读取失败，请重试';}}
function act(action,args={},rerender=true){
  $('save').textContent='正在保存…';
  const examId=data.exam.id;
  const work=saveQueue.then(async()=>{
    const next=await call('study_action',{action,args:{...args,examId}}); data=next;
    $('save').textContent='已保存到本机';if(rerender)render();return next;
  });
  saveQueue=work.catch(e=>{$('save').textContent='保存失败，请重试';toast(e.message);});return work;
}
function unit(){return data.units.find(u=>u.id===current)??data.units[0];}
function ready(){if(!data.units.some(u=>u.id===current))current=null;if(!current)current=data.units.find(u=>u.part==='reading')?.id??data.units[0].id;part=unit().part;render();$('save').textContent='记录已读取';}
function render(){
  const y=window.scrollY;
  $('exam').replaceChildren();for(const paper of data.catalog??[data.exam]){const o=el('option',paper.title);o.value=paper.id;$('exam').append(o);}$('exam').value=data.exam.id;
  document.querySelector('.eyebrow').textContent=`CET–4 · ${data.exam.id}`;
  $('parts').replaceChildren();
  for(const [id,label] of [['writing','写作'],['listening','听力'],['reading','阅读'],['translation','翻译']]){
    if(!data.units.some(u=>u.part===id))continue;
    const b=button(label,()=>{part=id;current=data.units.find(u=>u.part===id).id;selected=null;$('selection').hidden=true;render();window.scrollTo(0,0);});b.setAttribute('aria-pressed',String(part===id));$('parts').append(b);
  }
  $('unit').replaceChildren();for(const u of data.units.filter(u=>u.part===part)){const o=el('option',u.label.split(' / ').pop());o.value=u.id;$('unit').append(o);}$('unit').value=current;
  $('tools').replaceChildren();for(const [id,label] of [['tray',`待讨论 ${data.state.tray.length||''}`],['marks',`标记 ${data.state.marks.length||''}`],['notes','笔记'],['vocab','生词表']]){
    const b=button(label,()=>{tool=id;renderInspector();renderTools();});b.dataset.tool=id;b.setAttribute('aria-pressed',String(tool===id));$('tools').append(b);
  }
  renderPaper();renderInspector();const u=unit();$('progress').textContent=`本节已答 ${u.questions.filter(q=>data.state.answers[q.no]).length}/${u.questions.length}`;window.scrollTo(0,y);
}
function renderTools(){for(const b of $('tools').children)b.setAttribute('aria-pressed',String(b.dataset.tool===tool));}
function block(b){
  const wrap=el('div');if(b.label)wrap.append(el('div',b.label,'block-label'));
  const p=el('div',undefined,'block'+(b.id.endsWith(':directions')?' directions':''));p.dataset.block=b.id;
  const marks=data.state.marks.filter(m=>m.blockId===b.id);
  const cuts=[...new Set([0,b.text.length,...marks.flatMap(m=>[m.start,m.end])])].sort((a,b)=>a-b);
  for(let i=0;i<cuts.length-1;i++){
    const a=cuts[i],z=cuts[i+1],hits=marks.filter(m=>m.start<z&&m.end>a);
    if(!hits.length)p.append(document.createTextNode(b.text.slice(a,z)));
    else{const m=el('mark',b.text.slice(a,z),hits.some(h=>h.by==='assistant')?'assistant':'');m.dataset.marks=hits.map(h=>h.id).join(' ');m.title=hits.map(h=>`${h.id} · ${h.by==='assistant'?'助手':'我'} ${h.note??''}`).join('\n');p.append(m);}
  }
  wrap.append(p);return wrap;
}
function renderPaper(){
  const u=unit(),main=$('paper');main.replaceChildren();
  const row=el('div',undefined,'section-actions');
  const revealed=data.state.revealed.includes(u.id);
  if(u.questions.length)row.append(button(revealed?'收起答案':'完成后核对答案',()=>act('reveal',{unit:u.id,show:!revealed}).catch(()=>{})));
  row.append(el('span',u.part==='listening'?'尚未导入音频 · 当前可浏览题目、作答和标记':'划选原文，即可标记或收集'));main.append(row);
  if(u.wordBank.length){const bank=el('div',undefined,'bank');for(const w of u.wordBank)bank.append(el('span',`${w.letter} ${w.word}`));main.append(bank);}
  const rendered=new Set();
  for(const b of u.blocks){
    const match=b.id.match(/:q(\d+)(?:-[A-D])?$/);
    if(!match){main.append(block(b));continue;}
    const no=Number(match[1]);if(rendered.has(no))continue;rendered.add(no);
    const q=u.questions.find(q=>q.no===no);main.append(question(q,u, revealed));
  }
  for(const q of u.questions)if(!rendered.has(q.no))main.append(question(q,u,revealed));
  if(['writing','translation'].includes(u.kind)){
    const area=el('textarea',undefined,'draft');area.placeholder=u.kind==='writing'?'写下你的作文，离开输入框时自动保存…':'写下你的译文，离开输入框时自动保存…';area.value=data.state.drafts[u.id]??'';area.setAttribute('aria-label',u.kind==='writing'?'作文草稿':'翻译草稿');
    const count=el('p','', 'count');const update=()=>{count.textContent=u.kind==='writing'?`${area.value.trim().split(/\s+/).filter(Boolean).length} 词 · 目标 120–180 词`:`${area.value.length} 字符`;};update();area.oninput=()=>{update();$('save').textContent='草稿待保存 · 离开输入框或点保存';};
    area.onchange=()=>act('draft',{unit:u.id,text:area.value},false).catch(()=>{});main.append(el('h2','我的草稿'),area,count,button('保存草稿',()=>act('draft',{unit:u.id,text:area.value},false).catch(()=>{})));
  }
}
function question(q,u,revealed){
  const card=el('section',undefined,'question');card.dataset.question=q.no;card.append(el('h3',`第 ${q.no} 题`));
  const stem=u.blocks.find(b=>b.id.endsWith(`:q${q.no}`));if(stem)card.append(block(stem));
  if(q.options){const opts=el('div',undefined,'options');for(const [k,v] of Object.entries(q.options)){
    const label=el('div',undefined,'option');const input=el('input');input.type='radio';input.setAttribute('aria-label',`第 ${q.no} 题 ${k}`);input.name=`q${q.no}`;input.value=k;input.checked=data.state.answers[q.no]===k;input.onchange=()=>act('answer',{no:q.no,value:k}).catch(()=>{});
    const b=u.blocks.find(b=>b.id.endsWith(`:q${q.no}-${k}`));label.append(input,el('span',k),block({...b,label:''}));opts.append(label);
  }card.append(opts);}else{
    const select=el('select');select.setAttribute('aria-label',`第 ${q.no} 题答案`);const empty=el('option','请选择');empty.value='';select.append(empty);
    for(const w of u.wordBank.length?u.wordBank:u.paragraphLetters.map(letter=>({letter,word:`段落 ${letter}`}))){const o=el('option',`${w.letter} · ${w.word}`);o.value=w.letter;select.append(o);}select.value=data.state.answers[q.no]??'';select.onchange=()=>act('answer',{no:q.no,value:select.value}).catch(()=>{});card.append(select);
  }
  if(revealed && !q.answer)card.append(el('p','此题暂无参考答案，仅保存作答。','hint'));
  if(revealed && q.answer){const given=data.state.answers[q.no];card.append(el('div',`参考答案 ${q.answer} · ${!given?'未答':given===q.answer?'回答正确':'本次选择 '+given}`,'answer'+(given&&given!==q.answer?' wrong':'')));}
  return card;
}
function gotoMark(m){current=m.unit;part=unit().part;render();requestAnimationFrame(()=>{const p=[...document.querySelectorAll('[data-block]')].find(n=>n.dataset.block===m.blockId);p?.scrollIntoView({behavior:'smooth',block:'center'});p?.querySelectorAll('mark').forEach(n=>{if(n.dataset.marks.split(' ').includes(m.id)){n.classList.add('flash');setTimeout(()=>n.classList.remove('flash'),2500);}});});}
function renderInspector(){
  renderTools();const box=$('inspector');box.replaceChildren();
  if(tool==='tray'){
    box.append(el('h2','先积累，再一起问'),el('p','可以多次划选，补上自己的理解，最后统一讨论。发送后仍保留条目。','hint'));
    if(!data.state.tray.length)box.append(el('p','还没有收集内容。在原文上划选一段文字试试。','empty'));
    for(const item of data.state.tray){const c=el('div',undefined,'card');c.append(el('small',`${kinds[item.kind]} · ${item.unit}`),el('blockquote',item.text));const t=el('textarea');t.placeholder='我目前的理解 / 想问什么';t.setAttribute('aria-label',`对 ${item.text} 的理解`);t.value=item.thought;t.onchange=()=>act('thought',{id:item.id,text:t.value},false).catch(()=>{});c.append(t,button('移除',()=>act('remove',{collection:'tray',id:item.id}).catch(()=>{})));box.append(c);}
    if(data.state.tray.length){box.append(button('整理本次讨论',()=>showMessage(), 'primary'),button('存入两张生词表',async()=>{try{const next=await act('vocab');toast(`新增 ${next.result.added.length} 条，已存在 ${next.result.skipped.length} 条`);}catch{}}));}
  }else if(tool==='marks'){
    box.append(el('h2','原文标记'),el('p','黄色是我的标记，浅绿色是助手标记。编号可以直接在聊天中引用。','hint'));
    if(!data.state.marks.length)box.append(el('p','划选原文后，点“标记”。','empty'));
    for(const m of data.state.marks){const c=el('div',undefined,'card');c.append(el('small',`${m.id} · ${m.by==='assistant'?'助手':'我'}`),el('blockquote',m.text));if(m.note)c.append(el('p',m.note));c.append(button('回到原文',()=>gotoMark(m)),button('引用记笔记',()=>{tool='notes';renderInspector();const check=[...box.querySelectorAll('input[type=checkbox]')].find(n=>n.value===m.id);if(check)check.checked=true;}),button('删除',()=>act('remove',{collection:'marks',id:m.id}).catch(()=>{})));box.append(c);}
  }else if(tool==='notes'){
    box.append(el('h2','记下思路'));
    const t=el('textarea');t.id='note-text';t.placeholder='我为什么选这个答案？哪一处没看懂？';t.setAttribute('aria-label','笔记内容');box.append(t);
    const refs=el('div',undefined,'note-refs');for(const m of data.state.marks){const l=el('label');const c=el('input');c.type='checkbox';c.value=m.id;l.append(c,document.createTextNode(` ${m.id} · ${m.text.slice(0,38)}`));refs.append(l);}box.append(refs,button('保存笔记',async()=>{const text=t.value;const ids=[...refs.querySelectorAll('input:checked')].map(c=>c.value);try{await act('note',{unit:current,text,refs:ids});}catch{}},'primary'));
    for(const n of data.state.notes){const c=el('div',undefined,'card');c.append(el('small',`${n.id} · ${n.unit}`),el('p',n.text));for(const id of n.refs){const m=data.state.marks.find(m=>m.id===id);if(m)c.append(button(id,()=>gotoMark(m),'ref'));}c.append(button('删除',()=>act('remove',{collection:'notes',id:n.id}).catch(()=>{})));box.append(c);}
  }else{
    box.append(el('h2','生词与短语'),el('p','标记后先收集到待讨论区，再点“存入两张生词表”。现有文件按原样保留，重复词条跳过。','hint'),el('p',`保存目录：${data.root}`,'hint'),el('p','不会的单词表.csv\n不会的短语表.csv','hint'),el('p','句子保存在刷题笔记中。这里不自动填入未经讲解的释义。','hint'));
    for(const kind of ['word','phrase','sentence']){box.append(el('h2',kinds[kind]));for(const item of data.state.tray.filter(t=>t.kind===kind))box.append(el('p',item.text));}
  }
}
function messageText(){return [`我正在做 ${data.exam.title}（试卷编号 ${data.exam.id}）。请先理解我的思路，逐条回应下面的问题；不要提前透露未讨论题目的答案。词句结合原文讲解；有必要时用标记编号引用。`, '',...data.state.tray.flatMap((t,i)=>[`${i+1}. [${kinds[t.kind]}] ${t.text}`,`出处：${t.unit} / ${t.blockId} [${t.start}, ${t.end})`,t.thought?`我的理解或问题：${t.thought}`:'','']),data.state.marks.length?`可引用标记：${data.state.marks.map(m=>`${m.id}: ${m.text}`).join('；')}`:''].join('\n');}
async function showMessage(){
  await saveQueue;const box=$('inspector');const area=el('textarea');area.id='send-preview';area.setAttribute('aria-label','本次讨论消息');area.value=messageText();box.append(el('h2','本次讨论 · 发送前可编辑'),area);
  const send=button(local?'复制本次讨论':'发送到当前聊天',async()=>{try{
    if(local){await navigator.clipboard.writeText(area.value);toast('已复制，粘贴到左侧聊天即可');}
    else {await rpc('ui/message',{role:'user',content:[{type:'text',text:area.value}]});toast('已提交到聊天；积累条目仍保留');}
  }catch(e){toast(e.message);area.focus();area.select();}},'primary');box.append(send);area.scrollIntoView({behavior:'smooth',block:'center'});
}
function capture(){
  const s=window.getSelection();if(!s || s.isCollapsed)return;const r=s.getRangeAt(0);
  const parent=n=>n.nodeType===Node.ELEMENT_NODE?n:n.parentElement;
  const first=parent(r.startContainer)?.closest('[data-block]'),last=parent(r.endContainer)?.closest('[data-block]');
  if(!first || first!==last)return;
  const b=unit().blocks.find(b=>b.id===first.dataset.block);if(!b)return;
  const pre=document.createRange();pre.selectNodeContents(first);pre.setEnd(r.startContainer,r.startOffset);
  const start=pre.toString().length,end=start+r.toString().length,text=b.text.slice(start,end);
  if(!text.trim())return;selected={blockId:b.id,start,end,text};$('selected-text').textContent=text;$('selection').hidden=false;
}
$('paper').addEventListener('mouseup',()=>setTimeout(capture,0));$('paper').addEventListener('keyup',capture);
$('selection').addEventListener('pointerdown',e=>e.preventDefault());
for(const b of document.querySelectorAll('[data-take]'))b.onclick=async()=>{
  if(!selected)return;const a={...selected};const kind=b.dataset.take;
  try{if(kind==='mark') {await act('mark',a);tool='marks';renderInspector();}
    else if(kind==='note'){const next=await act('mark',a);tool='notes';renderInspector();const c=[...$('inspector').querySelectorAll('input[type=checkbox]')].find(c=>c.value===next.result.id);if(c)c.checked=true;$('note-text').focus();}
    else {await act('collect',{...a,kind});tool='tray';renderInspector();toast('已加入待讨论区');}
    $('selection').hidden=true;window.getSelection()?.removeAllRanges();selected=null;
  }catch{ }
};
$('cancel-selection').onclick=()=>{$('selection').hidden=true;selected=null;window.getSelection()?.removeAllRanges();};
$('unit').onchange=()=>{current=$('unit').value;$('selection').hidden=true;selected=null;render();window.scrollTo(0,0);};
$('size').onchange=()=>document.documentElement.style.setProperty('--font',`${$('size').value}px`);
$('reload').onclick=()=>refresh();
(async()=>{
  try{
    if(!local){await rpc('ui/initialize',{protocolVersion:'2026-01-26',appInfo:{name:'cet4-study',version:'0.1.0'},appCapabilities:{},capabilities:{}});window.parent.postMessage({jsonrpc:'2.0',method:'ui/notifications/initialized'},'*');}
    connected=true;$('connection').textContent=local?'本地预览 · 聊天用复制':'已连接 Codex';await refresh();
  }catch(e){$('connection').textContent='连接未完成';toast(e.message);}
})();

let importDraft=null;
$('exam').onchange=async()=>{
 const id=$('exam').value;
 try{await saveQueue;data=await call('read_study',{examId:id});current=null;ready();$('selection').hidden=true;selected=null;window.scrollTo(0,0);}catch(e){toast(e.message);$('exam').value=data.exam.id;}
};
$('import-open').onclick=()=>{$('import-panel').hidden=false;$('practice').hidden=true;};
$('import-close').onclick=()=>{$('import-panel').hidden=true;$('practice').hidden=false;};
async function importCall(action,args){return call('study_action',{action,args});}
$('import-extract').onclick=async()=>{
 const b=$('import-extract');b.disabled=true;importDraft=null;$('import-result').replaceChildren();$('import-status').textContent='正在提取并识别；扫描件首次识别可能需要几分钟…';
 try{
  const file=$('import-file').files[0];let args;
  if(file){if(file.size>30*1024*1024)throw Error('PDF 不能超过 30MB');const bytes=new Uint8Array(await file.arrayBuffer());let binary='';for(let i=0;i<bytes.length;i+=32768)binary+=String.fromCharCode(...bytes.subarray(i,i+32768));args={pdfBase64:btoa(binary),filename:file.name};}
  else args={path:$('import-path').value.trim()};
  if(!file&&!args.path)throw Error('请先选择 PDF 或填写路径');
  importDraft=await importCall('import_preview',args);renderImport();$('import-status').textContent='识别完成，尚未加入试卷库。';
 }catch(e){$('import-status').textContent=e.message;}finally{b.disabled=false;}
};
function renderImport(){
 const d=importDraft,box=$('import-result');box.replaceChildren();
 box.append(el('h2','识别预览'),el('p',`${d.sourceName} · ${d.pages} 页 · ${d.method==='ocr'?'本机 OCR':'文本提取'} · ${d.report.questionCount} 道题 · ${d.report.answerCount} 个答案`,'hint'));
 const id=el('input');id.value=d.paper.id;id.setAttribute('aria-label','新试卷编号');
 const title=el('input');title.value=d.paper.title;title.setAttribute('aria-label','新试卷标题');
 const idLabel=el('label','试卷编号');idLabel.append(id);const titleLabel=el('label','试卷标题');titleLabel.append(title);box.append(idLabel,titleLabel);
 for(const msg of d.report.errors)box.append(el('p',`需修正：${msg}`,'import-error'));
 for(const msg of d.report.warnings)box.append(el('p',msg,'hint'));
 for(const part of d.paper.parts??[]){
  const details=el('details');details.append(el('summary',part.label??part.id));
  const walk=o=>{if(!o||typeof o!=='object')return;for(const [k,v] of Object.entries(o)){
   if(['directions','prompt','chinese','passage','text','stem','intro','passageTitle'].includes(k)&&typeof v==='string')details.append(el('p',v,'preview-text'));
   if(k==='no')details.append(el('h3',`第 ${v} 题`));
   if(k==='options')for(const [letter,text] of Object.entries(v))details.append(el('p',`${letter}) ${text}`,'preview-text'));
   if(k==='wordBank')details.append(el('p',v.map(w=>`${w.letter}) ${w.word}`).join(' · '),'preview-text'));
   if(['sections','questions','groups','passages','paragraphs'].includes(k)&&Array.isArray(v))v.forEach(walk);
  }};walk(part);box.append(details);
 }
 const raw=el('details');raw.append(el('summary','查看提取原文（包含卷末答案，请按需展开）'),el('pre',d.text));box.append(raw);
 const advanced=el('details');const json=el('textarea');json.setAttribute('aria-label','识别结果 JSON');json.value=JSON.stringify(d.paper,null,2);json.className='import-json';advanced.append(el('summary','修正识别结果（也可交给聊天中的助手）'),json);box.append(advanced);
 box.append(button('更新预览',async()=>{try{const paper=JSON.parse(json.value);paper.id=id.value.trim();paper.title=title.value.trim();importDraft=await importCall('import_update',{importId:d.importId,paper});renderImport();toast('预览已更新');}catch(e){toast(e.message);}}));
 const help=button(local?'复制核对请求':'交给助手核对',async()=>{
  const prompt=`请帮我核对新试卷导入草稿 ${d.importId}。先调用 study_action(action=import_read,args={importId:"${d.importId}"}) 读取提取原文与识别结果，逐项检查题号、题干、选项、段落及参考答案，必要时用 import_update 修正。不要猜测缺失内容，也不要替我确认导入；修正后让我在面板核对。当前问题：${d.report.errors.join('；')||'请核对内容是否准确'}。`;
  try{if(local){await navigator.clipboard.writeText(prompt);toast('核对请求已复制，粘贴到聊天即可');}else await rpc('ui/message',{role:'user',content:[{type:'text',text:prompt}]});}catch(e){toast(e.message);}
 });box.append(help,el('p',`导入草稿编号：${d.importId}`,'hint'),button('刷新识别预览',async()=>{try{importDraft=await importCall('import_read',{importId:d.importId});renderImport();}catch(e){toast(e.message);}}));
 const label=el('label',undefined,'import-confirm');const check=el('input');check.type='checkbox';check.setAttribute('aria-label','我已核对题目与选项，确认导入');label.append(check,document.createTextNode('我已核对题目与选项，确认导入'));box.append(label);
 const commit=button('加入试卷库并打开',async()=>{
  if(!check.checked){toast('请先核对识别预览并勾选确认');return;}
  if(id.value.trim()!==d.paper.id||title.value.trim()!==d.paper.title||json.value!==JSON.stringify(d.paper,null,2)){toast('请先点“更新预览”保存修改');return;}
  commit.disabled=true;
  try{await saveQueue;const next=await importCall('import_commit',{importId:d.importId,confirmed:true});data=next;current=null;ready();$('import-close').click();toast('试卷已加入，练习记录将单独保存');}catch(e){toast(e.message);}finally{commit.disabled=Boolean(d.report.errors.length);}
 },'primary');commit.disabled=Boolean(d.report.errors.length);box.append(commit);
}
