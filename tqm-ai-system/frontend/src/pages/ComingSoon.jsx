/**
 * Module placeholder — shown for all phases not yet implemented.
 * Professional academic presentation with plain-language description.
 * No technical jargon in the primary view.
 */
import { useNavigate } from 'react-router-dom'
import { PageHeader, Alert } from '../components/ui'
import { ArrowLeft, Clock } from 'lucide-react'

// Map technical module names to plain-language descriptions
const MODULE_INFO = {
  'Literature & Factors': {
    plainName: 'Literature & Factors',
    what: 'Manage the TQM factors identified from the academic literature review.',
    why: 'These factors form the foundation of the research — they are the Critical Success Factors and barriers that the study investigates.',
    what_next: 'Add factors from literature, categorise them, and track their status through the FDM consensus process.',
  },
  'Expert Consensus': {
    plainName: 'Expert Consensus',
    what: 'Manage the expert panel and collect linguistic ratings for each TQM factor.',
    why: 'The Fuzzy Delphi Method uses expert judgement to identify which factors reach consensus. Linguistic terms (e.g., "Very High", "High") are converted into fuzzy numbers for calculation.',
    what_next: 'Register expert panel members, collect their ratings, and run the consensus analysis.',
  },
  'Questionnaire': {
    plainName: 'Questionnaire Builder',
    what: 'Design the survey questionnaire using factors accepted by expert consensus.',
    why: 'A 5-point Likert scale questionnaire is used to collect data from ~120 construction professionals.',
    what_next: 'Generate questionnaire items from accepted factors, organise into sections, and pilot test.',
  },
  'Survey': {
    plainName: 'Survey Collection',
    what: 'Distribute the questionnaire and collect responses from construction professionals.',
    why: 'Survey data is the primary dataset for all statistical analyses.',
    what_next: 'Register respondents, collect responses, and monitor progress toward the target sample size.',
  },
  'Survey Analysis': {
    plainName: 'Survey Analysis',
    what: 'Compute descriptive statistics and rank factors by their relative importance.',
    why: 'Descriptive statistics summarise the survey data. The Relative Importance Index (RII) ranks each factor by how important respondents rated it.',
    what_next: 'Run analysis after sufficient survey responses are collected.',
  },
  'Factor Structure': {
    plainName: 'Factor Structure Analysis',
    what: 'Identify natural groupings of related TQM factors from the survey data.',
    why: 'Exploratory Factor Analysis (EFA) groups correlated items, reducing complexity and revealing the underlying structure of TQM implementation.',
    what_next: 'Requires KMO and Bartlett test clearance. Run after sufficient data is collected.',
  },
  'Group Comparison': {
    plainName: 'Group Comparison',
    what: 'Compare TQM ratings across different respondent groups (e.g., by experience or designation).',
    why: 'ANOVA identifies whether differences between groups are statistically significant.',
    what_next: 'Run after survey data collection is complete.',
  },
  'TQM Framework': {
    plainName: 'TQM Implementation Framework',
    what: 'A prioritized framework for TQM implementation based on all validated research findings.',
    why: 'Synthesises factor rankings, group analysis, and expert consensus into actionable guidance for construction projects.',
    what_next: 'Available after statistical analysis is complete.',
  },
  'Predictive Analysis': {
    plainName: 'Predictive Analysis',
    what: 'Machine learning models trained on survey data to predict TQM implementation outcomes.',
    why: 'Supplements the statistical methodology with data-driven pattern recognition.',
    what_next: 'Requires a scientifically valid outcome variable from the dataset. No models will be trained until this is confirmed.',
  },
  'Model Explanation': {
    plainName: 'Model Explanation',
    what: 'Understand which TQM factors most influenced the predictive model\'s output.',
    why: 'SHAP (SHapley Additive exPlanations) provides transparent explanations of model behaviour. Note: explanations describe model behaviour only — not causal relationships.',
    what_next: 'Available after predictive analysis is complete.',
  },
  'Recommendations': {
    plainName: 'Recommendations',
    what: 'Evidence-based recommendations for improving TQM implementation in construction projects.',
    why: 'Each recommendation is triggered by a statistical threshold and cites the supporting evidence.',
    what_next: 'Available after statistical analysis and framework are complete.',
  },
  'Research Assistant': {
    plainName: 'TQM Research Assistant',
    what: 'An offline chatbot that answers questions about the project, methodology, and findings.',
    why: 'Helps researchers, supervisors, and reviewers quickly understand the project.',
    what_next: 'Knowledge base will be populated as research progresses.',
  },
  'Viva Practice': {
    plainName: 'Viva Practice',
    what: 'A question-and-answer practice system covering all research concepts.',
    why: 'Helps the researcher prepare for their viva voce presentation.',
    what_next: 'Question bank will be populated as research progresses.',
  },
  'Reports': {
    plainName: 'Research Reports',
    what: 'Generate formatted reports for each stage of the research.',
    why: 'Reports support documentation, submission, and review by supervisors.',
    what_next: 'Available as each analysis module is completed.',
  },
  'Settings': {
    plainName: 'Settings & Administration',
    what: 'Manage users, configure the system, and view the audit log.',
    why: 'Supports multiple roles: Researcher, Respondent, Viewer, and Admin.',
    what_next: 'Authentication module will be implemented in a later phase.',
  },
}

export default function ComingSoon({ title, description }) {
  const navigate = useNavigate()
  const info = MODULE_INFO[title] || {
    plainName: title,
    what: description,
    why: null,
    what_next: 'This module will be available in a future development phase.',
  }

  return (
    <div className="page-inner fade-in">
      <PageHeader
        title={info.plainName}
        action={
          <button className="btn btn-ghost btn-sm" onClick={() => navigate('/')}>
            <ArrowLeft size={14} /> Dashboard
          </button>
        }
      />

      <div style={{ maxWidth: 720 }}>
        {/* Status */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: 10,
          padding: '16px 20px',
          background: 'var(--warning-bg)',
          border: '1px solid var(--warning-border)',
          borderRadius: 'var(--radius-lg)',
          marginBottom: 24,
        }}>
          <div style={{
            width: 36, height: 36, borderRadius: '50%',
            background: 'var(--warning-border)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            flexShrink: 0,
          }}>
            <Clock size={16} color="var(--warning)" />
          </div>
          <div>
            <div style={{ fontWeight: 600, fontSize: '0.875rem', color: 'var(--warning)', lineHeight: 1.2 }}>
              Module in development
            </div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: 2 }}>
              This section will become available as the research progresses.
            </div>
          </div>
        </div>

        {/* What this is */}
        <div style={{
          background: 'var(--bg-card)',
          border: '1px solid var(--border)',
          borderRadius: 'var(--radius-lg)',
          overflow: 'hidden',
          marginBottom: 16,
        }}>
          <div style={{ padding: '18px 24px', borderBottom: '1px solid var(--border)', background: 'var(--bg-subtle)' }}>
            <div style={{ fontWeight: 600, fontSize: '0.875rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              About this module
            </div>
          </div>

          <div style={{ padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: 20 }}>
            <div>
              <div style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: 6 }}>What it does</div>
              <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: 1.7 }}>{info.what}</p>
            </div>

            {info.why && (
              <div>
                <div style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: 6 }}>Why it matters</div>
                <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: 1.7 }}>{info.why}</p>
              </div>
            )}

            <div>
              <div style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: 6 }}>What comes next</div>
              <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: 1.7 }}>{info.what_next}</p>
            </div>
          </div>
        </div>

        <Alert type="info">
          No results will be displayed until real research data is available.
          All outputs are computed from actual data — nothing is fabricated.
        </Alert>
      </div>
    </div>
  )
}
