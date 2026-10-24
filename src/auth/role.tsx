import { createContext, useContext, useState, type ReactNode, type ButtonHTMLAttributes } from 'react'
import { Link } from 'react-router-dom'
import { Lock, ShieldOff, Eye } from 'lucide-react'
import { ROLES, roleById, levelOf, rolesWith, type RoleId, type Level, type Cap, type RoleDef } from './permissions'

const KEY = 'edc1.role'
const initial = (): RoleId => {
  try { const v = localStorage.getItem(KEY) as RoleId | null; if (v && ROLES.some(r => r.id === v)) return v } catch { /* ignore */ }
  return 'steward'
}

interface RoleCtx { role: RoleId; def: RoleDef; setRole: (r: RoleId) => void; can: (cap: Cap) => boolean; level: (cap: Cap) => Level }
const Ctx = createContext<RoleCtx>(null as unknown as RoleCtx)

export function RoleProvider({ children }: { children: ReactNode }) {
  const [role, set] = useState<RoleId>(initial)
  const setRole = (r: RoleId) => { set(r); try { localStorage.setItem(KEY, r) } catch { /* ignore */ } }
  const level = (cap: Cap) => levelOf(role, cap)
  const can = (cap: Cap) => level(cap) === 'full'
  return <Ctx.Provider value={{ role, def: roleById(role), setRole, can, level }}>{children}</Ctx.Provider>
}

export const useRole = () => useContext(Ctx)

export const lockedHint = (cap: Cap, roleName: string) => {
  const who = rolesWith(cap).map(r => r.name)
  return `Not available for ${roleName}.${who.length ? ` Allowed: ${who.join(', ')}.` : ''}`
}

/** Button that is enabled only when the current role has full access to `cap`.
 *  hide=true removes it instead of showing a locked button. */
export function GuardBtn({ cap, hide, children, className = 'btn', title, ...rest }: { cap: Cap; hide?: boolean } & ButtonHTMLAttributes<HTMLButtonElement>) {
  const { can, def } = useRole()
  if (can(cap)) return <button className={className} title={title} {...rest}>{children}</button>
  if (hide) return null
  return (
    <button className={`${className} locked`} disabled title={lockedHint(cap, def.name)} aria-disabled>
      <Lock size={12} />{children}
    </button>
  )
}

/** Wrap a routed page: shows a friendly no-access state, or a read-only banner. */
export function PageGuard({ cap, children }: { cap: Cap; children: ReactNode }) {
  const { level, def, setRole } = useRole()
  const lv = level(cap)
  if (lv === 'none') {
    const allowed = rolesWith(cap, 'view')
    return (
      <div className="page">
        <div className="card no-access">
          <div className="na-icon"><ShieldOff size={26} /></div>
          <h2>This page isn’t available for {def.name}</h2>
          <p className="muted">Your current role doesn’t include access to this function in the EDC permission design. Switch to a role that has it, or ask a Platform Admin to assign the role.</p>
          {allowed.length > 0 && (
            <>
              <div className="faint small" style={{ marginBottom: 8 }}>Roles with access</div>
              <div className="row wrap" style={{ gap: 6, justifyContent: 'center' }}>
                {allowed.map(r => <button key={r.id} className="chip" onClick={() => setRole(r.id)}><i className="role-dot" style={{ background: r.color }} />Switch to {r.name}</button>)}
              </div>
            </>
          )}
          <div className="row" style={{ gap: 8, justifyContent: 'center', marginTop: 18 }}>
            <Link to="/" className="btn">Back to Home</Link>
            <Link to="/roles" className="btn primary">View Roles &amp; Permissions</Link>
          </div>
        </div>
      </div>
    )
  }
  return (
    <>
      {lv === 'view' && (
        <div className="ro-banner"><Eye size={14} /><span><b>View only</b> for {def.name} — create, edit and approve actions on this page are locked.</span><Link to="/roles" className="link-btn small" style={{ marginLeft: 'auto' }}>Why?</Link></div>
      )}
      {children}
    </>
  )
}
