import { useState } from 'react'
import { Plus, Play, Settings2, Database, Cloud, BarChart3, Waves, Server, X, CheckCircle2, AlertTriangle, XCircle, Loader2, HardDrive, FileCode2, Clock } from 'lucide-react'
import { connectors, type Connector } from '../data/mock'
import { Card, Seg } from '../components/ui'
import { useShell } from '../components/Layout'
import { GuardBtn } from '../auth/role'
import { useStored } from '../data/store'
import AddSourceWizard from '../forms/AddSource'
import { SourceLogo } from '../components/SourceLogo'
import { people } from '../data/mock'

const groupIcon: Record<Connector['group'], React.ReactNode> = { Lakehouse: <Waves size={18} />, Database: <Database size={18} />, Cloud: <Cloud size={18} />, Storage: <HardDrive size={18} />, BI: <BarChart3 size={18} />, Other: <FileCode2 size={18} /> }
const statusUi: Record<Connector['status'], [string, React.ReactNode]> = {
  Healthy: ['green', <CheckCircle2 key="h" size={12} />], Warning: ['amber', <AlertTriangle key="w" size={12} />],
  Failed: ['red', <XCircle key="f" size={12} />], Running: ['blue', <Loader2 key="r" size={12} />], Queued: ['gray', <Clock key="q" size={12} />],
}

export default function Sources() {
  const { toast } = useShell()
  const [group, setGroup] = useState<'all' | Connector['group']>('all')
  const [sel, setSel] = useState<Connector | null>(null)
  const [created, addCreated] = useStored<Connector>('sources')
  const [adding, setAdding] = useState(false)
  const list = [...created, ...connectors].filter(c => group === 'all' || c.group === group)

  return (
    <div className="page">
      <div className="page-h">
        <div><h1>Sources &amp; Harvest</h1><div className="sub">Connectors read metadata only. Credentials live in the secret store. Lakehouse stays the system of record.</div></div>
        <div className="actions"><button className="btn" onClick={() => toast('2 remote agents online: agent-dc1, agent-dr')}><Server size={14} />Remote agents · 2</button><GuardBtn cap="source.create" className="btn primary" onClick={() => setAdding(true)}><Plus size={14} />Add source</GuardBtn></div>
      </div>

      <div className="grid g4" style={{ marginBottom: 16 }}>
        {[['Sources', String(connectors.length + created.length)], ['Assets harvested', '28,256'], ['Schema changes (24h)', '17'], ['Failed sources', '1']].map(([l, v]) => (
          <div key={l} className="card stat"><div className="l">{l}</div><div className="v" style={{ color: l === 'Failed sources' ? 'var(--bad)' : undefined }}>{v}</div></div>
        ))}
      </div>

      <div className="row" style={{ marginBottom: 12 }}>
        <Seg value={group} onChange={setGroup} items={[{ id: 'all', label: 'All' }, { id: 'Lakehouse', label: 'Lakehouse' }, { id: 'Database', label: 'Databases' }, { id: 'Cloud', label: 'Cloud platforms' }, { id: 'Storage', label: 'Storage' }, { id: 'BI', label: 'BI' }, { id: 'Other', label: 'API & files' }]} />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: sel ? '1fr 380px' : '1fr', gap: 16, alignItems: 'start' }}>
        <div className="card tbl-wrap">
          <table className="tbl">
            <thead><tr><th>Source</th><th>Type</th><th>Status</th><th>Assets</th><th>Last run</th><th>Schedule</th><th /></tr></thead>
            <tbody>
              {list.map(c => (
                <tr key={c.id} className={c.isNew ? 'new-row' : undefined} style={{ cursor: 'pointer', background: sel?.id === c.id ? 'var(--primary-50)' : undefined }} onClick={() => setSel(c)}>
                  <td><div className="row"><SourceLogo kind={c.kind} size={32} fallback={<span className="asset-icon" style={{ width: 32, height: 32 }}>{groupIcon[c.group]}</span>} /><div><b>{c.name}</b><div className="row" style={{ gap: 4 }}>{c.isNew && <span className="badge blue">new</span>}{c.lineage && <span className="badge cyan">lineage</span>}{c.agent && <span className="badge gray">remote agent</span>}</div></div></div></td>
                  <td>{c.kind}</td>
                  <td><span className={`badge ${statusUi[c.status][0]}`}>{statusUi[c.status][1]}{c.status}</span></td>
                  <td>{c.assets ? c.assets.toLocaleString() : '—'}</td>
                  <td className="small" style={{ color: c.status === 'Failed' ? 'var(--bad)' : undefined }}>{c.lastRun}</td>
                  <td className="small muted">{c.schedule}</td>
                  <td><GuardBtn cap="source.run" className="btn sm" onClick={e => { e.stopPropagation(); toast(`Harvest started: ${c.name}`) }}><Play size={12} />Run</GuardBtn></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {sel && (
          <Card title={<span className="row"><SourceLogo kind={sel.kind} size={24} />{sel.name}</span>} actions={<button className="icon-btn" onClick={() => setSel(null)}><X size={16} /></button>}>
            <dl className="kv" style={{ gridTemplateColumns: '110px 1fr' }}>
              <dt>Connection</dt><dd className="mono small" style={{ wordBreak: 'break-all' }}>{sel.conn ?? (sel.kind === 'Iceberg' ? 'https://lakehouse/iceberg/v1' : sel.kind === 'Oracle' ? 'jdbc:oracle:thin:@crm-prd:1521/CRM' : '—')}</dd>
              <dt>Credential</dt><dd><span className="badge gray">{sel.secret ?? `vault://edc/${sel.id}`}</span></dd>
              <dt>Include</dt><dd className="mono small">{sel.include ?? 'lakehouse.(bronze|silver|gold).*'}</dd>
              <dt>Exclude</dt><dd className="mono small">{sel.exclude ?? '*.tmp_*, *_bak'}</dd>
              <dt>Profiling</dt><dd>{sel.profiling ?? 'Sample 100k rows · resource group edc_low'}</dd>
              {sel.isNew && <><dt>Ownership</dt><dd>{sel.domain} · Owner {people[sel.owner!]?.name} · Steward {people[sel.steward!]?.name}</dd><dt>PII scan</dt><dd className="small">{sel.pii}</dd><dt>Created by</dt><dd className="small">{sel.createdBy} · {sel.env}</dd></>}
            </dl>
            <div className="divider" />
            <b className="small">Recent runs</b>
            <div className="col small" style={{ marginTop: 8, gap: 6 }}>
              {(sel.isNew ? ['Queued · first full harvest will start within 5 min'] : ['22 min ago · incremental · +3 tables · 1 schema change', '1 h ago · incremental · no changes', '2 h ago · incremental · 1 table deprecated', 'Yesterday 23:00 · full · 18,420 assets · 14m 51s']).map(r => (
                <div key={r} className="row"><CheckCircle2 size={13} color="var(--ok)" />{r}</div>
              ))}
              {sel.status === 'Failed' && <div className="row" style={{ color: 'var(--bad)' }}><XCircle size={13} />ORA-12170: TNS connect timeout — check agent egress</div>}
            </div>
            <div className="row" style={{ marginTop: 14 }}><GuardBtn cap="source.run" className="btn sm" onClick={() => toast('Configuration editor opens the same form as Add source')}><Settings2 size={13} />Configure</GuardBtn><GuardBtn cap="source.run" className="btn sm" onClick={() => toast(sel.status === 'Failed' ? 'Test failed: ORA-12170 connect timeout' : 'Connection OK · 64 ms · read-only account')}>Test connection</GuardBtn></div>
          </Card>
        )}
      </div>
      {adding && <AddSourceWizard onClose={() => setAdding(false)} onCreate={c => { addCreated(c); setAdding(false); setSel(c); setGroup('all'); toast(`Source “${c.name}” created${c.status === 'Queued' ? ' · first harvest queued' : ''}`) }} />}
    </div>
  )
}
