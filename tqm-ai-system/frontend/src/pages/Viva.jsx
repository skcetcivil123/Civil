import { useState, useEffect } from 'react'
import { GraduationCap, Award, HelpCircle, CheckCircle2, AlertCircle, Send, Sparkles, BookOpen, RotateCcw } from 'lucide-react'
import { chatbotApi } from '../api/client'
import { PageHeader, StatCard, SectionCard, LoadingState, ErrorState, Alert } from '../components/ui'

export default function Viva() {
  const [questions, setQuestions] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [activeIdx, setActiveIdx] = useState(0)

  // Persistent answer state keyed by question id
  const [answers, setAnswers] = useState({})
  const [evaluations, setEvaluations] = useState({})
  const [evaluating, setEvaluating] = useState(false)
  const [showModelAnswer, setShowModelAnswer] = useState(false)

  useEffect(() => {
    chatbotApi.getVivaQuestions()
      .then(res => {
        setQuestions(res.data)
        setLoading(false)
      })
      .catch(err => {
        setError('Failed to load viva questions.')
        setLoading(false)
      })
  }, [])

  const currentQ = questions[activeIdx]
  const currentAnswer = currentQ ? (answers[currentQ.id] || '') : ''
  const currentEval = currentQ ? evaluations[currentQ.id] : null

  const handleAnswerChange = (val) => {
    if (!currentQ) return
    setAnswers(prev => ({ ...prev, [currentQ.id]: val }))
  }

  const handleInsertSample = () => {
    if (!currentQ) return
    handleAnswerChange(currentQ.model_answer)
  }

  const handleEvaluate = () => {
    if (!currentQ || !currentAnswer.trim() || evaluating) return
    setEvaluating(true)

    chatbotApi.evaluateViva(currentQ.id, currentAnswer)
      .then(res => {
        setEvaluations(prev => ({ ...prev, [currentQ.id]: res.data }))
        setEvaluating(false)
      })
      .catch(err => {
        setEvaluating(false)
        alert('Evaluation failed. Please try again.')
      })
  }

  const handleResetCurrent = () => {
    if (!currentQ) return
    setAnswers(prev => ({ ...prev, [currentQ.id]: '' }))
    setEvaluations(prev => {
      const copy = { ...prev }
      delete copy[currentQ.id]
      return copy
    })
    setShowModelAnswer(false)
  }

  if (loading) return <LoadingState rows={6} />
  if (error) return <ErrorState message={error} />

  const answeredCount = Object.keys(evaluations).length
  const totalQuestions = questions.length
  const avgScore = answeredCount > 0
    ? (Object.values(evaluations).reduce((acc, e) => acc + (e.score || 0), 0) / answeredCount).toFixed(1)
    : '—'

  return (
    <div>
      <PageHeader
        title="Viva Voce Defense Practice Simulator"
        subtitle="Interactive defense examination simulator. Answers and scores are saved as you progress through each defense question."
      />

      <div className="stat-grid" style={{ marginBottom: 24 }}>
        <StatCard
          icon={GraduationCap}
          label="Defense Progress"
          value={`${answeredCount} / ${totalQuestions}`}
          meta={answeredCount === totalQuestions ? 'All questions answered!' : 'In progress'}
        />
        <StatCard
          icon={Award}
          label="Average Examiner Score"
          value={avgScore !== '—' ? `${avgScore} / 10` : '—'}
          meta="10-Point academic defense rubric"
        />
        <StatCard
          icon={HelpCircle}
          label="Active Topic"
          value={currentQ?.category || 'Methodology'}
          meta={`Question ${activeIdx + 1} of ${totalQuestions}`}
        />
      </div>

      <div className="viva-layout-grid">
        {/* Question Selector List */}
        <div className="card card-pad">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <h3 style={{ fontSize: '0.95rem', fontWeight: 600, color: 'var(--text-primary)', margin: 0 }}>
              Examiner Questions
            </h3>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              {answeredCount}/{totalQuestions} Graded
            </span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {questions.map((q, idx) => {
              const qEval = evaluations[q.id]
              const isAnswered = !!qEval
              return (
                <button
                  key={q.id}
                  onClick={() => {
                    setActiveIdx(idx)
                    setShowModelAnswer(false)
                  }}
                  style={{
                    padding: '12px 14px',
                    borderRadius: 8,
                    border: activeIdx === idx ? '2px solid var(--orange)' : '1px solid var(--border)',
                    background: activeIdx === idx ? 'var(--orange-subtle)' : isAnswered ? '#f0fdf4' : 'var(--bg-main)',
                    color: 'var(--text-primary)',
                    textAlign: 'left',
                    cursor: 'pointer',
                    fontSize: '0.82rem',
                    lineHeight: 1.4,
                    transition: 'all 0.15s ease'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                    <span style={{ fontWeight: 700, color: 'var(--orange)' }}>Question {idx + 1}</span>
                    {isAnswered ? (
                      <span className="badge badge-success" style={{ fontSize: '0.68rem' }}>
                        {qEval.score}/10 ✓
                      </span>
                    ) : (
                      <span className="badge badge-neutral" style={{ fontSize: '0.68rem' }}>
                        {q.difficulty}
                      </span>
                    )}
                  </div>
                  <div style={{ fontWeight: activeIdx === idx ? 600 : 400, color: 'var(--text-primary)' }}>
                    {q.question}
                  </div>
                </button>
              )
            })}
          </div>
        </div>

        {/* Question Details & Answer Input */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          {currentQ && (
            <div className="card card-pad">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8, flexWrap: 'wrap', gap: 8 }}>
                <span className="badge badge-orange">{currentQ.category}</span>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                  Question {activeIdx + 1} of {questions.length} • Difficulty: {currentQ.difficulty}
                </span>
              </div>

              <h2 style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--text-primary)', margin: '8px 0 12px' }}>
                {currentQ.question}
              </h2>

              <div style={{ background: 'var(--bg-main)', padding: '12px 16px', borderRadius: 8, border: '1px solid var(--border)', marginBottom: 16 }}>
                <div style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: 0.5 }}>
                  Examiner's Core Methodological Concern:
                </div>
                <p style={{ fontSize: '0.86rem', color: 'var(--text-secondary)', margin: '4px 0 0', lineHeight: 1.4 }}>
                  {currentQ.examiner_intent}
                </p>
              </div>

              {/* Answer input */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                  <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
                    Your Academic Defense Response:
                  </label>
                  <button
                    type="button"
                    className="btn btn-ghost btn-sm"
                    onClick={handleInsertSample}
                    style={{ fontSize: '0.75rem', color: 'var(--orange)' }}
                  >
                    <Sparkles size={12} style={{ marginRight: 4 }} />
                    Insert Model Response
                  </button>
                </div>

                <textarea
                  rows={6}
                  className="text-input"
                  placeholder="Type your academic defense explanation here using research literature, equations, and Coimbatore specific findings..."
                  value={currentAnswer}
                  onChange={e => handleAnswerChange(e.target.value)}
                  style={{ width: '100%', resize: 'vertical', lineHeight: 1.5 }}
                />
              </div>

              <div style={{ marginTop: 14, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 10 }}>
                <div style={{ display: 'flex', gap: 8 }}>
                  <button
                    type="button"
                    className="btn btn-ghost btn-sm"
                    onClick={() => setShowModelAnswer(!showModelAnswer)}
                  >
                    <BookOpen size={13} style={{ marginRight: 4 }} />
                    {showModelAnswer ? 'Hide Model Answer' : 'View Model Answer'}
                  </button>
                  {currentAnswer && (
                    <button
                      type="button"
                      className="btn btn-ghost btn-sm"
                      onClick={handleResetCurrent}
                      title="Clear answer for this question"
                    >
                      <RotateCcw size={13} style={{ marginRight: 4 }} />
                      Reset
                    </button>
                  )}
                </div>

                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={handleEvaluate}
                  disabled={evaluating || !currentAnswer.trim()}
                >
                  <Send size={14} style={{ marginRight: 6 }} />
                  {evaluating ? 'Grading Response...' : 'Submit to Examiner'}
                </button>
              </div>

              {/* Evaluation Feedback */}
              {currentEval && (
                <div style={{ marginTop: 20, padding: '18px', background: 'var(--bg-main)', borderRadius: 8, border: '1px solid var(--border)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                    <div>
                      <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>Examiner Evaluation</div>
                      <div style={{ fontSize: '1.25rem', fontWeight: 700, color: currentEval.score >= 7 ? 'var(--success)' : 'var(--orange)' }}>
                        {currentEval.score} / 10 Points
                      </div>
                    </div>
                    <span className={`badge ${currentEval.score >= 8 ? 'badge-success' : currentEval.score >= 6 ? 'badge-orange' : 'badge-error'}`} style={{ fontSize: '0.82rem' }}>
                      {currentEval.score >= 8 ? 'Excellent Defense' : currentEval.score >= 6 ? 'Satisfactory' : 'Needs Preparation'}
                    </span>
                  </div>

                  <p style={{ fontSize: '0.88rem', color: 'var(--text-primary)', marginBottom: 14, lineHeight: 1.5 }}>
                    {currentEval.feedback}
                  </p>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 16 }}>
                    <div style={{ background: '#fff', padding: '12px', borderRadius: 6, border: '1px solid var(--border)' }}>
                      <div style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--success)', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 4 }}>
                        <CheckCircle2 size={14} />
                        Key Points Addressed:
                      </div>
                      {currentEval.strengths && currentEval.strengths.length > 0 ? (
                        currentEval.strengths.map((s, i) => (
                          <div key={i} style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'flex-start', gap: 6, marginBottom: 4 }}>
                            <span style={{ color: 'var(--success)' }}>✓</span>
                            <span>{s}</span>
                          </div>
                        ))
                      ) : (
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>No key points detected.</div>
                      )}
                    </div>

                    <div style={{ background: '#fff', padding: '12px', borderRadius: 6, border: '1px solid var(--border)' }}>
                      <div style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--orange)', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 4 }}>
                        <AlertCircle size={14} />
                        Recommended Improvements:
                      </div>
                      {currentEval.areas_for_improvement && currentEval.areas_for_improvement.length > 0 ? (
                        currentEval.areas_for_improvement.map((a, i) => (
                          <div key={i} style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'flex-start', gap: 6, marginBottom: 4 }}>
                            <span style={{ color: 'var(--orange)' }}>•</span>
                            <span>{a}</span>
                          </div>
                        ))
                      ) : (
                        <div style={{ fontSize: '0.8rem', color: 'var(--success)' }}>All core examiner criteria satisfied!</div>
                      )}
                    </div>
                  </div>

                  {currentEval.recommended_reading && (
                    <div style={{ marginTop: 12, paddingTop: 10, borderTop: '1px solid var(--border)', fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                      <strong>Suggested Defense Literature:</strong> {currentEval.recommended_reading.join(' • ')}
                    </div>
                  )}
                </div>
              )}

              {/* Model Answer Drawer */}
              {showModelAnswer && (
                <div style={{ marginTop: 20, padding: '16px', background: '#fffbeb', borderRadius: 8, border: '1px solid #fde68a' }}>
                  <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#92400e', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
                    <BookOpen size={15} />
                    Official Model Defense Answer:
                  </div>
                  <p style={{ fontSize: '0.88rem', color: '#78350f', lineHeight: 1.6, margin: 0 }}>
                    {currentQ.model_answer}
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
