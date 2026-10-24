#!/usr/bin/env node
// Builds the EDC1 help index from help-content/<lang>/<page>.md
//
//   node scripts/build-help-index.mjs          -> writes the index files
//   node scripts/build-help-index.mjs --check  -> validates only (non-zero exit on errors)
//
// Outputs (one parser, so what users see in the Help panel == what Chat/RAG retrieves):
//   src/help/help-index.json      bundled into the app; the Help panel renders from it
//   public/help/help-index.json   same file, served at /help/help-index.json for a Chat/RAG backend
//   public/help/help-chunks.jsonl one record per H2 section per language (the RAG chunks)
//
// No dependencies: frontmatter is a flat YAML subset (key: value, key: [a, b]).
import { readFileSync, writeFileSync, readdirSync, mkdirSync, existsSync } from 'node:fs'
import { join, dirname, relative } from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..')
const CONTENT = join(ROOT, 'help-content')
const LANGS = ['en', 'th']
const REQUIRED_FIELDS = ['id', 'lang', 'title', 'section', 'routes', 'roles_full', 'roles_view', 'keywords', 'related', 'summary', 'last_updated', 'version']
const REQUIRED_SECTIONS = ['what', 'purpose', 'who', 'how', 'fields', 'tasks', 'tips']
const ROLE_IDS = ['consumer', 'steward', 'owner', 'custodian', 'dpo', 'council', 'auditor', 'admin']
const SCHEMA_VERSION = 1
const checkOnly = process.argv.includes('--check')

const errors = []
const err = (file, msg) => errors.push(`${file}: ${msg}`)

function parseScalar(v) {
  v = v.trim()
  if (v.startsWith('[') && v.endsWith(']')) {
    const inner = v.slice(1, -1).trim()
    return inner ? inner.split(',').map(s => s.trim().replace(/^["']|["']$/g, '')).filter(Boolean) : []
  }
  return v.replace(/^["']|["']$/g, '')
}

export function parseHelpFile(raw, file = '?') {
  const m = raw.replace(/\r\n/g, '\n').match(/^---\n([\s\S]*?)\n---\n?([\s\S]*)$/)
  if (!m) { err(file, 'missing --- frontmatter ---'); return null }
  const meta = {}
  for (const line of m[1].split('\n')) {
    if (!line.trim() || line.trim().startsWith('#')) continue
    const i = line.indexOf(':')
    if (i < 0) { err(file, `bad frontmatter line: ${line}`); continue }
    meta[line.slice(0, i).trim()] = parseScalar(line.slice(i + 1))
  }
  const sections = []
  let cur = null
  for (const line of m[2].split('\n')) {
    const h = line.match(/^##\s+(.+?)\s*\{#([a-z0-9-]+)\}\s*$/)
    if (h) { cur = { anchor: h[2], heading: h[1], lines: [] }; sections.push(cur); continue }
    if (/^##\s/.test(line)) err(file, `H2 without {#anchor}: ${line}`)
    if (/^#\s/.test(line)) err(file, `use H2 (##) for sections, not H1: ${line}`)
    if (cur) cur.lines.push(line)
    else if (line.trim()) err(file, `text before first H2 is ignored: ${line.slice(0, 40)}`)
  }
  return {
    meta,
    sections: sections.map(s => ({ anchor: s.anchor, heading: s.heading, markdown: s.lines.join('\n').trim() })),
  }
}

// Markdown → plain text for embeddings (keeps words, drops syntax)
const plain = md => md
  .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
  .replace(/\*\*([^*]+)\*\*/g, '$1')
  .replace(/`([^`]+)`/g, '$1')
  .replace(/^\s*>\s?/gm, '')
  .replace(/^\s*[-*]\s+/gm, '- ')
  .trim()

// Routes declared in src/main.tsx, so a new page without help fails the check
function appRoutes() {
  const src = readFileSync(join(ROOT, 'src/main.tsx'), 'utf8')
  return [...src.matchAll(/<Route\s+path="([^"]+)"/g)].map(x => x[1]).filter(p => p !== '*')
}

const pages = []
for (const lang of LANGS) {
  const dir = join(CONTENT, lang)
  if (!existsSync(dir)) { err(dir, 'missing language folder'); continue }
  for (const f of readdirSync(dir).filter(f => f.endsWith('.md')).sort()) {
    const file = `help-content/${lang}/${f}`
    const parsed = parseHelpFile(readFileSync(join(dir, f), 'utf8'), file)
    if (!parsed) continue
    const { meta, sections } = parsed
    for (const k of REQUIRED_FIELDS) if (meta[k] === undefined || meta[k] === '') err(file, `missing frontmatter field "${k}"`)
    if (meta.id !== f.replace(/\.md$/, '')) err(file, `id "${meta.id}" must match file name`)
    if (meta.lang !== lang) err(file, `lang "${meta.lang}" must match folder "${lang}"`)
    for (const k of ['routes', 'roles_full', 'roles_view', 'keywords', 'related']) if (meta[k] !== undefined && !Array.isArray(meta[k])) err(file, `"${k}" must be a [list]`)
    for (const r of [...(meta.roles_full ?? []), ...(meta.roles_view ?? [])]) if (!ROLE_IDS.includes(r)) err(file, `unknown role "${r}"`)
    const anchors = sections.map(s => s.anchor)
    for (const a of REQUIRED_SECTIONS) if (!anchors.includes(a)) err(file, `missing section {#${a}}`)
    for (const s of sections) if (!s.markdown) err(file, `empty section {#${s.anchor}}`)
    pages.push({
      page_id: meta.id, lang, title: meta.title, nav_label: meta.nav_label ?? meta.title, section: meta.section,
      routes: meta.routes ?? [], roles_full: meta.roles_full ?? [], roles_view: meta.roles_view ?? [],
      keywords: meta.keywords ?? [], related: meta.related ?? [], prd: meta.prd ?? '', summary: meta.summary,
      last_updated: meta.last_updated, version: meta.version, source_file: file, sections,
    })
  }
}

// Cross-file checks
const ids = lang => new Set(pages.filter(p => p.lang === lang).map(p => p.page_id))
for (const lang of LANGS) {
  for (const other of LANGS) if (other !== lang) for (const id of ids(lang)) if (!ids(other).has(id)) err(`help-content/${other}/${id}.md`, `missing translation (exists in ${lang})`)
}
for (const p of pages) {
  for (const r of p.related) if (!ids(p.lang).has(r)) err(p.source_file, `related page "${r}" does not exist`)
  const twin = pages.find(q => q.page_id === p.page_id && q.lang !== p.lang)
  if (twin) {
    if (JSON.stringify(twin.routes) !== JSON.stringify(p.routes)) err(p.source_file, 'routes differ between languages')
    if (twin.sections.map(s => s.anchor).join() !== p.sections.map(s => s.anchor).join()) err(p.source_file, 'section anchors/order differ between languages')
  }
}
for (const route of appRoutes()) {
  for (const lang of LANGS) if (!pages.some(p => p.lang === lang && p.routes.includes(route))) err('src/main.tsx', `route "${route}" has no ${lang} help page`)
}

if (errors.length) {
  console.error(`Help content check failed (${errors.length}):\n  - ` + errors.join('\n  - '))
  process.exit(1)
}

const chunks = pages.flatMap(p => p.sections.map(s => ({
  id: `${p.page_id}.${p.lang}.${s.anchor}`,
  page_id: p.page_id,
  lang: p.lang,
  route: p.routes[0] ?? null,
  routes: p.routes,
  title: p.title,
  section: p.section,
  section_heading: s.heading,
  url_anchor: `${p.routes[0] ?? '/'}#help-${s.anchor}`,
  roles: [...p.roles_full, ...p.roles_view],
  keywords: p.keywords,
  context: `EDC1 › ${p.section} › ${p.title} › ${s.heading}`,
  text: plain(s.markdown),
  markdown: s.markdown,
  source_file: p.source_file,
  version: p.version,
  last_updated: p.last_updated,
})))

const summary = `${new Set(pages.map(p => p.page_id)).size} pages × ${LANGS.length} languages · ${chunks.length} chunks`
if (checkOnly) { console.log(`Help content OK · ${summary}`); process.exit(0) }

const index = { schema_version: SCHEMA_VERSION, generated_at: new Date().toISOString(), langs: LANGS, pages }
const write = (rel, body) => { const p = join(ROOT, rel); mkdirSync(dirname(p), { recursive: true }); writeFileSync(p, body); console.log('  wrote', relative(ROOT, p)) }
write('src/help/help-index.json', JSON.stringify(index, null, 1) + '\n')
write('public/help/help-index.json', JSON.stringify(index, null, 1) + '\n')
write('public/help/help-chunks.jsonl', chunks.map(c => JSON.stringify(c)).join('\n') + '\n')
console.log(`Help index built · ${summary}`)
