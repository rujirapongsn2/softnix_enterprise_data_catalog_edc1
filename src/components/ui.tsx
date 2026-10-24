import type { ReactNode } from 'react'
import {
  Table2, Eye, Columns3, BarChart3, Workflow, Package, BrainCircuit, FileText, ShieldCheck, Star, Sparkles, Lock,
} from 'lucide-react'
import { people, type AssetType, type Classification, type Lifecycle } from '../data/mock'

export const clsColor: Record<Classification, string> = {
  Public: 'var(--cls-public)', Internal: 'var(--cls-internal)', Confidential: 'var(--cls-confidential)', Restricted: 'var(--cls-restricted)',
}

export function ClsBadge({ value }: { value: Classification }) {
  return <span className="cls" style={{ color: clsColor[value] }}><i style={{ background: clsColor[value] }} />{value}</span>
}

export function LifecycleBadge({ value }: { value: Lifecycle | string }) {
  const map: Record<string, string> = {
    Certified: 'green', 'In Review': 'amber', Draft: 'gray', Deprecated: 'red',
    Approved: 'green', Candidate: 'amber', Retired: 'red',
  }
  return (
    <span className={`badge ${map[value] ?? 'gray'}`}>
      {(value === 'Certified' || value === 'Approved') && <ShieldCheck size={12} />}
      {value}
    </span>
  )
}

export function PiiBadge({ value }: { value: 'None' | 'Personal' | 'Sensitive' }) {
  if (value === 'None') return null
  return <span className={`badge ${value === 'Sensitive' ? 'red' : 'amber'}`}>{value === 'Sensitive' ? 'PII · Sensitive' : 'PII'}</span>
}

export function AiTag({ label = 'AI-generated' }: { label?: string }) {
  return <span className="ai-tag"><Sparkles size={10} />{label}</span>
}

export function TechLock() {
  return <span className="tech-lock" title="Technical metadata is harvested and read-only in EDC"><Lock size={11} /> harvested</span>
}

export const typeIcon = (t: AssetType, size = 16) => {
  const p = { size }
  switch (t) {
    case 'Table': return <Table2 {...p} />
    case 'View': return <Eye {...p} />
    case 'Column': return <Columns3 {...p} />
    case 'Report': return <BarChart3 {...p} />
    case 'Pipeline': return <Workflow {...p} />
    case 'Data Product': return <Package {...p} />
    case 'ML Model': return <BrainCircuit {...p} />
    default: return <FileText {...p} />
  }
}

export function Avatar({ id, size }: { id?: string; size?: 'sm' | 'lg' }) {
  const p = id ? people[id] : undefined
  if (!p) return <span className={`avatar ${size ?? ''}`} style={{ background: '#94a3b8' }}>{id === 'system' ? 'SYS' : '?'}</span>
  const ini = p.name.split(' ').map(s => s[0]).slice(0, 2).join('')
  return <span className={`avatar ${size ?? ''}`} style={{ background: p.color }} title={p.name}>{ini}</span>
}

export function PersonChip({ id, sub }: { id?: string; sub?: boolean }) {
  const p = id ? people[id] : undefined
  if (!p) return <span className="badge red">Unassigned</span>
  return (
    <span className="row" style={{ gap: 8 }}>
      <Avatar id={id} size="sm" />
      <span style={{ lineHeight: 1.2 }}>
        <span>{p.name}</span>
        {sub && <span className="faint small" style={{ display: 'block' }}>{p.title}</span>}
      </span>
    </span>
  )
}

export function Stars({ value, count }: { value: number; count?: number }) {
  return (
    <span className="row" style={{ gap: 1 }}>
      {[1, 2, 3, 4, 5].map(i => <Star key={i} size={12} fill={i <= Math.round(value) ? '#fdc70c' : 'none'} color={i <= Math.round(value) ? '#fdc70c' : '#cbd5e1'} />)}
      {count !== undefined && <span className="faint small" style={{ marginLeft: 4 }}>{value ? value.toFixed(1) : '–'} ({count})</span>}
    </span>
  )
}

export const scoreColor = (v: number) => (v >= 95 ? 'var(--ok)' : v >= 85 ? 'var(--warn)' : 'var(--bad)')

export function Donut({ value, size = 84, stroke = 9, label, color }: { value: number; size?: number; stroke?: number; label?: ReactNode; color?: string }) {
  const r = (size - stroke) / 2
  const c = 2 * Math.PI * r
  const col = color ?? scoreColor(value)
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} role="img" aria-label={`${value}%`}>
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="#eef1f5" strokeWidth={stroke} />
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={col} strokeWidth={stroke} strokeLinecap="round"
        strokeDasharray={`${(value / 100) * c} ${c}`} transform={`rotate(-90 ${size / 2} ${size / 2})`} />
      <text x="50%" y="50%" textAnchor="middle" dominantBaseline="central" fontSize={size / 5.2} fontWeight={700} fill="var(--text)">
        {label ?? `${value}%`}
      </text>
    </svg>
  )
}

export function Sparkline({ data, width = 120, height = 30, color = 'var(--primary)', min, max }: { data: number[]; width?: number; height?: number; color?: string; min?: number; max?: number }) {
  const lo = min ?? Math.min(...data)
  const hi = max ?? Math.max(...data)
  const span = hi - lo || 1
  const pts = data.map((v, i) => [(i / (data.length - 1)) * width, height - 3 - ((v - lo) / span) * (height - 6)])
  const d = pts.map((p, i) => `${i ? 'L' : 'M'}${p[0].toFixed(1)},${p[1].toFixed(1)}`).join(' ')
  const last = pts[pts.length - 1]
  return (
    <svg width={width} height={height} style={{ display: 'block' }}>
      <path d={`${d} L${width},${height} L0,${height} Z`} fill={color} opacity={0.08} />
      <path d={d} fill="none" stroke={color} strokeWidth={1.6} />
      <circle cx={last[0]} cy={last[1]} r={2.5} fill={color} />
    </svg>
  )
}

export function Meter({ value, color, width }: { value: number; color?: string; width?: number | string }) {
  return (
    <div className="bar" style={{ width: width ?? '100%' }}>
      <span style={{ width: `${Math.min(100, value)}%`, background: color ?? scoreColor(value) }} />
    </div>
  )
}

export function Card({ title, actions, children, className, bodyStyle }: { title?: ReactNode; actions?: ReactNode; children: ReactNode; className?: string; bodyStyle?: React.CSSProperties }) {
  return (
    <section className={`card ${className ?? ''}`}>
      {(title || actions) && (
        <div className="card-h">
          {typeof title === 'string' ? <h3>{title}</h3> : title}
          {actions && <div className="actions">{actions}</div>}
        </div>
      )}
      <div className="card-b" style={bodyStyle}>{children}</div>
    </section>
  )
}

export function Tabs<T extends string>({ value, onChange, items }: { value: T; onChange: (v: T) => void; items: { id: T; label: ReactNode; n?: number }[] }) {
  return (
    <div className="tabs" role="tablist">
      {items.map(it => (
        <button key={it.id} role="tab" aria-selected={value === it.id} className={`tab ${value === it.id ? 'on' : ''}`} onClick={() => onChange(it.id)}>
          {it.label}{it.n !== undefined && <span className="n">{it.n}</span>}
        </button>
      ))}
    </div>
  )
}

export function Seg<T extends string>({ value, onChange, items }: { value: T; onChange: (v: T) => void; items: { id: T; label: ReactNode }[] }) {
  return (
    <div className="seg">
      {items.map(it => <button key={it.id} className={value === it.id ? 'on' : ''} onClick={() => onChange(it.id)}>{it.label}</button>)}
    </div>
  )
}
