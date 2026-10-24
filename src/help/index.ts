// Help content loader. The data comes from help-content/<lang>/<page>.md, compiled by
// scripts/build-help-index.mjs (npm run help:index) into ./help-index.json.
// The same file is served at /help/help-index.json and chunked into /help/help-chunks.jsonl for Chat/RAG.
import { matchPath } from 'react-router-dom'
import raw from './help-index.json'
import type { Lang } from '../i18n'

export interface HelpSection { anchor: string; heading: string; markdown: string }
export interface HelpPage {
  page_id: string; lang: Lang; title: string; nav_label: string; section: string
  routes: string[]; roles_full: string[]; roles_view: string[]; keywords: string[]; related: string[]
  prd: string; summary: string; last_updated: string; version: string; source_file: string
  sections: HelpSection[]
}
interface HelpIndex { schema_version: number; generated_at: string; langs: Lang[]; pages: HelpPage[] }

const index = raw as unknown as HelpIndex
export const FALLBACK_PAGE = 'getting-started'

export function helpPage(pageId: string, lang: Lang): HelpPage | undefined {
  return index.pages.find(p => p.page_id === pageId && p.lang === lang)
    ?? index.pages.find(p => p.page_id === pageId && p.lang === 'en')
}

/** Help page for a URL path, e.g. "/asset/gold-customer-360" -> asset-detail. Falls back to Getting started. */
export function helpForPath(pathname: string, lang: Lang): HelpPage {
  const hit = index.pages.find(p => p.lang === lang && p.routes.some(r => matchPath({ path: r, end: true }, pathname)))
  return hit ? helpPage(hit.page_id, lang)! : helpPage(FALLBACK_PAGE, lang)!
}

/** First route of a page with params filled with a sensible demo target, for "Related pages" links. */
export function linkFor(p: HelpPage): string | undefined {
  const r = p.routes[0]
  if (!r) return undefined
  return r.replace(':id', p.page_id === 'asset-detail' ? 'gold-customer-360' : 'active-customer')
}
