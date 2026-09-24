import { useState, useEffect } from 'react'
import { Users, Filter, CheckCircle2, AlertTriangle } from 'lucide-react'
import { statisticsApi } from '../api/client'
import { PageHeader, StatCard, SectionCard, DataTable, LoadingState, ErrorState, Alert } from '../components/ui'

export default function Anova() {
  const [anovaList, setAnovaList] = useState([])
  const [groupBy, setGroupBy] = useState('experience')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchAnova = (group = groupBy) => {
    setLoading(true)
    statisticsApi.getANOVA(group)
      .then(res => {
        setAnovaList(res.data)
        setLoading(false)
      })
      .catch(err => {
        setError('Failed to compute ANOVA.')
        setLoading(false)
      })
  }

  useEffect(() => {
    fetchAnova(groupBy)
  }, [groupBy])

  const significantCount = anovaList.filter(a => a.is_significant).length
  const consensusCount = anovaList.length - significantCount

  const columns = [
    { key: 'factor_code', label: 'Code', width: '90px', render: (val) => (
      <span style={{ fontWeight: 700, color: 'var(--orange)', fontFamily: 'monospace' }}>{val}</span>
    )},
    { key: 'factor_name', label: 'Factor Name', render: (val, row) => (
      <div>
        <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{val}</div>
        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{row.category}</div>
      </div>
    )},
    { key: 'f_statistic', label: 'F-Statistic', width: '120px', render: (val) => (
      <span style={{ fontWeight: 600 }}>{val}</span>
    )},
    { key: 'p_value', label: 'p-Value', width: '120px', render: (val) => (
      <span style={{ fontWeight: 700, color: val < 0.05 ? 'var(--orange)' : 'var(--text-secondary)' }}>
        {val < 0.001 ? '< 0.001' : val}
      </span>
    )},
    { key: 'eta_squared', label: 'Effect Size (η²)', width: '130px', render: (val) => (
      <span style={{ fontFamily: 'monospace' }}>{val}</span>
    )},
    { key: 'is_significant', label: 'Hypothesis Decision', width: '160px', render: (val) => (
      <span className={`badge ${val ? 'badge-orange' : 'badge-success'}`}>
        {val ? 'Differs Across Groups' : 'Shared Consensus (p ≥ 0.05)'}
      </span>
    )},
    { key: 'group_means', label: 'Group Mean Breakdown', render: (val) => (
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
        {val && Object.entries(val).map(([gName, meanVal]) => (
          <span key={gName} style={{ background: 'var(--bg-main)', border: '1px solid var(--border)', fontSize: '0.75rem', padding: '2px 6px', borderRadius: 4 }}>
            {gName}: <strong>{meanVal}</strong>
          </span>
        ))}
      </div>
    )},
  ]

  if (loading) return <LoadingState rows={6} />
  if (error) return <ErrorState message={error} onRetry={() => fetchAnova(groupBy)} />

  return (
    <div>
      <PageHeader
        title="Group Comparison (One-Way ANOVA)"
        subtitle="Tests whether respondent perceptions of TQM CSFs and Barriers differ significantly across professional demographics."
        action={
          <div style={{ display: 'flex', gap: 6 }}>
            {[
              { id: 'experience', label: 'Experience Level' },
              { id: 'role', label: 'Job Role' },
              { id: 'project_type', label: 'Project Type' },
              { id: 'organization_type', label: 'Organization Type' },
            ].map(tab => (
              <button
                key={tab.id}
                className={`btn btn-sm ${groupBy === tab.id ? 'btn-primary' : 'btn-ghost'}`}
                onClick={() => setGroupBy(tab.id)}
              >
                {tab.label}
              </button>
            ))}
          </div>
        }
      />

      <div className="stat-grid" style={{ marginBottom: 24 }}>
        <StatCard
          icon={CheckCircle2}
          label="Consensus Factors (p ≥ 0.05)"
          value={consensusCount}
          meta="Uniform agreement across roles"
        />
        <StatCard
          icon={AlertTriangle}
          label="Divergent Factors (p < 0.05)"
          value={significantCount}
          meta="Perceptions vary by demographic"
        />
        <StatCard
          icon={Users}
          label="Current Grouping Variable"
          value={groupBy.replace('_', ' ').toUpperCase()}
          meta="One-Way ANOVA F-test"
        />
      </div>

      <SectionCard
        title={`ANOVA Results Grouped by ${groupBy.replace('_', ' ').toUpperCase()}`}
        subtitle="Factors with p < 0.05 indicate statistically significant divergence between groups; factors with p ≥ 0.05 confirm cross-industry consensus."
      >
        <DataTable
          columns={columns}
          rows={anovaList}
          emptyTitle="No ANOVA results"
        />
      </SectionCard>
    </div>
  )
}
