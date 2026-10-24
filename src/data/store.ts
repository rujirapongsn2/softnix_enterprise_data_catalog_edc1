// Tiny localStorage-backed list for records created in the prototype's forms.
// Items created by forms are prepended to the mock data and survive reloads; "Reset demo data" on the
// Roles & Permissions page clears them.
import { useEffect, useState } from 'react'

const PREFIX = 'edc1.data.'
const EVT = 'edc1-store'

function read<T>(key: string): T[] {
  try { return JSON.parse(localStorage.getItem(PREFIX + key) ?? '[]') as T[] } catch { return [] }
}

export function useStored<T>(key: string): [T[], (item: T) => void] {
  const [items, setItems] = useState<T[]>(() => read<T>(key))
  useEffect(() => {
    const on = () => setItems(read<T>(key))
    window.addEventListener(EVT, on)
    return () => window.removeEventListener(EVT, on)
  }, [key])
  const add = (item: T) => {
    const next = [item, ...read<T>(key)]
    localStorage.setItem(PREFIX + key, JSON.stringify(next))
    window.dispatchEvent(new Event(EVT))
  }
  return [items, add]
}

export function resetStored() {
  Object.keys(localStorage).filter(k => k.startsWith(PREFIX)).forEach(k => localStorage.removeItem(k))
  window.dispatchEvent(new Event(EVT))
}

export const newId = (prefix: string) => `${prefix}-${Math.floor(1000 + Math.random() * 9000)}`
