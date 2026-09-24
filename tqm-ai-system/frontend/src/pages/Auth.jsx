import { useState, useEffect } from 'react'
import { 
  User, ShieldCheck, Key, LogIn, LogOut, CheckCircle2, 
  Copy, Check, Eye, EyeOff, Shield, Award, AlertCircle, Sparkles, BookOpen
} from 'lucide-react'
import { authApi } from '../api/client'
import { PageHeader, StatCard, StatusBadge, Alert } from '../components/ui'

const PRECONFIGURED_ACCOUNTS = [
  {
    role: 'Admin',
    username: 'admin',
    password: 'secret',
    name: 'Dr. TQM Administrator',
    email: 'admin@tqm-research.org',
    badge: 'Full Access',
    color: '#EF4444',
    bg: 'rgba(239, 68, 68, 0.1)',
    border: 'rgba(239, 68, 68, 0.3)',
    desc: 'Full analytical & system administration: manage success factors, execute models, adjust weights, export master datasets.',
    permissions: ['Factor Management', 'FDM Execution', 'Statistical Suite', 'ML Training', 'Viva Simulator', 'System Config']
  },
  {
    role: 'Researcher',
    username: 'researcher',
    password: 'secret',
    name: 'TQM Research Scholar',
    email: 'scholar@tqm-research.org',
    badge: 'Analytical Suite',
    color: '#F97316',
    bg: 'rgba(249, 115, 22, 0.1)',
    border: 'rgba(249, 115, 22, 0.3)',
    desc: 'Core academic researcher: run FDM, RII, Cronbach’s Alpha, KMO/Bartlett, EFA, ANOVA, SHAP explanations, and Viva Voce defense.',
    permissions: ['FDM Calculations', 'Survey Analysis', 'EFA / Factor Structure', 'ANOVA Tests', 'ML & XAI Insights', 'Viva Defense']
  },
  {
    role: 'Respondent',
    username: 'respondent',
    password: 'secret',
    name: 'Er. K. Natarajan (Field Engineer)',
    email: 'respondent@tqm-coimbatore.org',
    badge: 'Field Survey',
    color: '#10B981',
    bg: 'rgba(16, 185, 129, 0.1)',
    border: 'rgba(16, 185, 129, 0.3)',
    desc: 'Construction professional in Coimbatore: fill out the 5-point Likert questionnaire and view personal submission summary.',
    permissions: ['5-Point Likert Survey', 'Questionnaire View', 'Personal Responses', 'TQM Framework Overview']
  },
  {
    role: 'Scholar',
    username: 'scholar',
    password: 'secret',
    name: 'TQM Academic Investigator',
    email: 'scholar@psgtech.ac.in',
    badge: 'Academic Co-PI',
    color: '#8B5CF6',
    bg: 'rgba(139, 92, 246, 0.1)',
    border: 'rgba(139, 92, 246, 0.3)',
    desc: 'Academic co-investigator examining TQM critical success factors across Coimbatore building & infrastructure projects.',
    permissions: ['Literature Review', 'FDM Panel Data', 'Descriptive Statistics', 'Action Roadmaps', 'Research Assistant']
  },
  {
    role: 'Expert',
    username: 'expert',
    password: 'secret',
    name: 'Chief Engr. R. Ramanathan',
    email: 'expert@tqm-panel.edu',
    badge: 'FDM Panelist',
    color: '#06B6D4',
    bg: 'rgba(6, 182, 212, 0.1)',
    border: 'rgba(6, 182, 212, 0.3)',
    desc: 'Senior construction expert (15+ yrs exp): provide triangular fuzzy number ratings for TQM success factors & barriers.',
    permissions: ['FDM Expert Rating', 'Fuzzy Delphi Scale', 'Consensus Threshold', 'Framework Validation']
  },
  {
    role: 'Viewer',
    username: 'viewer',
    password: 'secret',
    name: 'Academic External Evaluator',
    email: 'evaluator@aicte-india.org',
    badge: 'Read-Only Audit',
    color: '#64748B',
    bg: 'rgba(100, 116, 139, 0.1)',
    border: 'rgba(100, 116, 139, 0.3)',
    desc: 'External reviewer & thesis examiner: browse dashboard, view empirical statistics, inspect 4-tier framework and reports.',
    permissions: ['Read-Only Dashboard', 'Published Statistics', 'TQM Framework Audit', 'Export PDF/CSV Reports']
  }
]

export default function Auth() {
  const [currentUser, setCurrentUser] = useState(null)
  const [username, setUsername] = useState('admin')
  const [password, setPassword] = useState('secret')
  const [showPassword, setShowPassword] = useState(false)
  const [message, setMessage] = useState(null)
  const [errorMsg, setErrorMsg] = useState(null)
  const [loading, setLoading] = useState(false)
  const [copiedKey, setCopiedKey] = useState(null)

  const checkUser = () => {
    authApi.me()
      .then(res => {
        setCurrentUser(res.data)
      })
      .catch(() => setCurrentUser(null))
  }

  useEffect(() => {
    checkUser()
  }, [])

  const handleCopy = (text, key) => {
    navigator.clipboard?.writeText(text)
    setCopiedKey(key)
    setTimeout(() => setCopiedKey(null), 1800)
  }

  const performLogin = (u, p) => {
    setLoading(true)
    setMessage(null)
    setErrorMsg(null)
    authApi.login({ username: u.trim(), password: p })
      .then(res => {
        localStorage.setItem('tqm_access_token', res.data.access_token)
        setCurrentUser(res.data.user)
        setMessage(`Successfully authenticated as ${res.data.user.full_name} (${res.data.role})!`)
        setLoading(false)
      })
      .catch(err => {
        setLoading(false)
        const detail = err.response?.data?.detail || 'Authentication failed. Please check your credentials.'
        setErrorMsg(detail)
      })
  }

  const handleLoginSubmit = (e) => {
    e.preventDefault()
    performLogin(username, password)
  }

  const handleQuickRole = (acc) => {
    setUsername(acc.username)
    setPassword(acc.password)
    performLogin(acc.username, acc.password)
  }

  const handleSelectAccountToForm = (acc) => {
    setUsername(acc.username)
    setPassword(acc.password)
    setMessage(null)
    setErrorMsg(null)
  }

  const handleLogout = () => {
    localStorage.removeItem('tqm_access_token')
    setCurrentUser(null)
    setMessage('Session logged out successfully.')
    setErrorMsg(null)
  }

  const currentAccount = PRECONFIGURED_ACCOUNTS.find(
    a => a.username.toLowerCase() === currentUser?.username?.toLowerCase()
  ) || PRECONFIGURED_ACCOUNTS[0]

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto' }}>
      <PageHeader
        title="Account & Role-Based Access Control (RBAC)"
        subtitle="Manage JWT authentication, permissions, and academic research session roles for the Coimbatore TQM study."
      />

      {/* Top Stat Cards */}
      <div className="stat-grid" style={{ marginBottom: 24 }}>
        <StatCard
          icon={User}
          label="Active Session"
          value={currentUser?.full_name || 'Guest / Unauthenticated'}
          meta={`Username: @${currentUser?.username || 'none'}`}
        />
        <StatCard
          icon={ShieldCheck}
          label="Current Role"
          value={currentUser?.role || 'Guest'}
          meta={currentUser ? `${currentAccount.badge} Permissions` : 'Sign in to access analytics'}
        />
        <StatCard
          icon={Key}
          label="Token Status"
          value={localStorage.getItem('tqm_access_token') ? 'Active JWT' : 'No Token'}
          meta={localStorage.getItem('tqm_access_token') ? 'Bearer authorization active' : 'Click Quick Login below'}
        />
      </div>

      {/* Notifications */}
      {message && (
        <div style={{ marginBottom: 20 }}>
          <Alert type="success">{message}</Alert>
        </div>
      )}
      {errorMsg && (
        <div style={{ marginBottom: 20 }}>
          <Alert type="error">{errorMsg}</Alert>
        </div>
      )}

      {/* Prominent Quick-Login All Roles Grid */}
      <div className="card card-pad" style={{ marginBottom: 24 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12, marginBottom: 16 }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <Sparkles size={18} color="var(--orange)" />
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>
                Pre-Configured Academic Login Accounts & Credentials
              </h3>
            </div>
            <p style={{ fontSize: '0.84rem', color: 'var(--text-secondary)', marginTop: 4, marginBottom: 0 }}>
              Standard password for ALL accounts is: <strong style={{ color: 'var(--orange)', fontFamily: 'monospace', fontSize: '0.92rem' }}>secret</strong>. Click any card to instantly log in or auto-fill credentials.
            </p>
          </div>
          {currentUser && (
            <button 
              onClick={handleLogout}
              className="btn btn-sm btn-outline"
              style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--text-secondary)' }}
            >
              <LogOut size={14} />
              Sign Out
            </button>
          )}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 16 }}>
          {PRECONFIGURED_ACCOUNTS.map(acc => {
            const isActive = currentUser?.username?.toLowerCase() === acc.username.toLowerCase()
            return (
              <div 
                key={acc.username}
                style={{
                  border: isActive ? `2px solid ${acc.color}` : '1px solid var(--border)',
                  background: isActive ? acc.bg : 'var(--bg-card)',
                  borderRadius: 12,
                  padding: 16,
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  gap: 12,
                  transition: 'all 0.2s ease',
                  boxShadow: isActive ? `0 4px 16px ${acc.bg}` : 'none'
                }}
              >
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span 
                        style={{
                          fontSize: '0.72rem',
                          fontWeight: 700,
                          padding: '3px 8px',
                          borderRadius: 9999,
                          background: acc.bg,
                          color: acc.color,
                          border: `1px solid ${acc.border}`,
                          textTransform: 'uppercase'
                        }}
                      >
                        {acc.role}
                      </span>
                      <span style={{ fontSize: '0.76rem', color: 'var(--text-muted)' }}>
                        {acc.badge}
                      </span>
                    </div>
                    {isActive ? (
                      <span className="badge badge-success" style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                        <CheckCircle2 size={12} /> Active
                      </span>
                    ) : null}
                  </div>

                  <div style={{ fontWeight: 700, fontSize: '0.98rem', color: 'var(--text-primary)', marginBottom: 2 }}>
                    {acc.name}
                  </div>
                  <div style={{ fontSize: '0.76rem', color: 'var(--text-muted)', marginBottom: 10 }}>
                    {acc.email}
                  </div>

                  <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: 1.4, margin: '0 0 12px 0' }}>
                    {acc.desc}
                  </p>

                  {/* ID and Password badge box */}
                  <div 
                    style={{
                      background: 'var(--bg-main)',
                      borderRadius: 8,
                      padding: '8px 12px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      fontSize: '0.8rem',
                      fontFamily: 'monospace',
                      border: '1px solid var(--border)',
                      marginBottom: 8
                    }}
                  >
                    <div>
                      <span style={{ color: 'var(--text-muted)' }}>ID: </span>
                      <strong style={{ color: 'var(--text-primary)' }}>{acc.username}</strong>
                      <span style={{ margin: '0 8px', color: 'var(--border)' }}>|</span>
                      <span style={{ color: 'var(--text-muted)' }}>Pass: </span>
                      <strong style={{ color: 'var(--orange)' }}>{acc.password}</strong>
                    </div>
                    <button
                      onClick={() => handleCopy(`${acc.username}:${acc.password}`, acc.username)}
                      title="Copy ID & Password"
                      style={{
                        background: 'none', border: 'none', cursor: 'pointer',
                        color: copiedKey === acc.username ? 'var(--green)' : 'var(--text-muted)',
                        padding: 2
                      }}
                    >
                      {copiedKey === acc.username ? <Check size={14} /> : <Copy size={14} />}
                    </button>
                  </div>

                  {/* Permissions tags */}
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginTop: 4 }}>
                    {acc.permissions.map((p, i) => (
                      <span 
                        key={i} 
                        style={{
                          fontSize: '0.68rem',
                          background: 'var(--bg-main)',
                          color: 'var(--text-muted)',
                          padding: '2px 6px',
                          borderRadius: 4,
                          border: '1px solid var(--border)'
                        }}
                      >
                        {p}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Action buttons */}
                <div style={{ display: 'flex', gap: 8, marginTop: 4 }}>
                  <button
                    onClick={() => handleQuickRole(acc)}
                    disabled={loading}
                    className="btn btn-sm"
                    style={{
                      flex: 1,
                      background: isActive ? 'var(--bg-main)' : acc.color,
                      color: isActive ? 'var(--text-primary)' : '#FFFFFF',
                      border: isActive ? `1px solid ${acc.color}` : 'none',
                      fontWeight: 600,
                      cursor: 'pointer',
                      borderRadius: 6,
                      padding: '8px 12px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: 6
                    }}
                  >
                    <LogIn size={13} />
                    {isActive ? 'Switch Session' : `Login as ${acc.role}`}
                  </button>

                  <button
                    onClick={() => handleSelectAccountToForm(acc)}
                    className="btn btn-sm btn-outline"
                    title="Fill into form"
                    style={{ padding: '8px 10px' }}
                  >
                    Auto-Fill
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Manual Login Form & Session Security Info */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: 20 }}>
        {/* Credentials Form */}
        <div className="card card-pad">
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
            <Key size={18} color="var(--orange)" />
            <h3 style={{ fontSize: '1.05rem', fontWeight: 600, color: 'var(--text-primary)', margin: 0 }}>
              Manual JWT Authentication
            </h3>
          </div>
          <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginBottom: 16 }}>
            Sign in with your registered username and password to issue a verified JWT bearer token:
          </p>

          <form onSubmit={handleLoginSubmit}>
            <div style={{ marginBottom: 14 }}>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 4 }}>
                Username / User ID
              </label>
              <input
                type="text"
                className="text-input"
                value={username}
                onChange={e => setUsername(e.target.value)}
                placeholder="e.g. admin, researcher, respondent..."
                style={{ width: '100%', padding: '10px 12px' }}
                required
              />
            </div>

            <div style={{ marginBottom: 18 }}>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 4 }}>
                Password
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  type={showPassword ? 'text' : 'password'}
                  className="text-input"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="Enter password (default: secret)"
                  style={{ width: '100%', padding: '10px 38px 10px 12px' }}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(v => !v)}
                  style={{
                    position: 'absolute',
                    right: 10,
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none',
                    border: 'none',
                    color: 'var(--text-muted)',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center'
                  }}
                  title={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <button 
              type="submit" 
              className="btn btn-primary" 
              style={{ width: '100%', padding: '11px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }} 
              disabled={loading}
            >
              <LogIn size={16} />
              {loading ? 'Authenticating...' : 'Sign In with JWT'}
            </button>
          </form>
        </div>

        {/* Current Session Security & Token Summary */}
        <div className="card card-pad">
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
            <Shield size={18} color="var(--orange)" />
            <h3 style={{ fontSize: '1.05rem', fontWeight: 600, color: 'var(--text-primary)', margin: 0 }}>
              Session & Security Diagnostics
            </h3>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid var(--border)' }}>
              <span style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>Status:</span>
              <span style={{ fontSize: '0.82rem', fontWeight: 600, color: currentUser ? 'var(--green)' : 'var(--text-muted)' }}>
                {currentUser ? '● Logged In (Authenticated)' : '○ Guest Mode'}
              </span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid var(--border)' }}>
              <span style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>Session User:</span>
              <span style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                {currentUser?.full_name || 'Anonymous Guest'}
              </span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid var(--border)' }}>
              <span style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>Assigned Role:</span>
              <span 
                style={{ 
                  fontSize: '0.78rem', 
                  fontWeight: 700, 
                  color: currentAccount.color, 
                  background: currentAccount.bg, 
                  padding: '2px 8px', 
                  borderRadius: 6,
                  border: `1px solid ${currentAccount.border}` 
                }}
              >
                {currentUser?.role || 'Guest'}
              </span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid var(--border)' }}>
              <span style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>Bearer Token:</span>
              <span style={{ fontSize: '0.75rem', fontFamily: 'monospace', color: 'var(--text-muted)' }}>
                {localStorage.getItem('tqm_access_token') 
                  ? `${localStorage.getItem('tqm_access_token').substring(0, 16)}...` 
                  : 'None'
                }
              </span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0' }}>
              <span style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>Scope:</span>
              <span style={{ fontSize: '0.82rem', color: 'var(--text-primary)', textAlign: 'right' }}>
                Coimbatore Construction TQM Research
              </span>
            </div>

            {currentUser && (
              <button 
                onClick={handleLogout}
                className="btn btn-outline"
                style={{ width: '100%', marginTop: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}
              >
                <LogOut size={15} />
                Log Out of Current Session
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
