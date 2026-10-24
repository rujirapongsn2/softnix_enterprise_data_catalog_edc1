import { createContext, lazy, Suspense, useContext, useEffect, useRef, useState, type ReactNode } from 'react'
import { NavLink, Outlet, useNavigate, useSearchParams } from 'react-router-dom'
import {
  Home, Search, BookOpen, Boxes, Inbox, ShieldAlert, Gauge, KeyRound, LayoutDashboard, PlugZap, History,
  Settings, Activity, BellRing, ChevronsLeft, ChevronsRight, Bell, HelpCircle, Sparkles, CheckCircle2, Clock, Bookmark,
  ShieldCheck, ChevronDown, Check, Repeat2, PanelLeft,
} from 'lucide-react'
import { useI18n } from '../i18n'
import { assets, terms, tasks, people } from '../data/mock'
import { useRole } from '../auth/role'
import { ROLES, FUNCTIONS, levelOf } from '../auth/permissions'
import { typeIcon, LifecycleBadge } from './ui'
import AskSoftnix from './AskSoftnix'
// Help panel + its content index load on first open (keeps the main bundle small)
const HelpPanel = lazy(() => import('../help/HelpPanel'))

/* ---------- toast + ask context ---------- */
interface Shell { toast: (msg: string) => void; ask: (prompt?: string) => void }
const ShellCtx = createContext<Shell>({ toast: () => {}, ask: () => {} })
export const useShell = () => useContext(ShellCtx)

export default function Layout() {
  const { t } = useI18n()
  const [collapsed, setCollapsed] = useState(false)
  const [toastMsg, setToastMsg] = useState<string | null>(null)
  const [askOpen, setAskOpen] = useState(false)
  const [askSeed, setAskSeed] = useState<string | undefined>()
  const openTasks = tasks.length

  const toast = (m: string) => {
    setToastMsg(m)
    window.setTimeout(() => setToastMsg(null), 2600)
  }
  const [helpOpen, setHelpOpen] = useState(false)
  const ask = (p?: string) => { setHelpOpen(false); setAskSeed(p); setAskOpen(true) }
  const toggleHelp = () => { if (!helpOpen) setAskOpen(false); setHelpOpen(!helpOpen) }

  // Deep link: ?ask=<prompt> opens Ask Softnix with that prompt (handy for demos and shared links)
  const [params] = useSearchParams()
  const askParam = params.get('ask')
  useEffect(() => { if (askParam !== null) ask(askParam || undefined) }, [askParam])
  // Deep link: ?help=1 opens the page Help panel
  const helpParam = params.get('help')
  useEffect(() => { if (helpParam !== null && helpParam !== '0') { setAskOpen(false); setHelpOpen(true) } }, [helpParam])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'j') { e.preventDefault(); setAskOpen(o => !o) }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  const { level, role } = useRole()
  const Item = ({ to, icon, label, count, cap }: { to: string; icon: ReactNode; label: string; count?: number; cap: string }) => level(cap) === 'none' ? null : (
    <NavLink to={to} end={to === '/'} className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`} title={label}>
      {icon}<span className="label">{label}</span>{count ? <span className="count">{count}</span> : null}
      {level(cap) === 'view' && <span className="nav-ro" title="View only for your role">view</span>}
    </NavLink>
  )

  return (
    <ShellCtx.Provider value={{ toast, ask }}>
      <div className={`shell ${helpOpen ? 'help-open' : ''}`}>
        <aside className={`sidenav ${collapsed ? 'collapsed' : ''}`}>
          <div className="brand">
                        <img src="/softnix-mark.png" alt="Softnix" className="brand-mark-img" />
            <div className="brand-text"><img src="/softnix-logo-color.png" alt="Softnix" className="brand-logo" /><span>Enterprise Data Catalog (EDC1)</span></div>
          </div>
          <nav style={{ overflowY: 'auto', flex: 1 }}>
            <div className="nav-section">{t('discover')}</div>
            <Item cap="page.home" to="/" icon={<Home size={18} />} label={t('home')} />
            <Item cap="page.search" to="/search" icon={<Search size={18} />} label={t('search')} />
            <Item cap="page.glossary" to="/glossary" icon={<BookOpen size={18} />} label={t('glossary')} />
            <Item cap="page.domains" to="/domains" icon={<Boxes size={18} />} label={t('products')} />
            {sectionVisible('Govern', role) && <div className="nav-section">{t('govern')}</div>}
            <Item cap="page.inbox" to="/inbox" icon={<Inbox size={18} />} label={t('inbox')} count={openTasks} />
            <Item cap="page.privacy" to="/privacy" icon={<ShieldAlert size={18} />} label={t('privacy')} />
            <Item cap="page.quality" to="/quality" icon={<Gauge size={18} />} label={t('quality')} />
            <Item cap="page.observability" to="/observability" icon={<Activity size={18} />} label={t('observability')} count={3} />
            <Item cap="page.alerts" to="/alerts" icon={<BellRing size={18} />} label={t('alerts')} />
            <Item cap="page.access" to="/access" icon={<KeyRound size={18} />} label={t('policies')} />
            <Item cap="page.dashboard" to="/dashboard" icon={<LayoutDashboard size={18} />} label={t('insights')} />
            {sectionVisible('Administration', role) && <div className="nav-section">{t('admin')}</div>}
            <Item cap="page.sources" to="/sources" icon={<PlugZap size={18} />} label={t('connectors')} />
            <Item cap="page.audit" to="/audit" icon={<History size={18} />} label={t('audit')} />
            <Item cap="page.settings" to="/settings" icon={<Settings size={18} />} label={t('settings')} />
            <Item cap="page.roles" to="/roles" icon={<ShieldCheck size={18} />} label="Roles & Permissions" />
          </nav>
          <div className="nav-foot">
            <button className="nav-item" style={{ border: 0, background: 'transparent', width: 'calc(100% - 16px)' }} onClick={() => setCollapsed(c => !c)}>
              {collapsed ? <ChevronsRight size={18} /> : <ChevronsLeft size={18} />}<span className="label">{t('collapse')}</span>
            </button>
          </div>
        </aside>

        <div className="main">
          <Topbar helpOpen={helpOpen} onHelp={toggleHelp} onToggleNav={() => setCollapsed(c => !c)} />
          <div className="content"><Outlet /></div>
        </div>
      </div>

      {!askOpen && !helpOpen && (
        <button className="ask-fab" onClick={() => ask()} aria-label="Open Ask Softnix (Ctrl/⌘ + J)">
          <span className="orb"><Sparkles size={18} /></span>{t('askSoftnix')}
          <span className="kbd" style={{ background: 'rgba(255,255,255,.15)', color: 'white', borderColor: 'rgba(255,255,255,.3)' }}>⌘J</span>
        </button>
      )}
      {askOpen && <AskSoftnix seed={askSeed} onClose={() => setAskOpen(false)} />}
      {helpOpen && <Suspense fallback={null}><HelpPanel onClose={() => setHelpOpen(false)} onAsk={q => ask(q)} /></Suspense>}
      {toastMsg && <div className="toast"><CheckCircle2 size={16} color="#4ade80" />{toastMsg}</div>}
    </ShellCtx.Provider>
  )
}

function Topbar({ helpOpen, onHelp, onToggleNav }: { helpOpen: boolean; onHelp: () => void; onToggleNav: () => void }) {
  const { lang, setLang } = useI18n()
  return (
    <header className="topbar">
      <button className="icon-btn nav-toggle" aria-label="Toggle sidebar" title="Toggle sidebar" onClick={onToggleNav}><PanelLeft size={18} /></button>
      <GlobalSearch />
      <div className="spacer" />
      <div className="lang-toggle" role="group" aria-label="Language">
        <button className={lang === 'en' ? 'on' : ''} onClick={() => setLang('en')}>EN</button>
        <button className={lang === 'th' ? 'on' : ''} onClick={() => setLang('th')}>ไทย</button>
      </div>
      <button className="icon-btn" aria-label="Notifications"><Bell size={18} /><span className="dot" /></button>
      <button className={`icon-btn help-btn ${helpOpen ? 'on' : ''}`} aria-label={lang === 'th' ? 'คู่มือการใช้งานหน้านี้' : 'Help for this page'} title={lang === 'th' ? 'คู่มือการใช้งานหน้านี้' : 'Help for this page'} aria-pressed={helpOpen} onClick={onHelp}><HelpCircle size={18} /></button>
      <RoleSwitcher />
    </header>
  )
}

const sectionVisible = (group: string, role: Parameters<typeof levelOf>[0]) =>
  FUNCTIONS.some(f => f.kind === 'page' && f.group === group && levelOf(role, f.id) !== 'none')

const scopeOf: Record<string, string> = { consumer: 'Customer analytics', steward: 'Customer domain', owner: 'Customer, Marketing', custodian: 'All domains', dpo: 'Organisation', council: 'Organisation', auditor: 'Read-only', admin: 'Platform' }

function RoleSwitcher() {
  const { role, def, setRole } = useRole()
  const { toast } = useShell()
  const nav = useNavigate()
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  useEffect(() => {
    const close = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false) }
    document.addEventListener('mousedown', close)
    return () => document.removeEventListener('mousedown', close)
  }, [])
  const p = people[def.persona]
  const ini = p.name.split(' ').map(s => s[0]).slice(0, 2).join('')
  return (
    <div className="role-menu-wrap" ref={ref}>
      <span className="role-pill" style={{ marginRight: 10 }} title="Current role — permissions follow this role"><i className="role-dot" style={{ background: def.color }} />Role: {def.name}</span>
      <button className="user-chip btnlike" onClick={() => setOpen(o => !o)} aria-haspopup="menu" aria-expanded={open} title="Switch role">
        <span className="avatar" style={{ background: p.color }}>{ini}</span>
        <div className="meta"><b>{p.name}</b><span>{def.name} · {scopeOf[role]}</span></div>
        <ChevronDown size={14} color="var(--text-3)" />
      </button>
      {open && (
        <div className="role-menu" role="menu">
          <div className="rm-h"><div className="row"><Repeat2 size={15} color="var(--primary)" /><b>Switch role</b><span className="faint small" style={{ marginLeft: 'auto' }}>demo · PRD §3</span></div>
            <div className="faint small" style={{ marginTop: 2 }}>See how menus, pages and actions change for each role. Your choice is remembered on this browser.</div></div>
          <div className="rm-list">
            {ROLES.map(r => (
              <button key={r.id} className={`role-opt ${r.id === role ? 'on' : ''}`} role="menuitemradio" aria-checked={r.id === role}
                onClick={() => { setRole(r.id); setOpen(false); toast(`Now viewing as ${r.name} (${people[r.persona].name})`) }}>
                <span className="avatar sm" style={{ background: r.color, marginTop: 2 }}>{people[r.persona].name.split(' ').map(s => s[0]).slice(0, 2).join('')}</span>
                <span className="grow"><span className="ro-t">{r.name}</span> <span className="faint small">· {r.th}</span><span className="faint small" style={{ display: 'block' }}>{r.rights}</span></span>
                {r.id === role && <Check size={15} color="var(--primary)" />}
              </button>
            ))}
          </div>
          <div className="rm-f"><ShieldCheck size={14} color="var(--text-3)" /><button className="link-btn small" onClick={() => { setOpen(false); nav('/roles') }}>View Roles &amp; Permissions matrix →</button></div>
        </div>
      )}
    </div>
  )
}

function GlobalSearch() {
  const { t } = useI18n()
  const { ask } = useShell()
  const nav = useNavigate()
  const [q, setQ] = useState('')
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const close = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false) }
    const key = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') { e.preventDefault(); ref.current?.querySelector('input')?.focus() }
    }
    document.addEventListener('mousedown', close)
    window.addEventListener('keydown', key)
    return () => { document.removeEventListener('mousedown', close); window.removeEventListener('keydown', key) }
  }, [])

  const ql = q.trim().toLowerCase()
  const hitAssets = ql ? assets.filter(a => [a.name, a.path, a.businessName.en, a.businessName.th, ...a.tags].some(s => s.toLowerCase().includes(ql))).slice(0, 5) : []
  const hitTerms = ql ? terms.filter(x => [x.en, x.th, ...x.synonyms].some(s => s.toLowerCase().includes(ql))).slice(0, 3) : []
  const go = (path: string) => { setOpen(false); setQ(''); nav(path) }
  const isQuestion = /\?|which|where|who|what|how|อะไร|ไหน|ใคร|อย่างไร/i.test(q)

  return (
    <div className="gsearch" ref={ref}>
      <div className="gsearch-box">
        <Search size={16} color="var(--text-3)" />
        <input
          value={q} placeholder={t('searchPh')} onFocus={() => setOpen(true)} onChange={e => { setQ(e.target.value); setOpen(true) }}
          onKeyDown={e => { if (e.key === 'Enter') go(`/search?q=${encodeURIComponent(q)}`) }}
        />
        <span className="kbd">⌘K</span>
      </div>
      {open && (
        <div className="gsearch-pop">
          {!ql && (
            <>
              <div className="pop-label">Recent</div>
              {['customer_360', 'Revenue by Segment', 'Active Customer'].map(r => (
                <div key={r} className="pop-row" onClick={() => go(`/search?q=${encodeURIComponent(r)}`)}><Clock size={14} color="var(--text-3)" />{r}</div>
              ))}
              <div className="pop-label">Saved searches</div>
              {['Certified · Customer domain', 'PII not yet confirmed', 'Critical assets without owner'].map(r => (
                <div key={r} className="pop-row" onClick={() => go('/search')}><Bookmark size={14} color="var(--text-3)" />{r}</div>
              ))}
              <div className="pop-label">Try</div>
              {['customer national id', 'ลูกค้า', 'revenue certified'].map(r => (
                <div key={r} className="pop-row" onClick={() => { setQ(r) }}><Search size={14} color="var(--text-3)" />{r}</div>
              ))}
            </>
          )}
          {ql && (
            <>
              <div className="pop-row pop-ai" onClick={() => { setOpen(false); ask(q) }}>
                <Sparkles size={15} /><span><b>Ask Softnix:</b> “{q}”</span>
                <span className="right small">{isQuestion ? 'Looks like a question' : 'Natural-language search'}</span>
              </div>
              {hitAssets.length > 0 && <div className="pop-label">Assets</div>}
              {hitAssets.map(a => (
                <div key={a.id} className="pop-row" onClick={() => go(`/asset/${a.id}`)}>
                  <span style={{ color: 'var(--primary)' }}>{typeIcon(a.type, 15)}</span>
                  <span className="grow ellipsis"><b>{a.name}</b> <span className="sub">· {a.businessName.en} · {a.path}</span></span>
                  <span className="right">{a.lifecycle === 'Certified' && <LifecycleBadge value="Certified" />}<span className="badge outline">{a.type}</span></span>
                </div>
              ))}
              {hitTerms.length > 0 && <div className="pop-label">Glossary</div>}
              {hitTerms.map(x => (
                <div key={x.id} className="pop-row" onClick={() => go(`/glossary/${x.id}`)}>
                  <BookOpen size={15} color="var(--ai)" />
                  <span className="grow ellipsis"><b>{x.en}</b> <span className="sub">· {x.th}</span></span>
                  <span className="right"><span className="badge violet">Term</span></span>
                </div>
              ))}
              <div className="pop-row" onClick={() => go(`/search?q=${encodeURIComponent(q)}`)} style={{ borderTop: '1px solid var(--border)', marginTop: 4 }}>
                <Search size={14} /> See all results for “{q}” <span className="right kbd">↵</span>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  )
}
