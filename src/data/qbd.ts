// QbD mock data (PRD v1.1: CTR data contracts, SLO/error budget, certification gate, observability, quality KPIs)

export type ChangeKind = 'breaking' | 'non-breaking' | 'none'
export interface ContractField { name: string; expected: string; actual: string; required: boolean; cls: string; rule?: string; change: ChangeKind; note?: string }

export const contract = {
  id: 'CTR-CUST-360',
  standard: 'ODCS v3.0',
  version: '2.3.0',
  status: 'Violated' as 'Compliant' | 'Violated',
  product: 'Customer 360',
  asset: 'lakehouse.gold.customer_360',
  owner: 'somchai',
  steward: 'nida',
  lastCheck: 'Oct 13, 2026 06:12',
  enforcement: 'GX suite gx_customer_360_v2_3 · gate at Silver→Gold (quarantine on fail)',
  semantics: 'One row per active customer (glossary: Customer, Active Customer). Grain: customer_id.',
  sla: [
    { k: 'Freshness', target: '≤ 26 h (daily by 06:00)', actual: '4 h', ok: true },
    { k: 'Completeness (CDE)', target: '≥ 99%', actual: '99.6%', ok: true },
    { k: 'Volume', target: '±10% of 30-day median', actual: '+2.1%', ok: true },
    { k: 'DQ score', target: '≥ 95', actual: '96.4', ok: true },
    { k: 'Availability', target: '99.5% / 30 d', actual: '99.8%', ok: true },
  ],
}

export const contractFields: ContractField[] = [
  { name: 'customer_id', expected: 'bigint · PK', actual: 'bigint · PK', required: true, cls: 'Internal', rule: 'unique, not null', change: 'none' },
  { name: 'national_id', expected: 'string(13)', actual: 'string(13)', required: true, cls: 'Restricted', rule: 'regex + checksum ≥ 99%', change: 'none' },
  { name: 'segment', expected: "enum[Platinum,Gold,Silver,Mass]", actual: 'string', required: true, cls: 'Internal', rule: 'in set', change: 'breaking', note: 'Type widened from enum to free string; value "VIP" seen in 0.3% rows' },
  { name: 'monthly_revenue', expected: 'decimal(18,2) ≥ 0', actual: 'decimal(18,2)', required: true, cls: 'Confidential', rule: 'between 0 and 10M ≥ 99.5%', change: 'none' },
  { name: 'email', expected: 'string · nullable', actual: 'string · nullable', required: false, cls: 'Confidential', rule: 'not null ≥ 90% (digital)', change: 'none' },
  { name: 'active_contracts', expected: 'int', actual: 'int', required: true, cls: 'Internal', rule: '≥ 0', change: 'none' },
  { name: 'last_channel', expected: '—', actual: 'string · nullable', required: false, cls: 'Internal', change: 'non-breaking', note: 'New nullable column, not yet in contract' },
  { name: 'churn_flag', expected: 'boolean', actual: '— (dropped)', required: false, cls: 'Internal', change: 'breaking', note: 'Column removed upstream; used by 2 consumers' },
]

export const contractVersions = [
  { v: '2.3.0', date: 'Sep 30, 2026', by: 'nida', kind: 'minor', note: 'Add DQ rule: monthly_revenue ≥ 0; freshness 26 h', approvals: 'Producer ✓ · 3/3 consumers ✓' },
  { v: '2.2.0', date: 'Aug 14, 2026', by: 'arthit', kind: 'minor', note: 'Add optional column birth_date (Confidential)', approvals: 'Producer ✓ · 3/3 consumers ✓' },
  { v: '2.0.0', date: 'Jun 2, 2026', by: 'somchai', kind: 'major', note: 'Grain changed to active customers only (breaking)', approvals: 'Producer ✓ · 5/5 consumers ✓' },
]

export const contractDiff = [
  { sign: '+', text: 'quality: monthly_revenue  expect_column_values_to_be_between(min=0)' },
  { sign: '-', text: 'sla.freshness: 30h' },
  { sign: '+', text: 'sla.freshness: 26h' },
]

export const consumers = [
  { name: 'Customer Churn Dashboard', kind: 'Power BI', owner: 'ton', subscribed: true, impacted: true },
  { name: 'Churn model v4 features', kind: 'ML Model', owner: 'arthit', subscribed: true, impacted: true },
  { name: 'Regulatory customer report (BOT)', kind: 'Report', owner: 'kan', subscribed: true, impacted: false },
  { name: 'Marketing campaign audience', kind: 'Pipeline', owner: 'somchai', subscribed: false, impacted: false },
]

export interface Slo { k: string; target: string; att30: number; met: boolean }
export const productSlos: Record<string, { slos: Slo[]; budgetLeft: number }> = {
  dp1: { budgetLeft: 72, slos: [
    { k: 'Freshness', target: '06:00', att30: 99.7, met: true }, { k: 'Completeness', target: '99%', att30: 99.6, met: true },
    { k: 'Volume', target: '±10%', att30: 100, met: true }, { k: 'DQ', target: '≥95', att30: 98.1, met: true }, { k: 'Avail.', target: '99.5%', att30: 99.8, met: true }] },
  dp2: { budgetLeft: 18, slos: [
    { k: 'Freshness', target: 'BD+2', att30: 90.0, met: false }, { k: 'Completeness', target: '99.5%', att30: 99.7, met: true },
    { k: 'Volume', target: '±5%', att30: 100, met: true }, { k: 'DQ', target: '≥97', att30: 96.2, met: false }, { k: 'Avail.', target: '99.5%', att30: 99.9, met: true }] },
  dp3: { budgetLeft: 55, slos: [
    { k: 'Freshness', target: '07:00', att30: 99.0, met: true }, { k: 'Completeness', target: '98%', att30: 98.9, met: true },
    { k: 'Volume', target: '±15%', att30: 96.7, met: true }, { k: 'DQ', target: '≥90', att30: 93.4, met: true }, { k: 'Avail.', target: '99%', att30: 99.5, met: true }] },
  dp4: { budgetLeft: 0, slos: [
    { k: 'Freshness', target: '1 h', att30: 97.1, met: false }, { k: 'Completeness', target: '95%', att30: 96.0, met: true },
    { k: 'Volume', target: '±20%', att30: 86.7, met: false }, { k: 'DQ', target: '≥90', att30: 91.2, met: true }, { k: 'Avail.', target: '99%', att30: 99.2, met: true }] },
}

export const certChecks = [
  { k: 'Owner and Steward assigned (CAT-05)', pass: true, detail: 'Owner: Somchai W. · Steward: Nida C.' },
  { k: 'Metadata completeness rule (CAT-06)', pass: true, detail: 'Description, classification, glossary terms 14/14 fields' },
  { k: 'Naming standard (GLO-06)', pass: true, detail: '0 violations in 22 columns' },
  { k: 'DQ score ≥ domain threshold (90)', pass: false, detail: 'Score 88.7 · 3 of last 7 runs below threshold' },
  { k: 'CDE rule coverage = 100%', pass: true, detail: '6/6 critical data elements have ≥ 1 rule' },
  { k: 'Data contract compliant (CTR-03)', pass: false, detail: '1 open breaking change: status enum widened' },
  { k: 'SLO met over last 30 days', pass: true, detail: 'Freshness 99.4% · Availability 99.9%' },
  { k: 'PII classification confirmed (CLS-03)', pass: true, detail: '4/4 PII columns confirmed by Steward' },
]

export type Sev = 'Critical' | 'High' | 'Medium' | 'Low'
export const incidents = [
  { id: 'INC-0931', at: 'Oct 13 · 06:12', type: 'Schema', sev: 'High' as Sev, asset: 'lakehouse.gold.customer_360', title: 'Breaking schema change vs contract CTR-CUST-360 (churn_flag dropped)', state: 'Open', routed: 'Nida C. (Steward) · #dq-customer', dedup: 1, detected: '4 min after run' },
  { id: 'INC-0930', at: 'Oct 13 · 02:40', type: 'Volume', sev: 'Medium' as Sev, asset: 'snowflake.MARKETING.PUBLIC.WEB_EVENTS', title: 'Row count −38% vs 30-day median (expected 4.1M, got 2.5M)', state: 'Acknowledged', routed: 'Somchai W. (Owner) · email', dedup: 6, detected: '9 min' },
  { id: 'INC-0928', at: 'Oct 12 · 23:05', type: 'Pipeline', sev: 'Critical' as Sev, asset: 'spark job: billing_monthly_build', title: 'OpenLineage RunEvent FAIL · 3 consecutive runs', state: 'Open', routed: 'On-call Data Eng (Arthit P.) · LINE + PagerDuty', dedup: 3, detected: '1 min' },
  { id: 'INC-0925', at: 'Oct 12 · 14:20', type: 'Distribution', sev: 'Medium' as Sev, asset: 'lakehouse.gold.customer_360.monthly_revenue', title: 'Mean shifted +27% (PSI 0.31) after ERP backfill', state: 'Resolved', routed: 'Maitree L. (Steward Finance)', dedup: 1, detected: '35 min' },
  { id: 'INC-0921', at: 'Oct 11 · 06:00', type: 'Freshness', sev: 'High' as Sev, asset: 'lakehouse.silver.billing_monthly', title: 'Freshness SLO breached (26 h) · auto-created DI-0207', state: 'Open', routed: 'Maitree L. · Teams', dedup: 4, detected: '0 min' },
  { id: 'INC-0917', at: 'Oct 10 · 03:10', type: 'Volume', sev: 'Low' as Sev, asset: 'lakehouse.silver.contract', title: 'Row count +12% (within maintenance window, muted)', state: 'Muted', routed: '—', dedup: 1, detected: '—' },
]
export const volumeSeries = [4.0, 4.2, 4.1, 4.3, 4.1, 4.2, 4.4, 4.1, 4.2, 4.3, 4.0, 4.2, 4.1, 2.5]
export const pipelineHealth = [
  { job: 'customer_360_build', runs: 30, success: 30, p95: '14m', last: 'OK · 02:14' },
  { job: 'billing_monthly_build', runs: 30, success: 26, p95: '41m', last: 'FAIL · 23:05' },
  { job: 'web_events_ingest', runs: 720, success: 716, p95: '3m', last: 'OK · 09:50' },
  { job: 'contract_cdc', runs: 1440, success: 1440, p95: '40s', last: 'OK · 09:55' },
]

export const alertRules = [
  { id: 'AL-01', scope: 'Domain: Customer', trigger: 'Contract violation (breaking)', sev: 'High', route: 'Steward → Owner after 4 h', channel: 'Teams #dq-customer, Email', dedup: '1 per asset / 6 h', on: true },
  { id: 'AL-02', scope: 'All Gold assets', trigger: 'Pipeline run FAIL (OpenLineage)', sev: 'Critical', route: 'On-call Data Eng', channel: 'LINE, PagerDuty', dedup: '1 per job / 1 h', on: true },
  { id: 'AL-03', scope: 'Certified assets', trigger: 'DQ score < threshold', sev: 'High', route: 'Steward, auto Data Issue', channel: 'Email, In-app', dedup: '1 per rule / 24 h', on: true },
  { id: 'AL-04', scope: 'All', trigger: 'Volume anomaly (> 3σ)', sev: 'Medium', route: 'Owner', channel: 'Email digest 08:00', dedup: 'Digest', on: true },
  { id: 'AL-05', scope: 'Domain: Marketing', trigger: 'Distribution drift (PSI > 0.25)', sev: 'Medium', route: 'Steward', channel: 'In-app', dedup: '1 per column / 24 h', on: false },
]
export const maintenanceWindows = [
  { scope: 'lakehouse.silver.contract', when: 'Sat 01:00–05:00 (weekly)', reason: 'CDC replay / compaction' },
  { scope: 'Oracle ERP (PRD)', when: 'Oct 18, 22:00 – Oct 19, 06:00', reason: 'ERP upgrade' },
]

export const qualityKpis = [
  { k: 'DQ rule coverage · CDE', v: 87, target: 90, unit: '%', trend: [61, 68, 74, 80, 84, 87] },
  { k: 'Data products meeting SLO', v: 75, target: 90, unit: '%', trend: [50, 55, 60, 70, 75, 75] },
  { k: 'MTTD (detect)', v: 18, target: 30, unit: ' min', lower: true, trend: [95, 70, 52, 40, 25, 18] },
  { k: 'MTTR (resolve)', v: 2.4, target: 2, unit: ' days', lower: true, trend: [6.1, 5.0, 4.2, 3.3, 2.9, 2.4] },
  { k: 'Issues with root cause', v: 82, target: 80, unit: '%', trend: [40, 52, 63, 70, 77, 82] },
  { k: 'Contract violations (30 d)', v: 7, target: 5, unit: '', lower: true, trend: [19, 16, 12, 10, 9, 7] },
]
export const domainQuality = [
  { d: 'Customer', cov: 96, slo: '3/3', mttd: 12, mttr: 1.6, viol: 2, review: 'Oct 6 · done' },
  { d: 'Finance', cov: 91, slo: '1/2', mttd: 22, mttr: 3.1, viol: 3, review: 'Oct 8 · done' },
  { d: 'Sales', cov: 78, slo: '1/1', mttd: 25, mttr: 2.2, viol: 1, review: 'Oct 15 · scheduled' },
  { d: 'Marketing', cov: 64, slo: '0/1', mttd: 31, mttr: 4.0, viol: 1, review: 'Oct 16 · scheduled' },
  { d: 'Operations', cov: 82, slo: '1/1', mttd: 14, mttr: 1.9, viol: 0, review: 'Oct 20 · scheduled' },
]
