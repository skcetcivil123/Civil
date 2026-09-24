"""
World-Class Offline AI Chatbot Engine for TQM Research Assistant.
Combines:
1. Instant sub-millisecond Direct Entity & Concept Hash Lookup (300+ entries)
2. Synonym Expansion Layer (50+ synonym groups for wider vocabulary coverage)
3. Fast In-Memory TF-IDF Vectorization & Cosine Similarity (n-gram 1-3)
4. Fuzzy Matching via edit distance for misspelled queries
5. Substring & Semantic Token Overlap Fallback
6. Dual-Mode Responses: "simple" (kid-friendly) vs "research" (academic)
Completely offline, deterministic, zero hallucination, sub-10ms response time.
"""
from __future__ import annotations
import json
import os
import re
from typing import Dict, Any, List, Optional
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity

KB_PATH = os.path.join(os.path.dirname(__file__), "knowledge_base.json")

# ── Synonym Expansion Map ─────────────────────────────────────────────────────
# Automatically expands user queries for broader vocabulary coverage
SYNONYM_MAP: Dict[str, List[str]] = {
    "tqm": ["total quality management", "quality management"],
    "total quality management": ["tqm"],
    "quality": ["tqm", "quality management"],
    "construction": ["building", "infrastructure", "civil engineering"],
    "building": ["construction"],
    "workers": ["labor", "workforce", "employees", "staff"],
    "labor": ["workers", "workforce", "manpower"],
    "boss": ["management", "leadership", "top management"],
    "management": ["leadership", "administration"],
    "leadership": ["management", "top management"],
    "training": ["skill development", "education", "learning", "capacity building"],
    "education": ["training", "learning"],
    "customer": ["client", "stakeholder", "end user"],
    "client": ["customer", "stakeholder"],
    "problem": ["barrier", "obstacle", "challenge", "issue"],
    "barrier": ["obstacle", "problem", "challenge", "hindrance"],
    "obstacle": ["barrier", "problem"],
    "important": ["critical", "crucial", "significant", "key"],
    "critical": ["important", "crucial", "key"],
    "predict": ["forecast", "estimate", "model"],
    "model": ["algorithm", "classifier"],
    "accuracy": ["performance", "precision", "score"],
    "survey": ["questionnaire", "quiz", "assessment"],
    "questionnaire": ["survey", "instrument", "assessment"],
    "respondent": ["participant", "professional", "person"],
    "participant": ["respondent"],
    "expert": ["specialist", "professional", "panel member"],
    "result": ["finding", "outcome", "conclusion"],
    "finding": ["result", "discovery", "outcome"],
    "conclusion": ["finding", "result", "takeaway", "summary"],
    "factor": ["variable", "element", "dimension"],
    "variable": ["factor", "feature"],
    "test": ["analysis", "assessment", "evaluation"],
    "analysis": ["test", "examination", "assessment"],
    "formula": ["equation", "calculation", "method"],
    "score": ["value", "rating", "number"],
    "value": ["score", "number", "measure"],
    "good": ["high", "strong", "adequate", "acceptable"],
    "bad": ["low", "poor", "weak", "inadequate"],
    "reliable": ["trustworthy", "consistent", "dependable"],
    "valid": ["accurate", "correct", "legitimate"],
    "project": ["study", "research", "dissertation", "thesis"],
    "study": ["research", "project", "investigation"],
    "research": ["study", "project", "investigation", "dissertation"],
    "explain": ["describe", "tell me about", "what is"],
    "describe": ["explain", "tell me about"],
    "improve": ["enhance", "upgrade", "optimize", "boost"],
    "recommend": ["suggest", "advise", "propose"],
    "software": ["tool", "program", "application", "technology"],
    "tool": ["software", "instrument"],
    "data": ["information", "responses", "numbers"],
    "statistics": ["stats", "statistical analysis", "numbers"],
    "stats": ["statistics"],
    "ai": ["artificial intelligence", "machine learning", "ml"],
    "ml": ["machine learning", "ai"],
    "machine learning": ["ml", "ai", "predictive modeling"],
}

# ── Fast direct pattern mapping for instant sub-millisecond resolution ────────
# 300+ entries covering every conceivable phrasing
DIRECT_LOOKUP: Dict[str, str] = {
    # ── Factors ──
    "csf1": "csf1_detail", "csf 1": "csf1_detail", "top management": "csf1_detail",
    "management commitment": "csf1_detail", "leadership commitment": "csf1_detail",
    "boss support": "csf1_detail", "management support": "csf1_detail",

    "csf2": "csf2_detail", "csf 2": "csf2_detail", "kaizen": "csf2_detail",
    "continuous improvement": "csf2_detail", "always improving": "csf2_detail",
    "never stop improving": "csf2_detail",

    "csf3": "csf3_detail", "csf 3": "csf3_detail", "training": "csf3_detail",
    "skill development": "csf3_detail", "worker training": "csf3_detail",
    "education and training": "csf3_detail", "capacity building": "csf3_detail",

    "csf4": "csf4_detail", "csf 4": "csf4_detail", "customer focus": "csf4_detail",
    "client satisfaction": "csf4_detail", "customer satisfaction": "csf4_detail",
    "stakeholder satisfaction": "csf4_detail",

    "csf5": "csf5_detail", "csf 5": "csf5_detail", "process standardization": "csf5_detail",
    "qa/qc": "csf5_detail", "qa qc": "csf5_detail", "sop": "csf5_detail",
    "standard operating procedure": "csf5_detail", "quality assurance": "csf5_detail",
    "quality control": "csf5_detail",

    "csf6": "csf6_detail", "csf 6": "csf6_detail", "supplier quality": "csf6_detail",
    "subcontractor quality": "csf6_detail", "vendor quality": "csf6_detail",
    "material quality": "csf6_detail",

    "csf7": "csf7_detail", "csf 7": "csf7_detail", "employee involvement": "csf7_detail",
    "teamwork": "csf7_detail", "worker involvement": "csf7_detail",
    "team participation": "csf7_detail",

    "csf8": "csf8_detail", "csf 8": "csf8_detail", "quality culture": "csf8_detail",
    "culture of quality": "csf8_detail", "organizational culture": "csf8_detail",

    # ── Barriers ──
    "bar1": "bar1_detail", "bar 1": "bar1_detail", "lack of top management": "bar1_detail",
    "no management support": "bar1_detail", "absent leadership": "bar1_detail",

    "bar2": "bar2_detail", "bar 2": "bar2_detail", "skilled labor": "bar2_detail",
    "labor shortage": "bar2_detail", "migrant labor": "bar2_detail",
    "workforce shortage": "bar2_detail", "lack of skilled workers": "bar2_detail",
    "worker shortage": "bar2_detail", "unskilled labor": "bar2_detail",

    "bar3": "bar3_detail", "bar 3": "bar3_detail", "cost of quality": "bar3_detail",
    "financial constraints": "bar3_detail", "quality cost": "bar3_detail",
    "budget constraints": "bar3_detail", "cost barrier": "bar3_detail",

    "bar4": "bar4_detail", "bar 4": "bar4_detail", "time pressure": "bar4_detail",
    "schedule constraints": "bar4_detail", "deadline pressure": "bar4_detail",
    "rushing": "bar4_detail", "tight deadlines": "bar4_detail",

    "bar5": "bar5_detail", "bar 5": "bar5_detail", "subcontractor fragmentation": "bar5_detail",
    "fragmentation": "bar5_detail", "too many subcontractors": "bar5_detail",

    "bar6": "bar6_detail", "bar 6": "bar6_detail", "cultural resistance": "bar6_detail",
    "resistance to change": "bar6_detail", "change resistance": "bar6_detail",
    "people resist change": "bar6_detail",

    "bar7": "bar7_detail", "bar 7": "bar7_detail", "inadequate quality metrics": "bar7_detail",
    "metrics and audits": "bar7_detail", "no quality measurement": "bar7_detail",
    "lack of metrics": "bar7_detail",

    "bar8": "bar8_detail", "bar 8": "bar8_detail", "poor communication": "bar8_detail",
    "bad communication": "bar8_detail", "communication gap": "bar8_detail",
    "miscommunication": "bar8_detail",

    # ── Lists ──
    "csfs": "all_csfs_list", "csf list": "all_csfs_list", "critical success factors": "all_csfs_list",
    "success factors": "all_csfs_list", "list csfs": "all_csfs_list", "all csfs": "all_csfs_list",
    "what are csfs": "all_csfs_list", "8 csfs": "all_csfs_list",

    "barriers": "all_barriers_list", "barrier list": "all_barriers_list",
    "list barriers": "all_barriers_list", "all barriers": "all_barriers_list",
    "what are barriers": "all_barriers_list", "8 barriers": "all_barriers_list",
    "obstacle list": "all_barriers_list",

    # ── Experts ──
    "expert": "expert_panel", "experts": "expert_panel", "panel": "expert_panel",
    "senthil": "expert_panel", "murugesan": "expert_panel", "ramakrishnan": "expert_panel",
    "balamurugan": "expert_panel", "shanmugam": "expert_panel",
    "credai": "expert_panel", "gct": "expert_panel", "pwd": "expert_panel", "psg": "expert_panel",
    "10 experts": "expert_panel", "expert committee": "expert_panel",
    "validation panel": "expert_panel", "delphi panel": "expert_panel",

    # ── Methodology ──
    "fdm": "fdm_methodology", "fuzzy delphi": "fdm_methodology", "fuzzy delphi method": "fdm_methodology",
    "fuzzy method": "fdm_methodology", "delphi technique": "fdm_methodology",
    "defuzzification": "fdm_formula_and_scale", "threshold": "fdm_formula_and_scale",
    "triangular fuzzy": "fdm_formula_and_scale", "graded mean": "fdm_formula_and_scale",
    "tfn": "fdm_formula_and_scale", "fuzzy number": "fdm_formula_and_scale",
    "likert": "likert_scale_explanation", "likert scale": "likert_scale_explanation",
    "5 point scale": "likert_scale_explanation", "rating scale": "likert_scale_explanation",

    # ── Statistics ──
    "rii": "rii_formula_and_results", "relative importance index": "rii_formula_and_results",
    "importance ranking": "rii_formula_and_results", "factor ranking": "rii_formula_and_results",
    "rii formula": "rii_formula_and_results", "rii values": "rii_formula_and_results",

    "cronbach": "cronbach_alpha_reliability", "reliability": "cronbach_alpha_reliability",
    "alpha": "cronbach_alpha_reliability", "internal consistency": "cronbach_alpha_reliability",
    "0.759": "cronbach_alpha_reliability", "cronbach alpha": "cronbach_alpha_reliability",

    "kmo": "kmo_and_bartlett", "bartlett": "kmo_and_bartlett", "sphericity": "kmo_and_bartlett",
    "sampling adequacy": "kmo_and_bartlett", "0.835": "kmo_and_bartlett",
    "kaiser meyer olkin": "kmo_and_bartlett",

    "efa": "efa_structure_and_dimensions", "factor analysis": "efa_structure_and_dimensions",
    "exploratory factor": "efa_structure_and_dimensions", "latent dimensions": "efa_structure_and_dimensions",
    "4 dimensions": "efa_structure_and_dimensions", "4 factors": "efa_structure_and_dimensions",
    "factor loading": "factor_loading_explanation", "loading": "factor_loading_explanation",

    "varimax": "varimax_rotation_justification", "orthogonal rotation": "varimax_rotation_justification",
    "rotation": "varimax_rotation_justification",

    "eigenvalue": "eigenvalue_explanation", "eigen value": "eigenvalue_explanation",
    "scree plot": "eigenvalue_explanation", "kaiser criterion": "eigenvalue_explanation",

    "variance explained": "variance_explained", "59.9": "variance_explained",
    "cumulative variance": "variance_explained", "total variance": "variance_explained",

    "p value": "p_value_explanation", "p-value": "p_value_explanation",
    "significance level": "p_value_explanation", "statistical significance": "p_value_explanation",

    "anova": "anova_group_comparisons", "hypothesis": "anova_group_comparisons",
    "group comparison": "anova_group_comparisons", "f test": "anova_group_comparisons",

    "normal distribution": "normal_distribution", "normality": "normal_distribution",
    "bell curve": "normal_distribution", "skewness": "normal_distribution",
    "kurtosis": "normal_distribution",

    # ── Framework & AI ──
    "framework": "tqm_4_tier_framework", "4-tier": "tqm_4_tier_framework",
    "4 tier": "tqm_4_tier_framework", "four tier": "tqm_4_tier_framework",
    "roadmap": "tqm_4_tier_framework", "implementation plan": "tqm_4_tier_framework",
    "implementation framework": "tqm_4_tier_framework",

    "ml": "machine_learning_models", "machine learning": "machine_learning_models",
    "clustering": "kmeans_clustering", "k-means": "kmeans_clustering", "kmeans": "kmeans_clustering",
    "cluster analysis": "kmeans_clustering",
    "xgboost": "xgboost_superiority", "xgb": "xgboost_superiority",
    "gradient boosting": "xgboost_superiority", "boosted trees": "xgboost_superiority",
    "random forest": "machine_learning_models",
    "logistic regression": "machine_learning_models",

    "shap": "shap_and_explainable_ai", "xai": "shap_and_explainable_ai",
    "explainable ai": "shap_and_explainable_ai", "shapley": "shap_and_explainable_ai",
    "feature importance": "shap_and_explainable_ai", "model explanation": "shap_and_explainable_ai",

    "cross validation": "cross_validation_explained", "k-fold": "cross_validation_explained",
    "cv score": "cross_validation_explained",
    "roc auc": "roc_auc_explained", "auc": "roc_auc_explained",
    "area under curve": "roc_auc_explained", "0.893": "roc_auc_explained",
    "precision recall": "precision_recall_f1", "f1 score": "precision_recall_f1",
    "confusion matrix": "precision_recall_f1",

    "recommendation": "recommendations_action_plans", "recommendations": "recommendations_action_plans",
    "action plan": "recommendations_action_plans", "suggestions": "recommendations_action_plans",
    "what should be done": "recommendations_action_plans",

    "viva": "viva_voce_defense_advice", "defense": "viva_voce_defense_advice",
    "examiner": "viva_voce_defense_advice", "oral exam": "viva_voce_defense_advice",

    # ── Demographics & Scope ──
    "sample": "sample_size_and_demographics", "sample size": "sample_size_and_demographics",
    "120": "sample_size_and_demographics", "respondents": "sample_size_and_demographics",
    "demographics": "sample_size_and_demographics", "participants": "sample_size_and_demographics",
    "how many people": "sample_size_and_demographics", "who answered": "sample_size_and_demographics",
    "response rate": "response_rate", "how many responded": "response_rate",

    "coimbatore": "geographical_scope", "location": "geographical_scope", "scope": "geographical_scope",
    "tamil nadu": "geographical_scope", "where was this done": "geographical_scope",

    "sampling method": "sampling_method", "how were respondents selected": "sampling_method",
    "purposive sampling": "sampling_method",

    "pilot": "pilot_testing", "pilot test": "pilot_testing", "pretesting": "pilot_testing",

    "ethics": "ethical_considerations", "consent": "ethical_considerations",
    "privacy": "ethical_considerations", "confidentiality": "ethical_considerations",

    "research gap": "research_gap", "gap in literature": "research_gap",
    "what gap": "research_gap", "novelty": "research_gap",

    "contribution": "research_contributions", "contributions": "research_contributions",
    "significance": "research_contributions", "why important": "research_contributions",

    "limitation": "research_limitations", "limitations": "research_limitations",
    "weakness": "research_limitations", "drawback": "research_limitations",

    "conclusion": "research_conclusion", "findings": "research_conclusion",
    "main findings": "research_conclusion", "key findings": "research_conclusion",
    "summarize": "research_conclusion", "summary": "research_conclusion",

    "future scope": "future_scope", "future research": "future_scope",
    "what next": "future_scope", "future directions": "future_scope",

    "software": "software_tools_used", "spss": "software_tools_used",
    "tools used": "software_tools_used", "technology": "software_tools_used",
    "python": "software_tools_used",

    "data collection": "data_collection_method", "how was data collected": "data_collection_method",
    "survey distribution": "data_collection_method",

    "csv": "data_export_and_csv", "export": "data_export_and_csv", "download": "data_export_and_csv",
    "database": "dual_mode_database", "mongodb": "dual_mode_database", "persistence": "dual_mode_database",

    "deming": "deming_quality_philosophy", "pdca": "deming_quality_philosophy",
    "plan do check act": "deming_quality_philosophy", "juran": "deming_quality_philosophy",
    "crosby": "deming_quality_philosophy", "quality gurus": "deming_quality_philosophy",

    "who are you": "who_are_you", "what are you": "who_are_you",
    "what can you do": "who_are_you", "introduce yourself": "who_are_you",

    "hello": "greeting", "hi": "greeting", "hey": "greeting",
    "good morning": "greeting", "namaste": "greeting",

    "thank": "thank_you", "thanks": "thank_you", "appreciate": "thank_you",

    "how to use": "how_to_use_this_system", "navigation": "how_to_use_this_system",
    "user guide": "how_to_use_this_system", "help": "how_to_use_this_system",

    "csf vs barrier": "comparison_csf_barriers", "csfs vs barriers": "comparison_csf_barriers",
    "compare csf": "comparison_csf_barriers", "heroes vs villains": "comparison_csf_barriers",

    # Screen Explanations
    "screen dashboard": "screen_dashboard", "screen factors": "screen_factors",
    "screen literature": "screen_factors", "screen experts": "screen_experts",
    "screen fdm": "screen_fdm", "screen questionnaire": "screen_questionnaire",
    "screen survey": "screen_survey", "screen statistics": "screen_statistics",
    "screen rii": "screen_statistics", "screen reliability": "screen_reliability",
    "screen kmo": "screen_kmo", "screen efa": "screen_efa",
    "screen anova": "screen_anova", "screen framework": "screen_framework",
    "screen ml": "screen_ml", "screen xai": "screen_xai",
    "screen shap": "screen_xai", "screen recommendations": "screen_recommendations",
    "screen reports": "screen_reports", "screen viva": "screen_viva",
}


def _levenshtein_distance(s1: str, s2: str) -> int:
    """Compute Levenshtein edit distance between two strings."""
    if len(s1) < len(s2):
        return _levenshtein_distance(s2, s1)
    if len(s2) == 0:
        return len(s1)
    prev_row = list(range(len(s2) + 1))
    for i, c1 in enumerate(s1):
        curr_row = [i + 1]
        for j, c2 in enumerate(s2):
            insertions = prev_row[j + 1] + 1
            deletions = curr_row[j] + 1
            substitutions = prev_row[j] + (c1 != c2)
            curr_row.append(min(insertions, deletions, substitutions))
        prev_row = curr_row
    return prev_row[-1]


class FastChatbotEngine:
    def __init__(self):
        self.intents: List[Dict[str, Any]] = []
        self.tag_to_intent: Dict[str, Dict[str, Any]] = {}
        self.patterns: List[str] = []
        self.pattern_to_intent: List[int] = []
        self.vectorizer: Optional[TfidfVectorizer] = None
        self.tfidf_matrix = None
        self.last_mtime: float = 0.0
        self._load_kb()

    def _load_kb(self):
        if not os.path.exists(KB_PATH):
            return
        self.last_mtime = os.path.getmtime(KB_PATH)
        with open(KB_PATH, "r", encoding="utf-8") as f:
            data = json.load(f)
            self.intents = data.get("intents", [])

        self.tag_to_intent = {}
        patterns = []
        pattern_intent_map = []
        for idx, intent in enumerate(self.intents):
            tag = intent.get("tag")
            self.tag_to_intent[tag] = intent
            for p in intent.get("patterns", []):
                patterns.append(p.lower())
                pattern_intent_map.append(idx)

        self.patterns = patterns
        self.pattern_to_intent = pattern_intent_map

        if patterns:
            self.vectorizer = TfidfVectorizer(
                stop_words="english",
                ngram_range=(1, 3),
                lowercase=True,
                sublinear_tf=True
            )
            self.tfidf_matrix = self.vectorizer.fit_transform(patterns)

    def _expand_synonyms(self, query: str) -> str:
        """Expand query with synonyms for broader matching."""
        words = query.lower().split()
        expanded = list(words)
        for word in words:
            if word in SYNONYM_MAP:
                for syn in SYNONYM_MAP[word]:
                    syn_words = syn.split()
                    for sw in syn_words:
                        if sw not in expanded:
                            expanded.append(sw)
        # Also check 2-word phrases
        for i in range(len(words) - 1):
            phrase = f"{words[i]} {words[i+1]}"
            if phrase in SYNONYM_MAP:
                for syn in SYNONYM_MAP[phrase]:
                    syn_words = syn.split()
                    for sw in syn_words:
                        if sw not in expanded:
                            expanded.append(sw)
        return " ".join(expanded)

    def _fuzzy_lookup(self, query: str) -> Optional[str]:
        """Find closest DIRECT_LOOKUP key using Levenshtein distance."""
        if len(query) < 3:
            return None
        best_key = None
        best_dist = float('inf')
        max_dist = max(2, len(query) // 4)  # Allow up to 25% edit distance

        for key in DIRECT_LOOKUP:
            if abs(len(key) - len(query)) > max_dist:
                continue
            dist = _levenshtein_distance(query, key)
            if dist < best_dist and dist <= max_dist:
                best_dist = dist
                best_key = key
        return best_key

    def _get_response(self, intent: Dict[str, Any], mode: str = "research") -> str:
        """Get the appropriate response based on mode."""
        if mode == "simple" and "simple_response" in intent:
            return intent["simple_response"]
        return intent.get("response", "")

    def answer_query(self, query: str, screen: Optional[str] = None, mode: Optional[str] = "research") -> Dict[str, Any]:
        if os.path.exists(KB_PATH) and os.path.getmtime(KB_PATH) > getattr(self, 'last_mtime', 0):
            self._load_kb()

        q_raw = query.strip()
        q_clean = q_raw.lower()
        mode = mode or "research"

        # Helper to resolve screen intent tag
        def get_screen_intent(s_name: str):
            s_key = s_name.lower().strip("/").replace("-", "_")
            alias = {"literature": "factors", "rii": "statistics", "models": "ml", "shap": "xai", "": "dashboard"}
            s_norm = alias.get(s_key, s_key)
            tag = f"screen_{s_norm}"
            return self.tag_to_intent.get(tag)

        if not q_clean:
            if screen:
                target = get_screen_intent(screen)
                if target:
                    return {
                        "response": self._get_response(target, mode),
                        "intent": target["tag"],
                        "confidence": 1.0,
                        "sources": target.get("sources", []),
                        "suggested_followups": target.get("followups", [])
                    }
            return {
                "response": "Please enter any research question about TQM implementation, FDM, RII, EFA, ML models, or Coimbatore findings.",
                "intent": "empty",
                "confidence": 0.0,
                "sources": [],
                "suggested_followups": ["What is this project about?", "What is the sample size?"]
            }

        # ── Contextual Screen Explanation Check ───────────────────────────────
        explain_keywords = [
            "explain this screen", "explain screen", "what is on this screen",
            "what does this screen show", "explain this page", "explain page",
            "explain current screen", "screen overview", "help with this screen",
            "what is on this page", "explain what is on this screen"
        ]
        is_screen_query = any(k in q_clean for k in explain_keywords) or (q_clean in ["explain", "summary", "overview", "what is this", "tell me about this"])
        if is_screen_query and screen:
            target = get_screen_intent(screen)
            if target:
                return {
                    "response": self._get_response(target, mode),
                    "intent": target["tag"],
                    "confidence": 1.0,
                    "sources": target.get("sources", []),
                    "suggested_followups": target.get("followups", [])
                }

        # ── Step 1: Instant Direct Pattern Lookup (Sub-Millisecond) ────────────
        for key, target_tag in DIRECT_LOOKUP.items():
            pattern = r'\b' + re.escape(key) + r'\b'
            if re.search(pattern, q_clean):
                target_intent = self.tag_to_intent.get(target_tag)
                if target_intent:
                    return {
                        "response": self._get_response(target_intent, mode),
                        "intent": target_intent["tag"],
                        "confidence": 0.99,
                        "sources": target_intent.get("sources", []),
                        "suggested_followups": target_intent.get("followups", [])
                    }

        # ── Step 2: TF-IDF Cosine Similarity with Synonym Expansion ──────────
        if self.vectorizer and self.tfidf_matrix is not None:
            # Try original query first
            q_vec = self.vectorizer.transform([q_clean])
            sims = cosine_similarity(q_vec, self.tfidf_matrix)[0]
            best_idx = int(sims.argmax())
            best_score = float(sims[best_idx])

            # If score is low, try synonym-expanded query
            if best_score < 0.20:
                expanded = self._expand_synonyms(q_clean)
                if expanded != q_clean:
                    q_vec_exp = self.vectorizer.transform([expanded])
                    sims_exp = cosine_similarity(q_vec_exp, self.tfidf_matrix)[0]
                    exp_idx = int(sims_exp.argmax())
                    exp_score = float(sims_exp[exp_idx])
                    if exp_score > best_score:
                        best_score = exp_score
                        best_idx = exp_idx

            if best_score >= 0.08:  # Lower threshold for broader coverage
                matched_intent = self.intents[self.pattern_to_intent[best_idx]]
                return {
                    "response": self._get_response(matched_intent, mode),
                    "intent": matched_intent["tag"],
                    "confidence": round(best_score, 3),
                    "sources": matched_intent.get("sources", []),
                    "suggested_followups": matched_intent.get("followups", [])
                }

        # ── Step 3: Fuzzy Lookup for Misspelled Queries ───────────────────────
        fuzzy_key = self._fuzzy_lookup(q_clean)
        if fuzzy_key:
            target_tag = DIRECT_LOOKUP.get(fuzzy_key)
            target_intent = self.tag_to_intent.get(target_tag) if target_tag else None
            if target_intent:
                return {
                    "response": self._get_response(target_intent, mode),
                    "intent": target_intent["tag"],
                    "confidence": 0.80,
                    "sources": target_intent.get("sources", []),
                    "suggested_followups": target_intent.get("followups", [])
                }

        # ── Step 4: Token Intersect Fallback with Weighted Scoring ────────────
        stop_words = {"what", "is", "the", "tell", "me", "about", "are", "in", "and", "of", "to", "for", "how", "a", "an", "this", "that", "do", "does", "can", "you", "i", "my", "we", "it", "be", "was", "were", "been", "with", "on", "at", "by", "from", "or", "but", "not", "so", "if", "they", "their", "which", "when", "where", "who", "why"}
        query_words = set(re.findall(r'\w+', q_clean)) - stop_words
        best_overlap_intent = None
        max_overlap = 0

        for intent in self.intents:
            intent_text = (intent.get("tag", "") + " " + " ".join(intent.get("patterns", [])) + " " + intent.get("response", "")).lower()
            intent_words = set(re.findall(r'\w+', intent_text))
            overlap = len(query_words & intent_words)
            # Bonus for tag word matches (more specific)
            tag_words = set(re.findall(r'\w+', intent.get("tag", "").lower()))
            tag_overlap = len(query_words & tag_words)
            weighted_overlap = overlap + tag_overlap * 2

            if weighted_overlap > max_overlap:
                max_overlap = weighted_overlap
                best_overlap_intent = intent

        if best_overlap_intent and max_overlap >= 2:
            return {
                "response": self._get_response(best_overlap_intent, mode),
                "intent": best_overlap_intent["tag"],
                "confidence": 0.70,
                "sources": best_overlap_intent.get("sources", []),
                "suggested_followups": best_overlap_intent.get("followups", [])
            }

        # ── Step 5: Graceful Guidance ─────────────────────────────────────────
        guidance_response = (
            "I am the TQM Research Assistant trained on this dissertation. "
            "You can ask me about:\n"
            "• Any Factor: CSF1 to CSF8 (e.g. Top Management, Training, Process QA/QC)\n"
            "• Any Barrier: BAR1 to BAR8 (e.g. Skilled Labor Shortage, Time Pressure)\n"
            "• The 10 Coimbatore Experts (L&T, CREDAI, GCT, PWD, etc.)\n"
            "• FDM Methodology, Triangular Fuzzy Numbers, and Defuzzification\n"
            "• The N=120 Survey Sample and Demographic distributions\n"
            "• Formulas: RII, Cronbach's Alpha, KMO, Bartlett's Chi-Square, ANOVA\n"
            "• EFA 4 Latent Dimensions and Varimax Rotation\n"
            "• Machine Learning (XGBoost, Random Forest, K-Means clustering)\n"
            "• SHAP Explainability & Feature Importance\n"
            "• 4-Tier Implementation Framework & Practical Recommendations\n"
            "• Viva Voce Defense questions and model answers"
        )
        if mode == "simple":
            guidance_response = (
                "🤔 Hmm, I'm not sure about that! But I know A LOT about this project! Try asking:\n\n"
                "🏗️ 'What is this project about?'\n"
                "⭐ 'What is CSF1?'\n"
                "⚠️ 'What is BAR2?'\n"
                "👥 'Who are the experts?'\n"
                "📊 'What is the sample size?'\n"
                "🤖 'How does the AI work?'\n\n"
                "I can explain EVERYTHING in simple words! Just ask! 🌟"
            )

        return {
            "response": guidance_response,
            "intent": "general_guidance",
            "confidence": 0.50,
            "sources": ["Dissertation Overview", "Research Pipeline"],
            "suggested_followups": [
                "Who are the experts?",
                "What is CSF1?",
                "What is BAR2?",
                "What is the sample size?",
                "Explain the 4-Tier Framework",
                "Why is XGBoost the best model?"
            ]
        }

_chatbot_engine = FastChatbotEngine()

def get_chatbot_engine() -> FastChatbotEngine:
    return _chatbot_engine
