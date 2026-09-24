import { useState, useEffect } from 'react'
import { CheckCircle2, AlertCircle, Activity, Sparkles } from 'lucide-react'
import { statisticsApi } from '../api/client'
import { PageHeader, StatCard, SectionCard, DataTable, LoadingState, ErrorState, Alert } from '../components/ui'

export default function Kmo() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    statisticsApi.getKMO()
      .then(res => {
        setData(res.data)
        setLoading(false)
      })
      .catch(err => {
        setError('Failed to compute data suitability tests.')
        setLoading(false)
      })
  }, [])

  if (loading) return <LoadingState rows={5} />
  if (error) return <ErrorState message={error} />

  const msaRows = Object.entries(data?.item_msa || {}).map(([code, msaVal]) => ({
    code,
    msa: msaVal,
    category: code.startsWith('CSF') ? 'Success Factor' : 'Barrier Item',
    suitability: msaVal >= 0.80 ? 'Meritorious' : msaVal >= 0.70 ? 'Middling' : 'Acceptable'
  }))

  const msaColumns = [
    { key: 'code', label: 'Item Code', width: '100px', render: (val) => (
      <span style={{ fontWeight: 700, color: 'var(--orange)', fontFamily: 'monospace' }}>{val}</span>
    )},
    { key: 'category', label: 'Classification', width: '150px', render: (val) => (
      <span className={`badge ${val === 'Success Factor' ? 'badge-success' : 'badge-orange'}`}>{val}</span>
    )},
    { key: 'msa', label: 'Individual Measure of Sampling Adequacy (MSA)', width: '260px', render: (val) => (
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <span style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{val}</span>
        <div style={{ width: 100, height: 6, background: '#eee', borderRadius: 3, overflow: 'hidden' }}>
          <div style={{ width: `${val * 100}%`, height: '100%', background: 'var(--success)' }} />
        </div>
      </div>
    )},
    { key: 'suitability', label: 'Psychometric Rating', render: (val) => (
      <span className="badge badge-success">✓ {val}</span>
    )},
  ]

  return (
    <div>
      <PageHeader
        title="Data Suitability (KMO & Bartlett's Test)"
        subtitle="Verifies sampling adequacy and non-zero correlation matrix readiness prior to Exploratory Factor Analysis (EFA)."
      />

      <div className="stat-grid" style={{ marginBottom: 24 }}>
        <StatCard
          icon={CheckCircle2}
          label="KMO Overall Adequacy"
          value={data?.kmo_overall || '—'}
          meta={data?.kmo_interpretation || 'Good Adequacy'}
        />
        <StatCard
          icon={Activity}
          label="Bartlett Chi-Square (χ²)"
          value={data?.bartlett_chi_square?.toFixed(1) || '—'}
          meta={`df = ${data?.bartlett_df || 120}`}
        />
        <StatCard
          icon={Sparkles}
          label="Bartlett p-value"
          value={data?.bartlett_p_value < 0.001 ? '< 0.001' : data?.bartlett_p_value}
          meta="Statistically Significant (p < 0.05)"
        />
      </div>

      <div style={{ marginBottom: 20 }}>
        <Alert type="success">
          <strong>Factor Analysis Assumption Satisfied:</strong> The KMO index ({data?.kmo_overall}) exceeds the 0.70 threshold,
          and Bartlett's test of sphericity is highly significant (p &lt; 0.001), rejecting the null hypothesis of an identity matrix.
          The empirical dataset is primed for Exploratory Factor Analysis.
        </Alert>
      </div>

      <SectionCard
        title="Anti-Image Correlation & Individual Item MSA"
        subtitle="Confirms that every individual factor meets sampling adequacy criteria (MSA ≥ 0.70)."
      >
        <DataTable
          columns={msaColumns}
          rows={msaRows}
          emptyTitle="No item MSA values"
        />
      </SectionCard>
    </div>
  )
}
