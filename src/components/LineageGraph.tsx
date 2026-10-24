import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ZoomIn, ZoomOut, Maximize2, Sparkles, AlertTriangle, ShieldAlert, Workflow } from 'lucide-react'
import { assetById, people, type Classification } from '../data/mock'
import { ClsBadge, Seg, scoreColor, scoreText, typeIcon, Avatar } from './ui'
import { SourceLogo } from './SourceLogo'

const LAYERS = ['Source', 'Bronze', 'Silver', 'Gold', 'Report'] as const
const COL_W = 228
const NODE_W = 184
const HEAD = 34
const ROW = 22

interface GNode { id: string; layer: number; title: string; sub: string; assetId?: string; cols?: { name: string; pii?: boolean }[] }
interface GEdge { from: string; to: string; via?: string; fromCol?: number; toCol?: number; indirect?: boolean }

const tableNodes: GNode[] = [
  { id: 'src-crm', layer: 0, title: 'CRM.CUSTOMER', sub: 'Oracle CRM', assetId: 'oracle-crm-customer' },
  { id: 'src-bill', layer: 0, title: 'BILLING.INVOICE', sub: 'Oracle ERP', assetId: 'oracle-billing' },
  { id: 'src-xls', layer: 0, title: 'segment_rules.xlsx', sub: 'Manual · SharePoint' },
  { id: 'brz-crm', layer: 1, title: 'crm_customer_raw', sub: 'bronze', assetId: 'bronze-crm-customer-raw' },
  { id: 'brz-bill', layer: 1, title: 'invoice_raw', sub: 'bronze' },
  { id: 'slv-crm', layer: 2, title: 'crm_customer', sub: 'silver', assetId: 'silver-crm-customer' },
  { id: 'slv-ctr', layer: 2, title: 'contract', sub: 'silver', assetId: 'silver-contract' },
  { id: 'slv-bill', layer: 2, title: 'billing_monthly', sub: 'silver', assetId: 'silver-billing' },
  { id: 'gld-360', layer: 3, title: 'customer_360', sub: 'gold', assetId: 'gold-customer-360' },
  { id: 'gld-churn', layer: 3, title: 'churn_features', sub: 'gold', assetId: 'gold-churn-features' },
  { id: 'rpt-churn', layer: 4, title: 'Customer Churn Dashboard', sub: 'Power BI', assetId: 'report-churn' },
  { id: 'rpt-rev', layer: 4, title: 'Revenue by Segment', sub: 'Power BI', assetId: 'report-revenue' },
]
const tableEdges: GEdge[] = [
  { from: 'src-crm', to: 'brz-crm', via: 'CDC ingest' },
  { from: 'src-bill', to: 'brz-bill', via: 'CDC ingest' },
  { from: 'brz-crm', to: 'slv-crm', via: 'cleanse_crm' },
  { from: 'brz-bill', to: 'slv-bill', via: 'agg_billing' },
  { from: 'slv-crm', to: 'gld-360', via: 'build_customer_360' },
  { from: 'slv-ctr', to: 'gld-360', via: 'build_customer_360' },
  { from: 'slv-bill', to: 'gld-360', via: 'build_customer_360' },
  { from: 'src-xls', to: 'gld-360', via: 'manual lineage', indirect: true },
  { from: 'gld-360', to: 'gld-churn', via: 'churn_fe' },
  { from: 'gld-churn', to: 'rpt-churn' },
  { from: 'gld-360', to: 'rpt-churn' },
  { from: 'gld-360', to: 'rpt-rev' },
  { from: 'slv-bill', to: 'rpt-rev' },
]

const colNodes: GNode[] = [
  { id: 'src-crm', layer: 0, title: 'CRM.CUSTOMER', sub: 'Oracle CRM', assetId: 'oracle-crm-customer', cols: [{ name: 'CUST_ID' }, { name: 'ID_CARD_NO', pii: true }, { name: 'MOBILE', pii: true }, { name: 'EMAIL_ADDR', pii: true }] },
  { id: 'brz-crm', layer: 1, title: 'crm_customer_raw', sub: 'bronze', assetId: 'bronze-crm-customer-raw', cols: [{ name: 'cust_id' }, { name: 'id_card_no', pii: true }, { name: 'mobile', pii: true }, { name: 'email_addr', pii: true }] },
  { id: 'slv-crm', layer: 2, title: 'crm_customer', sub: 'silver', assetId: 'silver-crm-customer', cols: [{ name: 'customer_id' }, { name: 'national_id', pii: true }, { name: 'mobile_no', pii: true }, { name: 'email', pii: true }] },
  { id: 'gld-360', layer: 3, title: 'customer_360', sub: 'gold', assetId: 'gold-customer-360', cols: [{ name: 'customer_id' }, { name: 'national_id', pii: true }, { name: 'mobile_no', pii: true }, { name: 'email', pii: true }] },
  { id: 'gld-churn', layer: 4, title: 'churn_features', sub: 'gold', assetId: 'gold-churn-features', cols: [{ name: 'customer_id' }, { name: 'has_digital_contact', pii: false }] },
]
const colEdges: GEdge[] = [
  ...[0, 1, 2, 3].map(i => ({ from: 'src-crm', to: 'brz-crm', fromCol: i, toCol: i })),
  ...[0, 1, 2, 3].map(i => ({ from: 'brz-crm', to: 'slv-crm', fromCol: i, toCol: i })),
  ...[0, 1, 2, 3].map(i => ({ from: 'slv-crm', to: 'gld-360', fromCol: i, toCol: i })),
  { from: 'gld-360', to: 'gld-churn', fromCol: 0, toCol: 0 },
  { from: 'gld-360', to: 'gld-churn', fromCol: 2, toCol: 1, indirect: true },
  { from: 'gld-360', to: 'gld-churn', fromCol: 3, toCol: 1, indirect: true },
]

type Overlay = 'dq' | 'cls' | 'owner' | 'fresh'

export default function LineageGraph({ focus = 'gld-360', height = 560 }: { focus?: string; height?: number }) {
  const nav = useNavigate()
  const [level, setLevel] = useState<'table' | 'column'>('table')
  const [overlay, setOverlay] = useState<Overlay>('dq')
  const [impact, setImpact] = useState(false)
  const [zoom, setZoom] = useState(1)
  const [sel, setSel] = useState<string | null>(null)

  const nodes = level === 'table' ? tableNodes : colNodes
  const edges = level === 'table' ? tableEdges : colEdges

  const nodeH = (n: GNode) => (n.cols ? HEAD + 8 + n.cols.length * ROW : 96)

  const pos = useMemo(() => {
    const p: Record<string, { x: number; y: number; h: number }> = {}
    const layers = level === 'table' ? 5 : 5
    for (let l = 0; l < layers; l++) {
      const inLayer = nodes.filter(n => n.layer === l)
      const total = inLayer.reduce((s, n) => s + nodeH(n), 0) + (inLayer.length - 1) * 28
      let y = Math.max(44, (height - total) / 2)
      for (const n of inLayer) { p[n.id] = { x: 30 + l * COL_W, y, h: nodeH(n) }; y += nodeH(n) + 28 }
    }
    return p
  }, [nodes, level, height])

  const downstream = useMemo(() => {
    const out = new Set<string>()
    const walk = (id: string) => edges.filter(e => e.from === id).forEach(e => { if (!out.has(e.to)) { out.add(e.to); walk(e.to) } })
    walk(focus)
    return out
  }, [edges, focus])

  const width = 30 + 5 * COL_W
  const layerNames = level === 'table' ? LAYERS : ['Source', 'Bronze', 'Silver', 'Gold', 'Gold (features)']

  const selNode = nodes.find(n => n.id === sel)
  const selAsset = selNode?.assetId ? assetById(selNode.assetId) : undefined

  return (
    <div className="card" style={{ overflow: 'hidden' }}>
      <div className="row wrap" style={{ padding: '10px 14px', borderBottom: '1px solid var(--border)', gap: 12 }}>
        <Seg value={level} onChange={v => { setLevel(v); setSel(null) }} items={[{ id: 'table', label: 'Table level' }, { id: 'column', label: 'Column level' }]} />
        <div className="row small"><span className="faint">Overlay</span>
          <select className="input" style={{ height: 28 }} value={overlay} onChange={e => setOverlay(e.target.value as Overlay)}>
            <option value="dq">Data quality score</option>
            <option value="cls">Classification &amp; PII</option>
            <option value="owner">Owner</option>
            <option value="fresh">Freshness</option>
          </select>
        </div>
        <label className="row small" style={{ cursor: 'pointer' }}>
          <input type="checkbox" checked={impact} onChange={e => setImpact(e.target.checked)} />
          <AlertTriangle size={14} color="var(--warn)" /> Impact analysis (downstream of <b>{nodes.find(n => n.id === focus)?.title}</b>)
        </label>
        <div style={{ marginLeft: 'auto' }} className="row small faint">
          <span className="row"><svg width="26" height="6"><line x1="0" y1="3" x2="26" y2="3" stroke="#7a8aa3" strokeWidth="1.5" /></svg>direct</span>
          <span className="row"><svg width="26" height="6"><line x1="0" y1="3" x2="26" y2="3" stroke="#7a8aa3" strokeWidth="1.5" strokeDasharray="4 3" /></svg>indirect / manual</span>
          <span className="row"><svg width="12" height="12"><rect x="2" y="2" width="8" height="8" rx="1.5" transform="rotate(45 6 6)" fill="white" stroke="var(--info)" strokeWidth="1.5" /></svg>process (hover)</span>
        </div>
      </div>

      {impact && (
        <div className="row small" style={{ padding: '8px 14px', background: 'var(--warn-50)', borderBottom: '1px solid #f6dcb0', color: '#8a4b04' }}>
          <AlertTriangle size={14} /> A schema change on <b>customer_360</b> affects <b>{downstream.size} downstream assets</b>. Owners to notify: Somchai W.
          <button className="btn sm" style={{ marginLeft: 'auto' }}><Sparkles size={13} color="var(--ai)" />Explain impact</button>
          <button className="btn sm">Notify owners</button>
        </div>
      )}

      <div style={{ display: 'flex' }}>
        <div className="lineage-canvas grow" style={{ height }}>
          <div style={{ width: width * zoom, height: height * zoom, position: 'relative' }}>
            <div style={{ transform: `scale(${zoom})`, transformOrigin: '0 0', width, height, position: 'absolute' }}>
              {layerNames.map((l, i) => <div key={l} className="lin-layer" style={{ left: 30 + i * COL_W }}>{l}</div>)}
              <svg width={width} height={height} style={{ position: 'absolute', inset: 0 }}>
                <defs>
                  <marker id="arr" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
                    <path d="M0,0 L10,5 L0,10 z" fill="#7a8aa3" />
                  </marker>
                  <marker id="arrW" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
                    <path d="M0,0 L10,5 L0,10 z" fill="#f3903f" />
                  </marker>
                </defs>
                {edges.map((e, i) => {
                  const a = pos[e.from], b = pos[e.to]
                  if (!a || !b) return null
                  const y1 = e.fromCol !== undefined ? a.y + HEAD + 4 + e.fromCol * ROW + ROW / 2 : a.y + a.h / 2
                  const y2 = e.toCol !== undefined ? b.y + HEAD + 4 + e.toCol * ROW + ROW / 2 : b.y + b.h / 2
                  const sameLayer = a.x === b.x
                  const x1 = sameLayer ? a.x + NODE_W / 2 : a.x + NODE_W, x2 = sameLayer ? b.x + NODE_W / 2 : b.x - 2
                  const sy1 = sameLayer ? a.y + a.h : y1, sy2 = sameLayer ? b.y - 2 : y2
                  const mx = (x1 + x2) / 2
                  const path = sameLayer ? `M${x1},${sy1} L${x2},${sy2}` : `M${x1},${y1} C${mx},${y1} ${mx},${y2} ${x2},${y2}`
                  const hot = impact && (e.from === focus || downstream.has(e.from)) && downstream.has(e.to)
                  return (
                    <g key={i}>
                      <path d={path} fill="none"
                        stroke={hot ? '#f3903f' : '#9aa8bc'} strokeWidth={hot ? 2.2 : 1.4} strokeDasharray={e.indirect ? '5 4' : undefined}
                        markerEnd={`url(#${hot ? 'arrW' : 'arr'})`} />
                      {e.via && level === 'table' && !sameLayer && (
                        <g transform={`translate(${mx},${(y1 + y2) / 2})`}>
                          <title>{e.via}</title>
                          <rect x="-5" y="-5" width="10" height="10" rx="2" transform="rotate(45)" fill="white" stroke="var(--info)" strokeWidth="1.5" />
                        </g>
                      )}
                    </g>
                  )
                })}
              </svg>
              {nodes.map(n => {
                const p = pos[n.id]
                const a = n.assetId ? assetById(n.assetId) : undefined
                const isFocus = n.id === focus
                const dim = impact && !isFocus && !downstream.has(n.id)
                return (
                  <div key={n.id}
                    className={`lin-node ${isFocus ? 'focus' : ''} ${impact && downstream.has(n.id) ? 'impact' : ''}`}
                    style={{ left: p.x, top: p.y, opacity: dim ? 0.45 : 1, width: NODE_W }}
                    onClick={() => setSel(n.id)}
                  >
                    <div className="nh" style={{ height: n.cols ? HEAD : undefined }}>
                      <SourceLogo kind={n.sub} size={14} bare fallback={<span style={{ color: 'var(--primary)', display: 'grid' }}>{typeIcon(a?.type ?? (n.sub.includes('Manual') ? 'File' : 'Table'), 14)}</span>} />
                      <b className="ellipsis grow">{n.title}</b>
                      {a?.lifecycle === 'Certified' && <span title="Certified" style={{ color: 'var(--ok-text)', fontSize: 11 }}>✔</span>}
                    </div>
                    {n.cols ? (
                      <div style={{ padding: '4px 0' }}>
                        {n.cols.map(c => (
                          <div key={c.name} className="row mono" style={{ height: ROW, padding: '0 9px', fontSize: 11.5 }}>
                            <span className="grow ellipsis">{c.name}</span>
                            {c.pii && <ShieldAlert size={12} color="var(--bad)" />}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="nb">
                        <span className="faint small">{n.sub}</span>
                        <OverlayLine overlay={overlay} a={a} />
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
          <div className="lin-tools">
            <button className="icon-btn" onClick={() => setZoom(z => Math.min(1.6, z + 0.1))} aria-label="Zoom in"><ZoomIn size={15} /></button>
            <button className="icon-btn" onClick={() => setZoom(z => Math.max(0.5, z - 0.1))} aria-label="Zoom out"><ZoomOut size={15} /></button>
            <button className="icon-btn" onClick={() => setZoom(1)} aria-label="Reset"><Maximize2 size={15} /></button>
          </div>
        </div>

        {selNode && (
          <div style={{ width: 280, borderLeft: '1px solid var(--border)', padding: 14, background: 'white' }} className="col">
            <div className="row"><b className="grow">{selNode.title}</b><button className="icon-btn" onClick={() => setSel(null)} aria-label="Close">×</button></div>
            <span className="faint small">{selAsset?.path ?? selNode.sub}</span>
            {selAsset ? (
              <>
                <div className="row wrap"><ClsBadge value={selAsset.classification} />{selAsset.dq !== undefined && <span className="badge gray">DQ {selAsset.dq}%</span>}<span className="badge gray">{selAsset.freshness}</span></div>
                <div className="small muted">{selAsset.description || <i className="faint">No description</i>}</div>
                <div className="small"><span className="faint">Owner</span> {selAsset.owner ? people[selAsset.owner].name : '—'}</div>
                <button className="btn sm" onClick={() => nav(`/asset/${selAsset.id}`)}>Open asset</button>
              </>
            ) : <div className="small muted">External system registered by manual lineage (LIN-06).</div>}
            {level === 'table' && (
              <>
                <div className="divider" />
                <div className="small faint">Processes</div>
                {tableEdges.filter(e => e.to === selNode.id && e.via).map((e, i) => (
                  <div key={i} className="row small"><Workflow size={13} color="var(--info)" /><span className="mono">{e.via}</span></div>
                ))}
              </>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

function OverlayLine({ overlay, a }: { overlay: Overlay; a?: ReturnType<typeof assetById> }) {
  if (!a) return <span className="faint small">not catalogued</span>
  if (overlay === 'dq') {
    if (a.dq === undefined) return <span className="faint small">DQ: no rules</span>
    return (
      <div className="row" style={{ gap: 6 }}>
        <div className="bar grow"><span style={{ width: `${a.dq}%`, background: scoreColor(a.dq) }} /></div>
        <b style={{ fontSize: 11.5, color: scoreText(a.dq) }}>{a.dq}%</b>
      </div>
    )
  }
  if (overlay === 'cls') return <div className="row"><ClsBadge value={a.classification as Classification} />{a.pii !== 'None' && <span className="badge red" style={{ height: 17 }}>PII</span>}</div>
  if (overlay === 'owner') return a.owner ? <div className="row small"><Avatar id={a.owner} size="sm" />{people[a.owner].name.split(' ')[0]}</div> : <span className="badge red">No owner</span>
  return <span className="small" style={{ color: a.freshnessOk ? 'var(--ok)' : 'var(--bad)', fontWeight: 600 }}>● {a.freshness}{!a.freshnessOk && ' · SLA breached'}</span>
}
