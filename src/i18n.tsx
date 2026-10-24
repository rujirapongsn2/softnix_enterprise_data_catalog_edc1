import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import { enableThai, disableThai } from './i18n/domTranslate'

export type Lang = 'en' | 'th'

const dict = {
  home: ['Home', 'หน้าแรก'],
  discover: ['Discover', 'ค้นหาข้อมูล'],
  search: ['Search', 'ค้นหา'],
  browse: ['Browse', 'เรียกดู'],
  glossary: ['Business Glossary', 'อภิธานศัพท์ธุรกิจ'],
  products: ['Domains & Products', 'โดเมนและ Data Product'],
  lineage: ['Lineage', 'สายข้อมูล'],
  govern: ['Govern', 'ธรรมาภิบาล'],
  inbox: ['My Tasks', 'งานของฉัน'],
  privacy: ['Privacy & PDPA', 'ความเป็นส่วนตัวและ PDPA'],
  quality: ['Data Quality', 'คุณภาพข้อมูล'],
  observability: ['Observability', 'การเฝ้าระวังข้อมูล'],
  alerts: ['Alert Settings', 'ตั้งค่าการแจ้งเตือน'],
  contract: ['Contract', 'สัญญาข้อมูล'],
  policies: ['Policies & Access', 'นโยบายและสิทธิ์'],
  insights: ['Governance Dashboard', 'แดชบอร์ดธรรมาภิบาล'],
  admin: ['Administration', 'ผู้ดูแลระบบ'],
  connectors: ['Sources & Harvest', 'แหล่งข้อมูลและการดึง Metadata'],
  audit: ['Audit Trail', 'ประวัติการตรวจสอบ'],
  settings: ['Settings', 'ตั้งค่า'],
  collapse: ['Collapse', 'ย่อเมนู'],
  searchPh: ['Search tables, columns, terms, reports… (EN/TH)', 'ค้นหาตาราง คอลัมน์ คำศัพท์ รายงาน… (ไทย/อังกฤษ)'],
  askSoftnix: ['Ask Softnix', 'ถาม Softnix'],
  overview: ['Overview', 'ภาพรวม'],
  columns: ['Columns', 'คอลัมน์'],
  dq: ['Data Quality', 'คุณภาพข้อมูล'],
  access: ['Access', 'สิทธิ์การเข้าถึง'],
  history: ['History', 'ประวัติ'],
  discussion: ['Discussion', 'พูดคุย'],
  owner: ['Owner', 'เจ้าของข้อมูล'],
  steward: ['Steward', 'ผู้ดูแลข้อมูล'],
  domain: ['Domain', 'โดเมน'],
  classification: ['Classification', 'ชั้นความลับ'],
  description: ['Description', 'คำอธิบาย'],
  requestAccess: ['Request access', 'ขอสิทธิ์'],
  follow: ['Follow', 'ติดตาม'],
  reportIssue: ['Report issue', 'แจ้งปัญหา'],
  openSql: ['Open in SQL editor', 'เปิดใน SQL editor'],
  welcome: ['Good morning', 'สวัสดีตอนเช้า'],
} as const

type Key = keyof typeof dict

type DateStyle = 'long' | 'medium'
interface I18n { lang: Lang; setLang: (l: Lang) => void; t: (k: Key) => string; fmtDate: (d: Date, style?: DateStyle) => string }

const LANG_KEY = 'edc1.lang'
const initialLang = (): Lang => { try { return localStorage.getItem(LANG_KEY) === 'th' ? 'th' : 'en' } catch { return 'en' } }

/** Thai dates use the Buddhist calendar (พ.ศ.), as Thai users expect. */
const formatDate = (lang: Lang, d: Date, style: DateStyle = 'medium') =>
  new Intl.DateTimeFormat(lang === 'th' ? 'th-TH-u-ca-buddhist' : 'en-GB',
    style === 'long' ? { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' } : { day: 'numeric', month: 'short', year: 'numeric' }).format(d)

const Ctx = createContext<I18n>({ lang: 'en', setLang: () => {}, t: k => dict[k][0], fmtDate: (d, s) => formatDate('en', d, s) })

export function I18nProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>(initialLang)
  const setLang = (l: Lang) => { setLangState(l); try { localStorage.setItem(LANG_KEY, l) } catch { /* ignore */ } }
  useEffect(() => {
    document.documentElement.lang = lang
    if (lang === 'th') enableThai(); else disableThai()
  }, [lang])
  const t = (k: Key) => dict[k][lang === 'en' ? 0 : 1]
  const fmtDate = (d: Date, style?: DateStyle) => formatDate(lang, d, style)
  return <Ctx.Provider value={{ lang, setLang, t, fmtDate }}>{children}</Ctx.Provider>
}

export const useI18n = () => useContext(Ctx)
