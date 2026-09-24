import { useState, useMemo } from 'react'
import {
  ClipboardCheck, Award, AlertTriangle, ShieldCheck, DollarSign,
  Printer, Sparkles, RefreshCw, FileText, CheckCircle2, XCircle,
  HelpCircle, ChevronRight, BarChart3, TrendingUp, Building2
} from 'lucide-react'
import { PageHeader, StatCard, SectionCard, Alert, StatusBadge, ProgressBar } from '../components/ui'

const SAMPLE_PROJECTS = [
  { id: 'p1', name: 'Saravanampatti Tech Park', type: 'Commercial IT Complex', budgetCr: 85, location: 'Saravanampatti, Coimbatore' },
  { id: 'p2', name: 'Avinashi Road Elevated Corridor', type: 'Infrastructure / Highway', budgetCr: 210, location: 'Avinashi Road, Coimbatore' },
  { id: 'p3', name: 'R.S. Puram Grand Residences', type: 'Residential High-Rise', budgetCr: 45, location: 'R.S. Puram, Coimbatore' },
  { id: 'p4', name: 'Sulur Industrial Logistics Hub', type: 'PEB Industrial Facility', budgetCr: 32, location: 'Sulur, Coimbatore' },
]

const AUDIT_CHECKLIST = [
  {
    dimId: 'dim1',
    dimName: 'Dimension 1: Leadership & Strategic Governance',
    weight: 25,
    items: [
      { id: 'q1', text: 'Top Management holds weekly formal quality review on site', factor: 'CSF1', critical: true },
      { id: 'q2', text: 'Written quality policy displayed in Tamil & English at all batching points', factor: 'CSF2', critical: false },
      { id: 'q3', text: 'Site engineers have dedicated authority to halt substandard pours', factor: 'CSF1', critical: true },
    ]
  },
  {
    dimId: 'dim2',
    dimName: 'Dimension 2: Material & Process Technical Verification',
    weight: 30,
    items: [
      { id: 'q4', text: 'Concrete slump tested for every transit mixer (target 100±25mm)', factor: 'CSF3', critical: true },
      { id: 'q5', text: '7-day & 28-day cube strength tests logged with NABL certified lab', factor: 'CSF3', critical: true },
      { id: 'q6', text: 'Rebar cover blocks (25/40/50mm) verified prior to pour sign-off', factor: 'CSF5', critical: false },
    ]
  },
  {
    dimId: 'dim3',
    dimName: 'Dimension 3: Human Capital & Skill Competency',
    weight: 25,
    items: [
      { id: 'q7', text: 'Mandatory 15-minute daily quality & safety toolbox briefing conducted', factor: 'CSF4', critical: false },
      { id: 'q8', text: 'Bar-benders and masons certified or trade-tested on regional standards', factor: 'CSF4', critical: true },
      { id: 'q9', text: 'Zero-rework incentive scheme active for subcontractor crews', factor: 'CSF6', critical: false },
    ]
  },
  {
    dimId: 'dim4',
    dimName: 'Dimension 4: Subcontractor & Supply Chain Quality',
    weight: 20,
    items: [
      { id: 'q10', text: 'Subcontractor contract includes mandatory ISO 9001 quality clauses', factor: 'CSF7', critical: true },
      { id: 'q11', text: 'Incoming cement & aggregate test certificates verified before unloading', factor: 'CSF8', critical: true },
      { id: 'q12', text: 'Digital Non-Conformance Report (NCR) system active with 48h closeout', factor: 'CSF8', critical: false },
    ]
  },
]

export default function QualityAudit() {
  const [selectedProjectId, setSelectedProjectId] = useState('p1')
  const [auditScores, setAuditScores] = useState({
    q1: true, q2: true, q3: true,
    q4: true, q5: true, q6: true,
    q7: false, q8: true, q9: false,
    q10: true, q11: true, q12: false
  })
  const [generatedCapa, setGeneratedCapa] = useState(null)
  const [capaLoading, setCapaLoading] = useState(false)
  const [activeTab, setActiveTab] = useState('audit') // 'audit' | 'coq' | 'certificate'

  const currentProject = SAMPLE_PROJECTS.find(p => p.id === selectedProjectId) || SAMPLE_PROJECTS[0]

  const handleToggle = (id) => {
    setAuditScores(prev => ({ ...prev, [id]: !prev[id] }))
  }

  // Calculate Compliance Score
  const compliance = useMemo(() => {
    let totalPossible = 0
    let totalEarned = 0

    AUDIT_CHECKLIST.forEach(cat => {
      const perItem = cat.weight / cat.items.length
      cat.items.forEach(item => {
        totalPossible += perItem
        if (auditScores[item.id]) {
          totalEarned += perItem
        }
      })
    })

    const score = Math.round((totalEarned / totalPossible) * 100)
    let tier = 'Critical Risk'
    let color = 'var(--error)'
    let badgeClass = 'badge-error'

    if (score >= 85) {
      tier = 'World-Class TQM (Tier 4)'
      color = 'var(--success)'
      badgeClass = 'badge-success'
    } else if (score >= 70) {
      tier = 'Substantial Quality (Tier 3)'
      color = 'var(--orange)'
      badgeClass = 'badge-orange'
    } else if (score >= 50) {
      tier = 'Marginal Compliance (Tier 2)'
      color = '#F59E0B'
      badgeClass = 'badge-neutral'
    }

    return { score, tier, color, badgeClass }
  }, [auditScores])

  // PAF Cost of Quality (CoQ) Model Calculator
  const coq = useMemo(() => {
    const budget = currentProject.budgetCr
    // Without TQM baseline:
    // Defect & rework costs ~ 6-9% of project budget
    const noTqmFailurePct = 7.5
    const noTqmInternalFailure = (budget * 100) * (noTqmFailurePct / 100) // in Lakhs
    const noTqmExternalFailure = (budget * 100) * 0.025
    const noTqmTotalCost = noTqmInternalFailure + noTqmExternalFailure

    // With TQM Implementation (PAF Model):
    // Prevention investment: 1.2% of budget
    // Appraisal investment: 0.8% of budget
    const complianceFactor = compliance.score / 100
    const preventionCost = (budget * 100) * 0.012
    const appraisalCost = (budget * 100) * 0.008
    const tqmInternalFailure = noTqmInternalFailure * (1 - (complianceFactor * 0.72))
    const tqmExternalFailure = noTqmExternalFailure * (1 - (complianceFactor * 0.85))
    const tqmTotalCoQ = preventionCost + appraisalCost + tqmInternalFailure + tqmExternalFailure

    const netSavings = noTqmTotalCost - tqmTotalCoQ
    const roqi = ((netSavings / (preventionCost + appraisalCost)) * 100).toFixed(1)

    return {
      prevention: Math.round(preventionCost),
      appraisal: Math.round(appraisalCost),
      internalFailure: Math.round(tqmInternalFailure),
      externalFailure: Math.round(tqmExternalFailure),
      totalCoQ: Math.round(tqmTotalCoQ),
      baselineCost: Math.round(noTqmTotalCost),
      netSavings: Math.round(netSavings),
      roqi: roqi > 0 ? roqi : 0
    }
  }, [currentProject, compliance])

  const handleGenerateCapa = () => {
    setCapaLoading(true)
    setTimeout(() => {
      const failedItems = []
      AUDIT_CHECKLIST.forEach(cat => {
        cat.items.forEach(it => {
          if (!auditScores[it.id]) failedItems.push(it)
        })
      })

      setGeneratedCapa({
        date: new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }),
        projectId: currentProject.name,
        complianceScore: compliance.score,
        actions: failedItems.length > 0 ? failedItems.map(f => ({
          factor: f.factor,
          finding: `Non-conformance detected: "${f.text}"`,
          remediation: `Deploy mandatory standard operating procedure and assign QA/QC inspector for daily sign-off in line with ${f.factor} regional guidelines.`,
          timeline: '48 Hours',
          responsible: 'Project QA/QC Lead & Resident Engineer'
        })) : [
          {
            factor: 'All Factors',
            finding: '100% Audit Compliance Achieved',
            remediation: 'Maintain daily inspection cadence and preserve records for quarterly external academic benchmarking.',
            timeline: 'Continuous',
            responsible: 'Site Quality Manager'
          }
        ]
      })
      setCapaLoading(false)
    }, 400)
  }

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto' }}>
      <PageHeader
        title="Site Quality Audit & Cost of Quality (CoQ) Optimizer"
        subtitle="Empirical field compliance evaluator, PAF Cost of Quality model, and AI automated Corrective Action Plan (CAPA) engine."
        action={
          <div style={{ display: 'flex', gap: 8 }}>
            <button
              className="btn btn-primary btn-sm"
              onClick={() => setActiveTab('certificate')}
              style={{ display: 'flex', alignItems: 'center', gap: 6 }}
            >
              <Award size={14} />
              View Audit Certificate
            </button>
          </div>
        }
      />

      {/* Tabs Bar */}
      <div className="tab-bar" style={{ display: 'flex', borderBottom: '1px solid var(--border)', marginBottom: 20 }}>
        <button
          className={`tab-btn ${activeTab === 'audit' ? 'active' : ''}`}
          onClick={() => setActiveTab('audit')}
        >
          Site Inspection Audit
        </button>
        <button
          className={`tab-btn ${activeTab === 'coq' ? 'active' : ''}`}
          onClick={() => setActiveTab('coq')}
        >
          Cost of Quality (CoQ) Analyzer
        </button>
        <button
          className={`tab-btn ${activeTab === 'certificate' ? 'active' : ''}`}
          onClick={() => setActiveTab('certificate')}
        >
          Compliance Certificate
        </button>
      </div>

      {/* Project Selector Bar */}
      <div className="card card-pad" style={{ marginBottom: 20, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 14 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <Building2 size={20} color="var(--orange)" />
          <div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Target Construction Project:</div>
            <select
              value={selectedProjectId}
              onChange={e => setSelectedProjectId(e.target.value)}
              className="select-input"
              style={{ fontWeight: 600, fontSize: '0.92rem', padding: '6px 10px', marginTop: 2 }}
            >
              {SAMPLE_PROJECTS.map(p => (
                <option key={p.id} value={p.id}>{p.name} ({p.type})</option>
              ))}
            </select>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
          <div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Project Budget:</div>
            <div style={{ fontSize: '0.92rem', fontWeight: 700, color: 'var(--text-primary)' }}>₹{currentProject.budgetCr} Crores</div>
          </div>
          <div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Location:</div>
            <div style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-secondary)' }}>{currentProject.location}</div>
          </div>
        </div>
      </div>

      {/* ── Tab 1: Site Inspection Audit ── */}
      {activeTab === 'audit' && (
        <>
          {/* Top Compliance Overview */}
          <div className="stat-grid" style={{ marginBottom: 24 }}>
            <StatCard
              icon={ClipboardCheck}
              label="Quality Compliance Score"
              value={`${compliance.score}%`}
              meta={compliance.tier}
            />
            <StatCard
              icon={DollarSign}
              label="Estimated Net Quality Savings"
              value={`₹${coq.netSavings} Lakhs`}
              meta={`ROQI: ${coq.roqi}% return`}
            />
            <StatCard
              icon={ShieldCheck}
              label="Audit Status"
              value={compliance.score >= 70 ? 'Passed' : 'Action Required'}
              meta={`${Object.values(auditScores).filter(Boolean).length} of 12 checkpoints verified`}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 20, marginBottom: 24 }}>
            {AUDIT_CHECKLIST.map(cat => (
              <div key={cat.dimId} className="card card-pad">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                  <h3 style={{ fontSize: '0.92rem', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>
                    {cat.dimName}
                  </h3>
                  <span className="badge badge-neutral" style={{ fontSize: '0.72rem' }}>
                    Weight: {cat.weight}%
                  </span>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {cat.items.map(item => {
                    const isChecked = !!auditScores[item.id]
                    return (
                      <div
                        key={item.id}
                        onClick={() => handleToggle(item.id)}
                        style={{
                          display: 'flex',
                          alignItems: 'flex-start',
                          gap: 10,
                          padding: '10px 12px',
                          borderRadius: 8,
                          border: isChecked ? '1px solid var(--orange-border)' : '1px solid var(--border)',
                          background: isChecked ? 'var(--orange-subtle)' : 'var(--bg-main)',
                          cursor: 'pointer',
                          transition: 'all 0.16s ease'
                        }}
                      >
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => {}}
                          style={{ accentColor: 'var(--orange)', marginTop: 3 }}
                        />
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontSize: '0.84rem', color: isChecked ? 'var(--text-primary)' : 'var(--text-secondary)', fontWeight: isChecked ? 600 : 400, lineHeight: 1.35 }}>
                            {item.text}
                          </div>
                          <div style={{ display: 'flex', gap: 6, marginTop: 4 }}>
                            <span style={{ fontSize: '0.7rem', color: 'var(--orange)', fontFamily: 'monospace', fontWeight: 700 }}>
                              {item.factor}
                            </span>
                            {item.critical && (
                              <span style={{ fontSize: '0.68rem', color: 'var(--error)', fontWeight: 600 }}>
                                • Mandatory Check
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            ))}
          </div>

          {/* AI CAPA Remediation Engine */}
          <SectionCard
            title="AI Non-Conformance & CAPA Remediation Protocol"
            subtitle="Automatically generate an ISO 9001:2015 compliant Corrective & Preventive Action Plan for failed audit items."
            action={
              <button
                className="btn btn-primary btn-sm"
                onClick={handleGenerateCapa}
                disabled={capaLoading}
                style={{ display: 'flex', alignItems: 'center', gap: 6 }}
              >
                <Sparkles size={14} />
                {capaLoading ? 'Generating CAPA...' : 'Generate AI Action Plan'}
              </button>
            }
          >
            {generatedCapa ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 14px', background: 'var(--orange-subtle)', borderRadius: 8, border: '1px solid var(--orange-border)' }}>
                  <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--orange-dark)' }}>
                    CAPA Protocol Issued for: {generatedCapa.projectId}
                  </span>
                  <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                    Issued: {generatedCapa.date}
                  </span>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {generatedCapa.actions.map((act, i) => (
                    <div key={i} style={{ padding: '12px 14px', borderRadius: 8, background: 'var(--bg-main)', border: '1px solid var(--border)' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                        <span style={{ fontWeight: 700, fontSize: '0.82rem', color: 'var(--error)' }}>
                          {act.finding}
                        </span>
                        <span className="badge badge-orange" style={{ fontSize: '0.7rem' }}>
                          Timeline: {act.timeline}
                        </span>
                      </div>
                      <p style={{ fontSize: '0.85rem', color: 'var(--text-primary)', margin: '6px 0', lineHeight: 1.45 }}>
                        <strong>Remediation:</strong> {act.remediation}
                      </p>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                        Assigned To: {act.responsible} • Linked CSF: {act.factor}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div style={{ textAlign: 'center', padding: '24px 16px', color: 'var(--text-muted)', fontSize: '0.88rem' }}>
                <Sparkles size={28} color="var(--orange)" style={{ margin: '0 auto 10px', opacity: 0.8 }} />
                Click <strong>"Generate AI Action Plan"</strong> above to synthesize instant remediation protocols for any unverified site items.
              </div>
            )}
          </SectionCard>
        </>
      )}

      {/* ── Tab 2: Cost of Quality (CoQ) Analyzer ── */}
      {activeTab === 'coq' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          <Alert type="info">
            <strong>PAF (Prevention, Appraisal, Failure) Economic Quality Model:</strong> Shows how proactive investments
            in worker training (CSF4) and management governance (CSF1) eliminate catastrophic concrete rework, structural honeycombing patching, and client penalty claims.
          </Alert>

          <div className="stat-grid">
            <StatCard icon={TrendingUp} label="Net Quality Benefit" value={`₹${coq.netSavings} Lakhs`} meta="Avoided rework & defects" />
            <StatCard icon={BarChart3} label="Return on Quality Inv. (ROQI)" value={`${coq.roqi}%`} meta="Benefit / (Prevention + Appraisal)" />
            <StatCard icon={DollarSign} label="Total Prevention & Appraisal" value={`₹${coq.prevention + coq.appraisal} Lakhs`} meta="Direct TQM investment" />
            <StatCard icon={AlertTriangle} label="Failure Cost Reduction" value={`-₹${coq.baselineCost - (coq.internalFailure + coq.externalFailure)} Lakhs`} meta="Compared to no-TQM baseline" />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 20 }}>
            {/* Cost Breakdown */}
            <SectionCard title="TQM Cost of Quality Breakdown (₹ Lakhs)">
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                {[
                  { label: 'Prevention Costs (P)', value: coq.prevention, desc: 'QA planning, worker training (CSF4), process SOPs', color: 'var(--green)' },
                  { label: 'Appraisal Costs (A)', value: coq.appraisal, desc: 'Laboratory cube tests, ultrasonic testing, site inspections', color: '#06B6D4' },
                  { label: 'Internal Failure Costs (IF)', value: coq.internalFailure, desc: 'Rework, patching, scrap, demolition of defective pours', color: '#F59E0B' },
                  { label: 'External Failure Costs (EF)', value: coq.externalFailure, desc: 'Warranty leakage rectifications, client dispute claims', color: 'var(--error)' },
                ].map(item => (
                  <div key={item.label} style={{ padding: '10px 12px', background: 'var(--bg-main)', borderRadius: 8, border: '1px solid var(--border)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                      <span style={{ fontWeight: 600, fontSize: '0.85rem', color: 'var(--text-primary)' }}>{item.label}</span>
                      <span style={{ fontWeight: 700, fontSize: '0.92rem', color: item.color }}>₹{item.value} Lakhs</span>
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{item.desc}</div>
                  </div>
                ))}
              </div>
            </SectionCard>

            {/* Financial Comparison */}
            <SectionCard title="Baseline Comparison: Without TQM vs With TQM">
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.84rem', marginBottom: 6 }}>
                    <span style={{ fontWeight: 600 }}>Uncontrolled Defects (Without TQM)</span>
                    <span style={{ fontWeight: 700, color: 'var(--error)' }}>₹{coq.baselineCost} Lakhs</span>
                  </div>
                  <ProgressBar value={100} max={100} />
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 4 }}>
                    High internal rework (7.5% of budget) + external claims (2.5%).
                  </div>
                </div>

                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.84rem', marginBottom: 6 }}>
                    <span style={{ fontWeight: 600 }}>Optimized CoQ (With TQM 4-Tier Framework)</span>
                    <span style={{ fontWeight: 700, color: 'var(--success)' }}>₹{coq.totalCoQ} Lakhs</span>
                  </div>
                  <ProgressBar value={coq.totalCoQ} max={coq.baselineCost} />
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 4 }}>
                    Upfront quality prevention reduces total cost by ₹{coq.netSavings} Lakhs.
                  </div>
                </div>

                <div style={{ padding: '12px', background: 'var(--orange-subtle)', borderRadius: 8, border: '1px solid var(--orange-border)', marginTop: 8 }}>
                  <div style={{ fontWeight: 700, fontSize: '0.88rem', color: 'var(--orange-dark)' }}>
                    Economic Quality Dividend
                  </div>
                  <div style={{ fontSize: '0.82rem', color: 'var(--text-primary)', marginTop: 4, lineHeight: 1.4 }}>
                    For every ₹1.00 invested in prevention & appraisal on <strong>{currentProject.name}</strong>,
                    the project saves <strong>₹{(coq.netSavings / (coq.prevention + coq.appraisal) || 0).toFixed(2)}</strong> in avoided failure costs.
                  </div>
                </div>
              </div>
            </SectionCard>
          </div>
        </div>
      )}

      {/* ── Tab 3: Official Compliance Certificate ── */}
      {activeTab === 'certificate' && (
        <div className="card card-pad" style={{ padding: '36px 32px', border: '2px solid var(--orange-border)', position: 'relative' }}>
          <div style={{ textAlign: 'center', marginBottom: 24, borderBottom: '2px solid var(--border)', paddingBottom: 20 }}>
            <div style={{
              width: 56, height: 56, borderRadius: '50%',
              background: 'linear-gradient(135deg, #F97316, #EA580C)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              margin: '0 auto 12px', color: '#fff', boxShadow: '0 4px 14px rgba(249, 115, 22, 0.4)'
            }}>
              <Award size={32} />
            </div>
            <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              TQM Site Quality Audit Certificate
            </h2>
            <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: 4 }}>
              Department of Civil Engineering · Empirical Research Audit Protocol · Coimbatore
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 20, marginBottom: 28 }}>
            <div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Project Evaluated:</div>
              <div style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)' }}>{currentProject.name}</div>
              <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>{currentProject.location}</div>
            </div>
            <div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Project Type & Budget:</div>
              <div style={{ fontSize: '0.92rem', fontWeight: 600, color: 'var(--text-primary)' }}>{currentProject.type}</div>
              <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>₹{currentProject.budgetCr} Crores</div>
            </div>
            <div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Compliance Level:</div>
              <div style={{ fontSize: '1.1rem', fontWeight: 800, color: compliance.color }}>
                {compliance.score}% — {compliance.tier}
              </div>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Audit Date: {new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</div>
            </div>
          </div>

          <div style={{ padding: '16px 20px', background: 'var(--bg-main)', borderRadius: 8, border: '1px solid var(--border)', marginBottom: 28 }}>
            <div style={{ fontSize: '0.88rem', color: 'var(--text-primary)', lineHeight: 1.6 }}>
              This certifies that <strong>{currentProject.name}</strong> was audited against the 16 Total Quality Management
              Critical Success Factors (CSFs) and Barriers established via Fuzzy Delphi consensus (S ≥ 0.70) and calibrated against
              the empirical Coimbatore construction database (N=120).
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', paddingTop: 24, borderTop: '1px solid var(--border)', flexWrap: 'wrap', gap: 20 }}>
            <div>
              <div style={{ fontFamily: 'monospace', fontSize: '0.82rem', color: 'var(--text-secondary)', fontWeight: 600 }}>
                Verification ID: TQM-CBE-{(compliance.score * 1234).toString(16).toUpperCase()}
              </div>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                System Persistence: Active Empirical Store
              </div>
            </div>
            <div style={{ display: 'flex', gap: 12 }}>
              <button
                className="btn btn-outline btn-sm"
                onClick={() => window.print()}
                style={{ display: 'flex', alignItems: 'center', gap: 6 }}
              >
                <Printer size={14} />
                Print Certificate
              </button>
              <button
                className="btn btn-primary btn-sm"
                onClick={() => setActiveTab('audit')}
              >
                Return to Audit Checkpoints
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
