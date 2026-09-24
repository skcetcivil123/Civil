import { useState, useEffect } from 'react'
import { Plus, BookOpen, Filter, Search, CheckCircle2, AlertTriangle, ExternalLink, Sparkles } from 'lucide-react'
import { factorsApi } from '../api/client'
import { PageHeader, StatCard, SectionCard, StatusBadge, DataTable, LoadingState, ErrorState, Alert } from '../components/ui'

export default function Factors() {
  const [factors, setFactors] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [filterCat, setFilterCat] = useState('ALL')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedFactor, setSelectedFactor] = useState(null)

  const fetchFactors = () => {
    factorsApi.getAll()
      .then(res => {
        const list = Array.isArray(res?.data) ? res.data : (res?.data?.factors || [])
        setFactors(list)
        setLoading(false)
        setError(null)
      })
      .catch(err => {
        console.warn('Factors fetch error:', err)
        setError('Failed to load TQM factors.')
        setLoading(false)
      })
  }

  useEffect(() => {
    setLoading(true)
    fetchFactors()
  }, [])

  const factorList = Array.isArray(factors) ? factors : []
  const filtered = factorList.filter(f => {
    if (!f) return false
    const cat = (f.category || '').toUpperCase()
    const matchesCat = filterCat === 'ALL' || cat === filterCat
    const q = (searchQuery || '').toLowerCase()
    const nameStr = (f.name || '').toLowerCase()
    const codeStr = (f.code || '').toLowerCase()
    const descStr = (f.description || '').toLowerCase()
    return matchesCat && (nameStr.includes(q) || codeStr.includes(q) || descStr.includes(q))
  })

  const csfCount = factorList.filter(f => (f?.category || '').toUpperCase() === 'CSF').length
  const barrierCount = factorList.filter(f => (f?.category || '').toUpperCase() === 'BARRIER').length

  const columns = [
    { key: 'code', label: 'Code', width: '90px', render: (val) => (
      <span style={{ fontWeight: 700, color: 'var(--orange)', fontFamily: 'monospace' }}>{val}</span>
    )},
    { key: 'name', label: 'Factor Name', render: (val, row) => (
      <div>
        <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{val}</div>
        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{row.sub_category || 'General'}</div>
      </div>
    )},
    { key: 'category', label: 'Classification', width: '130px', render: (val) => (
      <span className={`badge ${val === 'CSF' ? 'badge-success' : 'badge-orange'}`}>
        {val === 'CSF' ? 'Success Factor' : 'Barrier'}
      </span>
    )},
    { key: 'description', label: 'Operational Context (Coimbatore)', render: (val) => (
      <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', maxWidth: 380 }}>{val}</div>
    )},
    { key: 'source_literature', label: 'Academic Citations', render: (val) => (
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
        {val && val.map((s, i) => (
          <span key={i} className="badge badge-neutral" style={{ fontSize: '0.72rem' }}>{s}</span>
        ))}
      </div>
    )},
    { key: 'status', label: 'FDM Consensus', width: '130px', render: (val) => (
      <StatusBadge status={val === 'fdm_accepted' ? 'accepted' : 'progress'} />
    )},
  ]

  if (loading && factors.length === 0) return <LoadingState rows={5} />
  if (error && factors.length === 0) return <ErrorState message={error} onRetry={fetchFactors} />

  return (
    <div>
      <PageHeader
        title="Literature Review & Factor Taxonomy"
        subtitle="Critical Success Factors (CSFs) and Barriers extracted from construction management literature and validated for Coimbatore."
        action={
          <button
            onClick={() => window.dispatchEvent(new CustomEvent('tqm:explain-screen', { detail: { prompt: 'Explain the 16 factors and Coimbatore context' } }))}
            className="btn btn-sm"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              background: 'var(--orange-light)',
              color: 'var(--orange-dark)',
              border: '1px solid var(--orange-border)',
              borderRadius: 'var(--radius-md)',
              fontWeight: 600,
              padding: '6px 12px',
              cursor: 'pointer'
            }}
          >
            <Sparkles size={14} color="var(--orange)" />
            <span>AI Factor Insights</span>
          </button>
        }
      />

      <div className="stat-grid" style={{ marginBottom: 24 }}>
        <StatCard icon={BookOpen} label="Total Extracted Factors" value={factors.length} meta="Comprehensive taxonomy" />
        <StatCard icon={CheckCircle2} label="Critical Success Factors (CSFs)" value={csfCount} meta="8 Core driver dimensions" />
        <StatCard icon={AlertTriangle} label="TQM Barriers & Risks" value={barrierCount} meta="8 Industry impediments" />
      </div>

      <SectionCard
        title="TQM Factors Inventory"
        subtitle="16 Empirical items identified from global literature (Tam & Le 2006, Jha & Iyer 2006, Oakland 2014) screened for Coimbatore building and infrastructure projects."
        action={
          <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
            <div style={{ display: 'flex', background: 'var(--bg-main)', border: '1px solid var(--border)', borderRadius: 6, padding: '2px 8px', alignItems: 'center' }}>
              <Search size={14} color="var(--text-muted)" style={{ marginRight: 6 }} />
              <input
                type="text"
                placeholder="Search factors..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                style={{ border: 'none', background: 'transparent', outline: 'none', fontSize: '0.85rem', padding: '4px 0' }}
              />
            </div>
            <div style={{ display: 'flex', gap: 4 }}>
              {['ALL', 'CSF', 'BARRIER'].map(cat => (
                <button
                  key={cat}
                  className={`btn btn-sm ${filterCat === cat ? 'btn-primary' : 'btn-ghost'}`}
                  onClick={() => setFilterCat(cat)}
                >
                  {cat === 'ALL' ? 'All (16)' : cat === 'CSF' ? 'CSFs (8)' : 'Barriers (8)'}
                </button>
              ))}
            </div>
          </div>
        }
      >
        <DataTable
          columns={columns}
          rows={filtered}
          emptyTitle="No matching factors"
          emptyBody="Try changing your search query or filter category."
        />
      </SectionCard>
    </div>
  )
}
