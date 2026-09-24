import { useState, useEffect } from 'react'
import { Sparkles, TrendingUp, TrendingDown, HelpCircle, ArrowUpRight } from 'lucide-react'
import { xaiApi } from '../api/client'
import { PageHeader, StatCard, SectionCard, DataTable, LoadingState, ErrorState, Alert } from '../components/ui'

export default function Xai() {
  const [shapList, setShapList] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    xaiApi.getShap()
      .then(res => {
        setShapList(res.data)
        setLoading(false)
      })
      .catch(err => {
        setError('Failed to compute SHAP feature importance.')
        setLoading(false)
      })
  }, [])

  const columns = [
    { key: 'feature', label: 'Feature Code', width: '100px', render: (val) => (
      <span style={{ fontWeight: 700, color: 'var(--orange)', fontFamily: 'monospace' }}>{val}</span>
    )},
    { key: 'factor_name', label: 'Factor Name', render: (val, row) => (
      <div>
        <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{val}</div>
        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{row.category}</div>
      </div>
    )},
    { key: 'mean_abs_shap', label: 'Mean |SHAP Value|', width: '200px', render: (val, row) => (
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
          <span style={{ fontWeight: 600 }}>{val.toFixed(4)}</span>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{row.importance_pct}%</span>
        </div>
        <div style={{ width: '100%', height: 6, background: '#eee', borderRadius: 3, overflow: 'hidden' }}>
          <div style={{
            width: `${Math.min(100, row.importance_pct * 3.5)}%`,
            height: '100%',
            background: row.impact_direction === 'positive' ? 'var(--success)' : 'var(--orange)'
          }} />
        </div>
      </div>
    )},
    { key: 'impact_direction', label: 'Model Influence', width: '160px', render: (val) => (
      <span className={`badge ${val === 'positive' ? 'badge-success' : 'badge-orange'}`}>
        {val === 'positive' ? '↑ Promotes Quality' : '↓ Escalates Defect Risk'}
      </span>
    )},
    { key: 'actionable_insight', label: 'XAI Decision-Support Insight', render: (val) => (
      <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>{val}</div>
    )},
  ]

  if (loading) return <LoadingState rows={6} />
  if (error) return <ErrorState message={error} />

  const topDriver = shapList[0]

  return (
    <div>
      <PageHeader
        title="Model Explanation (SHAP / Explainable AI)"
        subtitle="Unpacks black-box machine learning decisions using Shapley Additive exPlanations (Lundberg & Lee, 2017)."
      />

      <div className="stat-grid" style={{ marginBottom: 24 }}>
        <StatCard
          icon={Sparkles}
          label="#1 Quality Driver"
          value={topDriver ? `${topDriver.feature}` : '—'}
          meta={topDriver?.factor_name || 'Top Management'}
        />
        <StatCard
          icon={TrendingUp}
          label="XAI Methodology"
          value="Tree & Linear SHAP"
          meta="Mathematically fair attribution"
        />
        <StatCard
          icon={HelpCircle}
          label="Features Analyzed"
          value={shapList.length}
          meta="16 Empirical TQM Factors"
        />
      </div>

      <div style={{ marginBottom: 20 }}>
        <Alert type="info">
          <strong>Decision-Support Interpretability:</strong> Positive SHAP values indicate factors that actively drive
          zero-defect project delivery. Negative barrier features indicate vulnerabilities that, if unmitigated, rapidly
          lead to structural rework and contract disputes.
        </Alert>
      </div>

      <SectionCard
        title="Global SHAP Feature Importance Rankings"
        subtitle="Ranked by mean absolute Shapley values across the 120 empirical construction observations."
      >
        <DataTable
          columns={columns}
          rows={shapList}
          emptyTitle="No SHAP importances computed"
        />
      </SectionCard>
    </div>
  )
}
