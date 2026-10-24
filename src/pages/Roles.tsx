import { Fragment, useState } from 'react'
import { SHOW_SPEC_REFS } from '../demo'
import { Check, Eye, Minus, ShieldCheck, UserPlus, Users, RotateCcw, Info } from 'lucide-react'
import { FUNCTIONS, ROLES, type Level, type RoleId } from '../auth/permissions'
import { useRole, GuardBtn } from '../auth/role'
import { people } from '../data/mock'
import { useStored, resetStored } from '../data/store'
import { Avatar, Card, Tabs, Seg } from '../components/ui'
import { useShell } from '../components/Layout'
import { InviteUserForm, GroupMappingForm, type NewUser, type NewMapping } from '../forms/Forms'

const LV: Record<Level, [string, React.ReactNode]> = {
  full: ['Allowed', <Check key="f" size={12} />], view: ['View only', <Eye key="v" size={12} />], none: ['None', <Minus key="n" size={12} />],
}
export const PermCell = ({ l }: { l: Level }) => <span className={`perm ${l}`} title={LV[l][0]}>{LV[l][1]}{LV[l][0]}</span>

const baseUsers: { id: string; person: string; email: string; roles: RoleId[]; domains: string[]; via: string }[] = [
  { id: 'u1', person: 'ton', email: 'thanawat.k@corp.co.th', roles: ['consumer'], domains: [], via: 'grp_customer_analytics' },
  { id: 'u2', person: 'nida', email: 'nida.c@corp.co.th', roles: ['steward'], domains: ['Customer'], via: 'grp_customer_stewards' },
  { id: 'u3', person: 'mai', email: 'maitree.l@corp.co.th', roles: ['steward'], domains: ['Finance', 'Sales'], via: 'grp_finance_stewards' },
  { id: 'u4', person: 'somchai', email: 'somchai.w@corp.co.th', roles: ['owner', 'council'], domains: ['Customer', 'Marketing'], via: 'Direct assignment' },
  { id: 'u5', person: 'kan', email: 'kanokwan.t@corp.co.th', roles: ['owner'], domains: ['Finance', 'Sales', 'HR', 'Operations'], via: 'Direct assignment' },
  { id: 'u6', person: 'arthit', email: 'arthit.p@corp.co.th', roles: ['custodian'], domains: [], via: 'grp_data_engineering' },
  { id: 'u7', person: 'pim', email: 'pimchanok.s@corp.co.th', roles: ['dpo'], domains: [], via: 'Direct assignment · MFA' },
  { id: 'u8', person: 'prasert', email: 'prasert.j@corp.co.th', roles: ['council'], domains: [], via: 'grp_dg_council' },
  { id: 'u9', person: 'suda', email: 'suda.a@corp.co.th', roles: ['auditor'], domains: [], via: 'grp_internal_audit' },
  { id: 'u10', person: 'wichai', email: 'wichai.r@corp.co.th', roles: ['admin'], domains: [], via: 'Direct assignment · MFA' },
]
const baseMappings: { group: string; role: RoleId; domain: string }[] = [
  { group: 'grp_customer_analytics', role: 'consumer', domain: 'All domains' },
  { group: 'grp_customer_stewards', role: 'steward', domain: 'Customer' },
  { group: 'grp_finance_stewards', role: 'steward', domain: 'Finance' },
  { group: 'grp_data_engineering', role: 'custodian', domain: 'All domains' },
  { group: 'grp_dg_council', role: 'council', domain: 'All domains' },
  { group: 'grp_internal_audit', role: 'auditor', domain: 'All domains' },
]
const roleName = (r: RoleId) => ROLES.find(x => x.id === r)!.name

export default function Roles() {
  const { role, setRole } = useRole()
  const { toast } = useShell()
  const [tab, setTab] = useState<'matrix' | 'roles' | 'users'>('matrix')
  const [kind, setKind] = useState<'all' | 'page' | 'action'>('all')
  const [users, addUser] = useStored<NewUser>('users')
  const [maps, addMap] = useStored<NewMapping>('groupMappings')
  const [invite, setInvite] = useState(false)
  const [mapOpen, setMapOpen] = useState(false)

  const list = FUNCTIONS.filter(f => kind === 'all' || f.kind === kind)
  const groups = [...new Set(list.map(f => (f.kind === 'page' ? `Pages · ${f.group}` : `Actions · ${f.group}`)))]

  return (
    <div className="page">
      <div className="page-h">
        <div><h1>Roles &amp; Permissions</h1><div className="sub">DAMA-DMBOK2 roles · RBAC with domain scope · one matrix drives every menu, page and button in this prototype</div></div>
        <div className="actions">
          <button className="btn ghost" onClick={() => { resetStored(); toast('Demo records created in forms were cleared') }}><RotateCcw size={14} />Reset demo data</button>
        </div>
      </div>

      <div className="card">
        <div style={{ padding: '0 16px' }}><Tabs value={tab} onChange={setTab} items={[
          { id: 'matrix', label: <span className="row"><ShieldCheck size={14} />Permission matrix</span>, n: FUNCTIONS.length },
          { id: 'roles', label: 'Roles', n: ROLES.length },
          { id: 'users', label: <span className="row"><Users size={14} />Users &amp; groups</span>, n: baseUsers.length + users.length },
        ]} /></div>

        {tab === 'matrix' && (
          <>
            <div className="row wrap" style={{ padding: '10px 16px', gap: 10, borderBottom: '1px solid var(--border)' }}>
              <Seg value={kind} onChange={setKind} items={[{ id: 'all', label: 'All' }, { id: 'page', label: 'Pages' }, { id: 'action', label: 'Actions' }]} />
              <span className="row small" style={{ gap: 8 }}><PermCell l="full" /><span className="faint">use &amp; change</span><PermCell l="view" /><span className="faint">read only</span><PermCell l="none" /><span className="faint">hidden / locked</span></span>
              <span className="faint small" style={{ marginLeft: 'auto' }}>Highlighted column = your current role · click a role header to switch</span>
            </div>
            <div className="tbl-wrap">
              <table className="tbl matrix">
                <thead>
                  <tr>
                    <th style={{ minWidth: 240 }}>Function</th><th>Where</th>{SHOW_SPEC_REFS && <th>PRD</th>}
                    {ROLES.map(r => (
                      <th key={r.id} className={`rc ${r.id === role ? 'me' : ''}`}>
                        <button className="link-btn" style={{ color: r.id === role ? 'var(--primary-700)' : 'var(--text-2)', fontWeight: 600, fontSize: 11.5 }} onClick={() => setRole(r.id)} title={`Switch to ${r.name}`}>
                          <i className="role-dot" style={{ background: r.color, marginRight: 4 }} />{r.name}
                        </button>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {groups.map(g => (
                    <Fragment key={g}>
                      <tr className="cur-group"><td colSpan={(SHOW_SPEC_REFS ? 3 : 2) + ROLES.length}>{g}</td></tr>
                      {list.filter(f => (f.kind === 'page' ? `Pages · ${f.group}` : `Actions · ${f.group}`) === g).map(f => (
                        <tr key={f.id}>
                          <td><b style={{ fontWeight: 500 }}>{f.label}</b><div className="faint mono" style={{ fontSize: 11.5 }}>{f.id}</div></td>
                          <td className="small muted">{f.where}</td>
                          {SHOW_SPEC_REFS && <td className="mono faint small">{f.prd}</td>}
                          {ROLES.map(r => <td key={r.id} className={`rc ${r.id === role ? 'me' : ''}`}><PermCell l={f.levels[r.id]} /></td>)}
                        </tr>
                      ))}
                    </Fragment>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="row small faint" style={{ padding: '10px 16px', gap: 6 }}><Info size={13} />Owner and Steward rights apply within their assigned domains; Restricted / PII data adds attribute rules (ABAC by classification, NFR-01) — e.g. sensitive access also needs the DPO step.</div>
          </>
        )}

        {tab === 'roles' && (
          <div className="card-b grid g4">
            {ROLES.map(r => {
              const full = FUNCTIONS.filter(f => f.levels[r.id] === 'full').length
              const view = FUNCTIONS.filter(f => f.levels[r.id] === 'view').length
              const p = people[r.persona]
              return (
                <div key={r.id} className="card" style={{ padding: 14, borderTop: `3px solid ${r.color}`, display: 'flex', flexDirection: 'column', gap: 8, background: r.id === role ? 'var(--primary-50)' : undefined }}>
                  <div className="row"><b className="grow">{r.name}</b>{r.id === role && <span className="badge blue">current</span>}</div>
                  <div className="faint small">{r.th}</div>
                  <div className="small muted">{r.duty}</div>
                  <div className="small"><b>EDC rights:</b> {r.rights}</div>
                  <div className="row small" style={{ gap: 6 }}><PermCell l="full" /><b>{full}</b><PermCell l="view" /><b>{view}</b></div>
                  <div className="row small" style={{ marginTop: 'auto', paddingTop: 8, borderTop: '1px solid var(--border)' }}><Avatar id={r.persona} size="sm" /><span className="grow">{p?.name}<span className="faint"> · demo persona</span></span></div>
                  <button className="btn sm" disabled={r.id === role} onClick={() => setRole(r.id)}>{r.id === role ? 'You are using this role' : 'Switch to this role'}</button>
                </div>
              )
            })}
          </div>
        )}

        {tab === 'users' && (
          <div className="card-b grid g3">
            <Card className="span2" title="Users" actions={<GuardBtn cap="user.manage" className="btn sm primary" onClick={() => setInvite(true)}><UserPlus size={13} />Invite user</GuardBtn>}>
              <div className="tbl-wrap">
                <table className="tbl">
                  <thead><tr><th>User</th><th>Roles</th><th>Domain scope</th><th>Assigned via</th><th>Status</th></tr></thead>
                  <tbody>
                    {users.map(u => (
                      <tr key={u.id} className="new-row">
                        <td><div className="row"><span className="avatar sm" style={{ background: '#64748b' }}>{u.name.split(' ').map(s => s[0]).slice(0, 2).join('')}</span><div><b>{u.name}</b><div className="faint small">{u.email}</div></div></div></td>
                        <td className="small">{u.roles.map(roleName).join(', ')}</td><td className="small">{u.domains.join(', ') || 'All'}</td>
                        <td className="small muted">Invitation{u.mfa ? ' · MFA' : ''}{u.expires ? ` · until ${u.expires}` : ''}</td><td><span className="badge amber">Invited</span></td>
                      </tr>
                    ))}
                    {baseUsers.map(u => (
                      <tr key={u.id}>
                        <td><div className="row"><Avatar id={u.person} size="sm" /><div><b>{people[u.person].name}</b><div className="faint small">{u.email}</div></div></div></td>
                        <td className="small">{u.roles.map(roleName).join(', ')}</td><td className="small">{u.domains.join(', ') || 'All'}</td>
                        <td className="small muted mono">{u.via}</td><td><span className="badge green">Active</span></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
            <Card title="IdP group → role mapping" actions={<GuardBtn cap="user.manage" className="btn sm" onClick={() => setMapOpen(true)}>+ Add</GuardBtn>}>
              {[...maps, ...baseMappings].map((m, i) => (
                <div key={m.group + i} className="row small" style={{ padding: '7px 0', borderBottom: '1px solid var(--border)', background: 'isNew' in m ? '#f3f9fd' : undefined }}>
                  <span className="mono grow">{m.group}</span><span className="badge blue">{roleName(m.role)}</span><span className="faint">{m.domain}</span>
                </div>
              ))}
              <div className="faint small" style={{ marginTop: 8 }}>OIDC via Keycloak · claims mapped at sign-in · no passwords stored in EDC</div>
            </Card>
          </div>
        )}
      </div>

      {invite && <InviteUserForm onClose={() => setInvite(false)} onCreate={u => { addUser(u); setInvite(false); toast(`Invitation sent to ${u.email}`) }} />}
      {mapOpen && <GroupMappingForm onClose={() => setMapOpen(false)} onCreate={m => { addMap(m); setMapOpen(false); toast(`${m.group} → ${roleName(m.role)}`) }} />}
    </div>
  )
}
