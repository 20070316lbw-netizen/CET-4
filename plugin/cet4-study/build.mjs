// Concatenate src/*.js (sorted) into the single browser bundle client.js.
// The bundle is loaded by the Harness module loader; `require` resolves only
// shared baseline modules such as react.
import { readdir, readFile, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const here = path.dirname(fileURLToPath(import.meta.url))
const srcDir = path.join(here, 'src')
const files = (await readdir(srcDir)).filter((f) => f.endsWith('.js')).sort()

const parts = []
for (const file of files) {
  const text = await readFile(path.join(srcDir, file), 'utf8')
  parts.push(`// ---- src/${file} ----\n${text.trimEnd()}\n`)
}

const bundle = `window.__ModuleLoader__.load({
  id: '@local/cet4-study',
  factory: (require) => {
    const module = { exports: {} };
    const exports = module.exports;
    const React = require('react');
${indent(parts.join('\n'), 4)}
    return module.exports;
  }
});
`

await writeFile(path.join(here, 'client.js'), bundle, 'utf8')
console.log(`client.js written from ${files.length} part(s): ${files.join(', ')}`)

function indent(text, spaces) {
  const pad = ' '.repeat(spaces)
  return text
    .split('\n')
    .map((line) => (line.length === 0 ? line : pad + line))
    .join('\n')
}
