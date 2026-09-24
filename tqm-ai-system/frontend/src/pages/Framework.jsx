import { useState, useEffect } from 'react'
import { Layers, ShieldCheck, Cpu, Users, Calendar, ArrowRight, CheckCircle2 } from 'lucide-react'
import { statisticsApi } from '../api/client'
import { PageHeader, StatCard, SectionCard, LoadingState, ErrorState, Alert } from '../components/ui'

export default function Framework() {
  const [framework, setFramework] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    statisticsApi.getFramework()
      .then(res => {
        setFramework(res.data)
        setLoading(false)
      })
      .catch(err => {
        setError('Failed to load TQM Framework.')
        setLoading(false)
      })
  }, [])

  if (loading) return <LoadingState rows={6} />
  if (error) return <ErrorState message={error} />

  const tierIcons = [ShieldCheck, Layers, Users, Cpu]

  return (
    <div>
      <PageHeader
        title="Prioritized TQM Implementation Framework"
        subtitle="Empirical 4-Tier quality architecture synthesized from FDM, RII rankings, and EFA dimensions for Coimbatore construction projects."
      />

      <div style={{ marginBottom: 24 }}>
        <Alert type="info">
          {framework?.framework_summary}
        </Alert>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
        {framework?.tiers?.map((tier, idx) => {
          const Icon = tierIcons[idx] || Layers
          return (
            <div key={tier.tier_id} className="card card-pad" style={{ borderLeft: '4px solid var(--orange)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12, flexWrap: 'wrap', gap: 10 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{
                    width: 38, height: 38, borderRadius: 8,
                    background: 'var(--orange-subtle)', color: 'var(--orange)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center'
                  }}>
                    <Icon size={20} />
                  </div>
                  <div>
                    <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>
                      {tier.level}
                    </h3>
                    <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginTop: 2 }}>
                      {tier.focus}
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'var(--bg-main)', border: '1px solid var(--border)', padding: '4px 10px', borderRadius: 6, fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                  <Calendar size={14} />
                  <span>{tier.implementation_horizon}</span>
                </div>
              </div>

              {/* Factors list */}
              <div style={{ margin: '14px 0', background: 'var(--bg-main)', borderRadius: 8, padding: '12px 16px', border: '1px solid var(--border)' }}>
                <div style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: 8, textTransform: 'uppercase', letterSpacing: 0.5 }}>
                  Governing Factors & RII Scores:
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                  {tier.factors && tier.factors.length > 0 ? (
                    tier.factors.map(f => (
                      <span key={f.code} style={{
                        background: '#fff', border: '1px solid var(--border)',
                        padding: '4px 10px', borderRadius: 6, fontSize: '0.8rem',
                        display: 'flex', alignItems: 'center', gap: 6
                      }}>
                        <strong style={{ color: 'var(--orange)', fontFamily: 'monospace' }}>{f.code}</strong>
                        <span>{f.name}</span>
                        <span className="badge badge-neutral" style={{ fontSize: '0.7rem' }}>
                          RII: {f.rii}
                        </span>
                      </span>
                    ))
                  ) : (
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Foundational alignment tier</span>
                  )}
                </div>
              </div>

              {/* Action */}
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10, marginTop: 12 }}>
                <ArrowRight size={16} color="var(--orange)" style={{ flexShrink: 0, marginTop: 3 }} />
                <div style={{ fontSize: '0.88rem', color: 'var(--text-primary)' }}>
                  <strong>Operational Mandate:</strong> {tier.key_action}
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
