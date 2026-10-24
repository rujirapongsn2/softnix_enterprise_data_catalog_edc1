import { useState } from 'react'
import { Link } from 'react-router-dom'
import {
  FileCheck2, GitCompare, Users, CheckCircle2, XCircle, AlertTriangle, Activity, BellRing, Plus, Download, ShieldCheck, Copy, Workflow, BellOff,
} from 'lucide-react'
import { people } from '../data/mock'
import {
  contract, contractFields, contractVersions, contractDiff, consumers, productSlos, certChecks, incidents, volumeSeries, pipelineHealth,
  alertRules, maintenanceWindows, qualityKpis, domainQuality, type Sev,
} from '../data/qbd'
import { Card, Avatar, Donut, Sparkline, Meter, PersonChip, Tabs } from '../components/ui'
import { useShell } from '../components/Layout'
import { GuardBtn, useRole } from '../auth/role'
import { useStored } from '../data/store'
import { NewAlertRuleForm, MaintenanceWindowForm, type NewAlert, type NewWindow } from '../forms/Forms'

const sevBadge = (s: Sev | string) => (s === 'Critical' ? 'red' : s === 'High' ? 'amber' : s === 'Medium' ? 'blue' : 'gray')
const changeBadge = (c: string) => (c === 'breaking' ? <span className="badge red">Breaking</span> : c === 'non-breaking' ? <span className="badge amber">Non-breaking</span> : <span className="badge green">Match</span>)

/* ---------- Asset → Contract tab (CTR-01..05) ---------- */
export function ContractTab() {
  const { toast } = useShell()
  const ok = contract.status === 'Compliant'
  const breaking = contractFields.filter(f => f.change === 'breaking').length
  return (
    <div className="grid g3">
      <Card className="span2" title={<h2 className="row"><FileCheck2 size={15} />Data contract {contract.id} <span className="badge outline">v{contract.version}</span><span className="badge blue">{contract.standard}</span></h2>}
        actions={<><button className="btn sm" onClick={() => toast('GX suite gx_customer_360_v2_3.json exported')}><Download size={13} />Export GX suite</button><GuardBtn cap="contract.propose" className="btn sm primary" onClick={() => toast('Draft v2.4.0 created · awaiting producer + consumer approval')}><Plus size={13} />Propose v2.4.0</GuardBtn></>}>
        <div className="row" style={{ gap: 12, padding: 12, borderRadius: 8, marginBottom: 14, background: ok ? 'var(--ok-50)' : 'var(--bad-50)' }}>
          {ok ? <CheckCircle2 size={20} color="var(--ok)" /> : <XCircle size={20} color="var(--bad)" />}
          <div className="grow"><b>{ok ? 'Compliant' : 'Violated'}</b> · last checked {contract.lastCheck}<div className="small muted">{breaking} breaking change(s) detected at harvest · subscribed consumers notified (CTR-03) · Gold publish quarantined</div></div>
        </div>
        <div className="faint small" style={{ marginBottom: 6 }}>Expected schema (contract) vs actual schema (harvested)</div>
        <div className="tbl-wrap">
          <table className="tbl">
            <thead><tr><th>Column</th><th>Expected</th><th>Actual</th><th>Req.</th><th>Class.</th><th>DQ rule</th><th>Status</th></tr></thead>
            <tbody>
              {contractFields.map(f => (
                <tr key={f.name} style={{ background: f.change === 'breaking' ? 'var(--bad-50)' : undefined }}>
                  <td className="mono"><b>{f.name}</b>{f.note && <div className="faint small" style={{ fontFamily: 'var(--font)' }}>{f.note}</div>}</td>
                  <td className="mono small">{f.expected}</td><td className="mono small">{f.actual}</td>
                  <td>{f.required ? '✓' : ''}</td><td className="small">{f.cls}</td><td className="small">{f.rule ?? '—'}</td><td>{changeBadge(f.change)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
      <div className="col" style={{ gap: 16 }}>
        <Card title="Contract terms">
          <dl className="kv">
            <dt>Product</dt><dd>{contract.product}</dd>
            <dt>Owner</dt><dd><PersonChip id={contract.owner} /></dd>
            <dt>Steward</dt><dd><PersonChip id={contract.steward} /></dd>
            <dt>Semantics</dt><dd className="small">{contract.semantics}</dd>
            <dt>Enforcement</dt><dd className="small">{contract.enforcement}</dd>
          </dl>
          <div className="divider" />
          <div className="faint small" style={{ marginBottom: 6 }}>SLA / SLO</div>
          {contract.sla.map(s => (
            <div key={s.k} className="row small" style={{ padding: '4px 0' }}><span className="grow">{s.k} <span className="faint">{s.target}</span></span><b>{s.actual}</b>{s.ok ? <CheckCircle2 size={14} color="var(--ok)" /> : <XCircle size={14} color="var(--bad)" />}</div>
          ))}
        </Card>
        <Card title={<h2 className="row"><Users size={15} />Consumers · {consumers.length}</h2>}>
          {consumers.map(c => (
            <div key={c.name} className="row small" style={{ padding: '6px 0', borderBottom: '1px solid var(--border)' }}>
              <Avatar id={c.owner} size="sm" /><span className="grow"><b>{c.name}</b><div className="faint">{c.kind} · {c.subscribed ? 'subscribed' : 'not subscribed'}</div></span>
              {c.impacted ? <span className="badge red">Impacted</span> : <span className="badge gray">OK</span>}
            </div>
          ))}
        </Card>
      </div>
      <Card className="span3" title={<h2 className="row"><GitCompare size={15} />Version history</h2>}>
        <div className="grid g2">
          <table className="tbl">
            <thead><tr><th>Version</th><th>Date</th><th>By</th><th>Change</th><th>Approvals</th></tr></thead>
            <tbody>{contractVersions.map(v => (
              <tr key={v.v}><td className="mono"><b>{v.v}</b> {v.kind === 'major' ? <span className="badge red">major</span> : <span className="badge blue">minor</span>}</td><td>{v.date}</td><td>{people[v.by].name.split(' ')[0]}</td><td className="small">{v.note}</td><td className="small">{v.approvals}</td></tr>
            ))}</tbody>
          </table>
          <div>
            <div className="row small faint" style={{ marginBottom: 6 }}>Diff v2.2.0 → v2.3.0 <button className="btn sm ghost" style={{ marginLeft: 'auto' }}><Copy size={12} />YAML</button></div>
            <div className="card" style={{ padding: 10, background: 'var(--surface-2)' }}>
              {contractDiff.map((d, i) => <div key={i} className={`mono small ${d.sign === '+' ? 'diff-new' : 'diff-old'}`}>{d.sign} {d.text}</div>)}
            </div>
          </div>
        </div>
      </Card>
    </div>
  )
}

/* ---------- SLO badges on data product cards ---------- */
export function SloBadges({ productId }: { productId: string }) {
  const p = productSlos[productId]
  if (!p) return null
  const breached = p.slos.filter(s => !s.met).length
  return (
    <div className="col" style={{ gap: 6 }}>
      <div className="row small">
        <span className="faint">SLO</span>
        {breached ? <span className="badge red">{breached} breached</span> : <span className="badge green">All met</span>}
        <span className="faint" style={{ marginLeft: 'auto' }}>Error budget</span><b>{p.budgetLeft}%</b>
      </div>
      <div className="row wrap" style={{ gap: 4 }}>
        {p.slos.map(s => (
          <span key={s.k} className={`badge ${s.met ? 'green' : 'red'}`} title={`Target ${s.target} · 30-day attainment ${s.att30}%`}>{s.met ? '✓' : '✕'} {s.k} {s.att30}%</span>
        ))}
      </div>
    </div>
  )
}

/* ---------- Certification gate checklist ---------- */
export function CertificationChecklist() {
  const failed = certChecks.filter(c => !c.pass).length
  return (
    <div className="card" style={{ padding: 14, marginTop: 14 }}>
      <div className="row" style={{ marginBottom: 8 }}><ShieldCheck size={16} color="var(--primary)" /><b className="grow">Certification gate</b>
        {failed ? <span className="badge red">{failed} of {certChecks.length} failed · cannot certify</span> : <span className="badge green">All passed</span>}</div>
      {certChecks.map(c => (
        <div key={c.k} className="row small" style={{ padding: '6px 0', borderTop: '1px solid var(--border)', alignItems: 'flex-start' }}>
          {c.pass ? <CheckCircle2 size={15} color="var(--ok)" /> : <XCircle size={15} color="var(--bad)" />}
          <div className="grow"><b>{c.k}</b><div className="faint">{c.detail}</div></div>
          <span className={`badge ${c.pass ? 'green' : 'red'}`}>{c.pass ? 'Pass' : 'Fail'}</span>
        </div>
      ))}
      <div className="faint small" style={{ marginTop: 8 }}>DQ score = Σ(rule pass rate × dimension weight × severity weight), CDE rules ×2 · auto-decertify after 3 consecutive runs below threshold</div>
    </div>
  )
}

/* ---------- Observability: incident timeline ---------- */
export function Observability() {
  const { toast } = useShell()
  const [type, setType] = useState('All')
  const list = incidents.filter(i => type === 'All' || i.type === type)
  return (
    <div className="page">
      <div className="page-h">
        <div><h1>Data Observability</h1><div className="sub">Volume, schema and distribution anomalies, contract checks and pipeline health from OpenLineage RunEvents · alerts routed to Owner/Steward with dedup</div></div>
        <div className="actions"><Link to="/alerts" className="btn"><BellRing size={14} />Alert settings</Link></div>
      </div>
      <div className="grid g4" style={{ marginBottom: 16 }}>
        <div className="card stat"><div className="l">Open incidents</div><div className="v" style={{ color: 'var(--bad-text)' }}>3</div><div className="faint small">1 critical · 2 high</div></div>
        <div className="card stat"><div className="l">MTTD · 30 d</div><div className="v">18 min</div><div className="faint small">target ≤ 30 min</div></div>
        <div className="card stat"><div className="l">Alerts deduplicated</div><div className="v">142 → 16</div><div className="faint small">89% noise removed</div></div>
        <div className="card stat"><div className="l">Pipeline success · 24 h</div><div className="v" style={{ color: 'var(--ok-text)' }}>98.7%</div><div className="faint small">4 failed of 312 runs</div></div>
      </div>
      <div className="grid g3">
        <Card className="span2" title={<h2 className="row"><Activity size={15} />Incident timeline</h2>}
          actions={<div className="row" style={{ gap: 4 }}>{['All', 'Schema', 'Volume', 'Distribution', 'Pipeline', 'Freshness'].map(k => <button key={k} className={`chip ${type === k ? 'on' : ''}`} onClick={() => setType(k)}>{k}</button>)}</div>}>
          <div style={{ position: 'relative', paddingLeft: 22 }}>
            <div style={{ position: 'absolute', left: 7, top: 6, bottom: 6, width: 2, background: 'var(--border)' }} />
            {list.map(i => (
              <div key={i.id} style={{ position: 'relative', paddingBottom: 16 }}>
                <span style={{ position: 'absolute', left: -20, top: 4, width: 12, height: 12, borderRadius: 6, border: '2px solid white', background: i.sev === 'Critical' ? 'var(--bad)' : i.sev === 'High' ? 'var(--warn)' : i.sev === 'Medium' ? 'var(--primary)' : 'var(--text-3)', boxShadow: '0 0 0 1px var(--border)' }} />
                <div className="row small"><span className="faint mono">{i.at}</span><span className="faint mono">· {i.id}</span><span className={`badge ${sevBadge(i.sev)}`}>{i.sev}</span><span className="badge outline">{i.type}</span>
                  <span className={`badge ${i.state === 'Resolved' ? 'green' : i.state === 'Muted' ? 'gray' : i.state === 'Acknowledged' ? 'blue' : 'red'}`} style={{ marginLeft: 'auto' }}>{i.state === 'Muted' && <BellOff size={11} />}{i.state}</span></div>
                <div style={{ fontWeight: 600, marginTop: 3 }}>{i.title}</div>
                <div className="faint small mono">{i.asset}</div>
                <div className="row small" style={{ marginTop: 4, gap: 14 }}><span><span className="faint">Routed to</span> {i.routed}</span><span><span className="faint">Grouped</span> {i.dedup} alert{i.dedup > 1 ? 's' : ''}</span><span><span className="faint">Detected</span> {i.detected}</span>
                  {i.state === 'Open' && <GuardBtn cap="incident.ack" className="btn sm" style={{ marginLeft: 'auto' }} onClick={() => toast(`${i.id} acknowledged · Data Issue created`)}>Acknowledge</GuardBtn>}</div>
              </div>
            ))}
          </div>
        </Card>
        <div className="col" style={{ gap: 16 }}>
          <Card title="Volume · WEB_EVENTS (M rows/day)">
            <Sparkline data={volumeSeries} width={300} height={60} color="var(--primary)" />
            <div className="row small" style={{ marginTop: 6 }}><AlertTriangle size={13} color="var(--warn)" />Last point outside 3σ band (expected 3.7–4.6M)</div>
          </Card>
          <Card title="Freshness · billing_monthly (hours late)">
            <Sparkline data={[0, 0, 1, 0, 0, 0, 2, 0, 0, 0, 0, 18, 30, 48]} width={300} height={50} color="var(--warn)" />
          </Card>
          <Card title={<h2 className="row"><Workflow size={15} />Pipeline health (OpenLineage)</h2>}>
            {pipelineHealth.map(p => {
              const r = Math.round((p.success / p.runs) * 1000) / 10
              return (
                <div key={p.job} style={{ padding: '6px 0', borderBottom: '1px solid var(--border)' }}>
                  <div className="row small"><b className="mono grow">{p.job}</b><span className={p.last.startsWith('FAIL') ? 'badge red' : 'badge green'}>{p.last}</span></div>
                  <div className="row small"><Meter value={r} /><span style={{ width: 120 }} className="faint">{r}% · p95 {p.p95}</span></div>
                </div>
              )
            })}
          </Card>
        </div>
      </div>
    </div>
  )
}

/* ---------- Alert settings ---------- */
export function AlertSettings() {
  const { toast } = useShell()
  const { can } = useRole()
  const [created, addRule] = useStored<NewAlert>('alertRules')
  const [wins, addWin] = useStored<NewWindow>('maintenance')
  const [rules, setRules] = useState(alertRules)
  const [ruleOpen, setRuleOpen] = useState(false)
  const [winOpen, setWinOpen] = useState(false)
  const [toggled, setToggled] = useState<Record<string, boolean>>({})
  return (
    <div className="page">
      <div className="page-h">
        <div><h1>Alert Settings</h1><div className="sub">Who gets notified, on which channel, with what severity and dedup window · maintenance windows mute alerts</div></div>
        <div className="actions"><GuardBtn cap="alert.ruleCreate" className="btn primary" onClick={() => setRuleOpen(true)}><Plus size={14} />New alert rule</GuardBtn></div>
      </div>
      <Card title="Routing rules">
        <div className="tbl-wrap">
          <table className="tbl">
            <thead><tr><th>ID</th><th>Scope</th><th>Trigger</th><th>Severity</th><th>Route to</th><th>Channels</th><th>Dedup / grouping</th><th>Enabled</th></tr></thead>
            <tbody>{created.map(r => (
              <tr key={r.id} className="new-row">
                <td className="mono">{r.id} <span className="badge blue">new</span></td><td>{r.scope}</td><td><b>{r.trigger}</b></td><td><span className={`badge ${sevBadge(r.sev)}`}>{r.sev}</span></td>
                <td className="small">{r.route}</td><td className="small">{r.channel}</td><td className="small">{r.dedup}</td>
                <td><input type="checkbox" checked={toggled[r.id] ?? r.on} disabled={!can('alert.ruleCreate')} onChange={() => setToggled(t => ({ ...t, [r.id]: !(t[r.id] ?? r.on) }))} /></td>
              </tr>
            ))}{rules.map(r => (
              <tr key={r.id}>
                <td className="mono">{r.id}</td><td>{r.scope}</td><td><b>{r.trigger}</b></td><td><span className={`badge ${sevBadge(r.sev)}`}>{r.sev}</span></td>
                <td className="small">{r.route}</td><td className="small">{r.channel}</td><td className="small">{r.dedup}</td>
                <td><input type="checkbox" checked={r.on} disabled={!can('alert.ruleCreate')} title={can('alert.ruleCreate') ? undefined : 'View only for your role'} onChange={() => setRules(rs => rs.map(x => x.id === r.id ? { ...x, on: !x.on } : x))} /></td>
              </tr>
            ))}</tbody>
          </table>
        </div>
      </Card>
      <div className="grid g2" style={{ marginTop: 16 }}>
        <Card title={<h2 className="row"><BellOff size={15} />Maintenance windows (mute)</h2>} actions={<GuardBtn cap="alert.maintenance" className="btn sm" onClick={() => setWinOpen(true)}><Plus size={13} />Add</GuardBtn>}>
          {[...wins, ...maintenanceWindows].map(m => (
            <div key={m.scope + m.when} className="row small" style={{ padding: '6px 0', borderBottom: '1px solid var(--border)', background: 'isNew' in m ? '#f3f9fd' : undefined }}><b className="grow mono">{m.scope}</b><span>{m.when}</span><span className="faint">{m.reason}</span></div>
          ))}
        </Card>
        <Card title="Escalation & on-call">
          <dl className="kv">
            <dt>Default route</dt><dd>Steward of asset → Owner if not acknowledged in 4 h</dd>
            <dt>On-call</dt><dd className="row"><Avatar id="arthit" size="sm" />Arthit P. (Data Eng) this week</dd>
            <dt>Severity map</dt><dd className="small">Critical: page · High: chat + email · Medium: email · Low: daily digest</dd>
            <dt>Auto Data Issue</dt><dd>High and Critical (DQ-05)</dd>
          </dl>
        </Card>
      </div>
      {ruleOpen && <NewAlertRuleForm onClose={() => setRuleOpen(false)} onCreate={r => { addRule(r); setRuleOpen(false); toast(`Alert rule ${r.id} created`) }} />}
      {winOpen && <MaintenanceWindowForm onClose={() => setWinOpen(false)} onCreate={w => { addWin(w); setWinOpen(false); toast(`Alerts muted for ${w.scope}`) }} />}
    </div>
  )
}

/* ---------- Governance Dashboard → Quality tab ---------- */
export function QualityKpis() {
  return (
    <>
      <div className="grid g3" style={{ marginBottom: 16 }}>
        {qualityKpis.map(m => {
          const ok = m.lower ? m.v <= m.target : m.v >= m.target
          const col = ok ? 'var(--ok)' : 'var(--warn)'
          return (
            <div key={m.k} className="card row" style={{ padding: 16, gap: 16 }}>
              {m.unit === '%' ? <Donut value={m.v} size={76} color={col} /> : <div style={{ width: 76, textAlign: 'center' }}><b style={{ fontSize: 24, color: col }}>{m.v}</b><div className="faint small">{m.unit.trim() || 'count'}</div></div>}
              <div className="grow">
                <div className="muted small">{m.k}</div>
                <div className="row small" style={{ marginTop: 2 }}>Target <b>{m.lower ? '≤' : '≥'} {m.target}{m.unit}</b><span className={`badge ${ok ? 'green' : 'amber'}`}>{ok ? 'On track' : 'Off target'}</span></div>
                <div style={{ marginTop: 6 }}><Sparkline data={m.trend} width={160} height={28} color={col} /></div>
              </div>
            </div>
          )
        })}
      </div>
      <Card title="Monthly domain quality review (PDCA)">
        <div className="tbl-wrap">
          <table className="tbl">
            <thead><tr><th>Domain</th><th style={{ width: '24%' }}>CDE rule coverage</th><th>Products meeting SLO</th><th>MTTD (min)</th><th>MTTR (days)</th><th>Contract violations</th><th>Review</th></tr></thead>
            <tbody>{domainQuality.map(d => (
              <tr key={d.d}>
                <td><b>{d.d}</b></td>
                <td><div className="row"><Meter value={d.cov} color={d.cov >= 90 ? 'var(--ok)' : 'var(--warn)'} /><b className="small" style={{ width: 36 }}>{d.cov}%</b></div></td>
                <td>{d.slo}</td><td>{d.mttd}</td><td>{d.mttr}</td><td>{d.viol ? <span className="badge red">{d.viol}</span> : <span className="badge green">0</span>}</td>
                <td className="small">{d.review.includes('done') ? <span className="badge green">{d.review}</span> : <span className="badge blue">{d.review}</span>}</td>
              </tr>
            ))}</tbody>
          </table>
        </div>
        <div className="faint small" style={{ marginTop: 8 }}>Low consumer ratings (≤ 2★) and repeated issues feed proposals for new DQ rules or contract changes.</div>
      </Card>
    </>
  )
}

export function DashboardTabs({ value, onChange }: { value: 'coverage' | 'quality'; onChange: (v: 'coverage' | 'quality') => void }) {
  return <div style={{ marginBottom: 16 }}><Tabs value={value} onChange={onChange} items={[{ id: 'coverage', label: 'Coverage & adoption' }, { id: 'quality', label: 'Quality' }]} /></div>
}
