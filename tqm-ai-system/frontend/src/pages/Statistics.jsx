import { useState, useEffect } from 'react'
import { BarChart3, TrendingUp, Award, Layers } from 'lucide-react'
import { statisticsApi } from '../api/client'
import { PageHeader, StatCard, SectionCard, DataTable, LoadingState, ErrorState, Alert } from '../components/ui'

export default function Statistics() {
  const [descriptive, setDescriptive] = useState([])
  const [riiList, setRiiList] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [viewMode, setViewMode] = useState('rii') // 'rii' or 'descriptive'

  useEffect(() => {
    Promise.all([statisticsApi.getDescriptive(), statisticsApi.getRII()])
      .then(([descRes, riiRes]) => {
        const dList = Array.isArray(descRes?.data) ? descRes.data : (descRes?.data?.data || [])
        const rList = Array.isArray(riiRes?.data) ? riiRes.data : (riiRes?.data?.data || [])
        setDescriptive(dList)
        setRiiList(rList)
        setLoading(false)
      })
      .catch(err => {
        console.warn('Statistics fetch error:', err)
        setError('Failed to compute statistical data.')
        setLoading(false)
      })
  }, [])

  const safeRiiList = Array.isArray(riiList) ? riiList : []
  const topCSF = safeRiiList.find(r => r?.category === 'CSF') || safeRiiList[0]
  const topBarrier = safeRiiList.find(r => r?.category === 'Barrier')

  const riiColumns = [
    { key: 'rank', label: 'Rank', width: '80px', render: (val) => (
      <span style={{
        fontWeight: 700,
        color: val <= 3 ? 'var(--orange)' : 'var(--text-secondary)',
        fontSize: val <= 3 ? '1.05rem' : '0.9rem'
      }}>
        #{val}
      </span>
    )},
    { key: 'code', label: 'Code', width: '90px', render: (val) => (
      <span style={{ fontWeight: 600, fontFamily: 'monospace' }}>{val}</span>
    )},
    { key: 'name', label: 'Factor Description', render: (val, row) => (
      <div>
        <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{val}</div>
        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{row.sub_category}</div>
      </div>
    )},
    { key: 'category', label: 'Category', width: '130px', render: (val) => (
      <span className={`badge ${val === 'CSF' ? 'badge-success' : 'badge-orange'}`}>
        {val === 'CSF' ? 'Success Factor' : 'Barrier'}
      </span>
    )},
    { key: 'rii', label: 'Relative Importance Index (RII)', width: '220px', render: (val) => {
      const num = typeof val === 'number' ? val : (parseFloat(val) || 0)
      return (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
            <span style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{num.toFixed(4)}</span>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{(num * 100).toFixed(1)}%</span>
          </div>
          <div style={{ width: '100%', height: 6, background: '#eee', borderRadius: 3, overflow: 'hidden' }}>
            <div style={{ width: `${Math.min(100, num * 100)}%`, height: '100%', background: 'var(--orange)' }} />
          </div>
        </div>
      )
    }},
    { key: 'tier', label: 'Priority Tier', width: '130px', render: (val) => {
      const cls = val === 'High' ? 'badge-success' : val === 'Medium-High' ? 'badge-orange' : 'badge-neutral'
      return <span className={`badge ${cls}`}>{val}</span>
    }},
  ]

  const descColumns = [
    { key: 'code', label: 'Code', width: '80px', render: (val) => (
      <span style={{ fontWeight: 600, fontFamily: 'monospace' }}>{val}</span>
    )},
    { key: 'name', label: 'Factor Name', render: (val, row) => (
      <span style={{ fontWeight: 600 }}>{val}</span>
    )},
    { key: 'count', label: 'N', width: '80px' },
    { key: 'mean', label: 'Mean (μ)', width: '100px', render: (val) => <strong>{val}</strong> },
    { key: 'std_dev', label: 'Std Dev (σ)', width: '110px' },
    { key: 'variance', label: 'Variance (s²)', width: '110px' },
    { key: 'skewness', label: 'Skewness', width: '100px' },
    { key: 'kurtosis', label: 'Kurtosis', width: '100px' },
  ]

  if (loading) return <LoadingState rows={6} />
  if (error) return <ErrorState message={error} />

  return (
    <div>
      <PageHeader
        title="Survey Statistics & Relative Importance Index (RII)"
        subtitle="Empirical ranking of Critical Success Factors and Barriers across 120 construction professionals in Coimbatore."
        action={
          <div style={{ display: 'flex', gap: 6 }}>
            <button
              className={`btn btn-sm ${viewMode === 'rii' ? 'btn-primary' : 'btn-ghost'}`}
              onClick={() => setViewMode('rii')}
            >
              <Award size={14} style={{ marginRight: 6 }} />
              RII Ranking Matrix
            </button>
            <button
              className={`btn btn-sm ${viewMode === 'descriptive' ? 'btn-primary' : 'btn-ghost'}`}
              onClick={() => setViewMode('descriptive')}
            >
              <BarChart3 size={14} style={{ marginRight: 6 }} />
              Descriptive Statistics
            </button>
          </div>
        }
      />

      <div className="stat-grid" style={{ marginBottom: 24 }}>
        <StatCard
          icon={Award}
          label="Top Ranked CSF"
          value={topCSF ? `${topCSF.code} (RII: ${topCSF.rii})` : '—'}
          meta={topCSF?.name || 'Top Management'}
        />
        <StatCard
          icon={TrendingUp}
          label="Top Ranked Barrier"
          value={topBarrier ? `${topBarrier.code} (RII: ${topBarrier.rii})` : '—'}
          meta={topBarrier?.name || 'Labor Shortage'}
        />
        <StatCard
          icon={Layers}
          label="Sample Size (N)"
          value="120"
          meta="Construction Professionals"
        />
      </div>

      {viewMode === 'rii' ? (
        <SectionCard
          title="Relative Importance Index (RII) Rankings"
          subtitle="Formula: RII = ΣW / (A × N), where A = 5 and N = 120. Factors with RII ≥ 0.80 represent High Priority critical elements."
        >
          <DataTable
            columns={riiColumns}
            rows={riiList}
            emptyTitle="No RII rankings available"
          />
        </SectionCard>
      ) : (
        <SectionCard
          title="Descriptive Statistics (Mean, Std Dev, Skewness, Kurtosis)"
          subtitle="Evaluates central tendency and normality distribution for all 16 survey items."
        >
          <DataTable
            columns={descColumns}
            rows={descriptive}
            emptyTitle="No descriptive stats"
          />
        </SectionCard>
      )}
    </div>
  )
}
