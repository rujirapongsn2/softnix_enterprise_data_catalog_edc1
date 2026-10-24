import { useEffect, useRef, useState, type ReactNode } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import {
  Sparkles, X, Minus, Mic, Send, Volume2, VolumeX, Copy, ThumbsUp, ThumbsDown, MapPin, ShieldCheck, Table2, BookOpen, UserRoundPlus, History,
} from 'lucide-react'
import { assetById } from '../data/mock'
import { useI18n } from '../i18n'

type Msg =
  | { role: 'user'; text: string; voice?: boolean }
  | { role: 'bot'; body: ReactNode; streaming?: boolean; action?: Action }

interface Action { title: string; target: string; field: string; from: string; to: string; state: 'pending' | 'saved' | 'cancelled' }

function pageContext(path: string) {
  if (path.startsWith('/asset/')) {
    const a = assetById(path.split('/')[2])
    return { label: a ? `Asset · ${a.name}` : 'Asset', asset: a }
  }
  const names: Record<string, string> = {
    '/': 'Home', '/search': 'Search', '/glossary': 'Business Glossary', '/inbox': 'My Tasks', '/privacy': 'Privacy & PDPA',
    '/quality': 'Data Quality', '/dashboard': 'Governance Dashboard', '/sources': 'Sources & Harvest', '/domains': 'Domains & Products', '/access': 'Policies & Access', '/audit': 'Audit Trail',
  }
  const key = Object.keys(names).filter(k => k === path || (k !== '/' && path.startsWith(k))).sort((a, b) => b.length - a.length)[0] ?? '/'
  return { label: names[key], asset: undefined }
}

function suggestions(path: string): string[] {
  if (path.startsWith('/asset/')) return ['Explain this table in business terms', 'Who should I ask about this data?', 'Draft a description for churn_score', 'What breaks if I drop column email?']
  if (path.startsWith('/glossary')) return ['Find duplicate or conflicting terms', 'Suggest columns to link to "Churn"', 'What is the approval process for a term?']
  if (path.startsWith('/privacy')) return ['Which datasets hold sensitive data (s.26)?', 'Explain why blood_group was flagged', 'Export RoPA input for Customer domain']
  if (path.startsWith('/inbox')) return ['Summarise my pending approvals', 'Which tasks are overdue?', 'Approve AR-1042 for 90 days']
  if (path.startsWith('/quality')) return ['Why did billing_monthly fail?', 'Suggest DQ rules for customer_360.email']
  return ['Where can I find active customers by province?', 'ข้อมูลรายได้ตามกลุ่มลูกค้าอยู่ตารางไหน', 'How do I request access to a dataset?', 'What does “Certified” mean?']
}

const Cite = ({ to, children }: { to: string; children: ReactNode }) => {
  const nav = useNavigate()
  return <a className="cite" href={to} onClick={e => { e.preventDefault(); nav(to) }}><Table2 size={11} />{children}</a>
}

function answer(q: string, path: string): { body: ReactNode; action?: Action } {
  const s = q.toLowerCase()
  if (s.includes('draft') || s.includes('churn_score') || s.includes('เติมคำอธิบาย')) {
    return {
      body: <>I drafted a business description for <code>churn_score</code> from the schema, profiling (0% null, 0–1 range) and upstream lineage (<code>churn_features</code>). Review before saving:</>,
      action: { title: 'Update column description', target: 'customer_360.churn_score', field: 'Description', from: '(empty)', to: 'Probability (0–1) that the customer ends all contracts within the next 90 days. Produced daily by Churn Model v4 from churn_features. Higher = more likely to churn.', state: 'pending' },
    }
  }
  if (s.includes('approve ar-1042')) {
    return {
      body: <>AR-1042 asks for <b>SELECT on customer_360</b> for 90 days (purpose: Q4 churn deep-dive). The table is <b>Confidential</b> with sensitive PII, so after your approval it routes to the DPO.</>,
      action: { title: 'Approve access request', target: 'AR-1042 · Thanawat K.', field: 'Decision', from: 'Pending (Owner)', to: 'Approved → forward to DPO', state: 'pending' },
    }
  }
  if (s.includes('who') || s.includes('ใคร')) {
    return { body: <>For <b>customer_360</b>: Owner is <b>Somchai Wongsakul</b> (Head of Customer Analytics), Steward is <b>Nida Charoenpong</b>. Technical questions go to the custodian of <code>build_customer_360</code>, <b>Arthit Phromma</b>.<div><Cite to="/asset/gold-customer-360">customer_360</Cite></div></> }
  }
  if (s.includes('drop') || s.includes('break') || s.includes('impact')) {
    return { body: <>Dropping <code>email</code> from <code>customer_360</code> would affect <b>2 downstream assets</b>: <code>churn_features</code> (uses it to derive <i>has_digital_contact</i>) and the <b>Customer Churn Dashboard</b>. Owners to notify: Somchai W. One DQ rule (<i>Email populated</i>) would also be orphaned.<div><Cite to="/asset/gold-customer-360?tab=lineage">Open impact view</Cite></div></> }
  }
  if (s.includes('explain') && path.startsWith('/asset')) {
    return { body: <><b>Customer 360</b> is the certified, single row-per-customer table for analytics. It merges cleansed CRM profiles with contracts and billing, refreshed daily at 02:00. It contains <b>sensitive personal data</b> (national ID, religion), so national ID is masked by default. DQ is 96.4% overall; the weak spot is email completeness (81.5%).<div><Cite to="/asset/gold-customer-360">customer_360</Cite><Cite to="/glossary/customer">Term: Customer</Cite></div></> }
  }
  if (s.includes('รายได้') || s.includes('revenue')) {
    return { body: <>Use <b>Revenue by Segment</b> (Power BI, Certified) for reporting, or <code>silver.billing_monthly</code> joined to <code>gold.customer_360.segment</code> for analysis. Note: <code>billing_monthly</code> is currently <b>2 days stale</b> (open issue DI-0207).<div><Cite to="/asset/report-revenue">Revenue by Segment</Cite><Cite to="/asset/silver-billing">billing_monthly</Cite></div></> }
  }
  if (s.includes('province') || s.includes('active customer')) {
    return { body: <>Best match is <b>gold.customer_360</b> (Certified · Authoritative). Filter <code>active_contracts &gt; 0</code> (glossary: <i>Active Customer</i>) and group by <code>province_code</code>.<pre className="mono" style={{ background: 'white', border: '1px solid var(--border)', borderRadius: 6, padding: 8, whiteSpace: 'pre-wrap' }}>{`SELECT province_code, COUNT(*) AS active_customers
FROM lakehouse.gold.customer_360
WHERE active_contracts > 0
GROUP BY province_code`}</pre><div><Cite to="/asset/gold-customer-360">customer_360</Cite><Cite to="/glossary/active-customer">Active Customer</Cite></div></> }
  }
  if (s.includes('overdue') || s.includes('pending') || s.includes('summar')) {
    return { body: <>You have <b>6 open tasks</b>; <b>2 are overdue</b>: CR-0311 (definition change for <i>Active Customer</i>) and DI-0207 (billing_monthly late). Highest priority: AR-1042 access request, due tomorrow.</> }
  }
  if (s.includes('sensitive') || s.includes('s.26') || s.includes('blood')) {
    return { body: <><b>3 datasets</b> hold PDPA s.26 sensitive data: <code>customer_360</code> (religion, pending confirmation), <code>crm_customer</code>, and <code>hr_employee</code> (blood_group, pending). <i>blood_group</i> was flagged by the LLM detector with 92% confidence because blood type is health information under s.26.</> }
  }
  if (s.includes('certified')) {
    return { body: <><b>Certified</b> means the Data Owner has approved the asset after it passed the completeness rule: Owner, Steward, description and classification are all filled (CDMC Control 2). Certified assets rank first in search. <i>Authoritative Source</i> is an extra badge for the one asset that should be used for a given subject.<div className="faint small" style={{ marginTop: 4 }}>Source: User Guide §4.2 Certification</div></> }
  }
  if (s.includes('request access') || s.includes('ขอสิทธิ์')) {
    return { body: <>Open the asset, click <b>Request access</b>, state the purpose and duration. The request goes to the Data Owner; Confidential/Restricted data with PII also goes to the DPO. Once approved, EDC creates the grant in the Lakehouse and revokes it automatically on expiry.<div className="faint small" style={{ marginTop: 4 }}>Source: User Guide §6.1 Access Requests</div></> }
  }
  return { body: <>I searched the catalog for “{q}”. The closest match is <b>gold.customer_360</b>. Want me to open search results, or hand this question to the Customer domain steward?<div className="row" style={{ marginTop: 6 }}><button className="btn sm"><UserRoundPlus size={13} />Ask a steward</button></div></> }
}

export default function AskSoftnix({ seed, onClose }: { seed?: string; onClose: () => void }) {
  const { lang } = useI18n()
  const loc = useLocation()
  const ctx = pageContext(loc.pathname)
  const [msgs, setMsgs] = useState<Msg[]>([])
  const [text, setText] = useState('')
  const [rec, setRec] = useState(false)
  const [tts, setTts] = useState(false)
  const [busy, setBusy] = useState(false)
  const bodyRef = useRef<HTMLDivElement>(null)
  const seeded = useRef<string | undefined>()

  useEffect(() => { bodyRef.current?.scrollTo({ top: 1e6, behavior: 'smooth' }) }, [msgs, busy])
  useEffect(() => {
    if (seed && seeded.current !== seed) { seeded.current = seed; send(seed) }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [seed])

  function send(q: string, voice = false) {
    if (!q.trim() || busy) return
    setMsgs(m => [...m, { role: 'user', text: q, voice }])
    setText('')
    setBusy(true)
    window.setTimeout(() => {
      const a = answer(q, loc.pathname)
      setMsgs(m => [...m, { role: 'bot', body: a.body, action: a.action }])
      setBusy(false)
    }, 900)
  }

  function setAction(i: number, state: Action['state']) {
    setMsgs(m => m.map((x, j) => (j === i && x.role === 'bot' && x.action ? { ...x, action: { ...x.action, state } } : x)))
  }

  function startVoice() {
    setRec(true)
  }
  function stopVoice() {
    if (!rec) return
    setRec(false)
    send(lang === 'th' ? 'ใครเป็นเจ้าของข้อมูลตารางนี้' : 'Who should I ask about this data?', true)
  }

  return (
    <aside className="ask-panel" role="dialog" aria-label="Ask Softnix">
      <div className="ask-h">
        <span className="ask-fab" style={{ position: 'static', height: 34, width: 34, padding: 0, justifyContent: 'center', boxShadow: 'none', background: 'rgba(255,255,255,.2)' }}><Sparkles size={17} /></span>
        <div style={{ lineHeight: 1.2 }}>
          <b>Ask Softnix</b>
          <div className="small" style={{ opacity: .85 }}>Data catalog expert · on-prem</div>
        </div>
        <div style={{ marginLeft: 'auto', display: 'flex' }}>
          <button className="icon-btn" onClick={() => setTts(v => !v)} aria-label="Toggle read aloud" title={tts ? 'Read aloud: on' : 'Read aloud: off'}>{tts ? <Volume2 size={17} /> : <VolumeX size={17} />}</button>
          <button className="icon-btn" aria-label="Chat history" title="History"><History size={17} /></button>
          <button className="icon-btn" onClick={onClose} aria-label="Minimise"><Minus size={17} /></button>
          <button className="icon-btn" onClick={() => { setMsgs([]); onClose() }} aria-label="Close"><X size={17} /></button>
        </div>
      </div>
      <div className="ask-ctx">
        <MapPin size={12} /> Context: <b>{ctx.label}</b>
        <span style={{ marginLeft: 'auto' }} className="row"><ShieldCheck size={12} color="var(--ok)" /> metadata only · your permissions</span>
      </div>

      <div className="ask-body" ref={bodyRef}>
        {msgs.length === 0 && (
          <div className="col" style={{ gap: 14 }}>
            <div className="msg bot"><div className="bubble">
              Hi Nida 👋 I can find data, explain lineage and quality, draft descriptions and tags, and help you file requests. I only see what you're allowed to see, and I'll always ask before saving anything.
            </div></div>
            <div>
              <div className="faint small" style={{ marginBottom: 6 }}>Suggested for {ctx.label}</div>
              <div className="ask-suggest">{suggestions(loc.pathname).map(s => <button key={s} onClick={() => send(s)}>{s}</button>)}</div>
            </div>
          </div>
        )}
        {msgs.map((m, i) => m.role === 'user' ? (
          <div key={i} className="msg user">{m.voice && <Mic size={12} style={{ marginRight: 4, verticalAlign: -1 }} />}{m.text}</div>
        ) : (
          <div key={i} className="msg bot">
            <div className="bubble">
              {m.body}
              {m.action && <ActionCard a={m.action} onConfirm={() => setAction(i, 'saved')} onCancel={() => setAction(i, 'cancelled')} />}
            </div>
            <div className="msg-tools">
              <button className="icon-btn" aria-label="Copy"><Copy size={13} /></button>
              <button className="icon-btn" aria-label="Good answer"><ThumbsUp size={13} /></button>
              <button className="icon-btn" aria-label="Bad answer"><ThumbsDown size={13} /></button>
            </div>
          </div>
        ))}
        {busy && <div className="msg bot"><div className="bubble typing"><span /><span /><span /></div></div>}
      </div>

      <div className="ask-input">
        <button
          className={`mic ${rec ? 'rec' : ''}`} aria-label="Hold to talk"
          onMouseDown={startVoice} onMouseUp={stopVoice} onMouseLeave={stopVoice} onTouchStart={startVoice} onTouchEnd={stopVoice}
          title="Hold to talk (TH/EN)"
        ><Mic size={17} /></button>
        {rec ? (
          <div className="grow row" style={{ height: 38, padding: '0 10px', border: '1px solid var(--bad)', borderRadius: 10, color: 'var(--bad)' }}>
            <div className="wave">{Array.from({ length: 14 }).map((_, i) => <i key={i} style={{ animationDelay: `${i * 0.06}s` }} />)}</div>
            <span className="small">Listening… release to send</span>
          </div>
        ) : (
          <textarea
            rows={1} value={text} placeholder={lang === 'th' ? 'ถามอะไรก็ได้เกี่ยวกับข้อมูล…' : 'Ask anything about your data…'}
            onChange={e => setText(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(text) } }}
          />
        )}
        <button className="send" onClick={() => send(text)} aria-label="Send"><Send size={16} /></button>
      </div>
    </aside>
  )
}

function ActionCard({ a, onConfirm, onCancel }: { a: Action; onConfirm: () => void; onCancel: () => void }) {
  return (
    <div className="action-card">
      <div className="ac-h"><BookOpen size={13} />{a.title} <span style={{ marginLeft: 'auto', fontWeight: 500 }}>{a.target}</span></div>
      <div className="ac-b">
        <div className="faint small">{a.field}</div>
        <div className="diff-old">{a.from}</div>
        <div className="diff-new">{a.to}</div>
        <div className="row" style={{ marginTop: 8 }}>
          {a.state === 'pending' && <>
            <button className="btn primary sm" onClick={onConfirm}>Confirm &amp; save</button>
            <button className="btn sm">Edit</button>
            <button className="btn ghost sm" onClick={onCancel}>Cancel</button>
          </>}
          {a.state === 'saved' && <span className="badge green">Saved · logged to audit trail as AI-assisted</span>}
          {a.state === 'cancelled' && <span className="badge gray">Cancelled · nothing changed</span>}
        </div>
      </div>
    </div>
  )
}
