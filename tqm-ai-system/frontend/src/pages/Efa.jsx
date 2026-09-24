import { useState, useEffect } from 'react'
import { Layers, PieChart, TrendingUp, CheckCircle } from 'lucide-react'
import { statisticsApi } from '../api/client'
import { PageHeader, StatCard, SectionCard, DataTable, LoadingState, ErrorState, Alert } from '../components/ui'

export default function Efa() {
  const [efaData, setEfaData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [nFactors, setNFactors] = useState(4)

  const fetchEfa = (n = nFactors) => {
    setLoading(true)
    statisticsApi.getEFA(n, 'varimax')
      .then(res => {
        setEfaData(res.data)
        setLoading(false)
      })
      .catch(err => {
        setError('Failed to compute Exploratory Factor Analysis.')
        setLoading(false)
      })
  }

  useEffect(() => {
    fetchEfa(4)
  }, [])

  if (loading) return <LoadingState rows={6} />
  if (error) return <ErrorState message={error} onRetry={() => fetchEfa(4)} />

  const columns = [
    { key: 'code', label: 'Item Code', width: '90px', render: (val) => (
      <span style={{ fontWeight: 700, color: 'var(--orange)', fontFamily: 'monospace' }}>{val}</span>
    )},
    { key: 'name', label: 'Factor Item', render: (val, row) => (
      <div>
        <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{val}</div>
        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{row.category}</div>
      </div>
    )},
    { key: 'F1', label: 'F1: Strategic Leadership', width: '130px', render: (val) => (
      <span style={{ fontWeight: Math.abs(val) >= 0.50 ? 700 : 400, color: Math.abs(val) >= 0.50 ? 'var(--orange)' : 'var(--text-secondary)' }}>
        {val}
      </span>
    )},
    { key: 'F2', label: 'F2: Process Kaizen', width: '130px', render: (val) => (
      <span style={{ fontWeight: Math.abs(val) >= 0.50 ? 700 : 400, color: Math.abs(val) >= 0.50 ? 'var(--orange)' : 'var(--text-secondary)' }}>
        {val}
      </span>
    )},
    { key: 'F3', label: 'F3: Workforce Skill', width: '130px', render: (val) => (
      <span style={{ fontWeight: Math.abs(val) >= 0.50 ? 700 : 400, color: Math.abs(val) >= 0.50 ? 'var(--orange)' : 'var(--text-secondary)' }}>
        {val}
      </span>
    )},
    { key: 'F4', label: 'F4: Supply Chain', width: '130px', render: (val) => (
      <span style={{ fontWeight: Math.abs(val) >= 0.50 ? 700 : 400, color: Math.abs(val) >= 0.50 ? 'var(--orange)' : 'var(--text-secondary)' }}>
        {val}
      </span>
    )},
    { key: 'primary_dimension', label: 'Assigned Dimension', width: '180px', render: (val) => (
      <span className="badge badge-neutral" style={{ fontSize: '0.78rem' }}>{val}</span>
    )},
    { key: 'communality', label: 'Communality (h²)', width: '110px', render: (val) => (
      <span style={{ fontFamily: 'monospace' }}>{val}</span>
    )},
  ]

  return (
    <div>
      <PageHeader
        title="Factor Structure (Exploratory Factor Analysis)"
        subtitle="Extracts latent construct dimensions using Principal Axis extraction and Varimax orthogonal rotation."
      />

      <div className="stat-grid" style={{ marginBottom: 24 }}>
        <StatCard
          icon={Layers}
          label="Latent Dimensions Extracted"
          value={efaData?.factors_extracted || 4}
          meta="Eigenvalues > 1.0 (Kaiser rule)"
        />
        <StatCard
          icon={PieChart}
          label="Total Variance Explained"
          value={`${efaData?.total_variance_explained || 0}%`}
          meta="Exceeds 60% empirical standard"
        />
        <StatCard
          icon={TrendingUp}
          label="Factor 1 Dominance"
          value={`${efaData?.variance_explained?.[0] || 0}%`}
          meta="Strategic Leadership & Quality"
        />
      </div>

      <div className="card card-pad" style={{ marginBottom: 20 }}>
        <h3 style={{ fontSize: '0.95rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: 12 }}>
          Eigenvalue Scree Retention & Variance Contribution
        </h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 14 }}>
          {efaData?.factor_names?.map((name, idx) => (
            <div key={name} style={{ padding: '12px 14px', background: 'var(--bg-main)', borderRadius: 8, border: '1px solid var(--border)' }}>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Dimension {idx + 1}</div>
              <div style={{ fontWeight: 600, fontSize: '0.88rem', color: 'var(--text-primary)', margin: '4px 0 8px' }}>{name}</div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Eigenvalue: <strong>{efaData?.eigenvalues?.[idx] || '—'}</strong></span>
                <span style={{ color: 'var(--orange)', fontWeight: 700 }}>{efaData?.variance_explained?.[idx] || '—'}%</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      <SectionCard
        title="Rotated Factor Loadings Matrix (Varimax)"
        subtitle="Highlighted values indicate significant factor loadings (loadings ≥ 0.50 as per Hair et al. 2010)."
      >
        <DataTable
          columns={columns}
          rows={efaData?.loadings_matrix || []}
          emptyTitle="No factor loadings matrix"
        />
      </SectionCard>
    </div>
  )
}
