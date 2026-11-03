import { readFile, writeFile, mkdir, stat, realpath, rename, rm } from 'node:fs/promises';
import path from 'node:path';
import { randomUUID, createHash } from 'node:crypto';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { exam as builtin, safeId, buildUnits } from './store.mjs';
const exec=promisify(execFile);
const tidy=s=>String(s??'').replace(/\f/g,'\n').replace(/[ \t]+/g,' ').replace(/ *\n */g,'\n').trim();
const paragraph=s=>tidy(s).replace(/([^\n])\n([^\n])/g,'$1 $2');
function splitHeadings(text,re){const hits=[...text.matchAll(re)];return hits.map((m,i)=>({key:m[1],text:text.slice(m.index+m[0].length,hits[i+1]?.index??text.length),heading:m[0]}));}
function parseQuestions(text,keys){
 const chunks=splitHeadings(text,/^\s*(\d{1,2})[.、]\s*/gm);
 return chunks.map(c=>{
  const no=Number(c.key),raw=c.text.split(/^\s*Questions?\s+\d/im)[0];
  const lines=raw.split('\n');const opts={};let previous=[],stem=[];
  for(const line of lines){
   if(/^\s*[.．]\s*$/.test(line))continue;
   const markers=[...line.matchAll(/(?:^|\s)([A-D])[)）]\s*/g)];
   if(markers.length){
    if(!Object.keys(opts).length && line.slice(0,markers[0].index).trim())stem.push(line.slice(0,markers[0].index));
    previous=markers.map(m=>({letter:m[1],col:m.index}));
    markers.forEach((m,i)=>{opts[m[1]]=(opts[m[1]]??'')+' '+line.slice(m.index+m[0].length,markers[i+1]?.index??line.length).trim();});
   }else if(previous.length){
    if(previous.length>1){const col=previous[1].col;opts[previous[0].letter]+=' '+line.slice(0,col).trim();opts[previous[1].letter]+=' '+line.slice(col).trim();}
    else opts[previous[0].letter]+=' '+line.trim();
   }else stem.push(line);
  }
  const q={no};if(stem.join('').trim())q.stem=paragraph(stem.join('\n'));
  if(Object.keys(opts).length)q.options=Object.fromEntries(Object.entries(opts).sort().map(([k,v])=>[k,tidy(v)]));
  if(keys[no])q.answer=keys[no];return q;
 });
}
function answerKeys(text){
 const keys={},lines=text.split('\n').map(l=>l.trim()).filter(Boolean);
 for(let i=0;i<lines.length-1;i++){
  if(!/^\d+(?:\s+\d+)*$/.test(lines[i]) || !/^[A-O](?:\s+[A-O])*$/.test(lines[i+1]))continue;
  const numbers=lines[i].split(/\s+/).map(Number),letters=lines[i+1].split(/\s+/);
  if(numbers.length===letters.length)numbers.forEach((n,j)=>{if(n>=1&&n<=55)keys[n]=letters[j];});
 }
 return keys;
}
export function parsePaper(text,id,title){
 const keyStart=text.search(/^\s*(?:KEYS|Answer\s+Keys?|参考答案)\s*$/im);
 const keys=answerKeys(keyStart<0?'':text.slice(keyStart));
 const body=(keyStart<0?text:text.slice(0,keyStart)).replace(/\f/g,'\n');
 const parts=[];
 for(const p of splitHeadings(body,/^\s*Part\s+(IV|III|II|I)\b[^\n]*\n/gm)){
  if(p.key==='I')parts.push({id:'writing',label:'Part I · Writing',kind:'writing',directions:paragraph(p.text).replace(/^Directions:\s*/i,''),prompt:paragraph(p.text).replace(/^Directions:\s*/i,''),wordLimit:{min:120,max:180}});
  if(p.key==='II'){
   const sections=splitHeadings(p.text,/^\s*Section\s+([ABC])\b[^\n]*\n/gm).map(s=>{
    const first=s.text.search(/^\s*(?:Questions?\s+\d|\d+\.)/m),content=first<0?s.text:s.text.slice(first),intro=first<0?'':s.text.slice(0,first);
    const groups=splitHeadings(content,/^\s*(Questions?\s+\d[^\n]*)\n/gm).map((g,i)=>({id:`group-${i+1}`,intro:tidy(g.key),questions:parseQuestions(g.text,keys)}));
    return {id:s.key,label:`Section ${s.key}`,directions:paragraph(intro).replace(/^Directions:\s*/i,''),groups:groups.length?groups:[{id:'group-1',intro:'听力题目',questions:parseQuestions(content,keys)}]};
   });parts.push({id:'listening',label:'Part II · Listening Comprehension',kind:'mcq',sections});
  }
  if(p.key==='III'){
   const sections=[];
   for(const s of splitHeadings(p.text,/^\s*Section\s+([ABC])\b[^\n]*\n/gm)){
    if(s.key==='A'){
     const bankStart=s.text.search(/^\s*A[)）]\s*\S+/m);const before=bankStart<0?s.text:s.text.slice(0,bankStart),bank=bankStart<0?'':s.text.slice(bankStart);
     const wordBank=[...bank.matchAll(/(?:^|\s)([A-O])[)）]\s*([^\s]+)/g)].map(m=>({letter:m[1],word:m[2]})).sort((a,b)=>a.letter.localeCompare(b.letter));
     const gap=before.search(/\n\s*\n/),passage=paragraph(gap<0?before:before.slice(gap)).replace(/_{2,}\s*(\d+)\s*_{2,}/g,'___$1___');
     const numbers=[...passage.matchAll(/___(\d+)___/g)].map(m=>Number(m[1]));
     sections.push({id:'A',label:'Section A · 选词填空',directions:paragraph(gap<0?'':before.slice(0,gap)),passage,wordBank,questions:numbers.map(no=>({no,...(keys[no]?{answer:keys[no]}:{})}))});
    }else if(s.key==='B'){
     const start=s.text.search(/^\s*A[)）]\s/m),qStart=s.text.search(/^\s*36[.、]\s/m);
     const paragraphs=splitHeadings(start<0?'':s.text.slice(start,qStart<0?undefined:qStart),/^\s*([A-O])[)）]\s*/gm).map(p=>({letter:p.key,text:paragraph(p.text)}));
     sections.push({id:'B',label:'Section B · 段落匹配',directions:paragraph(start<0?'':s.text.slice(0,start)),paragraphs,questions:parseQuestions(qStart<0?'':s.text.slice(qStart),keys)});
    }else{
     const passages=splitHeadings(s.text,/^\s*(Passage\s+(?:One|Two|1|2))\s*\n/gmi).map((p,i)=>{
      const at=p.text.search(/^\s*\d{1,2}[.、]\s/m);return {id:`passage-${i+1}`,title:p.key,text:paragraph((at<0?p.text:p.text.slice(0,at)).replace(/^\s*Questions?\s+\d[^\n]*(?:\n|$)/i,'')),questions:parseQuestions(at<0?'':p.text.slice(at),keys)};
     });sections.push({id:'C',label:'Section C · 仔细阅读',directions:paragraph(s.text.split(/Passage\s+(?:One|1)/i)[0]),passages});
    }
   }parts.push({id:'reading',label:'Part III · Reading Comprehension',kind:'reading',sections});
  }
  if(p.key==='IV'){
   const at=p.text.search(/[\u3400-\u9fff]/);parts.push({id:'translation',label:'Part IV · Translation',kind:'translation',directions:paragraph(at<0?p.text:p.text.slice(0,at)),chinese:paragraph(at<0?'':p.text.slice(at)),reference:''});
  }
 }
 return {id,title,parts};
}
export function validatePaper(paper){
 const errors=[],warnings=[];
 try{safeId(paper?.id);}catch(e){errors.push(e.message);}
 if(!paper || typeof paper.title!=='string' || !paper.title.trim())errors.push('缺少试卷标题');
 if(!Array.isArray(paper?.parts)||!paper.parts.length)return {errors:[...errors,'未识别到试卷部分，需要助手核对原文并修正'],warnings,questionCount:0,answerCount:0};
 let all=[];let built=[];
 try{built=buildUnits(paper);}catch{errors.push('试卷结构无效');return {errors,warnings,questionCount:0,answerCount:0};}
 const blockIds=new Set(),unitIds=new Set();
 for(const p of paper.parts){
  if(!['writing','listening','reading','translation'].includes(p.id))errors.push(`未知部分 ${p.id}`);
  if(p.id==='writing' && !p.prompt?.trim())errors.push('写作题目为空');
  if(p.id==='translation' && !p.chinese?.trim())errors.push('翻译原文为空');
 }
 for(const u of built){
  if(unitIds.has(u.id))errors.push(`重复小节 ${u.id}`);unitIds.add(u.id);
  if(u.part==='listening' && !u.questions.length)errors.push(`${u.label} 未识别到题目`);
  for(const b of u.blocks){if(blockIds.has(b.id))errors.push(`重复原文块 ${b.id}`);blockIds.add(b.id);if(typeof b.text!=='string')errors.push('原文必须是文本');}
  const bank=u.wordBank.map(w=>w.letter);
  if(u.part==='reading' && u.id.endsWith(':A')){
   if(bank.join('')!=='ABCDEFGHIJKLMNO')errors.push('选词填空词库应完整包含 A–O');
   if(!u.blocks.some(b=>b.id.endsWith(':passage')&&b.text.length>50))errors.push('选词填空原文缺失');
  }
  if(u.part==='reading' && u.id.endsWith(':B') && !u.paragraphLetters.length)errors.push('段落匹配原文未识别');
  if(u.part==='reading' && u.id.endsWith(':C') && !u.blocks.some(b=>!b.id.includes(':q')&&!b.id.endsWith(':directions')&&b.text.length>100))errors.push('仔细阅读原文缺失');
  for(const q of u.questions){
   all.push(q);
   if(!Number.isInteger(q.no)||q.no<1||q.no>55)errors.push(`无效题号 ${q.no}`);
   const allowed=q.options?Object.keys(q.options):bank.length?bank:u.paragraphLetters;
   if(q.options && (allowed.sort().join('')!=='ABCD'||Object.values(q.options).some(s=>typeof s!=='string'||!s.trim())))errors.push(`第 ${q.no} 题选项不完整`);
   if((u.part==='listening'||u.id==='reading:C')&&!q.options)errors.push(`第 ${q.no} 题缺少选项`);
   if(q.answer && !allowed.includes(q.answer))errors.push(`第 ${q.no} 题答案不在选项中`);
  }
 }
 const numbers=all.map(q=>q.no),duplicates=numbers.filter((n,i)=>numbers.indexOf(n)!==i);
 if(duplicates.length)errors.push(`重复题号：${[...new Set(duplicates)].join('、')}`);
 const missing=Array.from({length:55},(_,i)=>i+1).filter(n=>!numbers.includes(n));
 if(missing.length){if(paper.parts.length===4)errors.push(`缺少题号：${missing.join('、')}`);else warnings.push(`这是部分试卷；未包含 ${missing.length} 道客观题`);}
 const answerCount=all.filter(q=>q.answer).length;if(answerCount<all.length)warnings.push(`${all.length-answerCount} 道题没有参考答案，可练习但不自动判分`);
 if(!paper.parts.some(p=>p.id==='listening'))warnings.push('未包含听力部分');else warnings.push('PDF 不包含听力音频，需另行提供');
 warnings.push('请核对题干、选项与原文是否错位；结构检查不能代替内容核对');
 return {errors:[...new Set(errors)],warnings,questionCount:all.length,answerCount,parts:built.map(u=>({id:u.id,label:u.label,questions:u.questions.length}))};
}
export class Importer {
 constructor(root){this.root=path.resolve(root);this.dir=path.join(this.root,'.codex-study');}
 async draft(id){if(!/^[0-9a-f-]{36}$/.test(id??''))throw Error('导入编号无效');const file=path.join(this.dir,'imports',id,'draft.json');return {file,value:JSON.parse(await readFile(file,'utf8'))};}
 async preview(args){
  const id=randomUUID(),dir=path.join(this.dir,'imports',id);await mkdir(dir,{recursive:true});let bytes,filename;
  if(args.pdfBase64){if(typeof args.pdfBase64!=='string'||args.pdfBase64.length>42e6)throw Error('PDF 不能超过 30MB');bytes=Buffer.from(args.pdfBase64,'base64');filename=path.basename(args.filename??'新试卷.pdf');}
  else {
   const source=await realpath(String(args.path??'')),root=await realpath(this.root);
   if(!source.startsWith(root+path.sep))throw Error('试卷路径须在 CET-4 学习目录内；其他位置请用界面选择 PDF');
   if((await stat(source)).size>30*1024*1024)throw Error('PDF 不能超过 30MB');bytes=await readFile(source);filename=path.basename(source);
  }
  if(bytes.length>30*1024*1024||!bytes.subarray(0,1024).includes(Buffer.from('%PDF-')))throw Error('请选择有效 PDF 文件');
  const pdf=path.join(dir,'source.pdf');await writeFile(pdf,bytes);
  const info=await exec('/opt/homebrew/bin/pdfinfo',[pdf],{timeout:15000,maxBuffer:1024*1024});const pages=Number(info.stdout.match(/Pages:\s*(\d+)/)?.[1]);if(!pages||pages>60)throw Error('目前支持 1–60 页的 PDF');
  let {stdout:text}=await exec('/opt/homebrew/bin/pdftotext',['-layout',pdf,'-'],{timeout:30000,maxBuffer:8*1024*1024});let method='text';
  if(text.replace(/\s/g,'').length<200){
   method='ocr';text=await ocrPdf(pdf,dir,pages);
  }
  if(text.length>2e6)throw Error('提取文本过长，请拆分试卷');
  await writeFile(path.join(dir,'extracted.txt'),text);
  let paperId=filename.replace(/\.pdf$/i,'').replace(/[^a-zA-Z0-9._-]/g,'-').replace(/^[^a-zA-Z0-9]+/,'').slice(0,60);if(!paperId)paperId=`paper-${new Date().toISOString().slice(0,10)}`;
  if(paperId===builtin.id)paperId+='-import';
  const paper=parsePaper(text,paperId,filename.replace(/\.pdf$/i,''));
  const value={importId:id,sourceName:filename,sourceHash:createHash('sha256').update(bytes).digest('hex'),pages,method,paper,report:validatePaper(paper),createdAt:new Date().toISOString()};
  await writeFile(path.join(dir,'draft.json'),JSON.stringify(value,null,2));
  return {...value,text};
 }
 async read(id){const {value}=await this.draft(id);return {...value,text:await readFile(path.join(this.dir,'imports',id,'extracted.txt'),'utf8')};}
 async update(args){
  const {file,value}=await this.draft(args.importId);const report=validatePaper(args.paper);
  const next={...value,paper:args.paper,report};const temp=`${file}.${randomUUID()}.tmp`;await writeFile(temp,JSON.stringify(next,null,2));await rename(temp,file);return {...next,text:await readFile(path.join(path.dirname(file),'extracted.txt'),'utf8')};
 }
 async commit(args){
  if(args.confirmed!==true)throw Error('请先核对识别预览，再确认加入试卷库');
  const {value}=await this.draft(args.importId),report=validatePaper(value.paper);if(report.errors.length)throw Error(`请先修正识别问题：${report.errors.join('；')}`);
  const id=safeId(value.paper.id);if(id===builtin.id)throw Error('不能覆盖内置试卷');
  const target=path.join(this.dir,'library',id);await mkdir(path.dirname(target),{recursive:true});
  try{await mkdir(target);}catch(e){if(e.code==='EEXIST')throw Error('该试卷编号已经存在，请修改编号；已有试卷不会被覆盖');throw e;}
  try{
   const source=path.join(this.dir,'imports',args.importId);
   await writeFile(path.join(target,'source.pdf'),await readFile(path.join(source,'source.pdf')));
   await writeFile(path.join(target,'extracted.txt'),await readFile(path.join(source,'extracted.txt')));
   const paper={...value.paper,source:`.codex-study/library/${id}/source.pdf`,sourceHash:value.sourceHash};
   await writeFile(path.join(target,'exam.json'),JSON.stringify(paper,null,2));
  }catch(e){await rm(target,{recursive:true,force:true});throw e;}
  return {examId:id,title:value.paper.title,report};
 }
}

export async function ocrPdf(pdf,dir,pages) {
 const chunks=[],started=Date.now();
 for(let page=1;page<=pages;page++){
  if(Date.now()-started>220000)throw Error('扫描件识别时间较长，请按部分拆分 PDF 后导入');
  const prefix=path.join(dir,`ocr-${page}`);
  try{
   await exec('/opt/homebrew/bin/pdftoppm',['-f',String(page),'-l',String(page),'-singlefile','-scale-to','2200','-png',pdf,prefix],{timeout:30000,maxBuffer:1024*1024});
   const result=await exec('/opt/homebrew/bin/tesseract',[prefix+'.png','stdout','-l','eng+chi_sim','--psm','6','-c','preserve_interword_spaces=1'],{timeout:45000,maxBuffer:8*1024*1024});
   chunks.push(result.stdout);
  }catch(e){throw Error('本机 OCR 未完成，请确认已安装 Tesseract 的中英文语言包，或提供带文本层的 PDF。'+(e.code==='ENOENT'?'缺少识别程序。':''));}
  finally{await rm(prefix+'.png',{force:true});}
 }
 return chunks.join('\n\f\n');
}
