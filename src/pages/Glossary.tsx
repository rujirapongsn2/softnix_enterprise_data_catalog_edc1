import { useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { ChevronDown, ChevronRight, BookOpen, Plus, Search, Sparkles, Pencil, Calculator, Link2, AlertTriangle, Upload } from 'lucide-react'
import { terms as baseTerms, assets, type Term } from '../data/mock'
import { Card, LifecycleBadge, PersonChip, typeIcon, ClsBadge } from '../components/ui'
import { useI18n } from '../i18n'
import { GuardBtn } from '../auth/role'
import { useStored } from '../data/store'
import { useShell } from '../components/Layout'
import { NewTermForm, ChangeRequestForm, type NewTerm, type ChangeReq } from '../forms/Forms'

const STATUSES = ['Draft', 'Candidate', 'Approved', 'Retired'] as const

export default function Glossary() {
  const { id = 'active-customer' } = useParams()
  const nav = useNavigate()
  const { lang } = useI18n()
  const { toast } = useShell()
  const [created, addTerm] = useStored<NewTerm>('terms')
  const [, addCr] = useStored<ChangeReq>('changeRequests')
  const [newOpen, setNewOpen] = useState(false)
  const [crOpen, setCrOpen] = useState(false)
  const terms: Term[] = [...created, ...baseTerms]
  const [q, setQ] = useState('')
  const [open, setOpen] = useState<Record<string, boolean>>({ Customer: true, Finance: true, Sales: true })
  const term = terms.find(t => t.id === id) ?? terms[0]
  const byDomain = terms.reduce<Record<string, Term[]>>((m, t) => ((m[t.domain] ??= []).push(t), m), {})
  const match = (t: Term) => !q || [t.en, t.th, ...t.synonyms].some(s => s.toLowerCase().includes(q.toLowerCase()))

  const linked = assets.filter(a => a.terms.includes(term.en))

  return (
    <div className="page">
      <div className="page-h">
        <div><h1>Business Glossary</h1><div className="sub">{terms.length} terms · ISO/IEC 11179 registration status · bilingual TH/EN</div></div>
        <div className="actions">
          <GuardBtn cap="glossary.import" className="btn" onClick={() => toast('Excel template: Term EN, Term TH, Definition, Domain, Steward, Synonyms')}><Upload size={14} />Import Excel</GuardBtn>
          <GuardBtn cap="glossary.create" className="btn ai" onClick={() => toast('No duplicates found · “Attrition” is a synonym of Churn')}><Sparkles size={14} />Find duplicates</GuardBtn>
          <GuardBtn cap="glossary.create" className="btn primary" onClick={() => setNewOpen(true)}><Plus size={14} />New term</GuardBtn>
        </div>
      </div>

      <div className="split">
        <aside className="card" style={{ padding: 10 }}>
          <div className="gsearch-box" style={{ marginBottom: 8, background: 'white' }}><Search size={15} color="var(--text-3)" /><input value={q} onChange={e => setQ(e.target.value)} placeholder="Filter terms…" /></div>
          {Object.entries(byDomain).map(([d, list]) => (
            <div key={d}>
              <div className="tree-item" onClick={() => setOpen(o => ({ ...o, [d]: !o[d] }))}>
                {open[d] ? <ChevronDown size={14} /> : <ChevronRight size={14} />}<b>{d}</b><span className="faint small" style={{ marginLeft: 'auto' }}>{list.length}</span>
              </div>
              {open[d] && list.filter(t => !t.parent && match(t)).map(t => (
                <div key={t.id}>
                  <TreeRow t={t} on={t.id === term.id} depth={1} lang={lang} onClick={() => nav(`/glossary/${t.id}`)} />
                  {list.filter(c => c.parent === t.id && match(c)).map(c => <TreeRow key={c.id} t={c} on={c.id === term.id} depth={2} lang={lang} onClick={() => nav(`/glossary/${c.id}`)} />)}
                </div>
              ))}
            </div>
          ))}
        </aside>

        <main className="col" style={{ gap: 16 }}>
          <section className="card" style={{ padding: 20 }}>
            <div className="row" style={{ alignItems: 'flex-start' }}>
              <div className="asset-icon" style={{ background: 'var(--ai-50)', color: 'var(--ai)' }}><BookOpen size={20} /></div>
              <div className="grow">
                <h1 style={{ fontSize: 22 }} className="row">{term.en} {term.kpi && <span className="badge cyan">KPI</span>}</h1>
                <div className="muted" style={{ fontSize: 15 }}>{term.th}</div>
              </div>
              <GuardBtn cap="glossary.propose" className="btn" onClick={() => setCrOpen(true)}><Pencil size={14} />Propose change</GuardBtn>
            </div>
            <div className="stepper" style={{ marginTop: 16 }}>
              {STATUSES.map((s, i) => {
                const cur = STATUSES.indexOf(term.status)
                return (
                  <span key={s} className="row" style={{ gap: 0 }}>
                    {i > 0 && <span className={`step-line ${i <= cur ? 'done' : ''}`} />}
                    <span className={`step ${i < cur ? 'done' : i === cur ? 'cur' : ''}`}><span className="d">{i < cur ? '✓' : i + 1}</span>{s}</span>
                  </span>
                )
              })}
              {term.status === 'Candidate' && <GuardBtn cap="glossary.approve" className="btn sm primary" style={{ marginLeft: 16 }} onClick={() => toast(`“${term.en}” approved · status → Approved`)}>Approve</GuardBtn>}
              {'isNew' in term && <span className="badge blue" style={{ marginLeft: 8 }}>new · {(term as NewTerm).scope} term · by {(term as NewTerm).createdBy}</span>}
            </div>
          </section>

          <div className="grid g3">
            <Card title="Definition" className="span2">
              <p style={{ marginTop: 0, fontSize: 14, lineHeight: 1.6 }}>{term.definition}</p>
              {term.formula && (
                <div className="card" style={{ padding: 10, background: 'var(--surface-2)' }}>
                  <div className="row faint small" style={{ marginBottom: 4 }}><Calculator size={13} />Calculation</div>
                  <code>{term.formula}</code>
                </div>
              )}
              {term.id === 'active-customer' && (
                <div className="row small" style={{ marginTop: 12, padding: 10, borderRadius: 8, background: 'var(--warn-50)', color: '#8a4b04' }}>
                  <AlertTriangle size={14} />Open change request CR-0311 proposes to include SUSPENDED contracts. <Link to="/inbox?id=CR-0311">Review</Link>
                </div>
              )}
            </Card>
            <Card title="Properties">
              <dl className="kv" style={{ gridTemplateColumns: '90px 1fr' }}>
                <dt>Domain</dt><dd>{term.domain}</dd>
                <dt>Steward</dt><dd><PersonChip id={term.steward} /></dd>
                <dt>Synonyms</dt><dd>{term.synonyms.join(', ') || '—'}</dd>
                <dt>Abbrev.</dt><dd>{term.abbrev ?? '—'}</dd>
                <dt>Status</dt><dd><LifecycleBadge value={term.status} /></dd>
              </dl>
            </Card>
          </div>

          <div className="grid g3">
            <Card title={<h3 className="row"><Link2 size={15} />Linked assets ({term.linked})</h3>} className="span2" actions={<GuardBtn cap="asset.editBusiness" className="btn sm ai" onClick={() => toast('3 candidate columns found')}><Sparkles size={13} />Suggest columns</GuardBtn>}>
              <table className="tbl">
                <thead><tr><th>Asset</th><th>Column</th><th>Classification</th><th>Linked by</th></tr></thead>
                <tbody>
                  {(linked.length ? linked : assets.slice(0, 2)).map(a => (
                    <tr key={a.id}>
                      <td><Link to={`/asset/${a.id}`} className="row">{typeIcon(a.type, 14)}{a.name}</Link></td>
                      <td className="mono">{a.type === 'Report' ? '—' : term.id === 'active-customer' ? 'active_contracts' : 'customer_id'}</td>
                      <td><ClsBadge value={a.classification} /></td>
                      <td className="small muted">Nida C. · confirmed</td>
                    </tr>
                  ))}
                  <tr style={{ background: 'var(--ai-50)' }}>
                    <td className="row">{typeIcon('Table', 14)}churn_features</td><td className="mono">is_active</td><td><ClsBadge value="Internal" /></td>
                    <td><span className="row small"><Sparkles size={12} color="var(--ai)" />AI suggested · 91% <GuardBtn cap="asset.editBusiness" className="btn sm ok" onClick={() => toast('Linked churn_features.is_active')}>Link</GuardBtn></span></td>
                  </tr>
                </tbody>
              </table>
            </Card>
            <Card title="Relationships">
              <div className="col small" style={{ gap: 8 }}>
                {term.parent && <div><span className="faint">Broader</span> <Link to={`/glossary/${term.parent}`}>{terms.find(t => t.id === term.parent)?.en}</Link></div>}
                {terms.filter(t => t.parent === term.id).length > 0 && <div><span className="faint">Narrower</span> {terms.filter(t => t.parent === term.id).map(t => <Link key={t.id} to={`/glossary/${t.id}`} style={{ marginRight: 6 }}>{t.en}</Link>)}</div>}
                <div><span className="faint">Related</span> {term.related.length ? term.related.map(r => <Link key={r} to={`/glossary/${r}`} style={{ marginRight: 6 }}>{terms.find(t => t.id === r)?.en}</Link>) : '—'}</div>
              </div>
              <div className="divider" />
              <div className="faint small">Impact if changed: {term.linked} assets, 3 reports, 2 DQ rules</div>
            </Card>
          </div>
        </main>
      </div>
      {newOpen && <NewTermForm existing={terms} onClose={() => setNewOpen(false)} onCreate={t => { addTerm(t); setNewOpen(false); setOpen(o => ({ ...o, [t.domain]: true })); nav(`/glossary/${t.id}`); toast(`Term “${t.en}” ${t.status === 'Candidate' ? 'submitted for approval' : 'saved as draft'}`) }} />}
      {crOpen && <ChangeRequestForm target={term.en} current={term.definition} onClose={() => setCrOpen(false)} onCreate={c => { addCr(c); setCrOpen(false); toast(`${c.id} submitted → Steward → Owner · see My Tasks`) }} />}
    </div>
  )
}

function TreeRow({ t, on, depth, lang, onClick }: { t: Term; on: boolean; depth: number; lang: 'en' | 'th'; onClick: () => void }) {
  const dot = { Approved: 'var(--ok)', Candidate: 'var(--warn)', Draft: 'var(--text-3)', Retired: 'var(--bad)' }[t.status]
  return (
    <div className={`tree-item ${on ? 'on' : ''}`} style={{ paddingLeft: 8 + depth * 14 }} onClick={onClick}>
      <span style={{ width: 6, height: 6, borderRadius: 3, background: dot, flex: 'none' }} />
      <span className="ellipsis" style={{ textDecoration: t.status === 'Retired' ? 'line-through' : undefined }}>{lang === 'th' ? t.th : t.en}</span>
    </div>
  )
}
