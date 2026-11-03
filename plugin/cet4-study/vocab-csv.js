/** 读取 CSV 的引号字段，保留释义里的逗号、双引号和换行。 */
export function parseCsv(text) {
  const rows = []
  let row = [], field = '', quoted = false
  text = text.replace(/^\uFEFF/, '')
  for (let i = 0; i < text.length; i++) {
    const ch = text[i]
    if (ch === '"') {
      if (quoted && text[i + 1] === '"') { field += '"'; i++ }
      else quoted = !quoted
    } else if (ch === ',' && !quoted) { row.push(field); field = '' }
    else if ((ch === '\r' || ch === '\n') && !quoted) {
      if (ch === '\r' && text[i + 1] === '\n') i++
      row.push(field)
      if (row.some(value => value !== '')) rows.push(row)
      row = []; field = ''
    } else field += ch
  }
  if (quoted) throw Error('CSV 引号未闭合，请先修复词表')
  if (field || row.length) { row.push(field); rows.push(row) }
  return rows
}

export function csvRows(rows) {
  return rows.map(row => row.map(value => {
    const text = String(value ?? '')
    return /[,"\r\n]/.test(text) ? `"${text.replaceAll('"', '""')}"` : text
  }).join(',')).join('\n') + '\n'
}

/** 只将第一列用于去重，空释义也属于已收录词条。 */
export function tableRows(text) {
  const [header, ...rows] = parseCsv(text)
  if (!header) return []
  if (!['单词', '短语'].includes(header[0]) || header[1] !== '中文释义' || header[2] !== '出处') {
    throw Error('CSV 表头应为：单词或短语、中文释义、出处')
  }
  return rows.filter(row => row[0]?.trim()).map(([term, gloss = '', source = '']) => ({ term, gloss, source }))
}

export function appendCsv(text, rows, label) {
  tableRows(text)
  const prefix = text || csvRows([[label, '中文释义', '出处']])
  return prefix + (/[\r\n]$/.test(prefix) ? '' : '\n') + csvRows(rows.map(row => [row.term, row.gloss ?? '', row.source ?? '']))
}
