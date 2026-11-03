/**
 * CET-4 Practice — shared constants, copy, styles and browser helpers.
 *
 * Every file under src/ is concatenated into one module-loader factory by
 * build.mjs, so `React`, `h` and the constants below are in scope everywhere.
 */
const h = React.createElement

/** Tab type identity inside the right-sidebar tab registry. */
const TAB_ID = '@local/cet4-study/panel'

/** Tab kind a page is opened by. */
const TAB_KIND = 'cet4'

/** Locale namespace owned by this plugin. */
const NS = 'cet4Study'

/** Host route prefix registered by this plugin's Host half. */
const API_ROOT = '/cet4-study/api'

/** Modes the panel can show. */
const MODES = ['practice', 'notes', 'marks', 'vocab', 'tray']

/** Copy for the panel; registered into the host locale service. */
const COPY = {
  zh: {
    'tab.title': '四级精练',
    title: '四级精练',
    open: '四级',
    openHint: '打开右侧四级练习栏',
    loading: '正在读取…',
    failed: '读取失败',
    retry: '重试',
    emptyExam: '还没有识别好的试卷',
    pickExam: '选试卷',
    'mode.practice': '刷题',
    'mode.notes': '笔记',
    'mode.vocab': '生词',
    'mode.tray': '待发布',
    'mode.marks': '标记',
    part: '部分',
    section: '小节',
    directions: '题目要求',
    check: '对答案',
    reveal: '显示答案',
    hide: '收起答案',
    mark: '标记',
    unmark: '取消标记',
    marks: '标记',
    'selection.title': '选中的内容',
    'selection.take': '收进待发布',
    'selection.clear': '取消',
    'kind.word': '单词',
    'kind.phrase': '短语',
    'kind.sentence': '句子',
    'tray.title': '待发布',
    'tray.empty': '还没有收集内容。在题目里划选文字，点「收进待发布」。',
    'tray.gloss': '释义',
    'tray.glossPlaceholder': '写下自己的理解（可留空）',
    'tray.publish': '整理后放进对话框',
    'tray.save': '存入生词表',
    'tray.remove': '删除',
    'tray.published': '已放入对话框，检查后回车发送',
    'tray.saved': '已存入生词表',
    'tray.noHost': '当前没有可用的输入框（请先选中一个会话）',
    'tray.count': '共 {n} 条',
    'notes.title': '笔记',
    'notes.empty': '这一节还没有笔记。可以写自己的判断，也可以引用一处标记。',
    'notes.placeholder': '写下这一部分的思路、错因或规律…',
    'notes.add': '记一笔',
    'notes.quote': '引用',
    'notes.delete': '删除',
    'notes.quoted': '引用：',
    'notes.marked': '标记',
    'notes.tab': '本部分',
    'notes.all': '全部',
    'vocab.title': '生词表',
    'vocab.words': '单词',
    'vocab.phrases': '短语',
    'vocab.empty': '两张表都还是空的',
    'vocab.refresh': '刷新',
    'vocab.count': '{n} 条',
    'answer.sheet': '答题卡',
    'answer.correct': '对',
    'answer.wrong': '错',
    'answer.blank': '未答',
    'answer.show': '显示答案',
    'wordcount': '{n} 词',
    'bank': '词库',
    'blank.active': '已选空 {n}，点下面的词填入',
    'match.hint': '为每条陈述选一个段落',
    'writing.placeholder': '在这里起草作文，草稿会自动保存…',
    'translation.placeholder': '写下你的译文，草稿会自动保存…',
    'progress': '已答 {done}/{total} · 标记 {marks}',
    'marks.title': '标记清单',
    'marks.empty': '还没有标记。做题时点题目右上角的「标记」。',
    'marks.goto': '前往',
    'notes.none': '暂无笔记',
    'btn.save': '保存',
    'saved': '已保存',
    'toast.copied': '已复制',
    'footer.hint': '划选正文可以收词，标记与笔记自动保存',
  },
  en: {
    'tab.title': 'CET-4 Practice',
    title: 'CET-4 Practice',
    open: 'CET-4',
    openHint: 'Open the CET-4 practice column',
    loading: 'Loading…',
    failed: 'Could not load',
    retry: 'Retry',
    emptyExam: 'No structured paper yet',
    pickExam: 'Paper',
    'mode.practice': 'Practice',
    'mode.notes': 'Notes',
    'mode.vocab': 'Words',
    'mode.tray': 'To send',
    'mode.marks': 'Marks',
    part: 'Part',
    section: 'Section',
    directions: 'Directions',
    check: 'Check',
    reveal: 'Show answers',
    hide: 'Hide answers',
    mark: 'Mark',
    unmark: 'Unmark',
    marks: 'Marks',
    'selection.title': 'Selected text',
    'selection.take': 'Collect',
    'selection.clear': 'Cancel',
    'kind.word': 'Word',
    'kind.phrase': 'Phrase',
    'kind.sentence': 'Sentence',
    'tray.title': 'To send',
    'tray.empty': 'Nothing collected yet. Select text in the paper and press Collect.',
    'tray.gloss': 'Meaning',
    'tray.glossPlaceholder': 'Your own explanation (optional)',
    'tray.publish': 'Put in the composer',
    'tray.save': 'Save to the tables',
    'tray.remove': 'Remove',
    'tray.published': 'Draft ready — press Enter to send',
    'tray.saved': 'Saved to the word tables',
    'tray.noHost': 'No composer available (open a session first)',
    'tray.count': '{n} items',
    'notes.title': 'Notes',
    'notes.empty': 'No notes in this section yet.',
    'notes.placeholder': 'What this section taught you…',
    'notes.add': 'Add note',
    'notes.quote': 'Quote',
    'notes.delete': 'Delete',
    'notes.quoted': 'Quote: ',
    'notes.marked': 'Mark',
    'notes.tab': 'This part',
    'notes.all': 'All',
    'vocab.title': 'Word tables',
    'vocab.words': 'Words',
    'vocab.phrases': 'Phrases',
    'vocab.empty': 'Both tables are empty',
    'vocab.refresh': 'Refresh',
    'vocab.count': '{n} items',
    'answer.sheet': 'Answer sheet',
    'answer.correct': 'Right',
    'answer.wrong': 'Wrong',
    'answer.blank': 'Blank',
    'answer.show': 'Show answers',
    'wordcount': '{n} words',
    'bank': 'Word bank',
    'blank.active': 'Blank {n} selected — pick a word below',
    'match.hint': 'Pick one paragraph for each statement',
    'writing.placeholder': 'Draft your essay here; the draft saves automatically…',
    'translation.placeholder': 'Write your translation; the draft saves automatically…',
    'progress': '{done}/{total} answered · {marks} marked',
    'marks.title': 'Marks',
    'marks.empty': 'Nothing marked yet.',
    'marks.goto': 'Go',
    'notes.none': 'No notes',
    'btn.save': 'Save',
    'saved': 'Saved',
    'toast.copied': 'Copied',
    'footer.hint': 'Select text to collect words; marks and notes save automatically',
  },
}

/** Panel stylesheet. Colours are scoped to `.cet4-panel` so the host theme is untouched. */
const PANEL_CSS = `
.cet4-panel {
  --paper: #f7f3ea;
  --paper-raised: #fffdf8;
  --paper-sunken: #f1ece1;
  --ink: #33302a;
  --ink-soft: #5a554b;
  --ink-faint: #8d8679;
  --rule: rgba(51, 48, 42, 0.12);
  --rule-soft: rgba(51, 48, 42, 0.07);
  --accent: #9a7b46;
  --accent-soft: rgba(154, 123, 70, 0.12);
  --ok: #4d6f4f;
  --ok-soft: rgba(77, 111, 79, 0.12);
  --bad: #9d5340;
  --bad-soft: rgba(157, 83, 64, 0.12);
  --radius: 10px;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  height: 100%;
  min-height: 0;
  overflow: hidden;
  background: var(--paper);
  color: var(--ink);
  font-family: var(--dsw-font-family);
  font-size: var(--dsh-content-font-size, 14px);
  line-height: 1.7;
}
body[data-ds-dark-theme] .cet4-panel {
  --paper: #1c1b19;
  --paper-raised: #232220;
  --paper-sunken: #191817;
  --ink: #e6e1d6;
  --ink-soft: #bdb7aa;
  --ink-faint: #8b857a;
  --rule: rgba(230, 225, 214, 0.14);
  --rule-soft: rgba(230, 225, 214, 0.08);
  --accent: #c2a06a;
  --accent-soft: rgba(194, 160, 106, 0.16);
  --ok: #8fb391;
  --ok-soft: rgba(143, 179, 145, 0.14);
  --bad: #cc8a76;
  --bad-soft: rgba(204, 138, 118, 0.14);
}
.cet4-panel *, .cet4-panel *::before, .cet4-panel *::after { box-sizing: border-box; }
.cet4-head { flex: none; padding: 12px 16px 0; border-bottom: 0.5px solid var(--rule); background: var(--paper); }
.cet4-title-row { display: flex; align-items: baseline; gap: 8px; }
.cet4-title { font-size: 14px; font-weight: 600; letter-spacing: 0.02em; }
.cet4-title-meta { color: var(--ink-faint); font-size: 11.5px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.cet4-title-actions { margin-left: auto; display: flex; align-items: center; gap: 4px; }
.cet4-toolbar { display: flex; align-items: center; gap: 6px; flex-wrap: wrap; padding: 8px 0 10px; }
.cet4-spacer { flex: 1; }
.cet4-tabs { display: flex; gap: 2px; }
.cet4-partbar { display: flex; gap: 4px; flex-wrap: wrap; padding: 0 0 10px; }
.cet4-part { border: 0.5px solid var(--rule); background: transparent; color: var(--ink-soft);
  border-radius: 8px; padding: 3px 9px; font: inherit; font-size: 12px; cursor: pointer; line-height: 1.5; }
.cet4-part:hover { background: var(--paper-sunken); }
.cet4-part[data-active="true"] { background: var(--accent-soft); border-color: var(--accent); color: var(--ink); }
.cet4-btn { display: inline-flex; align-items: center; gap: 5px; border: 0.5px solid var(--rule);
  background: transparent; color: var(--ink-soft); border-radius: 8px; padding: 3px 9px; font: inherit;
  font-size: 12px; line-height: 1.5; cursor: pointer; white-space: nowrap; }
.cet4-btn:hover { background: var(--paper-sunken); color: var(--ink); }
.cet4-btn[data-on="true"] { background: var(--accent-soft); border-color: var(--accent); color: var(--ink); }
.cet4-btn:disabled { opacity: 0.45; cursor: default; }
.cet4-btn[data-tone="ok"] { color: var(--ok); border-color: var(--ok); background: var(--ok-soft); }
.cet4-btn[data-tone="bad"] { color: var(--bad); border-color: var(--bad); background: var(--bad-soft); }
.cet4-body { flex: 1; min-height: 0; overflow: auto; padding: 14px 16px 40px; scroll-behavior: smooth; }
.cet4-body-inner { max-width: 720px; }
.cet4-section-label { display: flex; align-items: baseline; gap: 8px; margin: 18px 0 8px; color: var(--ink-faint); font-size: 11.5px; letter-spacing: 0.06em; text-transform: uppercase; }
.cet4-section-label:first-child { margin-top: 0; }
.cet4-section-label::after { content: ""; flex: 1; border-bottom: 0.5px solid var(--rule-soft); }
.cet4-directions { color: var(--ink-faint); font-size: 12px; line-height: 1.65; margin: 0 0 12px; white-space: pre-wrap; }
.cet4-paper { background: var(--paper-raised); border: 0.5px solid var(--rule-soft); border-radius: var(--radius); padding: 14px 16px; margin: 0 0 12px; }
.cet4-prose { white-space: pre-wrap; color: var(--ink); font-size: calc(var(--dsh-content-font-size, 14px) + 1px); line-height: 1.85; }
.cet4-prose p { margin: 0 0 10px; }
.cet4-prose p:last-child { margin-bottom: 0; }
.cet4-q { position: relative; padding: 12px 14px; border-radius: var(--radius); border: 0.5px solid var(--rule-soft); background: var(--paper-raised); margin: 0 0 10px; }
.cet4-q[data-marked="true"] { border-color: var(--accent); box-shadow: inset 2px 0 0 var(--accent); }
.cet4-q-head { display: flex; align-items: flex-start; gap: 8px; }
.cet4-q-no { flex: none; min-width: 22px; height: 22px; padding: 0 5px; border-radius: 6px; background: var(--paper-sunken);
  color: var(--ink-soft); font-size: 11.5px; font-weight: 600; display: inline-flex; align-items: center; justify-content: center; }
.cet4-q[data-marked="true"] .cet4-q-no { background: var(--accent-soft); color: var(--accent); }
.cet4-q-stem { flex: 1; font-size: 13.5px; line-height: 1.7; }
.cet4-q-tools { flex: none; display: flex; gap: 4px; }
.cet4-opts { display: flex; flex-direction: column; gap: 5px; margin: 8px 0 0 30px; }
.cet4-opt { display: flex; align-items: flex-start; gap: 8px; width: 100%; text-align: left; border: 0.5px solid transparent;
  background: transparent; color: var(--ink); font: inherit; font-size: 13px; line-height: 1.65; border-radius: 8px;
  padding: 4px 8px; cursor: pointer; }
.cet4-opt:hover { background: var(--paper-sunken); }
.cet4-opt-letter { flex: none; width: 16px; color: var(--ink-faint); font-size: 11.5px; font-weight: 600; }
.cet4-opt[data-chosen="true"] { background: var(--accent-soft); border-color: var(--accent); }
.cet4-opt[data-chosen="true"] .cet4-opt-letter { color: var(--accent); }
.cet4-opt[data-answer="true"] { background: var(--ok-soft); border-color: var(--ok); }
.cet4-opt[data-answer="true"] .cet4-opt-letter { color: var(--ok); }
.cet4-opt[data-answer="true"][data-chosen="true"] { border-color: var(--ok); }
.cet4-opt[data-wrong="true"] { background: var(--bad-soft); border-color: var(--bad); }
.cet4-opt[data-wrong="true"] .cet4-opt-letter { color: var(--bad); }
.cet4-q-foot { display: flex; align-items: center; gap: 8px; margin: 6px 0 0 30px; color: var(--ink-faint); font-size: 11.5px; }
.cet4-verdict { font-size: 11.5px; font-weight: 600; }
.cet4-verdict[data-ok="true"] { color: var(--ok); }
.cet4-verdict[data-ok="false"] { color: var(--bad); }
.cet4-bank { display: flex; flex-wrap: wrap; gap: 6px; margin: 10px 0 14px; }
.cet4-word { display: inline-flex; align-items: center; gap: 5px; border: 0.5px solid var(--rule); background: var(--paper-raised);
  color: var(--ink); border-radius: 999px; padding: 3px 10px; font: inherit; font-size: 12.5px; cursor: pointer; }
.cet4-word:hover { background: var(--paper-sunken); }
.cet4-word[data-used="true"] { opacity: 0.42; }
.cet4-word-letter { color: var(--ink-faint); font-size: 11px; }
.cet4-blank { display: inline-flex; align-items: center; justify-content: center; min-width: 34px; height: 22px;
  margin: 0 2px; padding: 0 6px; border-radius: 6px; border: 0.5px dashed var(--rule); background: var(--paper-sunken);
  color: var(--ink-faint); font: inherit; font-size: 11.5px; cursor: pointer; vertical-align: baseline; }
.cet4-blank[data-filled="true"] { border-style: solid; border-color: var(--accent); color: var(--accent); background: var(--accent-soft); }
.cet4-blank[data-active="true"] { outline: 2px solid var(--accent); outline-offset: 1px; }
.cet4-blank[data-ok="true"] { border-color: var(--ok); color: var(--ok); background: var(--ok-soft); }
.cet4-blank[data-ok="false"] { border-color: var(--bad); color: var(--bad); background: var(--bad-soft); }
.cet4-select { border: 0.5px solid var(--rule); background: var(--paper-raised); color: var(--ink);
  border-radius: 8px; padding: 2px 6px; font: inherit; font-size: 12.5px; cursor: pointer; }
.cet4-para-letter { display: inline-flex; align-items: center; justify-content: center; width: 20px; height: 20px;
  margin-right: 6px; border-radius: 5px; background: var(--paper-sunken); color: var(--ink-faint); font-size: 11px; font-weight: 600; }
.cet4-input, .cet4-textarea { width: 100%; border: 0.5px solid var(--rule); background: var(--paper-raised);
  color: var(--ink); border-radius: 8px; padding: 8px 10px; font: inherit; font-size: 13px; line-height: 1.7; resize: vertical; }
.cet4-input { padding: 5px 8px; font-size: 12.5px; }
.cet4-textarea { min-height: 92px; }
.cet4-input:focus, .cet4-textarea:focus { outline: 1.5px solid var(--accent); outline-offset: 1px; }
.cet4-note { border: 0.5px solid var(--rule-soft); background: var(--paper-raised); border-radius: var(--radius);
  padding: 10px 12px; margin: 0 0 8px; }
.cet4-note-head { display: flex; align-items: center; gap: 6px; color: var(--ink-faint); font-size: 11px; margin-bottom: 4px; }
.cet4-note-text { white-space: pre-wrap; font-size: 13px; }
.cet4-quote { border-left: 2px solid var(--accent); padding: 2px 0 2px 8px; margin: 6px 0; color: var(--ink-soft);
  font-size: 12.5px; white-space: pre-wrap; }
.cet4-tray-item { display: flex; gap: 8px; align-items: flex-start; padding: 8px 10px; border-radius: 8px;
  background: var(--paper-raised); border: 0.5px solid var(--rule-soft); margin-bottom: 6px; }
.cet4-tray-text { flex: 1; min-width: 0; }
.cet4-tray-term { font-size: 13px; word-break: break-word; }
.cet4-tray-where { color: var(--ink-faint); font-size: 11px; }
.cet4-chip { display: inline-flex; align-items: center; gap: 4px; border-radius: 999px; padding: 1px 7px;
  background: var(--accent-soft); color: var(--accent); font-size: 11px; }
.cet4-empty { color: var(--ink-faint); font-size: 12.5px; padding: 20px 4px; text-align: center; line-height: 1.8; }
.cet4-vocab-table { width: 100%; border-collapse: collapse; font-size: 12.5px; }
.cet4-vocab-table td { padding: 4px 0; vertical-align: top; border-bottom: 0.5px solid var(--rule-soft); }
.cet4-vocab-term { width: 42%; color: var(--ink); font-weight: 500; word-break: break-word; }
.cet4-vocab-gloss { color: var(--ink-soft); }
.cet4-vocab-head { display: flex; align-items: baseline; gap: 8px; margin: 14px 0 6px; font-size: 12px; font-weight: 600; color: var(--ink-soft); }
.cet4-mark-row { display: flex; align-items: center; gap: 8px; padding: 6px 8px; border-radius: 8px; cursor: pointer; }
.cet4-mark-row:hover { background: var(--paper-sunken); }
.cet4-grab { position: fixed; z-index: 5; display: flex; align-items: center; gap: 2px; padding: 4px;
  border-radius: 10px; background: var(--paper-raised); border: 0.5px solid var(--rule);
  box-shadow: 0 6px 20px rgba(30, 26, 20, 0.14); color: var(--ink); font-size: 12px; }
.cet4-toast { position: absolute; left: 50%; bottom: 14px; transform: translateX(-50%); z-index: 6;
  background: rgba(40, 36, 30, 0.92); color: #f7f3ea; border-radius: 999px; padding: 5px 14px; font-size: 12px;
  pointer-events: none; }
body[data-ds-dark-theme] .cet4-toast { background: rgba(240, 236, 228, 0.92); color: #24211c; }
.cet4-panel ::selection { background: var(--accent-soft); }
.cet4-foot-hint { flex: none; padding: 5px 16px; border-top: 0.5px solid var(--rule-soft);
  color: var(--ink-faint); font-size: 11px; background: var(--paper); }
.cet4-scroll-thin { scrollbar-width: thin; }
`

/**
 * Call the Host half.
 * @param path - route below the API prefix.
 * @param init - fetch init; a plain object body is encoded as JSON.
 * @returns the parsed JSON payload.
 */
async function api(path, init) {
  const options = { ...init }
  if (options.body !== undefined && typeof options.body !== 'string') {
    options.body = JSON.stringify(options.body)
    options.headers = { 'content-type': 'application/json', ...(options.headers ?? {}) }
  }
  const response = await fetch(`${API_ROOT}${path}`, { cache: 'no-store', ...options })
  const text = await response.text()
  let payload
  try {
    payload = text === '' ? undefined : JSON.parse(text)
  } catch {
    throw new Error(`${response.status}: ${text.slice(0, 160)}`)
  }
  if (!response.ok) throw new Error(payload?.error ?? `HTTP ${response.status}`)
  if (payload && payload.ok === false) throw new Error(payload.error ?? 'request failed')
  return payload
}

/** Translate helper: prefer the host-bound `t`, else this plugin's own copy table. */
function translator(props) {
  if (typeof props?.t === 'function') return props.t
  const useEn = typeof navigator !== 'undefined' && !/^(zh|cn)/i.test(navigator.language ?? '')
  const table = useEn ? COPY.en : COPY.zh
  return (key, params) => interpolate(table[key] ?? COPY.zh[key] ?? key, params)
}

/** Fill `{name}` placeholders. */
function interpolate(text, params) {
  if (!params) return text
  return String(text).replace(/\{(\w+)\}/g, (whole, name) => (name in params ? String(params[name]) : whole))
}

/** Install the panel stylesheet once; returns a disposer. */
function installStyles() {
  const id = '@local/cet4-study/panel.css'
  if (typeof document === 'undefined') return () => {}
  const existing = document.querySelector(`style[data-plugin-css="${id}"]`)
  if (existing !== null) return () => {}
  const tag = document.createElement('style')
  tag.dataset.plugin = '@local/cet4-study'
  tag.dataset.pluginCss = id
  tag.textContent = PANEL_CSS
  document.head.appendChild(tag)
  return () => tag.remove()
}

/** Short toast state helper used by the panel. */
function useToast() {
  const [message, setMessage] = React.useState(null)
  const timer = React.useRef(0)
  const show = React.useCallback((text) => {
    setMessage(text)
    clearTimeout(timer.current)
    timer.current = setTimeout(() => setMessage(null), 2200)
  }, [])
  React.useEffect(() => () => clearTimeout(timer.current), [])
  return [message, show]
}
