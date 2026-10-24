import { useMemo, useState } from 'react'
import { PlugZap, Loader2, CheckCircle2, XCircle, ShieldCheck, Server, Sparkles, AlertTriangle, ArrowLeft, ArrowRight, Info } from 'lucide-react'
import type { Connector } from '../data/mock'
import { domains, people } from '../data/mock'
import { Modal, Field, FormGrid, Input, Select, Secret, Toggle, Checks, Radio, TagInput, PersonSelect, WizardSteps, Section, ReviewList, req, anyErr, TextArea } from '../components/form'
import { ClsBadge } from '../components/ui'
import { useRole } from '../auth/role'

/* ---------- Source type catalogue (PRD HRV-01, HRV-07, HRV-10, HRV-12) ---------- */
type FType = 'text' | 'number' | 'select' | 'secret' | 'secretArea' | 'toggle' | 'textarea'
interface FDef { k: string; label: string; t: FType; ph?: string; opts?: string[]; def?: string; req?: boolean; span?: 1 | 2 | 3; hint?: string; cred?: boolean }
interface SType { id: string; name: string; group: Connector['group']; badge: string; color: string; desc: string; lineage?: boolean; fields: FDef[]; schemas: string[]; scopeLabel: string; include: string }

const jdbcCreds = (user = 'edc_reader'): FDef[] => [
  { k: 'auth', label: 'Authentication', t: 'select', opts: ['Username & password', 'Kerberos', 'Vault dynamic secret'], def: 'Username & password', cred: true },
  { k: 'user', label: 'Username', t: 'text', ph: user, req: true, cred: true, hint: 'Read-only metadata account (no data write privileges)' },
  { k: 'password', label: 'Password', t: 'secret', req: true, cred: true },
]

const TYPES: SType[] = [
  { id: 'iceberg', name: 'Iceberg REST catalog', group: 'Lakehouse', badge: 'ICE', color: '#2786c2', desc: 'Lakehouse metastore · schema evolution, snapshots', lineage: true, scopeLabel: 'Namespaces', include: 'lakehouse.(bronze|silver|gold).*',
    schemas: ['bronze', 'silver', 'gold', 'sandbox', 'tmp'],
    fields: [
      { k: 'uri', label: 'Catalog URI', t: 'text', ph: 'https://lakehouse.internal/iceberg/v1', req: true, span: 2 },
      { k: 'warehouse', label: 'Warehouse', t: 'text', ph: 's3a://lake/', req: true },
      { k: 'catalog', label: 'Catalog name', t: 'text', ph: 'lakehouse', def: 'lakehouse' },
      { k: 'auth', label: 'Authentication', t: 'select', opts: ['OAuth2 client credentials', 'Bearer token', 'None (mTLS only)'], def: 'OAuth2 client credentials', cred: true },
      { k: 'clientId', label: 'Client ID', t: 'text', ph: 'edc-harvester', req: true, cred: true },
      { k: 'secret', label: 'Client secret', t: 'secret', req: true, cred: true },
    ] },
  { id: 'hive', name: 'Hive Metastore', group: 'Lakehouse', badge: 'HMS', color: '#f3903f', desc: 'Thrift metastore for Hive / Spark tables', scopeLabel: 'Databases', include: '(dwh|staging).*',
    schemas: ['default', 'dwh', 'staging', 'archive'],
    fields: [
      { k: 'uri', label: 'Metastore URI', t: 'text', ph: 'thrift://hms.internal:9083', req: true, span: 2 },
      { k: 'auth', label: 'Authentication', t: 'select', opts: ['Kerberos', 'None'], def: 'Kerberos', cred: true },
      { k: 'principal', label: 'Kerberos principal', t: 'text', ph: 'edc/harvester@CORP.LOCAL', cred: true },
      { k: 'keytab', label: 'Keytab (base64)', t: 'secretArea', cred: true, span: 2 },
    ] },
  { id: 'trino', name: 'Trino', group: 'Lakehouse', badge: 'TR', color: '#1e6a9a', desc: 'Query log, profiling and sample queries', lineage: true, scopeLabel: 'Catalogs', include: 'lakehouse.*',
    schemas: ['lakehouse', 'system', 'oracle_crm'],
    fields: [
      { k: 'host', label: 'Coordinator host', t: 'text', ph: 'trino.internal', req: true },
      { k: 'port', label: 'Port', t: 'number', def: '8443', req: true },
      { k: 'resource', label: 'Resource group', t: 'text', def: 'edc_low', hint: 'Keeps profiling off the production queue (HRV-06)' },
      ...jdbcCreds('svc_edc'),
    ] },
  { id: 'postgres', name: 'PostgreSQL', group: 'Database', badge: 'PG', color: '#336791', desc: 'Schemas, tables, views, columns, constraints', scopeLabel: 'Schemas', include: 'public.*, sales.*',
    schemas: ['public', 'sales', 'crm', 'audit', 'pg_catalog'],
    fields: [
      { k: 'host', label: 'Host', t: 'text', ph: 'pg-prd.internal', req: true },
      { k: 'port', label: 'Port', t: 'number', def: '5432', req: true },
      { k: 'db', label: 'Database', t: 'text', ph: 'salesdb', req: true },
      { k: 'ssl', label: 'SSL mode', t: 'select', opts: ['verify-full', 'require', 'prefer', 'disable'], def: 'verify-full' },
      ...jdbcCreds(),
    ] },
  { id: 'mysql', name: 'MySQL / MariaDB', group: 'Database', badge: 'MY', color: '#00758f', desc: 'Databases, tables, views, columns', scopeLabel: 'Databases', include: 'shop.*',
    schemas: ['shop', 'inventory', 'mysql', 'information_schema'],
    fields: [
      { k: 'host', label: 'Host', t: 'text', ph: 'mysql-prd.internal', req: true },
      { k: 'port', label: 'Port', t: 'number', def: '3306', req: true },
      { k: 'ssl', label: 'TLS', t: 'select', opts: ['Required', 'Preferred', 'Disabled'], def: 'Required' },
      ...jdbcCreds(),
    ] },
  { id: 'oracle', name: 'Oracle', group: 'Database', badge: 'ORA', color: '#c74634', desc: 'Schemas, tables, views, synonyms, comments', scopeLabel: 'Schemas', include: 'CRM.*, BILLING.*',
    schemas: ['CRM', 'BILLING', 'HR', 'SYS', 'SYSTEM'],
    fields: [
      { k: 'host', label: 'Host', t: 'text', ph: 'crm-prd.internal', req: true },
      { k: 'port', label: 'Port', t: 'number', def: '1521', req: true },
      { k: 'service', label: 'Service name / SID', t: 'text', ph: 'CRM', req: true },
      { k: 'wallet', label: 'Use Oracle Wallet (TCPS)', t: 'toggle' },
      ...jdbcCreds('EDC_READER'),
    ] },
  { id: 'mssql', name: 'SQL Server', group: 'Database', badge: 'MS', color: '#a91d22', desc: 'Databases, schemas, tables, views', scopeLabel: 'Schemas', include: 'dbo.*',
    schemas: ['dbo', 'finance', 'staging', 'sys'],
    fields: [
      { k: 'host', label: 'Host', t: 'text', ph: 'sql-erp.internal', req: true },
      { k: 'port', label: 'Port', t: 'number', def: '1433', req: true },
      { k: 'db', label: 'Database', t: 'text', ph: 'ERP', req: true },
      { k: 'encrypt', label: 'Encrypt connection', t: 'select', opts: ['Strict', 'Mandatory', 'Optional'], def: 'Mandatory' },
      { k: 'auth', label: 'Authentication', t: 'select', opts: ['SQL login', 'Windows (Kerberos)', 'Entra ID service principal'], def: 'SQL login', cred: true },
      { k: 'user', label: 'Username', t: 'text', ph: 'edc_reader', req: true, cred: true },
      { k: 'password', label: 'Password', t: 'secret', req: true, cred: true },
    ] },
  { id: 'snowflake', name: 'Snowflake', group: 'Cloud', badge: 'SF', color: '#29b5e8', desc: 'Databases, schemas, tables, access history', lineage: true, scopeLabel: 'Databases.Schemas', include: 'MARKETING.PUBLIC.*',
    schemas: ['MARKETING.PUBLIC', 'MARKETING.STAGE', 'SNOWFLAKE.ACCOUNT_USAGE'],
    fields: [
      { k: 'account', label: 'Account identifier', t: 'text', ph: 'xy12345.ap-southeast-1', req: true },
      { k: 'warehouse', label: 'Warehouse', t: 'text', ph: 'EDC_WH', req: true },
      { k: 'role', label: 'Role', t: 'text', ph: 'EDC_METADATA_READER', req: true },
      { k: 'user', label: 'User', t: 'text', ph: 'SVC_EDC', req: true, cred: true },
      { k: 'key', label: 'Private key (PEM, key-pair auth)', t: 'secretArea', req: true, cred: true, span: 2 },
    ] },
  { id: 'bigquery', name: 'BigQuery', group: 'Cloud', badge: 'BQ', color: '#4285f4', desc: 'Projects, datasets, tables, job lineage', lineage: true, scopeLabel: 'Datasets', include: 'analytics.*',
    schemas: ['analytics', 'raw_events', 'ml_features'],
    fields: [
      { k: 'project', label: 'Project ID', t: 'text', ph: 'corp-analytics-prd', req: true },
      { k: 'location', label: 'Location', t: 'select', opts: ['asia-southeast1', 'asia-southeast2', 'US', 'EU'], def: 'asia-southeast1' },
      { k: 'sa', label: 'Service account key (JSON)', t: 'secretArea', req: true, cred: true, span: 2 },
    ] },
  { id: 'databricks', name: 'Databricks (Unity Catalog)', group: 'Cloud', badge: 'DB', color: '#ff3621', desc: 'Catalogs, schemas, tables, notebooks, lineage', lineage: true, scopeLabel: 'Catalogs.Schemas', include: 'main.*',
    schemas: ['main.default', 'main.finance', 'hive_metastore.default'],
    fields: [
      { k: 'host', label: 'Workspace URL', t: 'text', ph: 'https://adb-123.azuredatabricks.net', req: true, span: 2 },
      { k: 'http', label: 'SQL warehouse HTTP path', t: 'text', ph: '/sql/1.0/warehouses/abc123', req: true, span: 2 },
      { k: 'token', label: 'Personal access token', t: 'secret', req: true, cred: true },
    ] },
  { id: 's3', name: 'S3 / MinIO', group: 'Storage', badge: 'S3', color: '#c96a1c', desc: 'Buckets & prefixes · infers schema of files', scopeLabel: 'Prefixes', include: 'landing/crm/*, landing/erp/*',
    schemas: ['landing/crm/', 'landing/erp/', 'exports/', 'tmp/'],
    fields: [
      { k: 'endpoint', label: 'Endpoint URL', t: 'text', ph: 'https://minio.internal:9000', req: true, span: 2, hint: 'Leave the AWS default for Amazon S3' },
      { k: 'region', label: 'Region', t: 'text', def: 'ap-southeast-1' },
      { k: 'bucket', label: 'Bucket', t: 'text', ph: 'raw-landing', req: true },
      { k: 'formats', label: 'File formats', t: 'select', opts: ['Parquet, CSV, JSON, Avro', 'Parquet only', 'CSV only', 'Delta / Iceberg folders'], def: 'Parquet, CSV, JSON, Avro' },
      { k: 'pathStyle', label: 'Path-style access (MinIO)', t: 'toggle' },
      { k: 'access', label: 'Access key ID', t: 'text', ph: 'AKIA… / minio user', req: true, cred: true },
      { k: 'secret', label: 'Secret access key', t: 'secret', req: true, cred: true },
    ] },
  { id: 'powerbi', name: 'Power BI', group: 'BI', badge: 'BI', color: '#f2c811', desc: 'Workspaces, reports, datasets, report lineage', lineage: true, scopeLabel: 'Workspaces', include: '*',
    schemas: ['Customer Analytics', 'Finance', 'Executive', 'Personal workspaces'],
    fields: [
      { k: 'tenant', label: 'Tenant ID', t: 'text', ph: '00000000-0000-…', req: true, span: 2 },
      { k: 'client', label: 'Client ID (app registration)', t: 'text', req: true, cred: true },
      { k: 'secret', label: 'Client secret', t: 'secret', req: true, cred: true },
    ] },
  { id: 'tableau', name: 'Tableau', group: 'BI', badge: 'TB', color: '#e97627', desc: 'Sites, workbooks, data sources', lineage: true, scopeLabel: 'Projects', include: '*',
    schemas: ['Sales', 'Operations', 'Default'],
    fields: [
      { k: 'server', label: 'Server URL', t: 'text', ph: 'https://tableau.internal', req: true },
      { k: 'site', label: 'Site', t: 'text', ph: 'corp' },
      { k: 'patName', label: 'PAT name', t: 'text', req: true, cred: true },
      { k: 'pat', label: 'PAT secret', t: 'secret', req: true, cred: true },
    ] },
  { id: 'api', name: 'REST API (OpenAPI)', group: 'Other', badge: 'API', color: '#6f8a12', desc: 'Registers endpoints & response schemas as assets', scopeLabel: 'Endpoints', include: '/v1/*',
    schemas: ['/v1/customers', '/v1/orders', '/v1/products', '/internal/health'],
    fields: [
      { k: 'base', label: 'Base URL', t: 'text', ph: 'https://api.internal/v1', req: true, span: 2 },
      { k: 'spec', label: 'OpenAPI spec URL', t: 'text', ph: 'https://api.internal/openapi.json', span: 2 },
      { k: 'auth', label: 'Authentication', t: 'select', opts: ['API key header', 'Bearer token', 'OAuth2 client credentials', 'None'], def: 'API key header', cred: true },
      { k: 'header', label: 'Header name', t: 'text', def: 'X-API-Key', cred: true },
      { k: 'token', label: 'Key / token', t: 'secret', cred: true },
    ] },
  { id: 'file', name: 'File upload', group: 'Other', badge: 'FILE', color: '#778da9', desc: 'CSV / Excel / Parquet registered as a file asset', scopeLabel: 'Sheets / files', include: '*',
    schemas: ['Sheet1', 'Lookup_Province', 'README'],
    fields: [
      { k: 'file', label: 'File', t: 'text', ph: 'Drop a file or click to browse (mock)', req: true, span: 2, hint: 'Only the schema and a profile are kept; rows are not stored in EDC' },
      { k: 'format', label: 'Format', t: 'select', opts: ['CSV', 'Excel (.xlsx)', 'Parquet', 'JSON'], def: 'CSV' },
      { k: 'encoding', label: 'Encoding', t: 'select', opts: ['UTF-8', 'TIS-620 (Thai)', 'Windows-874'], def: 'UTF-8' },
      { k: 'delimiter', label: 'Delimiter', t: 'select', opts: [', (comma)', '| (pipe)', 'Tab', '; (semicolon)'], def: ', (comma)' },
      { k: 'header', label: 'First row is header', t: 'toggle', def: 'true' },
    ] },
  { id: 'openlineage', name: 'OpenLineage (push)', group: 'Lakehouse', badge: 'OL', color: '#a9cb2e', desc: 'Receive RunEvents from Spark, Airflow, dbt', lineage: true, scopeLabel: 'Namespaces', include: '*',
    schemas: ['spark', 'airflow', 'dbt'],
    fields: [
      { k: 'namespace', label: 'Namespace', t: 'text', ph: 'spark-prd', req: true },
      { k: 'producer', label: 'Producer', t: 'select', opts: ['Apache Spark', 'Apache Airflow', 'dbt', 'Flink', 'Other'], def: 'Apache Spark' },
      { k: 'token', label: 'Ingest token (generated)', t: 'secret', def: 'ol_9f3a2c7b1d4e8f60', cred: true, hint: 'Configure the producer with this token and the endpoint shown on review' },
    ] },
]

const GROUPS: [Connector['group'], string][] = [['Lakehouse', 'Lakehouse'], ['Database', 'Databases'], ['Cloud', 'Cloud data platforms'], ['Storage', 'Object storage'], ['BI', 'BI & reporting'], ['Other', 'API & files']]
const STEPS = ['Source type', 'Connection', 'Credentials & test', 'Scope', 'Schedule', 'Governance & PII', 'Review & create']
const slug = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'new-source'

type Test = { state: 'idle' | 'run' | 'ok' | 'bad'; msg?: string; details?: string[] }

export default function AddSourceWizard({ onClose, onCreate }: { onClose: () => void; onCreate: (c: Connector) => void }) {
  const { def: role } = useRole()
  const [step, setStep] = useState(0)
  const [tried, setTried] = useState<Record<number, boolean>>({})
  const [typeId, setTypeId] = useState('')
  const type = TYPES.find(t => t.id === typeId)

  // connection
  const [name, setName] = useState('')
  const [env, setEnv] = useState('Production')
  const [desc, setDesc] = useState('')
  const [network, setNetwork] = useState<'direct' | 'agent'>('direct')
  const [agent, setAgent] = useState('agent-dc1 (Bangkok DC · v2.4)')
  const [vals, setVals] = useState<Record<string, string>>({})
  const setVal = (k: string, v: string) => { setVals(s => ({ ...s, [k]: v })); if (test.state !== 'idle') setTest({ state: 'idle' }) }
  const [secretMode, setSecretMode] = useState<'new' | 'ref'>('new')
  const [secretRef, setSecretRef] = useState('')
  const [test, setTest] = useState<Test>({ state: 'idle' })

  // scope
  const [picked, setPicked] = useState<string[]>([])
  const [include, setInclude] = useState('')
  const [exclude, setExclude] = useState('*.tmp_*, *_bak, *_old')
  const [objects, setObjects] = useState<string[]>(['Tables', 'Views', 'Columns'])
  const [incremental, setIncremental] = useState(true)
  const [schemaChange, setSchemaChange] = useState(true)
  const [deprecate, setDeprecate] = useState(true)
  const [lineage, setLineage] = useState(true)
  const [profiling, setProfiling] = useState(true)
  const [sample, setSample] = useState('100000')

  // schedule
  const [mode, setMode] = useState<'manual' | 'interval' | 'daily' | 'weekly' | 'cron' | 'event'>('daily')
  const [every, setEvery] = useState('6')
  const [at, setAt] = useState('23:00')
  const [day, setDay] = useState('Sunday')
  const [cron, setCron] = useState('0 23 * * 1-5')
  const [windowEnd, setWindowEnd] = useState('05:00')
  const [notify, setNotify] = useState<string[]>(['Email', 'In-app'])
  const [firstRun, setFirstRun] = useState(true)

  // governance
  const [domain, setDomain] = useState('')
  const [owner, setOwner] = useState('')
  const [steward, setSteward] = useState('')
  const [defCls, setDefCls] = useState('Internal')
  const [tags, setTags] = useState<string[]>([])
  const [piiScan, setPiiScan] = useState(true)
  const [detectors, setDetectors] = useState<string[]>(['Rules', 'Regex', 'ML', 'LLM'])
  const [packs, setPacks] = useState<string[]>(['Thai National ID', 'Phone', 'Email', 'Address', 'Bank account', 'PDPA s.26 sensitive'])
  const [confidence, setConfidence] = useState('80')
  const [autoApply, setAutoApply] = useState(false)
  const [aiDesc, setAiDesc] = useState(true)

  const pickType = (t: SType) => {
    setTypeId(t.id)
    setVals(Object.fromEntries(t.fields.filter(f => f.def).map(f => [f.k, f.def!])))
    setInclude(t.include); setPicked([]); setTest({ state: 'idle' })
    setLineage(!!t.lineage)
    if (!name) setName('')
  }

  const connFields = type?.fields.filter(f => !f.cred) ?? []
  const credFields = type?.fields.filter(f => f.cred) ?? []
  const fieldErr = (fs: FDef[]) => Object.fromEntries(fs.filter(f => f.req).map(f => [f.k, req(vals[f.k])]))

  const errs: Record<number, Record<string, string>> = {
    0: { type: type ? '' : 'Choose a source type' },
    1: { name: req(name, 'Give the source a name'), ...fieldErr(connFields), port: vals.port && !/^\d{2,5}$/.test(vals.port) ? 'Port must be a number' : '' },
    2: secretMode === 'ref' ? { secretRef: /^vault:\/\/.+/.test(secretRef) ? '' : 'Use a vault:// reference' } : fieldErr(credFields),
    3: { include: req(include, 'At least one include pattern'), objects: req(objects, 'Pick at least one object type') },
    4: { cron: mode === 'cron' && cron.trim().split(/\s+/).length !== 5 ? 'Cron needs 5 fields' : '', every: mode === 'interval' && !(+every > 0) ? 'Enter hours' : '' },
    5: { domain: req(domain), owner: req(owner, 'Owner is mandatory (PRD PB-2, CAT-06)'), steward: req(steward, 'Steward is mandatory (PRD CAT-06)') },
    6: {},
  }
  const show = (s: number, k: string) => (tried[s] ? errs[s][k] || undefined : undefined)
  const stepOk = (s: number) => !anyErr(errs[s])

  const next = () => {
    setTried(t => ({ ...t, [step]: true }))
    if (!stepOk(step)) return
    setStep(s => Math.min(STEPS.length - 1, s + 1))
  }

  const runTest = () => {
    setTried(t => ({ ...t, 2: true }))
    if (!stepOk(1) || !stepOk(2)) { setTest({ state: 'bad', msg: 'Fill the required connection and credential fields first.' }); return }
    setTest({ state: 'run' })
    const hostish = Object.values(vals).join(' ').toLowerCase()
    window.setTimeout(() => {
      if (/fail|invalid|timeout/.test(hostish)) {
        setTest({ state: 'bad', msg: type!.id === 'oracle' ? 'ORA-12170: TNS connect timeout' : 'Connection timed out after 10 s', details: [network === 'direct' ? 'EDC cannot reach the host directly — try the remote harvester agent' : `Agent ${agent.split(' ')[0]} could not reach the host`, 'Check firewall egress and the port'] })
      } else {
        setTest({ state: 'ok', msg: `Connected in ${network === 'agent' ? 184 : 62} ms${network === 'agent' ? ` via ${agent.split(' ')[0]}` : ''}`, details: [
          `${type!.name} reachable · TLS verified`,
          `Metadata read privilege ✓ · ${type!.schemas.length} ${type!.scopeLabel.toLowerCase()} visible`,
          profiling ? 'Sample read for profiling ✓ (SELECT on 96% of tables)' : 'Profiling disabled — sample read not checked',
          'No write privileges detected ✓ (least privilege)',
        ] })
        setPicked(p => (p.length ? p : type!.schemas.filter(s => !/^(sys|system|tmp|pg_catalog|information_schema|mysql|archive|SYS|SYSTEM|tmp\/)/i.test(s))))
      }
    }, 1200)
  }

  const scheduleText = useMemo(() => ({
    manual: 'Manual only',
    interval: `Every ${every} h${incremental ? ' (incremental)' : ''}`,
    daily: `Daily ${at} ICT${windowEnd ? ` · window until ${windowEnd}` : ''}`,
    weekly: `Weekly ${day} ${at} ICT`,
    cron: `Cron ${cron} (Asia/Bangkok)`,
    event: 'On DDL events + nightly reconcile 02:00',
  }[mode]), [mode, every, at, day, cron, windowEnd, incremental])

  const connString = () => {
    if (!type) return ''
    const v = vals
    switch (type.id) {
      case 'postgres': return `jdbc:postgresql://${v.host}:${v.port}/${v.db}?sslmode=${v.ssl}`
      case 'mysql': return `jdbc:mysql://${v.host}:${v.port}/`
      case 'oracle': return `jdbc:oracle:thin:@${v.wallet === 'true' ? 'tcps' : ''}${v.host}:${v.port}/${v.service}`
      case 'mssql': return `jdbc:sqlserver://${v.host}:${v.port};databaseName=${v.db};encrypt=${v.encrypt}`
      case 'trino': return `trino://${v.host}:${v.port}`
      case 'snowflake': return `${v.account}.snowflakecomputing.com · ${v.warehouse} · ${v.role}`
      case 'bigquery': return `bigquery://${v.project} (${v.location})`
      case 's3': return `${v.endpoint}/${v.bucket}`
      case 'openlineage': return `https://edc.example.co.th/api/v1/lineage · ns=${v.namespace}`
      case 'file': return v.file
      default: return v.uri || v.host || v.base || v.server || v.tenant || ''
    }
  }

  const create = () => {
    const id = slug(name)
    onCreate({
      id: `src-${id}-${Date.now() % 10000}`, name, kind: type!.name, group: type!.group, status: firstRun ? 'Queued' : 'Healthy', assets: 0,
      lastRun: firstRun ? 'Queued · first full harvest' : 'Not run yet', schedule: scheduleText, agent: network === 'agent', lineage,
      conn: connString(), secret: secretMode === 'ref' ? secretRef : `vault://edc/${id}`, include, exclude,
      profiling: profiling ? `Sample ${(+sample).toLocaleString()} rows${type!.id === 'trino' ? ` · resource group ${vals.resource}` : ''}` : 'Off',
      domain, owner, steward, tags, env, createdBy: role.name, isNew: true,
      pii: piiScan ? `${detectors.join(', ')} · ≥ ${confidence}% → ${autoApply ? 'auto-apply ≥ 98%' : 'steward review'}` : 'Off',
    })
  }

  const renderField = (f: FDef) => {
    const v = vals[f.k] ?? ''
    const err = show(step, f.k)
    const input = f.t === 'select' ? <Select value={v} onChange={x => setVal(f.k, x)} options={f.opts!} />
      : f.t === 'secret' ? <Secret value={v} onChange={x => setVal(f.k, x)} placeholder="••••••••" />
      : f.t === 'secretArea' ? <Secret multiline value={v} onChange={x => setVal(f.k, x)} placeholder="Paste key — stored in the secret store, never shown again" />
      : f.t === 'toggle' ? <Toggle checked={v === 'true'} onChange={x => setVal(f.k, String(x))} label={f.label} />
      : f.t === 'textarea' ? <TextArea value={v} onChange={x => setVal(f.k, x)} />
      : <Input value={v} onChange={x => setVal(f.k, x)} placeholder={f.ph} inputMode={f.t === 'number' ? 'numeric' : undefined} className={`input w100 ${/uri|host|endpoint|base|server|spec|http|account/.test(f.k) ? 'mono' : ''}`} />
    if (f.t === 'toggle') return <div key={f.k} style={{ gridColumn: `span ${f.span ?? 1}`, alignSelf: 'end', paddingBottom: 6 }}>{input}</div>
    return <Field key={f.k} label={f.label} required={f.req} error={err} hint={f.hint} span={f.span}>{input}</Field>
  }

  const footer = (
    <>
      <span className="faint small grow">Step {step + 1} of {STEPS.length} · metadata only — no data is copied into EDC</span>
      {step > 0 && <button className="btn" onClick={() => setStep(s => s - 1)}><ArrowLeft size={14} />Back</button>}
      <button className="btn ghost" onClick={onClose}>Cancel</button>
      {step < STEPS.length - 1
        ? <button className="btn primary" onClick={next}>Next<ArrowRight size={14} /></button>
        : <button className="btn primary" onClick={create}><PlugZap size={14} />Create source{firstRun ? ' & start harvest' : ''}</button>}
    </>
  )

  return (
    <Modal size="xl" icon={<PlugZap size={18} />} title="Add source" sub={type ? `${type.name}${name ? ` · ${name}` : ''}` : 'Register a new metadata source (PRD HRV-08, HRV-10, HRV-12)'} onClose={onClose} footer={footer}
      aside={<>
        <WizardSteps steps={STEPS} cur={step} onGo={setStep} done={stepOk} />
        {type && (
          <div className="card" style={{ padding: 10, marginTop: 14 }}>
            <div className="row"><span className="type-tile-ic" style={{ background: type.color }}>{type.badge}</span><b className="small">{type.name}</b></div>
            <div className="faint small" style={{ marginTop: 6 }}>{type.desc}</div>
          </div>
        )}
      </>}>

      {step === 0 && (
        <>
          {tried[0] && !type && <div className="field-error">Choose a source type to continue.</div>}
          {GROUPS.map(([g, label]) => (
            <div key={g} className="col" style={{ gap: 8 }}>
              <div className="type-group-h">{label}</div>
              <div className="type-grid">
                {TYPES.filter(t => t.group === g).map(t => (
                  <button key={t.id} type="button" className={`type-tile ${typeId === t.id ? 'on' : ''}`} onClick={() => pickType(t)} onDoubleClick={() => { pickType(t); setStep(1) }}>
                    <span className="row"><span className="ti" style={{ background: t.color }}>{t.badge}</span>{t.lineage && <span className="badge cyan" style={{ marginLeft: 'auto' }}>lineage</span>}</span>
                    <b className="small">{t.name}</b>
                    <span className="faint" style={{ fontSize: 11 }}>{t.desc}</span>
                  </button>
                ))}
              </div>
            </div>
          ))}
        </>
      )}

      {step === 1 && type && (
        <>
          <Section title="General">
            <FormGrid cols={3}>
              <Field label="Source name" required error={show(1, 'name')} span={2} hint="Shown in search facets and lineage, e.g. “Oracle CRM (PRD)”"><Input value={name} onChange={setName} placeholder={`${type.name} (PRD)`} autoFocus /></Field>
              <Field label="Environment"><Select value={env} onChange={setEnv} options={['Production', 'UAT', 'Development']} /></Field>
              <Field label="Description" span={3}><TextArea rows={2} value={desc} onChange={setDesc} placeholder="What system is this and who runs it?" /></Field>
            </FormGrid>
          </Section>
          <Section title="Network path" desc="HRV-12">
            <Radio value={network} onChange={setNetwork} options={[
              { id: 'direct', label: 'Direct from EDC', sub: 'EDC can reach the host on the network' },
              { id: 'agent', label: <span className="row"><Server size={13} />Remote harvester agent</span>, sub: 'Source behind a firewall · outbound-only connection' },
            ]} />
            {network === 'agent' && <Field label="Agent"><Select value={agent} onChange={setAgent} options={['agent-dc1 (Bangkok DC · v2.4)', 'agent-dr (Chonburi DR · v2.4)']} /></Field>}
          </Section>
          <Section title={`${type.name} connection`}>
            <FormGrid cols={2}>{connFields.map(renderField)}</FormGrid>
          </Section>
        </>
      )}

      {step === 2 && type && (
        <>
          <Section title="Credentials" desc="Stored in the secret store (HashiCorp Vault) · EDC keeps only the reference">
            <Radio value={secretMode} onChange={setSecretMode} options={[
              { id: 'new', label: 'Enter new credentials', sub: `Saved to vault://edc/${slug(name)}` },
              { id: 'ref', label: 'Use existing secret reference', sub: 'Already provisioned by the platform team' },
            ]} />
            {secretMode === 'new'
              ? <FormGrid cols={2}>{credFields.map(renderField)}</FormGrid>
              : <Field label="Secret reference" required error={show(2, 'secretRef')}><Input value={secretRef} onChange={setSecretRef} placeholder="vault://edc/oracle-crm-prd" className="input w100 mono" /></Field>}
            <div className="faint small row"><ShieldCheck size={13} color="var(--ok)" />Values are masked, never logged, and not visible to other users. Tip: type “fail” in the host to see a failed test.</div>
          </Section>
          <Section title="Test connection">
            <div className="row">
              <button className="btn" onClick={runTest} disabled={test.state === 'run'}>{test.state === 'run' ? <Loader2 size={14} className="spin" /> : <PlugZap size={14} />}Test connection</button>
              <span className="faint small">Checks reachability, TLS, metadata privileges and that the account is read-only.</span>
            </div>
            {test.state !== 'idle' && (
              <div className={`test-box ${test.state}`}>
                <div className="row">{test.state === 'run' ? <Loader2 size={15} className="spin" color="var(--primary)" /> : test.state === 'ok' ? <CheckCircle2 size={15} color="var(--ok)" /> : <XCircle size={15} color="var(--bad)" />}<b>{test.state === 'run' ? 'Testing…' : test.msg}</b></div>
                {test.details && <ul style={{ margin: '6px 0 0', paddingLeft: 22 }}>{test.details.map(d => <li key={d}>{d}</li>)}</ul>}
              </div>
            )}
            {test.state === 'idle' && <div className="faint small row"><Info size={13} />You can continue without testing; the source will be created but flagged “not tested”.</div>}
          </Section>
        </>
      )}

      {step === 3 && type && (
        <>
          <Section title={`${type.scopeLabel} to harvest`} desc={test.state === 'ok' ? 'discovered by the connection test' : 'run the connection test to discover'}>
            {test.state === 'ok'
              ? <Checks options={type.schemas} value={picked} onChange={setPicked} />
              : <div className="faint small">No discovery yet — use include / exclude patterns below.</div>}
            <FormGrid cols={2}>
              <Field label="Include patterns" required error={show(3, 'include')} hint="Comma-separated, regex or glob"><Input value={include} onChange={setInclude} className="input w100 mono" /></Field>
              <Field label="Exclude patterns" hint="Applied after include"><Input value={exclude} onChange={setExclude} className="input w100 mono" /></Field>
              <Field label="Object types" required error={show(3, 'objects')} span={2}><Checks options={['Tables', 'Views', 'Materialized views', 'Columns', 'Procedures', 'Partitions & snapshots', 'Comments → descriptions']} value={objects} onChange={setObjects} /></Field>
            </FormGrid>
          </Section>
          <Section title="Harvest options">
            <FormGrid cols={2}>
              <Toggle checked={incremental} onChange={setIncremental} label="Incremental sync" sub="Only changed objects after the first full run (HRV-02)" />
              <Toggle checked={schemaChange} onChange={setSchemaChange} label="Detect schema changes" sub="Version schemas and notify Owner/Steward (HRV-03)" />
              <Toggle checked={deprecate} onChange={setDeprecate} label="Deprecate removed assets" sub="Keep business metadata (HRV-04)" />
              <Toggle checked={lineage} onChange={setLineage} label="Harvest lineage" sub={type.lineage ? 'From query log / API (OpenLineage naming)' : 'Not supported by this type'} />
              <Toggle checked={profiling} onChange={setProfiling} label="Data profiling" sub="null %, distinct, min/max, pattern — values not stored (HRV-06)" />
              {profiling && <Field label="Sample size (rows)"><Select value={sample} onChange={setSample} options={[['10000', '10,000'], ['100000', '100,000'], ['1000000', '1,000,000']]} /></Field>}
            </FormGrid>
          </Section>
        </>
      )}

      {step === 4 && (
        <>
          <Section title="Harvest schedule" desc="Times in Asia/Bangkok (ICT, UTC+7)">
            <Radio value={mode} onChange={setMode} options={[
              { id: 'daily', label: 'Daily', sub: 'Typical for databases' }, { id: 'interval', label: 'Every N hours' }, { id: 'weekly', label: 'Weekly' },
              { id: 'event', label: 'DDL events', sub: 'If the source can push' }, { id: 'cron', label: 'Cron expression' }, { id: 'manual', label: 'Manual only' },
            ]} />
            <FormGrid cols={3}>
              {mode === 'interval' && <Field label="Every (hours)" required error={show(4, 'every')}><Input value={every} onChange={setEvery} inputMode="numeric" /></Field>}
              {(mode === 'daily' || mode === 'weekly') && <Field label="Start at"><Input type="time" value={at} onChange={setAt} /></Field>}
              {mode === 'weekly' && <Field label="Day"><Select value={day} onChange={setDay} options={['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']} /></Field>}
              {mode === 'daily' && <Field label="Must finish by" hint="Off-peak window"><Input type="time" value={windowEnd} onChange={setWindowEnd} /></Field>}
              {mode === 'cron' && <Field label="Cron" required error={show(4, 'cron')} hint="min hour day month weekday" span={2}><Input value={cron} onChange={setCron} className="input w100 mono" /></Field>}
            </FormGrid>
            <div className="small"><span className="faint">Summary:</span> <b>{scheduleText}</b></div>
          </Section>
          <Section title="On failure">
            <Field label="Notify Owner / Steward / on-call via"><Checks options={['Email', 'In-app', 'Teams', 'LINE', 'Webhook']} value={notify} onChange={setNotify} /></Field>
            <Toggle checked={firstRun} onChange={setFirstRun} label="Start the first full harvest right after creating" />
          </Section>
        </>
      )}

      {step === 5 && (
        <>
          <Section title="Ownership defaults" desc="Applied to every harvested asset; can be overridden per asset">
            <FormGrid cols={3}>
              <Field label="Domain" required error={show(5, 'domain')}><Select value={domain} onChange={setDomain} placeholder="Select…" options={domains.map(d => d.name)} /></Field>
              <Field label="Data Owner" required error={show(5, 'owner')}><PersonSelect value={owner} onChange={setOwner} filter={t => /Head|Owner|Chair/.test(t)} /></Field>
              <Field label="Data Steward" required error={show(5, 'steward')}><PersonSelect value={steward} onChange={setSteward} filter={t => /Steward|Engineer/.test(t)} /></Field>
              <Field label="Default classification" hint="Until a steward confirms per column"><Select value={defCls} onChange={setDefCls} options={['Public', 'Internal', 'Confidential', 'Restricted']} /></Field>
              <Field label="Tags" span={2}><TagInput value={tags} onChange={setTags} placeholder="e.g. crm, source-system" /></Field>
            </FormGrid>
          </Section>
          <Section title="Classification & PII scan" desc="CLS-02, CLS-03, AI-03">
            <Toggle checked={piiScan} onChange={setPiiScan} label="Run auto-classification after each harvest" sub="Results are suggestions; nothing applies until a steward confirms" />
            {piiScan && (
              <FormGrid cols={2}>
                <Field label="Detectors"><Checks options={['Rules', 'Regex', 'ML', 'LLM']} value={detectors} onChange={setDetectors} /></Field>
                <Field label="Minimum confidence to suggest"><Select value={confidence} onChange={setConfidence} options={[['70', '70%'], ['80', '80%'], ['90', '90%']]} /></Field>
                <Field label="Detector packs" span={2}><Checks options={['Thai National ID', 'Phone', 'Email', 'Address', 'Bank account', 'Passport', 'IP address', 'PDPA s.26 sensitive']} value={packs} onChange={setPacks} /></Field>
                <Toggle checked={autoApply} onChange={setAutoApply} label="Auto-apply suggestions ≥ 98% confidence" sub="Still logged and reversible; s.26 data always needs DPO" />
                <Toggle checked={aiDesc} onChange={setAiDesc} label="Draft descriptions with AI" sub="Metadata only to on-prem model (AI-02, AI-10)" />
              </FormGrid>
            )}
          </Section>
        </>
      )}

      {step === 6 && type && (
        <>
          {test.state !== 'ok' && <div className="test-box bad row"><AlertTriangle size={15} color="var(--warn)" />Connection not tested successfully — the source will be created and flagged until a test passes.</div>}
          <div className="grid g2" style={{ gap: 12 }}>
            <Section title="Connection">
              <ReviewList rows={[
                ['Type', <span className="row"><span className="type-tile-ic" style={{ background: type.color }}>{type.badge}</span>{type.name}</span>], ['Name', name], ['Environment', env],
                ['Network', network === 'agent' ? `Remote agent · ${agent}` : 'Direct'], ['Endpoint', <span className="mono small">{connString()}</span>],
                ['Credentials', <span className="badge gray">{secretMode === 'ref' ? secretRef : `vault://edc/${slug(name)}`}</span>],
                ['Test', test.state === 'ok' ? <span className="badge green">Passed</span> : <span className="badge amber">Not tested</span>],
              ]} />
            </Section>
            <Section title="Scope & schedule">
              <ReviewList rows={[
                [type.scopeLabel, picked.length ? picked.join(', ') : '—'], ['Include', <span className="mono small">{include}</span>], ['Exclude', <span className="mono small">{exclude}</span>],
                ['Objects', objects.join(', ')], ['Options', [incremental && 'incremental', schemaChange && 'schema changes', deprecate && 'deprecate removed', lineage && 'lineage', profiling && `profiling ${(+sample).toLocaleString()} rows`].filter(Boolean).join(' · ')],
                ['Schedule', scheduleText], ['On failure', notify.join(', ')],
              ]} />
            </Section>
            <Section title="Governance">
              <ReviewList rows={[
                ['Domain', domain], ['Owner', people[owner]?.name], ['Steward', people[steward]?.name], ['Default class', <ClsBadge value={defCls as 'Internal'} />],
                ['Tags', tags.map(t => `#${t}`).join(' ')],
              ]} />
            </Section>
            <Section title="PII & AI">
              <ReviewList rows={[
                ['PII scan', piiScan ? <span className="badge green">On</span> : <span className="badge gray">Off</span>],
                ['Detectors', piiScan ? `${detectors.join(', ')} · ≥ ${confidence}%` : '—'], ['Packs', piiScan ? packs.join(', ') : '—'],
                ['Apply', piiScan ? (autoApply ? 'Auto ≥ 98%, rest to steward queue' : 'Steward review queue') : '—'],
                ['AI descriptions', aiDesc ? <span className="row"><Sparkles size={12} color="var(--ai)" />On-prem model</span> : 'Off'],
              ]} />
            </Section>
          </div>
          <div className="faint small">Creating writes an audit entry (“Source created by {role.name}”) and, if selected, queues the first full harvest.</div>
        </>
      )}
    </Modal>
  )
}
