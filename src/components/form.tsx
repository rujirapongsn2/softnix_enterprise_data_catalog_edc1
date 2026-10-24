import { Fragment, useEffect, useState, type ReactNode } from 'react'
import { X, Eye, EyeOff, Lock, Check } from 'lucide-react'
import { people } from '../data/mock'

/* ---------- Modal shell used by every create form ---------- */
export function Modal({ title, sub, icon, size = 'md', onClose, children, footer, aside }: {
  title: ReactNode; sub?: ReactNode; icon?: ReactNode; size?: 'md' | 'lg' | 'xl'; onClose: () => void; children: ReactNode; footer: ReactNode; aside?: ReactNode
}) {
  useEffect(() => {
    const k = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', k)
    return () => window.removeEventListener('keydown', k)
  }, [onClose])
  return (
    <div className="modal-back" onMouseDown={onClose}>
      <div className={`modal form-modal ${size}`} onMouseDown={e => e.stopPropagation()} role="dialog" aria-modal aria-label={typeof title === 'string' ? title : undefined}>
        <div className="mh">
          {icon && <span className="mh-icon">{icon}</span>}
          <div className="grow"><b style={{ fontSize: 15 }}>{title}</b>{sub && <div className="faint small">{sub}</div>}</div>
          <button className="icon-btn" onClick={onClose} aria-label="Close"><X size={16} /></button>
        </div>
        <div className={aside ? 'm-split' : undefined}>
          {aside && <aside className="m-aside">{aside}</aside>}
          <div className="mb">{children}</div>
        </div>
        <div className="mf">{footer}</div>
      </div>
    </div>
  )
}

/* ---------- Field wrapper with label, required mark, hint and error ---------- */
export function Field({ label, required, hint, error, children, span, prd }: { label: string; required?: boolean; hint?: ReactNode; error?: string; children: ReactNode; span?: 1 | 2 | 3; prd?: string }) {
  return (
    <div className={`field ${error ? 'has-error' : ''}`} style={span ? { gridColumn: `span ${span}` } : undefined}>
      <div className="field-label">{label}{required && <span className="req">*</span>}{prd && <span className="prd-ref">{prd}</span>}</div>
      {children}
      {error ? <div className="field-error">{error}</div> : hint ? <div className="field-hint">{hint}</div> : null}
    </div>
  )
}

export function Section({ title, children, desc }: { title: string; desc?: ReactNode; children: ReactNode }) {
  return (
    <div className="form-section">
      <div className="fs-h"><b>{title}</b>{desc && <span className="faint small">{desc}</span>}</div>
      {children}
    </div>
  )
}

export const FormGrid = ({ cols = 2, children }: { cols?: 1 | 2 | 3; children: ReactNode }) => <div className={`form-grid c${cols}`}>{children}</div>

export function Input({ value, onChange, ...rest }: { value: string; onChange: (v: string) => void } & Omit<React.InputHTMLAttributes<HTMLInputElement>, 'value' | 'onChange'>) {
  return <input className="input w100" value={value} onChange={e => onChange(e.target.value)} {...rest} />
}

export function TextArea({ value, onChange, rows = 3, ...rest }: { value: string; onChange: (v: string) => void; rows?: number } & Omit<React.TextareaHTMLAttributes<HTMLTextAreaElement>, 'value' | 'onChange'>) {
  return <textarea className="input w100" rows={rows} value={value} onChange={e => onChange(e.target.value)} {...rest} />
}

export function Select({ value, onChange, options, placeholder }: { value: string; onChange: (v: string) => void; options: (string | [string, string])[]; placeholder?: string }) {
  return (
    <select className="input w100" value={value} onChange={e => onChange(e.target.value)}>
      {placeholder !== undefined && <option value="">{placeholder}</option>}
      {options.map(o => (Array.isArray(o) ? <option key={o[0]} value={o[0]}>{o[1]}</option> : <option key={o} value={o}>{o}</option>))}
    </select>
  )
}

/** Masked secret input. Values never leave the browser in this prototype. */
export function Secret({ value, onChange, placeholder, multiline }: { value: string; onChange: (v: string) => void; placeholder?: string; multiline?: boolean }) {
  const [show, setShow] = useState(false)
  if (multiline) return (
    <div className="secret">
      <textarea className="input w100 mono" rows={3} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder}
        style={{ WebkitTextSecurity: show ? 'none' : 'disc' } as React.CSSProperties} spellCheck={false} />
      <button type="button" className="icon-btn" onClick={() => setShow(s => !s)} aria-label={show ? 'Hide' : 'Show'}>{show ? <EyeOff size={14} /> : <Eye size={14} />}</button>
    </div>
  )
  return (
    <div className="secret">
      <Lock size={13} className="lk" />
      <input className="input w100" type={show ? 'text' : 'password'} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} autoComplete="new-password" spellCheck={false} />
      <button type="button" className="icon-btn" onClick={() => setShow(s => !s)} aria-label={show ? 'Hide' : 'Show'}>{show ? <EyeOff size={14} /> : <Eye size={14} />}</button>
    </div>
  )
}

export function Toggle({ checked, onChange, label, sub }: { checked: boolean; onChange: (v: boolean) => void; label: ReactNode; sub?: ReactNode }) {
  return (
    <label className="toggle-row" onClick={e => { e.preventDefault(); onChange(!checked) }}>
      <span className={`switch ${checked ? 'on' : ''}`} role="switch" aria-checked={checked}><i /></span>
      <span className="grow"><span>{label}</span>{sub && <span className="faint small" style={{ display: 'block' }}>{sub}</span>}</span>
    </label>
  )
}

export function Checks({ options, value, onChange }: { options: string[]; value: string[]; onChange: (v: string[]) => void }) {
  return (
    <div className="row wrap" style={{ gap: 6 }}>
      {options.map(o => {
        const on = value.includes(o)
        return <button type="button" key={o} className={`chip ${on ? 'on' : ''}`} onClick={() => onChange(on ? value.filter(x => x !== o) : [...value, o])}>{on && <Check size={11} />}{o}</button>
      })}
    </div>
  )
}

export function Radio<T extends string>({ value, onChange, options }: { value: T; onChange: (v: T) => void; options: { id: T; label: ReactNode; sub?: ReactNode }[] }) {
  return (
    <div className="radio-cards">
      {options.map(o => (
        <button type="button" key={o.id} className={`radio-card ${value === o.id ? 'on' : ''}`} onClick={() => onChange(o.id)}>
          <span className="rd" /><span><b>{o.label}</b>{o.sub && <span className="faint small" style={{ display: 'block' }}>{o.sub}</span>}</span>
        </button>
      ))}
    </div>
  )
}

export function TagInput({ value, onChange, placeholder = 'Type and press Enter' }: { value: string[]; onChange: (v: string[]) => void; placeholder?: string }) {
  const [t, setT] = useState('')
  const add = () => { const v = t.trim().replace(/^#/, ''); if (v && !value.includes(v)) onChange([...value, v]); setT('') }
  return (
    <div className="tag-input">
      {value.map(v => <span key={v} className="chip on">{v}<button type="button" onClick={() => onChange(value.filter(x => x !== v))} aria-label={`Remove ${v}`}><X size={11} /></button></span>)}
      <input value={t} onChange={e => setT(e.target.value)} placeholder={value.length ? '' : placeholder}
        onKeyDown={e => { if (e.key === 'Enter' || e.key === ',') { e.preventDefault(); add() } else if (e.key === 'Backspace' && !t && value.length) onChange(value.slice(0, -1)) }} onBlur={add} />
    </div>
  )
}

export function PersonSelect({ value, onChange, filter, placeholder = 'Select person…' }: { value: string; onChange: (v: string) => void; filter?: (title: string) => boolean; placeholder?: string }) {
  const list = Object.values(people).filter(p => !filter || filter(p.title))
  return <Select value={value} onChange={onChange} placeholder={placeholder} options={list.map(p => [p.id, `${p.name} · ${p.title}`] as [string, string])} />
}

/* ---------- Wizard stepper ---------- */
export function WizardSteps({ steps, cur, onGo, done }: { steps: string[]; cur: number; onGo: (i: number) => void; done: (i: number) => boolean }) {
  return (
    <ol className="wiz-steps">
      {steps.map((s, i) => (
        <li key={s} className={`${i === cur ? 'cur' : ''} ${i < cur && done(i) ? 'done' : ''}`}>
          <button type="button" onClick={() => i <= cur && onGo(i)} disabled={i > cur}>
            <span className="d">{i < cur && done(i) ? <Check size={11} /> : i + 1}</span><span>{s}</span>
          </button>
        </li>
      ))}
    </ol>
  )
}

/** Minimal validation helper: pass a map of field → error message (or '' when valid). */
export function useValidation() {
  const [tried, setTried] = useState(false)
  const show = (err: string) => (tried ? err || undefined : undefined)
  return { tried, setTried, show }
}

export const req = (v: string | unknown[] | undefined, msg = 'Required') => (Array.isArray(v) ? (v.length ? '' : msg) : (v ?? '').toString().trim() ? '' : msg)
export const anyErr = (errs: Record<string, string>) => Object.values(errs).some(Boolean)

export function ReviewList({ rows }: { rows: [string, ReactNode][] }) {
  return <dl className="kv review-kv">{rows.map(([k, v]) => <Fragment key={k}><dt>{k}</dt><dd>{v || <span className="faint">—</span>}</dd></Fragment>)}</dl>
}
