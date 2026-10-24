import { useState } from 'react'
import { Link, useParams, useSearchParams } from 'react-router-dom'
import {
  Star, Bell, KeyRound, AlertTriangle, MessageSquare, Code2, Sparkles, Pencil, CheckCircle2, Circle, ShieldAlert, X,
  ExternalLink, ChevronRight, Lock, GitBranch, Copy, Check, Package, MoreHorizontal,
} from 'lucide-react'
import {
  assetById, assets, customer360Columns, dqRules, dqTrend, auditEvents, comments, accessGrants, people, type Asset, type Column,
} from '../data/mock'
import {
  Card, ClsBadge, LifecycleBadge, PiiBadge, Stars, Tabs, typeIcon, AiTag, Avatar, PersonChip, Donut, Sparkline, Meter, scoreColor, TechLock,
} from '../components/ui'
import { ContractTab } from './Qbd'
import LineageGraph from '../components/LineageGraph'
import { useI18n } from '../i18n'
import { useShell } from '../components/Layout'
import { GuardBtn } from '../auth/role'
import { useStored } from '../data/store'
import { NewDqRuleForm, type NewRule } from '../forms/Forms'

type Tab = 'overview' | 'columns' | 'lineage' | 'contract' | 'quality' | 'access' | 'history'

export default function AssetDetail() {
  const { id = 'gold-customer-360' } = useParams()
  const [params, setParams] = useSearchParams()
  const a = assetById(id) ?? assets[0]
  const { t, lang } = useI18n()
  const { toast, ask } = useShell()
  const tab = (params.get('tab') as Tab) ?? 'overview'
  const setTab = (v: Tab) => setParams(v === 'overview' ? {} : { tab: v })
  const [following, setFollowing] = useState(false)
  const [discussion, setDiscussion] = useState(false)
  const [reqOpen, setReqOpen] = useState(false)
  const [issueOpen, setIssueOpen] = useState(false)

  const cols = a.id === 'gold-customer-360' ? customer360Columns : customer360Columns.slice(0, 6)

  return (
    <div className="page" style={{ paddingRight: discussion ? 424 : undefined }}>
      <div className="crumbs">
        <Link to="/search">Catalog</Link><ChevronRight size={12} />
        <span>{a.source}</span><ChevronRight size={12} />
        {a.path.split('.').slice(0, -1).map(p => <span key={p} className="row" style={{ gap: 6 }}>{p}<ChevronRight size={12} /></span>)}
        <b style={{ color: 'var(--text)' }}>{a.name}</b>
      </div>

      <header className="asset-h">
        <div className="title-row">
          <div className="asset-icon">{typeIcon(a.type, 22)}</div>
          <div className="grow" style={{ minWidth: 0 }}>
            <h1>
              {a.businessName[lang]}
              <LifecycleBadge value={a.lifecycle} />
              {a.authoritative && <span className="badge blue"><Star size={11} />Authoritative source</span>}
              {a.critical && <span className="badge outline">Critical</span>}
              <PiiBadge value={a.pii} />
            </h1>
            <div className="row wrap small" style={{ marginTop: 4, gap: 10 }}>
              <span className="mono muted">{a.path}</span>
              <button className="icon-btn" style={{ width: 22, height: 22 }} onClick={() => toast('Path copied')} aria-label="Copy path"><Copy size={12} /></button>
              <span className="badge gray">{a.type}</span>
              <span className="faint">{a.domain} domain</span>
              <ClsBadge value={a.classification} />
            </div>
          </div>
          <div className="asset-meta">
            <div className="m">Rating<b><Stars value={a.rating} count={a.ratings} /></b></div>
            <div className="m">Data quality<b style={{ color: a.dq ? scoreColor(a.dq) : undefined }}>{a.dq ? `${a.dq}%` : '—'}</b></div>
            <div className="m">Freshness<b style={{ color: a.freshnessOk ? undefined : 'var(--bad)' }}>{a.freshness}</b></div>
            <div className="m">Rows<b>{a.rows ?? '—'}</b></div>
          </div>
        </div>
        <div className="row wrap" style={{ marginTop: 14, gap: 8 }}>
          <GuardBtn cap="asset.requestAccess" className="btn primary" onClick={() => setReqOpen(true)}><KeyRound size={14} />{t('requestAccess')}</GuardBtn>
          <button className="btn" onClick={() => toast('Opening Trino SQL editor in Lakehouse…')}><Code2 size={14} />{t('openSql')}<ExternalLink size={12} /></button>
          <button className={`btn ${following ? 'ok' : ''}`} onClick={() => { setFollowing(f => !f); toast(following ? 'Unfollowed' : 'Following — you’ll be notified of changes') }}>
            {following ? <Check size={14} /> : <Bell size={14} />}{following ? 'Following' : t('follow')} · {a.followers + (following ? 1 : 0)}
          </button>
          <GuardBtn cap="asset.reportIssue" className="btn" onClick={() => setIssueOpen(true)}><AlertTriangle size={14} />{t('reportIssue')}</GuardBtn>
          <button className={`btn ${discussion ? 'ok' : ''}`} onClick={() => setDiscussion(d => !d)}><MessageSquare size={14} />{t('discussion')} · 4</button>
          <button className="btn ai" onClick={() => ask('Explain this table in business terms')}><Sparkles size={14} />Explain with AI</button>
          <button className="btn ghost" aria-label="More"><MoreHorizontal size={16} /></button>
        </div>
        <Tabs<Tab> value={tab} onChange={setTab} items={[
          { id: 'overview', label: t('overview') },
          { id: 'columns', label: t('columns'), n: cols.length },
          { id: 'lineage', label: t('lineage') },
          { id: 'contract', label: <>{t('contract')} <span className="badge red" style={{ marginLeft: 4 }}>Violated</span></> },
          { id: 'quality', label: t('dq'), n: dqRules.length },
          { id: 'access', label: t('access') },
          { id: 'history', label: t('history') },
        ]} />
      </header>

      {tab === 'overview' && <Overview a={a} cols={cols} goTab={setTab} />}
      {tab === 'columns' && <Columns cols={cols} />}
      {tab === 'lineage' && <LineageGraph focus="gld-360" />}
      {tab === 'contract' && <ContractTab />}
      {tab === 'quality' && <Quality a={a} />}
      {tab === 'access' && <Access onRequest={() => setReqOpen(true)} />}
      {tab === 'history' && <HistoryTab />}

      {discussion && <Discussion onClose={() => setDiscussion(false)} />}
      {reqOpen && <RequestAccess a={a} cols={cols} onClose={() => setReqOpen(false)} onDone={() => { setReqOpen(false); toast('Access request AR-1043 submitted → Owner, then DPO') }} />}
      {issueOpen && <ReportIssue a={a} onClose={() => setIssueOpen(false)} onDone={() => { setIssueOpen(false); toast('Data issue DI-0208 created and assigned to Nida C.') }} />}
    </div>
  )
}

/* ---------------- Overview ---------------- */
function Overview({ a, cols, goTab }: { a: Asset; cols: Column[]; goTab: (t: Tab) => void }) {
  const [editing, setEditing] = useState(false)
  const [desc, setDesc] = useState(a.description)
  const checks = [
    ['Owner assigned', !!a.owner], ['Steward assigned', !!a.steward], ['Description', !!a.description], ['Classification', true],
    ['Glossary terms linked', a.terms.length > 0], ['PII confirmed', cols.every(c => c.piiState !== 'suggested')],
  ] as const
  const done = checks.filter(c => c[1]).length

  return (
    <div className="grid g3">
      <div className="span2 col" style={{ gap: 16 }}>
        <Card title={<h3 className="row">Description <span className="badge gray">Business</span></h3>} actions={
          <>
            <GuardBtn cap="asset.editBusiness" className="btn sm ai"><Sparkles size={13} />Regenerate</GuardBtn>
            <GuardBtn cap="asset.editBusiness" className="btn sm" onClick={() => setEditing(e => !e)}><Pencil size={13} />{editing ? 'Done' : 'Edit'}</GuardBtn>
          </>
        }>
          {editing ? <textarea className="input" rows={4} style={{ width: '100%' }} value={desc} onChange={e => setDesc(e.target.value)} /> : <p style={{ margin: 0, lineHeight: 1.6 }}>{desc}</p>}
          <div className="row wrap" style={{ marginTop: 10, gap: 6 }}>
            {a.terms.map(term => <Link key={term} to={`/glossary/${term.toLowerCase().replace(/ /g, '-')}`} className="badge violet">📖 {term}</Link>)}
            {a.tags.map(tag => <span key={tag} className="badge gray">#{tag}</span>)}
            <GuardBtn cap="asset.editBusiness" hide className="btn sm ghost">+ Add term or tag</GuardBtn>
          </div>
        </Card>

        <div className="grid g2">
          <Card title={<h3 className="row">Business attributes <span className="faint small" style={{ fontWeight: 400 }}>DCAT v3 profile</span></h3>} actions={<GuardBtn cap="asset.editBusiness" hide className="btn sm ghost" aria-label="Edit attributes"><Pencil size={13} /></GuardBtn>}>
            <dl className="kv">
              <dt>Business name (TH)</dt><dd>{a.businessName.th}</dd>
              <dt>Purpose</dt><dd>Customer analytics, churn modelling, regulatory reporting</dd>
              <dt>Update frequency</dt><dd>Daily, 02:00</dd>
              <dt>Freshness SLA</dt><dd>≤ 26 hours</dd>
              <dt>Retention</dt><dd>7 years after relationship ends</dd>
              <dt>Usage constraints</dt><dd>Internal analytics only; no export of national_id</dd>
              <dt>Legal basis (PDPA)</dt><dd>Contract (s.24(3)); Consent for marketing</dd>
              <dt>Data product</dt><dd><Link to="/domains" className="row"><Package size={13} />Customer 360</Link></dd>
            </dl>
          </Card>
          <Card title={<h3 className="row">Technical metadata <TechLock /></h3>}>
            <dl className="kv">
              <dt>Format</dt><dd>Apache Iceberg v2</dd>
              <dt>Location</dt><dd className="mono ellipsis">s3a://lake/gold/customer_360</dd>
              <dt>Partition</dt><dd className="mono">bucket(16, customer_id)</dd>
              <dt>Snapshot</dt><dd className="mono">8812734401 · Oct 9 02:14</dd>
              <dt>Schema version</dt><dd>v7 <span className="badge amber">changed today</span></dd>
              <dt>Rows / size</dt><dd>{a.rows} · {a.size}</dd>
              <dt>Technical owner</dt><dd className="mono">svc_spark_etl</dd>
              <dt>Produced by</dt><dd className="mono">spark: build_customer_360</dd>
            </dl>
          </Card>
        </div>

        <Card title={`Columns (${cols.length})`} actions={<button className="link-btn small" onClick={() => goTab('columns')}>View all columns →</button>}>
          <ColumnTable cols={cols.slice(0, 6)} compact />
        </Card>
      </div>

      <div className="col" style={{ gap: 16 }}>
        <Card title="Stakeholders">
          <div className="col" style={{ gap: 12 }}>
            {([['Data Owner', a.owner], ['Data Steward', a.steward], ['Custodian', 'arthit'], ['DPO', 'pim']] as const).map(([role, id]) => (
              <div key={role} className="row"><span className="faint small" style={{ width: 92 }}>{role}</span><PersonChip id={id} sub /></div>
            ))}
          </div>
        </Card>

        <Card title="Data quality" actions={<button className="link-btn small" onClick={() => goTab('quality')}>Details</button>}>
          <div className="row" style={{ gap: 16 }}>
            <Donut value={a.dq ?? 0} size={92} />
            <div className="col grow" style={{ gap: 6 }}>
              <div className="small"><span style={{ color: 'var(--ok)' }}>●</span> Passing <b>5</b></div>
              <div className="small"><span style={{ color: 'var(--bad)' }}>●</span> Below threshold <b>2</b></div>
              <Sparkline data={dqTrend} width={140} height={28} color="var(--ok)" />
              <div className="faint small">Last GX run: today 02:31</div>
            </div>
          </div>
        </Card>

        <Card title="Certification readiness" actions={<span className="small"><b>{done}</b>/{checks.length}</span>}>
          <Meter value={(done / checks.length) * 100} color={done === checks.length ? 'var(--ok)' : 'var(--warn)'} />
          <div className="col" style={{ marginTop: 10, gap: 6 }}>
            {checks.map(([l, ok]) => (
              <div key={l} className="row small">{ok ? <CheckCircle2 size={15} color="var(--ok)" /> : <Circle size={15} color="var(--text-3)" />}<span className={ok ? '' : 'muted'}>{l}</span></div>
            ))}
          </div>
          <div className="faint small" style={{ marginTop: 8 }}>Critical assets must pass the completeness rule before an Owner can certify (CDMC C2).</div>
        </Card>

        <Card title="Usage">
          <div className="row" style={{ alignItems: 'baseline', gap: 6 }}><b style={{ fontSize: 22 }}>{a.usage.toLocaleString()}</b><span className="muted small">queries in 30 days · 47 users</span></div>
          <Sparkline data={[40, 52, 48, 61, 70, 66, 58, 72, 80, 77, 85, 90]} width={260} height={36} />
          <div className="faint small" style={{ marginTop: 6 }}>Top consumers: grp_customer_analytics, svc_churn_model</div>
        </Card>
      </div>
    </div>
  )
}

/* ---------------- Columns ---------------- */
function Columns({ cols }: { cols: Column[] }) {
  const [sel, setSel] = useState<Column | null>(null)
  const [filter, setFilter] = useState<'all' | 'pii' | 'cde' | 'undoc'>('all')
  const shown = cols.filter(c => filter === 'all' || (filter === 'pii' && c.pii) || (filter === 'cde' && c.cde) || (filter === 'undoc' && !c.description))
  return (
    <div style={{ display: 'grid', gridTemplateColumns: sel ? '1fr 340px' : '1fr', gap: 16, alignItems: 'start' }}>
      <Card title={
        <div className="row wrap" style={{ gap: 6 }}>
          {(['all', 'pii', 'cde', 'undoc'] as const).map(f => (
            <button key={f} className={`chip ${filter === f ? 'on' : ''}`} onClick={() => setFilter(f)}>
              {{ all: `All ${cols.length}`, pii: `PII ${cols.filter(c => c.pii).length}`, cde: `CDE ${cols.filter(c => c.cde).length}`, undoc: `Undocumented ${cols.filter(c => !c.description).length}` }[f]}
            </button>
          ))}
        </div>
      } actions={<><GuardBtn cap="asset.editBusiness" className="btn sm ai"><Sparkles size={13} />Generate missing (3)</GuardBtn><GuardBtn cap="asset.editBusiness" className="btn sm">Bulk edit</GuardBtn><button className="btn sm">Export dictionary</button></>}>
        <ColumnTable cols={shown} onSelect={setSel} selected={sel?.name} />
      </Card>
      {sel && <ColumnDrawer c={sel} onClose={() => setSel(null)} />}
    </div>
  )
}

function ColumnTable({ cols, compact, onSelect, selected }: { cols: Column[]; compact?: boolean; onSelect?: (c: Column) => void; selected?: string }) {
  return (
    <div className="tbl-wrap">
      <table className="tbl">
        <thead>
          <tr>
            <th>Column</th>{!compact && <th>Business name</th>}<th>Type</th><th>Glossary term</th><th>Classification</th><th>PII</th>
            <th style={{ minWidth: 140 }}><span style={{ color: 'var(--warn)' }}>Null</span> / <span style={{ color: 'var(--primary)' }}>Distinct</span></th>
            {!compact && <th>DQ</th>}
          </tr>
        </thead>
        <tbody>
          {cols.map(c => (
            <tr key={c.name} onClick={() => onSelect?.(c)} style={{ cursor: onSelect ? 'pointer' : undefined, background: selected === c.name ? 'var(--primary-50)' : undefined }}>
              <td>
                <div className="row" style={{ gap: 6 }}>
                  <span className="mono" style={{ fontWeight: 500 }}>{c.name}</span>
                  {c.pk && <span className="badge gray" style={{ height: 17 }}>PK</span>}
                  {c.cde && <span className="badge blue" style={{ height: 17 }} title="Critical Data Element">CDE</span>}
                </div>
              </td>
              {!compact && <td>{c.businessName || <span className="faint">—</span>}{c.aiDraft && <> <AiTag label="AI" /></>}</td>}
              <td className="mono faint">{c.type}</td>
              <td>{c.term ? <span className="badge violet">{c.term}</span> : <span className="faint small">—</span>}</td>
              <td><ClsBadge value={c.cls} /></td>
              <td>
                {c.pii ? (
                  c.piiState === 'suggested'
                    ? <span className="badge amber" title="Suggested by auto-classification, pending steward review"><Sparkles size={10} />{c.pii}?</span>
                    : <span className="badge red"><ShieldAlert size={11} />{c.pii}</span>
                ) : <span className="faint small">—</span>}
              </td>
              <td>
                <div className="bar" style={{ width: 130 }}>
                  <span style={{ width: `${Math.max(c.nulls, 1)}%`, background: 'var(--warn)' }} />
                  <span style={{ width: `${Math.min(c.distinct, 100 - c.nulls)}%`, background: 'var(--primary)' }} />
                </div>
                <div className="faint" style={{ fontSize: 10.5, marginTop: 2 }}>{c.nulls}% · {c.distinct}%</div>
              </td>
              {!compact && <td>{c.dq !== undefined ? <b style={{ color: scoreColor(c.dq) }}>{c.dq}%</b> : <span className="faint">—</span>}</td>}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

function ColumnDrawer({ c, onClose }: { c: Column; onClose: () => void }) {
  const { toast } = useShell()
  return (
    <aside className="card" style={{ position: 'sticky', top: 0 }}>
      <div className="row" style={{ padding: '12px 14px', borderBottom: '1px solid var(--border)' }}>
        <b className="mono grow">{c.name}</b>
        <button className="icon-btn" onClick={onClose} aria-label="Close"><X size={16} /></button>
      </div>
      <div className="card-b col" style={{ gap: 12 }}>
        {c.aiDraft && (
          <div className="ai-note small">
            <div className="row" style={{ marginBottom: 4 }}><AiTag /> <span className="faint">gpt-oss-120b · prompt v3 · 87% confidence</span></div>
            {c.description || 'Probability (0–1) that the customer ends all contracts within 90 days, from churn model v4.'}
            <div className="row" style={{ marginTop: 8 }}>
              <GuardBtn cap="asset.editBusiness" className="btn sm ok" onClick={() => toast('Accepted · logged as AI-assisted')}>Accept</GuardBtn>
              <GuardBtn cap="asset.editBusiness" className="btn sm">Edit</GuardBtn>
              <GuardBtn cap="asset.editBusiness" className="btn sm bad" onClick={() => toast('Rejected · will not be suggested again')}>Reject</GuardBtn>
            </div>
          </div>
        )}
        {!c.aiDraft && <div><div className="field-label">Description</div>{c.description || <i className="faint">None</i>}</div>}
        <dl className="kv" style={{ gridTemplateColumns: '110px 1fr' }}>
          <dt>Data type</dt><dd className="mono">{c.type}</dd>
          <dt>Glossary</dt><dd>{c.term ?? '—'}</dd>
          <dt>Classification</dt><dd><ClsBadge value={c.cls} /></dd>
          <dt>PII</dt><dd>{c.pii ?? '—'} {c.piiState && <span className="faint small">({c.piiState})</span>}</dd>
          <dt>CDE</dt><dd>{c.cde ? 'Yes' : 'No'}</dd>
          <dt>Pattern</dt><dd className="mono">{c.pattern ?? '—'}</dd>
        </dl>
        <div>
          <div className="field-label">Profile (sampled via Trino · 100k rows · values not stored)</div>
          <div className="grid g2" style={{ gap: 8 }}>
            <div className="card stat" style={{ padding: 10 }}><div className="l">Null</div><b>{c.nulls}%</b></div>
            <div className="card stat" style={{ padding: 10 }}><div className="l">Distinct</div><b>{c.distinct}%</b></div>
          </div>
        </div>
        {c.piiState === 'suggested' && (
          <div className="card" style={{ padding: 10, borderColor: '#f6dcb0', background: 'var(--warn-50)' }}>
            <div className="small"><b>Classification suggestion:</b> {c.pii} · Restricted</div>
            <div className="faint small">LLM detector, 95% — column name and value set indicate religious belief (PDPA s.26).</div>
            <div className="row" style={{ marginTop: 8 }}>
              <GuardBtn cap="asset.confirmPii" className="btn sm ok" onClick={() => toast('PII confirmed · tag will sync to Lakehouse')}>Confirm</GuardBtn>
              <GuardBtn cap="asset.confirmPii" className="btn sm bad" onClick={() => toast('Marked not PII · will not be suggested again')}>Not PII</GuardBtn>
            </div>
          </div>
        )}
        <div className="row"><GitBranch size={14} /><a className="small">Column lineage: 3 upstream · 1 downstream</a></div>
      </div>
    </aside>
  )
}

/* ---------------- Quality ---------------- */
function Quality({ a }: { a: Asset }) {
  const { toast } = useShell()
  const [created, addRule] = useStored<NewRule>('dqRules')
  const [open, setOpen] = useState(false)
  const mine = created.filter(r => r.dataset === a.path)
  const dims = ['Accuracy', 'Completeness', 'Validity', 'Consistency', 'Uniqueness', 'Timeliness']
  const dimScore = (d: string) => {
    const r = dqRules.filter(x => x.dimension === d)
    return r.length ? +(r.reduce((s, x) => s + x.score, 0) / r.length).toFixed(1) : undefined
  }
  return (
    <div className="col" style={{ gap: 16 }}>
      <div className="grid" style={{ gridTemplateColumns: '220px repeat(6, minmax(0,1fr))', gap: 12 }}>
        <div className="card row" style={{ padding: 14, gap: 12 }}>
          <Donut value={a.dq ?? 0} size={78} />
          <div><div className="faint small">Overall</div><b>7 rules</b><div className="faint small">GX suite v12</div></div>
        </div>
        {dims.map(d => {
          const s = dimScore(d)
          return (
            <div key={d} className="card" style={{ padding: 12 }}>
              <div className="faint small">{d}</div>
              <b style={{ fontSize: 20, color: s !== undefined ? scoreColor(s) : 'var(--text-3)' }}>{s !== undefined ? `${s}%` : '—'}</b>
              {s !== undefined && <Meter value={s} />}
            </div>
          )
        })}
      </div>
      <div className="grid g3">
        <Card title="Score trend · last 12 runs" className="span2">
          <TrendChart data={dqTrend} />
        </Card>
        <Card title={<h3 className="row"><Sparkles size={15} color="var(--ai)" />Suggested rules</h3>}>
          <div className="col" style={{ gap: 10 }}>
            {[
              ['province_code in Thai province code list', 'Validity · from glossary “Province”'],
              ['birth_date between 1900-01-01 and today', 'Validity · from profiling'],
              ['customer_since ≤ first contract start', 'Consistency · from lineage'],
            ].map(([r, why]) => (
              <div key={r} className="ai-note small">
                <b>{r}</b><div className="faint">{why}</div>
                <div className="row" style={{ marginTop: 6 }}><GuardBtn cap="dq.ruleCreate" className="btn sm ok">Add to suite</GuardBtn><GuardBtn cap="dq.ruleCreate" hide className="btn sm ghost">Dismiss</GuardBtn></div>
              </div>
            ))}
          </div>
        </Card>
      </div>
      <Card title="Rules" actions={<><GuardBtn cap="dq.import" className="btn sm">Import GX suite</GuardBtn><GuardBtn cap="dq.ruleCreate" className="btn sm primary" onClick={() => setOpen(true)}>+ New rule</GuardBtn></>}>
        <div className="tbl-wrap">
          <table className="tbl">
            <thead><tr><th>Rule</th><th>Column</th><th>Dimension</th><th>Expectation</th><th>Severity</th><th>Threshold</th><th>Score</th><th>Trend</th></tr></thead>
            <tbody>
              {mine.map(r => (
                <tr key={r.id} className="new-row"><td><b>{r.name}</b> <span className="badge blue">new</span></td><td className="mono">{r.column}</td><td>{r.dimension}</td><td className="mono faint small">{r.gx}</td>
                  <td><span className={`badge ${r.severity === 'High' ? 'red' : r.severity === 'Medium' ? 'amber' : 'gray'}`}>{r.severity}</span></td><td>{r.threshold}%</td><td className="faint small">pending</td><td /></tr>
              ))}
              {dqRules.map(r => (
                <tr key={r.id}>
                  <td><b>{r.name}</b></td>
                  <td className="mono">{r.column}</td>
                  <td>{r.dimension}</td>
                  <td className="mono faint small">{r.gx}</td>
                  <td><span className={`badge ${r.severity === 'High' ? 'red' : r.severity === 'Medium' ? 'amber' : 'gray'}`}>{r.severity}</span></td>
                  <td>{r.threshold}%</td>
                  <td><b style={{ color: r.score >= r.threshold ? 'var(--ok)' : 'var(--bad)' }}>{r.score}%</b>{r.score < r.threshold && <AlertTriangle size={13} color="var(--bad)" style={{ marginLeft: 4, verticalAlign: -2 }} />}</td>
                  <td><Sparkline data={r.trend} width={90} height={22} color={r.score >= r.threshold ? 'var(--ok)' : 'var(--bad)'} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
      {open && <NewDqRuleForm dataset={a.path} onClose={() => setOpen(false)} onCreate={r => { addRule(r); setOpen(false); toast(`Rule “${r.name}” added to the suite`) }} />}
    </div>
  )
}

function TrendChart({ data }: { data: number[] }) {
  const W = 640, H = 180, P = 30
  const lo = 90, hi = 100
  const x = (i: number) => P + (i / (data.length - 1)) * (W - P * 2)
  const y = (v: number) => H - P - ((v - lo) / (hi - lo)) * (H - P * 2)
  const d = data.map((v, i) => `${i ? 'L' : 'M'}${x(i)},${y(v)}`).join(' ')
  return (
    <svg viewBox={`0 0 ${W} ${H}`} style={{ width: '100%', height: 'auto' }}>
      {[90, 95, 100].map(v => (
        <g key={v}><line x1={P} x2={W - P} y1={y(v)} y2={y(v)} stroke="#eef1f5" /><text x={P - 6} y={y(v)} fontSize="10" textAnchor="end" dominantBaseline="central" fill="var(--text-3)">{v}%</text></g>
      ))}
      <line x1={P} x2={W - P} y1={y(95)} y2={y(95)} stroke="var(--warn)" strokeDasharray="4 4" />
      <text x={W - P} y={y(95) - 6} fontSize="10" textAnchor="end" fill="var(--warn)">target 95%</text>
      <path d={`${d} L${x(data.length - 1)},${H - P} L${x(0)},${H - P} Z`} fill="var(--primary)" opacity=".07" />
      <path d={d} fill="none" stroke="var(--primary)" strokeWidth="2" />
      {data.map((v, i) => <circle key={i} cx={x(i)} cy={y(v)} r="3" fill="white" stroke="var(--primary)" strokeWidth="1.5"><title>{v}%</title></circle>)}
    </svg>
  )
}

/* ---------------- Access ---------------- */
function Access({ onRequest }: { onRequest: () => void }) {
  return (
    <div className="grid g3">
      <Card title="Who has access" className="span2" actions={<span className="faint small">Read from Lakehouse access control · synced 10 min ago</span>}>
        <div className="tbl-wrap">
          <table className="tbl">
            <thead><tr><th>Principal</th><th>Type</th><th>Privilege</th><th>Masked columns</th><th>Expires</th><th>Granted via</th></tr></thead>
            <tbody>
              {accessGrants.map(g => (
                <tr key={g.principal}>
                  <td><b>{g.principal}</b></td><td><span className="badge gray">{g.kind}</span></td><td className="mono">{g.privilege}</td>
                  <td className="mono small">{g.masked}</td><td>{g.expires}</td><td className="small muted">{g.via}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
      <div className="col" style={{ gap: 16 }}>
        <Card title="Your access">
          <div className="row"><Lock size={16} color="var(--warn)" /><span>You can see metadata but not query data.</span></div>
          <GuardBtn cap="asset.requestAccess" className="btn primary" style={{ marginTop: 12 }} onClick={onRequest}><KeyRound size={14} />Request access</GuardBtn>
        </Card>
        <Card title="Policies applied">
          <div className="col small" style={{ gap: 8 }}>
            <div className="row"><span className="badge amber">Tag</span>confidential → Lakehouse tag <code>cls_confidential</code></div>
            <div className="row"><span className="badge red">Mask</span>pii_national_id → hash except DPO</div>
            <div className="row"><span className="badge red">Mask</span>pii_contact → partial (last 4)</div>
            <div className="row"><span className="badge blue">Review</span>Quarterly access review · next Jan 2027</div>
          </div>
        </Card>
      </div>
    </div>
  )
}

/* ---------------- History ---------------- */
function HistoryTab() {
  return (
    <div className="grid g3">
      <Card title="Audit trail" className="span2" actions={<button className="btn sm">Export</button>}>
        <div className="col" style={{ gap: 0 }}>
          {auditEvents.map((e, i) => (
            <div key={i} className="row" style={{ alignItems: 'flex-start', padding: '10px 0', borderBottom: '1px solid var(--border)' }}>
              <Avatar id={e.who} size="sm" />
              <div className="grow">
                <div><b>{e.who === 'system' ? 'System' : people[e.who]?.name}</b> {e.action.toLowerCase()} <span className="mono small">{e.target}</span></div>
                {(e.from || e.to) && <div className="small" style={{ marginTop: 2 }}>{e.from && <span className="diff-old">{e.from}</span>}{e.from && ' → '}<span className="diff-new">{e.to}</span></div>}
                {e.via && <div className="small" style={{ marginTop: 2 }}><AiTag label="via AI" /> <span className="faint">{e.via}</span></div>}
              </div>
              <span className="faint small" style={{ whiteSpace: 'nowrap' }}>{e.when}</span>
            </div>
          ))}
        </div>
      </Card>
      <Card title="Schema versions">
        <div className="col" style={{ gap: 10 }}>
          {[
            ['v7', 'Oct 9, 2026', '+ last_channel (string)', 'amber'],
            ['v6', 'Aug 14, 2026', '+ churn_score (double)', 'gray'],
            ['v5', 'Jun 2, 2026', 'monthly_revenue decimal(12,2) → decimal(18,2)', 'gray'],
            ['v4', 'Mar 30, 2026', '− fax_no', 'gray'],
          ].map(([v, d, c, col]) => (
            <div key={v} className="row" style={{ alignItems: 'flex-start' }}>
              <span className={`badge ${col}`}>{v}</span>
              <div className="grow small"><div>{c}</div><div className="faint">{d}</div></div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  )
}

/* ---------------- Side panel + modals ---------------- */
function Discussion({ onClose }: { onClose: () => void }) {
  const [text, setText] = useState('')
  return (
    <aside className="side-panel">
      <div className="sp-h"><b className="grow">Discussion &amp; Q&amp;A</b><button className="icon-btn" onClick={onClose} aria-label="Close"><X size={16} /></button></div>
      <div style={{ padding: 14, borderBottom: '1px solid var(--border)' }}>
        <textarea className="input" rows={3} style={{ width: '100%' }} placeholder="Ask a question or leave a review. Use @ to mention someone." value={text} onChange={e => setText(e.target.value)} />
        <div className="row" style={{ marginTop: 8 }}><span className="faint small grow">Rate:</span><Stars value={0} /><GuardBtn cap="asset.comment" className="btn sm primary">Post</GuardBtn></div>
      </div>
      <div style={{ overflow: 'auto', padding: 14 }} className="col">
        {comments.map((c, i) => (
          <div key={i} className="card" style={{ padding: 12 }}>
            <div className="row"><Avatar id={c.who} size="sm" /><b className="small">{people[c.who].name}</b><Stars value={c.rating} /><span className="faint small" style={{ marginLeft: 'auto' }}>{c.when}</span></div>
            <p className="small" style={{ margin: '8px 0' }}>{c.text}</p>
            {c.replies.map((r, j) => (
              <div key={j} style={{ borderLeft: '2px solid var(--primary-100)', paddingLeft: 10, marginTop: 6 }}>
                <div className="row"><Avatar id={r.who} size="sm" /><b className="small">{people[r.who].name}</b><span className="badge violet" style={{ height: 17 }}>Steward</span></div>
                <p className="small" style={{ margin: '4px 0 0' }}>{r.text}</p>
              </div>
            ))}
            <button className="link-btn small" style={{ marginTop: 6 }}>Reply</button>
          </div>
        ))}
      </div>
    </aside>
  )
}

function RequestAccess({ a, cols, onClose, onDone }: { a: Asset; cols: Column[]; onClose: () => void; onDone: () => void }) {
  const [purpose, setPurpose] = useState('')
  return (
    <div className="modal-back" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()} role="dialog" aria-label="Request access">
        <div className="mh"><b className="grow">Request access · {a.name}</b><button className="icon-btn" onClick={onClose}><X size={16} /></button></div>
        <div className="mb">
          <div className="stepper">
            {['Submit', 'Data Owner', 'DPO (PII)', 'Grant in Lakehouse'].map((s, i) => (
              <span key={s} className="row" style={{ gap: 0 }}>
                {i > 0 && <span className="step-line" />}
                <span className={`step ${i === 0 ? 'cur' : ''}`}><span className="d">{i + 1}</span>{s}</span>
              </span>
            ))}
          </div>
          <div><div className="field-label">Purpose of use (required · CDMC C8)</div><textarea className="input" rows={3} style={{ width: '100%' }} value={purpose} onChange={e => setPurpose(e.target.value)} placeholder="e.g. Q4 churn analysis for retention campaign" /></div>
          <div className="grid g2" style={{ gap: 12 }}>
            <div><div className="field-label">Privilege</div><select className="input" style={{ width: '100%' }}><option>SELECT (read)</option></select></div>
            <div><div className="field-label">Duration</div><select className="input" style={{ width: '100%' }}><option>30 days</option><option>90 days</option><option>180 days</option></select></div>
          </div>
          <div>
            <div className="field-label">Columns</div>
            <div className="row wrap" style={{ gap: 6 }}>
              {cols.slice(0, 8).map(c => <label key={c.name} className="chip"><input type="checkbox" defaultChecked={!c.pii} />{c.name}{c.pii && <ShieldAlert size={11} color="var(--bad)" />}</label>)}
            </div>
          </div>
          <div className="ai-note small"><Sparkles size={12} color="var(--ai)" /> This table is <b>Confidential</b> and contains <b>sensitive PII</b>. Selecting PII columns adds a DPO approval step. Unselected PII columns stay masked.</div>
        </div>
        <div className="mf"><button className="btn" onClick={onClose}>Cancel</button><button className="btn primary" disabled={!purpose} onClick={onDone} style={{ opacity: purpose ? 1 : .5 }}>Submit request</button></div>
      </div>
    </div>
  )
}

function ReportIssue({ a, onClose, onDone }: { a: Asset; onClose: () => void; onDone: () => void }) {
  return (
    <div className="modal-back" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()} role="dialog" aria-label="Report data issue">
        <div className="mh"><b className="grow">Report a data issue · {a.name}</b><button className="icon-btn" onClick={onClose}><X size={16} /></button></div>
        <div className="mb">
          <div><div className="field-label">Title</div><input className="input" style={{ width: '100%' }} placeholder="e.g. Segment is empty for new customers" /></div>
          <div className="grid g2" style={{ gap: 12 }}>
            <div><div className="field-label">Quality dimension</div><select className="input" style={{ width: '100%' }}><option>Completeness</option><option>Accuracy</option><option>Validity</option><option>Timeliness</option></select></div>
            <div><div className="field-label">Severity</div><select className="input" style={{ width: '100%' }}><option>Medium</option><option>High</option><option>Low</option></select></div>
          </div>
          <div><div className="field-label">Details</div><textarea className="input" rows={4} style={{ width: '100%' }} /></div>
          <div className="faint small">Assigned automatically to the Steward ({a.steward ? people[a.steward].name : '—'}). Lifecycle: Reported → Assigned → Root cause → Corrective action → Closed (ISO 8000-61).</div>
        </div>
        <div className="mf"><button className="btn" onClick={onClose}>Cancel</button><button className="btn primary" onClick={onDone}>Create issue</button></div>
      </div>
    </div>
  )
}
