import { useState, useEffect } from 'react'
import { Cpu, Award, Zap, Activity, CheckCircle2, AlertTriangle, ArrowRight } from 'lucide-react'
import { mlApi } from '../api/client'
import { PageHeader, StatCard, SectionCard, DataTable, LoadingState, ErrorState, Alert } from '../components/ui'

export default function MachineLearning() {
  const [clusters, setClusters] = useState([])
  const [models, setModels] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // Interactive predictor
  const [predRatings, setPredRatings] = useState({
    CSF1: 4, CSF2: 4, CSF3: 4, CSF4: 4, CSF5: 4, CSF6: 3, CSF7: 3, CSF8: 4,
    BAR1: 2, BAR2: 3, BAR3: 2, BAR4: 3, BAR5: 3, BAR6: 2, BAR7: 2, BAR8: 2
  })
  const [prediction, setPrediction] = useState(null)
  const [predicting, setPredicting] = useState(false)

  const fetchData = () => {
    setLoading(true)
    Promise.all([mlApi.getClusters(3), mlApi.getModels()])
      .then(([cRes, mRes]) => {
        setClusters(cRes.data)
        setModels(mRes.data)
        setLoading(false)
      })
      .catch(err => {
        setError('Failed to load machine learning models.')
        setLoading(false)
      })
  }

  useEffect(() => {
    fetchData()
  }, [])

  const handlePredict = () => {
    setPredicting(true)
    mlApi.predict({ ratings: predRatings })
      .then(res => {
        setPrediction(res.data)
        setPredicting(false)
      })
      .catch(err => {
        setPredicting(false)
        alert('Prediction failed.')
      })
  }

  const modelColumns = [
    { key: 'model_name', label: 'Algorithm', width: '180px', render: (val) => (
      <strong style={{ color: 'var(--text-primary)' }}>{val}</strong>
    )},
    { key: 'accuracy', label: 'Accuracy', render: (val) => `${(val * 100).toFixed(1)}%` },
    { key: 'precision', label: 'Precision', render: (val) => val.toFixed(3) },
    { key: 'recall', label: 'Recall', render: (val) => val.toFixed(3) },
    { key: 'f1_score', label: 'F1-Score', render: (val) => (
      <span style={{ fontWeight: 700, color: 'var(--orange)' }}>{val.toFixed(3)}</span>
    )},
    { key: 'roc_auc', label: 'ROC-AUC', render: (val) => (
      <span className="badge badge-success">AUC {val.toFixed(3)}</span>
    )},
    { key: 'cv_mean', label: '5-Fold CV Mean', render: (val) => `${(val * 100).toFixed(1)}%` },
  ]

  if (loading) return <LoadingState rows={6} />
  if (error) return <ErrorState message={error} onRetry={fetchData} />

  const bestModel = models.reduce((best, m) => (m.f1_score > (best?.f1_score || 0) ? m : best), null)

  return (
    <div>
      <PageHeader
        title="Machine Learning & Predictive Quality Models"
        subtitle="Unsupervised K-Means clustering and comparative supervised classification for construction project quality compliance."
      />

      <div className="stat-grid" style={{ marginBottom: 24 }}>
        <StatCard
          icon={Award}
          label="Top Supervised Classifier"
          value={bestModel?.model_name || 'XGBoost'}
          meta={`F1: ${bestModel?.f1_score} • ROC-AUC: ${bestModel?.roc_auc}`}
        />
        <StatCard
          icon={Cpu}
          label="K-Means Clusters"
          value="3 Profiles"
          meta="TQM Maturity Archetypes"
        />
        <StatCard
          icon={Activity}
          label="Validation Strategy"
          value="Stratified 5-Fold"
          meta="Prevents data leakage"
        />
      </div>

      {/* Cluster Cards */}
      <div className="card card-pad" style={{ marginBottom: 24 }}>
        <h3 style={{ fontSize: '1.05rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: 12 }}>
          Unsupervised K-Means Project Maturity Archetypes
        </h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 16 }}>
          {clusters.map(c => (
            <div key={c.cluster_id} style={{
              background: 'var(--bg-main)', border: '1px solid var(--border)',
              borderRadius: 8, padding: '16px'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                <span className={`badge ${c.tqm_maturity_level === 'Advanced' ? 'badge-success' : c.tqm_maturity_level === 'Developing' ? 'badge-orange' : 'badge-error'}`}>
                  {c.tqm_maturity_level}
                </span>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                  {c.percentage}% of sample (n={c.size})
                </span>
              </div>
              <div style={{ fontWeight: 600, fontSize: '0.95rem', color: 'var(--text-primary)', marginBottom: 8 }}>
                {c.cluster_label}
              </div>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                Average Practice Ratings:
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 6 }}>
                {Object.entries(c.characteristics).slice(0, 4).map(([k, v]) => (
                  <span key={k} style={{ background: '#fff', border: '1px solid var(--border)', padding: '2px 6px', borderRadius: 4, fontSize: '0.75rem' }}>
                    {k}: <strong>{v}</strong>
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Supervised Comparison */}
      <SectionCard
        title="Supervised Algorithm Performance Comparison"
        subtitle="Evaluated on predicting project quality compliance and defect prevention capability."
      >
        <DataTable
          columns={modelColumns}
          rows={models}
          emptyTitle="No model metrics"
        />
      </SectionCard>

      {/* Interactive Project Risk Simulator */}
      <div className="card card-pad">
        <h3 style={{ fontSize: '1.05rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: 6 }}>
          Interactive Quality Compliance & Defect Risk Simulator
        </h3>
        <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginBottom: 16 }}>
          Adjust key site indicators to test how the trained machine learning model predicts overall project compliance.
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 14, marginBottom: 16 }}>
          <div>
            <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: 4 }}>
              CSF1: Top Management ({predRatings.CSF1}/5)
            </label>
            <input
              type="range" min="1" max="5" value={predRatings.CSF1}
              onChange={e => setPredRatings({ ...predRatings, CSF1: parseInt(e.target.value) })}
              style={{ width: '100%', accentColor: 'var(--orange)' }}
            />
          </div>

          <div>
            <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: 4 }}>
              CSF3: Training & Skill ({predRatings.CSF3}/5)
            </label>
            <input
              type="range" min="1" max="5" value={predRatings.CSF3}
              onChange={e => setPredRatings({ ...predRatings, CSF3: parseInt(e.target.value) })}
              style={{ width: '100%', accentColor: 'var(--orange)' }}
            />
          </div>

          <div>
            <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: 4 }}>
              BAR2: Skilled Labor Shortage ({predRatings.BAR2}/5)
            </label>
            <input
              type="range" min="1" max="5" value={predRatings.BAR2}
              onChange={e => setPredRatings({ ...predRatings, BAR2: parseInt(e.target.value) })}
              style={{ width: '100%', accentColor: 'var(--orange)' }}
            />
          </div>

          <div>
            <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: 4 }}>
              BAR4: Time Pressure ({predRatings.BAR4}/5)
            </label>
            <input
              type="range" min="1" max="5" value={predRatings.BAR4}
              onChange={e => setPredRatings({ ...predRatings, BAR4: parseInt(e.target.value) })}
              style={{ width: '100%', accentColor: 'var(--orange)' }}
            />
          </div>
        </div>

        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
          <button className="btn btn-primary btn-sm" onClick={handlePredict} disabled={predicting}>
            <Zap size={14} style={{ marginRight: 6 }} />
            {predicting ? 'Evaluating...' : 'Run Prediction'}
          </button>
        </div>

        {prediction && (
          <div style={{ marginTop: 16, padding: '16px', background: 'var(--bg-main)', borderRadius: 8, border: '1px solid var(--border)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
              <span className={`badge ${prediction.risk_level === 'Low Risk' ? 'badge-success' : 'badge-orange'}`}>
                {prediction.risk_level}
              </span>
              <span style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                High Compliance Probability: {(prediction.probability_high_quality * 100).toFixed(1)}%
              </span>
            </div>
            <div style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: 4 }}>
              {prediction.predicted_quality_outcome}
            </div>
            <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
              Assigned Archetype: <strong>{prediction.predicted_cluster}</strong>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
