import { useState, useEffect } from 'react'
import { Settings, Database, Shield, Server, RefreshCw } from 'lucide-react'
import { healthApi } from '../api/client'
import { PageHeader, StatCard, SectionCard, StatusBadge, LoadingState } from '../components/ui'

export default function Admin() {
  const [health, setHealth] = useState(null)
  const [loading, setLoading] = useState(true)

  const checkHealth = () => {
    setLoading(true)
    healthApi.get()
      .then(res => {
        setHealth(res.data)
        setLoading(false)
      })
      .catch(() => {
        setHealth({ status: 'offline', mongodb: 'disconnected' })
        setLoading(false)
      })
  }

  useEffect(() => {
    checkHealth()
  }, [])

  if (loading) return <LoadingState rows={5} />

  return (
    <div>
      <PageHeader
        title="System Administration & Database Governance"
        subtitle="Monitors system uptime, API endpoints, persistence architecture, and audit integrity."
        action={
          <button className="btn btn-ghost btn-sm" onClick={checkHealth}>
            <RefreshCw size={14} style={{ marginRight: 6 }} />
            Refresh Status
          </button>
        }
      />

      <div className="stat-grid" style={{ marginBottom: 24 }}>
        <StatCard
          icon={Server}
          label="FastAPI Backend"
          value={health?.status === 'ok' ? 'Online' : 'Offline'}
          meta={`Version ${health?.version || '1.0.0'}`}
        />
        <StatCard
          icon={Database}
          label="Database Persistence"
          value={health?.mongodb === 'connected' ? 'MongoDB Atlas' : 'In-Memory Store'}
          meta={health?.mongodb === 'connected' ? 'Live Cluster' : 'Active Offline Fallback'}
        />
        <StatCard
          icon={Shield}
          label="Security & RBAC"
          value="JWT Active"
          meta="HS256 Encryption"
        />
      </div>

      <SectionCard
        title="Platform Architecture & Configuration"
        subtitle="Dual-mode repository ensures uninterrupted research functionality whether MongoDB Atlas is online or operating in offline defense mode."
      >
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 16 }}>
          <div style={{ padding: '14px', background: 'var(--bg-main)', borderRadius: 8, border: '1px solid var(--border)' }}>
            <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Research Jurisdiction</div>
            <div style={{ fontWeight: 600, fontSize: '0.95rem', color: 'var(--text-primary)', marginTop: 4 }}>
              Coimbatore / Tamil Nadu
            </div>
            <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginTop: 4 }}>
              Target: 120 Building & Infrastructure Projects
            </div>
          </div>

          <div style={{ padding: '14px', background: 'var(--bg-main)', borderRadius: 8, border: '1px solid var(--border)' }}>
            <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Analytical Engines</div>
            <div style={{ fontWeight: 600, fontSize: '0.95rem', color: 'var(--text-primary)', marginTop: 4 }}>
              FDM + EFA + ANOVA + ML
            </div>
            <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginTop: 4 }}>
              NumPy, Pandas, Scipy, Factor-Analyzer, XGBoost
            </div>
          </div>

          <div style={{ padding: '14px', background: 'var(--bg-main)', borderRadius: 8, border: '1px solid var(--border)' }}>
            <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Data Privacy</div>
            <div style={{ fontWeight: 600, fontSize: '0.95rem', color: 'var(--text-primary)', marginTop: 4 }}>
              Anonymized Survey Records
            </div>
            <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginTop: 4 }}>
              No confidential contractor telemetry stored
            </div>
          </div>
        </div>
      </SectionCard>
    </div>
  )
}
