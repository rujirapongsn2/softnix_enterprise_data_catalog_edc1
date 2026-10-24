// Page-level Help panel (opened from the ? icon in the top bar).
// Content is data, not JSX: see help-content/README.md. The panel follows the route and the EN/ไทย toggle.
import { useEffect, useRef, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { HelpCircle, X, ChevronDown, ChevronRight, MapPin, ArrowUpRight, Send, BookOpen, Sparkles, ChevronsUpDown } from 'lucide-react'
import { useI18n } from '../i18n'
import { useRole } from '../auth/role'
import { pageCapForPath } from '../auth/permissions'
import { helpForPath, helpPage, linkFor, FALLBACK_PAGE, type HelpPage } from '.'
import Markdown from './Markdown'

const OPEN_BY_DEFAULT = ['what', 'purpose', 'how']

const L = {
  en: {
    help: 'Help', hi: 'Here is a quick guide to', related: 'Related pages', ph: 'Ask about how to use this page…',
    send: 'Ask Softnix', askNote: 'Your question opens Ask Softnix with this page as context. Answers grounded in this help content (RAG): coming soon.',
    source: 'Source', updated: 'updated', full: 'you can use and change this page', view: 'view only for your role', none: 'not available for your role',
    expand: 'Expand all', collapse: 'Collapse all', start: 'Getting started with EDC1', close: 'Close help (Esc)',
  },
  th: {
    help: 'ความช่วยเหลือ', hi: 'คู่มือการใช้งานหน้า', related: 'หน้าที่เกี่ยวข้อง', ph: 'ถามวิธีใช้งานหน้านี้…',
    send: 'ถาม Softnix', askNote: 'คำถามจะเปิดใน “ถาม Softnix” โดยอ้างอิงหน้านี้ ส่วนการตอบจากเนื้อหาคู่มือนี้โดยตรง (RAG) จะเปิดให้ใช้เร็ว ๆ นี้',
    source: 'ที่มา', updated: 'ปรับปรุง', full: 'บทบาทของคุณใช้งานและแก้ไขหน้านี้ได้', view: 'บทบาทของคุณดูได้อย่างเดียว', none: 'บทบาทของคุณไม่มีสิทธิ์ใช้หน้านี้',
    expand: 'ขยายทั้งหมด', collapse: 'ย่อทั้งหมด', start: 'เริ่มต้นใช้งาน EDC1', close: 'ปิดคู่มือ (Esc)',
  },
} as const

export default function HelpPanel({ onClose, onAsk }: { onClose: () => void; onAsk: (q: string) => void }) {
  const { lang } = useI18n()
  const loc = useLocation()
  const page = helpForPath(loc.pathname, lang)
  // The aside stays mounted (slide-in plays once); the body remounts when the page or language changes.
  return (
    <aside className="help-panel" role="complementary" aria-label={`${L[lang].help} · ${page.title}`} data-help-page={page.page_id} data-help-lang={page.lang}>
      <HelpBody key={`${page.page_id}.${lang}`} page={page} onClose={onClose} onAsk={onAsk} />
    </aside>
  )
}

function HelpBody({ page, onClose, onAsk }: { page: HelpPage; onClose: () => void; onAsk: (q: string) => void }) {
  const { lang } = useI18n()
  const { def, level } = useRole()
  const loc = useLocation()
  const t = L[lang]
  const [open, setOpen] = useState<Set<string>>(() => new Set(OPEN_BY_DEFAULT))
  const [q, setQ] = useState('')
  const bodyRef = useRef<HTMLDivElement>(null)
  const cap = pageCapForPath(loc.pathname)
  const access = cap ? level(cap) : undefined
  const roleName = lang === 'th' ? def.th : def.name
  const related = page.related.map(id => helpPage(id, lang)).filter((p): p is HelpPage => !!p)
  const allOpen = open.size === page.sections.length

  useEffect(() => { bodyRef.current?.scrollTo({ top: 0 }) }, [page.page_id])
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  const toggle = (a: string) => setOpen(s => { const n = new Set(s); n.has(a) ? n.delete(a) : n.add(a); return n })
  const submit = () => {
    const text = q.trim()
    if (!text) return
    onAsk(text)
    setQ('')
  }

  return (
    <>
      <div className="help-h">
        <span className="help-avatar"><HelpCircle size={18} /></span>
        <div className="grow" style={{ minWidth: 0 }}>
          <div className="help-h-k">{t.help} · {page.section}</div>
          <b className="ellipsis" style={{ display: 'block' }}>{page.title}</b>
        </div>
        <button className="icon-btn" onClick={() => setOpen(allOpen ? new Set() : new Set(page.sections.map(s => s.anchor)))} title={allOpen ? t.collapse : t.expand} aria-label={allOpen ? t.collapse : t.expand}><ChevronsUpDown size={16} /></button>
        <button className="icon-btn" onClick={onClose} aria-label={t.close} title={t.close}><X size={17} /></button>
      </div>
      {access && (
        <div className="help-ctx"><MapPin size={12} />{roleName} · <span className={`help-access ${access}`}>{t[access]}</span></div>
      )}

      <div className="help-body" ref={bodyRef}>
        <div className="help-msg">
          <span className="help-bot"><HelpCircle size={14} /></span>
          <div className="bubble">
            <div>{t.hi} <b>{page.title}</b></div>
            <div className="muted" style={{ marginTop: 4 }}>{page.summary}</div>
          </div>
        </div>

        {page.sections.map(s => {
          const on = open.has(s.anchor)
          return (
            <div className="help-msg" key={s.anchor} id={`help-${s.anchor}`}>
              <span className="help-bot ghost" />
              <div className={`bubble help-sec ${on ? 'on' : ''}`}>
                <button className="help-sec-h" onClick={() => toggle(s.anchor)} aria-expanded={on}>
                  {on ? <ChevronDown size={14} /> : <ChevronRight size={14} />}<span>{s.heading}</span>
                </button>
                {on && <Markdown source={s.markdown} />}
              </div>
            </div>
          )
        })}

        {related.length > 0 && (
          <div className="help-related">
            <div className="help-related-h"><BookOpen size={13} />{t.related}</div>
            {related.map(r => {
              const to = linkFor(r)
              return to ? (
                <Link key={r.page_id} to={to} className="help-rel">
                  <span className="grow"><b>{r.nav_label}</b><span className="faint small" style={{ display: 'block' }}>{r.summary}</span></span>
                  <ArrowUpRight size={14} />
                </Link>
              ) : null
            })}
          </div>
        )}

        {page.page_id !== FALLBACK_PAGE && (
          <GettingStartedLink label={t.start} />
        )}

        <div className="help-src faint">{t.source}: <code>{page.source_file}</code> · v{page.version} · {t.updated} {page.last_updated}</div>
      </div>

      <div className="help-input">
        <textarea rows={1} value={q} placeholder={t.ph} onChange={e => setQ(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); submit() } }} aria-label={t.ph} />
        <button className="help-send" onClick={submit} disabled={!q.trim()} aria-label={t.send} title={t.send}><Send size={15} /></button>
      </div>
      <div className="help-note"><Sparkles size={11} />{t.askNote}</div>
    </>
  )
}

/** Getting started has no route of its own; show it inline when clicked. */
function GettingStartedLink({ label }: { label: string }) {
  const { lang } = useI18n()
  const [show, setShow] = useState(false)
  const gs = helpPage(FALLBACK_PAGE, lang)
  if (!gs) return null
  return (
    <div className="help-related">
      <button className="help-rel" onClick={() => setShow(s => !s)} aria-expanded={show}>
        <span className="grow"><b>{label}</b><span className="faint small" style={{ display: 'block' }}>{gs.summary}</span></span>
        {show ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
      </button>
      {show && <div className="bubble" style={{ marginTop: 6 }}>{gs.sections.filter(s => s.anchor === 'how' || s.anchor === 'tips').map(s => <div key={s.anchor}><b className="small">{s.heading}</b><Markdown source={s.markdown} /></div>)}</div>}
    </div>
  )
}
