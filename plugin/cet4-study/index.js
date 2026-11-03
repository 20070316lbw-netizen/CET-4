/**
 * CET-4 Practice — Host half.
 *
 * Registers one prefix HTTP route under `/cet4-study/api` that the browser half
 * uses for the few operations a page cannot do itself:
 *
 *   GET  ping                          liveness
 *   GET  exams                         list available structured papers
 *   GET  exam?id=<id>                  one paper
 *   GET  state                         saved answers / marks / notes / tray
 *   PUT  state                         replace saved state
 *   GET  vocab                         parsed word and phrase tables
 *   POST vocab                         append unseen entries to the tables
 *
 * Everything is local to the user's workspace folder; no session data is read
 * and nothing is sent off the machine.
 */
import { mkdir, readFile, readdir, rename, writeFile } from 'node:fs/promises'
import { tableRows, appendCsv } from './vocab-csv.js'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

/** Route prefix claimed by this plugin. */
const API_PREFIX = '/cet4-study/api'

/** Largest JSON request body accepted from the page. */
const MAX_BODY_BYTES = 2 * 1024 * 1024

/** The plugin package directory; the study folder is two levels above it. */
const packageDir = path.dirname(fileURLToPath(import.meta.url))

export const inject = ['webServer', 'connection']

/**
 * Host plugin body.
 * @param ctx - host context carrying the web server.
 * @param config - optional `{ root, examsDir, stateFile, wordTable, phraseTable }` overrides.
 */
export function apply(ctx, config = {}) {
  const options = config ?? {}
  const root = path.resolve(options.root ?? path.join(packageDir, '..', '..'))
  const examsDir = path.resolve(options.examsDir ?? path.join(packageDir, 'content', 'exams'))
  const stateFile = path.resolve(options.stateFile ?? path.join(packageDir, '.state', 'study-state.json'))
  const wordTable = path.resolve(options.wordTable ?? path.join(root, '不会的单词表.csv'))
  const phraseTable = path.resolve(options.phraseTable ?? path.join(root, '不会的短语表.csv'))

  const paths = { root, examsDir, stateFile, wordTable, phraseTable }

  ctx.effect(
    () =>
      ctx.webServer.register({
        kind: 'prefix',
        path: API_PREFIX,
        handler: async (req, res) => {
          try {
            if (rejected(ctx, req, res)) return
            await dispatch(paths, req, res)
          } catch (error) {
            sendJson(res, 500, { ok: false, error: describe(error) })
          }
        },
      }),
    'cet4-study: /cet4-study/api',
  )

  ctx.logger?.info?.(`cet4-study: serving ${API_PREFIX} for ${root}`)
}

/**
 * Answer a request whose peer is not trusted by this composition.
 * @returns true when the request was answered and must not be handled.
 */
function rejected(ctx, req, res) {
  const connection = Reflect.get(ctx, 'connection')
  const reject = connection?.requestRejection
  if (typeof reject !== 'function') return false
  const code = reject.call(connection, req)
  if (code === undefined) return false
  res.statusCode = code
  res.end()
  return true
}

/** Route on the path below the fixed prefix. */
async function dispatch(paths, req, res) {
  const url = new URL(String(req.url), 'http://localhost')
  const route = url.pathname.slice(API_PREFIX.length).replace(/\/+$/, '')
  const method = req.method ?? 'GET'

  if (route === '/ping' && method === 'GET') {
    sendJson(res, 200, { ok: true, root: paths.root, examsDir: paths.examsDir })
    return
  }

  if (route === '/exams' && method === 'GET') {
    sendJson(res, 200, { ok: true, exams: await listExams(paths.examsDir) })
    return
  }

  if (route === '/exam' && method === 'GET') {
    const id = url.searchParams.get('id') ?? ''
    if (!/^[\w.-]+$/.test(id)) {
      sendJson(res, 400, { ok: false, error: 'bad exam id' })
      return
    }
    const file = path.join(paths.examsDir, `${id}.json`)
    const text = await readFile(file, 'utf8')
    res.statusCode = 200
    res.setHeader('content-type', 'application/json; charset=utf-8')
    res.setHeader('cache-control', 'no-store')
    res.end(text)
    return
  }

  if (route === '/state' && method === 'GET') {
    sendJson(res, 200, { ok: true, state: await readState(paths.stateFile) })
    return
  }

  if (route === '/state' && (method === 'PUT' || method === 'POST')) {
    const body = await readJson(req)
    if (body === undefined || typeof body !== 'object' || body === null) {
      sendJson(res, 400, { ok: false, error: 'state must be a JSON object' })
      return
    }
    const next = { ...body, version: 1, updatedAt: new Date().toISOString() }
    await writeAtomic(paths.stateFile, `${JSON.stringify(next, null, 2)}\n`)
    sendJson(res, 200, { ok: true, updatedAt: next.updatedAt })
    return
  }

  if (route === '/client' && method === 'POST') {
    const body = await readJson(req)
    await recordClientEvent(paths.stateFile, body)
    sendJson(res, 200, { ok: true })
    return
  }

  if (route === '/vocab' && method === 'GET') {
    sendJson(res, 200, {
      ok: true,
      words: await readTable(paths.wordTable),
      phrases: await readTable(paths.phraseTable),
    })
    return
  }

  if (route === '/vocab' && method === 'POST') {
    const body = await readJson(req)
    const items = Array.isArray(body?.items) ? body.items : []
    const result = await appendVocab(paths, items)
    sendJson(res, 200, { ok: true, ...result })
    return
  }

  sendJson(res, 404, { ok: false, error: `unknown route ${method} ${route}` })
}

/** Read the paper summaries for the picker. */
async function listExams(examsDir) {
  let names = []
  try {
    names = (await readdir(examsDir)).filter((name) => name.endsWith('.json')).sort()
  } catch {
    return []
  }
  const exams = []
  for (const name of names) {
    try {
      const text = await readFile(path.join(examsDir, name), 'utf8')
      const data = JSON.parse(text)
      exams.push({
        id: data.id ?? name.replace(/\.json$/, ''),
        title: data.title ?? name,
        source: data.source ?? '',
        parts: Array.isArray(data.parts)
          ? data.parts.map((part) => ({ id: part.id, label: part.label, minutes: part.minutes ?? null }))
          : [],
      })
    } catch {
      // A malformed paper is skipped rather than breaking the whole picker.
    }
  }
  return exams
}

/**
 * Keep a short trail of browser-half events beside the saved state, so the
 * Host side can tell whether the panel really loaded on the page.
 * @param stateFile - the saved-state file whose directory receives the trail.
 * @param body - `{ event, info }` from the page.
 */
async function recordClientEvent(stateFile, body) {
  const file = path.join(path.dirname(stateFile), 'client-events.json')
  let events = []
  try {
    events = JSON.parse(await readFile(file, 'utf8'))
    if (!Array.isArray(events)) events = []
  } catch {
    events = []
  }
  events.push({
    at: new Date().toISOString(),
    event: String(body?.event ?? 'unknown'),
    info: body?.info === undefined ? null : body.info,
  })
  await writeAtomic(file, `${JSON.stringify(events.slice(-40), null, 2)}\n`)
}

/** Read the saved state, or an empty one. */
async function readState(stateFile) {
  try {
    const text = await readFile(stateFile, 'utf8')
    const parsed = JSON.parse(text)
    if (parsed && typeof parsed === 'object') return parsed
  } catch {
    // Missing or unreadable state starts empty; the page writes it back on the next change.
  }
  return { version: 1, exams: {}, tray: [] }
}

/** 读取 CSV 词表；缺失文件视为空表，其他错误交给调用方处理。 */
async function readTable(file) {
  let text = ''
  try { text = await readFile(file, 'utf8') }
  catch (error) { if (error.code !== 'ENOENT') throw error }
  return tableRows(text)
}

/**
 * Append entries the tables do not already contain.
 * @param items - `{ type: 'word' | 'phrase', term, gloss }` rows from the page.
 */
async function appendVocab(paths, items) {
  const added = []
  const skipped = []
  const groups = { word: [], phrase: [] }

  for (const item of items) {
    const type = item?.type
    const term = String(item?.term ?? '').trim().replace(/\s+/g, ' ')
    const gloss = String(item?.gloss ?? '').trim().replace(/\s+/g, ' ')
    if (type !== 'word' && type !== 'phrase') {
      skipped.push({ term, gloss, type: String(type ?? ''), reason: 'not a table entry' })
      continue
    }
    if (term === '') {
      skipped.push({ term, gloss, type, reason: 'empty term' })
      continue
    }
    groups[type].push({ term, gloss, source: String(item?.source ?? '').trim() })
  }

  for (const type of /** @type {const} */ (['word', 'phrase'])) {
    const file = type === 'word' ? paths.wordTable : paths.phraseTable
    const existing = await readTable(file)
    const seen = new Set(existing.map((row) => row.term.toLowerCase()))
    const rows = []
    for (const entry of groups[type]) {
      const key = entry.term.toLowerCase()
      if (seen.has(key)) {
        skipped.push({ ...entry, type, reason: 'already listed' })
        continue
      }
      seen.add(key)
      rows.push(entry)
      added.push({ ...entry, type })
    }
    if (rows.length === 0) continue
    await appendRows(file, rows, type === 'word' ? '单词' : '短语')
  }

  return { added, skipped }
}

/** 追加 CSV 行，缺失文件时先写表头。 */
async function appendRows(file, rows, label) {
  let text = ''
  try { text = await readFile(file, 'utf8') }
  catch (error) { if (error.code !== 'ENOENT') throw error }
  await writeAtomic(file, appendCsv(text, rows, label))
}

/** Write through a sibling temporary file so readers never see a partial table. */
async function writeAtomic(file, content) {
  await mkdir(path.dirname(file), { recursive: true })
  const temporary = `${file}.${process.pid}.${Date.now()}.tmp`
  await writeFile(temporary, content, 'utf8')
  await rename(temporary, file)
}

/** Read a size-capped JSON request body. */
async function readJson(req) {
  const chunks = []
  let total = 0
  for await (const chunk of req) {
    total += chunk.length
    if (total > MAX_BODY_BYTES) throw new Error('request body too large')
    chunks.push(chunk)
  }
  if (total === 0) return undefined
  return JSON.parse(Buffer.concat(chunks).toString('utf8'))
}

/** Send a JSON response. */
function sendJson(res, status, payload) {
  res.statusCode = status
  res.setHeader('content-type', 'application/json; charset=utf-8')
  res.setHeader('cache-control', 'no-store')
  res.end(JSON.stringify(payload))
}

/** Readable message for a thrown value. */
function describe(error) {
  if (error instanceof Error) return error.message
  return String(error)
}
