/**
 * High-Performance Client-Side Offline AI Engine for TQM Decision Support System.
 * Operates 100% offline in browser with zero server dependencies.
 * Features:
 * - Deterministic Knowledge Base matching across 2,200+ lines of research data
 * - Dual-mode generation: Academic Research vs Simple / Kid-Friendly
 * - Screen-aware context grounding
 * - Viva Voce examiner evaluation with key-point rubrics
 */
import kbData from './knowledge_base.json' with { type: 'json' }

const kbEntries = Array.isArray(kbData) ? kbData : (kbData.intents || kbData.entries || [])

// Direct entity and concept mapping
const DIRECT_MAPPINGS = {
  csf1: 'csf1_detail', 'csf 1': 'csf1_detail', 'top management': 'csf1_detail', 'management commitment': 'csf1_detail', 'leadership': 'csf1_detail',
  csf2: 'csf2_detail', 'csf 2': 'csf2_detail', 'kaizen': 'csf2_detail', 'continuous improvement': 'csf2_detail',
  csf3: 'csf3_detail', 'csf 3': 'csf3_detail', 'training': 'csf3_detail', 'skill development': 'csf3_detail',
  csf4: 'csf4_detail', 'csf 4': 'csf4_detail', 'customer focus': 'csf4_detail', 'client satisfaction': 'csf4_detail',
  csf5: 'csf5_detail', 'csf 5': 'csf5_detail', 'process standardization': 'csf5_detail', 'qa/qc': 'csf5_detail', 'qa qc': 'csf5_detail',
  csf6: 'csf6_detail', 'csf 6': 'csf6_detail', 'supplier quality': 'csf6_detail', 'subcontractor quality': 'csf6_detail',
  csf7: 'csf7_detail', 'csf 7': 'csf7_detail', 'employee involvement': 'csf7_detail', 'teamwork': 'csf7_detail',
  csf8: 'csf8_detail', 'csf 8': 'csf8_detail', 'quality culture': 'csf8_detail',
  bar1: 'bar1_detail', 'bar 1': 'bar1_detail', 'lack of management': 'bar1_detail',
  bar2: 'bar2_detail', 'bar 2': 'bar2_detail', 'skilled labor': 'bar2_detail', 'labor shortage': 'bar2_detail', 'migrant labor': 'bar2_detail',
  bar3: 'bar3_detail', 'bar 3': 'bar3_detail', 'cost of quality': 'bar3_detail', 'quality cost': 'bar3_detail',
  bar4: 'bar4_detail', 'bar 4': 'bar4_detail', 'time pressure': 'bar4_detail', 'schedule constraints': 'bar4_detail',
  bar5: 'bar5_detail', 'bar 5': 'bar5_detail', 'subcontractor fragmentation': 'bar5_detail', 'fragmentation': 'bar5_detail',
  bar6: 'bar6_detail', 'bar 6': 'bar6_detail', 'resistance to change': 'bar6_detail', 'culture change': 'bar6_detail',
  bar7: 'bar7_detail', 'bar 7': 'bar7_detail', 'metrics': 'bar7_detail', 'quality audits': 'bar7_detail',
  bar8: 'bar8_detail', 'bar 8': 'bar8_detail', 'communication': 'bar8_detail', 'poor communication': 'bar8_detail',
  fdm: 'fdm_methodology', 'fuzzy delphi': 'fdm_methodology', 'triangular fuzzy': 'fdm_methodology',
  rii: 'rii_ranking', 'relative importance index': 'rii_ranking', 'ranking': 'rii_ranking',
  cronbach: 'reliability_cronbach', 'alpha': 'reliability_cronbach', 'reliability': 'reliability_cronbach',
  kmo: 'kmo_suitability', 'bartlett': 'kmo_suitability', 'sampling adequacy': 'kmo_suitability',
  efa: 'efa_factor_analysis', 'factor analysis': 'efa_factor_analysis', 'scree plot': 'efa_factor_analysis',
  anova: 'anova_results', 'f-test': 'anova_results', 'experience difference': 'anova_results',
  framework: 'four_tier_framework', '4-tier': 'four_tier_framework', 'pyramid': 'four_tier_framework',
  ml: 'ml_models', 'xgboost': 'ml_models', 'random forest': 'ml_models', 'accuracy': 'ml_models',
  shap: 'shap_explainability', 'xai': 'shap_explainability', 'feature importance': 'shap_explainability',
  viva: 'viva_voce_defense_advice', 'defense': 'viva_voce_defense_advice', 'exam': 'viva_voce_defense_advice',
  roadmap: 'recommendations_12m', 'recommendations': 'recommendations_12m', 'action plan': 'recommendations_12m',
}

const SCREEN_TAG_MAP = {
  dashboard: 'screen_dashboard',
  factors: 'screen_factors',
  literature: 'screen_factors',
  experts: 'screen_experts',
  fdm: 'screen_fdm',
  questionnaire: 'screen_questionnaire',
  survey: 'screen_survey',
  statistics: 'screen_statistics',
  rii: 'screen_statistics',
  reliability: 'screen_reliability',
  kmo: 'screen_kmo',
  efa: 'screen_efa',
  anova: 'screen_anova',
  framework: 'screen_framework',
  ml: 'screen_ml',
  models: 'screen_ml',
  xai: 'screen_xai',
  recommendations: 'screen_recommendations',
  reports: 'screen_reports',
  viva: 'screen_viva',
  chatbot: 'screen_chatbot',
}

export const VIVA_QUESTIONS = [
  {
    id: "viva_01",
    category: "Methodological Justification",
    question: "Why did you choose the Fuzzy Delphi Method (FDM) instead of the classical Delphi technique?",
    difficulty: "Medium",
    examiner_intent: "Tests whether candidate understands the mathematical resolution of linguistic vagueness and execution efficiency.",
    model_answer: "Classical Delphi suffers from high attrition across multiple rounds and ignores linguistic ambiguity. FDM models expert subjective judgment as Triangular Fuzzy Numbers (TFN: l, m, u), capturing cognitive boundaries in a single efficient round. Using defuzzification with threshold S >= 0.70, FDM screens factors with geometric consensus without exhausting respondents.",
    key_points: [
      "Linguistic fuzziness & cognitive ambiguity of expert terms",
      "Single-round execution eliminating panel attrition",
      "Triangular Fuzzy Number (TFN) mathematics and defuzzification formula S = (l+4m+u)/6",
      "Objective screening threshold (S >= 0.70) backed by Cheng & Lin (2002)"
    ]
  },
  {
    id: "viva_02",
    category: "Statistical Formulation",
    question: "Why use the Relative Importance Index (RII) instead of simple Mean ranking for 5-point Likert survey data?",
    difficulty: "High",
    examiner_intent: "Examines candidate's grasp of ordinal measurement scale theory and non-parametric ranking validity.",
    model_answer: "Likert scales are ordinal data where intervals are not necessarily equal. Arithmetic means assume continuous interval data and are vulnerable to skewness. RII normalizes ordinal frequencies against theoretical maximum scale weight (A=5, N=120), producing a bounded metric [0, 1] validated in construction management literature (Kometa et al. 1994, Tam & Le 2006).",
    key_points: [
      "Ordinal nature of Likert survey scales",
      "Normalization against maximum scale weight (A * N)",
      "Robustness against frequency skewness",
      "Widely validated in construction management literature"
    ]
  },
  {
    id: "viva_03",
    category: "Sampling Adequacy & Rigor",
    question: "Is a sample size of N=120 adequate for Exploratory Factor Analysis (EFA) with 16 variables?",
    difficulty: "High",
    examiner_intent: "Assesses knowledge of psychometric sample size guidelines (Hair et al., Kline).",
    model_answer: "Yes, N=120 exceeds empirical criteria for EFA. Hair et al. (2010) require a minimum 5:1 observation-to-variable ratio; for 16 factors, 120 respondents provides a 7.5:1 ratio. Additionally, KMO is 0.835 ('Meritorious') and Bartlett's Test of Sphericity is highly significant (p < 0.001), confirming correlation suitability.",
    key_points: [
      "Observation-to-variable ratio 120/16 = 7.5:1 (exceeds Hair et al.'s 5:1 rule)",
      "KMO metric of 0.835 confirms meritorious sampling adequacy",
      "Bartlett's Test of Sphericity (p < 0.001) confirms presence of correlation structure",
      "Representative sampling of Coimbatore construction professionals"
    ]
  },
  {
    id: "viva_04",
    category: "Factor Extraction & Rotation",
    question: "Why did you use Varimax orthogonal rotation instead of an Oblique rotation (e.g. Promax) in EFA?",
    difficulty: "Medium",
    examiner_intent: "Checks understanding of factor independence and interpretability of management dimensions.",
    model_answer: "Varimax orthogonal rotation maximizes the variance of squared loadings within each factor, driving loadings toward 1 or 0. This yields a distinct simple structure that groups variables into clear operational dimensions without inter-factor correlation complications, providing clean non-overlapping pillars for construction governance.",
    key_points: [
      "Maximized variance of squared loadings for clear simple structure",
      "Clear separation into distinct management pillars",
      "Avoids multi-collinearity when factor scores are used in ML models"
    ]
  },
  {
    id: "viva_05",
    category: "Regional Generalizability",
    question: "Can your findings from Coimbatore / Tamil Nadu be generalized to all construction projects across India?",
    difficulty: "Medium",
    examiner_intent: "Tests candidate's critical appraisal of research scope, regional constraints, and external validity.",
    model_answer: "While core CSFs like Top Management Commitment and Process QA/QC are universally applicable, barrier dynamics reflect Coimbatore's rapid growth and heavy reliance on migrant labor, accentuating skilled labor shortages and subcontractor fragmentation. The framework is directly transferable to emerging Tier-2 Indian hubs (e.g., Kochi, Pune, Mysore), but site-specific adaptations may be required for metro mega-infrastructure.",
    key_points: [
      "Universal validity of core CSFs (Leadership, Process Standardization)",
      "Specific local dynamics of Coimbatore (migrant labor turnover, Tier-2 subcontracting)",
      "High transferability to comparable Tier-2 construction corridors",
      "Prudent boundary specification in dissertation conclusions"
    ]
  }
]

export class OfflineAiEngine {
  /**
   * Process query completely offline in the browser.
   */
  static async query(message, screen = null, sessionId = 'default', mode = 'research') {
    const raw = (message || '').trim().toLowerCase()
    if (!raw) {
      return {
        response: "Please enter a question or click any research question button to explore!",
        intent: "empty",
        sources: [],
        suggested_followups: ["Explain this screen", "What are the top CSFs?", "How was FDM calculated?"]
      }
    }

    // 1. Direct Pattern Match
    for (const [key, tag] of Object.entries(DIRECT_MAPPINGS)) {
      if (raw.includes(key)) {
        const found = kbEntries.find(item => item.tag === tag)
        if (found) {
          return OfflineAiEngine.formatResult(found, mode)
        }
      }
    }

    // 2. Screen Context Explanation Match (e.g. "explain this screen")
    const isExplainScreen = raw.includes("explain this screen") || raw.includes("explain screen") || raw.includes("what is this page") || raw.includes("tell me about this screen")
    if (isExplainScreen && screen) {
      const screenTag = SCREEN_TAG_MAP[screen.toLowerCase()] || `screen_${screen.toLowerCase()}`
      const foundScreen = kbEntries.find(item => item.tag === screenTag)
      if (foundScreen) {
        return OfflineAiEngine.formatResult(foundScreen, mode)
      }
    }

    // 3. Keyword / Token Scoring against all KB entries
    const words = raw.split(/\s+/).filter(w => w.length > 2)
    let bestItem = null
    let bestScore = -1

    for (const item of kbEntries) {
      let score = 0
      const itemQuestions = (item.questions || []).map(q => q.toLowerCase())
      const itemTag = (item.tag || '').toLowerCase()

      // Question similarity
      for (const q of itemQuestions) {
        if (q === raw) score += 100
        else if (q.includes(raw) || raw.includes(q)) score += 60
        else {
          for (const w of words) {
            if (q.includes(w)) score += 8
          }
        }
      }

      // Tag similarity
      if (itemTag.includes(raw) || raw.includes(itemTag)) score += 40
      for (const w of words) {
        if (itemTag.includes(w)) score += 5
      }

      // Bonus if matches screen
      if (screen && itemTag.includes(screen.toLowerCase())) {
        score += 15
      }

      if (score > bestScore) {
        bestScore = score
        bestItem = item
      }
    }

    if (bestItem && bestScore >= 15) {
      return OfflineAiEngine.formatResult(bestItem, mode)
    }

    // 4. Default Intelligent Fallback
    const fallbackScreen = screen ? SCREEN_TAG_MAP[screen.toLowerCase()] : null
    const screenItem = fallbackScreen ? kbEntries.find(item => item.tag === fallbackScreen) : null

    if (screenItem) {
      return {
        response: (mode === 'simple' && screenItem.simple_response) ? screenItem.simple_response : screenItem.response,
        intent: screenItem.tag,
        sources: screenItem.sources || ["TQM Coimbatore Empirical Research N=120"],
        suggested_followups: [
          "What are the top 5 factors by RII?",
          "How does FDM consensus work?",
          "What is the 4-Tier TQM Framework?"
        ]
      }
    }

    return {
      response: mode === 'simple'
        ? "🤖 **Offline Research Copilot**\n\nI can explain any part of this construction research in simple, everyday language!\n\n• **FDM:** How 10 top experts agreed on what matters\n• **Survey:** Feedback from 120 Coimbatore site engineers\n• **4-Tier Framework:** Step-by-step game plan to build without quality defects\n• **Machine Learning:** 86.7% accurate model predicting project quality success!"
        : "🔬 **TQM AI Research Decision Engine (Offline Mode)**\n\nThis decision-support platform assesses Total Quality Management (TQM) implementation across building and infrastructure projects in Coimbatore, Tamil Nadu.\n\n**Empirical Baseline:**\n• **Sample:** $N=120$ verified construction professionals\n• **Reliability:** Cronbach's $\\alpha = 0.759$ ($>0.70$ threshold)\n• **Adequacy:** $\\text{KMO} = 0.835$ (Meritorious), Bartlett's $p < 0.001$\n• **Latent Dimensions:** 4 EFA factors explaining 59.9% variance\n• **Primary Driver:** Top Management Commitment (CSF1, $\\text{RII} = 0.898$)\n• **Primary Barrier:** Skilled Labor Shortage (BAR2, $\\text{RII} = 0.883$)",
      intent: "general_overview",
      sources: ["Dissertation: TQM in Coimbatore Construction (N=120)"],
      suggested_followups: [
        "Explain CSF1: Top Management Commitment",
        "Explain BAR2: Skilled Labor Shortage",
        "What are the 4 Tiers of TQM?"
      ]
    }
  }

  static formatResult(item, mode) {
    const text = (mode === 'simple' && item.simple_response)
      ? item.simple_response
      : item.response

    return {
      response: text,
      intent: item.tag || 'research_query',
      sources: item.sources || ["TQM Research N=120 Dataset"],
      suggested_followups: item.suggested_followups || [
        "What is the next step?",
        "Explain methodology",
        "View recommendations"
      ]
    }
  }

  static getVivaQuestions() {
    return VIVA_QUESTIONS
  }

  static evaluateViva(questionId, userAnswer) {
    const target = VIVA_QUESTIONS.find(q => q.id === questionId) || VIVA_QUESTIONS[0]
    const text = (userAnswer || '').toLowerCase()
    const matched = []
    const missing = []

    for (const kp of target.key_points) {
      const words = kp.toLowerCase().split(/\s+/).filter(w => w.length > 4)
      const isMatch = words.some(w => text.includes(w))
      if (isMatch) matched.push(kp)
      else missing.push(kp)
    }

    let score = 4
    if (text.split(/\s+/).length > 25) score += 2
    score += matched.length * 1.5
    score = Math.min(10, Math.max(2, Math.round(score)))

    const isPass = score >= 7

    return {
      score,
      feedback: `Examiner Evaluation: You scored ${score}/10. ${
        isPass
          ? 'Strong academic defense! You correctly articulated key theoretical constructs and methodology.'
          : 'Acceptable starting point, but your response needs greater focus on exact equations, thresholds, and literature citations.'
      }`,
      strengths: matched.length > 0 ? matched : ["Demonstrated general awareness of civil engineering quality systems"],
      areas_for_improvement: missing.length > 0 ? missing : ["Excellent coverage — ready for viva defense!"],
      recommended_reading: [
        `Chapter 3: ${target.category} — Dissertation Methodology`,
        "Hair et al. (2019) Multivariate Data Analysis",
        "Cheng & Lin (2002) Fuzzy Delphi Method Formulation"
      ]
    }
  }
}
