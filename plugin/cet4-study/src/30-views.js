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
