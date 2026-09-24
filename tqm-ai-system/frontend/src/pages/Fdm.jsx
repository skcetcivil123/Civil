import { useState, useEffect } from 'react'
import { Calculator, CheckCircle2, XCircle, Sliders, RefreshCw, Info } from 'lucide-react'
import { fdmApi } from '../api/client'
import { PageHeader, StatCard, SectionCard, StatusBadge, DataTable, LoadingState, ErrorState, Alert } from '../components/ui'

export default function Fdm() {
  const [fdmData, setFdmData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [threshold, setThreshold] = useState(0.70)
  const [defuzzMethod, setDefuzzMethod] = useState('graded_mean')
  const [recalculating, setRecalculating] = useState(false)

  const runCalculation = (th = threshold, method = defuzzMethod) => {
    setRecalculating(true)
    fdmApi.calculate({ threshold: parseFloat(th), defuzzification_method: method })
      .then(res => {
        setFdmData(res.data)
        setLoading(false)
        setRecalculating(false)
      })
      .catch(err => {
        setError('Failed to compute FDM results.')
        setLoading(false)
        setRecalculating(false)
      })
  }

  useEffect(() => {
    runCalculation(0.70, 'graded_mean')
  }, [])

  const handleThresholdChange = (newVal) => {
    setThreshold(newVal)
    runCalculation(newVal, defuzzMethod)
  }

  const handleMethodChange = (newMethod) => {
    setDefuzzMethod(newMethod)
    runCalculation(threshold, newMethod)
  }

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
    { key: 'fuzzy_number', label: 'Triangular Fuzzy Number (a1, a2, a3)', render: (val) => (
      <span style={{ fontFamily: 'monospace', fontSize: '0.85rem', background: 'var(--bg-main)', padding: '3px 8px', borderRadius: 4 }}>
        ({val[0]}, {val[1]}, {val[2]})
      </span>
    )},
    { key: 'defuzzified_value', label: 'Defuzzified Value (S)', width: '150px', render: (val) => (
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <span style={{ fontWeight: 700, color: val >= threshold ? 'var(--success)' : 'var(--error)' }}>
          {val}
        </span>
        <div style={{ width: 40, height: 6, background: '#eee', borderRadius: 3, overflow: 'hidden' }}>
          <div style={{ width: `${Math.min(100, (val / 1.0) * 100)}%`, height: '100%', background: val >= threshold ? 'var(--success)' : 'var(--error)' }} />
        </div>
      </div>
    )},
    { key: 'status', label: 'Screening Decision', width: '140px', render: (val) => (
      <StatusBadge status={val} />
    )},
  ]

  if (loading) return <LoadingState rows={5} />
  if (error) return <ErrorState message={error} onRetry={() => runCalculation()} />

  return (
    <div>
      <PageHeader
        title="Fuzzy Delphi Consensus (FDM)"
        subtitle="Triangular fuzzy evaluation and defuzzification screening for questionnaire retention."
        action={
          <button className="btn btn-ghost btn-sm" onClick={() => runCalculation()} disabled={recalculating}>
            <RefreshCw size={14} className={recalculating ? 'spin' : ''} style={{ marginRight: 6 }} />
            Recalculate Consensus
          </button>
        }
      />

      <div className="stat-grid" style={{ marginBottom: 24 }}>
        <StatCard icon={CheckCircle2} label="Accepted Factors (S ≥ α)" value={fdmData?.accepted_count || 0} meta="Retained in survey instrument" />
        <StatCard icon={XCircle} label="Rejected Factors (S < α)" value={fdmData?.rejected_count || 0} meta="Excluded by expert panel" />
        <StatCard icon={Sliders} label="Current Threshold (α)" value={threshold.toFixed(2)} meta="Configurable screening cutoff" />
        <StatCard icon={Calculator} label="Defuzzification" value={defuzzMethod === 'graded_mean' ? 'Graded Mean' : 'Centroid'} meta="S = (a1 + 4a2 + a3)/6" />
      </div>

      <div className="card card-pad" style={{ marginBottom: 24 }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 24, alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ flex: 1, minWidth: 260 }}>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 6 }}>
              Consensus Screening Threshold (α): <span style={{ color: 'var(--orange)', fontWeight: 700 }}>{threshold.toFixed(2)}</span>
            </label>
            <input
              type="range"
              min="0.55"
              max="0.85"
              step="0.01"
              value={threshold}
              onChange={(e) => handleThresholdChange(parseFloat(e.target.value))}
              style={{ width: '100%', accentColor: 'var(--orange)' }}
            />
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 4 }}>
              <span>0.55 (Permissive)</span>
              <span>0.70 (Standard Academic Baseline)</span>
              <span>0.85 (Strict)</span>
            </div>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 6 }}>
              Defuzzification Formula
            </label>
            <div style={{ display: 'flex', gap: 6 }}>
              <button
                className={`btn btn-sm ${defuzzMethod === 'graded_mean' ? 'btn-primary' : 'btn-ghost'}`}
                onClick={() => handleMethodChange('graded_mean')}
              >
                Graded Mean (a1 + 4a2 + a3)/6
              </button>
              <button
                className={`btn btn-sm ${defuzzMethod === 'centroid' ? 'btn-primary' : 'btn-ghost'}`}
                onClick={() => handleMethodChange('centroid')}
              >
                Centroid (a1 + a2 + a3)/3
              </button>
            </div>
          </div>
        </div>
      </div>

      <SectionCard
        title="FDM Factor Consensus Matrix"
        subtitle={`Computed from 10-member expert ratings in Coimbatore. Showing ${fdmData?.results?.length || 0} evaluated items.`}
      >
        <DataTable
          columns={columns}
          rows={fdmData?.results || []}
          emptyTitle="No results"
          emptyBody="Click Recalculate Consensus to run FDM."
        />
      </SectionCard>
    </div>
  )
}
