import { useSearchParams } from 'react-router-dom'
import { QualityKpis, DashboardTabs } from './Qbd'
import { Download, Users, Clock } from 'lucide-react'
import { domains, people } from '../data/mock'
import { Card, Donut, Meter, Sparkline, Avatar } from '../components/ui'
import { GuardBtn } from '../auth/role'

const metrics = [
  { k: 'Harvest coverage', v: 100, target: 100, trend: [92, 95, 97, 99, 100, 100] },
  { k: 'Ownership · Critical', v: 93, target: 95, trend: [70, 78, 84, 88, 91, 93] },
  { k: 'Documentation · Critical', v: 78, target: 80, trend: [41, 52, 60, 69, 74, 78] },
  { k: 'PII confirmed', v: 86, target: 90, trend: [30, 48, 62, 74, 81, 86] },
  { k: 'Lineage · Critical', v: 91, target: 90, trend: [60, 72, 80, 86, 89, 91] },
  { k: 'Monthly active users', v: 54, target: 60, trend: [12, 21, 33, 41, 49, 54] },
]

export default function Dashboard() {
  const [params, setParams] = useSearchParams()
  const tab = params.get('tab') === 'quality' ? 'quality' : 'coverage'
  return (
    <div className="page">
      <div className="page-h">
        <div><h1>Governance Dashboard</h1><div className="sub">Success and quality metrics from PRD §2.3 · targets 6 months after go-live · as of Oct 9, 2026</div></div>
        <div className="actions">
          <select className="input"><option>All domains</option>{domains.map(d => <option key={d.id}>{d.name}</option>)}</select>
          <GuardBtn cap="dashboard.export" className="btn"><Download size={14} />Export PDF (TH)</GuardBtn>
        </div>
      </div>

      <DashboardTabs value={tab} onChange={v => setParams(v === 'quality' ? { tab: 'quality' } : {})} />
      {tab === 'quality' ? <QualityKpis /> : <>
      <div className="grid g3" style={{ marginBottom: 16 }}>
        {metrics.map(m => {
          const ok = m.v >= m.target
          return (
            <div key={m.k} className="card row" style={{ padding: 16, gap: 16 }}>
              <Donut value={m.v} size={76} color={ok ? 'var(--ok)' : 'var(--warn)'} />
              <div className="grow">
                <div className="muted small">{m.k}</div>
                <div className="row small" style={{ marginTop: 2 }}>Target <b>{m.target}%</b><span className={`badge ${ok ? 'green' : 'amber'}`}>{ok ? 'On track' : `${m.target - m.v} pts to go`}</span></div>
                <div style={{ marginTop: 6 }}><Sparkline data={m.trend} width={160} height={28} color={ok ? 'var(--ok)' : 'var(--warn)'} /></div>
              </div>
            </div>
          )
        })}
      </div>

      <div className="grid g3">
        <Card title="Coverage by domain" className="span2">
          <div className="tbl-wrap">
            <table className="tbl">
              <thead><tr><th>Domain</th><th>Owner</th><th>Assets</th><th>Certified</th><th style={{ width: '30%' }}>Critical-asset completeness</th><th>Data products</th></tr></thead>
              <tbody>
                {domains.map(d => (
                  <tr key={d.id}>
                    <td><span className="row"><span style={{ width: 10, height: 10, borderRadius: 3, background: d.color }} /><b>{d.name}</b><span className="faint" style={{ whiteSpace: 'nowrap' }}>· {d.th}</span></span></td>
                    <td><span className="row"><Avatar id={d.owner} size="sm" />{people[d.owner].name.split(' ')[0]}</span></td>
                    <td>{d.assets.toLocaleString()}</td>
                    <td>{d.certified}</td>
                    <td><div className="row"><Meter value={d.coverage} /><b className="small" style={{ width: 36 }}>{d.coverage}%</b></div></td>
                    <td>{d.products}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
        <Card title="Backlog">
          <div className="col" style={{ gap: 12 }}>
            {[
              ['Critical assets without owner', 14, 'var(--bad)'],
              ['PII suggestions to confirm', 637, 'var(--warn)'],
              ['Glossary terms in Candidate', 23, 'var(--info)'],
              ['Open data issues', 31, 'var(--warn)'],
              ['Workflow tasks past SLA', 9, 'var(--bad)'],
              ['Naming convention violations', 412, 'var(--text-3)'],
            ].map(([l, n, c]) => (
              <div key={l as string} className="row"><span style={{ width: 4, height: 28, borderRadius: 2, background: c as string }} /><span className="grow">{l}</span><b style={{ fontSize: 16 }}>{(n as number).toLocaleString()}</b></div>
            ))}
          </div>
        </Card>
        <Card title={<h3 className="row"><Clock size={15} />Access request lead time</h3>}>
          <div className="row" style={{ alignItems: 'baseline', gap: 6 }}><b style={{ fontSize: 28 }}>1.6</b><span className="muted">business days avg · target ≤ 2</span></div>
          <Sparkline data={[4.2, 3.8, 3.1, 2.6, 2.2, 1.9, 1.6]} width={300} height={40} color="var(--ok)" />
        </Card>
        <Card title={<h3 className="row"><Users size={15} />Top stewards this month</h3>} className="span2">
          <div className="grid g3">
            {[['nida', 412], ['mai', 288], ['arthit', 151]].map(([id, n]) => (
              <div key={id} className="row"><Avatar id={id as string} size="lg" /><div><b>{people[id as string].name}</b><div className="faint small">{n} curation actions</div></div></div>
            ))}
          </div>
        </Card>
      </div>
      </>}
    </div>
  )
}
