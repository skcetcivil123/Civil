/**
 * TopBar — sticky page header with page title + system status.
 * Reads current route to display contextual title and subtitle.
 */
import { useLocation } from 'react-router-dom'
import { Menu, X, Wifi, WifiOff, Database, Sparkles } from 'lucide-react'

const ROUTE_META = {
  '/':               { title: 'Dashboard',             subtitle: 'Overview of your TQM research progress' },
  '/factors':        { title: 'Literature & Factors',  subtitle: 'Manage TQM factors identified from literature' },
  '/literature':     { title: 'Literature Review',     subtitle: 'Academic sources and TQM factor extraction' },
  '/experts':        { title: 'Expert Consensus',      subtitle: 'Fuzzy Delphi panel and linguistic ratings' },
  '/fdm':            { title: 'Expert Consensus',      subtitle: 'FDM analysis — factor acceptance threshold' },
  '/questionnaire':  { title: 'Questionnaire',         subtitle: 'Design and manage the survey instrument' },
  '/survey':         { title: 'Survey',                subtitle: 'Collect responses from construction professionals' },
  '/statistics':     { title: 'Survey Analysis',       subtitle: 'Descriptive statistics and factor priority ranking' },
  '/rii':            { title: 'Factor Priority',       subtitle: 'Relative Importance Index ranking' },
  '/reliability':    { title: 'Questionnaire Reliability', subtitle: "Cronbach's Alpha — internal consistency" },
  '/kmo':            { title: 'Data Suitability',      subtitle: 'KMO and Bartlett test before factor analysis' },
  '/efa':            { title: 'Factor Structure',      subtitle: 'Exploratory Factor Analysis — factor grouping' },
  '/anova':          { title: 'Group Comparison',      subtitle: 'ANOVA — differences between respondent groups' },
  '/framework':      { title: 'TQM Framework',         subtitle: 'Prioritized TQM implementation framework' },
  '/ml':             { title: 'Predictive Analysis',   subtitle: 'Machine learning on survey data' },
  '/models':         { title: 'Model Comparison',      subtitle: 'Compare predictive model performance' },
  '/xai':            { title: 'Model Explanation',     subtitle: 'SHAP — understand factor contributions' },
  '/recommendations':{ title: 'Recommendations',       subtitle: 'Evidence-based TQM improvement actions' },
  '/chatbot':        { title: 'Research Assistant',    subtitle: 'Ask questions about the project and methodology' },
  '/viva':           { title: 'Viva Practice',         subtitle: 'Test your understanding of the research' },
  '/reports':        { title: 'Reports',               subtitle: 'Generate and download research reports' },
  '/admin':          { title: 'Settings',              subtitle: 'System configuration and user management' },
  '/auth':           { title: 'Account',               subtitle: 'Authentication and access control' },
}

export default function TopBar({ sidebarOpen, onToggleSidebar, systemHealth }) {
  const { pathname } = useLocation()
  const meta = ROUTE_META[pathname] || { title: 'TQM Research', subtitle: '' }
  const apiOk = systemHealth?.status === 'ok'
  const dbOk  = systemHealth?.mongodb === 'connected'

  return (
    <header className="top-header">
      {/* Hamburger — mobile only */}
      <button
        onClick={onToggleSidebar}
        aria-label="Toggle navigation"
        style={{
          display: 'none',
          width: 36, height: 36,
          borderRadius: 'var(--radius-md)',
          border: '1px solid var(--border)',
          background: 'transparent',
          cursor: 'pointer',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'var(--text-secondary)',
          flexShrink: 0,
        }}
        className="mobile-menu-btn"
      >
        {sidebarOpen ? <X size={18} /> : <Menu size={18} />}
      </button>

      {/* Page title */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontWeight: 700, fontSize: '1rem', color: 'var(--text-primary)', lineHeight: 1.2, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
          {meta.title}
        </div>
        {meta.subtitle && (
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {meta.subtitle}
          </div>
        )}
      </div>

      {/* Status indicators */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
        {systemHealth === null ? (
          <div className="skeleton" style={{ width: 72, height: 22, borderRadius: 9999 }} />
        ) : apiOk ? (
          <span className="badge badge-success" title="API connected">
            <Wifi size={11} /> Connected
          </span>
        ) : (
          <span className="badge badge-error" title="API not reachable">
            <WifiOff size={11} /> Offline
          </span>
        )}

        {systemHealth !== null && (
          <span
            className={`badge ${dbOk ? 'badge-success' : 'badge-neutral'}`}
            title={dbOk ? 'Connected to MongoDB Atlas' : 'Operating on Dual-Mode In-Memory Store'}
          >
            <Database size={11} />
            {dbOk ? 'Atlas DB' : 'Local DB'}
          </span>
        )}

        {/* Explain Screen with AI Button */}
        <button
          onClick={() => window.dispatchEvent(new CustomEvent('tqm:explain-screen'))}
          className="btn btn-sm"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 5,
            background: 'linear-gradient(135deg, #F97316 0%, #EA580C 100%)',
            color: '#FFFFFF',
            fontWeight: 600,
            borderRadius: 9999,
            padding: '5px 12px',
            fontSize: '0.78rem',
            border: 'none',
            cursor: 'pointer',
            boxShadow: '0 2px 8px rgba(249, 115, 22, 0.25)',
          }}
          title="Explain current screen with AI"
        >
          <Sparkles size={13} />
          <span>Explain Screen</span>
        </button>
      </div>
    </header>
  )
}
