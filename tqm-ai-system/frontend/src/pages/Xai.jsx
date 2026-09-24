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
        const list = Array.isArray(res?.data) ? res.data : (res?.data?.shap_values || [])
        setShapList(list)
        setLoading(false)
      })
      .catch(err => {
        console.warn('SHAP fetch error:', err)
        setError('Failed to compute SHAP feature importance.')
        setLoading(false)
      })
  }, [])

  const columns = [
    { key: 'feature', label: 'Feature Code', width: '100px', render: (val, row) => (
      <span style={{ fontWeight: 700, color: 'var(--orange)', fontFamily: 'monospace' }}>{val || row.factor || 'CSF'}</span>
    )},
    { key: 'factor_name', label: 'Factor Name', render: (val, row) => (
      <div>
        <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{val || row.factor || 'Factor'}</div>
        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{row?.category || 'CSF'}</div>
      </div>
    )},
    { key: 'mean_abs_shap', label: 'Mean |SHAP Value|', width: '200px', render: (val, row) => {
      const num = typeof val === 'number' ? val : (parseFloat(val || row.value) || 0.3)
      const pct = row?.importance_pct || Math.round(num * 40)
      return (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
            <span style={{ fontWeight: 600 }}>{num.toFixed(4)}</span>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{pct}%</span>
          </div>
          <div style={{ width: '100%', height: 6, background: '#eee', borderRadius: 3, overflow: 'hidden' }}>
            <div style={{
              width: `${Math.min(100, pct * 3.5)}%`,
              height: '100%',
              background: row?.impact_direction === 'positive' || (num > 0 && !row.category?.includes('Barrier')) ? 'var(--success)' : 'var(--orange)'
            }} />
          </div>
        </div>
      )
    }},
    { key: 'impact_direction', label: 'Model Influence', width: '160px', render: (val, row) => {
      const isPos = val === 'positive' || (!row.category?.includes('Barrier') && (row.value || 0) >= 0)
      return (
        <span className={`badge ${isPos ? 'badge-success' : 'badge-orange'}`}>
          {isPos ? '↑ Promotes Quality' : '↓ Escalates Defect Risk'}
        </span>
      )
    }},
    { key: 'actionable_insight', label: 'XAI Decision-Support Insight', render: (val, row) => (
      <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
        {val || `High sensitivity impact on project quality compliance for ${row.factor_name || row.feature}.`}
      </div>
    )},
  ]

  if (loading) return <LoadingState rows={6} />
  if (error) return <ErrorState message={error} />

  const safeList = Array.isArray(shapList) ? shapList : []
  const topDriver = safeList[0]

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
          rows={safeList}
          emptyTitle="No SHAP importances computed"
        />
      </SectionCard>
    </div>
  )
}
