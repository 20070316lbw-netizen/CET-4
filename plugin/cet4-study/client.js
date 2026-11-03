window.__ModuleLoader__.load({
  id: '@local/cet4-study',
  factory: (require) => {
    const module = { exports: {} };
    const exports = module.exports;
    const React = require('react');
    // ---- src/10-core.js ----
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

    // ---- src/20-store.js ----
    /**
     * CET-4 Practice — data loading, saved study state, selection helpers.
     */

    /** Empty study state for a fresh workspace. */
    function emptyState() {
      return { version: 1, exams: {}, tray: [] }
    }

    /** One exam branch of the saved state. */
    function emptyExamState() {
      return { answers: {}, marks: {}, notes: [], drafts: {}, revealed: {}, part: null, section: null }
    }

    /** Load the structured-paper catalog. */
    function useCatalog() {
      const [result, setResult] = React.useState({ phase: 'loading', exams: [] })
      const load = React.useCallback(() => {
        setResult((previous) => ({ ...previous, phase: previous.exams.length > 0 ? 'ready' : 'loading' }))
        api('/exams')
          .then((payload) => setResult({ phase: 'ready', exams: payload.exams ?? [] }))
          .catch((error) => setResult({ phase: 'failed', exams: [], error: String(error) }))
      }, [])
      React.useEffect(load, [load])
      return [result, load]
    }

    /** Load one structured paper. */
    function useExam(examId) {
      const [result, setResult] = React.useState({ phase: 'idle', exam: null })
      React.useEffect(() => {
        if (!examId) return undefined
        let alive = true
        setResult({ phase: 'loading', exam: null })
        api(`/exam?id=${encodeURIComponent(examId)}`)
          .then((exam) => alive && setResult({ phase: 'ready', exam }))
          .catch((error) => alive && setResult({ phase: 'failed', exam: null, error: String(error) }))
        return () => {
          alive = false
        }
      }, [examId])
      return result
    }

    /**
     * Saved answers, marks, notes, drafts and the collection tray.
     * Writes are debounced and sent as one whole-state PUT, so a reload never
     * loses more than the last second of work.
     */
    function useStudyState() {
      const [state, setState] = React.useState(emptyState)
      const [status, setStatus] = React.useState('loading')
      const loaded = React.useRef(false)
      const pending = React.useRef(null)
      const timer = React.useRef(0)

      React.useEffect(() => {
        let alive = true
        api('/state')
          .then((payload) => {
            if (!alive) return
            setState(payload.state && typeof payload.state === 'object' ? { ...emptyState(), ...payload.state } : emptyState())
            setStatus('ready')
            loaded.current = true
          })
          .catch((error) => {
            if (!alive) return
            setStatus(`failed: ${error}`)
            loaded.current = true
          })
        return () => {
          alive = false
        }
      }, [])

      React.useEffect(() => {
        if (!loaded.current) return
        pending.current = state
        clearTimeout(timer.current)
        timer.current = setTimeout(() => {
          const next = pending.current
          if (next === null) return
          pending.current = null
          api('/state', { method: 'PUT', body: next }).catch((error) =>
            console.error('[cet4-study] saving state failed', error),
          )
        }, 700)
        return () => clearTimeout(timer.current)
      }, [state])

      const update = React.useCallback((mutate) => {
        setState((previous) => mutate(previous) ?? previous)
      }, [])

      const updateExam = React.useCallback(
        (examId, mutate) => {
          setState((previous) => {
            const exams = { ...(previous.exams ?? {}) }
            const current = { ...emptyExamState(), ...(exams[examId] ?? {}) }
            exams[examId] = mutate(current) ?? current
            return { ...previous, exams }
          })
        },
        [],
      )

      const updateTray = React.useCallback((mutate) => {
        setState((previous) => ({ ...previous, tray: mutate(previous.tray ?? []) ?? previous.tray ?? [] }))
      }, [])

      return { state, status, update, updateExam, updateTray }
    }

    /** Every section of a paper in reading order. */
    function sectionsOf(exam) {
      const list = []
      for (const part of exam?.parts ?? []) {
        if (Array.isArray(part.sections)) {
          for (const section of part.sections) {
            list.push({
              partId: part.id,
              partLabel: part.label,
              sectionId: section.id,
              sectionLabel: section.label,
              section,
              part,
            })
          }
        } else {
          list.push({ partId: part.id, partLabel: part.label, sectionId: null, sectionLabel: part.label, section: part, part })
        }
      }
      return list
    }

    /** All question numbers of a paper. */
    function questionNumbers(exam) {
      const numbers = []
      for (const part of exam?.parts ?? []) {
        const sections = Array.isArray(part.sections) ? part.sections : [part]
        for (const section of sections) {
          if (Array.isArray(section.questions)) numbers.push(...section.questions.map((q) => q.no))
          if (Array.isArray(section.groups)) {
            for (const group of section.groups) {
              if (Array.isArray(group.questions)) numbers.push(...group.questions.map((q) => q.no))
            }
          }
          if (Array.isArray(section.passages)) {
            for (const passage of section.passages) {
              if (Array.isArray(passage.questions)) numbers.push(...passage.questions.map((q) => q.no))
            }
          }
        }
      }
      return numbers.sort((a, b) => a - b)
    }

    /** Look up one question record across the shape variants. */
    function findQuestion(exam, no) {
      for (const part of exam?.parts ?? []) {
        const sections = Array.isArray(part.sections) ? part.sections : [part]
        for (const section of sections) {
          const candidates = []
          if (Array.isArray(section.questions)) candidates.push(...section.questions)
          if (Array.isArray(section.groups)) for (const group of section.groups) candidates.push(...(group.questions ?? []))
          if (Array.isArray(section.passages)) for (const passage of section.passages) candidates.push(...(passage.questions ?? []))
          const found = candidates.find((question) => question.no === no)
          if (found !== undefined) return { question: found, part, section }
        }
      }
      return null
    }

    /** Human-readable place of a question, used on marks, notes and collected items. */
    function whereOf(exam, no) {
      const hit = findQuestion(exam, no)
      if (hit === null) return `第 ${no} 题`
      const part = String(hit.part.label ?? '').replace(/^Part\s+/i, '').split('·')[0].trim()
      const section = hit.section.id ? ` ${hit.section.id}` : ''
      return `${part}${section} · 第 ${no} 题`
    }

    /** Decide whether a selected run is a word, a phrase or a sentence. */
    function classifySelection(text) {
      const clean = String(text ?? '').trim().replace(/\s+/g, ' ')
      if (clean === '') return 'sentence'
      const words = clean.split(' ')
      if (words.length === 1) return 'word'
      if (words.length <= 6) return 'phrase'
      return 'sentence'
    }

    /** Build one collected item. */
    function makeTrayItem({ text, kind, gloss = '', examId, where = '' }) {
      return {
        id: `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`,
        text: String(text).trim(),
        kind,
        gloss,
        examId,
        where,
        at: new Date().toISOString(),
      }
    }

    /** Compose the one chat message the whole tray becomes. */
    function buildPublishText(items, exam, t) {
      const title = exam?.title ?? exam?.id ?? '四级真题'
      const lines = [
        `下面是我在《${title}》里划出来的内容，请帮我逐个讲清楚：词性、常见搭配和例句；短语说明使用条件；句子先直译再说明难点。最后请把其中的单词和短语按我的生词表格式整理。`,
        '',
      ]
      items.forEach((item, index) => {
        const kind = t(`kind.${item.kind}`)
        const where = item.where ? `（${item.where}）` : ''
        const gloss = item.gloss ? ` —— 我的理解：${item.gloss}` : ''
        lines.push(`${index + 1}. [${kind}] ${item.text}${where}${gloss}`)
      })
      return lines.join('\n')
    }

    /** 将单词和短语写入 CSV，并保留试卷及原文位置。 */
    async function saveTrayToTables(items) {
      const payload = items
        .filter((item) => item.kind === 'word' || item.kind === 'phrase')
        .map((item) => ({ type: item.kind, term: item.text, gloss: item.gloss, source: [item.examId, item.where].filter(Boolean).join(' / ') }))
      if (payload.length === 0) return { added: [], skipped: [] }
      const result = await api('/vocab', { method: 'POST', body: { items: payload } })
      return result
    }

    /** Short Chinese name of a part, for the compact chips. */
    const PART_NAMES = { writing: '写作', listening: '听力', reading: '阅读', translation: '翻译' }

    /** Part chip text: roman numeral plus the short Chinese name. */
    function partChip(part) {
      if (!part) return ''
      const label = String(part.label ?? '')
      const roman = (/Part\s+([IVX]+)/i.exec(label) ?? [])[1]
      const name = PART_NAMES[part.id] ?? label.replace(/^Part\s+[IVX]+\s*·?\s*/i, '')
      return [roman, name].filter(Boolean).join(' ')
    }

    /** Section chip text: the readable tail of an official section label. */
    function sectionChip(entry) {
      const label = String(entry.sectionLabel ?? entry.sectionId ?? '')
      const tail = label.split('·').pop().trim()
      return tail === '' ? label : tail
    }

    // ---- src/30-views.js ----
    /**
     * CET-4 Practice — presentational views. Every component here is pure: it
     * renders props and reports intent through callbacks.
     */

    /** A ghost toolbar button. */
    function ToolButton({ children, onClick, on, disabled, title, tone, act }) {
      return h(
        'button',
        {
          type: 'button',
          className: 'cet4-btn',
          'data-act': act,
          'data-on': on === true ? 'true' : undefined,
          'data-tone': tone,
          disabled: disabled === true,
          title,
          onClick,
        },
        children,
      )
    }

    /** The mode switcher. */
    function ModeTabs({ t, value, counts, onChange }) {
      return h(
        'div',
        { className: 'cet4-tabs' },
        MODES.map((mode) =>
          h(
            'button',
            {
              key: mode,
              type: 'button',
              className: 'cet4-btn',
              'data-on': value === mode ? 'true' : undefined,
              onClick: () => onChange(mode),
            },
            t(`mode.${mode}`),
            counts?.[mode] ? h('span', { className: 'cet4-chip' }, counts[mode]) : null,
          ),
        ),
      )
    }

    /** Lettered directions block. */
    function Directions({ text }) {
      if (!text) return null
      return h('p', { className: 'cet4-directions' }, text)
    }

    /** Prose with preserved paragraph breaks. */
    function Prose({ text, onSelect }) {
      if (!text) return null
      const paragraphs = String(text).split(/\n{2,}/)
      return h(
        'div',
        { className: 'cet4-prose', onMouseUp: onSelect },
        paragraphs.map((paragraph, index) =>
          h('p', { key: index }, paragraph.split('\n').map((line, lineIndex) => (lineIndex === 0 ? line : [h('br', { key: lineIndex }), line]))),
        ),
      )
    }

    /** One multiple-choice question. */
    function Mcq({ t, question, chosen, marked, revealed, locked, onChoose, onToggleMark }) {
      const options = question.options ?? {}
      const letters = Object.keys(options).sort()
      const answer = question.answer
      const isRight = revealed && chosen === answer
      const isWrong = revealed && chosen !== undefined && chosen !== answer
      return h(
        'div',
        { className: 'cet4-q', id: `cet4-q-${question.no}`, 'data-qno': question.no, 'data-marked': marked ? 'true' : undefined },
        h(
          'div',
          { className: 'cet4-q-head' },
          h('span', { className: 'cet4-q-no' }, question.no),
          h('div', { className: 'cet4-q-stem' }, question.stem ?? ''),
          h(
            'div',
            { className: 'cet4-q-tools' },
            h(
              ToolButton,
              { on: marked, act: 'mark', title: marked ? t('unmark') : t('mark'), onClick: () => onToggleMark(question.no) },
              marked ? '已标记' : t('mark'),
            ),
          ),
        ),
        h(
          'div',
          { className: 'cet4-opts' },
          letters.map((letter) =>
            h(
              'button',
              {
                key: letter,
                type: 'button',
                className: 'cet4-opt',
                'data-chosen': chosen === letter ? 'true' : undefined,
                'data-answer': revealed && answer === letter ? 'true' : undefined,
                'data-wrong': revealed && chosen === letter && answer !== letter ? 'true' : undefined,
                disabled: locked === true,
                onClick: () => onChoose(question.no, letter),
              },
              h('span', { className: 'cet4-opt-letter' }, `${letter})`),
              h('span', null, options[letter]),
            ),
          ),
        ),
        revealed || chosen !== undefined
          ? h(
              'div',
              { className: 'cet4-q-foot' },
              revealed
                ? h('span', { className: 'cet4-verdict', 'data-ok': isRight ? 'true' : 'false' }, isRight ? t('answer.correct') : isWrong ? t('answer.wrong') : t('answer.blank'))
                : null,
              revealed ? h('span', null, `答案 ${answer}`) : null,
            )
          : null,
      )
    }

    /** The 26–35 word-bank section: passage chips plus a clickable bank. */
    function WordBankView({ t, section, answers, revealed, activeBlank, onActivateBlank, onAssign }) {
      const bank = section.wordBank ?? []
      const parts = String(section.passage ?? '').split(/(___\d+___)/g)
      const used = new Set(Object.values(answers ?? {}))
      return h(
        'div',
        null,
        h(
          'div',
          { className: 'cet4-paper' },
          h(
            'div',
            { className: 'cet4-prose' },
            parts.map((fragment, index) => {
              const match = /^___(\d+)___$/.exec(fragment)
              if (match === null) return h('span', { key: index }, fragment)
              const no = Number(match[1])
              const chosen = answers?.[no]
              const correct = section.questions?.find((question) => question.no === no)?.answer
              const ok = revealed && chosen !== undefined ? chosen === correct : undefined
              return h(
                'button',
                {
                  key: index,
                  type: 'button',
                  className: 'cet4-blank',
                  'data-filled': chosen ? 'true' : undefined,
                  'data-active': activeBlank === no ? 'true' : undefined,
                  'data-ok': ok === undefined ? undefined : ok ? 'true' : 'false',
                  onClick: () => onActivateBlank(no),
                },
                chosen ?? no,
              )
            }),
          ),
        ),
        activeBlank !== undefined
          ? h('p', { className: 'cet4-directions' }, t('blank.active', { n: activeBlank }))
          : null,
        h(
          'div',
          { className: 'cet4-bank' },
          bank.map((entry) =>
            h(
              'button',
              {
                key: entry.letter,
                type: 'button',
                className: 'cet4-word',
                'data-used': used.has(entry.letter) ? 'true' : undefined,
                onClick: () => (activeBlank === undefined ? onActivateBlank(null) : onAssign(activeBlank, entry.letter)),
              },
              h('span', { className: 'cet4-word-letter' }, entry.letter),
              entry.word,
            ),
          ),
        ),
      )
    }

    /** The 36–45 paragraph-matching section. */
    function MatchView({ t, section, answers, revealed, onAssign }) {
      const paragraphs = section.paragraphs ?? []
      const letters = paragraphs.map((paragraph) => paragraph.letter)
      return h(
        'div',
        null,
        section.passageTitle ? h('div', { className: 'cet4-section-label' }, section.passageTitle) : null,
        h(
          'div',
          { className: 'cet4-paper' },
          paragraphs.map((paragraph) =>
            h(
              'p',
              { key: paragraph.letter, className: 'cet4-prose' },
              h('span', { className: 'cet4-para-letter' }, paragraph.letter),
              paragraph.text,
            ),
          ),
        ),
        h('p', { className: 'cet4-directions' }, t('match.hint')),
        (section.questions ?? []).map((question) => {
          const chosen = answers?.[question.no]
          const ok = revealed && chosen !== undefined ? chosen === question.answer : undefined
          return h(
            'div',
            { key: question.no, className: 'cet4-q', id: `cet4-q-${question.no}`, 'data-qno': question.no },
            h(
              'div',
              { className: 'cet4-q-head' },
              h('span', { className: 'cet4-q-no' }, question.no),
              h('div', { className: 'cet4-q-stem' }, question.stem ?? ''),
              h(
                'select',
                {
                  className: 'cet4-select',
                  value: chosen ?? '',
                  onChange: (event) => onAssign(question.no, event.target.value || undefined),
                },
                h('option', { value: '' }, '—'),
                letters.map((letter) => h('option', { key: letter, value: letter }, letter)),
              ),
              revealed
                ? h('span', { className: 'cet4-verdict', 'data-ok': ok ? 'true' : 'false' }, ok ? question.answer : `答案 ${question.answer}`)
                : null,
            ),
          )
        }),
      )
    }

    /** A standalone question group used by listening and careful reading. */
    function QuestionGroup({ t, questions, answers, marks, revealed, onChoose, onToggleMark }) {
      return h(
        'div',
        null,
        (questions ?? []).map((question) =>
          h(Mcq, {
            key: question.no,
            t,
            question,
            chosen: answers?.[question.no],
            marked: marks?.[question.no] !== undefined,
            revealed,
            onChoose,
            onToggleMark,
          }),
        ),
      )
    }

    /** The notes tab. */
    function NotesPane({ t, notes, marks, scope, onScope, onAdd, onDelete, onGoto }) {
      const [text, setText] = React.useState('')
      const [quote, setQuote] = React.useState(null)
      const grouped = React.useMemo(() => {
        const list = scope === 'all' ? notes : notes.filter((note) => note.scope === scope)
        return list.slice().sort((left, right) => String(right.at).localeCompare(String(left.at)))
      }, [notes, scope])
      const marked = React.useMemo(() => Object.keys(marks ?? {}).map(Number).sort((a, b) => a - b), [marks])
      const submit = () => {
        const value = text.trim()
        if (value === '' && quote === null) return
        onAdd({ text: value, quote })
        setText('')
        setQuote(null)
      }
      return h(
        'div',
        null,
        h(
          'div',
          { className: 'cet4-toolbar' },
          h(ToolButton, { on: scope !== 'all', onClick: () => onScope(scope === 'all' ? 'part' : 'all') }, scope === 'all' ? t('notes.all') : t('notes.tab')),
          h('div', { className: 'cet4-spacer' }),
          marked.length > 0 ? h('span', { className: 'cet4-chip' }, `${t('marks')} ${marked.length}`) : null,
        ),
        quote !== null
          ? h(
              'div',
              { className: 'cet4-quote' },
              `${t('notes.quoted')}${quote.label}`,
              h('div', null, quote.text),
            )
          : null,
        h('textarea', {
          className: 'cet4-textarea',
          placeholder: t('notes.placeholder'),
          value: text,
          onChange: (event) => setText(event.target.value),
          onKeyDown: (event) => {
            if ((event.metaKey || event.ctrlKey) && event.key === 'Enter') submit()
          },
        }),
        h(
          'div',
          { className: 'cet4-toolbar' },
          h(ToolButton, { act: 'note-add', onClick: submit }, t('notes.add')),
          quote !== null
            ? h(ToolButton, { onClick: () => setQuote(null) }, t('selection.clear'))
            : null,
          marked.length > 0
            ? h(
                'select',
                {
                  className: 'cet4-select',
                  value: '',
                  onChange: (event) => {
                    const no = Number(event.target.value)
                    if (!Number.isFinite(no) || no === 0) return
                    const hit = marked.includes(no) ? no : null
                    if (hit === null) return
                    setQuote({ text: `第 ${no} 题`, label: `第 ${no} 题`, no })
                  },
                },
                h('option', { value: '' }, `${t('notes.quote')}…`),
                marked.map((no) => h('option', { key: no, value: no }, `第 ${no} 题`)),
              )
            : null,
        ),
        grouped.length === 0
          ? h('div', { className: 'cet4-empty' }, t('notes.empty'))
          : grouped.map((note) =>
              h(
                'div',
                { key: note.id, className: 'cet4-note' },
                h(
                  'div',
                  { className: 'cet4-note-head' },
                  note.quote ? h('span', { className: 'cet4-chip' }, note.quote.label ?? t('notes.marked')) : null,
                  h('span', null, String(note.at ?? '').slice(0, 16).replace('T', ' ')),
                  h('div', { className: 'cet4-spacer' }),
                  note.questionNo ? h(ToolButton, { onClick: () => onGoto(note.questionNo) }, t('notes.goto')) : null,
                  h(ToolButton, { onClick: () => onDelete(note.id) }, t('notes.delete')),
                ),
                note.quote && note.quote.text ? h('div', { className: 'cet4-quote' }, note.quote.text) : null,
                note.text ? h('div', { className: 'cet4-note-text' }, note.text) : null,
              ),
            ),
      )
    }

    /** The collection tray. */
    function TrayPane({ t, items, onGloss, onRemove, onPublish, onSave, publishing }) {
      if (items.length === 0) return h('div', { className: 'cet4-empty' }, t('tray.empty'))
      return h(
        'div',
        null,
        h(
          'div',
          { className: 'cet4-toolbar' },
          h('span', { className: 'cet4-chip' }, t('tray.count', { n: items.length })),
          h('div', { className: 'cet4-spacer' }),
          h(ToolButton, { act: 'tray-save', onClick: onSave, disabled: publishing }, t('tray.save')),
          h(ToolButton, { act: 'tray-publish', onClick: onPublish, disabled: publishing, tone: 'ok' }, t('tray.publish')),
        ),
        items.map((item) =>
          h(
            'div',
            { key: item.id, className: 'cet4-tray-item' },
            h(
              'div',
              { className: 'cet4-tray-text' },
              h(
                'div',
                { className: 'cet4-tray-term' },
                h('span', { className: 'cet4-chip' }, t(`kind.${item.kind}`)),
                ' ',
                item.text,
              ),
              h('div', { className: 'cet4-tray-where' }, item.where ?? ''),
              h('input', {
                className: 'cet4-input',
                style: { marginTop: 4 },
                placeholder: t('tray.glossPlaceholder'),
                value: item.gloss ?? '',
                onChange: (event) => onGloss(item.id, event.target.value),
              }),
            ),
            h(ToolButton, { title: t('tray.remove'), onClick: () => onRemove(item.id) }, '×'),
          ),
        ),
      )
    }

    /** The two workspace word tables. */
    function VocabPane({ t, words, phrases, onRefresh, loading }) {
      const table = (rows) =>
        rows.length === 0
          ? h('div', { className: 'cet4-empty' }, t('vocab.empty'))
          : h(
              'table',
              { className: 'cet4-vocab-table' },
              h(
                'tbody',
                null,
                rows.map((row) => h('tr', { key: row.term }, h('td', { className: 'cet4-vocab-term' }, row.term), h('td', { className: 'cet4-vocab-gloss' }, row.gloss))),
              ),
            )
      return h(
        'div',
        null,
        h(
          'div',
          { className: 'cet4-toolbar' },
          h('span', { className: 'cet4-chip' }, `${t('vocab.words')} ${words.length}`),
          h('span', { className: 'cet4-chip' }, `${t('vocab.phrases')} ${phrases.length}`),
          h('div', { className: 'cet4-spacer' }),
          h(ToolButton, { onClick: onRefresh, disabled: loading }, t('vocab.refresh')),
        ),
        h('div', { className: 'cet4-vocab-head' }, t('vocab.words')),
        table(words),
        h('div', { className: 'cet4-vocab-head' }, t('vocab.phrases')),
        table(phrases),
      )
    }

    /** The custom draft box for writing and translation. */
    function DraftPane({ t, value, onChange, placeholder, footer, minHeight }) {
      return h(
        'div',
        null,
        h('textarea', {
          className: 'cet4-textarea',
          style: minHeight ? { minHeight } : undefined,
          placeholder,
          value: value ?? '',
          onChange: (event) => onChange(event.target.value),
        }),
        footer ? h('div', { className: 'cet4-q-foot' }, footer) : null,
      )
    }

    /** The marks list. */
    function MarksPane({ t, exam, marks, notes, onGoto, onUnmark }) {
      const numbers = Object.keys(marks ?? {}).map(Number).sort((a, b) => a - b)
      const notesByQuestion = new Map()
      for (const note of notes ?? []) {
        if (note.questionNo !== undefined) notesByQuestion.set(note.questionNo, (notesByQuestion.get(note.questionNo) ?? 0) + 1)
      }
      if (numbers.length === 0) return h('div', { className: 'cet4-empty' }, t('marks.empty'))
      return h(
        'div',
        null,
        numbers.map((no) =>
          h(
            'div',
            { key: no, className: 'cet4-mark-row', onClick: () => onGoto(no) },
            h('span', { className: 'cet4-q-no' }, no),
            h('span', { style: { flex: 1, fontSize: 12.5 } }, whereOf(exam, no)),
            notesByQuestion.has(no) ? h('span', { className: 'cet4-chip' }, `${t('notes.title')} ${notesByQuestion.get(no)}`) : null,
            h(ToolButton, { onClick: (event) => (event.stopPropagation(), onUnmark(no)) }, t('unmark')),
          ),
        ),
      )
    }

    // ---- src/40-panel.js ----
    /**
     * CET-4 Practice — the panel: navigation, practice flow, notes, tray.
     */
    function Panel(props) {
      const t = translator(props)
      const inputActions = props?.inputActions
      const [catalog, reloadCatalog] = useCatalog()
      const study = useStudyState()
      const [mode, setMode] = React.useState('practice')
      const [examId, setExamId] = React.useState('')
      const [cursor, setCursor] = React.useState({ partId: '', sectionId: null })
      const [activeBlank, setActiveBlank] = React.useState(undefined)
      const [selection, setSelection] = React.useState(null)
      const [toast, showToast] = useToast()
      const [vocab, setVocab] = React.useState({ words: [], phrases: [], loading: false })
      const [publishing, setPublishing] = React.useState(false)
      const [noteScope, setNoteScope] = React.useState('part')
      const bodyRef = React.useRef(null)
      const panelRef = React.useRef(null)

      React.useEffect(() => {
        api('/client', { method: 'POST', body: { event: 'panel-mounted' } }).catch(() => {})
      }, [])

      const exams = catalog.exams ?? []
      const effectiveExamId = examId || exams[0]?.id || ''
      const examResult = useExam(effectiveExamId)
      const exam = examResult.exam
      const examState = React.useMemo(
        () => ({ ...emptyExamState(), ...(study.state.exams?.[effectiveExamId] ?? {}) }),
        [study.state.exams, effectiveExamId],
      )
      const sections = React.useMemo(() => sectionsOf(exam), [exam])
      const activeSection = React.useMemo(() => {
        if (sections.length === 0) return null
        const found = sections.find((entry) => entry.partId === cursor.partId && entry.sectionId === cursor.sectionId)
        return found ?? sections[0]
      }, [sections, cursor])
      const sectionKey = activeSection ? `${activeSection.partId}:${activeSection.sectionId ?? 'all'}` : 'none'
      const revealed = examState.revealed?.[sectionKey] === true
      const answers = examState.answers ?? {}
      const marks = examState.marks ?? {}
      const numbers = React.useMemo(() => questionNumbers(exam), [exam])
      const answered = React.useMemo(() => numbers.filter((no) => answers[no] !== undefined).length, [numbers, answers])
      const tray = study.state.tray ?? []

      /** Restore the last place once the paper arrives. */
      React.useEffect(() => {
        if (!exam || sections.length === 0) return
        setCursor((previous) => {
          if (previous.partId !== '') return previous
          const saved = sections.find((entry) => entry.partId === examState.part && entry.sectionId === examState.section)
          const first = saved ?? sections[0]
          return { partId: first.partId, sectionId: first.sectionId }
        })
      }, [exam, sections, examState.part, examState.section])

      /** Keep the saved cursor in the study state. */
      React.useEffect(() => {
        if (!effectiveExamId || cursor.partId === '') return
        study.updateExam(effectiveExamId, (current) => ({ ...current, part: cursor.partId, section: cursor.sectionId }))
      }, [cursor, effectiveExamId])

      /** Load the workspace tables when the tab is shown. */
      const loadVocab = React.useCallback(() => {
        setVocab((previous) => ({ ...previous, loading: true }))
        api('/vocab')
          .then((payload) => setVocab({ words: payload.words ?? [], phrases: payload.phrases ?? [], loading: false }))
          .catch(() => setVocab((previous) => ({ ...previous, loading: false })))
      }, [])
      React.useEffect(() => {
        if (mode === 'vocab') loadVocab()
      }, [mode, loadVocab])

      const parts = exam?.parts ?? []
      const partSections = sections.filter((entry) => entry.partId === activeSection?.partId)

      const goSection = (entry) => {
        setCursor({ partId: entry.partId, sectionId: entry.sectionId })
        setActiveBlank(undefined)
        setSelection(null)
        const body = bodyRef.current
        if (body) body.scrollTop = 0
      }

      const patch = (mutate) => study.updateExam(effectiveExamId, mutate)

      const onChoose = (no, letter) =>
        patch((current) => {
          const answersNext = { ...current.answers }
          if (letter === undefined) delete answersNext[no]
          else answersNext[no] = letter
          return { ...current, answers: answersNext }
        })
      const onAssignBlank = (no, letter) => {
        patch((current) => ({ ...current, answers: { ...current.answers, [no]: letter } }))
        setActiveBlank(undefined)
      }
      const onToggleMark = (no) =>
        patch((current) => {
          const marksNext = { ...current.marks }
          if (marksNext[no] !== undefined) delete marksNext[no]
          else marksNext[no] = { at: new Date().toISOString() }
          return { ...current, marks: marksNext }
        })
      const onUnmark = (no) =>
        patch((current) => {
          const marksNext = { ...current.marks }
          delete marksNext[no]
          return { ...current, marks: marksNext }
        })
      const onReveal = () => patch((current) => ({ ...current, revealed: { ...current.revealed, [sectionKey]: !revealed } }))
      const onDraft = (key, value) => patch((current) => ({ ...current, drafts: { ...current.drafts, [key]: value } }))

      const addNote = ({ text, quote }) => {
        const note = {
          id: `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`,
          text,
          quote: quote ?? null,
          scope: sectionKey,
          partId: activeSection?.partId,
          questionNo: quote?.no,
          at: new Date().toISOString(),
        }
        patch((current) => ({ ...current, notes: [note, ...(current.notes ?? [])] }))
        showToast(t('saved'))
      }
      const deleteNote = (id) => patch((current) => ({ ...current, notes: (current.notes ?? []).filter((note) => note.id !== id) }))
      const gotoQuestion = (no) => {
        const hit = findQuestion(exam, no)
        if (hit === null) return
        const entry = sections.find((candidate) => candidate.partId === hit.part.id && candidate.sectionId === hit.section.id)
        if (entry) goSection(entry)
        setMode('practice')
        requestAnimationFrame(() => {
          const node = document.getElementById(`cet4-q-${no}`)
          if (node) node.scrollIntoView({ block: 'center', behavior: 'smooth' })
        })
      }

      // ---- selection collection ------------------------------------------------

      const onBodyMouseUp = () => {
        const body = bodyRef.current
        const panelNode = panelRef.current
        if (!body || !panelNode) return
        const sel = window.getSelection()
        if (!sel || sel.isCollapsed || sel.rangeCount === 0) {
          setSelection(null)
          return
        }
        const range = sel.getRangeAt(0)
        if (!body.contains(range.commonAncestorContainer)) return
        const text = sel.toString().replace(/\s+/g, ' ').trim()
        if (text.length < 1 || text.length > 400) return
        const rect = range.getBoundingClientRect()
        const questionNode = range.commonAncestorContainer.nodeType === 1 ? range.commonAncestorContainer : range.commonAncestorContainer.parentElement
        const questionEl = questionNode?.closest?.('[data-qno]')
        const no = questionEl ? Number(questionEl.getAttribute('data-qno')) : undefined
        setSelection({
          text,
          kind: classifySelection(text),
          where: no !== undefined ? whereOf(exam, no) : activeSection?.sectionLabel ?? '',
          questionNo: no,
          x: Math.min(Math.max(12, rect.left + rect.width / 2), window.innerWidth - 210),
          y: Math.max(60, rect.top - 44),
        })
      }

      const takeSelection = (kind) => {
        if (!selection) return
        const item = makeTrayItem({
          text: selection.text,
          kind,
          examId: effectiveExamId,
          where: selection.where,
        })
        study.updateTray((current) => [...current, item])
        setSelection(null)
        window.getSelection?.()?.removeAllRanges?.()
        showToast(`${t('selection.take')} · ${t(`kind.${kind}`)}`)
      }

      // ---- tray actions --------------------------------------------------------

      const publishTray = () => {
        if (tray.length === 0) return
        if (!inputActions || typeof inputActions.setDraft !== 'function') {
          showToast(t('tray.noHost'))
          return
        }
        const text = buildPublishText(tray, exam, t)
        try {
          let inserted = false
          if (typeof inputActions.captureInsertion === 'function' && typeof inputActions.insertText === 'function') {
            const span = inputActions.captureInsertion()
            inserted = inputActions.insertText(text, span) === true
          }
          if (!inserted) inputActions.setDraft(text)
          showToast(t('tray.published'))
        } catch (error) {
          console.error('[cet4-study] publish failed', error)
          showToast(String(error))
        }
      }

      const saveTray = async () => {
        setPublishing(true)
        try {
          const result = await saveTrayToTables(tray)
          showToast(`${t('tray.saved')} +${result.added?.length ?? 0}`)
          loadVocab()
        } catch (error) {
          showToast(String(error))
        } finally {
          setPublishing(false)
        }
      }

      // ---- render --------------------------------------------------------------

      if (catalog.phase === 'loading') return h('div', { className: 'cet4-panel' }, h('div', { className: 'cet4-empty' }, t('loading')))
      if (catalog.phase === 'failed') {
        return h(
          'div',
          { className: 'cet4-panel' },
          h(
            'div',
            { className: 'cet4-empty' },
            `${t('failed')}: ${catalog.error ?? ''}`,
            h('div', null, h(ToolButton, { onClick: reloadCatalog }, t('retry'))),
          ),
        )
      }
      if (exams.length === 0) return h('div', { className: 'cet4-panel' }, h('div', { className: 'cet4-empty' }, t('emptyExam')))
      if (examResult.phase === 'failed') {
        return h('div', { className: 'cet4-panel' }, h('div', { className: 'cet4-empty' }, `${t('failed')}: ${examResult.error ?? ''}`))
      }
      if (!exam) return h('div', { className: 'cet4-panel' }, h('div', { className: 'cet4-empty' }, t('loading')))

      const counts = { tray: tray.length }
      const title = exam.title ?? exam.id

      return h(
        'div',
        { className: 'cet4-panel', ref: panelRef, style: { position: 'relative' } },
        h(
          'div',
          { className: 'cet4-head' },
          h(
            'div',
            { className: 'cet4-title-row' },
            h('span', { className: 'cet4-title' }, t('title')),
            h('span', { className: 'cet4-title-meta' }, title),
            h(
              'div',
              { className: 'cet4-title-actions' },
              exams.length > 1
                ? h(
                    'select',
                    {
                      className: 'cet4-select',
                      value: effectiveExamId,
                      onChange: (event) => {
                        setExamId(event.target.value)
                        setCursor({ partId: '', sectionId: null })
                      },
                      title: t('pickExam'),
                    },
                    exams.map((entry) => h('option', { key: entry.id, value: entry.id }, entry.id)),
                  )
                : null,
            ),
          ),
          h(
            'div',
            { className: 'cet4-toolbar' },
            h(ModeTabs, { t, value: mode, counts, onChange: setMode }),
            h('div', { className: 'cet4-spacer' }),
            mode === 'practice'
              ? h(ToolButton, { on: revealed, act: 'reveal', onClick: onReveal }, revealed ? t('hide') : t('reveal'))
              : null,
          ),
          mode === 'practice'
            ? h(
                'div',
                { className: 'cet4-partbar' },
                parts.map((part) =>
                  h(
                    'button',
                    {
                      key: part.id,
                      type: 'button',
                      className: 'cet4-part',
                      'data-active': part.id === activeSection?.partId ? 'true' : undefined,
                      onClick: () => {
                        const first = sections.find((entry) => entry.partId === part.id)
                        if (first) goSection(first)
                      },
                    },
                    partChip(part),
                  ),
                ),
              )
            : null,
          mode === 'practice' && partSections.length > 1
            ? h(
                'div',
                { className: 'cet4-partbar' },
                partSections.map((entry) =>
                  h(
                    'button',
                    {
                      key: `${entry.partId}-${entry.sectionId}`,
                      type: 'button',
                      className: 'cet4-part',
                      'data-active': entry.partId === activeSection?.partId && entry.sectionId === activeSection?.sectionId ? 'true' : undefined,
                      onClick: () => goSection(entry),
                    },
                    sectionChip(entry),
                  ),
                ),
              )
            : null,
        ),
        h(
          'div',
          { className: 'cet4-body cet4-scroll-thin', ref: bodyRef, onMouseUp: onBodyMouseUp },
          h('div', { className: 'cet4-body-inner' }, renderBody()),
        ),
        h(
          'div',
          { className: 'cet4-foot-hint' },
          mode === 'practice'
            ? t('progress', { done: answered, total: numbers.length, marks: Object.keys(marks).length })
            : mode === 'tray'
              ? t('footer.hint')
              : t('vocab.count', { n: vocab.words.length + vocab.phrases.length }),
        ),
        selection !== null
          ? h(
              'div',
              { className: 'cet4-grab', style: { left: selection.x, top: selection.y } },
              h(ToolButton, { onClick: () => takeSelection('word') }, t('kind.word')),
              h(ToolButton, { onClick: () => takeSelection('phrase') }, t('kind.phrase')),
              h(ToolButton, { onClick: () => takeSelection('sentence') }, t('kind.sentence')),
              h(ToolButton, { onClick: () => setSelection(null) }, '×'),
            )
          : null,
        toast !== null ? h('div', { className: 'cet4-toast' }, toast) : null,
      )

      function renderBody() {
        if (mode === 'tray') {
          return h(TrayPane, {
            t,
            items: tray,
            publishing,
            onGloss: (id, gloss) =>
              study.updateTray((current) => current.map((item) => (item.id === id ? { ...item, gloss } : item))),
            onRemove: (id) => study.updateTray((current) => current.filter((item) => item.id !== id)),
            onPublish: publishTray,
            onSave: saveTray,
          })
        }
        if (mode === 'vocab') {
          return h(VocabPane, { t, words: vocab.words, phrases: vocab.phrases, onRefresh: loadVocab, loading: vocab.loading })
        }
        if (mode === 'marks') {
          return h(MarksPane, {
            t,
            exam,
            marks,
            notes: examState.notes ?? [],
            onGoto: gotoQuestion,
            onUnmark,
          })
        }
        if (mode === 'notes') {
          const scoped = noteScope === 'all' ? 'all' : sectionKey
          return h(NotesPane, {
            t,
            notes: examState.notes ?? [],
            marks,
            scope: scoped,
            onScope: (next) => setNoteScope(next === 'all' ? 'all' : 'part'),
            onAdd: addNote,
            onDelete: deleteNote,
            onGoto: gotoQuestion,
          })
        }
        return renderPractice()
      }

      function renderPractice() {
        if (!activeSection) return h('div', { className: 'cet4-empty' }, t('emptyExam'))
        const section = activeSection.section
        const header = h(
          'div',
          null,
          h('div', { className: 'cet4-section-label' }, `${partChip(activeSection.part ?? { id: activeSection.partId, label: activeSection.partLabel })}${activeSection.sectionId ? ' · ' + sectionChip(activeSection) : ''}`),
          activeSection.section?.directions ? h(Directions, { text: activeSection.section.directions }) : null,
        )

        if (section.kind === 'writing') {
          const draft = examState.drafts?.writing ?? ''
          return h(
            'div',
            null,
            header,
            h(Prose, { text: section.prompt ?? section.directions ?? '' }),
            h(DraftPane, {
              t,
              value: draft,
              placeholder: t('writing.placeholder'),
              onChange: (value) => onDraft('writing', value),
              minHeight: 260,
              footer: h('span', null, t('wordcount', { n: (draft.trim().match(/\S+/g) ?? []).length })),
            }),
          )
        }

        if (section.kind === 'translation') {
          return h(
            'div',
            null,
            header,
            h('div', { className: 'cet4-paper' }, h(Prose, { text: section.chinese ?? '' })),
            h(DraftPane, {
              t,
              value: examState.drafts?.translation ?? '',
              placeholder: t('translation.placeholder'),
              onChange: (value) => onDraft('translation', value),
              minHeight: 200,
            }),
          )
        }

        if (section.id === 'A' && Array.isArray(section.wordBank)) {
          return h(
            'div',
            null,
            header,
            h(WordBankView, {
              t,
              section,
              answers,
              revealed,
              activeBlank,
              onActivateBlank: setActiveBlank,
              onAssign: onAssignBlank,
            }),
          )
        }

        if (Array.isArray(section.paragraphs)) {
          return h('div', null, header, h(MatchView, { t, section, answers, revealed, onAssign: onChoose }))
        }

        if (Array.isArray(section.passages)) {
          return h(
            'div',
            null,
            header,
            section.passages.map((passage) =>
              h(
                'div',
                { key: passage.title },
                h('div', { className: 'cet4-section-label' }, passage.title),
                h('div', { className: 'cet4-paper' }, h(Prose, { text: passage.text })),
                h(QuestionGroup, { t, questions: passage.questions, answers, marks, revealed, onChoose, onToggleMark }),
              ),
            ),
          )
        }

        if (Array.isArray(section.groups)) {
          return h(
            'div',
            null,
            header,
            section.groups.map((group) =>
              h(
                'div',
                { key: group.id },
                group.intro ? h('p', { className: 'cet4-directions' }, group.intro) : null,
                h(QuestionGroup, { t, questions: group.questions, answers, marks, revealed, onChoose, onToggleMark }),
              ),
            ),
          )
        }

        return h('div', { className: 'cet4-empty' }, t('emptyExam'))
      }
    }

    /**
     * Keeps one bad render from blanking the whole tab: reports the failure and
     * shows the reason in place.
     */
    class PanelBoundary extends React.Component {
      constructor(props) {
        super(props)
        this.state = { error: null }
      }
      static getDerivedStateFromError(error) {
        return { error }
      }
      componentDidCatch(error, info) {
        console.error('[cet4-study] panel crashed', error, info)
        api('/client', {
          method: 'POST',
          body: { event: 'panel-crashed', info: { message: String(error?.message ?? error) } },
        }).catch(() => {})
      }
      render() {
        if (this.state.error !== null) {
          return h(
            'div',
            { className: 'cet4-panel' },
            h(
              'div',
              { className: 'cet4-empty' },
              `面板出错了：${String(this.state.error?.message ?? this.state.error)}`,
              h('div', null, '详细信息在控制台；重新加载页面或重开面板可恢复。'),
            ),
          )
        }
        return this.props.children
      }
    }

    /** Slot component: the panel behind its crash boundary. */
    function PanelEntry(props) {
      return h(PanelBoundary, null, h(Panel, props))
    }

    // ---- src/90-apply.js ----
    /**
     * CET-4 Practice — plugin wiring.
     *
     * Registers one right-sidebar tab type (with a guide entry, so expanding the
     * column opens the paper) and a compact control beside the composer.
     */
    const inject = ['slots', 'locale', 'sidebarRightTabs', 'sidebarRight']

    /** Small open control in the composer tool row. */
    function OpenButton() {
      return h(
        'button',
        {
          type: 'button',
          title: '四级精练',
          'aria-label': '四级精练',
          onClick: () => {
            try {
              openPanel()
            } catch (error) {
              console.error('[cet4-study] open failed', error)
            }
          },
          style: {
            display: 'inline-flex',
            alignItems: 'center',
            height: 28,
            padding: '0 8px',
            borderRadius: 8,
            border: 'none',
            background: 'transparent',
            color: 'var(--dsw-alias-label-secondary)',
            font: 'inherit',
            fontSize: 12,
            cursor: 'pointer',
          },
        },
        '四级',
      )
    }

    /** Opens the panel; replaced with the controller call during apply. */
    let openPanel = () => {}

    /** Client plugin body. */
    function apply(ctx) {
      const t = ctx.locale.bind(NS)

      ctx.effect(() => installStyles(), 'cet4-study: panel styles')
      ctx.effect(() => ctx.locale.register(NS, COPY), 'cet4-study: dictionaries')

      if (ctx.sidebarRight && typeof ctx.sidebarRight.openTab === 'function') {
        openPanel = () => ctx.sidebarRight.openTab(TAB_KIND)
      }

      ctx.effect(
        () =>
          ctx.sidebarRightTabs.register({
            id: TAB_ID,
            kind: TAB_KIND,
            priority: 'extension',
            title: () => t('tab.title'),
            guide: [
              {
                id: 'cet4-practice',
                order: 10,
                title: () => t('tab.title'),
                description: () => t('openHint'),
              },
            ],
          }),
        'cet4-study: tab type',
      )

      ctx.effect(
        () =>
          ctx.slots.inject('sidebar.right.pane.tab', () =>
            ctx.slots.register({ name: 'sidebar.right.pane.tab', key: TAB_ID, locale: NS }, PanelEntry),
          ),
        'cet4-study: panel body',
      )

      ctx.effect(
        () =>
          ctx.slots.inject('conversation.input.right', () =>
            ctx.slots.register({ name: 'conversation.input.right', id: 'cet4-open', order: 20 }, OpenButton),
          ),
        'cet4-study: open control',
      )

      // Diagnostic trail for the Host half; harmless when it cannot be sent.
      api('/client', {
        method: 'POST',
        body: { event: 'client-applied', info: { tabId: TAB_ID, kind: TAB_KIND } },
      }).catch((error) => console.error('[cet4-study] beacon failed', error))
    }

    exports.inject = inject
    exports.apply = apply

    return module.exports;
  }
});
