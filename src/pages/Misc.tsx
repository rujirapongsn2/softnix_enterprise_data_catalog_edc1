import { useState } from 'react'
import { GuardBtn, useRole } from '../auth/role'
import { useStored } from '../data/store'
import { useShell } from '../components/Layout'
import { NewDqRuleForm, NewPolicyForm, AccessReviewForm, NewAttributeForm, type NewRule, type NewPolicy, type NewReview, type NewAttr } from '../forms/Forms'
import { Plus } from 'lucide-react'
import { Link } from 'react-router-dom'
import { AlertTriangle, Download, ShieldCheck, Sparkles, Plug, Languages, Layers, Hash } from 'lucide-react'
import { assets, auditEvents, people, domains } from '../data/mock'
import { Card, ClsBadge, Donut, Sparkline, Avatar, AiTag, scoreColor, typeIcon, Tabs, clsColor } from '../components/ui'

/* ---------- Data Quality overview ---------- */
export function QualityOverview() {
  const { toast } = useShell()
  const [rules, addRule] = useStored<NewRule>('dqRules')
  const [open, setOpen] = useState(false)
  const withDq = assets.filter(a => a.dq !== undefined).sort((a, b) => (a.dq ?? 0) - (b.dq ?? 0))
  return (
    <div className="page">
      <div className="page-h">
        <div><h1>Data Quality</h1><div className="sub">Rules are defined here and executed by the Lakehouse DQ engine (Great Expectations + PySpark). Results flow back via API / OpenLineage.</div></div>
        <div className="actions"><GuardBtn cap="dq.import" className="btn" onClick={() => toast('Upload a GX expectation suite (.json)')}>Import GX suites</GuardBtn><GuardBtn cap="dq.ruleCreate" className="btn primary" onClick={() => setOpen(true)}><Plus size={14} />New rule</GuardBtn></div>
      </div>
      <div className="grid g4" style={{ marginBottom: 16 }}>
        <div className="card stat row" style={{ gap: 14 }}><Donut value={92.8} size={68} /><div><div className="l">Avg score · Critical</div><b>412 datasets</b></div></div>
        <div className="card stat"><div className="l">Rules</div><div className="v">{(1930 + rules.length).toLocaleString()}</div><div className="faint small">68 suggested by AI awaiting review</div></div>
        <div className="card stat"><div className="l">Failing rules</div><div className="v" style={{ color: 'var(--bad)' }}>37</div><div className="faint small">12 high severity</div></div>
        <div className="card stat"><div className="l">Freshness SLA breaches</div><div className="v" style={{ color: 'var(--warn)' }}>4</div><div className="faint small">auto-created Data Issues</div></div>
      </div>
      {rules.length > 0 && <NewRulesCard rules={rules} />}
      <div className="grid g3">
        <Card title="Datasets by score (lowest first)" className="span2">
          <table className="tbl">
            <thead><tr><th>Dataset</th><th>Domain</th><th>Score</th><th>Trend</th><th>Freshness</th><th>Open issues</th></tr></thead>
            <tbody>
              {withDq.map(a => (
                <tr key={a.id}>
                  <td><Link to={`/asset/${a.id}?tab=quality`} className="row">{typeIcon(a.type, 14)}{a.path}</Link></td>
                  <td>{a.domain}</td>
                  <td><b style={{ color: scoreColor(a.dq!) }}>{a.dq}%</b></td>
                  <td><Sparkline data={[a.dq! - 2, a.dq! + 1, a.dq! - 1, a.dq! + 0.5, a.dq!]} width={80} height={20} color={scoreColor(a.dq!)} /></td>
                  <td style={{ color: a.freshnessOk ? undefined : 'var(--bad)' }}>{a.freshness}</td>
                  <td>{a.dq! < 85 ? <span className="badge red">2</span> : a.dq! < 95 ? <span className="badge amber">1</span> : '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
        <Card title="Open data issues">
          {[
            ['DI-0207', 'billing_monthly late for 2 days', 'Assigned', 'High'],
            ['DI-0204', 'Email completeness dropping (81.5%)', 'Root cause', 'Medium'],
            ['DI-0199', 'Negative monthly_revenue rows', 'Corrective action', 'High'],
            ['DI-0190', 'Duplicate contracts from CDC replay', 'Closed', 'Low'],
          ].map(([id, t, s, sev]) => (
            <div key={id} className="row" style={{ padding: '8px 0', borderBottom: '1px solid var(--border)', alignItems: 'flex-start' }}>
              <AlertTriangle size={14} color={sev === 'High' ? 'var(--bad)' : 'var(--warn)'} style={{ marginTop: 3 }} />
              <div className="grow"><div className="small"><b>{t}</b></div><div className="faint small">{id} · {s}</div></div>
            </div>
          ))}
        </Card>
      </div>
      {open && <NewDqRuleForm onClose={() => setOpen(false)} onCreate={r => { addRule(r); setOpen(false); toast(`Rule “${r.name}” created · first run after next pipeline run`) }} />}
    </div>
  )
}

export function NewRulesCard({ rules }: { rules: NewRule[] }) {
  return (
    <Card title={`New rules · ${rules.length}`} className="" actions={<span className="faint small">awaiting first GX run</span>}>
      <table className="tbl" style={{ marginBottom: 4 }}>
        <thead><tr><th>Rule</th><th>Dataset</th><th>Column</th><th>Dimension</th><th>Expectation</th><th>Severity</th><th>Threshold</th><th>On fail</th></tr></thead>
        <tbody>{rules.map(r => (
          <tr key={r.id} className="new-row"><td><b>{r.name}</b>{r.cde && <span className="badge blue" style={{ marginLeft: 6 }}>CDE</span>}</td><td className="mono small">{r.dataset}</td><td className="mono">{r.column}</td><td>{r.dimension}</td><td className="mono faint small">{r.gx}</td><td><span className={`badge ${r.severity === 'High' ? 'red' : r.severity === 'Medium' ? 'amber' : 'gray'}`}>{r.severity}</span></td><td>{r.threshold}%</td><td className="small muted">{r.onFail}</td></tr>
        ))}</tbody>
      </table>
    </Card>
  )
}

/* ---------- Policies & Access ---------- */
export function Policies() {
  const { toast } = useShell()
  const [tab, setTab] = useState<'policies' | 'scheme' | 'reviews'>('policies')
  const [pols, addPol] = useStored<NewPolicy>('policies')
  const [revs, addRev] = useStored<NewReview>('reviews')
  const [polOpen, setPolOpen] = useState(false)
  const [revOpen, setRevOpen] = useState(false)
  const [approved, setApproved] = useState<Record<string, boolean>>({})
  return (
    <div className="page">
      <div className="page-h"><div><h1>Policies &amp; Access</h1><div className="sub">Policy register, classification scheme and access reviews. Enforcement happens in the Lakehouse via tag and grant sync.</div></div>
        <div className="actions"><GuardBtn cap="review.create" className="btn" onClick={() => setRevOpen(true)}><Plus size={14} />New access review</GuardBtn><GuardBtn cap="policy.create" className="btn primary" onClick={() => setPolOpen(true)}><Plus size={14} />New policy</GuardBtn></div></div>
      <div className="card">
        <div style={{ padding: '0 16px' }}><Tabs value={tab} onChange={setTab} items={[{ id: 'policies', label: 'Policy register' }, { id: 'scheme', label: 'Classification scheme' }, { id: 'reviews', label: 'Access reviews' }]} /></div>
        {tab === 'policies' && (
          <table className="tbl">
            <thead><tr><th>Policy</th><th>Version</th><th>Status</th><th>Effective</th><th>Applies to</th><th>Lakehouse enforcement</th><th /></tr></thead>
            <tbody>
              {[...pols.map(p => [`${p.id} ${p.title}`, p.version, p.status, p.effective, p.appliesTo, p.enforcement, 'new']),
                ['POL-01 Data Classification Standard', 'v3.1', 'Approved', 'Jan 1, 2026', 'All assets', 'Tags cls_*'],
                ['POL-04 Personal Data Masking', 'v2.0', 'Approved', 'Mar 1, 2026', 'PII tags', 'Masking policy by tag'],
                ['POL-07 Access Request & Review', 'v1.4', 'Approved', 'Jan 1, 2026', 'Confidential, Restricted', 'Time-bound roles'],
                ['POL-09 Data Retention', 'v1.0', 'Candidate', '—', 'Datasets with PII', '—'],
              ].map(r => {
                const st = approved[r[0]] ? 'Approved' : r[2]
                return (
                <tr key={r[0]} className={r[6] ? 'new-row' : undefined}><td><b>{r[0]}</b>{r[6] && <span className="badge blue" style={{ marginLeft: 6 }}>new</span>}</td><td>{r[1]}</td><td><span className={`badge ${st === 'Approved' ? 'green' : 'amber'}`}>{st}</span></td><td>{r[3]}</td><td>{r[4]}</td><td className="mono small">{r[5]}</td>
                  <td>{st === 'Candidate' && <GuardBtn cap="policy.approve" className="btn sm ok" onClick={() => { setApproved(a => ({ ...a, [r[0]]: true })); toast(`${r[0].split(' ')[0]} approved by Council · enforcement sync scheduled`) }}>Approve</GuardBtn>}</td></tr>
              )})}
            </tbody>
          </table>
        )}
        {tab === 'scheme' && (
          <div className="card-b grid g4">
            {(['Public', 'Internal', 'Confidential', 'Restricted'] as const).map((c, i) => (
              <div key={c} className="card" style={{ padding: 14, borderTop: `3px solid ${clsColor[c]}` }}>
                <div className="row"><ClsBadge value={c} /><span className="faint small" style={{ marginLeft: 'auto' }}>Level {i + 1}</span></div>
                <p className="small muted">{['Freely shareable outside the organisation.', 'Default for business data; employees only.', 'Business-sensitive or personal data; need-to-know.', 'National ID, financial accounts, PDPA s.26 data; DPO approval required.'][i]}</p>
                <div className="faint small">Lakehouse tag <code>cls_{c.toLowerCase()}</code></div>
                <GuardBtn cap="policy.approve" className="btn sm" style={{ marginTop: 8 }} onClick={() => toast(`Change proposal for ${c} opened`)}>Propose change</GuardBtn>
              </div>
            ))}
          </div>
        )}
        {tab === 'reviews' && (
          <table className="tbl">
            <thead><tr><th>Campaign</th><th>Scope</th><th>Reviewer</th><th>Progress</th><th>Due</th></tr></thead>
            <tbody>
              {revs.map(r => <tr key={r.name} className="new-row"><td><b>{r.name}</b> <span className="badge blue">new</span></td><td>{r.scope}</td><td className="row"><Avatar id={r.reviewer} size="sm" />{people[r.reviewer]?.name}</td><td>{r.progress}</td><td>{r.due}</td></tr>)}
              <tr><td><b>Q4 2026 Restricted data review</b></td><td>48 datasets · 212 grants</td><td className="row"><Avatar id="pim" size="sm" />Pimchanok S.</td><td>64%</td><td>Oct 31, 2026</td></tr>
              <tr><td><b>Q4 2026 Customer domain</b></td><td>120 datasets · 380 grants</td><td className="row"><Avatar id="somchai" size="sm" />Somchai W.</td><td>22%</td><td>Nov 15, 2026</td></tr>
            </tbody>
          </table>
        )}
      </div>
      {polOpen && <NewPolicyForm onClose={() => setPolOpen(false)} onCreate={p => { addPol(p); setPolOpen(false); setTab('policies'); toast(`${p.id} submitted to the Data Governance Council`) }} />}
      {revOpen && <AccessReviewForm onClose={() => setRevOpen(false)} onCreate={r => { addRev(r); setRevOpen(false); setTab('reviews'); toast(`Campaign “${r.name}” started · reviewers notified`) }} />}
    </div>
  )
}

/* ---------- Audit ---------- */
export function Audit() {
  const { toast } = useShell()
  return (
    <div className="page">
      <div className="page-h">
        <div><h1>Audit Trail</h1><div className="sub">Append-only, hash-chained log of metadata changes, approvals, AI actions and MCP tool calls. Retained 5 years.</div></div>
        <div className="actions"><span className="badge green" style={{ height: 32, padding: '0 10px' }}><ShieldCheck size={14} />Chain verified · 1,284,019 entries</span><GuardBtn cap="audit.export" className="btn" onClick={() => toast('Signed export (CSV + hash manifest) is being prepared')}><Download size={14} />Export for auditor</GuardBtn></div>
      </div>
      <div className="row wrap" style={{ marginBottom: 12, gap: 8 }}>
        <input className="input" placeholder="Filter by user, asset, action…" style={{ width: 280 }} />
        <select className="input"><option>All actions</option><option>Approvals</option><option>Classification changes</option><option>AI-assisted</option><option>MCP calls</option></select>
        <select className="input"><option>Last 7 days</option><option>Last 30 days</option></select>
      </div>
      <div className="card tbl-wrap">
        <table className="tbl">
          <thead><tr><th>Time</th><th>Actor</th><th>Action</th><th>Target</th><th>Old → New</th><th>Channel</th><th>Hash</th></tr></thead>
          <tbody>
            {[...auditEvents, { when: 'Oct 9, 2026 08:55', who: 'ton', action: 'MCP tool call search_assets', target: 'client: claude-desktop', to: 'query="churn" · 4 results', via: 'MCP' }].map((e, i) => (
              <tr key={i}>
                <td className="small" style={{ whiteSpace: 'nowrap' }}>{e.when}</td>
                <td><span className="row"><Avatar id={e.who} size="sm" />{e.who === 'system' ? 'System' : people[e.who]?.name.split(' ')[0]}</span></td>
                <td>{e.action}</td>
                <td className="mono small">{e.target}</td>
                <td className="small">{e.from && <span className="diff-old">{e.from}</span>}{e.from && ' → '}{e.to && <span className="diff-new">{e.to}</span>}</td>
                <td>{e.via === 'MCP' ? <span className="badge cyan">MCP</span> : e.via ? <AiTag label="AI" /> : <span className="badge gray">UI</span>}</td>
                <td className="mono faint small">{(0x9f3a2c + i * 7919).toString(16)}…</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

/* ---------- Settings ---------- */
export function Settings() {
  const { can } = useRole()
  const { toast } = useShell()
  const editable = can('settings.edit')
  const [attrs, addAttr] = useStored<NewAttr>('attributes')
  const [attrOpen, setAttrOpen] = useState(false)
  const [tab, setTab] = useState<'ai' | 'mcp' | 'metamodel' | 'general'>('ai')
  return (
    <div className="page">
      <div className="page-h"><div><h1>Settings</h1><div className="sub">Configuration without redeploying: AI providers, MCP server, metamodel, languages</div></div></div>
      <div className="card">
        <div style={{ padding: '0 16px' }}>
          <Tabs value={tab} onChange={setTab} items={[
            { id: 'ai', label: <span className="row"><Sparkles size={14} />AI &amp; Ask Softnix</span> },
            { id: 'mcp', label: <span className="row"><Plug size={14} />MCP server</span> },
            { id: 'metamodel', label: <span className="row"><Layers size={14} />Metamodel</span> },
            { id: 'general', label: <span className="row"><Languages size={14} />General</span> },
          ]} />
        </div>
        <div className="card-b">
          {tab === 'ai' && (
            <div className="grid g2">
              <Card title="Model providers">
                <table className="tbl">
                  <thead><tr><th>Feature</th><th>Model</th><th>Hosting</th></tr></thead>
                  <tbody>
                    {[['Ask Softnix chat', 'gpt-oss-120b', 'On-prem'], ['Generate descriptions', 'gpt-oss-120b', 'On-prem'], ['PII detection', 'typhoon-2-8b', 'On-prem'], ['Embeddings (search)', 'bge-m3', 'On-prem'], ['Speech-to-text (TH/EN)', 'whisper-large-v3', 'On-prem']].map(r => (
                      <tr key={r[0]}><td>{r[0]}</td><td className="mono">{r[1]}</td><td><span className="badge green">{r[2]}</span></td></tr>
                    ))}
                  </tbody>
                </table>
              </Card>
              <Card title="Guardrails">
                <div className="col" style={{ gap: 10 }}>
                  {[['Send sample data to LLM', false], ['Mask PII before sending', true], ['Restricted assets → on-prem only', true], ['Ask Softnix action mode (save with confirmation)', true], ['Voice input / read-aloud', true], ['Keep chat history (90 days)', true]].map(([l, on]) => (
                    <label key={l as string} className="row" style={{ justifyContent: 'space-between' }}><span>{l}</span><input type="checkbox" defaultChecked={on as boolean} disabled={!editable} title={editable ? undefined : 'Only Platform Admin can change settings'} /></label>
                  ))}
                  <div className="divider" />
                  <div className="small">Token quota: <b>200k / user / day</b> · used today 38%</div>
                </div>
              </Card>
            </div>
          )}
          {tab === 'mcp' && (
            <div className="grid g2">
              <Card title="Endpoint">
                <dl className="kv"><dt>URL</dt><dd className="mono">https://edc.example.co.th/mcp</dd><dt>Transport</dt><dd>Streamable HTTP</dd><dt>Auth</dt><dd>OAuth 2.1 via Keycloak (per-user)</dd><dt>Write tools</dt><dd>Proposals only → workflow</dd><dt>Rate limit</dt><dd>60 calls / min / client</dd></dl>
              </Card>
              <Card title="Allowed clients">
                {['claude-desktop', 'vscode-copilot', 'internal-agent-hub'].map(c => <div key={c} className="row" style={{ padding: '6px 0' }}><Plug size={14} /><span className="mono grow">{c}</span><span className="badge green">allowed</span></div>)}
                <div className="divider" />
                <div className="faint small">Tools: search_assets, get_asset, get_schema, get_lineage, get_glossary_term, get_dq_status, get_owners, propose_description, create_issue, request_access</div>
              </Card>
            </div>
          )}
          {tab === 'metamodel' && (
            <>
            <div className="row" style={{ marginBottom: 10 }}><span className="faint small grow">Metamodel v4 · custom attributes per asset type (CAT-03)</span><GuardBtn cap="settings.edit" className="btn sm primary" onClick={() => setAttrOpen(true)}><Plus size={13} />New attribute</GuardBtn></div>
            <table className="tbl">
              <thead><tr><th>Attribute</th><th>Asset types</th><th>Type</th><th>Required</th><th>Allowed values</th></tr></thead>
              <tbody>
                {attrs.map(a => <tr key={a.name} className="new-row"><td><span className="row"><Hash size={13} />{a.name} <span className="badge blue">new</span></span></td><td>{a.types}</td><td>{a.dtype}</td><td>{a.required}</td><td className="small muted">{a.values || '—'}</td></tr>)}
                {[['Business name (TH/EN)', 'Dataset, Column', 'Text ×2', 'Critical'], ['Update frequency', 'Dataset', 'Enum', 'Yes', 'Real-time, Hourly, Daily, Monthly'], ['Retention', 'Dataset', 'Duration', 'If PII'], ['Legal basis', 'Dataset', 'Enum', 'If PII', 'Consent, Contract, Legal obligation…'], ['Cost center', 'Data Product', 'Text', 'No']].map(r => (
                  <tr key={r[0]}><td><span className="row"><Hash size={13} />{r[0]}</span></td><td>{r[1]}</td><td>{r[2]}</td><td>{r[3]}</td><td className="small muted">{r[4] ?? '—'}</td></tr>
                ))}
              </tbody>
            </table>
            </>
          )}
          {tab === 'general' && (
            <dl className="kv" style={{ maxWidth: 560 }}>
              <dt>Default language</dt><dd>English (users can switch to ไทย)</dd>
              <dt>Calendar</dt><dd>ค.ศ. (Gregorian) · พ.ศ. optional per user</dd>
              <dt>Identity provider</dt><dd>OIDC · Keycloak · group → role mapping</dd>
              <dt>Tenants</dt><dd>{domains.length} domains · 1 company</dd>
            </dl>
          )}
        </div>
      </div>
      {attrOpen && <NewAttributeForm onClose={() => setAttrOpen(false)} onCreate={a => { addAttr(a); setAttrOpen(false); toast(`Attribute “${a.name}” added · metamodel v5 draft`) }} />}
    </div>
  )
}
