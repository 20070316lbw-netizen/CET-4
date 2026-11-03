import {test} from 'node:test';
import assert from 'node:assert/strict';
import {mkdtemp,readFile,writeFile,mkdir} from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import {randomUUID} from 'node:crypto';
import {parsePaper,validatePaper,Importer} from '../importer.mjs';
import {Store,exam,buildUnits,loadExam,catalog} from '../store.mjs';
const temp=()=>mkdtemp(path.join(os.tmpdir(),'cet4-import-'));
const fixture=await readFile(new URL('fixtures/word-paper.txt',import.meta.url),'utf8');
async function staged(root,paper){const id=randomUUID(),dir=path.join(root,'.codex-study/imports',id);await mkdir(dir,{recursive:true});await writeFile(path.join(dir,'source.pdf'),'%PDF-test');await writeFile(path.join(dir,'extracted.txt'),fixture);await writeFile(path.join(dir,'draft.json'),JSON.stringify({importId:id,paper,report:validatePaper(paper),sourceHash:'test'}));return id;}
test('真实文本布局可识别55题，选项和答案与已核对数据一致',()=>{
 const p=parsePaper(fixture,'new-paper','另一份试卷'),report=validatePaper(p);assert.deepEqual(report.errors,[]);assert.equal(report.questionCount,55);assert.equal(report.answerCount,55);
 const old=buildUnits(exam).flatMap(u=>u.questions);for(const q of buildUnits(p).flatMap(u=>u.questions)){const o=old.find(x=>x.no===q.no);assert.equal(q.answer,o.answer);for(const k of Object.keys(q.options??{}))assert.equal(q.options[k].replace(/\s/g,''),o.options[k].replace(/\s/g,''),`Q${q.no} ${k}`);}
 const reading=p.parts.find(p=>p.id==='reading');assert.ok(reading.sections[2].passages.every(p=>p.text.length>500));
});
test('无答案试卷可导入；缺题、选项残缺、重复题号必须修正',()=>{
 const p=parsePaper(fixture.split(/^\s*KEYS\s*$/m)[0],'no-key','无答案卷');const report=validatePaper(p);assert.deepEqual(report.errors,[]);assert.equal(report.answerCount,0);assert.ok(report.warnings.some(w=>w.includes('不自动判分')));
 const bad=structuredClone(p),qs=bad.parts[1].sections[0].groups[0].questions;delete qs[0].options.D;qs[1].no=1;
 const errors=validatePaper(bad).errors;assert.ok(errors.some(e=>e.includes('选项不完整')));assert.ok(errors.some(e=>e.includes('重复题号')));assert.ok(errors.some(e=>e.includes('缺少题号')));
});
test('预览不进入正式列表；确认才导入；重复编号与路径穿越拒绝',async()=>{
 const root=await temp(),importer=new Importer(root),paper=parsePaper(fixture,'new-paper','新卷');const id=await staged(root,paper);
 assert.equal((await catalog(root)).length,1);await assert.rejects(importer.commit({importId:id}),/确认/);
 await importer.commit({importId:id,confirmed:true});assert.equal((await catalog(root)).length,2);
 await assert.rejects(importer.commit({importId:id,confirmed:true}),/已经存在/);
 const draft=await importer.update({importId:id,paper:{...paper,id:'../escape'}});assert.ok(draft.report.errors.length);await assert.rejects(importer.commit({importId:id,confirmed:true}),/修正/);
});
test('旧卷状态保持原位；相同题号、标记、草稿按卷隔离，共享词表',async()=>{
 const root=await temp(),old=new Store(root),paper={...structuredClone(exam),id:'second-paper',title:'第二卷'};
 const id=await staged(root,paper);await new Importer(root).commit({importId:id,confirmed:true});
 const next=new Store(root,await loadExam(root,paper.id));
 await old.run('answer',{no:1,value:'A'});await next.run('answer',{no:1,value:'D'});
 await old.run('draft',{unit:'writing:writing',text:'old essay'});await next.run('draft',{unit:'writing:writing',text:'new essay'});
 const block=buildUnits(exam)[1].blocks.find(b=>b.id.endsWith(':q1-A'));const a={blockId:block.id,start:0,end:2,text:block.text.slice(0,2)};
 await old.run('mark',a);assert.equal((await next.read()).marks.length,0);
 await old.run('collect',{...a,kind:'word'});await old.run('vocab');await next.run('collect',{...a,kind:'word'});const v=await next.run('vocab');assert.equal(v.result.skipped.length,1);
 assert.equal((await new Store(root).read()).answers[1],'A');assert.equal((await new Store(root,paper).read()).answers[1],'D');assert.equal((await next.read()).drafts['writing:writing'],'new essay');assert.equal(old.file,path.join(root,'.codex-study/state.json'));
});
test('未知布局停在待修正预览，不猜题目',()=>{
 const p=parsePaper('这是未识别的扫描文本','unknown','未识别');assert.ok(validatePaper(p).errors.length);assert.equal(p.parts.length,0);
});
test('导入路径限制在学习目录，任意外部路径必须由用户选择上传',async()=>{
 const root=await temp();await assert.rejects(new Importer(root).preview({path:'/etc/hosts'}),/学习目录/);
});
