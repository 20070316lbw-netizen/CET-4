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
