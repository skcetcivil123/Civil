import { useState, useEffect } from 'react'
import { Users, Award, MapPin, Briefcase } from 'lucide-react'
import { fdmApi } from '../api/client'
import { PageHeader, StatCard, SectionCard, DataTable, LoadingState, ErrorState } from '../components/ui'

export default function Experts() {
  const [experts, setExperts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchExperts = () => {
    setLoading(true)
    fdmApi.getExperts()
      .then(res => {
        const list = Array.isArray(res?.data) ? res.data : (res?.data?.experts || [])
        setExperts(list)
        setLoading(false)
        setError(null)
      })
      .catch(err => {
        console.warn('Experts fetch error:', err)
        setError('Failed to load expert panel.')
        setLoading(false)
      })
  }

  useEffect(() => {
    fetchExperts()
  }, [])

  const expertList = Array.isArray(experts) ? experts : []
  const avgExperience = expertList.length > 0
    ? Math.round(expertList.reduce((acc, e) => acc + (e?.experience_years || 0), 0) / expertList.length)
    : 21

  const columns = [
    { key: 'name', label: 'Expert Name', render: (val, row) => (
      <div>
        <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{val}</div>
        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{row.email}</div>
      </div>
    )},
    { key: 'organization', label: 'Affiliation / Organization', render: (val) => (
      <div style={{ fontWeight: 500 }}>{val}</div>
    )},
    { key: 'designation', label: 'Designation & Role', render: (val) => (
      <span className="badge badge-neutral">{val}</span>
    )},
    { key: 'experience_years', label: 'Experience', width: '120px', render: (val) => (
      <span style={{ fontWeight: 700, color: 'var(--orange)' }}>{val} Years</span>
    )},
    { key: 'expertise_area', label: 'Specialization Area', render: (val) => (
      <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{val}</div>
    )},
    { key: 'location', label: 'Region', width: '130px', render: (val) => (
      <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>{val}</span>
    )},
  ]

  if (loading) return <LoadingState rows={5} />
  if (error) return <ErrorState message={error} onRetry={fetchExperts} />

  return (
    <div>
      <PageHeader
        title="FDM Expert Panel"
        subtitle="10 High-level construction engineering experts and academic specialists in the Coimbatore / Tamil Nadu region."
      />

      <div className="stat-grid" style={{ marginBottom: 24 }}>
        <StatCard icon={Users} label="Panel Members" value={experts.length} meta="Purposive sampling criteria" />
        <StatCard icon={Award} label="Average Industry Experience" value={`${avgExperience} Years`} meta="Senior leadership" />
        <StatCard icon={MapPin} label="Geographic Focus" value="Coimbatore" meta="Tamil Nadu infrastructure" />
      </div>

      <SectionCard
        title="Expert Panel Directory"
        subtitle="Participants represent Top Contractors (L&T, CCCL), CREDAI, Government PWD, Academic Institutions (GCT, PSG Tech), and PMC firms."
      >
        <DataTable
          columns={columns}
          rows={experts}
          emptyTitle="No experts loaded"
          emptyBody="Please check database connection."
        />
      </SectionCard>
    </div>
  )
}
