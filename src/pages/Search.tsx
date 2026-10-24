import { useMemo, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { Search as SearchIcon, Sparkles, Bookmark, LayoutList, LayoutGrid, Star, X, Download } from 'lucide-react'
import { assets, people, type Asset } from '../data/mock'
import { ClsBadge, LifecycleBadge, PiiBadge, Endorsements, typeIcon, AiTag, scoreColor, scoreText } from '../components/ui'
import { useI18n } from '../i18n'
import { useShell } from '../components/Layout'

type FacetKey = 'type' | 'domain' | 'classification' | 'lifecycle' | 'pii' | 'sourceKind' | 'layer'
const FACETS: { key: FacetKey; label: string }[] = [
  { key: 'type', label: 'Asset type' },
  { key: 'domain', label: 'Domain' },
  { key: 'lifecycle', label: 'Certification' },
  { key: 'classification', label: 'Classification' },
  { key: 'pii', label: 'Personal data (PDPA)' },
  { key: 'layer', label: 'Layer' },
  { key: 'sourceKind', label: 'Source system' },
]

export default function Search() {
  const [params, setParams] = useSearchParams()
  const { lang } = useI18n()
  const { ask, toast } = useShell()
  const nav = useNavigate()
  const q = params.get('q') ?? ''
  const [text, setText] = useState(q)
  const [sel, setSel] = useState<Partial<Record<FacetKey, string[]>>>(() => {
    const d = params.get('domain')
    return d ? { domain: [d] } : {}
  })
  const [view, setView] = useState<'list' | 'grid'>('list')
  const [sort, setSort] = useState('relevance')
  const [ownerless, setOwnerless] = useState(false)
  const [freshOnly, setFreshOnly] = useState(false)

  const base = useMemo(() => {
    const ql = q.toLowerCase().trim()
    if (!ql) return assets
    const words = ql.split(/\s+/)
    return assets.filter(a => {
      const hay = [a.name, a.path, a.businessName.en, a.businessName.th, a.description, a.domain, ...a.tags, ...a.terms].join(' ').toLowerCase()
      return words.some(w => hay.includes(w))
    })
  }, [q])

  const filtered = useMemo(() => {
    let r = base.filter(a => FACETS.every(f => !sel[f.key]?.length || sel[f.key]!.includes(String(a[f.key]))))
    if (ownerless) r = r.filter(a => !a.owner)
    if (freshOnly) r = r.filter(a => a.freshnessOk)
    const rank = (a: Asset) => (a.lifecycle === 'Certified' ? 1e6 : 0) + (a.authoritative ? 5e5 : 0) + a.usage
    if (sort === 'relevance') r = [...r].sort((a, b) => rank(b) - rank(a))
    if (sort === 'rating') r = [...r].sort((a, b) => b.ratings - a.ratings)
    if (sort === 'dq') r = [...r].sort((a, b) => (b.dq ?? 0) - (a.dq ?? 0))
    return r
  }, [base, sel, sort, ownerless, freshOnly])

  const toggle = (k: FacetKey, v: string) => setSel(s => {
    const cur = s[k] ?? []
    return { ...s, [k]: cur.includes(v) ? cur.filter(x => x !== v) : [...cur, v] }
  })
  const chips = Object.entries(sel).flatMap(([k, vs]) => (vs ?? []).map(v => ({ k: k as FacetKey, v })))

  return (
    <div className="page">
      <div className="row" style={{ gap: 10, marginBottom: 14 }}>
        <div className="gsearch-box grow" style={{ height: 42, background: 'white' }}>
          <SearchIcon size={17} color="var(--text-3)" />
          <input value={text} onChange={e => setText(e.target.value)} onKeyDown={e => { if (e.key === 'Enter') setParams(text ? { q: text } : {}) }} placeholder="Search by name, description, column, glossary term or tag — Thai or English" style={{ fontSize: 14 }} />
          {text && <button className="icon-btn" onClick={() => { setText(''); setParams({}) }} aria-label="Clear"><X size={15} /></button>}
        </div>
        <button className="btn ai" style={{ height: 42 }} onClick={() => ask(text || 'Where can I find active customers by province?')}><Sparkles size={15} />Ask in natural language</button>
      </div>

      <div className="split">
        <aside className="card" style={{ position: 'sticky', top: 0 }}>
          <div className="row" style={{ padding: '12px 14px', borderBottom: '1px solid var(--border)' }}>
            <b className="grow">Filters</b>
            {chips.length > 0 && <button className="link-btn small" onClick={() => setSel({})}>Clear all</button>}
          </div>
          <div className="facet">
            <h3>Quick filters</h3>
            <label><input type="checkbox" checked={ownerless} onChange={e => setOwnerless(e.target.checked)} />Missing owner</label>
            <label><input type="checkbox" checked={freshOnly} onChange={e => setFreshOnly(e.target.checked)} />Fresh (within SLA)</label>
          </div>
          {FACETS.map(f => {
            const counts = new Map<string, number>()
            base.forEach(a => counts.set(String(a[f.key]), (counts.get(String(a[f.key])) ?? 0) + 1))
            return (
              <div className="facet" key={f.key}>
                <h3>{f.label}</h3>
                {[...counts.entries()].sort((a, b) => b[1] - a[1]).map(([v, n]) => (
                  <label key={v}>
                    <input type="checkbox" checked={sel[f.key]?.includes(v) ?? false} onChange={() => toggle(f.key, v)} />
                    {f.key === 'classification' ? <ClsBadge value={v as Asset['classification']} /> : v}
                    <span className="n">{n}</span>
                  </label>
                ))}
              </div>
            )
          })}
        </aside>

        <main>
          <div className="row wrap" style={{ marginBottom: 10 }}>
            <div className="grow">
              <b>{filtered.length}</b> <span className="muted">results{q && <> for “<b>{q}</b>”</>}</span>
              {q && q.match(/[ก-๙]/) && <span className="faint small"> · Thai word segmentation applied</span>}
            </div>
            <button className="btn sm ghost" onClick={() => toast('Search saved to “My saved searches”')}><Bookmark size={14} />Save search</button>
            <button className="btn sm ghost" onClick={() => toast('Exporting results to Excel…')}><Download size={14} />Export</button>
            <select className="input" style={{ height: 30 }} value={sort} onChange={e => setSort(e.target.value)}>
              <option value="relevance">Sort: Relevance (certified &amp; popular first)</option>
              <option value="rating">Sort: Most endorsed</option>
              <option value="dq">Sort: Data quality</option>
            </select>
            <div className="seg">
              <button className={view === 'list' ? 'on' : ''} onClick={() => setView('list')} aria-label="List view"><LayoutList size={14} /></button>
              <button className={view === 'grid' ? 'on' : ''} onClick={() => setView('grid')} aria-label="Grid view"><LayoutGrid size={14} /></button>
            </div>
          </div>
          {chips.length > 0 && (
            <div className="row wrap" style={{ marginBottom: 10 }}>
              {chips.map(c => <span key={c.k + c.v} className="chip on">{c.v}<button onClick={() => toggle(c.k, c.v)} aria-label="Remove filter"><X size={12} /></button></span>)}
            </div>
          )}

          {q && (
            <div className="ai-note row" style={{ marginBottom: 12, alignItems: 'flex-start' }}>
              <Sparkles size={16} color="var(--ai)" style={{ marginTop: 2 }} />
              <div className="grow small">
                <b>Did you mean the glossary term “Customer”?</b> 37 assets are linked to it. The certified, authoritative source is <a onClick={() => nav('/asset/gold-customer-360')} style={{ cursor: 'pointer' }}>gold.customer_360</a>.
                <span className="faint"> 3 restricted assets are hidden based on your permissions.</span>
              </div>
            </div>
          )}

          <div className={view === 'grid' ? 'grid g2' : 'col'} style={{ gap: 10 }}>
            {filtered.map(a => <ResultCard key={a.id} a={a} lang={lang} onOpen={() => nav(`/asset/${a.id}`)} />)}
            {filtered.length === 0 && <div className="card empty">No assets match. Try removing a filter, or ask Softnix in plain language.</div>}
          </div>
        </main>
      </div>
    </div>
  )
}

function ResultCard({ a, lang, onOpen }: { a: Asset; lang: 'en' | 'th'; onOpen: () => void }) {
  return (
    <article className="card" style={{ padding: 14, cursor: 'pointer' }} onClick={onOpen}>
      <div className="row" style={{ alignItems: 'flex-start', gap: 12 }}>
        <span className="asset-icon" style={{ width: 36, height: 36 }}>{typeIcon(a.type, 18)}</span>
        <div className="grow" style={{ minWidth: 0 }}>
          <div className="row wrap" style={{ gap: 6 }}>
            <b style={{ fontSize: 14.5, color: 'var(--primary-700)' }}>{a.businessName[lang]}</b>
            {a.name !== a.businessName[lang] && <><span className="faint">·</span><span className="mono faint">{a.name}</span></>}
            <LifecycleBadge value={a.lifecycle} />
            {a.authoritative && <span className="badge blue"><Star size={11} />Authoritative</span>}
            {a.critical && <span className="badge outline">Critical</span>}
            <PiiBadge value={a.pii} />
            {a.aiDraft && <AiTag label="AI draft metadata" />}
          </div>
          <div className="faint small mono ellipsis" style={{ marginTop: 2 }}>{a.path}</div>
          <p className="muted" style={{ margin: '6px 0 8px', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
            {a.description || <i className="faint">No description yet — Steward action needed</i>}
          </p>
          <div className="row wrap small" style={{ gap: 14 }}>
            <span className="badge gray">{a.type}</span>
            <span className="faint">Domain <b style={{ color: 'var(--text)' }}>{a.domain}</b></span>
            <span className="faint">Owner <b style={{ color: a.owner ? 'var(--text)' : 'var(--bad)' }}>{a.owner ? people[a.owner].name : 'Unassigned'}</b></span>
            <ClsBadge value={a.classification} />
            {a.dq !== undefined && <span className="faint">DQ <b style={{ color: scoreText(a.dq) }}>{a.dq}%</b></span>}
            <span className="faint" style={{ color: a.freshnessOk ? undefined : 'var(--bad-text)' }}>Updated {a.freshness}</span>
            <Endorsements count={a.ratings} />
          </div>
        </div>
      </div>
    </article>
  )
}
