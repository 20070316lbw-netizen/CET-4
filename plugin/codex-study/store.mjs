import { tableRows, appendCsv } from '../cet4-study/vocab-csv.js';
import { readFile, writeFile, mkdir, rename, open, readdir } from 'node:fs/promises';
import path from 'node:path';
import { randomUUID } from 'node:crypto';
import { fileURLToPath } from 'node:url';
const base = path.dirname(fileURLToPath(import.meta.url));
export const exam = JSON.parse(await readFile(path.join(base, 'content/2025-12-1.json'), 'utf8'));
export function buildUnits(exam) {
const units = [];
for (const part of exam.parts) {
  for (const sec of part.sections ?? [part]) {
    const unit = { id: `${part.id}:${sec.id}`, part: part.id, label: sec === part ? part.label : `${part.label} / ${sec.label}`, blocks: [], questions: [], kind: part.kind };
    const add = (id, text, label = '') => { if (text) unit.blocks.push({ id: `${unit.id}:${id}`, text, label }); };
    add('directions', sec.directions, 'Directions');
    if (part.kind === 'writing') add('prompt', sec.prompt, '写作任务');
    if (part.kind === 'translation') add('chinese', sec.chinese, '翻译原文');
    if (sec.passage) add('passage', sec.passage, '阅读原文');
    unit.wordBank = sec.wordBank ?? [];
    if (sec.paragraphs) for (const p of sec.paragraphs) add(`paragraph-${p.letter}`, p.text, p.letter);
    unit.paragraphLetters = sec.paragraphs?.map(p => p.letter) ?? [];
    function questions(qs) { for (const q of qs ?? []) {
      unit.questions.push(q);
      add(`q${q.no}`, q.stem, `第 ${q.no} 题`);
      for (const [k,v] of Object.entries(q.options ?? {})) add(`q${q.no}-${k}`, v, `${q.no} · ${k}`);
    } }
    questions(sec.questions);
    for (const g of sec.groups ?? []) { add(g.id, g.intro); questions(g.questions); }
    for (const p of sec.passages ?? []) { add(p.id ?? p.title, p.text, p.title); questions(p.questions); }
    units.push(unit);
  }
}
return units;
}
export const units = buildUnits(exam);
const clean = v => String(v ?? '').trim();
const norm = v => clean(v).toLocaleLowerCase().replace(/\s+/g, ' ');
const fresh = () => ({ version: 1, revision: 0, answers: {}, drafts: {}, marks: [], notes: [], tray: [], revealed: [] });
export class Store {
  constructor(root, paper = exam) { this.exam = paper; this.units = buildUnits(paper); this.blocks = new Map(this.units.flatMap(u=>u.blocks.map(b=>[b.id,{...b,unit:u.id}]))); this.questions = new Map(this.units.flatMap(u=>u.questions.map(q=>[q.no,{...q,unit:u.id}]))); this.root = path.resolve(root); this.dir = path.join(this.root, '.codex-study'); this.file = paper.id === exam.id ? path.join(this.dir, 'state.json') : path.join(this.dir,'exams',paper.id,'state.json'); this.queue = Promise.resolve(); }
  async read() {
    try { const value = JSON.parse(await readFile(this.file, 'utf8')); if (value.version !== 1 || !Array.isArray(value.marks)) throw Error('不支持的存档格式'); return value; }
    catch (e) { if (e.code === 'ENOENT') return fresh(); throw e; }
  }
  async atomic(file, data) { await mkdir(path.dirname(file), { recursive: true }); const tmp = `${file}.${randomUUID()}.tmp`; await writeFile(tmp, data, 'utf8'); await rename(tmp, file); }
  async snapshot() {
    const state = await this.read();
    const publicUnits = structuredClone(this.units);
    for (const u of publicUnits) for (const q of u.questions) {
      if (!state.revealed.includes(u.id)) delete q.answer;
    }
    return { exam: { id: this.exam.id, title: this.exam.title }, catalog: await catalog(this.root), units: publicUnits, state, root: this.root };
  }
  async run(action, args = {}) {
    const job = this.queue.then(async () => {
      await mkdir(this.dir, { recursive: true });
      // 跨多个 MCP 进程与预览窗口串行写入，避免彼此覆盖。
      const lockfile = path.join(this.dir, 'write.lock');
      let lock;
      for (let attempt = 0; attempt < 50; attempt++) {
        try { lock = await open(lockfile, 'wx'); break; }
        catch (e) { if (e.code !== 'EEXIST') throw e; await new Promise(r => setTimeout(r, 40)); }
      }
      if (!lock) throw Error('存档正在被另一个窗口写入，请稍后重试');
      try { return await this.mutate(action, args); }
      finally { await lock.close(); const { unlink } = await import('node:fs/promises'); await unlink(lockfile); }
    });
    this.queue = job.catch(() => {}); return job;
  }
  anchor(a) {
    const b = this.blocks.get(a.blockId);
    if (!b || !Number.isInteger(a.start) || !Number.isInteger(a.end) || a.start < 0 || a.end <= a.start || a.end > b.text.length) throw Error('标记位置无效');
    if (b.text.slice(a.start, a.end) !== a.text) throw Error('标记文字与原文位置不一致');
    return { blockId: b.id, unit: b.unit, start: a.start, end: a.end, text: a.text };
  }
  async mutate(action, args) {
    const state = await this.read(); let result = {};
    const text = (v, max = 20000) => { const t = clean(v); if (!t || t.length > max) throw Error('内容为空或过长'); return t; };
    if (action === 'answer') {
      const q = this.questions.get(Number(args.no)); if (!q) throw Error('题号不存在');
      const unit = this.units.find(u => u.id === q.unit);
      const options = Object.keys(q.options ?? {});
      const allowed = options.length ? options : unit.wordBank.length ? unit.wordBank.map(w=>w.letter) : unit.paragraphLetters;
      if (args.value !== '' && !allowed.includes(args.value)) throw Error('选项无效');
      state.answers[q.no] = args.value;
    } else if (action === 'draft') {
      if (!this.units.some(u => u.id === args.unit && ['writing', 'translation'].includes(u.kind))) throw Error('草稿位置无效');
      if (typeof args.text !== 'string' || args.text.length > 50000) throw Error('草稿过长');
      state.drafts[args.unit] = args.text;
    } else if (action === 'reveal') {
      if (!this.units.some(u => u.id === args.unit)) throw Error('小节不存在');
      state.revealed = state.revealed.filter(id=>id!==args.unit); if (args.show) state.revealed.push(args.unit);
    } else if (action === 'mark') {
      const a = this.anchor(args);
      const same = state.marks.find(m => m.blockId === a.blockId && m.start === a.start && m.end === a.end);
      if (same) result = { id: same.id };
      else { const m = { ...a, id: `M-${randomUUID().slice(0,8)}`, by: args.by === 'assistant' ? 'assistant' : 'user', note: clean(args.note), createdAt: new Date().toISOString() }; state.marks.push(m); result = { id: m.id }; }
    } else if (action === 'note') {
      if (!this.units.some(u=>u.id===args.unit)) throw Error('笔记位置无效');
      const refs = args.refs ?? []; if (!Array.isArray(refs) || refs.some(id=>!state.marks.some(m=>m.id===id))) throw Error('引用标记不存在');
      state.notes.push({ id: `N-${randomUUID().slice(0,8)}`, unit: args.unit, text: text(args.text), refs, by: args.by === 'assistant' ? 'assistant' : 'user', createdAt: new Date().toISOString() });
    } else if (action === 'collect') {
      const a = this.anchor(args); if (!['word','phrase','sentence','question'].includes(args.kind)) throw Error('积累类型无效');
      if (!state.tray.some(t=>t.blockId===a.blockId && t.start===a.start && t.end===a.end && t.kind===args.kind)) state.tray.push({ ...a, id: `T-${randomUUID().slice(0,8)}`, kind: args.kind, thought: clean(args.thought) });
    } else if (action === 'thought') {
      const item = state.tray.find(t=>t.id===args.id); if (!item) throw Error('待讨论条目不存在'); item.thought = String(args.text ?? '').slice(0,20000);
    } else if (action === 'remove') {
      if (!['marks','notes','tray'].includes(args.collection)) throw Error('清单无效');
      if (args.collection === 'marks' && state.notes.some(n=>n.refs.includes(args.id))) throw Error('这处标记已被笔记引用，请先删除相关笔记');
      state[args.collection] = state[args.collection].filter(i=>i.id!==args.id);
    } else if (action === 'vocab') {
      result = await this.vocab(state.tray);
    } else throw Error('未知操作');
    state.revision++; await this.atomic(this.file, JSON.stringify(state, null, 2));
    await this.exportNotes(state);
    return { ...await this.snapshot(), result };
  }
  async vocab(tray) {
    const added = [], skipped = [];
    for (const [kind, filename] of [['word','不会的单词表.csv'], ['phrase','不会的短语表.csv']]) {
      const file = path.join(this.root, filename); let original = '';
      try { original = await readFile(file, 'utf8'); } catch(e) { if(e.code !== 'ENOENT') throw e; }
      const known = new Set(tableRows(original).map(row=>norm(row.term)));
      const lines = [];
      for (const item of tray.filter(t=>t.kind===kind)) {
        const term = clean(item.text).replace(/\s+/g,' ');
        if (known.has(norm(term))) { skipped.push(term); continue; }
        known.add(norm(term)); lines.push({term, gloss: '', source: `${this.exam.id} / ${item.unit} / ${item.blockId}`}); added.push(term);
      }
      if (lines.length) await this.atomic(file, appendCsv(original, lines, kind === 'word' ? '单词' : '短语'));
    }
    return { added, skipped };
  }
  async exportNotes(s) {
    const lines = [`# ${this.exam.id} 刷题笔记`, '', '由四级精练生成；请在面板中编辑，手工补充另存文件。', '', '## 标记', ''];
    for (const m of s.marks) lines.push(`### ${m.id} · ${m.by === 'assistant' ? '助手' : '我'}`, `${m.unit} / ${m.blockId} [${m.start}, ${m.end})`, '', `> ${m.text.replace(/\n/g,'\n> ')}`, '', m.note, '');
    lines.push('## 笔记', '');
    for (const n of s.notes) lines.push(`### ${n.id} · ${n.unit}`, `引用：${n.refs.join('、') || '无'}`, '', n.text, '');
    lines.push('## 句子积累', '');
    for(const t of s.tray.filter(t=>t.kind==='sentence')) lines.push(`> ${t.text.replace(/\n/g,'\n> ')}`, `${t.unit} / ${t.blockId}`, '', t.thought, '');
    await this.atomic(path.join(this.dir, `${this.exam.id}-笔记.md`), lines.join('\n'));
  }
}

export function safeId(id) { if(typeof id !== 'string' || !/^[a-zA-Z0-9][a-zA-Z0-9._-]{0,79}$/.test(id) || id.includes('..')) throw Error('试卷编号只能使用字母、数字、点、横线和下划线'); return id; }
export async function loadExam(root, id = exam.id) {
 safeId(id); if(id===exam.id)return exam;
 const paper=JSON.parse(await readFile(path.join(root,'.codex-study','library',id,'exam.json'),'utf8'));
 if(paper.id!==id)throw Error('试卷编号不一致'); return paper;
}
export async function catalog(root) {
 const entries=[{id:exam.id,title:exam.title}];
 let dirs=[];try{dirs=await readdir(path.join(root,'.codex-study','library'),{withFileTypes:true});}catch(e){if(e.code!=='ENOENT')throw e;}
 for(const d of dirs.filter(d=>d.isDirectory())){
  try{const e=await loadExam(root,d.name);if(e.id!==exam.id)entries.push({id:e.id,title:e.title});}catch{/* 未完成的导入不出现在正式列表中。 */}
 }
 return entries.sort((a,b)=>b.id.localeCompare(a.id));
}
