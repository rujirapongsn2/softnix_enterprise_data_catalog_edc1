import { useState } from 'react'
import { Link } from 'react-router-dom'
import { GuardBtn } from '../auth/role'
import { useStored } from '../data/store'
import { useShell } from '../components/Layout'
import { NewProductForm, type NewProduct } from '../forms/Forms'
import { Package, Plus, ShieldCheck, Users, Boxes } from 'lucide-react'
import { domains, dataProducts, people } from '../data/mock'
import { SloBadges } from './Qbd'
import { Avatar, Meter } from '../components/ui'

export default function Domains() {
  const { toast } = useShell()
  const [created, add] = useStored<NewProduct>('products')
  const [open, setOpen] = useState(false)
  return (
    <div className="page">
      <div className="page-h">
        <div><h1>Domains &amp; Data Products</h1><div className="sub">Assets grouped by business domain; data products bundle assets with an owner, SLA and usage guide</div></div>
        <div className="actions"><GuardBtn cap="product.create" className="btn primary" onClick={() => setOpen(true)}><Plus size={14} />New data product</GuardBtn></div>
      </div>

      <h2 className="row" style={{ marginBottom: 10 }}><Package size={16} />Data products</h2>
      <div className="grid g4" style={{ marginBottom: 24 }}>
        {[...created, ...dataProducts].map(p => (
          <article key={p.id} className="card" style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 10, borderColor: 'isNew' in p ? 'var(--primary-100)' : undefined, background: 'isNew' in p ? '#f7fbfe' : undefined }}>
            <div className="row">
              <span className="asset-icon" style={{ width: 36, height: 36, background: 'var(--ai-50)', color: 'var(--ai)' }}><Package size={18} /></span>
              <div className="grow"><b>{p.name}</b><div className="faint small">{p.domain}</div></div>
              {p.certified && <ShieldCheck size={18} color="var(--ok)" />}{'isNew' in p && <span className="badge amber">{(p as NewProduct).status}</span>}
            </div>
            <p className="muted small" style={{ margin: 0, flex: 1 }}>{p.desc}</p>
            <div className="small"><span className="faint">SLA</span> {p.sla}</div>
            <SloBadges productId={p.id} />
            {'isNew' in p && <div className="faint small">SLO: {(p as NewProduct).slo}<br />Contract: {(p as NewProduct).contract}</div>}
            <div className="row small" style={{ justifyContent: 'space-between' }}>
              <span className="row"><Boxes size={13} />{p.assets} assets</span>
              <span className="row"><Users size={13} />{p.consumers} consumers</span>
            </div>
            <div className="row" style={{ borderTop: '1px solid var(--border)', paddingTop: 10 }}>
              <Avatar id={p.owner} size="sm" /><span className="small grow">{people[p.owner].name}</span>
              <Link to="/asset/gold-customer-360" className="btn sm">Open</Link>
            </div>
          </article>
        ))}
      </div>

      <h2 className="row" style={{ marginBottom: 10 }}><Boxes size={16} />Domains</h2>
      <div className="grid g3">
        {domains.map(d => (
          <Link key={d.id} to={`/search?domain=${d.name}`} className="card" style={{ padding: 16, color: 'inherit', textDecoration: 'none', borderTop: `3px solid ${d.color}` }}>
            <div className="row"><b style={{ fontSize: 15 }} className="grow">{d.name}</b><span className="faint">{d.th}</span></div>
            <div className="row small" style={{ marginTop: 10, gap: 18 }}>
              <span><b>{d.assets.toLocaleString()}</b> <span className="faint">assets</span></span>
              <span><b>{d.certified}</b> <span className="faint">certified</span></span>
              <span><b>{d.products}</b> <span className="faint">products</span></span>
            </div>
            <div className="row small" style={{ marginTop: 10 }}><span className="faint" style={{ width: 120 }}>Critical completeness</span><Meter value={d.coverage} /><b>{d.coverage}%</b></div>
            <div className="row small" style={{ marginTop: 10 }}><Avatar id={d.owner} size="sm" /><span className="faint">Domain owner</span> {people[d.owner].name}</div>
          </Link>
        ))}
      </div>
      {open && <NewProductForm onClose={() => setOpen(false)} onCreate={p => { add(p); setOpen(false); toast(`Data product “${p.name}” created as Draft`) }} />}
    </div>
  )
}
