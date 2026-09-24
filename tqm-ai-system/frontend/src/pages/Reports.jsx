import { useState, useEffect } from 'react'
import { Download, FileText, CheckCircle2, Table, Award, ShieldCheck } from 'lucide-react'
import { reportsApi } from '../api/client'
import { PageHeader, StatCard, SectionCard, LoadingState, ErrorState, Alert } from '../components/ui'

export default function Reports() {
  const [report, setReport] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    reportsApi.getSummary()
      .then(res => {
        setReport(res.data)
        setLoading(false)
      })
      .catch(err => {
        setError('Failed to generate research summary report.')
        setLoading(false)
      })
  }, [])

  const handleDownloadCsv = () => {
    window.open('/api/reports/export/csv', '_blank')
  }

  if (loading) return <LoadingState rows={6} />
  if (error) return <ErrorState message={error} />

  return (
    <div>
      <PageHeader
        title="Research Reports & Dataset Exports"
        subtitle="Download academic reports, statistical summaries, and the raw 120-respondent survey dataset."
        action={
          <button className="btn btn-primary" onClick={handleDownloadCsv}>
            <Download size={15} style={{ marginRight: 6 }} />
            Export Raw CSV Data (N=120)
          </button>
        }
      />

      <div className="stat-grid" style={{ marginBottom: 24 }}>
        <StatCard icon={Award} label="Top Ranked CSF" value={report?.key_metrics?.top_csf || '—'} meta="Executive commitment" />
        <StatCard icon={ShieldCheck} label="Reliability (Cronbach α)" value={report?.key_metrics?.cronbach_alpha || '—'} meta="Scale internal consistency" />
        <StatCard icon={CheckCircle2} label="KMO Adequacy" value={report?.key_metrics?.kmo_overall || '—'} meta="EFA Suitability" />
        <StatCard icon={Table} label="Variance Explained" value={`${report?.key_metrics?.total_variance_explained || 0}%`} meta="4 Latent Dimensions" />
      </div>

      <div className="card card-pad" style={{ marginBottom: 24 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
          <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>
            Executive Dissertation Synthesis
          </h3>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
            Region: {report?.region} • Sample: N = {report?.sample_size}
          </span>
        </div>

        <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
          This empirical investigation establishes a prioritized framework for Total Quality Management (TQM) implementation
          in Coimbatore construction projects. Through Fuzzy Delphi Method (FDM) consensus screening, 8 Critical Success Factors (CSFs)
          and 8 Barriers were validated. Statistical analysis of 120 survey responses confirmed high scale reliability
          (Cronbach's α = {report?.key_metrics?.cronbach_alpha}) and sampling adequacy (KMO = {report?.key_metrics?.kmo_overall}).
          Exploratory Factor Analysis successfully extracted 4 orthogonal management pillars accounting for {report?.key_metrics?.total_variance_explained}% of total variance.
        </p>
      </div>

      <SectionCard
        title="Top 8 Ranked Factors by Relative Importance Index (RII)"
        subtitle="Normalizes ordinal frequencies across Coimbatore construction professionals."
      >
        <div style={{ overflowX: 'auto' }}>
          <table className="tbl">
            <thead>
              <tr>
                <th>Rank</th>
                <th>Factor Code</th>
                <th>Factor Name</th>
                <th>Category</th>
                <th>RII Score</th>
                <th>Priority Tier</th>
              </tr>
            </thead>
            <tbody>
              {report?.rii_rankings?.map(r => (
                <tr key={r.code}>
                  <td style={{ fontWeight: 700, color: r.rank <= 3 ? 'var(--orange)' : 'inherit' }}>#{r.rank}</td>
                  <td style={{ fontFamily: 'monospace', fontWeight: 600 }}>{r.code}</td>
                  <td style={{ fontWeight: 600 }}>{r.name}</td>
                  <td>
                    <span className={`badge ${r.category === 'CSF' ? 'badge-success' : 'badge-orange'}`}>
                      {r.category}
                    </span>
                  </td>
                  <td style={{ fontWeight: 700 }}>{r.rii.toFixed(4)}</td>
                  <td>
                    <span className="badge badge-success">{r.tier}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </SectionCard>
    </div>
  )
}
