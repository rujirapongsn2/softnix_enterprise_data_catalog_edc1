import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import './styles.css'
import { I18nProvider } from './i18n'
import { RoleProvider, PageGuard } from './auth/role'
import Roles from './pages/Roles'
import Layout from './components/Layout'
import Home from './pages/Home'
import Search from './pages/Search'
import AssetDetail from './pages/AssetDetail'
import Glossary from './pages/Glossary'
import Inbox from './pages/Inbox'
import Privacy from './pages/Privacy'
import Dashboard from './pages/Dashboard'
import Domains from './pages/Domains'
import Sources from './pages/Sources'
import { Observability, AlertSettings } from './pages/Qbd'
import { QualityOverview, Policies, Audit, Settings } from './pages/Misc'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <I18nProvider>
    <RoleProvider>
      <BrowserRouter>
        <Routes>
          <Route element={<Layout />}>
            <Route path="/" element={<PageGuard cap="page.home"><Home /></PageGuard>} />
            <Route path="/search" element={<PageGuard cap="page.search"><Search /></PageGuard>} />
            <Route path="/asset/:id" element={<PageGuard cap="page.asset"><AssetDetail /></PageGuard>} />
            <Route path="/glossary" element={<PageGuard cap="page.glossary"><Glossary /></PageGuard>} />
            <Route path="/glossary/:id" element={<PageGuard cap="page.glossary"><Glossary /></PageGuard>} />
            <Route path="/domains" element={<PageGuard cap="page.domains"><Domains /></PageGuard>} />
            <Route path="/inbox" element={<PageGuard cap="page.inbox"><Inbox /></PageGuard>} />
            <Route path="/privacy" element={<PageGuard cap="page.privacy"><Privacy /></PageGuard>} />
            <Route path="/quality" element={<PageGuard cap="page.quality"><QualityOverview /></PageGuard>} />
            <Route path="/observability" element={<PageGuard cap="page.observability"><Observability /></PageGuard>} />
            <Route path="/alerts" element={<PageGuard cap="page.alerts"><AlertSettings /></PageGuard>} />
            <Route path="/access" element={<PageGuard cap="page.access"><Policies /></PageGuard>} />
            <Route path="/dashboard" element={<PageGuard cap="page.dashboard"><Dashboard /></PageGuard>} />
            <Route path="/sources" element={<PageGuard cap="page.sources"><Sources /></PageGuard>} />
            <Route path="/audit" element={<PageGuard cap="page.audit"><Audit /></PageGuard>} />
            <Route path="/settings" element={<PageGuard cap="page.settings"><Settings /></PageGuard>} />
            <Route path="/roles" element={<PageGuard cap="page.roles"><Roles /></PageGuard>} />
            <Route path="*" element={<PageGuard cap="page.home"><Home /></PageGuard>} />
          </Route>
        </Routes>
      </BrowserRouter>
    </RoleProvider>
    </I18nProvider>
  </StrictMode>,
)
