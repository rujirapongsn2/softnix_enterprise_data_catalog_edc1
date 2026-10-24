import { createContext, useContext, useState, type ReactNode } from 'react'

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

const Ctx = createContext<{ lang: Lang; setLang: (l: Lang) => void; t: (k: Key) => string }>({
  lang: 'en', setLang: () => {}, t: k => dict[k][0],
})

export function I18nProvider({ children }: { children: ReactNode }) {
  const [lang, setLang] = useState<Lang>('en')
  const t = (k: Key) => dict[k][lang === 'en' ? 0 : 1]
  return <Ctx.Provider value={{ lang, setLang, t }}>{children}</Ctx.Provider>
}

export const useI18n = () => useContext(Ctx)
