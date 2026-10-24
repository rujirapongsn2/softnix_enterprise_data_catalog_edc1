// Mock metadata for the UI prototype. Shapes follow the PRD metamodel (CAT-01/02, CLS, DQ, LIN, WF)
// so a real API can replace this module later without changing page components.

export type Classification = 'Public' | 'Internal' | 'Confidential' | 'Restricted'
export type Lifecycle = 'Draft' | 'In Review' | 'Certified' | 'Deprecated'
export type AssetType = 'Table' | 'View' | 'Column' | 'Report' | 'Pipeline' | 'Data Product' | 'ML Model' | 'File'
export type Layer = 'Source' | 'Bronze' | 'Silver' | 'Gold' | 'Report'

export interface Person { id: string; name: string; title: string; color: string }

export const people: Record<string, Person> = {
  somchai: { id: 'somchai', name: 'Somchai Wongsakul', title: 'Head of Customer Analytics', color: '#2786c2' },
  nida: { id: 'nida', name: 'Nida Charoenpong', title: 'Data Steward · Customer', color: '#1e6a9a' },
  arthit: { id: 'arthit', name: 'Arthit Phromma', title: 'Data Engineer', color: '#778da9' },
  pim: { id: 'pim', name: 'Pimchanok S.', title: 'DPO / Privacy Officer', color: '#dc2626' },
  kan: { id: 'kan', name: 'Kanokwan T.', title: 'Finance Data Owner', color: '#7e9a1f' },
  ton: { id: 'ton', name: 'Thanawat K.', title: 'Data Analyst', color: '#f3903f' },
  mai: { id: 'mai', name: 'Maitree L.', title: 'Data Steward · Finance', color: '#1b263b' },
  prasert: { id: 'prasert', name: 'Prasert J.', title: 'Chair · Data Governance Council', color: '#6f8a12' },
  suda: { id: 'suda', name: 'Suda A.', title: 'Internal Auditor', color: '#415a77' },
  wichai: { id: 'wichai', name: 'Wichai R.', title: 'EDC Platform Admin', color: '#0d1b2a' },
}

export const currentUser = { name: 'Nida Charoenpong', role: 'Data Steward', initials: 'NC', color: '#1e6a9a' }

export interface Asset {
  id: string
  name: string
  path: string
  type: AssetType
  source: string
  sourceKind: 'Iceberg' | 'Oracle' | 'PostgreSQL' | 'Snowflake' | 'Power BI' | 'Spark' | 'SQL Server'
  layer: Layer
  businessName: { en: string; th: string }
  description: string
  domain: string
  owner?: string
  steward?: string
  classification: Classification
  pii: 'None' | 'Personal' | 'Sensitive'
  lifecycle: Lifecycle
  authoritative?: boolean
  critical?: boolean
  dq?: number
  freshness: string
  freshnessOk: boolean
  rows?: string
  size?: string
  rating: number
  ratings: number
  followers: number
  usage: number
  tags: string[]
  terms: string[]
  updated: string
  aiDraft?: boolean
}

export const assets: Asset[] = [
  {
    id: 'gold-customer-360', name: 'customer_360', path: 'lakehouse.gold.customer_360', type: 'Table', source: 'Lakehouse · Iceberg', sourceKind: 'Iceberg', layer: 'Gold',
    businessName: { en: 'Customer 360', th: 'ข้อมูลลูกค้าแบบรวมศูนย์' },
    description: 'One row per active customer, combining CRM profile, contract, billing and channel activity. Used as the authoritative source for customer analytics, churn models and regulatory reporting. Refreshed daily at 02:00 from silver.crm_customer and silver.contract.',
    domain: 'Customer', owner: 'somchai', steward: 'nida', classification: 'Confidential', pii: 'Sensitive', lifecycle: 'Certified', authoritative: true, critical: true,
    dq: 96.4, freshness: '3 h ago', freshnessOk: true, rows: '4.82M', size: '1.9 GB', rating: 4.6, ratings: 23, followers: 41, usage: 1820,
    tags: ['customer', 'kyc', 'daily'], terms: ['Customer', 'Active Customer', 'Customer Segment'], updated: 'Oct 9, 2026 02:14',
  },
  {
    id: 'silver-crm-customer', name: 'crm_customer', path: 'lakehouse.silver.crm_customer', type: 'Table', source: 'Lakehouse · Iceberg', sourceKind: 'Iceberg', layer: 'Silver',
    businessName: { en: 'CRM Customer (cleansed)', th: 'ลูกค้าจาก CRM (ผ่านการทำความสะอาด)' },
    description: 'Cleansed and de-duplicated customer master from CRM. Thai national ID validated with checksum; phone numbers normalised to E.164.',
    domain: 'Customer', owner: 'somchai', steward: 'nida', classification: 'Restricted', pii: 'Sensitive', lifecycle: 'Certified', critical: true,
    dq: 93.1, freshness: '4 h ago', freshnessOk: true, rows: '5.10M', size: '2.4 GB', rating: 4.2, ratings: 9, followers: 18, usage: 640,
    tags: ['crm', 'pii'], terms: ['Customer', 'National ID'], updated: 'Oct 9, 2026 01:40',
  },
  {
    id: 'silver-contract', name: 'contract', path: 'lakehouse.silver.contract', type: 'Table', source: 'Lakehouse · Iceberg', sourceKind: 'Iceberg', layer: 'Silver',
    businessName: { en: 'Contract', th: 'สัญญา' },
    description: 'Active and historical customer contracts with product, start/end dates and status.',
    domain: 'Sales', owner: 'kan', steward: 'mai', classification: 'Confidential', pii: 'Personal', lifecycle: 'In Review', critical: true,
    dq: 88.7, freshness: '5 h ago', freshnessOk: true, rows: '12.3M', size: '3.1 GB', rating: 4.0, ratings: 5, followers: 9, usage: 410,
    tags: ['contract'], terms: ['Contract', 'Contract Status'], updated: 'Oct 9, 2026 01:52',
  },
  {
    id: 'bronze-crm-customer-raw', name: 'crm_customer_raw', path: 'lakehouse.bronze.crm_customer_raw', type: 'Table', source: 'Lakehouse · Iceberg', sourceKind: 'Iceberg', layer: 'Bronze',
    businessName: { en: 'CRM Customer (raw)', th: 'ลูกค้าจาก CRM (ข้อมูลดิบ)' },
    description: 'Raw CDC landing of CRM.CUSTOMER. Not for analytics use.',
    domain: 'Customer', owner: 'somchai', steward: 'nida', classification: 'Restricted', pii: 'Sensitive', lifecycle: 'Draft',
    dq: 71.2, freshness: '40 min ago', freshnessOk: true, rows: '5.31M', size: '2.9 GB', rating: 0, ratings: 0, followers: 3, usage: 35,
    tags: ['raw', 'cdc'], terms: [], updated: 'Oct 9, 2026 04:20',
  },
  {
    id: 'oracle-crm-customer', name: 'CRM.CUSTOMER', path: 'oracle-crm-prd.CRM.CUSTOMER', type: 'Table', source: 'Oracle CRM (PRD)', sourceKind: 'Oracle', layer: 'Source',
    businessName: { en: 'CRM Customer (source)', th: 'ลูกค้าในระบบ CRM ต้นทาง' },
    description: 'Operational CRM customer table. Harvested via remote harvester agent behind firewall.',
    domain: 'Customer', owner: 'somchai', classification: 'Restricted', pii: 'Sensitive', lifecycle: 'Draft',
    freshness: 'live', freshnessOk: true, rows: '5.31M', rating: 0, ratings: 0, followers: 1, usage: 0,
    tags: ['source-system'], terms: [], updated: 'Oct 8, 2026 23:00',
  },
  {
    id: 'oracle-billing', name: 'BILLING.INVOICE', path: 'oracle-erp-prd.BILLING.INVOICE', type: 'Table', source: 'Oracle ERP (PRD)', sourceKind: 'Oracle', layer: 'Source',
    businessName: { en: 'Invoice (source)', th: 'ใบแจ้งหนี้ต้นทาง' },
    description: 'ERP invoice header.', domain: 'Finance', owner: 'kan', classification: 'Confidential', pii: 'None', lifecycle: 'Draft',
    freshness: 'live', freshnessOk: true, rows: '88.2M', rating: 0, ratings: 0, followers: 0, usage: 0, tags: [], terms: [], updated: 'Oct 8, 2026 23:00',
  },
  {
    id: 'silver-billing', name: 'billing_monthly', path: 'lakehouse.silver.billing_monthly', type: 'Table', source: 'Lakehouse · Iceberg', sourceKind: 'Iceberg', layer: 'Silver',
    businessName: { en: 'Monthly Billing', th: 'ยอดเรียกเก็บรายเดือน' },
    description: 'Invoice amounts aggregated per customer per month.',
    domain: 'Finance', owner: 'kan', steward: 'mai', classification: 'Confidential', pii: 'None', lifecycle: 'Certified', critical: true,
    dq: 61.5, freshness: '2 d ago', freshnessOk: false, rows: '58.0M', size: '6.7 GB', rating: 3.7, ratings: 6, followers: 12, usage: 520,
    tags: ['billing', 'monthly'], terms: ['Revenue', 'Billing Cycle'], updated: 'Oct 7, 2026 03:05',
  },
  {
    id: 'gold-churn-features', name: 'churn_features', path: 'lakehouse.gold.churn_features', type: 'Table', source: 'Lakehouse · Iceberg', sourceKind: 'Iceberg', layer: 'Gold',
    businessName: { en: 'Churn Feature Set', th: 'ชุดฟีเจอร์ทำนายการเลิกใช้บริการ' },
    description: 'ML feature table for churn propensity model.', domain: 'Customer', owner: 'somchai', steward: 'nida', classification: 'Internal', pii: 'Personal', lifecycle: 'In Review',
    dq: 91.0, freshness: '3 h ago', freshnessOk: true, rows: '4.82M', size: '0.8 GB', rating: 4.4, ratings: 4, followers: 7, usage: 210,
    tags: ['ml', 'feature-store'], terms: ['Churn'], updated: 'Oct 9, 2026 02:40', aiDraft: true,
  },
  {
    id: 'report-churn', name: 'Customer Churn Dashboard', path: 'powerbi.Customer Analytics.Customer Churn Dashboard', type: 'Report', source: 'Power BI', sourceKind: 'Power BI', layer: 'Report',
    businessName: { en: 'Customer Churn Dashboard', th: 'แดชบอร์ดการเลิกใช้บริการของลูกค้า' },
    description: 'Executive churn dashboard by segment and region.', domain: 'Customer', owner: 'somchai', classification: 'Internal', pii: 'None', lifecycle: 'Certified',
    freshness: '3 h ago', freshnessOk: true, rating: 4.8, ratings: 31, followers: 64, usage: 2900, tags: ['executive'], terms: ['Churn', 'Customer Segment'], updated: 'Oct 9, 2026 06:00',
  },
  {
    id: 'report-revenue', name: 'Revenue by Segment', path: 'powerbi.Finance.Revenue by Segment', type: 'Report', source: 'Power BI', sourceKind: 'Power BI', layer: 'Report',
    businessName: { en: 'Revenue by Segment', th: 'รายได้ตามกลุ่มลูกค้า' },
    description: 'Monthly revenue split by customer segment.', domain: 'Finance', owner: 'kan', classification: 'Confidential', pii: 'None', lifecycle: 'Certified',
    freshness: '2 d ago', freshnessOk: false, rating: 4.1, ratings: 12, followers: 22, usage: 980, tags: ['finance'], terms: ['Revenue', 'Customer Segment'], updated: 'Oct 7, 2026 06:00',
  },
  {
    id: 'snow-web-events', name: 'WEB_EVENTS', path: 'snowflake.MARKETING.PUBLIC.WEB_EVENTS', type: 'Table', source: 'Snowflake', sourceKind: 'Snowflake', layer: 'Source',
    businessName: { en: 'Website Events', th: 'เหตุการณ์บนเว็บไซต์' },
    description: 'Clickstream events from public website.', domain: 'Marketing', classification: 'Internal', pii: 'Personal', lifecycle: 'Draft',
    freshness: '15 min ago', freshnessOk: true, rows: '1.2B', rating: 0, ratings: 0, followers: 2, usage: 95, tags: ['clickstream'], terms: [], updated: 'Oct 9, 2026 09:45', aiDraft: true,
  },
  {
    id: 'hr-employee', name: 'employee', path: 'lakehouse.silver.hr_employee', type: 'Table', source: 'Lakehouse · Iceberg', sourceKind: 'Iceberg', layer: 'Silver',
    businessName: { en: 'Employee', th: 'พนักงาน' },
    description: '', domain: 'HR', classification: 'Restricted', pii: 'Sensitive', lifecycle: 'Draft',
    dq: 84.0, freshness: '1 d ago', freshnessOk: true, rows: '8,420', rating: 0, ratings: 0, followers: 0, usage: 12, tags: [], terms: [], updated: 'Oct 8, 2026 03:00',
  },
  {
    id: 'pipe-customer-360', name: 'build_customer_360', path: 'spark.jobs.build_customer_360', type: 'Pipeline', source: 'Spark (OpenLineage)', sourceKind: 'Spark', layer: 'Gold',
    businessName: { en: 'Build Customer 360', th: 'งานสร้าง Customer 360' },
    description: 'Daily Spark job that joins cleansed CRM and contract into customer_360.', domain: 'Customer', owner: 'somchai', steward: 'arthit', classification: 'Internal', pii: 'None', lifecycle: 'Certified',
    freshness: 'run 3 h ago', freshnessOk: true, rating: 0, ratings: 0, followers: 4, usage: 0, tags: ['spark', 'daily'], terms: [], updated: 'Oct 9, 2026 02:14',
  },
]

export const assetById = (id: string) => assets.find(a => a.id === id)

export interface Column {
  name: string
  type: string
  businessName: string
  description: string
  term?: string
  cls: Classification
  pii?: string
  piiState?: 'confirmed' | 'suggested'
  cde?: boolean
  nulls: number
  distinct: number
  dq?: number
  pattern?: string
  aiDraft?: boolean
  pk?: boolean
}

export const customer360Columns: Column[] = [
  { name: 'customer_id', type: 'bigint', businessName: 'Customer ID', description: 'Surrogate key of the customer.', term: 'Customer', cls: 'Internal', cde: true, nulls: 0, distinct: 100, dq: 100, pk: true },
  { name: 'national_id', type: 'string', businessName: 'Thai National ID', description: '13-digit Thai citizen ID, checksum-validated.', term: 'National ID', cls: 'Restricted', pii: 'Thai National ID', piiState: 'confirmed', cde: true, nulls: 0.4, distinct: 99.6, dq: 99.1, pattern: 'N-NNNN-NNNNN-NN-N' },
  { name: 'first_name_th', type: 'string', businessName: 'First Name (TH)', description: 'Customer first name in Thai.', term: 'Customer Name', cls: 'Confidential', pii: 'Person Name', piiState: 'confirmed', nulls: 0.1, distinct: 41, dq: 99.8 },
  { name: 'last_name_th', type: 'string', businessName: 'Last Name (TH)', description: 'Customer last name in Thai.', term: 'Customer Name', cls: 'Confidential', pii: 'Person Name', piiState: 'confirmed', nulls: 0.1, distinct: 63, dq: 99.8 },
  { name: 'mobile_no', type: 'string', businessName: 'Mobile Number', description: 'Primary mobile number in E.164 format.', term: 'Contact Phone', cls: 'Confidential', pii: 'Phone Number', piiState: 'confirmed', nulls: 3.2, distinct: 95, dq: 96.8, pattern: '+66NNNNNNNNN' },
  { name: 'email', type: 'string', businessName: 'Email', description: 'Primary contact email.', term: 'Contact Email', cls: 'Confidential', pii: 'Email', piiState: 'confirmed', nulls: 18.5, distinct: 81, dq: 81.5 },
  { name: 'religion', type: 'string', businessName: 'Religion', description: '', cls: 'Restricted', pii: 'Sensitive (PDPA s.26)', piiState: 'suggested', nulls: 62, distinct: 0.1, aiDraft: true },
  { name: 'birth_date', type: 'date', businessName: 'Date of Birth', description: 'Customer date of birth.', cls: 'Confidential', pii: 'Date of Birth', piiState: 'confirmed', nulls: 1.4, distinct: 7.2, dq: 98.6 },
  { name: 'segment', type: 'string', businessName: 'Customer Segment', description: 'Value-based segment: Platinum, Gold, Silver, Mass.', term: 'Customer Segment', cls: 'Internal', cde: true, nulls: 0, distinct: 0.01, dq: 100 },
  { name: 'province_code', type: 'string', businessName: 'Province Code', description: 'Province code per Thai government code list.', term: 'Province', cls: 'Internal', nulls: 0.6, distinct: 0.002, dq: 99.4 },
  { name: 'customer_since', type: 'date', businessName: 'Customer Since', description: 'Date of first contract.', cls: 'Internal', nulls: 0, distinct: 4.1, dq: 100 },
  { name: 'active_contracts', type: 'int', businessName: 'Active Contracts', description: 'Count of contracts with status ACTIVE.', term: 'Active Customer', cls: 'Internal', cde: true, nulls: 0, distinct: 0.0004, dq: 100 },
  { name: 'monthly_revenue', type: 'decimal(18,2)', businessName: 'Monthly Revenue', description: 'Average billed amount over last 3 months, THB.', term: 'Revenue', cls: 'Confidential', cde: true, nulls: 0.9, distinct: 72, dq: 97.2 },
  { name: 'churn_score', type: 'double', businessName: '', description: 'Propensity of the customer to churn in next 90 days, from churn model v4.', cls: 'Internal', nulls: 0, distinct: 88, aiDraft: true },
  { name: 'last_channel', type: 'string', businessName: 'Last Contact Channel', description: '', cls: 'Internal', nulls: 7.7, distinct: 0.0001 },
]

export interface DQRule { id: string; name: string; column: string; dimension: string; threshold: number; score: number; severity: 'High' | 'Medium' | 'Low'; gx: string; trend: number[] }

export const dqRules: DQRule[] = [
  { id: 'r1', name: 'National ID is 13 digits with valid checksum', column: 'national_id', dimension: 'Validity', threshold: 99, score: 99.1, severity: 'High', gx: 'expect_column_values_to_match_regex', trend: [98.9, 99.0, 99.1, 99.0, 99.2, 99.1, 99.1] },
  { id: 'r2', name: 'Customer ID is unique', column: 'customer_id', dimension: 'Uniqueness', threshold: 100, score: 100, severity: 'High', gx: 'expect_column_values_to_be_unique', trend: [100, 100, 100, 100, 100, 100, 100] },
  { id: 'r3', name: 'Email populated for digital customers', column: 'email', dimension: 'Completeness', threshold: 90, score: 81.5, severity: 'Medium', gx: 'expect_column_values_to_not_be_null', trend: [86, 85.4, 84.1, 83.0, 82.2, 81.9, 81.5] },
  { id: 'r4', name: 'Mobile number in E.164 format', column: 'mobile_no', dimension: 'Validity', threshold: 95, score: 96.8, severity: 'Medium', gx: 'expect_column_values_to_match_regex', trend: [95.1, 95.6, 96.0, 96.3, 96.5, 96.8, 96.8] },
  { id: 'r5', name: 'Segment in allowed code list', column: 'segment', dimension: 'Consistency', threshold: 100, score: 100, severity: 'Low', gx: 'expect_column_values_to_be_in_set', trend: [100, 100, 100, 100, 100, 100, 100] },
  { id: 'r6', name: 'Table refreshed within 26 hours', column: '(table)', dimension: 'Timeliness', threshold: 100, score: 100, severity: 'High', gx: 'freshness SLA', trend: [100, 100, 85, 100, 100, 100, 100] },
  { id: 'r7', name: 'Monthly revenue is non-negative', column: 'monthly_revenue', dimension: 'Accuracy', threshold: 99.5, score: 97.2, severity: 'High', gx: 'expect_column_values_to_be_between', trend: [99.8, 99.7, 99.6, 98.9, 98.0, 97.5, 97.2] },
]

export const dqTrend = [94.1, 94.8, 95.2, 95.0, 95.9, 96.2, 95.7, 96.0, 96.6, 96.1, 96.3, 96.4]

export interface Term {
  id: string; en: string; th: string; parent?: string; domain: string; status: 'Draft' | 'Candidate' | 'Approved' | 'Retired'
  definition: string; synonyms: string[]; abbrev?: string; steward: string; formula?: string; related: string[]; linked: number; kpi?: boolean
}

export const terms: Term[] = [
  { id: 'customer', en: 'Customer', th: 'ลูกค้า', domain: 'Customer', status: 'Approved', definition: 'A person or juristic entity that has, or has had, at least one contract with the organisation.', synonyms: ['Client', 'ผู้ใช้บริการ'], steward: 'nida', related: ['contract', 'customer-segment'], linked: 37 },
  { id: 'active-customer', en: 'Active Customer', th: 'ลูกค้าที่ยังใช้งาน', parent: 'customer', domain: 'Customer', status: 'Approved', definition: 'A customer with at least one contract in ACTIVE status on the reporting date.', synonyms: ['Live Customer'], steward: 'nida', formula: 'COUNT(DISTINCT customer_id) WHERE active_contracts > 0', related: ['contract-status'], linked: 12, kpi: true },
  { id: 'customer-segment', en: 'Customer Segment', th: 'กลุ่มลูกค้า', parent: 'customer', domain: 'Customer', status: 'Approved', definition: 'Value-based grouping of customers: Platinum, Gold, Silver, Mass. Recomputed monthly.', synonyms: ['Tier'], steward: 'nida', related: ['revenue'], linked: 9 },
  { id: 'national-id', en: 'National ID', th: 'เลขประจำตัวประชาชน', parent: 'customer', domain: 'Customer', status: 'Approved', definition: '13-digit identification number issued by the Department of Provincial Administration.', synonyms: ['Citizen ID', 'เลขบัตรประชาชน'], abbrev: 'NID', steward: 'nida', related: [], linked: 8 },
  { id: 'churn', en: 'Churn', th: 'การเลิกใช้บริการ', domain: 'Customer', status: 'Candidate', definition: 'A customer whose last active contract ended and who has no new contract within 90 days.', synonyms: ['Attrition'], steward: 'nida', formula: 'churned_customers / active_customers_at_start', related: ['active-customer'], linked: 5, kpi: true },
  { id: 'contract', en: 'Contract', th: 'สัญญา', domain: 'Sales', status: 'Approved', definition: 'A legally binding service agreement between the organisation and a customer.', synonyms: [], steward: 'mai', related: ['customer'], linked: 14 },
  { id: 'contract-status', en: 'Contract Status', th: 'สถานะสัญญา', parent: 'contract', domain: 'Sales', status: 'Approved', definition: 'Lifecycle state of a contract: PENDING, ACTIVE, SUSPENDED, TERMINATED.', synonyms: [], steward: 'mai', related: [], linked: 6 },
  { id: 'revenue', en: 'Revenue', th: 'รายได้', domain: 'Finance', status: 'Approved', definition: 'Billed amount excluding VAT, recognised in the billing month.', synonyms: ['Billed Revenue'], steward: 'mai', formula: 'SUM(invoice_amount_ex_vat)', related: ['billing-cycle'], linked: 21, kpi: true },
  { id: 'billing-cycle', en: 'Billing Cycle', th: 'รอบการเรียกเก็บเงิน', parent: 'revenue', domain: 'Finance', status: 'Draft', definition: 'The recurring period for which a customer is invoiced.', synonyms: [], steward: 'mai', related: [], linked: 3 },
  { id: 'arpu', en: 'ARPU', th: 'รายได้เฉลี่ยต่อผู้ใช้', parent: 'revenue', domain: 'Finance', status: 'Retired', definition: 'Replaced by "Revenue per Active Customer".', synonyms: [], steward: 'mai', related: ['revenue'], linked: 0, kpi: true },
]

export interface Task {
  id: string; kind: 'Access Request' | 'Certification' | 'Glossary Approval' | 'Change Request' | 'Data Issue' | 'PII Review'
  title: string; asset?: string; requester: string; created: string; due: string; overdue?: boolean; step: number; steps: string[]; detail: string; priority: 'High' | 'Medium' | 'Low'
}

export const tasks: Task[] = [
  { id: 'AR-1042', kind: 'Access Request', title: 'Read access to customer_360', asset: 'gold-customer-360', requester: 'ton', created: 'Oct 8, 2026', due: 'Oct 10, 2026', step: 1, steps: ['Submitted', 'Owner', 'DPO', 'Granted in Lakehouse'], detail: 'Purpose: Q4 churn deep-dive for Marketing campaign targeting. Duration: 90 days. Columns: all except national_id.', priority: 'High' },
  { id: 'CR-0311', kind: 'Change Request', title: 'Update definition of "Active Customer"', requester: 'ton', created: 'Oct 7, 2026', due: 'Oct 9, 2026', overdue: true, step: 1, steps: ['Submitted', 'Steward', 'Owner'], detail: 'Proposed: include customers with SUSPENDED contracts in the last 30 days.', priority: 'Medium' },
  { id: 'CE-0088', kind: 'Certification', title: 'Certify contract', asset: 'silver-contract', requester: 'arthit', created: 'Oct 6, 2026', due: 'Oct 13, 2026', step: 2, steps: ['Draft', 'In Review', 'Owner approval', 'Certified'], detail: 'Completeness check: Owner ✓ Steward ✓ Description ✓ Classification ✓', priority: 'Medium' },
  { id: 'PII-552', kind: 'PII Review', title: '14 PII suggestions in lakehouse.silver.hr_employee', asset: 'hr-employee', requester: 'system', created: 'Oct 9, 2026', due: 'Oct 16, 2026', step: 0, steps: ['Detected', 'Steward review', 'Synced to Lakehouse'], detail: 'Auto-classification run #2291 found 14 candidate PII columns.', priority: 'High' },
  { id: 'DI-0207', kind: 'Data Issue', title: 'billing_monthly late for 2 days', asset: 'silver-billing', requester: 'system', created: 'Oct 8, 2026', due: 'Oct 9, 2026', overdue: true, step: 1, steps: ['Reported', 'Assigned', 'Root cause', 'Corrective action', 'Closed'], detail: 'Freshness SLA 26h breached. Upstream BILLING.INVOICE harvest returned 0 rows on Oct 7.', priority: 'High' },
  { id: 'GL-0140', kind: 'Glossary Approval', title: 'Approve term "Churn"', requester: 'nida', created: 'Oct 5, 2026', due: 'Oct 12, 2026', step: 1, steps: ['Draft', 'Candidate', 'Approved'], detail: 'Candidate term submitted with KPI formula.', priority: 'Low' },
]

export interface PiiSuggestion { id: string; asset: string; column: string; detected: string; confidence: number; method: 'Rule' | 'Regex' | 'ML' | 'LLM'; evidence: string; sample: string; cls: Classification; sensitive?: boolean }

export const piiSuggestions: PiiSuggestion[] = [
  { id: 'p1', asset: 'lakehouse.silver.hr_employee', column: 'citizen_no', detected: 'Thai National ID', confidence: 99, method: 'Regex', evidence: '100% of sampled values match 13-digit pattern with valid checksum', sample: '1-1037-0•••••-••-•', cls: 'Restricted' },
  { id: 'p2', asset: 'lakehouse.silver.hr_employee', column: 'blood_group', detected: 'Health data (PDPA s.26)', confidence: 92, method: 'LLM', evidence: 'Column name and values A/B/AB/O indicate health information, classified as sensitive under s.26', sample: 'A, O, B, AB', cls: 'Restricted', sensitive: true },
  { id: 'p3', asset: 'lakehouse.silver.hr_employee', column: 'emp_tel', detected: 'Phone Number', confidence: 97, method: 'Regex', evidence: '96% of samples match Thai mobile pattern 0[689]XXXXXXXX', sample: '08•-•••-••12', cls: 'Confidential' },
  { id: 'p4', asset: 'lakehouse.silver.hr_employee', column: 'bank_acc', detected: 'Bank Account No.', confidence: 88, method: 'ML', evidence: '10-digit numeric with bank code prefix patterns', sample: '•••-•-•••45-6', cls: 'Restricted' },
  { id: 'p5', asset: 'lakehouse.gold.customer_360', column: 'religion', detected: 'Religious belief (PDPA s.26)', confidence: 95, method: 'LLM', evidence: 'Column name "religion"; values: Buddhism, Islam, Christianity…', sample: 'พุทธ, อิสลาม, …', cls: 'Restricted', sensitive: true },
  { id: 'p6', asset: 'snowflake.MARKETING.PUBLIC.WEB_EVENTS', column: 'client_ip', detected: 'IP Address', confidence: 81, method: 'Regex', evidence: 'IPv4 pattern in 99% of samples', sample: '203.150.•••.•••', cls: 'Confidential' },
  { id: 'p7', asset: 'snowflake.MARKETING.PUBLIC.WEB_EVENTS', column: 'user_agent', detected: 'Not PII', confidence: 64, method: 'LLM', evidence: 'Browser user-agent strings; low re-identification risk on its own', sample: 'Mozilla/5.0 (…)', cls: 'Internal' },
]

export interface Connector {
  id: string; name: string; kind: string; group: 'Lakehouse' | 'Database' | 'Cloud' | 'Storage' | 'BI' | 'Other'; status: 'Healthy' | 'Warning' | 'Failed' | 'Running' | 'Queued'
  assets: number; lastRun: string; schedule: string; agent?: boolean; lineage?: boolean
  // set by the Add source form
  conn?: string; secret?: string; include?: string; exclude?: string; profiling?: string; domain?: string; owner?: string; steward?: string; tags?: string[]; pii?: string; env?: string; createdBy?: string; isNew?: boolean
}

export const connectors: Connector[] = [
  { id: 'c1', name: 'Lakehouse Iceberg REST catalog', kind: 'Iceberg', group: 'Lakehouse', status: 'Healthy', assets: 18420, lastRun: '22 min ago · incremental · 4m 12s', schedule: 'Every 1 h + DDL events', lineage: true },
  { id: 'c2', name: 'Spark OpenLineage endpoint', kind: 'OpenLineage', group: 'Lakehouse', status: 'Running', assets: 1204, lastRun: 'streaming · 3,812 events today', schedule: 'Push (real-time)', lineage: true },
  { id: 'c3', name: 'Trino query log & profiling', kind: 'Trino', group: 'Lakehouse', status: 'Healthy', assets: 0, lastRun: '1 h ago · 412 tables profiled', schedule: 'Nightly 01:00–05:00 (resource group: edc_low)' },
  { id: 'c4', name: 'Great Expectations results', kind: 'GX', group: 'Lakehouse', status: 'Healthy', assets: 0, lastRun: '35 min ago · 1,930 validations', schedule: 'Push via API' },
  { id: 'c5', name: 'Oracle CRM (PRD)', kind: 'Oracle', group: 'Database', status: 'Warning', assets: 2310, lastRun: '6 h ago · 3 tables skipped (permission)', schedule: 'Daily 23:00', agent: true },
  { id: 'c6', name: 'Oracle ERP (PRD)', kind: 'Oracle', group: 'Database', status: 'Failed', assets: 5120, lastRun: '2 d ago · ORA-12170 connect timeout', schedule: 'Daily 23:00', agent: true },
  { id: 'c7', name: 'Snowflake Marketing', kind: 'Snowflake', group: 'Cloud', status: 'Healthy', assets: 860, lastRun: '3 h ago', schedule: 'Every 6 h', lineage: true },
  { id: 'c8', name: 'Power BI Service', kind: 'Power BI', group: 'BI', status: 'Healthy', assets: 342, lastRun: '5 h ago', schedule: 'Daily 06:00', lineage: true },
]

export const domains = [
  { id: 'customer', name: 'Customer', th: 'ลูกค้า', owner: 'somchai', assets: 1240, certified: 62, coverage: 91, products: 3, color: '#2786c2' },
  { id: 'finance', name: 'Finance', th: 'การเงิน', owner: 'kan', assets: 2180, certified: 48, coverage: 74, products: 2, color: '#a9cb2e' },
  { id: 'sales', name: 'Sales', th: 'การขาย', owner: 'kan', assets: 980, certified: 35, coverage: 66, products: 1, color: '#f3903f' },
  { id: 'hr', name: 'HR', th: 'บุคคล', owner: 'kan', assets: 410, certified: 12, coverage: 38, products: 0, color: '#fdc70c' },
  { id: 'marketing', name: 'Marketing', th: 'การตลาด', owner: 'somchai', assets: 1530, certified: 18, coverage: 44, products: 1, color: '#778da9' },
  { id: 'operations', name: 'Operations', th: 'ปฏิบัติการ', owner: 'kan', assets: 3020, certified: 27, coverage: 57, products: 1, color: '#1b263b' },
]

export const dataProducts = [
  { id: 'dp1', name: 'Customer 360', domain: 'Customer', owner: 'somchai', sla: 'Daily by 06:00 · 99.5%', assets: 6, consumers: 14, desc: 'Unified customer profile, segment and churn score for analytics and campaigns.', certified: true, rating: 4.7 },
  { id: 'dp2', name: 'Monthly Revenue Mart', domain: 'Finance', owner: 'kan', sla: 'Monthly, BD+2', assets: 9, consumers: 8, desc: 'Billed revenue by customer, product and segment, reconciled with GL.', certified: true, rating: 4.2 },
  { id: 'dp3', name: 'Churn Signals', domain: 'Customer', owner: 'somchai', sla: 'Daily by 07:00', assets: 4, consumers: 3, desc: 'Feature set and scores for churn propensity model v4.', certified: false, rating: 4.4 },
  { id: 'dp4', name: 'Digital Engagement', domain: 'Marketing', owner: 'somchai', sla: 'Hourly', assets: 5, consumers: 5, desc: 'Sessionised web and app events joined to customer.', certified: false, rating: 3.9 },
]

export interface AuditEvent { when: string; who: string; action: string; target: string; from?: string; to?: string; via?: string }

export const auditEvents: AuditEvent[] = [
  { when: 'Oct 9, 2026 09:12', who: 'nida', action: 'Accepted AI suggestion', target: 'customer_360.churn_score · description', via: 'Ask Softnix · gpt-oss-120b (on-prem) · prompt v3' },
  { when: 'Oct 9, 2026 02:14', who: 'system', action: 'Schema change detected', target: 'customer_360', from: '14 columns', to: '15 columns (+ last_channel string)' },
  { when: 'Oct 8, 2026 16:40', who: 'pim', action: 'Confirmed PII tag', target: 'customer_360.birth_date', to: 'Date of Birth · Confidential' },
  { when: 'Oct 8, 2026 11:05', who: 'somchai', action: 'Approved access request', target: 'AR-1031 · Thanawat K.', to: 'SELECT 90 days → granted in Lakehouse (role: rq_ar1031)' },
  { when: 'Oct 6, 2026 10:22', who: 'somchai', action: 'Certified asset', target: 'customer_360', from: 'In Review', to: 'Certified · Authoritative Source' },
  { when: 'Oct 4, 2026 14:31', who: 'nida', action: 'Changed classification', target: 'customer_360', from: 'Internal', to: 'Confidential' },
  { when: 'Oct 2, 2026 09:00', who: 'nida', action: 'Linked glossary term', target: 'customer_360.segment', to: 'Customer Segment' },
]

export const comments = [
  { who: 'ton', when: '2 days ago', rating: 5, text: 'Our go-to table for churn analysis. Joins cleanly with billing_monthly on customer_id.', replies: [{ who: 'nida', when: '2 days ago', text: 'Thanks! Note monthly_revenue is a 3-month average — use billing_monthly for exact figures.' }] },
  { who: 'arthit', when: '1 week ago', rating: 4, text: 'Q: is last_channel populated for customers acquired before 2020?', replies: [{ who: 'nida', when: '6 days ago', text: 'Only from 2021 onwards. Added a note to the column description.' }] },
]

export const accessGrants = [
  { principal: 'grp_customer_analytics', kind: 'Group', privilege: 'SELECT', masked: 'national_id, mobile_no', expires: '—', via: 'Policy: Confidential default' },
  { principal: 'Thanawat K.', kind: 'User', privilege: 'SELECT', masked: 'national_id', expires: 'Jan 6, 2027', via: 'AR-1031' },
  { principal: 'svc_churn_model', kind: 'Service', privilege: 'SELECT', masked: '—', expires: '—', via: 'Data Product: Churn Signals' },
  { principal: 'grp_data_engineering', kind: 'Group', privilege: 'ALL', masked: '—', expires: '—', via: 'Custodian role' },
]
