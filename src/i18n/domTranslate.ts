import { TH_UI, TH_PATTERNS } from './th-ui'

/**
 * Thai mode for UI chrome without threading t() through every component.
 * While Thai is on, a MutationObserver rewrites rendered English text nodes and
 * placeholder/title/aria-label attributes that match the dictionary, and keeps the
 * English source so switching back to EN restores it exactly. React keeps owning the
 * nodes: when it re-renders a node, the observer sees the new English and translates again.
 * Code, monospace identifiers, form values and the bilingual Help panel are never touched.
 */
const SKIP = 'code,pre,.mono,script,style,textarea,input,[contenteditable],[data-no-tr],.help-panel,.msg,.bubble'
const ATTRS = ['placeholder', 'title', 'aria-label'] as const
const SEP = ' · '

const memo = new Map<string, string | null>()
export function translate(src: string): string | null {
  const key = src.replace(/\s+/g, ' ').trim()
  if (!key || !/[A-Za-z]/.test(key)) return null
  if (memo.has(key)) return memo.get(key)!
  let out: string | null = TH_UI[key] ?? null
  if (out === null && key.includes(SEP)) {
    const joined = key.split(SEP).map(p => translate(p) ?? p).join(SEP)
    if (joined !== key) out = joined
  }
  if (out === null) {
    let s = key
    for (const [re, fn] of TH_PATTERNS) s = s.replace(re, fn as (...a: string[]) => string)
    if (s !== key) out = s
  }
  memo.set(key, out)
  return out
}

interface Rec { src: string; out: string }
const textRec = new WeakMap<Text, Rec>()
const attrRec = new WeakMap<Element, Map<string, Rec>>()
const touched = new Set<Node>()

const skipped = (el: Element | null) => !!el && !!el.closest(SKIP)

function doText(n: Text) {
  const cur = n.nodeValue ?? ''
  const rec = textRec.get(n)
  if (rec && cur === rec.out) return
  const out = translate(cur)
  if (out === null) { if (rec) textRec.delete(n); return }
  const lead = cur.match(/^\s*/)![0], trail = cur.match(/\s*$/)![0]
  const value = lead + out + trail
  textRec.set(n, { src: cur, out: value })
  touched.add(n)
  n.nodeValue = value
}

function doAttrs(el: Element) {
  for (const a of ATTRS) {
    const cur = el.getAttribute(a)
    if (cur === null) continue
    let m = attrRec.get(el)
    const rec = m?.get(a)
    if (rec && cur === rec.out) continue
    const out = translate(cur)
    if (out === null) continue
    if (!m) { m = new Map(); attrRec.set(el, m) }
    m.set(a, { src: cur, out })
    touched.add(el)
    el.setAttribute(a, out)
  }
}

function walk(root: Node) {
  if (root.nodeType === Node.TEXT_NODE) { if (!skipped(root.parentElement)) doText(root as Text); return }
  if (!(root instanceof Element) || skipped(root)) return
  doAttrs(root)
  const w = document.createTreeWalker(root, NodeFilter.SHOW_TEXT | NodeFilter.SHOW_ELEMENT, {
    acceptNode: n => (n instanceof Element && n.matches(SKIP) ? NodeFilter.FILTER_REJECT : NodeFilter.FILTER_ACCEPT),
  })
  let n: Node | null
  while ((n = w.nextNode())) n.nodeType === Node.TEXT_NODE ? doText(n as Text) : doAttrs(n as Element)
}

let observer: MutationObserver | null = null

export function enableThai() {
  if (observer) return
  walk(document.body)
  observer = new MutationObserver(muts => {
    for (const m of muts) {
      if (m.type === 'characterData') { if (!skipped(m.target.parentElement)) doText(m.target as Text) }
      else if (m.type === 'attributes') { if (m.target instanceof Element && !skipped(m.target)) doAttrs(m.target) }
      else m.addedNodes.forEach(walk)
    }
  })
  observer.observe(document.body, { subtree: true, childList: true, characterData: true, attributes: true, attributeFilter: [...ATTRS] })
}

export function disableThai() {
  observer?.disconnect(); observer = null
  for (const n of touched) {
    if (!n.isConnected) continue
    if (n.nodeType === Node.TEXT_NODE) {
      const r = textRec.get(n as Text)
      if (r && n.nodeValue === r.out) n.nodeValue = r.src
      textRec.delete(n as Text)
    } else if (n instanceof Element) {
      attrRec.get(n)?.forEach((r, a) => { if (n.getAttribute(a) === r.out) n.setAttribute(a, r.src) })
      attrRec.delete(n)
    }
  }
  touched.clear()
}
