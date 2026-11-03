import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, readFile, writeFile } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { spawn } from 'node:child_process';
import { Store, units } from '../store.mjs';
import { tableRows, csvRows, parseCsv } from '../../cet4-study/vocab-csv.js';
const tmp=()=>mkdtemp(path.join(os.tmpdir(),'cet4-test-'));
const first = units.find(u=>u.part==='listening').blocks.find(b=>b.id.endsWith(':q1-A'));
const anchor = {blockId:first.id,start:0,end:2,text:first.text.slice(0,2)};
test('55题完整；默认隐藏答案；显示答案仅针对一个小节',async()=>{
 assert.equal(units.flatMap(u=>u.questions).length,55);
 const s=new Store(await tmp());const before=await s.snapshot();assert.ok(before.units.every(u=>u.questions.every(q=>!('answer'in q))));
 await s.run('reveal',{unit:units[1].id,show:true});const after=await s.snapshot();assert.ok(after.units[1].questions.every(q=>q.answer));assert.ok(after.units[2].questions.every(q=>!('answer'in q)));
});
test('答题、标记、引用笔记跨实例恢复；无效位置拒绝；引用标记不得误删',async()=>{
 const root=await tmp(),s=new Store(root);await s.run('answer',{no:1,value:'B'});
 const mark=await s.run('mark',{...anchor,by:'assistant'});await s.run('note',{unit:first.id.split(':').slice(0,2).join(':'),text:'这是我的理解',refs:[mark.result.id]});
 const next=await new Store(root).snapshot();assert.equal(next.state.answers[1],'B');assert.equal(next.state.marks[0].by,'assistant');assert.equal(next.state.notes[0].refs[0],mark.result.id);
 await assert.rejects(s.run('mark',{...anchor,text:'wrong'}),/不一致/);
 await assert.rejects(s.run('remove',{collection:'marks',id:mark.result.id}),/引用/);
 assert.match(await readFile(path.join(root,'.codex-study/2025-12-1-笔记.md'),'utf8'),/这是我的理解/);
});
test('CSV生词表保留释义、去重；自己的理解不自动变成释义；句子另存笔记',async()=>{
 const root=await tmp(),s=new Store(root);const original=csvRows([['单词','中文释义','出处'],['hello','你好, "朋友"\n问候','']]);await writeFile(path.join(root,'不会的单词表.csv'),original.trimEnd());
 await s.run('collect',{...anchor,kind:'word',thought:'可能是地点？'});
 await s.run('collect',{...anchor,kind:'word'});
 assert.equal((await s.snapshot()).state.tray.length,1);
 await s.run('vocab');await s.run('vocab');const text=await readFile(path.join(root,'不会的单词表.csv'),'utf8');assert.ok(text.startsWith(original));const rows=tableRows(text);assert.equal(rows[0].gloss,'你好, "朋友"\n问候');assert.equal(rows.filter(r=>r.term===anchor.text).length,1);assert.equal(rows[1].gloss,'');assert.match(rows[1].source,/2025-12-1/);assert.ok(!text.includes('可能是地点'));
 await s.run('collect',{...anchor,kind:'sentence'});assert.match(await readFile(path.join(root,'.codex-study/2025-12-1-笔记.md'),'utf8'),/## 句子积累/);
});
test('CSV支持逗号、引号、换行及BOM；损坏表头拒绝写入',()=>{
 const rows=[['单词','中文释义','出处'],['a,b','a "quote"\n释义','来源']];
 assert.deepEqual(parseCsv('\uFEFF'+csvRows(rows)),rows);
 assert.throws(()=>tableRows('word,meaning\na,b'),/表头/);
 assert.throws(()=>parseCsv('"broken'),/未闭合/);
});
test('多个窗口同时保存不会覆盖互相的记录',async()=>{
 const root=await tmp();await Promise.all(Array.from({length:8},(_,i)=>new Store(root).run('answer',{no:i+1,value:'B'})));
 assert.equal(Object.keys((await new Store(root).snapshot()).state.answers).length,8);
});
test('损坏存档拒绝覆盖',async()=>{
 const root=await tmp(),s=new Store(root);await s.run('answer',{no:1,value:'A'});await writeFile(s.file,'broken');await assert.rejects(s.run('answer',{no:1,value:'B'}));assert.equal(await readFile(s.file,'utf8'),'broken');
});
test('MCP初始化、面板工具、HTML资源和错误结果',async()=>{
 const child=spawn(process.execPath,['server.mjs'],{cwd:new URL('..',import.meta.url),env:{...process.env,CET4_ROOT:await tmp()},stdio:['pipe','pipe','pipe']});
 let output='';child.stdout.on('data',c=>output+=c);let error='';child.stderr.on('data',c=>error+=c);
 for(const req of [{id:1,method:'initialize',params:{protocolVersion:'2025-11-25'}},{id:2,method:'tools/list'},{id:3,method:'resources/read',params:{uri:'ui://cet4-study/panel-v2.html'}},{id:4,method:'tools/call',params:{name:'study_action',arguments:{action:'answer',args:{no:1,value:'X'}}}}])child.stdin.write(JSON.stringify({jsonrpc:'2.0',...req})+'\n');
 child.stdin.end();await new Promise((r,j)=>{child.on('close',r);child.on('error',j);});assert.equal(error,'');const rows=output.trim().split('\n').map(JSON.parse);assert.equal(rows.length,4);assert.equal(rows[0].result.serverInfo.name,'cet4-study');assert.equal(rows[1].result.tools[0]._meta['openai/ui'].entrypoints[0].type,'thread');assert.ok(rows[2].result.contents[0].text.includes('ui/initialize'));assert.ok(!rows[2].result.contents[0].text.includes('/*__APP__*/'));assert.equal(rows[3].result.isError,true);
});
