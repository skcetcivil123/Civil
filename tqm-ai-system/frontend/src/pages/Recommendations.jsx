import { useState, useEffect } from 'react'
import { Lightbulb, CheckCircle2, AlertTriangle, ArrowRight, ShieldCheck, Clock } from 'lucide-react'
import { recommendationsApi } from '../api/client'
import { PageHeader, StatCard, SectionCard, LoadingState, ErrorState, Alert } from '../components/ui'

export default function Recommendations() {
  const [recommendations, setRecommendations] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [filterUrgency, setFilterUrgency] = useState('ALL')

  useEffect(() => {
    recommendationsApi.getAll()
      .then(res => {
        const recList = Array.isArray(res?.data) ? res.data : (res?.data?.recommendations || [])
        setRecommendations(recList)
        setLoading(false)
      })
      .catch(err => {
        console.warn('Recommendations fetch error:', err)
        setError('Failed to load recommendations.')
        setLoading(false)
      })
  }, [])

  if (loading) return <LoadingState rows={6} />
  if (error) return <ErrorState message={error} />

  const recList = Array.isArray(recommendations) ? recommendations : []
  const filtered = filterUrgency === 'ALL'
    ? recList
    : recList.filter(r => (r?.urgency || '').toLowerCase().includes(filterUrgency.toLowerCase()))

  return (
    <div>
      <PageHeader
        title="Evidence-Based Recommendations & Action Plans"
        subtitle="Operational guidance tailored for construction contractors, consultants, and clients in Coimbatore / Tamil Nadu."
        action={
          <div style={{ display: 'flex', gap: 6 }}>
            {['ALL', 'Immediate', 'High', 'Medium'].map(u => (
              <button
                key={u}
                className={`btn btn-sm ${filterUrgency === u ? 'btn-primary' : 'btn-ghost'}`}
                onClick={() => setFilterUrgency(u)}
              >
                {u === 'ALL' ? 'All Plans' : u}
              </button>
            ))}
          </div>
        }
      />

      <div className="stat-grid" style={{ marginBottom: 24 }}>
        <StatCard icon={Lightbulb} label="Strategic Roadmaps" value={recommendations.length} meta="Evidence-based solutions" />
        <StatCard icon={Clock} label="Immediate Priorities" value="2 Plans" meta="Days 1 - 45 implementation" />
        <StatCard icon={ShieldCheck} label="Primary Target" value="Zero Rework" meta="35-40% defect reduction" />
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
        {filtered.map(rec => (
          <div key={rec.id} className="card card-pad" style={{ borderLeft: '4px solid var(--orange)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8, flexWrap: 'wrap', gap: 10 }}>
              <div>
                <span className="badge badge-orange" style={{ fontSize: '0.72rem', marginBottom: 6, display: 'inline-block' }}>
                  Target: {rec.target_factor} • {rec.category}
                </span>
                <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>
                  {rec.title}
                </h3>
              </div>
              <span className={`badge ${rec.urgency.startsWith('Immediate') ? 'badge-error' : 'badge-orange'}`}>
                {rec.urgency}
              </span>
            </div>

            <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', margin: '8px 0 14px' }}>
              {rec.description}
            </p>

            {/* Action items list */}
            <div style={{ background: 'var(--bg-main)', borderRadius: 8, padding: '12px 16px', border: '1px solid var(--border)', marginBottom: 14 }}>
              <div style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: 6, textTransform: 'uppercase' }}>
                Implementation Action Checklist:
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                {(rec.action_items || []).map((act, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 8, fontSize: '0.84rem', color: 'var(--text-primary)' }}>
                    <CheckCircle2 size={15} color="var(--success)" style={{ flexShrink: 0, marginTop: 3 }} />
                    <span>{act}</span>
                  </div>
                ))}
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.82rem', color: 'var(--text-primary)', background: '#f0fdf4', padding: '8px 12px', borderRadius: 6, border: '1px solid #bbf7d0' }}>
              <strong style={{ color: '#166534' }}>Measurable ROI & Impact:</strong>
              <span>{rec.expected_impact}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
