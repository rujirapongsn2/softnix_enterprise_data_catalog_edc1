import { useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { Clock, Check, X, MessageSquare, Sparkles, ArrowUpRight, UserPlus } from 'lucide-react'
import { tasks as baseTasks, people, assetById, type Task } from '../data/mock'
import { GuardBtn, useRole } from '../auth/role'
import { useStored } from '../data/store'
import type { ChangeReq } from '../forms/Forms'
import { Avatar, Seg } from '../components/ui'
import { TaskDot } from './Home'
import { CertificationChecklist } from './Qbd'
import { useShell } from '../components/Layout'

export default function Inbox() {
  const [params, setParams] = useSearchParams()
  const { toast } = useShell()
  const [filter, setFilter] = useState<'mine' | 'requested' | 'done'>('mine')
  const [kind, setKind] = useState('All')
  const [decided, setDecided] = useState<Record<string, 'approved' | 'rejected'>>({})
  const { can, def } = useRole()
  const [crs] = useStored<ChangeReq>('changeRequests')
  const tasks: Task[] = [...crs.map(c => ({ id: c.id, kind: 'Change Request' as const, title: `Change ${c.field.toLowerCase()} of “${c.target}”`, requester: c.byPersona, created: c.created, due: '+3 days', step: 1, steps: ['Submitted', 'Steward', 'Owner'], detail: `Proposed: ${c.proposed} — Reason: ${c.reason} (submitted as ${c.by}, urgency ${c.urgency})`, priority: (c.urgency.startsWith('High') ? 'High' : 'Medium') as Task['priority'] })), ...baseTasks]
  const list = tasks.filter(t => kind === 'All' || t.kind === kind)
  const sel = tasks.find(t => t.id === params.get('id')) ?? list[0]
  const kinds = ['All', ...new Set(tasks.map(t => t.kind))]
  const asset = sel?.asset ? assetById(sel.asset) : undefined

  return (
    <div className="page">
      <div className="page-h">
        <div><h1>My Tasks</h1><div className="sub">Approvals, reviews and issues assigned to you or your roles · SLA tracked with auto-escalation{!can('task.decide') && <> · <b>{def.name}</b> sees requests and history only</>}</div></div>
        <div className="actions"><Seg value={filter} onChange={setFilter} items={[{ id: 'mine', label: 'Assigned to me · 6' }, { id: 'requested', label: 'My requests · 2' }, { id: 'done', label: 'Completed' }]} /></div>
      </div>
      <div className="row wrap" style={{ marginBottom: 12, gap: 6 }}>
        {kinds.map(k => <button key={k} className={`chip ${kind === k ? 'on' : ''}`} onClick={() => setKind(k)}>{k}</button>)}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(320px, 420px) 1fr', gap: 16, alignItems: 'start' }}>
        <div className="card" style={{ overflow: 'hidden' }}>
          {list.map(t => (
            <div key={t.id} onClick={() => setParams({ id: t.id })} className="row" style={{ padding: '12px 14px', borderBottom: '1px solid var(--border)', cursor: 'pointer', alignItems: 'flex-start', background: sel?.id === t.id ? 'var(--primary-50)' : undefined, borderLeft: `3px solid ${sel?.id === t.id ? 'var(--primary)' : 'transparent'}` }}>
              <TaskDot kind={t.kind} />
              <div className="grow" style={{ minWidth: 0 }}>
                <div className="row"><span className="faint small mono">{t.id}</span><span className="faint small">· {t.kind}</span>{decided[t.id] && <span className={`badge ${decided[t.id] === 'approved' ? 'green' : 'red'}`} style={{ marginLeft: 'auto' }}>{decided[t.id]}</span>}</div>
                <div style={{ fontWeight: 600, marginTop: 2 }} className="ellipsis">{t.title}</div>
                <div className="row small" style={{ marginTop: 4 }}>
                  <Avatar id={t.requester} size="sm" /><span className="faint">{t.requester === 'system' ? 'System' : people[t.requester].name}</span>
                  <span style={{ marginLeft: 'auto', color: t.overdue ? 'var(--bad)' : 'var(--text-3)' }} className="row"><Clock size={12} />{t.overdue ? 'Overdue' : `Due ${t.due.replace(', 2026', '')}`}</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {sel && (
          <div className="col" style={{ gap: 16 }}>
            <section className="card" style={{ padding: 20 }}>
              <div className="row"><TaskDot kind={sel.kind} /><span className="faint mono">{sel.id}</span><span className={`badge ${sel.priority === 'High' ? 'red' : sel.priority === 'Medium' ? 'amber' : 'gray'}`}>{sel.priority}</span>{sel.overdue && <span className="badge red">SLA breached · escalated to Owner</span>}</div>
              <h2 style={{ fontSize: 19, marginTop: 10 }}>{sel.title}</h2>
              <div className="stepper" style={{ margin: '16px 0' }}>
                {sel.steps.map((s, i) => (
                  <span key={s} className="row" style={{ gap: 0 }}>
                    {i > 0 && <span className={`step-line ${i <= sel.step ? 'done' : ''}`} />}
                    <span className={`step ${i < sel.step ? 'done' : i === sel.step ? 'cur' : ''}`}><span className="d">{i < sel.step ? '✓' : i + 1}</span>{s}</span>
                  </span>
                ))}
              </div>
              <dl className="kv">
                <dt>Requested by</dt><dd className="row"><Avatar id={sel.requester} size="sm" />{sel.requester === 'system' ? 'System (automated)' : `${people[sel.requester].name} · ${people[sel.requester].title}`}</dd>
                <dt>Created</dt><dd>{sel.created}</dd>
                <dt>Due</dt><dd>{sel.due}</dd>
                {asset && <><dt>Asset</dt><dd><Link to={`/asset/${asset.id}`} className="row">{asset.path}<ArrowUpRight size={13} /></Link></dd></>}
                <dt>Details</dt><dd>{sel.detail}</dd>
              </dl>
              {sel.kind === 'Change Request' && (
                <div className="card" style={{ padding: 12, marginTop: 14, background: 'var(--surface-2)' }}>
                  <div className="faint small">Definition · Active Customer</div>
                  <div className="diff-old small">A customer with at least one contract in ACTIVE status on the reporting date.</div>
                  <div className="diff-new small">A customer with at least one contract in ACTIVE status, or SUSPENDED within the last 30 days, on the reporting date.</div>
                </div>
              )}
              {sel.kind === 'Certification' && <CertificationChecklist />}
              <div className="ai-note small" style={{ marginTop: 14 }}>
                <div className="row"><Sparkles size={13} color="var(--ai)" /><b>AI summary</b></div>
                {sel.kind === 'Access Request' && 'Requester has accessed 3 similar Customer datasets before with no policy violations. Requested columns exclude national_id, so masking stays in place. Suggest approving for 90 days.'}
                {sel.kind === 'Change Request' && 'This change would raise the Active Customer KPI by ~2.1% and affects 12 linked assets including Customer Churn Dashboard. Finance should be consulted.'}
                {sel.kind === 'Certification' && 'Gate blocked: DQ score 88.7 is below the 90 threshold and the contract has 1 open breaking change. Approval is disabled until both pass (CERT-01).'}
                {sel.kind === 'PII Review' && '12 of 14 suggestions have ≥ 90% confidence. blood_group is sensitive data (s.26) and needs DPO sign-off.'}
                {sel.kind === 'Data Issue' && 'Root cause likely upstream: Oracle ERP connector failed on Oct 7 (ORA-12170). billing_monthly and Revenue by Segment are affected.'}
                {sel.kind === 'Glossary Approval' && 'No conflicting terms found. Similar term "Attrition" exists only as a synonym.'}
              </div>
              <div className="divider" />
              <textarea className="input" rows={2} style={{ width: '100%' }} placeholder={can('task.decide') ? 'Comment (required for rejection)' : 'Comment on this request'} />
              <div className="row" style={{ marginTop: 10 }}>
                {sel.kind === 'Certification' && can('task.decide') && def.id !== 'owner'
                  ? <button className="btn primary locked" disabled title="Certification needs the Data Owner (CAT-07)"><Check size={14} />Approve</button>
                  : <GuardBtn cap="task.decide" className="btn primary" disabled={sel.kind === 'Certification'} title={sel.kind === 'Certification' ? 'Blocked by certification gate' : undefined} onClick={() => { setDecided(d => ({ ...d, [sel.id]: 'approved' })); toast(`${sel.id} approved · next step notified`) }}><Check size={14} />Approve</GuardBtn>}
                <GuardBtn cap="task.decide" className="btn bad" onClick={() => { setDecided(d => ({ ...d, [sel.id]: 'rejected' })); toast(`${sel.id} rejected`) }}><X size={14} />Reject</GuardBtn>
                <GuardBtn cap="task.decide" className="btn" onClick={() => toast('Question sent to the requester')}><MessageSquare size={14} />Request info</GuardBtn>
                <GuardBtn cap="task.decide" hide className="btn ghost" onClick={() => toast('Delegated')}><UserPlus size={14} />Delegate</GuardBtn>
              </div>
            </section>
          </div>
        )}
      </div>
    </div>
  )
}
