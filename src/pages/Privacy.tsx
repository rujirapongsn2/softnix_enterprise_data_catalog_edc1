import { useState } from 'react'
import { ShieldAlert, Sparkles, Check, X, Download, RefreshCw, Filter } from 'lucide-react'
import { piiSuggestions, type PiiSuggestion } from '../data/mock'
import { Card, ClsBadge, Donut, Meter, Tabs } from '../components/ui'
import { useShell } from '../components/Layout'
import { GuardBtn, useRole } from '../auth/role'

type Tab = 'review' | 'inventory' | 'ropa'

export default function Privacy() {
  const { toast } = useShell()
  const [tab, setTab] = useState<Tab>('review')
  const [state, setState] = useState<Record<string, 'accepted' | 'rejected'>>({})
  const [picked, setPicked] = useState<Set<string>>(new Set())
  const pending = piiSuggestions.filter(p => !state[p.id])
  const canPii = useRole().can('asset.confirmPii')

  const decide = (ids: string[], v: 'accepted' | 'rejected') => {
    setState(s => ({ ...s, ...Object.fromEntries(ids.map(i => [i, v])) }))
    setPicked(new Set())
    toast(`${ids.length} suggestion${ids.length > 1 ? 's' : ''} ${v} · ${v === 'accepted' ? 'tags queued for Lakehouse sync' : 'will not be suggested again'}`)
  }

  return (
    <div className="page">
      <div className="page-h">
        <div><h1>Privacy &amp; PDPA</h1><div className="sub">Personal data discovery, steward confirmation and RoPA support (PDPA s.26, s.37, s.39)</div></div>
        <div className="actions"><GuardBtn cap="privacy.scan" className="btn" onClick={() => toast('Auto-classification run #2292 queued')}><RefreshCw size={14} />Run scan</GuardBtn><GuardBtn cap="privacy.export" className="btn primary" onClick={() => toast('RoPA input exported (xlsx, TH)')}><Download size={14} />Export RoPA input</GuardBtn></div>
      </div>

      <div className="grid g4" style={{ marginBottom: 16 }}>
        <div className="card stat row" style={{ gap: 14 }}><Donut value={100} size={64} color="var(--primary)" /><div><div className="l">Columns scanned</div><b style={{ fontSize: 18 }}>1.02M</b></div></div>
        <div className="card stat row" style={{ gap: 14 }}><Donut value={86} size={64} /><div><div className="l">PII confirmed by steward</div><b style={{ fontSize: 18 }}>3,914 / 4,551</b></div></div>
        <div className="card stat"><div className="l">Datasets with personal data</div><div className="v">612</div><div className="faint small">of which <b style={{ color: 'var(--bad-text)' }}>48 sensitive (s.26)</b></div></div>
        <div className="card stat"><div className="l">Policy sync to Lakehouse</div><div className="v" style={{ color: 'var(--ok-text)' }}>99.2%</div><div className="faint small">5 tags out of sync · reconcile 02:00</div></div>
      </div>

      <div className="card" style={{ marginBottom: 16 }}>
        <div style={{ padding: '0 16px' }}><Tabs<Tab> value={tab} onChange={setTab} items={[{ id: 'review', label: 'Review queue', n: pending.length }, { id: 'inventory', label: 'PII inventory' }, { id: 'ropa', label: 'Processing records' }]} /></div>

        {tab === 'review' && (
          <>
            <div className="row" style={{ padding: '10px 16px', gap: 8, borderBottom: '1px solid var(--border)' }}>
              <button className="btn sm"><Filter size={13} />Confidence ≥ 90%</button>
              <button className="btn sm">Sensitive only</button>
              <span className="faint small grow">Detected by rules, regex, ML and LLM. Nothing applies until a steward confirms.</span>
              {picked.size > 0 && <>
                <b className="small">{picked.size} selected</b>
                <GuardBtn cap="asset.confirmPii" className="btn sm ok" onClick={() => decide([...picked], 'accepted')}><Check size={13} />Accept</GuardBtn>
                <GuardBtn cap="asset.confirmPii" className="btn sm bad" onClick={() => decide([...picked], 'rejected')}><X size={13} />Reject</GuardBtn>
              </>}
            </div>
            <div className="tbl-wrap">
              <table className="tbl sticky-last">
                <thead><tr><th style={{ width: 30 }}><input type="checkbox" disabled={!canPii} onChange={e => setPicked(e.target.checked ? new Set(pending.map(p => p.id)) : new Set())} /></th><th>Column</th><th>Detected as</th><th>Confidence</th><th>Method</th><th>Evidence</th><th>Masked sample</th><th>Proposed class</th><th>Decide</th></tr></thead>
                <tbody>
                  {piiSuggestions.map(p => <Row key={p.id} p={p} st={state[p.id]} locked={!canPii} picked={picked.has(p.id)} onPick={v => setPicked(s => { const n = new Set(s); v ? n.add(p.id) : n.delete(p.id); return n })} onDecide={v => decide([p.id], v)} />)}
                </tbody>
              </table>
            </div>
          </>
        )}

        {tab === 'inventory' && (
          <div className="card-b grid g3">
            {[
              ['Thai National ID', 214, 'Restricted'], ['Person Name', 388, 'Confidential'], ['Phone Number', 301, 'Confidential'], ['Email', 276, 'Confidential'],
              ['Address', 190, 'Confidential'], ['Bank Account No.', 64, 'Restricted'], ['Health data (s.26)', 22, 'Restricted'], ['Religion (s.26)', 9, 'Restricted'], ['Biometric (s.26)', 3, 'Restricted'],
            ].map(([n, c, cls]) => (
              <div key={n as string} className="card" style={{ padding: 14 }}>
                <div className="row"><ShieldAlert size={15} color={(n as string).includes('s.26') ? 'var(--bad)' : 'var(--warn)'} /><b className="grow">{n}</b><ClsBadge value={cls as 'Restricted'} /></div>
                <div className="row" style={{ marginTop: 8, alignItems: 'baseline', gap: 6 }}><b style={{ fontSize: 22 }}>{c}</b><span className="faint small">columns</span></div>
                <Meter value={Math.min(100, (c as number) / 4)} color={(n as string).includes('s.26') ? 'var(--bad)' : 'var(--warn)'} />
              </div>
            ))}
          </div>
        )}

        {tab === 'ropa' && (
          <div className="tbl-wrap">
            <table className="tbl">
              <thead><tr><th>Dataset</th><th>Purpose</th><th>Legal basis</th><th>Data subjects</th><th>Categories</th><th>Retention</th><th>Complete</th></tr></thead>
              <tbody>
                {[
                  ['gold.customer_360', 'Customer analytics & service', 'Contract s.24(3)', 'Customers', 'ID, name, contact, religion*', '7 yrs', 100],
                  ['silver.crm_customer', 'Customer master data', 'Contract s.24(3)', 'Customers', 'ID, name, contact', '7 yrs', 100],
                  ['silver.hr_employee', 'HR administration', 'Contract; Legal obligation', 'Employees', 'ID, health*, bank', '—', 60],
                  ['WEB_EVENTS', 'Web analytics', 'Consent s.19', 'Visitors', 'IP, device', '—', 40],
                ].map(r => (
                  <tr key={r[0] as string}>{r.slice(0, 6).map((c, i) => <td key={i} className={i === 0 ? 'mono' : ''}>{c}</td>)}<td style={{ width: 120 }}><Meter value={r[6] as number} /></td></tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <Card title={<h2 className="row"><Sparkles size={15} color="var(--ai)" />Privacy guard for AI</h2>}>
        <div className="row wrap small" style={{ gap: 24 }}>
          <span>Sample data to LLM: <b>Off</b> (Admin)</span>
          <span>PII masked before LLM: <b style={{ color: 'var(--ok-text)' }}>On</b></span>
          <span>Restricted assets: <b>on-prem model only</b></span>
          <span>Tag propagation via lineage: <b style={{ color: 'var(--ok-text)' }}>Suggest</b></span>
        </div>
      </Card>
    </div>
  )
}

function Row({ p, st, picked, onPick, onDecide, locked }: { p: PiiSuggestion; locked?: boolean; st?: 'accepted' | 'rejected'; picked: boolean; onPick: (v: boolean) => void; onDecide: (v: 'accepted' | 'rejected') => void }) {
  const confColor = p.confidence >= 90 ? 'var(--ok)' : p.confidence >= 75 ? 'var(--warn)' : 'var(--text-3)'
  return (
    <tr style={{ opacity: st ? 0.5 : 1 }}>
      <td><input type="checkbox" disabled={!!st || locked} checked={picked} onChange={e => onPick(e.target.checked)} /></td>
      <td><div className="mono" style={{ fontWeight: 500 }}>{p.column}</div><div className="faint small mono">{p.asset}</div></td>
      <td>{p.sensitive ? <span className="badge red">{p.detected}</span> : p.detected === 'Not PII' ? <span className="badge gray">Not PII</span> : <span className="badge amber">{p.detected}</span>}</td>
      <td><div className="row" style={{ gap: 6 }}><div className="bar" style={{ width: 50 }}><span style={{ width: `${p.confidence}%`, background: confColor }} /></div><b className="small">{p.confidence}%</b></div></td>
      <td>{p.method === 'LLM' ? <span className="badge violet"><Sparkles size={10} />LLM</span> : <span className="badge gray">{p.method}</span>}</td>
      <td className="small muted" style={{ minWidth: 200, maxWidth: 260 }}>{p.evidence}</td>
      <td className="mono small">{p.sample}</td>
      <td><ClsBadge value={p.cls} /></td>
      <td>
        {st ? <span className={`badge ${st === 'accepted' ? 'green' : 'gray'}`}>{st}</span> : (
          <div className="row" style={{ gap: 4 }}>
            <GuardBtn cap="asset.confirmPii" className="btn sm ok" onClick={() => onDecide('accepted')} aria-label="Accept"><Check size={13} /></GuardBtn>
            <GuardBtn cap="asset.confirmPii" className="btn sm bad" onClick={() => onDecide('rejected')} aria-label="Reject"><X size={13} /></GuardBtn>
          </div>
        )}
      </td>
    </tr>
  )
}
