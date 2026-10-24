// Create / New forms for the EDC1 prototype. Each form validates, then hands a record to onCreate;
// pages persist it with useStored() (localStorage) and show it at the top of their list.
import { useState } from 'react'
import { BookOpen, Package, Gauge, BellRing, BellOff, FileText, ClipboardCheck, UserPlus, Hash, GitPullRequest, Sparkles, AlertTriangle, Users } from 'lucide-react'
import { assets, domains, type Term, type DQRule } from '../data/mock'
import { Modal, Field, FormGrid, Input, Select, TextArea, Toggle, Checks, Radio, TagInput, PersonSelect, Section, req, anyErr } from '../components/form'
import { ROLES, type RoleId } from '../auth/permissions'
import { useRole } from '../auth/role'

type Close = { onClose: () => void }
const today = () => new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
const slug = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
const domainNames = domains.map(d => d.name)

function Footer({ onClose, onSubmit, label, extra }: { onClose: () => void; onSubmit: () => void; label: string; extra?: React.ReactNode }) {
  return <><span className="faint small grow">{extra ?? <><span style={{ color: 'var(--bad-text)' }}>*</span> required</>}</span><button className="btn" onClick={onClose}>Cancel</button><button className="btn primary" onClick={onSubmit}>{label}</button></>
}

/* ======================= Glossary term (GLO-01..05) ======================= */
export type NewTerm = Term & { scope: string; createdBy: string; isNew: true; unit?: string }

export function NewTermForm({ onClose, onCreate, existing }: Close & { onCreate: (t: NewTerm) => void; existing: Term[] }) {
  const { def } = useRole()
  const [en, setEn] = useState(''); const [th, setTh] = useState('')
  const [domain, setDomain] = useState(''); const [parent, setParent] = useState('')
  const [definition, setDefinition] = useState(''); const [synonyms, setSynonyms] = useState<string[]>([])
  const [abbrev, setAbbrev] = useState(''); const [steward, setSteward] = useState(def.persona === 'nida' || def.persona === 'mai' ? def.persona : '')
  const [kpi, setKpi] = useState(false); const [formula, setFormula] = useState(''); const [unit, setUnit] = useState('')
  const [related, setRelated] = useState<string[]>([]); const [scope, setScope] = useState<'domain' | 'enterprise'>('domain')
  const [status, setStatus] = useState<'Draft' | 'Candidate'>('Candidate')
  const [tried, setTried] = useState(false)
  const dup = existing.find(t => t.en.toLowerCase() === en.trim().toLowerCase() || t.synonyms.some(s => s.toLowerCase() === en.trim().toLowerCase()))
  const errs = {
    en: req(en) || (dup ? `“${dup.en}” already exists${dup.en.toLowerCase() !== en.trim().toLowerCase() ? ' (as a synonym)' : ''}` : ''),
    th: req(th), domain: req(domain), steward: req(steward),
    definition: req(definition) || (definition.trim().length < 20 ? 'Write at least 20 characters (ISO 11179: precise, non-circular)' : ''),
    formula: kpi ? req(formula, 'KPI terms need a calculation') : '',
  }
  const e = (k: keyof typeof errs) => (tried ? errs[k] || undefined : undefined)
  const submit = () => {
    setTried(true); if (anyErr(errs)) return
    onCreate({ id: `${slug(en)}-${Date.now() % 1000}`, en: en.trim(), th: th.trim(), domain, parent: parent || undefined, status, definition: definition.trim(), synonyms, abbrev: abbrev || undefined,
      steward, formula: kpi ? formula : undefined, unit: kpi ? unit : undefined, kpi, related, linked: 0, scope: scope === 'enterprise' ? 'Enterprise' : 'Domain', createdBy: def.name, isNew: true })
  }
  const parents = existing.filter(t => !domain || t.domain === domain)
  return (
    <Modal size="lg" icon={<BookOpen size={18} />} title="New glossary term" sub="Bilingual business term · ISO/IEC 11179 registration (GLO-01)" onClose={onClose}
      footer={<Footer onClose={onClose} onSubmit={submit} label={status === 'Candidate' ? 'Create & submit for approval' : 'Save as draft'} />}>
      <Section title="Name">
        <FormGrid cols={3}>
          <Field label="Term (EN)" required error={e('en')}><Input value={en} onChange={setEn} placeholder="e.g. Dormant Customer" autoFocus /></Field>
          <Field label="คำศัพท์ (TH)" required error={e('th')}><Input value={th} onChange={setTh} placeholder="เช่น ลูกค้าที่ไม่เคลื่อนไหว" /></Field>
          <Field label="Abbreviation"><Input value={abbrev} onChange={setAbbrev} placeholder="optional" /></Field>
          <Field label="Synonyms" span={3} hint="Search will match these too (EN or TH)"><TagInput value={synonyms} onChange={setSynonyms} placeholder="e.g. Inactive Customer, ลูกค้าหยุดใช้งาน" /></Field>
        </FormGrid>
      </Section>
      <Section title="Meaning">
        <Field label="Definition" required error={e('definition')} hint={`${definition.trim().length} characters · say what it is, not how it is stored`}><TextArea rows={3} value={definition} onChange={setDefinition} placeholder="A customer who has had no billable activity for 180 consecutive days…" /></Field>
        <Toggle checked={kpi} onChange={setKpi} label="This term is a KPI / metric" sub="Adds a calculation and unit; linked dashboards show the formula" />
        {kpi && (
          <FormGrid cols={3}>
            <Field label="Calculation" required error={e('formula')} span={2}><Input value={formula} onChange={setFormula} placeholder="COUNT(DISTINCT customer_id) WHERE last_bill_date < today - 180" className="input w100 mono" /></Field>
            <Field label="Unit"><Select value={unit} onChange={setUnit} placeholder="—" options={['count', '%', 'THB', 'days', 'ratio']} /></Field>
          </FormGrid>
        )}
      </Section>
      <Section title="Classification & stewardship">
        <FormGrid cols={3}>
          <Field label="Domain" required error={e('domain')}><Select value={domain} onChange={setDomain} placeholder="Select…" options={domainNames} /></Field>
          <Field label="Broader term (parent)"><Select value={parent} onChange={setParent} placeholder="— none —" options={parents.map(t => [t.id, t.en] as [string, string])} /></Field>
          <Field label="Steward" required error={e('steward')}><PersonSelect value={steward} onChange={setSteward} filter={t => /Steward/.test(t)} /></Field>
          <Field label="Related terms" span={3}><Checks options={existing.slice(0, 10).map(t => t.en)} value={related} onChange={setRelated} /></Field>
        </FormGrid>
        <Radio value={scope} onChange={setScope} options={[
          { id: 'domain', label: 'Domain term', sub: 'Approved by the domain Data Owner' },
          { id: 'enterprise', label: 'Enterprise term', sub: 'Approved by the Data Governance Council' },
        ]} />
      </Section>
      <Section title="Workflow" desc="WF-02 Glossary approval">
        <Radio value={status} onChange={setStatus} options={[
          { id: 'Draft', label: 'Save as Draft', sub: 'Only you and stewards can see it' },
          { id: 'Candidate', label: 'Submit as Candidate', sub: scope === 'enterprise' ? 'Goes to the Council for approval' : 'Goes to the domain Owner for approval' },
        ]} />
      </Section>
    </Modal>
  )
}

/* ======================= Change request (WF-02, CTR-06) ======================= */
export interface ChangeReq { id: string; target: string; field: string; current: string; proposed: string; reason: string; urgency: string; by: string; byPersona: string; created: string }
export function ChangeRequestForm({ onClose, onCreate, target, current }: Close & { onCreate: (c: ChangeReq) => void; target: string; current: string }) {
  const { def } = useRole()
  const [field, setField] = useState('Definition'); const [proposed, setProposed] = useState(current)
  const [reason, setReason] = useState(''); const [urgency, setUrgency] = useState('Normal'); const [tried, setTried] = useState(false)
  const errs = { proposed: proposed.trim() === current.trim() ? 'Change the value to propose something new' : req(proposed), reason: req(reason, 'Explain why (reviewers see this)') }
  const submit = () => { setTried(true); if (anyErr(errs)) return; onCreate({ id: `CR-0${300 + Math.floor(Math.random() * 90)}`, target, field, current, proposed, reason, urgency, by: def.name, byPersona: def.persona, created: today() }) }
  return (
    <Modal icon={<GitPullRequest size={18} />} title={`Propose change · ${target}`} sub="Change request → Steward → Owner (WF-02)" onClose={onClose} footer={<Footer onClose={onClose} onSubmit={submit} label="Submit change request" />}>
      <FormGrid cols={2}>
        <Field label="What to change"><Select value={field} onChange={setField} options={['Definition', 'Calculation', 'Synonyms', 'Steward', 'Domain', 'Status (retire)']} /></Field>
        <Field label="Urgency"><Select value={urgency} onChange={setUrgency} options={['Normal', 'High — blocks a report', 'Low']} /></Field>
      </FormGrid>
      <Field label="Current"><div className="card small" style={{ padding: 10, background: 'var(--surface-2)' }}>{current}</div></Field>
      <Field label="Proposed" required error={tried ? errs.proposed || undefined : undefined}><TextArea rows={3} value={proposed} onChange={setProposed} /></Field>
      <Field label="Reason & evidence" required error={tried ? errs.reason || undefined : undefined}><TextArea rows={2} value={reason} onChange={setReason} placeholder="e.g. Finance and Customer reports disagree by 2.1%" /></Field>
      <div className="ai-note small row"><Sparkles size={13} color="var(--ai)" />Impact preview: linked assets, reports and DQ rules will be listed for the approver.</div>
    </Modal>
  )
}

/* ======================= Data product (CAT-09, CTR-01, DQ-06) ======================= */
export interface NewProduct { id: string; name: string; domain: string; owner: string; sla: string; assets: number; consumers: number; desc: string; certified: boolean; rating: number; isNew: true; status: string; contract: string; slo: string; access: string }
export function NewProductForm({ onClose, onCreate }: Close & { onCreate: (p: NewProduct) => void }) {
  const { def } = useRole()
  const [name, setName] = useState(''); const [domain, setDomain] = useState(''); const [owner, setOwner] = useState(def.persona === 'somchai' ? 'somchai' : '')
  const [steward, setSteward] = useState(''); const [desc, setDesc] = useState(''); const [members, setMembers] = useState<string[]>([])
  const [refresh, setRefresh] = useState('Daily'); const [by, setBy] = useState('06:00')
  const [fresh, setFresh] = useState('26'); const [compl, setCompl] = useState('99'); const [dqMin, setDqMin] = useState('95'); const [avail, setAvail] = useState('99.5')
  const [contract, setContract] = useState<'new' | 'import' | 'later'>('new'); const [access, setAccess] = useState<'request' | 'domain' | 'open'>('request')
  const [usage, setUsage] = useState(''); const [tags, setTags] = useState<string[]>([]); const [tried, setTried] = useState(false)
  const errs = { name: req(name), domain: req(domain), owner: req(owner, 'Every data product needs an accountable owner'), desc: req(desc), members: req(members, 'Add at least one asset') }
  const e = (k: keyof typeof errs) => (tried ? errs[k] || undefined : undefined)
  const submit = () => {
    setTried(true); if (anyErr(errs)) return
    onCreate({ id: `dp-${Date.now() % 10000}`, name, domain, owner, sla: `${refresh}${refresh === 'Daily' ? ` by ${by}` : ''} · ${avail}%`, assets: members.length, consumers: 0, desc, certified: false, rating: 0, isNew: true,
      status: contract === 'later' ? 'Draft · contract missing' : 'Draft', contract: contract === 'new' ? 'ODCS v3 template' : contract === 'import' ? 'Imported YAML' : 'Not yet', slo: `freshness ≤ ${fresh}h · CDE completeness ≥ ${compl}% · DQ ≥ ${dqMin}% · availability ${avail}%`, access })
  }
  const domainAssets = assets.filter(a => !domain || a.domain === domain)
  return (
    <Modal size="lg" icon={<Package size={18} />} title="New data product" sub="Assets + owner + data contract + SLO (CAT-09)" onClose={onClose}
      footer={<Footer onClose={onClose} onSubmit={submit} label="Create draft product" extra="Products publish only after contract (CTR-01) and SLO (DQ-06) are approved" />}>
      <Section title="Product">
        <FormGrid cols={3}>
          <Field label="Name" required error={e('name')} span={2}><Input value={name} onChange={setName} placeholder="e.g. Customer Lifetime Value" autoFocus /></Field>
          <Field label="Domain" required error={e('domain')}><Select value={domain} onChange={setDomain} placeholder="Select…" options={domainNames} /></Field>
          <Field label="Description" required error={e('desc')} span={3}><TextArea rows={2} value={desc} onChange={setDesc} placeholder="What questions does it answer, and for whom?" /></Field>
          <Field label="Data Owner" required error={e('owner')}><PersonSelect value={owner} onChange={setOwner} filter={t => /Head|Owner/.test(t)} /></Field>
          <Field label="Data Steward"><PersonSelect value={steward} onChange={setSteward} filter={t => /Steward/.test(t)} /></Field>
          <Field label="Tags"><TagInput value={tags} onChange={setTags} /></Field>
        </FormGrid>
      </Section>
      <Section title="Assets in this product" desc={domain ? `${domain} domain` : 'all domains'}>
        <Field label="Output & supporting assets" required error={e('members')}><Checks options={domainAssets.map(a => a.path)} value={members} onChange={setMembers} /></Field>
      </Section>
      <Section title="Service levels (SLO)" desc="DQ-06 · 30-day attainment & error budget">
        <FormGrid cols={3}>
          <Field label="Refresh"><Select value={refresh} onChange={setRefresh} options={['Hourly', 'Daily', 'Weekly', 'Monthly']} /></Field>
          {refresh === 'Daily' && <Field label="Available by (ICT)"><Input type="time" value={by} onChange={setBy} /></Field>}
          <Field label="Freshness ≤ (hours)"><Input value={fresh} onChange={setFresh} inputMode="numeric" /></Field>
          <Field label="CDE completeness ≥ %"><Input value={compl} onChange={setCompl} inputMode="decimal" /></Field>
          <Field label="DQ score ≥ %"><Input value={dqMin} onChange={setDqMin} inputMode="decimal" /></Field>
          <Field label="Availability %"><Select value={avail} onChange={setAvail} options={['99.0', '99.5', '99.9']} /></Field>
        </FormGrid>
      </Section>
      <Section title="Contract & access">
        <Field label="Data contract (ODCS)"><Radio value={contract} onChange={setContract} options={[
          { id: 'new', label: 'Start from template', sub: 'Schema from selected assets' }, { id: 'import', label: 'Import YAML' }, { id: 'later', label: 'Add later', sub: 'Product stays Draft' },
        ]} /></Field>
        <Field label="How consumers get access"><Radio value={access} onChange={setAccess} options={[
          { id: 'request', label: 'Access request', sub: 'Owner approves (ACC-01)' }, { id: 'domain', label: 'Open to domain', sub: 'Members of the domain group' }, { id: 'open', label: 'Open internally', sub: 'Internal-class data only' },
        ]} /></Field>
        <Field label="Usage guide"><TextArea rows={2} value={usage} onChange={setUsage} placeholder="Join keys, grain, known caveats…" /></Field>
      </Section>
    </Modal>
  )
}

/* ======================= DQ rule (DQ-01, DQ-02) ======================= */
export type NewRule = DQRule & { dataset: string; owner: string; onFail: string; isNew: true; cde: boolean }
const EXPECT: Record<string, { gx: string; dim: string; params: string[] }> = {
  'Not null': { gx: 'expect_column_values_to_not_be_null', dim: 'Completeness', params: [] },
  'Unique': { gx: 'expect_column_values_to_be_unique', dim: 'Uniqueness', params: [] },
  'Matches pattern': { gx: 'expect_column_values_to_match_regex', dim: 'Validity', params: ['Regex'] },
  'Between': { gx: 'expect_column_values_to_be_between', dim: 'Accuracy', params: ['Min', 'Max'] },
  'In set': { gx: 'expect_column_values_to_be_in_set', dim: 'Consistency', params: ['Allowed values (comma-separated)'] },
  'Freshness': { gx: 'freshness SLA', dim: 'Timeliness', params: ['Max age (hours)'] },
  'Row count': { gx: 'expect_table_row_count_to_be_between', dim: 'Completeness', params: ['Min rows', 'Max rows'] },
  'Custom SQL': { gx: 'unexpected_rows_expectation', dim: 'Accuracy', params: ['SQL (rows returned = failures)'] },
}
export function NewDqRuleForm({ onClose, onCreate, dataset: ds0 }: Close & { onCreate: (r: NewRule) => void; dataset?: string }) {
  const [dataset, setDataset] = useState(ds0 ?? ''); const [column, setColumn] = useState(''); const [kind, setKind] = useState('Not null')
  const [dim, setDim] = useState(EXPECT['Not null'].dim); const [params, setParams] = useState<Record<string, string>>({})
  const [name, setName] = useState(''); const [threshold, setThreshold] = useState('99'); const [severity, setSeverity] = useState<'High' | 'Medium' | 'Low'>('Medium')
  const [owner, setOwner] = useState(''); const [schedule, setSchedule] = useState('After each pipeline run (OpenLineage)')
  const [onFail, setOnFail] = useState<string[]>(['Alert steward', 'Create Data Issue (High)']); const [cde, setCde] = useState(false); const [tried, setTried] = useState(false)
  const ex = EXPECT[kind]
  const errs: Record<string, string> = { dataset: req(dataset), column: kind === 'Freshness' || kind === 'Row count' || kind === 'Custom SQL' ? '' : req(column), name: req(name), threshold: +threshold > 0 && +threshold <= 100 ? '' : '0–100',
    ...Object.fromEntries(ex.params.map(p => [p, req(params[p])])) }
  const e = (k: string) => (tried ? errs[k] || undefined : undefined)
  const pickKind = (k: string) => { setKind(k); setDim(EXPECT[k].dim); setParams({}) }
  const autoName = () => { if (!name && (column || kind === 'Freshness')) setName(`${column || 'Table'} ${kind.toLowerCase()}${params[ex.params[0]] ? ` (${params[ex.params[0]]})` : ''}`) }
  const submit = () => {
    setTried(true); if (anyErr(errs)) return
    onCreate({ id: `r-${Date.now() % 10000}`, name, column: column || '(table)', dimension: dim, threshold: +threshold, score: 0, severity, gx: ex.gx, trend: [], dataset, owner, onFail: onFail.join(', '), isNew: true, cde })
  }
  const cols = ['customer_id', 'national_id', 'email', 'mobile_no', 'segment', 'province_code', 'birth_date', 'monthly_revenue', 'active_contracts']
  return (
    <Modal size="lg" icon={<Gauge size={18} />} title="New data quality rule" sub="Defined in EDC, executed by the Lakehouse DQ engine (Great Expectations)" onClose={onClose} footer={<Footer onClose={onClose} onSubmit={submit} label="Create rule" />}>
      <Section title="Target">
        <FormGrid cols={2}>
          <Field label="Dataset" required error={e('dataset')}><Select value={dataset} onChange={setDataset} placeholder="Select dataset…" options={assets.filter(a => a.type === 'Table').map(a => a.path)} /></Field>
          <Field label="Column" required={!['Freshness', 'Row count', 'Custom SQL'].includes(kind)} error={e('column')}><Select value={column} onChange={setColumn} placeholder="(table-level)" options={cols} /></Field>
        </FormGrid>
        <Toggle checked={cde} onChange={setCde} label="Critical Data Element (CDE)" sub="CDE rules weigh ×2 in the DQ score" />
      </Section>
      <Section title="Expectation">
        <div className="row wrap" style={{ gap: 6 }}>{Object.keys(EXPECT).map(k => <button key={k} type="button" className={`chip ${kind === k ? 'on' : ''}`} onClick={() => pickKind(k)}>{k}</button>)}</div>
        <FormGrid cols={2}>
          {ex.params.map(p => <Field key={p} label={p} required error={e(p)} span={p.startsWith('SQL') ? 2 : 1}>{p.startsWith('SQL') ? <TextArea rows={3} value={params[p] ?? ''} onChange={v => setParams(s => ({ ...s, [p]: v }))} className="input w100 mono" /> : <Input value={params[p] ?? ''} onChange={v => setParams(s => ({ ...s, [p]: v }))} onBlur={autoName} className="input w100 mono" />}</Field>)}
          <Field label="Quality dimension (DMBOK)"><Select value={dim} onChange={setDim} options={['Accuracy', 'Completeness', 'Validity', 'Consistency', 'Uniqueness', 'Timeliness']} /></Field>
          <Field label="GX expectation"><Input value={ex.gx} onChange={() => {}} readOnly className="input w100 mono" /></Field>
        </FormGrid>
      </Section>
      <Section title="Scoring & response">
        <FormGrid cols={3}>
          <Field label="Rule name" required error={e('name')} span={3}><Input value={name} onChange={setName} onFocus={autoName} placeholder="e.g. Email populated for digital customers" /></Field>
          <Field label="Pass threshold %" required error={e('threshold')}><Input value={threshold} onChange={setThreshold} inputMode="decimal" /></Field>
          <Field label="Severity"><Select value={severity} onChange={v => setSeverity(v as 'High')} options={['High', 'Medium', 'Low']} /></Field>
          <Field label="Rule owner"><PersonSelect value={owner} onChange={setOwner} filter={t => /Steward|Engineer/.test(t)} /></Field>
          <Field label="Run" span={3}><Select value={schedule} onChange={setSchedule} options={['After each pipeline run (OpenLineage)', 'Daily 03:00 ICT', 'Hourly', 'With harvest']} /></Field>
          <Field label="When it fails" span={3}><Checks options={['Alert steward', 'Alert owner', 'Create Data Issue (High)', 'Quarantine Gold publish', 'Count toward auto-decertify (CERT-02)']} value={onFail} onChange={setOnFail} /></Field>
        </FormGrid>
      </Section>
    </Modal>
  )
}

/* ======================= Alert rule (OBS-04) ======================= */
export interface NewAlert { id: string; scope: string; trigger: string; sev: string; route: string; channel: string; dedup: string; on: boolean; isNew?: true }
export function NewAlertRuleForm({ onClose, onCreate }: Close & { onCreate: (a: NewAlert) => void }) {
  const [scopeKind, setScopeKind] = useState('Domain'); const [scopeVal, setScopeVal] = useState('')
  const [trigger, setTrigger] = useState('DQ score < threshold'); const [sev, setSev] = useState('High')
  const [route, setRoute] = useState<string[]>(['Steward']); const [escalate, setEscalate] = useState('4')
  const [channels, setChannels] = useState<string[]>(['Email', 'In-app']); const [webhook, setWebhook] = useState('')
  const [dedup, setDedup] = useState('1 per asset / 6 h'); const [on, setOn] = useState(true); const [tried, setTried] = useState(false)
  const errs = { scope: scopeKind === 'All assets' ? '' : req(scopeVal), route: req(route), channels: req(channels), webhook: channels.some(c => c === 'Webhook' || c === 'PagerDuty') && !/^https:\/\//.test(webhook) ? 'https:// URL required' : '' }
  const e = (k: keyof typeof errs) => (tried ? errs[k] || undefined : undefined)
  const submit = () => {
    setTried(true); if (anyErr(errs)) return
    onCreate({ id: `AL-${String(10 + Math.floor(Math.random() * 89))}`, scope: scopeKind === 'All assets' ? 'All' : `${scopeKind}: ${scopeVal}`, trigger, sev,
      route: `${route.join(', ')}${escalate ? ` → Owner after ${escalate} h` : ''}`, channel: channels.join(', '), dedup, on, isNew: true })
  }
  return (
    <Modal icon={<BellRing size={18} />} title="New alert rule" sub="Route anomalies to the right people (OBS-04)" onClose={onClose} footer={<Footer onClose={onClose} onSubmit={submit} label="Create rule" />}>
      <FormGrid cols={2}>
        <Field label="Scope"><Select value={scopeKind} onChange={v => { setScopeKind(v); setScopeVal('') }} options={['Domain', 'Asset', 'Data product', 'Tier', 'All assets']} /></Field>
        {scopeKind !== 'All assets' && <Field label={scopeKind} required error={e('scope')}>
          <Select value={scopeVal} onChange={setScopeVal} placeholder="Select…" options={scopeKind === 'Domain' ? domainNames : scopeKind === 'Asset' ? assets.map(a => a.path) : scopeKind === 'Tier' ? ['Gold assets', 'Certified assets', 'Critical assets'] : ['Customer 360', 'Monthly Revenue Mart', 'Churn Signals', 'Digital Engagement']} />
        </Field>}
        <Field label="Trigger" span={2}><Select value={trigger} onChange={setTrigger} options={['DQ score < threshold', 'Contract violation (breaking)', 'Pipeline run FAIL (OpenLineage)', 'Freshness SLA breached', 'Volume anomaly (> 3σ)', 'Distribution drift (PSI > 0.25)', 'Schema change detected', 'SLO error budget exhausted']} /></Field>
        <Field label="Severity"><Select value={sev} onChange={setSev} options={['Critical', 'High', 'Medium', 'Low']} /></Field>
        <Field label="Dedup / grouping"><Select value={dedup} onChange={setDedup} options={['1 per asset / 1 h', '1 per asset / 6 h', '1 per rule / 24 h', 'Digest 08:00']} /></Field>
        <Field label="Route to" required error={e('route')} span={2}><Checks options={['Steward', 'Owner', 'On-call Data Eng', 'DPO', 'Subscribed consumers']} value={route} onChange={setRoute} /></Field>
        <Field label="Escalate to Owner if not acknowledged (hours)"><Input value={escalate} onChange={setEscalate} inputMode="numeric" placeholder="blank = no escalation" /></Field>
        <div />
        <Field label="Channels" required error={e('channels')} span={2}><Checks options={['Email', 'In-app', 'Teams', 'LINE', 'Webhook', 'PagerDuty']} value={channels} onChange={setChannels} /></Field>
        {channels.some(c => c === 'Webhook' || c === 'PagerDuty') && <Field label="Webhook / integration URL" required error={e('webhook')} span={2}><Input value={webhook} onChange={setWebhook} placeholder="https://events.pagerduty.com/…" className="input w100 mono" /></Field>}
      </FormGrid>
      <Toggle checked={on} onChange={setOn} label="Enable immediately" />
    </Modal>
  )
}

export interface NewWindow { scope: string; when: string; reason: string; isNew?: true }
export function MaintenanceWindowForm({ onClose, onCreate }: Close & { onCreate: (w: NewWindow) => void }) {
  const [scope, setScope] = useState(''); const [repeat, setRepeat] = useState('Once')
  const [start, setStart] = useState(''); const [end, setEnd] = useState(''); const [reason, setReason] = useState(''); const [tried, setTried] = useState(false)
  const errs = { scope: req(scope), start: req(start), end: req(end) || (start && end <= start ? 'End must be after start' : ''), reason: req(reason) }
  const e = (k: keyof typeof errs) => (tried ? errs[k] || undefined : undefined)
  const fmt = (v: string) => v.replace('T', ' ')
  const submit = () => { setTried(true); if (anyErr(errs)) return; onCreate({ scope, when: `${fmt(start)} – ${fmt(end)}${repeat !== 'Once' ? ` (${repeat.toLowerCase()})` : ''}`, reason, isNew: true }) }
  return (
    <Modal icon={<BellOff size={18} />} title="Add maintenance window" sub="Alerts in scope are muted, incidents are still recorded" onClose={onClose} footer={<Footer onClose={onClose} onSubmit={submit} label="Add window" />}>
      <FormGrid cols={2}>
        <Field label="Scope (asset or source)" required error={e('scope')} span={2}><Select value={scope} onChange={setScope} placeholder="Select…" options={[...assets.map(a => a.path), 'Oracle CRM (PRD)', 'Oracle ERP (PRD)', 'Snowflake Marketing']} /></Field>
        <Field label="Start (ICT)" required error={e('start')}><Input type="datetime-local" value={start} onChange={setStart} /></Field>
        <Field label="End (ICT)" required error={e('end')}><Input type="datetime-local" value={end} onChange={setEnd} /></Field>
        <Field label="Repeat"><Select value={repeat} onChange={setRepeat} options={['Once', 'Weekly', 'Monthly']} /></Field>
        <Field label="Reason" required error={e('reason')}><Input value={reason} onChange={setReason} placeholder="e.g. ERP upgrade" /></Field>
      </FormGrid>
    </Modal>
  )
}

/* ======================= Policy (ACC, CLS-01) ======================= */
export interface NewPolicy { id: string; title: string; version: string; status: string; effective: string; appliesTo: string; enforcement: string; isNew: true }
export function NewPolicyForm({ onClose, onCreate }: Close & { onCreate: (p: NewPolicy) => void }) {
  const { def } = useRole()
  const [title, setTitle] = useState(''); const [category, setCategory] = useState('Access'); const [statement, setStatement] = useState('')
  const [classes, setClasses] = useState<string[]>(['Confidential', 'Restricted']); const [pii, setPii] = useState<string[]>([]); const [doms, setDoms] = useState<string[]>([])
  const [enf, setEnf] = useState<string[]>(['Time-bound grant']); const [effective, setEffective] = useState(''); const [review, setReview] = useState('12 months')
  const [owner, setOwner] = useState(def.persona === 'pim' ? 'pim' : 'prasert'); const [ref, setRef] = useState(''); const [tried, setTried] = useState(false)
  const errs = { title: req(title), statement: req(statement) || (statement.length < 30 ? 'Be specific (≥ 30 characters)' : ''), effective: req(effective), scope: classes.length || pii.length || doms.length ? '' : 'Choose what the policy applies to' }
  const e = (k: keyof typeof errs) => (tried ? errs[k] || undefined : undefined)
  const submit = () => {
    setTried(true); if (anyErr(errs)) return
    onCreate({ id: `POL-${10 + Math.floor(Math.random() * 80)}`, title, version: 'v1.0', status: 'Candidate', effective: new Date(effective).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      appliesTo: [...classes, ...pii, ...doms].join(', '), enforcement: enf.join(', ') || '—', isNew: true })
  }
  return (
    <Modal size="lg" icon={<FileText size={18} />} title="New policy" sub="Draft → Council approval → synced to Lakehouse enforcement" onClose={onClose} footer={<Footer onClose={onClose} onSubmit={submit} label="Submit to Council" />}>
      <FormGrid cols={3}>
        <Field label="Policy title" required error={e('title')} span={2}><Input value={title} onChange={setTitle} placeholder="e.g. Sensitive Personal Data Export" autoFocus /></Field>
        <Field label="Category"><Select value={category} onChange={setCategory} options={['Access', 'Classification', 'Masking', 'Retention', 'Quality', 'AI usage']} /></Field>
        <Field label="Policy statement" required error={e('statement')} span={3}><TextArea rows={3} value={statement} onChange={setStatement} placeholder="Data classified Restricted may only be exported with DPO approval and must be masked…" /></Field>
      </FormGrid>
      <Section title="Applies to" desc={e('scope') ? undefined : 'any combination'}>
        {e('scope') && <div className="field-error">{e('scope')}</div>}
        <Field label="Classification levels"><Checks options={['Public', 'Internal', 'Confidential', 'Restricted']} value={classes} onChange={setClasses} /></Field>
        <Field label="PII tags"><Checks options={['pii_national_id', 'pii_contact', 'pii_financial', 'pii_sensitive_s26']} value={pii} onChange={setPii} /></Field>
        <Field label="Domains"><Checks options={domainNames} value={doms} onChange={setDoms} /></Field>
      </Section>
      <Section title="Enforcement & lifecycle">
        <Field label="Lakehouse enforcement (ACC-03)"><Checks options={['Tag sync', 'Masking policy by tag', 'Row filter', 'Time-bound grant', 'Block export', 'Manual (process only)']} value={enf} onChange={setEnf} /></Field>
        <FormGrid cols={3}>
          <Field label="Effective date" required error={e('effective')}><Input type="date" value={effective} onChange={setEffective} /></Field>
          <Field label="Review cycle"><Select value={review} onChange={setReview} options={['6 months', '12 months', '24 months']} /></Field>
          <Field label="Policy owner"><PersonSelect value={owner} onChange={setOwner} filter={t => /DPO|Council|Owner/.test(t)} /></Field>
          <Field label="Regulatory reference" span={3}><Input value={ref} onChange={setRef} placeholder="e.g. PDPA s.26, s.37 · CDMC C7" /></Field>
        </FormGrid>
      </Section>
    </Modal>
  )
}

/* ======================= Access review campaign (ACC-05) ======================= */
export interface NewReview { name: string; scope: string; reviewer: string; progress: string; due: string; isNew: true }
export function AccessReviewForm({ onClose, onCreate }: Close & { onCreate: (r: NewReview) => void }) {
  const [name, setName] = useState(''); const [domain, setDomain] = useState('All domains'); const [classes, setClasses] = useState<string[]>(['Restricted'])
  const [reviewer, setReviewer] = useState<'owner' | 'manager' | 'named'>('owner'); const [named, setNamed] = useState('')
  const [start, setStart] = useState(''); const [due, setDue] = useState(''); const [revoke, setRevoke] = useState(true); const [remind, setRemind] = useState('3')
  const [tried, setTried] = useState(false)
  const errs = { name: req(name), classes: req(classes), start: req(start), due: req(due) || (start && due <= start ? 'Due must be after start' : ''), named: reviewer === 'named' ? req(named) : '' }
  const e = (k: keyof typeof errs) => (tried ? errs[k] || undefined : undefined)
  const submit = () => {
    setTried(true); if (anyErr(errs)) return
    onCreate({ name, scope: `${domain} · ${classes.join(', ')}`, reviewer: reviewer === 'named' ? named : reviewer === 'owner' ? 'somchai' : 'kan', progress: '0%', due: new Date(due).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }), isNew: true })
  }
  return (
    <Modal icon={<ClipboardCheck size={18} />} title="New access review campaign" sub="Periodic recertification of grants (ACC-05)" onClose={onClose} footer={<Footer onClose={onClose} onSubmit={submit} label="Start campaign" />}>
      <FormGrid cols={2}>
        <Field label="Campaign name" required error={e('name')} span={2}><Input value={name} onChange={setName} placeholder="Q1 2027 Restricted data review" autoFocus /></Field>
        <Field label="Domain"><Select value={domain} onChange={setDomain} options={['All domains', ...domainNames]} /></Field>
        <Field label="Classification" required error={e('classes')}><Checks options={['Confidential', 'Restricted']} value={classes} onChange={setClasses} /></Field>
        <Field label="Reviewer" span={2}><Radio value={reviewer} onChange={setReviewer} options={[{ id: 'owner', label: 'Asset Data Owner' }, { id: 'manager', label: "Grantee's manager" }, { id: 'named', label: 'Named reviewer' }]} /></Field>
        {reviewer === 'named' && <Field label="Named reviewer" required error={e('named')} span={2}><PersonSelect value={named} onChange={setNamed} /></Field>}
        <Field label="Start" required error={e('start')}><Input type="date" value={start} onChange={setStart} /></Field>
        <Field label="Due" required error={e('due')}><Input type="date" value={due} onChange={setDue} /></Field>
        <Field label="Reminder every (days)"><Input value={remind} onChange={setRemind} inputMode="numeric" /></Field>
      </FormGrid>
      <Toggle checked={revoke} onChange={setRevoke} label="Auto-revoke grants not confirmed by the due date" sub="Revocation is pushed to the Lakehouse and audited" />
    </Modal>
  )
}

/* ======================= User & role assignment (NFR-01) ======================= */
export interface NewUser { id: string; name: string; email: string; dept: string; roles: RoleId[]; domains: string[]; mfa: boolean; expires: string; status: string; isNew: true }
export function InviteUserForm({ onClose, onCreate }: Close & { onCreate: (u: NewUser) => void }) {
  const [name, setName] = useState(''); const [email, setEmail] = useState(''); const [dept, setDept] = useState('')
  const [roles, setRoles] = useState<RoleId[]>(['consumer']); const [doms, setDoms] = useState<string[]>([]); const [expires, setExpires] = useState('')
  const [tried, setTried] = useState(false)
  const mfa = roles.includes('admin') || roles.includes('dpo')
  const errs = { name: req(name), email: req(email) || (/^[^@\s]+@[^@\s]+\.[a-z]{2,}$/i.test(email) ? '' : 'Enter a valid email'), roles: req(roles, 'Assign at least one role'),
    doms: roles.some(r => ['steward', 'owner'].includes(r)) && !doms.length ? 'Owner/Steward roles are scoped to a domain' : '' }
  const e = (k: keyof typeof errs) => (tried ? errs[k] || undefined : undefined)
  const submit = () => { setTried(true); if (anyErr(errs)) return; onCreate({ id: `u-${Date.now() % 10000}`, name, email, dept, roles, domains: doms, mfa, expires, status: 'Invited', isNew: true }) }
  return (
    <Modal size="lg" icon={<UserPlus size={18} />} title="Invite user" sub="Sign-in via OIDC / Keycloak — EDC never stores passwords (NFR-01)" onClose={onClose} footer={<Footer onClose={onClose} onSubmit={submit} label="Send invitation" />}>
      <FormGrid cols={3}>
        <Field label="Full name" required error={e('name')}><Input value={name} onChange={setName} autoFocus /></Field>
        <Field label="Work email" required error={e('email')}><Input value={email} onChange={setEmail} placeholder="name@company.co.th" /></Field>
        <Field label="Department"><Input value={dept} onChange={setDept} /></Field>
      </FormGrid>
      <Section title="Roles" desc="A person can hold several roles">
        {e('roles') && <div className="field-error">{e('roles')}</div>}
        <div className="grid g2" style={{ gap: 8 }}>
          {ROLES.map(r => {
            const on = roles.includes(r.id)
            return (
              <label key={r.id} className={`radio-card ${on ? 'on' : ''}`} style={{ cursor: 'pointer' }}>
                <input type="checkbox" checked={on} onChange={() => setRoles(rs => (on ? rs.filter(x => x !== r.id) : [...rs, r.id]))} style={{ marginTop: 2 }} />
                <span><b className="row" style={{ gap: 6 }}><i className="role-dot" style={{ background: r.color }} />{r.name}</b><span className="faint small" style={{ display: 'block' }}>{r.rights}</span></span>
              </label>
            )
          })}
        </div>
      </Section>
      <FormGrid cols={2}>
        <Field label="Domain scope" error={e('doms')} hint="Leave empty for organisation-wide roles"><Checks options={domainNames} value={doms} onChange={setDoms} /></Field>
        <Field label="Access expires" hint="Optional — for contractors"><Input type="date" value={expires} onChange={setExpires} /></Field>
      </FormGrid>
      <div className="row small" style={{ gap: 6 }}>{mfa ? <><AlertTriangle size={13} color="var(--warn)" />MFA will be enforced for this user (Admin / DPO role).</> : <span className="faint">MFA follows the IdP policy.</span>}</div>
    </Modal>
  )
}

export interface NewMapping { group: string; role: RoleId; domain: string; isNew: true }
export function GroupMappingForm({ onClose, onCreate }: Close & { onCreate: (m: NewMapping) => void }) {
  const [group, setGroup] = useState(''); const [role, setRole] = useState<RoleId>('consumer'); const [domain, setDomain] = useState('All domains'); const [tried, setTried] = useState(false)
  const errs = { group: req(group) }
  const submit = () => { setTried(true); if (anyErr(errs)) return; onCreate({ group, role, domain, isNew: true }) }
  return (
    <Modal icon={<Users size={18} />} title="Map IdP group to role" sub="Users in this Keycloak / AD group get the role at sign-in" onClose={onClose} footer={<Footer onClose={onClose} onSubmit={submit} label="Add mapping" />}>
      <FormGrid cols={3}>
        <Field label="IdP group / claim" required error={tried ? errs.group || undefined : undefined} span={3}><Input value={group} onChange={setGroup} placeholder="grp_finance_stewards" className="input w100 mono" autoFocus /></Field>
        <Field label="Role" span={2}><Select value={role} onChange={v => setRole(v as RoleId)} options={ROLES.map(r => [r.id, r.name] as [string, string])} /></Field>
        <Field label="Domain"><Select value={domain} onChange={setDomain} options={['All domains', ...domainNames]} /></Field>
      </FormGrid>
    </Modal>
  )
}

/* ======================= Metamodel attribute (CAT-03) ======================= */
export interface NewAttr { name: string; types: string; dtype: string; required: string; values: string; isNew: true }
export function NewAttributeForm({ onClose, onCreate }: Close & { onCreate: (a: NewAttr) => void }) {
  const [name, setName] = useState(''); const [types, setTypes] = useState<string[]>(['Dataset']); const [dtype, setDtype] = useState('Text')
  const [required, setRequired] = useState('No'); const [values, setValues] = useState<string[]>([]); const [help, setHelp] = useState(''); const [tried, setTried] = useState(false)
  const errs = { name: req(name), types: req(types), values: dtype === 'Enum' ? req(values, 'Enum needs allowed values') : '' }
  const e = (k: keyof typeof errs) => (tried ? errs[k] || undefined : undefined)
  const submit = () => { setTried(true); if (anyErr(errs)) return; onCreate({ name, types: types.join(', '), dtype, required, values: values.join(', '), isNew: true }) }
  return (
    <Modal icon={<Hash size={18} />} title="New custom attribute" sub="Metamodel change creates a new metamodel version (CAT-03)" onClose={onClose} footer={<Footer onClose={onClose} onSubmit={submit} label="Add attribute" />}>
      <FormGrid cols={2}>
        <Field label="Attribute name" required error={e('name')} span={2}><Input value={name} onChange={setName} placeholder="e.g. Source system owner team" autoFocus /></Field>
        <Field label="Asset types" required error={e('types')} span={2}><Checks options={['Dataset', 'Column', 'Report', 'Pipeline', 'Data Product', 'ML Model', 'File']} value={types} onChange={setTypes} /></Field>
        <Field label="Data type"><Select value={dtype} onChange={setDtype} options={['Text', 'Text ×2 (TH/EN)', 'Number', 'Date', 'Duration', 'Enum', 'Person', 'URL', 'Boolean']} /></Field>
        <Field label="Required"><Select value={required} onChange={setRequired} options={['No', 'Yes', 'Critical assets', 'If PII']} /></Field>
        {dtype === 'Enum' && <Field label="Allowed values" required error={e('values')} span={2}><TagInput value={values} onChange={setValues} /></Field>}
        <Field label="Help text" span={2}><Input value={help} onChange={setHelp} placeholder="Shown under the field on asset pages" /></Field>
      </FormGrid>
    </Modal>
  )
}

