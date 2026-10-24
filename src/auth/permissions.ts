// Central role → capability matrix for the EDC1 prototype.
// Roles follow PRD v1.1 §3 (DAMA-DMBOK2). Every nav item, page guard and gated button reads from here,
// so changing a cell below changes the UI and the Roles & Permissions page at the same time.

export type RoleId = 'consumer' | 'steward' | 'owner' | 'custodian' | 'dpo' | 'council' | 'auditor' | 'admin'
export type Level = 'full' | 'view' | 'none'

export interface RoleDef {
  id: RoleId
  name: string
  th: string
  persona: string // person id in data/mock.ts
  duty: string // PRD §3 "หน้าที่"
  rights: string // PRD §3 "สิทธิ์หลักใน EDC"
  color: string
}

export const ROLES: RoleDef[] = [
  { id: 'consumer', name: 'Data Consumer', th: 'ผู้ใช้ข้อมูล', persona: 'ton', color: '#f3903f',
    duty: 'Analyst, data scientist or business user who uses data for an approved purpose',
    rights: 'Search, view details, request access, report issues, rate and comment' },
  { id: 'steward', name: 'Data Steward', th: 'ผู้ดูแลข้อมูล', persona: 'nida', color: '#1e6a9a',
    duty: 'Looks after the meaning and quality of data day to day',
    rights: 'Edit business metadata, maintain the glossary, confirm classification, manage data issues' },
  { id: 'owner', name: 'Data Owner', th: 'เจ้าของข้อมูล', persona: 'somchai', color: '#2786c2',
    duty: 'Business executive accountable for the data in a domain',
    rights: 'Approve access requests, certify assets, approve change requests' },
  { id: 'custodian', name: 'Data Custodian / Engineer', th: 'ผู้ดูแลเชิงเทคนิค', persona: 'arthit', color: '#778da9',
    duty: 'Runs the data technically on the Lakehouse',
    rights: 'Technical metadata, connector setup, lineage and impact' },
  { id: 'dpo', name: 'DPO / Privacy Officer', th: 'เจ้าหน้าที่คุ้มครองข้อมูลส่วนบุคคล', persona: 'pim', color: '#dc2626',
    duty: 'Oversees PDPA compliance',
    rights: 'PII inventory, approve sensitive-data access, export RoPA evidence' },
  { id: 'council', name: 'Data Governance Council', th: 'คณะกรรมการธรรมาภิบาลข้อมูล', persona: 'prasert', color: '#6f8a12',
    duty: 'Sets policy and standards; settles cross-domain disputes',
    rights: 'Approve classification scheme, policies and enterprise glossary; governance dashboard' },
  { id: 'auditor', name: 'Auditor', th: 'ผู้ตรวจสอบ', persona: 'suda', color: '#415a77',
    duty: 'Checks compliance with policy',
    rights: 'Read-only: audit trail and approval history' },
  { id: 'admin', name: 'Platform Admin', th: 'ผู้ดูแลระบบ', persona: 'wichai', color: '#0d1b2a',
    duty: 'Operates the EDC platform',
    rights: 'Users, roles, SSO, connectors, metamodel, backup' },
]

export const roleById = (id: RoleId) => ROLES.find(r => r.id === id)!

export interface Fn { id: string; group: string; label: string; kind: 'page' | 'action'; where?: string; prd?: string; levels: Record<RoleId, Level> }

// Column order for the compact codes below:  consumer, steward, owner, custodian, dpo, council, auditor, admin
// F = full (can use / change)   V = view only   - = no access (hidden or locked)
const ORDER: RoleId[] = ['consumer', 'steward', 'owner', 'custodian', 'dpo', 'council', 'auditor', 'admin']
const L = (code: string): Record<RoleId, Level> => {
  const c = code.replace(/\s/g, '')
  if (c.length !== 8) throw new Error(`permission code must have 8 cells: ${code}`)
  return Object.fromEntries(ORDER.map((r, i) => [r, c[i] === 'F' ? 'full' : c[i] === 'V' ? 'view' : 'none'])) as Record<RoleId, Level>
}

//                                                                                                       C S O Cu D G A Ad
const RAW: [string, string, string, 'page' | 'action', string, string, string][] = [
  // ---- Pages (nav items) ----
  ['page.home', 'Discover', 'Home', 'page', '/', 'AUD-02', 'F F F F F F F F'],
  ['page.search', 'Discover', 'Search', 'page', '/search', 'SRC', 'F F F F F F F F'],
  ['page.asset', 'Discover', 'Asset detail', 'page', '/asset/:id', 'CAT', 'F F F F F F V F'],
  ['page.glossary', 'Discover', 'Business Glossary', 'page', '/glossary', 'GLO', 'V F F V V F V V'],
  ['page.domains', 'Discover', 'Domains & Products', 'page', '/domains', 'CAT-09', 'V F F F V F V V'],
  ['page.inbox', 'Govern', 'My Tasks', 'page', '/inbox', 'WF', 'F F F F F F V V'],
  ['page.privacy', 'Govern', 'Privacy & PDPA', 'page', '/privacy', 'CLS', '- F V V F V V -'],
  ['page.quality', 'Govern', 'Data Quality', 'page', '/quality', 'DQ', 'V F F F V V V V'],
  ['page.observability', 'Govern', 'Observability', 'page', '/observability', 'OBS', 'V F F F - V V F'],
  ['page.alerts', 'Govern', 'Alert Settings', 'page', '/alerts', 'OBS-04', '- F F F - - V F'],
  ['page.access', 'Govern', 'Policies & Access', 'page', '/access', 'ACC', 'V F F V F F V F'],
  ['page.dashboard', 'Govern', 'Governance Dashboard', 'page', '/dashboard', 'AUD-02', '- V V V V F V V'],
  ['page.sources', 'Administration', 'Sources & Harvest', 'page', '/sources', 'HRV', '- V - F - - V F'],
  ['page.audit', 'Administration', 'Audit Trail', 'page', '/audit', 'AUD', '- V V V V V F F'],
  ['page.settings', 'Administration', 'Settings', 'page', '/settings', 'AI/MCP/CAT-03', '- - - V - - V F'],
  ['page.roles', 'Administration', 'Roles & Permissions', 'page', '/roles', 'NFR-01', 'V V V V V V V F'],

  // ---- Actions ----
  ['asset.requestAccess', 'Asset', 'Request access', 'action', 'Asset header · Access tab', 'ACC-01', 'F F F F F F - F'],
  ['asset.reportIssue', 'Asset', 'Report data issue', 'action', 'Asset header', 'DQ-05', 'F F F F F F - F'],
  ['asset.comment', 'Asset', 'Comment, rate, Q&A', 'action', 'Asset · Discussion', 'CAT-08', 'F F F F F F - F'],
  ['asset.editBusiness', 'Asset', 'Edit business metadata, terms, tags, AI drafts', 'action', 'Asset · Overview / Columns', 'CAT-02, AI-02', '- F F - - - - -'],
  ['asset.confirmPii', 'Asset', 'Confirm / reject PII & classification', 'action', 'Asset · Columns · Privacy queue', 'CLS-03', '- F - - F - - -'],
  ['contract.propose', 'Asset', 'Propose data contract version', 'action', 'Asset · Contract tab', 'CTR-02', '- F F F - - - -'],

  ['glossary.create', 'Glossary', 'Create glossary term', 'action', 'Glossary · New term', 'GLO-01', '- F F - - F - -'],
  ['glossary.propose', 'Glossary', 'Propose change to a term', 'action', 'Glossary · Propose change', 'WF-02', 'F F F F F F - -'],
  ['glossary.approve', 'Glossary', 'Approve term', 'action', 'Glossary · Approve', 'WF-02', '- - F - - F - -'],
  ['glossary.import', 'Glossary', 'Import from Excel', 'action', 'Glossary', 'GLO', '- F - - - F - -'],

  ['product.create', 'Domains', 'Create data product', 'action', 'Domains · New data product', 'CAT-09', '- F F - - - - -'],

  ['task.decide', 'Workflow', 'Approve / reject tasks', 'action', 'My Tasks', 'WF-01', '- F F F F F - -'],

  ['privacy.scan', 'Privacy', 'Run PII scan', 'action', 'Privacy & PDPA · Add source', 'CLS-02', '- F - F F - - F'],
  ['privacy.export', 'Privacy', 'Export RoPA input', 'action', 'Privacy & PDPA', 'CLS-06', '- - - - F - F -'],

  ['dq.ruleCreate', 'Quality', 'Create DQ rule', 'action', 'Data Quality · Asset DQ tab', 'DQ-01', '- F F F - - - -'],
  ['dq.import', 'Quality', 'Import GX suite', 'action', 'Data Quality', 'DQ-02', '- F - F - - - -'],
  ['incident.ack', 'Quality', 'Acknowledge incident', 'action', 'Observability', 'OBS', '- F F F - - - F'],
  ['alert.ruleCreate', 'Quality', 'Create alert rule', 'action', 'Alert Settings', 'OBS-04', '- F F F - - - F'],
  ['alert.maintenance', 'Quality', 'Add maintenance window', 'action', 'Alert Settings', 'OBS-04', '- - - F - - - F'],

  ['policy.create', 'Policies', 'Draft policy', 'action', 'Policies & Access', 'ACC', '- - - - F F - -'],
  ['policy.approve', 'Policies', 'Approve policy & classification scheme', 'action', 'Policies & Access', 'CLS-01', '- - - - - F - -'],
  ['review.create', 'Policies', 'Start access review campaign', 'action', 'Policies & Access · Access reviews', 'ACC-05', '- - F - F F - -'],
  ['dashboard.export', 'Policies', 'Export governance report', 'action', 'Governance Dashboard', 'AUD-02', '- - F - F F F -'],

  ['source.create', 'Administration', 'Add source / connector', 'action', 'Sources & Harvest · Add source', 'HRV-08, HRV-10', '- - - F - - - F'],
  ['source.run', 'Administration', 'Run harvest, test & configure source', 'action', 'Sources & Harvest', 'HRV-02', '- - - F - - - F'],
  ['audit.export', 'Administration', 'Export audit trail', 'action', 'Audit Trail', 'AUD', '- - - - F - F F'],
  ['settings.edit', 'Administration', 'Change AI, MCP, metamodel settings', 'action', 'Settings', 'AI-09, CAT-03', '- - - - - - - F'],
  ['user.manage', 'Administration', 'Invite users, assign roles, map IdP groups', 'action', 'Roles & Permissions · Users', 'NFR-01', '- - - - - - - F'],
]

export const FUNCTIONS: Fn[] = RAW.map(([id, group, label, kind, where, prd, code]) => ({ id, group, label, kind, where, prd, levels: L(code) }))
const byId = new Map(FUNCTIONS.map(f => [f.id, f]))

export type Cap = string

export function levelOf(role: RoleId, cap: Cap): Level {
  const f = byId.get(cap)
  if (!f) { console.warn('Unknown capability', cap); return 'none' }
  return f.levels[role]
}

/** Roles that may fully use a capability (for "ask a … to do this" hints). */
export function rolesWith(cap: Cap, min: Level = 'full'): RoleDef[] {
  const f = byId.get(cap)
  if (!f) return []
  return ROLES.filter(r => (min === 'full' ? f.levels[r.id] === 'full' : f.levels[r.id] !== 'none'))
}

export const pageCapForPath = (path: string): Cap | undefined => {
  if (path === '/') return 'page.home'
  const seg = '/' + path.split('/')[1]
  const map: Record<string, Cap> = {
    '/search': 'page.search', '/asset': 'page.asset', '/glossary': 'page.glossary', '/domains': 'page.domains', '/inbox': 'page.inbox',
    '/privacy': 'page.privacy', '/quality': 'page.quality', '/observability': 'page.observability', '/alerts': 'page.alerts',
    '/access': 'page.access', '/dashboard': 'page.dashboard', '/sources': 'page.sources', '/audit': 'page.audit', '/settings': 'page.settings', '/roles': 'page.roles',
  }
  return map[seg]
}
