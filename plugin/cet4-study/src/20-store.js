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
