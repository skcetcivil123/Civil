/**
 * AIAssistantDrawer — Interactive Global AI Research Copilot.
 * Features:
 *  - Rich markdown rendering for AI responses
 *  - Descriptive action cards with purpose explanations
 *  - Screen-aware context with detailed predetermined questions
 *  - Dual-mode (Simple / Academic)
 *  - Zero typing required — 100% click-based interface
 */
import { useState, useEffect, useRef, useMemo } from 'react'
import { useLocation } from 'react-router-dom'
import {
  Sparkles, X, Bot, User, Copy, Check, ChevronRight, CheckCircle,
  HelpCircle, Lightbulb, Compass, RotateCcw, BarChart2, Layers,
  BookOpen, Users, Calculator, ShieldCheck, FileSpreadsheet,
  Award, BrainCircuit, GraduationCap, FileText, Settings,
  Target, Zap, TrendingUp, MessageSquare, ArrowRight
} from 'lucide-react'
import { chatbotApi } from '../api/client'

/* ─── Simple Markdown Parser (Offline, Zero Dependencies) ─────────────────── */
function renderMarkdown(text) {
  if (!text) return null
  const lines = text.split('\n')
  const elements = []
  let i = 0
  let key = 0

  const inlineFormat = (str) => {
    // Bold **text** or __text__
    const parts = []
    const regex = /(\*\*|__)(.*?)\1|(`)(.*?)\3|(#{1,4}\s)/g
    let last = 0
    let match
    while ((match = regex.exec(str)) !== null) {
      if (match.index > last) {
        parts.push(str.slice(last, match.index))
      }
      if (match[1]) {
        parts.push(<strong key={match.index}>{match[2]}</strong>)
      } else if (match[3]) {
        parts.push(<code key={match.index}>{match[4]}</code>)
      }
      last = match.index + match[0].length
    }
    if (last < str.length) parts.push(str.slice(last))
    return parts.length > 0 ? parts : [str]
  }

  while (i < lines.length) {
    const line = lines[i]

    // Empty line
    if (line.trim() === '') {
      i++
      continue
    }

    // Headers
    const headerMatch = line.match(/^(#{1,4})\s+(.*)/)
    if (headerMatch) {
      const level = headerMatch[1].length
      const Tag = level <= 3 ? 'h3' : 'h4'
      elements.push(<Tag key={key++}>{inlineFormat(headerMatch[2])}</Tag>)
      i++
      continue
    }

    // Blockquote
    if (line.startsWith('>')) {
      const quoteLines = []
      while (i < lines.length && lines[i].startsWith('>')) {
        quoteLines.push(lines[i].replace(/^>\s?/, ''))
        i++
      }
      elements.push(
        <blockquote key={key++}>
          {quoteLines.map((ql, qi) => <span key={qi}>{inlineFormat(ql)}<br/></span>)}
        </blockquote>
      )
      continue
    }

    // Horizontal rule
    if (/^---+$/.test(line.trim()) || /^\*\*\*+$/.test(line.trim())) {
      elements.push(<hr key={key++} />)
      i++
      continue
    }

    // Unordered list (•, -, *, or numbered)
    const listMatch = line.match(/^\s*([•\-\*]|\d+[\.\)])\s+(.*)/)
    if (listMatch) {
      const isOrdered = /^\d/.test(listMatch[1])
      const items = []
      while (i < lines.length) {
        const lm = lines[i].match(/^\s*([•\-\*]|\d+[\.\)])\s+(.*)/)
        if (!lm) break
        items.push(lm[2])
        i++
      }
      const ListTag = isOrdered ? 'ol' : 'ul'
      elements.push(
        <ListTag key={key++}>
          {items.map((item, ii) => <li key={ii}>{inlineFormat(item)}</li>)}
        </ListTag>
      )
      continue
    }

    // Regular paragraph
    elements.push(<p key={key++}>{inlineFormat(line)}</p>)
    i++
  }

  return elements
}

/* ─── Screen Contexts with Rich Descriptions ──────────────────────────────── */
const SCREEN_CONTEXTS = {
  '/': {
    title: 'Executive Dashboard',
    tag: 'dashboard',
    icon: Target,
    color: '#F97316',
    summary: 'High-level synthesis of all 6 research phases, dual-mode system health, and key empirical metrics.',
    actions: [
      { id: 'explain', label: '⚡ Explain This Dashboard', desc: 'Complete overview of every metric, pipeline stage, and what each number means for construction quality', query: 'Explain this screen', icon: Sparkles, bg: '#FFF7ED' },
      { id: 'findings', label: '📊 Key Research Findings', desc: 'All critical numbers: N=120, α=0.759, KMO=0.835, 4 EFA dimensions, XGBoost 86.7%', query: 'What are the key findings and empirical metrics?', icon: BarChart2, bg: '#EFF6FF' },
      { id: 'pipeline', label: '🔬 Research Pipeline', desc: 'How the 6-stage methodology flows: Literature → FDM → Survey → Statistics → Framework → AI', query: 'Explain the research pipeline', icon: Layers, bg: '#F0FDF4' },
      { id: 'improve', label: '🚀 How to Improve Quality', desc: 'Evidence-based action plans for construction companies to maximize quality outcomes', query: 'How can construction companies improve quality to the maximum?', icon: TrendingUp, bg: '#FFF7ED' },
    ],
    chips: ['What is this project about?', 'What is the sample size?', 'Who are the experts?', 'What is CSF1?']
  },
  '/factors': {
    title: 'Literature Review & Factors',
    tag: 'factors',
    icon: BookOpen,
    color: '#2563EB',
    summary: '16 empirical variables (8 CSFs & 8 Barriers) screened from construction management literature.',
    actions: [
      { id: 'explain', label: '⚡ Explain All 16 Factors', desc: 'What each CSF and Barrier means, why it matters, and its RII ranking position', query: 'Explain this screen', icon: Sparkles, bg: '#FFF7ED' },
      { id: 'csfs', label: '✅ 8 Critical Success Factors', desc: 'CSF1 (Leadership) through CSF8 (Quality Culture) — the drivers of construction quality', query: 'What are the 8 critical success factors?', icon: CheckCircle, bg: '#F0FDF4' },
      { id: 'barriers', label: '⚠️ 8 Implementation Barriers', desc: 'BAR1 (No Management) through BAR8 (Communication) — what blocks quality improvement', query: 'What are the 8 barriers?', icon: HelpCircle, bg: '#FEF2F2' },
      { id: 'csf1', label: '🏆 Why CSF1 is Ranked #1', desc: 'Deep analysis: Top Management Commitment scored highest RII (0.898) among 120 professionals', query: 'Why is CSF1 ranked number 1?', icon: Award, bg: '#EFF6FF' },
    ],
    chips: ['Explain BAR2 labor shortage', 'How were these 16 factors extracted?', 'CSF vs Barrier comparison']
  },
  '/experts': {
    title: 'FDM Expert Panel',
    tag: 'experts',
    icon: Users,
    color: '#7C3AED',
    summary: '10 industry and academic experts from Coimbatore (PWD, CREDAI, GCT, PSG Tech).',
    actions: [
      { id: 'explain', label: '⚡ Explain Expert Panel', desc: 'Who are the 10 Coimbatore experts, their organizations, experience levels, and selection criteria', query: 'Explain this screen', icon: Sparkles, bg: '#FFF7ED' },
      { id: 'who', label: '👥 Meet the 10 Experts', desc: 'Profiles from L&T, PWD, CREDAI Tamil Nadu, GCT, PSG Tech — averaging 21.2 years experience', query: 'Who are the 10 Coimbatore experts?', icon: Users, bg: '#F5F3FF' },
      { id: 'criteria', label: '📋 Selection Criteria', desc: 'Why minimum 15 years experience, published research, and active project involvement were required', query: 'What were the selection criteria?', icon: ShieldCheck, bg: '#F0FDF4' },
      { id: 'ratings', label: '🔢 Linguistic Rating Scale', desc: 'How experts converted qualitative judgments into Triangular Fuzzy Numbers (TFN)', query: 'How were linguistic ratings handled?', icon: Calculator, bg: '#EFF6FF' },
    ],
    chips: ['What is FDM?', 'Why 10 experts?', 'Expert consensus results']
  },
  '/fdm': {
    title: 'FDM Consensus Engine',
    tag: 'fdm',
    icon: Calculator,
    color: '#059669',
    summary: 'Fuzzy Delphi Method with Triangular Fuzzy Numbers and S ≥ 0.70 acceptance threshold.',
    actions: [
      { id: 'explain', label: '⚡ Explain FDM Engine', desc: 'How the Fuzzy Delphi Method works, step by step: linguistic scales → TFN → defuzzification → consensus', query: 'Explain this screen', icon: Sparkles, bg: '#FFF7ED' },
      { id: 'threshold', label: '📏 Why S ≥ 0.70 Cutoff', desc: 'Academic justification for the acceptance threshold based on Cheng & Lin (2002) methodology', query: 'Why is S >= 0.70 the cutoff?', icon: Target, bg: '#F0FDF4' },
      { id: 'defuzz', label: '🧮 Defuzzification Formula', desc: 'Graded Mean Integration: S = (l + 4m + u) / 6 — converting fuzzy triangles to crisp scores', query: 'How does defuzzification work?', icon: Calculator, bg: '#EFF6FF' },
      { id: 'results', label: '📊 Consensus Results', desc: 'Which factors achieved highest expert consensus and what their S-values indicate', query: 'Which factors had the highest consensus?', icon: BarChart2, bg: '#FFF7ED' },
    ],
    chips: ['What is a Triangular Fuzzy Number?', 'FDM vs classical Delphi', 'Expert panel composition']
  },
  '/questionnaire': {
    title: 'Questionnaire Instrument',
    tag: 'questionnaire',
    icon: FileSpreadsheet,
    color: '#D97706',
    summary: 'Structured 5-point Likert scale instrument for 16 operationalized factors.',
    actions: [
      { id: 'explain', label: '⚡ Explain Questionnaire', desc: 'How the survey instrument was designed: Likert anchors, factor wording, and pilot testing process', query: 'Explain this screen', icon: Sparkles, bg: '#FFF7ED' },
      { id: 'likert', label: '📝 Why 5-Point Likert Scale', desc: 'Academic justification: balanced sensitivity vs respondent fatigue for construction professionals', query: 'Why a 5-point Likert scale?', icon: FileSpreadsheet, bg: '#FFFBEB' },
      { id: 'constructs', label: '🔧 How Constructs Map', desc: 'How each abstract concept (e.g., "Top Management Commitment") becomes a measurable survey question', query: 'How are constructs operationalized?', icon: Settings, bg: '#F1F5F9' },
    ],
    chips: ['Explain pilot testing', 'Scale anchors meaning', 'Survey distribution method']
  },
  '/survey': {
    title: 'Survey Data Collection',
    tag: 'survey',
    icon: FileSpreadsheet,
    color: '#2563EB',
    summary: 'Dataset of 120 verified construction professionals across Coimbatore.',
    actions: [
      { id: 'explain', label: '⚡ Explain Survey Data', desc: 'Complete breakdown of 120 respondents: roles, experience levels, firm types, and project categories', query: 'Explain this screen', icon: Sparkles, bg: '#FFF7ED' },
      { id: 'breakdown', label: '👷 Respondent Breakdown', desc: 'Distribution across engineers, project managers, contractors, consultants, and quality specialists', query: 'Breakdown of 120 respondents', icon: Users, bg: '#EFF6FF' },
      { id: 'adequate', label: '📐 Is N=120 Adequate?', desc: 'Statistical adequacy: Hair et al. recommend N ≥ 5× variables — we have 120/16 = 7.5× (exceeds)', query: 'Is 120 sample size adequate for EFA?', icon: ShieldCheck, bg: '#F0FDF4' },
      { id: 'demo', label: '📊 Demographics Detail', desc: 'Experience distribution: <5yrs, 5-10yrs, 10-20yrs, >20yrs across building and infrastructure sectors', query: 'Demographics by role and experience', icon: BarChart2, bg: '#FFF7ED' },
    ],
    chips: ['How was data collected?', 'Response rate', 'Sampling method']
  },
  '/statistics': {
    title: 'Descriptive Statistics & RII',
    tag: 'statistics',
    icon: BarChart2,
    color: '#7C3AED',
    summary: 'Relative Importance Index (RII) calculation and ranking of all 16 factors.',
    actions: [
      { id: 'explain', label: '⚡ Explain RII Analysis', desc: 'What RII measures, its formula, and why it ranks factors better than simple arithmetic mean', query: 'Explain this screen', icon: Sparkles, bg: '#FFF7ED' },
      { id: 'formula', label: '📐 RII Formula & Method', desc: 'RII = ΣW / (A × N) where W=weight, A=highest weight (5), N=total respondents (120)', query: 'Why is RII superior to mean?', icon: Calculator, bg: '#EFF6FF' },
      { id: 'csf1rank', label: '🏆 CSF1 Rank #1 Analysis', desc: 'Why Top Management Commitment achieved RII=0.898 — highest among all 16 factors from 120 professionals', query: 'Explain CSF1 Top Management rank 1', icon: Award, bg: '#F0FDF4' },
      { id: 'bar2rank', label: '⚠️ BAR2 Labor Shortage', desc: 'Skilled labor shortage scored RII=0.883 — ranked #2 barrier due to 70% migrant workforce dependency', query: 'Why is BAR2 Labor Shortage rank 2?', icon: HelpCircle, bg: '#FEF2F2' },
    ],
    chips: ['Top 5 ranked factors', 'RII formula calculation', 'Descriptive statistics summary']
  },
  '/reliability': {
    title: 'Questionnaire Reliability (Cronbach α)',
    tag: 'reliability',
    icon: ShieldCheck,
    color: '#16A34A',
    summary: "Internal consistency: Cronbach's Alpha = 0.759 (exceeds 0.70 benchmark).",
    actions: [
      { id: 'explain', label: '⚡ Explain Reliability', desc: 'What Cronbach\'s Alpha measures, why 0.759 is considered "good" reliability, and what it proves', query: 'Explain this screen', icon: Sparkles, bg: '#FFF7ED' },
      { id: 'alpha', label: '📊 Why α = 0.759 is Good', desc: 'Nunnally (1978) benchmark: α ≥ 0.70 = acceptable. Our 0.759 confirms internal survey consistency', query: "Why is Cronbach's α = 0.759 good?", icon: ShieldCheck, bg: '#F0FDF4' },
      { id: 'below', label: '❌ What if α < 0.70?', desc: 'Would require item deletion, rewording, or re-piloting — questionnaire would be deemed unreliable', query: 'What if α was below 0.70?', icon: HelpCircle, bg: '#FEF2F2' },
      { id: 'itemtotal', label: '🔗 Item-Total Correlation', desc: 'How each individual question contributes to overall scale reliability — no weak items detected', query: 'Item-total correlation interpretation', icon: BarChart2, bg: '#EFF6FF' },
    ],
    chips: ['Reliability interpretation rules', 'Scale consistency check', 'Internal consistency meaning']
  },
  '/kmo': {
    title: 'Data Suitability (KMO & Bartlett)',
    tag: 'kmo',
    icon: CheckCircle,
    color: '#2563EB',
    summary: "KMO = 0.835 ('Meritorious') and Bartlett's Test (p < 0.001) validate EFA.",
    actions: [
      { id: 'explain', label: '⚡ Explain Suitability Tests', desc: 'Two prerequisite tests that confirm your data is suitable for advanced factor analysis (EFA)', query: 'Explain this screen', icon: Sparkles, bg: '#FFF7ED' },
      { id: 'kmo', label: '📊 KMO = 0.835 Meaning', desc: '"Meritorious" data adequacy (Kaiser & Rice 1974). Scale: >0.90 Marvelous, >0.80 Meritorious, >0.70 Middling', query: 'What does KMO = 0.835 indicate?', icon: BarChart2, bg: '#EFF6FF' },
      { id: 'bartlett', label: '🧪 Bartlett\'s Test', desc: 'Chi-square statistic with p < 0.001 proves variables are correlated (not random) — EFA is justified', query: "Why is Bartlett's Test significant?", icon: ShieldCheck, bg: '#F0FDF4' },
      { id: 'sample', label: '📐 Sample Adequacy Rules', desc: 'N=120 satisfies Hair et al. (≥100), Kaiser (≥5:1 ratio = 7.5:1 achieved), and Comrey & Lee guidelines', query: 'Does N=120 satisfy sample rules?', icon: Calculator, bg: '#FFF7ED' },
    ],
    chips: ['KMO interpretation scale', 'What is factorability?', 'Prerequisites for EFA']
  },
  '/efa': {
    title: 'Factor Structure (EFA)',
    tag: 'efa',
    icon: Layers,
    color: '#7C3AED',
    summary: 'Principal Axis Factoring with Varimax rotation: 16 variables → 4 Latent Dimensions (59.9%).',
    actions: [
      { id: 'explain', label: '⚡ Explain EFA Results', desc: 'How 16 separate variables condensed into 4 meaningful dimensions explaining 59.9% of total variance', query: 'Explain this screen', icon: Sparkles, bg: '#FFF7ED' },
      { id: 'dims', label: '🧩 The 4 Dimensions', desc: 'Strategic Leadership, Process & Systems, People & Culture, External Stakeholders — what each contains', query: 'Explain the 4 Latent Dimensions', icon: Layers, bg: '#F5F3FF' },
      { id: 'varimax', label: '🔄 Why Varimax Rotation', desc: 'Orthogonal rotation produces clean, interpretable loadings with zero correlation between dimensions', query: 'Why Varimax orthogonal rotation?', icon: Calculator, bg: '#EFF6FF' },
      { id: 'variance', label: '📊 59.9% Variance Explained', desc: 'Above the 50-60% threshold (Hair et al. 2019). These 4 dimensions capture most TQM implementation behavior', query: 'What does 59.9% variance explained mean?', icon: BarChart2, bg: '#F0FDF4' },
    ],
    chips: ['Factor loadings explained', 'Eigenvalue meaning', 'Kaiser criterion']
  },
  '/anova': {
    title: 'Group Comparison (ANOVA)',
    tag: 'anova',
    icon: BarChart2,
    color: '#D97706',
    summary: 'One-Way ANOVA: F = 0.89, p = 0.448 > 0.05 — no significant group differences.',
    actions: [
      { id: 'explain', label: '⚡ Explain ANOVA Results', desc: 'Tests whether junior engineers and senior directors perceive TQM quality factors differently', query: 'Explain this screen', icon: Sparkles, bg: '#FFF7ED' },
      { id: 'roles', label: '👥 Differences Across Roles', desc: 'Comparing perceptions of engineers, PMs, contractors, consultants, and quality managers', query: 'Are there significant differences across roles?', icon: Users, bg: '#EFF6FF' },
      { id: 'pvalue', label: '📊 Why p > 0.05', desc: 'p = 0.448 means NO statistically significant difference — all experience groups agree on quality priorities', query: 'Why is p > 0.05 across experience groups?', icon: BarChart2, bg: '#FFFBEB' },
      { id: 'conclusion', label: '🎓 Academic Conclusion', desc: 'Universal consensus validates the framework: recommendations apply equally across all professional levels', query: 'What is the academic conclusion?', icon: GraduationCap, bg: '#F0FDF4' },
    ],
    chips: ['ANOVA hypothesis testing', 'F-test interpretation', 'Post-hoc analysis']
  },
  '/framework': {
    title: '4-Tier TQM Framework',
    tag: 'framework',
    icon: Award,
    color: '#F97316',
    summary: 'Sequential, prioritized implementation architecture from empirical findings.',
    actions: [
      { id: 'explain', label: '⚡ Explain the Framework', desc: 'The crown jewel: how FDM, RII, EFA, and ML synthesized into a 4-tier implementation blueprint', query: 'Explain this screen', icon: Sparkles, bg: '#FFF7ED' },
      { id: 'tier1', label: '🏗️ Tier 1: Foundation', desc: 'Leadership Commitment + Process QA/QC — the non-negotiable base without which nothing else works', query: 'Explain Tier 1 Foundation', icon: Award, bg: '#FFF7ED' },
      { id: 'tier2', label: '👷 Tier 2: Labor Solutions', desc: 'How to resolve the skilled labor shortage through 3-day certification, buddy mentoring, and wage incentives', query: 'How does Tier 2 resolve labor shortage?', icon: Users, bg: '#EFF6FF' },
      { id: 'roadmap', label: '🗺️ Implementation Roadmap', desc: 'Month-by-month guide for contractors: Month 1-3 Policy, Month 4-6 Training, Month 7-12 Measurement', query: 'Implementation roadmap for contractors', icon: TrendingUp, bg: '#F0FDF4' },
    ],
    chips: ['Tier 3 and 4 details', 'Practical steps for builders', 'How to start implementing']
  },
  '/ml': {
    title: 'Predictive Machine Learning',
    tag: 'ml',
    icon: BrainCircuit,
    color: '#7C3AED',
    summary: 'Model benchmarking: XGBoost 86.7%, Logistic Regression 99.2%, K-Means 3 clusters.',
    actions: [
      { id: 'explain', label: '⚡ Explain ML Models', desc: 'How machine learning predicts construction quality success from survey data — all models compared', query: 'Explain this screen', icon: Sparkles, bg: '#FFF7ED' },
      { id: 'xgboost', label: '🤖 XGBoost 86.7% Accuracy', desc: 'Gradient boosted trees handle non-linear factor interactions that simpler models miss', query: 'Why does XGBoost achieve 86.7%?', icon: BrainCircuit, bg: '#F5F3FF' },
      { id: 'clusters', label: '📊 3 K-Means Clusters', desc: 'High Maturity, Medium Maturity, Low Maturity — which organizations fall where and why', query: 'What are the 3 K-Means clusters?', icon: Layers, bg: '#EFF6FF' },
      { id: 'maturity', label: '📈 TQM Maturity Levels', desc: 'How to classify any construction firm into maturity tiers based on their survey scores', query: 'How is TQM maturity classified?', icon: TrendingUp, bg: '#F0FDF4' },
    ],
    chips: ['Cross-validation scores', 'Compare XGBoost vs Random Forest', 'ROC AUC explained']
  },
  '/xai': {
    title: 'Explainable AI (SHAP)',
    tag: 'xai',
    icon: Sparkles,
    color: '#059669',
    summary: 'SHAP feature attribution: CSF1 = +0.42 (top driver), BAR2 = -0.38 (top drag).',
    actions: [
      { id: 'explain', label: '⚡ Explain SHAP Analysis', desc: 'Game-theoretic feature attribution that opens the AI black box to show exactly why each prediction is made', query: 'Explain this screen', icon: Sparkles, bg: '#FFF7ED' },
      { id: 'what', label: '🔍 What is SHAP?', desc: 'SHapley Additive exPlanations — based on Nobel Prize-winning cooperative game theory by Lloyd Shapley', query: 'What is SHAP and why is it used?', icon: HelpCircle, bg: '#F0FDF4' },
      { id: 'csf1shap', label: '🏆 CSF1 Highest SHAP Value', desc: 'Top Management Commitment has SHAP value +0.42 — strongest positive driver of quality success', query: 'Why does CSF1 have highest SHAP value?', icon: Award, bg: '#EFF6FF' },
      { id: 'simulator', label: '🎮 Interactive Simulator', desc: 'Adjust factor scores with sliders and watch the AI recalculate quality predictions in real-time', query: 'How to use the interactive simulator?', icon: Settings, bg: '#F5F3FF' },
    ],
    chips: ['BAR2 negative SHAP impact', 'Feature importance ranking', 'SHAP waterfall interpretation']
  },
  '/recommendations': {
    title: 'Recommendations & Action Plans',
    tag: 'recommendations',
    icon: Lightbulb,
    color: '#D97706',
    summary: 'Evidence-based 12-month transformation roadmap for Coimbatore construction.',
    actions: [
      { id: 'explain', label: '⚡ Explain Action Plans', desc: 'Complete 12-month phased roadmap translating statistical insights into real construction improvements', query: 'Explain this screen', icon: Sparkles, bg: '#FFF7ED' },
      { id: 'phase1', label: '🚨 Phase 1 Priorities', desc: 'Months 1-3: Ring-fence 1.5-2% QA budget, appoint quality officers, establish stop-pour authority', query: 'What are the Phase 1 immediate priorities?', icon: Zap, bg: '#FEF2F2' },
      { id: 'labor', label: '👷 Fix Labor Shortage', desc: 'Concrete solutions: 3-day mason certification, buddy mentoring system, skill-linked wage incentives', query: 'How to mitigate the labor shortage barrier?', icon: Users, bg: '#EFF6FF' },
      { id: 'kpis', label: '📊 KPIs to Track', desc: 'Defect rate per 100m², rework cost %, first-time quality pass rate, safety incident frequency', query: 'What KPIs should project managers track?', icon: BarChart2, bg: '#F0FDF4' },
    ],
    chips: ['Phase 2 and 3 details', 'Quality improvement metrics', 'Best practices for contractors']
  },
  '/chatbot': {
    title: 'AI Research Assistant',
    tag: 'chatbot',
    icon: MessageSquare,
    color: '#F97316',
    summary: 'Interactive AI copilot trained on the complete dissertation knowledge base.',
    actions: [
      { id: 'explain', label: '⚡ Explain This Feature', desc: 'How the offline AI engine works: TF-IDF, fuzzy matching, synonym expansion, 90+ intent knowledge base', query: 'Explain this screen', icon: Sparkles, bg: '#FFF7ED' },
      { id: 'overview', label: '📖 Full Project Overview', desc: 'Complete summary of the research: title, objectives, methodology, sample, findings, and conclusions', query: 'What is this project about?', icon: BookOpen, bg: '#EFF6FF' },
      { id: 'methodology', label: '🔬 Research Methodology', desc: '6-phase pipeline: Literature Review → FDM → Survey → Statistical Analysis → Framework → ML/SHAP', query: 'Explain the research methodology', icon: Layers, bg: '#F0FDF4' },
      { id: 'conclusion', label: '🎯 Key Conclusions', desc: 'What the research ultimately proved and its implications for construction industry practice', query: 'What are the main findings and conclusions?', icon: Award, bg: '#FFF7ED' },
    ],
    chips: ['Research gap', 'Research contributions', 'Future scope', 'Research limitations']
  },
  '/viva': {
    title: 'Viva Voce Defense Practice',
    tag: 'viva',
    icon: GraduationCap,
    color: '#DC2626',
    summary: 'Interactive exam simulation with AI scoring rubrics.',
    actions: [
      { id: 'explain', label: '⚡ Explain Viva Simulator', desc: 'Practice your PhD/Masters defense with AI examiner questions and instant rubric-based scoring', query: 'Explain this screen', icon: Sparkles, bg: '#FFF7ED' },
      { id: 'questions', label: '❓ Top 5 Viva Questions', desc: 'Most likely questions an external examiner will ask about FDM, sample size, and methodology choices', query: 'Top 5 Viva Voce questions', icon: HelpCircle, bg: '#FEF2F2' },
      { id: 'fdm', label: '🛡️ Defend FDM Choice', desc: 'How to justify using Fuzzy Delphi over classical Delphi — linguistic uncertainty, consensus threshold', query: 'How to defend FDM over classical Delphi?', icon: ShieldCheck, bg: '#EFF6FF' },
      { id: 'sample', label: '📐 Justify N=120', desc: 'Multiple adequacy criteria: Hair (5:1 rule), Kaiser criterion, Comrey & Lee (N=120 = "good")', query: 'How to justify sample size N=120?', icon: Calculator, bg: '#F0FDF4' },
    ],
    chips: ['Defense tips', 'Common examiner follow-ups', 'How to handle tough questions']
  },
  '/reports': {
    title: 'Reports & Data Export',
    tag: 'reports',
    icon: FileText,
    color: '#2563EB',
    summary: 'Executive summaries and 1-click CSV download of all 120 survey responses.',
    actions: [
      { id: 'explain', label: '⚡ Explain Reports Page', desc: 'What data is available for download and how the executive summary is automatically compiled', query: 'Explain this screen', icon: Sparkles, bg: '#FFF7ED' },
      { id: 'download', label: '📥 Download CSV Data', desc: 'One-click export of all 120 respondent records with 16 factor scores in clean spreadsheet format', query: 'How do I download the survey data?', icon: FileText, bg: '#EFF6FF' },
      { id: 'csv', label: '📋 CSV Contents', desc: 'Columns: respondent ID, role, experience, organization, and Likert scores for all 16 factors', query: 'What is included in the CSV export?', icon: FileSpreadsheet, bg: '#F0FDF4' },
      { id: 'summary', label: '📊 Executive Highlights', desc: 'Auto-generated summary: sample metrics, reliability, suitability, factor rankings, ML performance', query: 'Executive summary highlights', icon: BarChart2, bg: '#FFF7ED' },
    ],
    chips: ['Data format details', 'Report generation', 'Export options']
  },
  '/auth': {
    title: 'Account & Roles',
    tag: 'auth',
    icon: User,
    color: '#7C3AED',
    summary: '6 pre-configured roles with JWT authentication (password: secret).',
    actions: [
      { id: 'explain', label: '⚡ Explain Account System', desc: '6 research roles (Admin, Researcher, Respondent, Scholar, Expert, Viewer) with instant 1-click login', query: 'Explain this screen', icon: Sparkles, bg: '#FFF7ED' },
    ],
    chips: ['Available roles', 'How to login', 'JWT authentication']
  },
  '/admin': {
    title: 'System Settings',
    tag: 'admin',
    icon: Settings,
    color: '#64748B',
    summary: 'Database mode, cache management, and system telemetry.',
    actions: [
      { id: 'explain', label: '⚡ Explain Settings', desc: 'Manage dual-mode storage, inspect system health, clear caches, and view database connection status', query: 'Explain this screen', icon: Sparkles, bg: '#FFF7ED' },
    ],
    chips: ['Database modes', 'System health', 'Cache management']
  },
}

// Aliases
SCREEN_CONTEXTS['/literature'] = { ...SCREEN_CONTEXTS['/factors'], title: 'Literature Review' }
SCREEN_CONTEXTS['/rii'] = { ...SCREEN_CONTEXTS['/statistics'], title: 'Relative Importance Index' }
SCREEN_CONTEXTS['/models'] = { ...SCREEN_CONTEXTS['/ml'], title: 'Model Benchmarking' }

// CheckCircle imported from lucide-react above

export default function AIAssistantDrawer() {
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState([
    {
      role: 'ai',
      text: "👋 **Hello! I am your TQM Research Copilot.**\n\nI am connected to the full dissertation knowledge base with **90+ trained intents** covering every methodology, formula, finding, and recommendation.\n\n**Click any button below** to explore this screen, get research insights, or prepare for your viva defense!",
      sources: ['Dissertation Knowledge Base (90 Intents)'],
      chips: []
    }
  ])
  const [loading, setLoading] = useState(false)
  const [copiedIdx, setCopiedIdx] = useState(null)
  const [mode, setMode] = useState('simple')
  const { pathname } = useLocation()
  const chatBottomRef = useRef(null)

  const activeContext = SCREEN_CONTEXTS[pathname] || SCREEN_CONTEXTS['/']
  const ScreenIcon = activeContext.icon || Target

  // Listen for custom trigger events
  useEffect(() => {
    const handleExplainScreen = (e) => {
      setIsOpen(true)
      const query = e.detail?.prompt || (mode === 'simple' ? `Explain ${activeContext.title} in simple terms` : 'Explain this screen')
      handleSend(query)
    }
    const handleToggleDrawer = () => setIsOpen(o => !o)

    window.addEventListener('tqm:explain-screen', handleExplainScreen)
    window.addEventListener('tqm:toggle-ai-drawer', handleToggleDrawer)
    return () => {
      window.removeEventListener('tqm:explain-screen', handleExplainScreen)
      window.removeEventListener('tqm:toggle-ai-drawer', handleToggleDrawer)
    }
  }, [pathname, mode, activeContext.title])

  // Scroll to bottom
  useEffect(() => {
    if (isOpen) {
      chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' })
    }
  }, [messages, isOpen, loading])

  const handleSend = async (queryText) => {
    const text = (queryText || '').trim()
    if (!text || loading) return

    const userMsg = { role: 'user', text }
    setMessages(prev => [...prev, userMsg])
    setLoading(true)

    try {
      const res = await chatbotApi.query(text, activeContext.tag, 'default', mode)
      const data = res.data
      const aiMsg = {
        role: 'ai',
        text: data.response,
        intent: data.intent,
        sources: data.sources || [],
        chips: data.suggested_followups || []
      }
      setMessages(prev => [...prev, aiMsg])
    } catch (err) {
      setMessages(prev => [
        ...prev,
        {
          role: 'ai',
          text: "⚠️ **Connection Error:** Unable to reach AI engine. Ensure backend is running at `http://localhost:8000`.",
          sources: [],
          chips: ['Try again']
        }
      ])
    } finally {
      setLoading(false)
    }
  }

  const handleCopy = (text, idx) => {
    navigator.clipboard.writeText(text)
    setCopiedIdx(idx)
    setTimeout(() => setCopiedIdx(null), 2000)
  }

  const handleClear = () => {
    setMessages([
      {
        role: 'ai',
        text: `📍 **Context switched to: ${activeContext.title}**\n\n${activeContext.summary || ''}\n\nClick any action below to explore this screen in depth!`,
        chips: []
      }
    ])
  }

  return (
    <>
      {/* ── Floating Action Trigger ── */}
      {!isOpen && pathname !== '/chatbot' && (
        <button
          onClick={() => setIsOpen(true)}
          className="ai-fab-btn"
          aria-label="Ask AI about this screen"
          title="Open TQM Research AI Copilot"
        >
          <Sparkles size={17} />
          <span className="fab-text-desktop">Ask AI / Explain Screen</span>
          <span className="fab-text-mobile">AI Copilot</span>
        </button>
      )}

      {/* ── Backdrop Overlay ── */}
      <div
        className={`ai-drawer-overlay ${isOpen ? 'open' : ''}`}
        onClick={() => setIsOpen(false)}
      />

      {/* ── Slide-Over Assistant Drawer ── */}
      <aside className={`ai-drawer ${isOpen ? 'open' : ''}`} aria-label="AI Assistant Drawer">
        {/* Drawer Header */}
        <div style={{
          padding: '14px 18px',
          borderBottom: '1px solid var(--border)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          background: 'var(--bg-page)',
          flexShrink: 0
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{
              width: 34, height: 34, borderRadius: 9,
              background: 'linear-gradient(135deg, #F97316 0%, #EA580C 100%)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: '#FFFFFF', boxShadow: '0 2px 10px rgba(249, 115, 22, 0.35)'
            }}>
              <Sparkles size={17} />
            </div>
            <div>
              <div style={{ fontSize: '0.94rem', fontWeight: 700, color: 'var(--text-primary)', lineHeight: 1.2 }}>
                TQM AI Copilot
              </div>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                90+ Intents · Offline · Zero Hallucination
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            {/* Mode switch */}
            <div style={{ display: 'flex', background: 'var(--bg-main)', border: '1px solid var(--border)', borderRadius: 7, padding: 2 }}>
              <button
                onClick={() => setMode('simple')}
                style={{
                  border: 'none',
                  background: mode === 'simple' ? 'var(--orange)' : 'transparent',
                  color: mode === 'simple' ? '#fff' : 'var(--text-muted)',
                  fontSize: '0.7rem',
                  fontWeight: 600,
                  borderRadius: 5,
                  padding: '3px 8px',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease'
                }}
                title="Simple everyday words — even a kid can understand"
              >
                🧒 Simple
              </button>
              <button
                onClick={() => setMode('research')}
                style={{
                  border: 'none',
                  background: mode === 'research' ? 'var(--orange)' : 'transparent',
                  color: mode === 'research' ? '#fff' : 'var(--text-muted)',
                  fontSize: '0.7rem',
                  fontWeight: 600,
                  borderRadius: 5,
                  padding: '3px 8px',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease'
                }}
                title="Academic language with statistical terms"
              >
                🎓 Academic
              </button>
            </div>

            <button
              onClick={handleClear}
              title="Reset conversation"
              className="btn btn-ghost btn-sm"
              style={{ padding: '6px', color: 'var(--text-muted)' }}
            >
              <RotateCcw size={14} />
            </button>
            <button
              onClick={() => setIsOpen(false)}
              title="Close Assistant"
              className="btn btn-ghost btn-sm"
              style={{ padding: '6px', color: 'var(--text-muted)' }}
            >
              <X size={16} />
            </button>
          </div>
        </div>

        {/* Active Screen Badge Banner */}
        <div style={{
          padding: '10px 16px',
          background: 'var(--orange-light)',
          borderBottom: '1px solid var(--orange-border)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 8,
          flexShrink: 0
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, minWidth: 0 }}>
            <div style={{
              width: 26, height: 26, borderRadius: 6,
              background: activeContext.color || 'var(--orange)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              flexShrink: 0
            }}>
              <ScreenIcon size={13} color="#fff" />
            </div>
            <div style={{ minWidth: 0 }}>
              <div style={{ fontSize: '0.78rem', color: 'var(--orange-dark)', fontWeight: 700, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {activeContext.title}
              </div>
              {activeContext.summary && (
                <div style={{ fontSize: '0.66rem', color: 'var(--text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 280 }}>
                  {activeContext.summary}
                </div>
              )}
            </div>
          </div>

          <button
            onClick={() => handleSend(mode === 'simple' ? `Explain ${activeContext.title} in simple terms` : 'Explain this screen')}
            disabled={loading}
            style={{
              background: 'linear-gradient(135deg, #F97316 0%, #EA580C 100%)',
              border: 'none',
              borderRadius: 7,
              padding: '5px 12px',
              fontSize: '0.72rem',
              fontWeight: 700,
              color: '#fff',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 5,
              flexShrink: 0,
              boxShadow: '0 2px 8px rgba(249,115,22,0.25)',
              transition: 'transform 0.15s ease'
            }}
            title="Quick explain this screen"
          >
            <Sparkles size={12} /> Explain
          </button>
        </div>

        {/* Messages Container */}
        <div style={{
          flex: 1,
          overflowY: 'auto',
          padding: '16px 18px',
          display: 'flex',
          flexDirection: 'column',
          gap: 16
        }}>
          {messages.map((msg, i) => (
            <div key={i} className="ai-msg-appear" style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {/* Message Header */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start',
                gap: 6,
                fontSize: '0.72rem',
                color: 'var(--text-muted)'
              }}>
                {msg.role === 'ai' ? (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                    <Bot size={13} color="var(--orange)" />
                    <span style={{ fontWeight: 600, color: 'var(--text-secondary)' }}>TQM AI</span>
                    {msg.intent && (
                      <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)', background: 'var(--bg-subtle)', padding: '1px 5px', borderRadius: 3 }}>
                        {msg.intent}
                      </span>
                    )}
                  </div>
                ) : (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                    <span style={{ fontWeight: 600, color: 'var(--text-secondary)' }}>You</span>
                    <User size={13} color="var(--text-muted)" />
                  </div>
                )}
              </div>

              {/* Message Body */}
              <div style={{
                alignSelf: msg.role === 'user' ? 'flex-end' : 'flex-start',
                maxWidth: '94%',
                background: msg.role === 'user'
                  ? 'linear-gradient(135deg, #F97316 0%, #EA580C 100%)'
                  : 'var(--bg-page)',
                color: msg.role === 'user' ? '#FFFFFF' : 'var(--text-primary)',
                border: msg.role === 'user' ? 'none' : '1px solid var(--border)',
                borderRadius: msg.role === 'user' ? '14px 14px 2px 14px' : '14px 14px 14px 2px',
                padding: '12px 16px',
                boxShadow: msg.role === 'user' ? '0 2px 8px rgba(249, 115, 22, 0.25)' : 'var(--shadow-sm)'
              }}>
                <div className={msg.role === 'ai' ? 'ai-markdown' : ''} style={msg.role === 'user' ? { fontSize: '0.85rem', lineHeight: 1.55, whiteSpace: 'pre-wrap', wordBreak: 'break-word' } : {}}>
                  {msg.role === 'ai' ? renderMarkdown(msg.text) : msg.text}
                </div>

                {/* Sources & Copy for AI */}
                {msg.role === 'ai' && (
                  <div style={{
                    marginTop: 10,
                    paddingTop: 8,
                    borderTop: '1px solid var(--border)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    flexWrap: 'wrap',
                    gap: 6
                  }}>
                    {msg.sources && msg.sources.length > 0 ? (
                      <div style={{ display: 'flex', alignItems: 'center', gap: 4, flexWrap: 'wrap' }}>
                        <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>Source:</span>
                        {msg.sources.map((s, idx) => (
                          <span key={idx} className="badge badge-neutral" style={{ fontSize: '0.66rem', padding: '1px 6px' }}>
                            {s}
                          </span>
                        ))}
                      </div>
                    ) : <div />}

                    <button
                      onClick={() => handleCopy(msg.text, i)}
                      style={{
                        background: 'transparent',
                        border: 'none',
                        color: copiedIdx === i ? 'var(--success)' : 'var(--text-muted)',
                        cursor: 'pointer',
                        fontSize: '0.72rem',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 3,
                        padding: '2px 4px',
                        borderRadius: 4
                      }}
                      title="Copy response"
                    >
                      {copiedIdx === i ? <Check size={12} /> : <Copy size={12} />}
                      <span>{copiedIdx === i ? 'Copied' : 'Copy'}</span>
                    </button>
                  </div>
                )}
              </div>

              {/* Follow-up Chips */}
              {msg.role === 'ai' && msg.chips && msg.chips.length > 0 && (
                <div style={{
                  display: 'flex',
                  flexWrap: 'wrap',
                  gap: 6,
                  marginTop: 2,
                  paddingLeft: 4
                }}>
                  {msg.chips.map((chip, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleSend(chip)}
                      disabled={loading}
                      style={{
                        background: 'var(--bg-card)',
                        border: '1px solid var(--border)',
                        borderRadius: 9999,
                        padding: '4px 10px',
                        fontSize: '0.73rem',
                        color: 'var(--text-secondary)',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 4,
                        transition: 'all 0.15s ease'
                      }}
                      onMouseEnter={e => {
                        e.currentTarget.style.borderColor = 'var(--orange)'
                        e.currentTarget.style.color = 'var(--orange-dark)'
                        e.currentTarget.style.background = 'var(--orange-light)'
                      }}
                      onMouseLeave={e => {
                        e.currentTarget.style.borderColor = 'var(--border)'
                        e.currentTarget.style.color = 'var(--text-secondary)'
                        e.currentTarget.style.background = 'var(--bg-card)'
                      }}
                    >
                      <span>{chip}</span>
                      <ChevronRight size={11} color="var(--orange)" />
                    </button>
                  ))}
                </div>
              )}
            </div>
          ))}

          {/* Typing State */}
          {loading && (
            <div className="ai-msg-appear" style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 14px', background: 'var(--bg-page)', borderRadius: 12, width: 'fit-content', border: '1px solid var(--border)' }}>
              <div className="typing-dot" />
              <div className="typing-dot" />
              <div className="typing-dot" />
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginLeft: 4 }}>
                Synthesizing research response...
              </span>
            </div>
          )}

          <div ref={chatBottomRef} />
        </div>

        {/* ── Action Console (100% Click-Based) ── */}
        <div style={{
          padding: '12px 14px',
          borderTop: '1px solid var(--border)',
          background: 'var(--bg-page)',
          flexShrink: 0,
          display: 'flex',
          flexDirection: 'column',
          gap: 10,
          maxHeight: '50vh',
          overflowY: 'auto'
        }}>
          {/* Section Label */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              <Zap size={12} color="var(--orange)" />
              <span>Quick Actions — Click to Ask</span>
            </div>
            <span style={{ fontSize: '0.66rem', color: 'var(--text-muted)' }}>
              {mode === 'simple' ? '🧒 Simple' : '🎓 Academic'}
            </span>
          </div>

          {/* Rich Action Cards (2-column grid) */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 8 }}>
            {(activeContext.actions || []).map((action) => {
              const ActionIcon = action.icon || Sparkles
              return (
                <button
                  key={action.id}
                  onClick={() => handleSend(action.query)}
                  disabled={loading}
                  className="ai-action-card"
                >
                  <div className="ai-action-icon" style={{ background: action.bg || 'var(--orange-light)' }}>
                    <ActionIcon size={15} color={activeContext.color || 'var(--orange)'} />
                  </div>
                  <div className="ai-action-text">
                    <div className="ai-action-title">{action.label}</div>
                    <div className="ai-action-desc">{action.desc}</div>
                  </div>
                </button>
              )
            })}
          </div>

          {/* Page-Specific Quick Chips */}
          {activeContext.chips && activeContext.chips.length > 0 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              <div style={{ fontSize: '0.66rem', color: 'var(--text-muted)', fontWeight: 600 }}>
                More questions for this page:
              </div>
              <div style={{ display: 'flex', gap: 6, overflowX: 'auto', paddingBottom: 2 }}>
                {activeContext.chips.map((chip, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSend(chip)}
                    disabled={loading}
                    style={{
                      background: 'var(--bg-card)',
                      border: '1px solid var(--border)',
                      borderRadius: 9999,
                      padding: '4px 10px',
                      fontSize: '0.71rem',
                      color: 'var(--text-secondary)',
                      cursor: 'pointer',
                      whiteSpace: 'nowrap',
                      flexShrink: 0,
                      display: 'flex',
                      alignItems: 'center',
                      gap: 4,
                      transition: 'all 0.15s ease'
                    }}
                    onMouseEnter={e => {
                      e.currentTarget.style.borderColor = 'var(--orange)'
                      e.currentTarget.style.background = 'var(--orange-light)'
                    }}
                    onMouseLeave={e => {
                      e.currentTarget.style.borderColor = 'var(--border)'
                      e.currentTarget.style.background = 'var(--bg-card)'
                    }}
                  >
                    <span>{chip}</span>
                    <ChevronRight size={10} color="var(--orange)" />
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </aside>
    </>
  )
}
