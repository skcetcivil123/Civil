import { useState, useEffect } from 'react'
import { FileText, CheckCircle2, HelpCircle } from 'lucide-react'
import { surveyApi } from '../api/client'
import { PageHeader, StatCard, SectionCard, DataTable, LoadingState, ErrorState, Alert } from '../components/ui'

export default function Questionnaire() {
  const [questions, setQuestions] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    surveyApi.getQuestionnaire()
      .then(res => {
        setQuestions(res.data)
        setLoading(false)
      })
      .catch(err => {
        setError('Failed to load questionnaire items.')
        setLoading(false)
      })
  }, [])

  const columns = [
    { key: 'factor_code', label: 'Item Code', width: '100px', render: (val) => (
      <span style={{ fontWeight: 700, color: 'var(--orange)', fontFamily: 'monospace' }}>{val}</span>
    )},
    { key: 'category', label: 'Category', width: '130px', render: (val) => (
      <span className={`badge ${val === 'CSF' ? 'badge-success' : 'badge-orange'}`}>
        {val === 'CSF' ? 'Success Factor' : 'Barrier Item'}
      </span>
    )},
    { key: 'text', label: 'Survey Item Formulation (5-Point Likert Scale)', render: (val, row) => (
      <div>
        <div style={{ fontWeight: 600, color: 'var(--text-primary)', marginBottom: 4 }}>{val}</div>
        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Target Factor: {row.factor_name}</div>
      </div>
    )},
    { key: 'scale', label: 'Measurement Anchors', render: () => (
      <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
        1: Strongly Disagree → 5: Strongly Agree
      </span>
    )},
  ]

  if (loading) return <LoadingState rows={5} />
  if (error) return <ErrorState message={error} />

  return (
    <div>
      <PageHeader
        title="5-Point Likert Survey Instrument"
        subtitle="Designed from FDM consensus-accepted factors for empirical administration across Coimbatore construction projects."
      />

      <div className="stat-grid" style={{ marginBottom: 24 }}>
        <StatCard icon={FileText} label="Survey Questions" value={questions.length} meta="Standardized Likert scale" />
        <StatCard icon={CheckCircle2} label="Scale Range" value="1 to 5" meta="Ordinal measurement anchors" />
        <StatCard icon={HelpCircle} label="Target Population" value="N ≈ 120" meta="Construction professionals" />
      </div>

      <SectionCard
        title="Questionnaire Instrument Items"
        subtitle="Each question evaluates perceived contribution or hindrance on construction site quality management."
      >
        <DataTable
          columns={columns}
          rows={questions}
          emptyTitle="No questions generated"
          emptyBody="Please check backend survey items."
        />
      </SectionCard>
    </div>
  )
}
