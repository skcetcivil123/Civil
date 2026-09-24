/**
 * Sidebar — professional white/orange navigation.
 * Complete navigation covering every single research, statistical, AI, and defense module.
 */
import { useState, useEffect } from 'react'
import { NavLink } from 'react-router-dom'
import { authApi } from '../api/client'
import {
  LayoutDashboard, BookOpen, Users, Calculator, ClipboardList,
  FileSpreadsheet, BarChart2, ShieldCheck, CheckCircle2, Layers,
  Award, Lightbulb, BrainCircuit, Sparkles, MessageSquare,
  GraduationCap, FileText, Settings, User, ClipboardCheck
} from 'lucide-react'

const NAV = [
  {
    group: null,
    items: [
      { to: '/', label: 'Dashboard', icon: LayoutDashboard, end: true },
    ]
  },
  {
    group: 'Research Foundation',
    items: [
      { to: '/factors',       label: 'Literature & Factors',  icon: BookOpen },
      { to: '/experts',       label: 'FDM Expert Panel',      icon: Users },
      { to: '/fdm',           label: 'FDM Consensus Engine',  icon: Calculator },
      { to: '/questionnaire', label: 'Survey Instrument',     icon: ClipboardList },
      { to: '/survey',        label: 'Data Collection (N=120)',icon: FileSpreadsheet },
    ]
  },
  {
    group: 'Statistical Analysis',
    items: [
      { to: '/statistics',    label: 'Descriptive & RII',     icon: BarChart2 },
      { to: '/reliability',   label: "Reliability (Cronbach α)", icon: ShieldCheck },
      { to: '/kmo',           label: 'Suitability (KMO/Bartlett)', icon: CheckCircle2 },
      { to: '/efa',           label: 'Factor Structure (EFA)', icon: Layers },
      { to: '/anova',         label: 'Group Comparison (ANOVA)', icon: BarChart2 },
    ]
  },
  {
    group: 'Framework & Machine Learning',
    items: [
      { to: '/framework',       label: '4-Tier TQM Framework', icon: Award },
      { to: '/recommendations', label: 'Action Roadmaps',      icon: Lightbulb },
      { to: '/audit',           label: 'Site Audit & CoQ Model', icon: ClipboardCheck },
      { to: '/ml',              label: 'Predictive ML Models', icon: BrainCircuit },
      { to: '/xai',             label: 'SHAP Explainability',  icon: Sparkles },
    ]
  },
  {
    group: 'Assistant & Viva Defense',
    items: [
      { to: '/chatbot',  label: 'AI Research Assistant', icon: MessageSquare },
      { to: '/viva',     label: 'Viva Voce Simulator',   icon: GraduationCap },
      { to: '/reports',  label: 'Reports & CSV Export',  icon: FileText },
    ]
  },
  {
    group: 'Administration',
    items: [
      { to: '/admin', label: 'System Settings', icon: Settings },
      { to: '/auth',  label: 'Account & Roles', icon: User },
    ]
  },
]

function NavItem({ item, onClose }) {
  const Icon = item.icon
  return (
    <NavLink
      to={item.to}
      end={item.end}
      onClick={onClose}
      className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`}
    >
      <Icon size={16} className="nav-item-icon" />
      <span style={{ flex: 1, fontSize: '0.84rem' }}>{item.label}</span>
    </NavLink>
  )
}

export default function Sidebar({ open, onClose }) {
  const [user, setUser] = useState(null)

  useEffect(() => {
    const updateUser = () => {
      authApi.me()
        .then(res => setUser(res.data))
        .catch(() => setUser(null))
    }
    updateUser()
    window.addEventListener('tqm:auth-changed', updateUser)
    return () => window.removeEventListener('tqm:auth-changed', updateUser)
  }, [])

  return (
    <>
      {open && (
        <div className="sidebar-overlay" onClick={onClose} style={{ display: 'block' }} />
      )}

      <aside className={`sidebar${open ? ' open' : ''}`}>
        {/* Brand */}
        <div className="sidebar-brand">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{
                width: 34, height: 34, borderRadius: 8,
                background: 'linear-gradient(135deg, #F97316, #EA580C)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                flexShrink: 0,
              }}>
                <Award size={17} color="#fff" />
              </div>
              <div>
                <div style={{ fontWeight: 700, fontSize: '0.875rem', color: 'var(--text-primary)', lineHeight: 1.2 }}>
                  TQM Research
                </div>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: 1 }}>
                  Decision Support System
                </div>
              </div>
            </div>

            {/* Mobile close button */}
            <button
              onClick={onClose}
              className="sidebar-close-btn"
              aria-label="Close sidebar"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Navigation */}
        <div className="sidebar-scroll">
          {NAV.map((section, si) => (
            <div key={si} style={{ marginBottom: 6 }}>
              {section.group && (
                <span className="sidebar-section-label">{section.group}</span>
              )}
              <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 1, margin: 0, padding: 0 }}>
                {section.items.map(item => (
                  <li key={item.to}>
                    <NavItem item={item} onClose={onClose} />
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* User footer — interactive link to /auth */}
        <div className="sidebar-footer">
          <NavLink 
            to="/auth" 
            onClick={onClose}
            style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: 10, 
              padding: '8px',
              textDecoration: 'none',
              borderRadius: 8,
              transition: 'background 0.15s ease'
            }}
            className="sidebar-user-link"
          >
            <div style={{
              width: 32, height: 32, borderRadius: '50%',
              background: 'var(--orange-subtle)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              flexShrink: 0,
            }}>
              <User size={15} color="var(--orange)" />
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-primary)', lineHeight: 1.2, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {user?.full_name || 'TQM Scholar'}
              </div>
              <div style={{ fontSize: '0.7rem', color: 'var(--orange)', fontWeight: 600, marginTop: 1 }}>
                Role: {user?.role || 'Researcher'}
              </div>
            </div>
          </NavLink>
        </div>
      </aside>
    </>
  )
}

