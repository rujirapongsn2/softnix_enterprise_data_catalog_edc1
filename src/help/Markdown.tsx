// Minimal, dependency-free renderer for the help Markdown subset:
// paragraphs, "- " bullets, "1. " numbered lists, > tips, **bold**, `code`, [label](/route).
import { Fragment, type ReactNode } from 'react'
import { Link } from 'react-router-dom'

function inline(text: string, key = 0): ReactNode[] {
  const out: ReactNode[] = []
  const re = /\*\*([^*]+)\*\*|`([^`]+)`|\[([^\]]+)\]\(([^)]+)\)/g
  let last = 0
  let m: RegExpExecArray | null
  while ((m = re.exec(text))) {
    if (m.index > last) out.push(text.slice(last, m.index))
    const k = `${key}-${m.index}`
    if (m[1] !== undefined) out.push(<b key={k}>{inline(m[1], m.index)}</b>)
    else if (m[2] !== undefined) out.push(<code key={k}>{m[2]}</code>)
    else if (m[4].startsWith('/')) out.push(<Link key={k} to={m[4]}>{m[3]}</Link>)
    else out.push(<a key={k} href={m[4]} target="_blank" rel="noreferrer">{m[3]}</a>)
    last = re.lastIndex
  }
  if (last < text.length) out.push(text.slice(last))
  return out
}

type Block = { kind: 'p' | 'ul' | 'ol' | 'quote'; lines: string[] }

export default function Markdown({ source }: { source: string }) {
  const blocks: Block[] = []
  for (const rawLine of source.split('\n')) {
    const line = rawLine.trimEnd()
    if (!line.trim()) { blocks.push({ kind: 'p', lines: [] }); continue }
    const ul = line.match(/^\s*[-*]\s+(.*)$/)
    const ol = line.match(/^\s*\d+\.\s+(.*)$/)
    const q = line.match(/^\s*>\s?(.*)$/)
    const kind: Block['kind'] = ul ? 'ul' : ol ? 'ol' : q ? 'quote' : 'p'
    const text = ul?.[1] ?? ol?.[1] ?? q?.[1] ?? line.trim()
    const prev = blocks[blocks.length - 1]
    if (prev && prev.kind === kind && prev.lines.length) prev.lines.push(text)
    else blocks.push({ kind, lines: [text] })
  }
  return (
    <div className="help-md">
      {blocks.filter(b => b.lines.length).map((b, i) => (
        <Fragment key={i}>
          {b.kind === 'p' && <p>{inline(b.lines.join(' '), i)}</p>}
          {b.kind === 'quote' && <p className="help-tip">{inline(b.lines.join(' '), i)}</p>}
          {b.kind === 'ul' && <ul>{b.lines.map((l, j) => <li key={j}>{inline(l, j)}</li>)}</ul>}
          {b.kind === 'ol' && <ol>{b.lines.map((l, j) => <li key={j}>{inline(l, j)}</li>)}</ol>}
        </Fragment>
      ))}
    </div>
  )
}
