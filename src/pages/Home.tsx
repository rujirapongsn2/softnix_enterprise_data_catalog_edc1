import { Link, useNavigate } from 'react-router-dom'
import { ArrowRight, Sparkles, Star, TrendingUp, AlertTriangle, Search, BookOpen, ShieldAlert, Bell } from 'lucide-react'
import { assets, tasks, connectors, terms } from '../data/mock'
import { Card, ClsBadge, LifecycleBadge, Meter, Stars, typeIcon, Avatar } from '../components/ui'
import { useI18n } from '../i18n'
import { useShell } from '../components/Layout'
import { useRole } from '../auth/role'
import { people } from '../data/mock'

export default function Home() {
  const { t, lang } = useI18n()
  const { ask } = useShell()
  const { def } = useRole()
  const nav = useNavigate()
  const followed = assets.filter(a => ['gold-customer-360', 'silver-billing', 'report-churn', 'gold-churn-features'].includes(a.id))
  const trending = [...assets].filter(a => a.lifecycle === 'Certified').sort((a, b) => b.usage - a.usage).slice(0, 5)

  return (
    <div className="page">
      {/* hero */}
      <section className="home-hero">
        <div className="row wrap" style={{ alignItems: 'flex-end', gap: 24 }}>
          <div className="grow">
            <div className="hh-date">Thursday, 9 October 2026</div>
            <h1>{t('welcome')}, {people[def.persona].name.split(' ')[0]}</h1>
            <div className="hh-sub">
              {lang === 'th' ? `บทบาท: ${def.th} · คุณมีงานรออนุมัติ 6 รายการ เกินกำหนด 2 รายการ` : `Signed in as ${def.name}. You have 6 open tasks — 2 are overdue. 18,420 assets catalogued across 8 sources.`}
            </div>
          </div>
          <div className="row" style={{ gap: 8 }}>
            <button className="btn" onClick={() => ask('Where can I find active customers by province?')}><Sparkles size={14} color="var(--ai)" />Ask a data question</button>
            <button className="btn primary" onClick={() => nav('/search')}><Search size={14} />Browse catalog</button>
          </div>
        </div>
        <div className="row wrap" style={{ gap: 8, marginTop: 16 }}>
          {['Customer', 'Finance', 'Sales', 'HR', 'Marketing', 'Operations'].map(d => (
            <Link key={d} to={`/search?domain=${d}`} className="chip">{d}</Link>
          ))}
        </div>
      </section>

      <div className="grid g4" style={{ marginBottom: 16 }}>
        <Kpi label="Ownership coverage · Critical" value={93} target={95} />
        <Kpi label="Documentation coverage · Critical" value={78} target={80} />
        <Kpi label="PII confirmed by steward" value={86} target={90} />
        <Kpi label="Lineage coverage · Critical" value={91} target={90} />
      </div>

      <div className="grid g3">
        <Card title="My tasks" actions={<Link to="/inbox" className="small row">All tasks <ArrowRight size={13} /></Link>}>
          <div className="col" style={{ gap: 0 }}>
            {tasks.slice(0, 5).map(x => (
              <Link key={x.id} to={`/inbox?id=${x.id}`} className="row" style={{ padding: '9px 0', borderBottom: '1px solid var(--border)', color: 'inherit', textDecoration: 'none' }}>
                <TaskDot kind={x.kind} />
                <div className="grow" style={{ minWidth: 0 }}>
                  <div className="ellipsis" style={{ fontWeight: 500 }}>{x.title}</div>
                  <div className="faint small">{x.kind} · {x.id}</div>
                </div>
                {x.overdue ? <span className="badge red">Overdue</span> : <span className="faint small">due {x.due.replace(', 2026', '')}</span>}
              </Link>
            ))}
          </div>
        </Card>

        <Card title="Following" actions={<span className="faint small row"><Bell size={13} />3 changes since yesterday</span>}>
          <div className="col" style={{ gap: 0 }}>
            {followed.map(a => (
              <Link key={a.id} to={`/asset/${a.id}`} className="row" style={{ padding: '9px 0', borderBottom: '1px solid var(--border)', color: 'inherit', textDecoration: 'none' }}>
                <span style={{ color: 'var(--primary)' }}>{typeIcon(a.type)}</span>
                <div className="grow" style={{ minWidth: 0 }}>
                  <div className="ellipsis"><b>{a.name}</b></div>
                  <div className="faint small ellipsis">
                    {a.id === 'gold-customer-360' && 'Schema change: + last_channel (non-breaking · contract CTR-CUST-360)'}
                    {a.id === 'silver-billing' && <span style={{ color: 'var(--bad)' }}>Freshness SLA breached · 2 d</span>}
                    {a.id === 'report-churn' && '3 new comments'}
                    {a.id === 'gold-churn-features' && 'Submitted for certification'}
                  </div>
                </div>
                {a.dq !== undefined && <span className="small" style={{ fontWeight: 600 }}>{a.dq}%</span>}
              </Link>
            ))}
          </div>
        </Card>

        <Card title={<h3 className="row"><Sparkles size={15} color="var(--ai)" />AI curation</h3>} actions={<Link to="/privacy" className="small">Review</Link>}>
          <div className="row" style={{ alignItems: 'baseline', gap: 6 }}><span style={{ fontSize: 28, fontWeight: 700 }}>214</span><span className="muted">suggestions waiting for you</span></div>
          <div className="col" style={{ marginTop: 10, gap: 10 }}>
            {[
              ['Descriptions drafted', 128, 'var(--primary)'],
              ['PII / classification', 41, 'var(--bad)'],
              ['Glossary term links', 33, 'var(--ai)'],
              ['DQ rule suggestions', 12, 'var(--info)'],
            ].map(([l, n, c]) => (
              <div key={l as string}>
                <div className="row small"><span className="grow">{l}</span><b>{n}</b></div>
                <Meter value={((n as number) / 128) * 100} color={c as string} />
              </div>
            ))}
          </div>
          <div className="divider" />
          <div className="small muted">Acceptance rate last 30 days: <b style={{ color: 'var(--ok)' }}>82%</b> · edited 11% · rejected 7%</div>
        </Card>

        <Card title={<h3 className="row"><TrendingUp size={15} />Popular certified data</h3>} className="span2">
          <div className="tbl-wrap">
            <table className="tbl">
              <thead><tr><th>Asset</th><th>Domain</th><th>Classification</th><th>Rating</th><th>Queries / 30d</th><th /></tr></thead>
              <tbody>
                {trending.map(a => (
                  <tr key={a.id} style={{ cursor: 'pointer' }} onClick={() => nav(`/asset/${a.id}`)}>
                    <td><div className="row"><span style={{ color: 'var(--primary)' }}>{typeIcon(a.type, 15)}</span><div style={{ minWidth: 0 }}><b>{a.businessName[lang]}</b><div className="faint small mono ellipsis" style={{ maxWidth: 260 }}>{a.path}</div></div></div></td>
                    <td>{a.domain}</td>
                    <td><ClsBadge value={a.classification} /></td>
                    <td><Stars value={a.rating} /></td>
                    <td>{a.usage.toLocaleString()}</td>
                    <td>{a.authoritative ? <span className="badge blue"><Star size={11} />Authoritative</span> : <LifecycleBadge value={a.lifecycle} />}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        <div className="col" style={{ gap: 16 }}>
          <Card title="Harvest health" actions={<Link to="/sources" className="small">Sources</Link>}>
            <div className="col" style={{ gap: 8 }}>
              {connectors.slice(0, 6).map(c => (
                <div key={c.id} className="row small">
                  <span style={{ width: 8, height: 8, borderRadius: 4, background: c.status === 'Failed' ? 'var(--bad)' : c.status === 'Warning' ? 'var(--warn)' : 'var(--ok)' }} />
                  <span className="grow ellipsis">{c.name}</span>
                  <span className="faint">{c.lastRun.split('·')[0]}</span>
                </div>
              ))}
            </div>
          </Card>
          <Card title={<h3 className="row"><BookOpen size={15} />New in glossary</h3>}>
            {terms.filter(x => x.status !== 'Approved').slice(0, 3).map(x => (
              <Link key={x.id} to={`/glossary/${x.id}`} className="row" style={{ padding: '5px 0' }}>
                <span className="grow">{x.en} <span className="faint">· {x.th}</span></span><LifecycleBadge value={x.status} />
              </Link>
            ))}
          </Card>
        </div>
      </div>
    </div>
  )
}

function Kpi({ label, value, target }: { label: string; value: number; target: number }) {
  const ok = value >= target
  return (
    <div className="card stat">
      <div className="l">{label}</div>
      <div className="row" style={{ alignItems: 'baseline', gap: 8, marginTop: 4 }}>
        <span className="v">{value}%</span>
        <span className={`delta ${ok ? 'up' : 'down'}`}>{ok ? '▲ on target' : `▼ target ${target}%`}</span>
      </div>
      <div style={{ position: 'relative', marginTop: 8 }}>
        <Meter value={value} color={ok ? 'var(--ok)' : 'var(--warn)'} />
        <span style={{ position: 'absolute', left: `${target}%`, top: -3, width: 2, height: 12, background: 'var(--text-2)' }} title={`Target ${target}%`} />
      </div>
    </div>
  )
}

export function TaskDot({ kind }: { kind: string }) {
  const map: Record<string, [string, React.ReactNode]> = {
    'Access Request': ['var(--primary)', '🔑'],
    'Change Request': ['var(--ai)', '✎'],
    Certification: ['var(--ok)', '✔'],
    'PII Review': ['var(--bad)', <ShieldAlert key="s" size={13} />],
    'Data Issue': ['var(--warn)', <AlertTriangle key="a" size={13} />],
    'Glossary Approval': ['var(--info)', <BookOpen key="b" size={13} />],
  }
  const [c, ic] = map[kind] ?? ['var(--text-3)', '•']
  return <span style={{ width: 28, height: 28, borderRadius: 8, background: `color-mix(in srgb, ${c} 12%, white)`, color: c, display: 'grid', placeItems: 'center', fontSize: 12, flex: 'none' }}>{ic}</span>
}

export { Avatar }
