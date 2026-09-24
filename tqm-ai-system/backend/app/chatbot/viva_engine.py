"""
Viva Voce Defense Simulator Engine.
Provides comprehensive examiner question banks, model answers, and interactive evaluation
to prepare researchers for academic dissertation defense.
"""
from __future__ import annotations
from typing import List, Dict, Any

VIVA_QUESTIONS = [
    {
        "id": "viva_01",
        "category": "Methodological Justification",
        "question": "Why did you choose the Fuzzy Delphi Method (FDM) instead of the classical Delphi technique?",
        "difficulty": "Medium",
        "examiner_intent": "Tests whether candidate understands the mathematical resolution of linguistic vagueness and execution efficiency.",
        "model_answer": (
            "Classical Delphi suffers from three major weaknesses in construction research: 1) High attrition of busy construction executives "
            "across multiple repetitive questionnaire rounds; 2) Arbitrary statistical consensus rules that ignore linguistic ambiguity; and "
            "3) High cost and time overhead. In contrast, FDM models expert subjective judgment as Triangular Fuzzy Numbers (TFN: a1, a2, a3), "
            "capturing the full cognitive boundary of human language in a single efficient round. Using Graded Mean defuzzification with a validated "
            "threshold (S >= 0.70), FDM mathematically screens factors with rigorous geometric consensus without exhausting industry respondents."
        ),
        "key_points": [
            "Linguistic fuzziness & cognitive ambiguity of expert terms (High, Very High)",
            "Reduction of multiple rounds to a single round, eliminating panel attrition",
            "Triangular Fuzzy Number (TFN) mathematics and graded mean defuzzification",
            "Objective screening threshold (S >= 0.70) rather than subjective consensus"
        ]
    },
    {
        "id": "viva_02",
        "category": "Statistical Formulation",
        "question": "Why use the Relative Importance Index (RII) instead of simple Mean ranking for 5-point Likert survey data?",
        "difficulty": "High",
        "examiner_intent": "Examines candidate's grasp of ordinal measurement scale theory and non-parametric ranking validity.",
        "model_answer": (
            "Likert scale responses are strictly ordinal data, meaning intervals between 'Neutral' and 'Agree' are not guaranteed to be "
            "equal intervals. Simple arithmetic means implicitly assume continuous interval data and are vulnerable to skewness and outlier distortion. "
            "The Relative Importance Index (RII = sum(W) / (A * N)) normalizes ordinal item frequencies against the theoretical maximum possible "
            "weight (A=5, N=120), producing a bounded metric [0, 1] widely validated in construction management literature (Kometa et al., 1994; "
            "Tam & Le, 2006) for robust priority ranking across heterogeneous respondent groups."
        ),
        "key_points": [
            "Ordinal nature of Likert survey scales",
            "Normalization against maximum scale weight (A * N)",
            "Robustness against frequency skewness",
            "Direct alignment with international construction management research standards"
        ]
    },
    {
        "id": "viva_03",
        "category": "Sampling Adequacy & Rigor",
        "question": "Is a sample size of N=120 adequate for Exploratory Factor Analysis (EFA) with 16 variables?",
        "difficulty": "High",
        "examiner_intent": "Assesses knowledge of psychometric sample size guidelines (Hair et al., Kline, Tabachnick & Fidell).",
        "model_answer": (
            "Yes, N=120 meets and exceeds established empirical criteria for EFA in construction management. According to Hair et al. (2010), "
            "a minimum observation-to-variable ratio of 5:1 is required, with 10:1 being optimal. For our 16 factors, 120 respondents yields "
            "a 7.5:1 ratio. Furthermore, the Kaiser-Meyer-Olkin (KMO) Measure of Sampling Adequacy is 0.824 ('Meritorious'), well above the 0.60 "
            "minimum cutoff, and Bartlett's Test of Sphericity is highly significant (Chi-Square = 742.18, p < 0.001), confirming our correlation "
            "matrix is statistically sound for factor extraction."
        ),
        "key_points": [
            "Observation-to-variable ratio: 120/16 = 7.5:1 (exceeds Hair et al.'s 5:1 baseline)",
            "KMO test statistic of 0.824 confirms sampling adequacy",
            "Bartlett's Test of Sphericity (p < 0.001) confirms presence of non-zero correlations",
            "Target population of Coimbatore construction professionals adequately represented"
        ]
    },
    {
        "id": "viva_04",
        "category": "Factor Extraction & Rotation",
        "question": "Why did you use Varimax orthogonal rotation instead of an Oblique rotation (e.g. Promax) in EFA?",
        "difficulty": "Medium",
        "examiner_intent": "Checks understanding of factor independence and interpretability of management dimensions.",
        "model_answer": (
            "Varimax orthogonal rotation was chosen to maximize the variance of the squared loadings within each factor, driving loadings "
            "toward 1 or 0. This yields a mathematically distinct 'simple structure' that groups variables into distinct operational dimensions "
            "(Strategic Leadership, Process Standardization, Human Resources, Supply Chain) without inter-factor correlation complications. "
            "For construction management decision-support, orthogonal dimensions provide clear, non-overlapping pillars for contractual "
            "and organizational governance."
        ),
        "key_points": [
            "Maximized variance of squared loadings for clear simple structure",
            "Clear delineation into distinct management pillars",
            "Avoids multi-collinearity when factor scores are subsequently used in ML or decision matrices"
        ]
    },
    {
        "id": "viva_05",
        "category": "Regional Generalizability",
        "question": "Can your findings from Coimbatore / Tamil Nadu be generalized to all construction projects across India?",
        "difficulty": "Medium",
        "examiner_intent": "Tests candidate's critical appraisal of research scope, regional constraints, and external validity.",
        "model_answer": (
            "While core CSFs like Top Management Commitment and Process QA/QC are universally applicable across Tier-1 and Tier-2 Indian cities, "
            "certain barrier dynamics reflect Coimbatore's specific industrial ecosystem. Coimbatore is characterized by rapid private commercial "
            "and residential growth with heavy reliance on migrant labor from northern and eastern states, accentuating the skilled labor shortage "
            "(BAR2) and subcontractor fragmentation (BAR5). Therefore, the 4-Tier framework is directly deployable across emerging Tier-2 Indian hubs "
            "(e.g., Kochi, Pune, Mysore), but site-specific adaptations may be required for mega-infrastructure contracts in metro regions."
        ),
        "key_points": [
            "Universal validity of core CSFs (Leadership, Process Standardization)",
            "Specific local dynamics of Coimbatore (migrant trade labor turnover, Tier-2 subcontracting)",
            "High transferability to comparable Tier-2 construction corridors",
            "Prudent boundary specification in dissertation conclusions"
        ]
    }
]

class VivaEngine:
    @staticmethod
    def get_questions() -> List[Dict[str, Any]]:
        return VIVA_QUESTIONS

    @staticmethod
    def evaluate_answer(question_id: str, user_answer: str) -> Dict[str, Any]:
        target = None
        for q in VIVA_QUESTIONS:
            if q["id"] == question_id:
                target = q
                break

        if not target:
            return {
                "score": 5,
                "feedback": "Question not found.",
                "strengths": [],
                "areas_for_improvement": [],
                "recommended_reading": []
            }

        text = user_answer.lower()
        matched_points = []
        missing_points = []

        for kp in target["key_points"]:
            # Check for key terms in keypoint
            kp_words = [w.lower() for w in kp.split() if len(w) > 4]
            matches = sum(1 for w in kp_words if w in text)
            if matches >= 1:
                matched_points.append(kp)
            else:
                missing_points.append(kp)

        # Score based on matches and depth
        base_score = 4
        if len(text.split()) > 30:
            base_score += 2
        base_score += len(matched_points)
        score = min(10, max(1, base_score))

        feedback = (
            f"Examiner Evaluation: You scored {score}/10. "
            + ("Excellent defense that addresses the core methodological premise." if score >= 8
               else "Acceptable defense, but you need to emphasize specific statistical equations and literature citations.")
        )

        return {
            "score": score,
            "feedback": feedback,
            "strengths": matched_points if matched_points else ["Demonstrates general familiarity with the research methodology"],
            "areas_for_improvement": missing_points if missing_points else ["Solid answer! Ready for defense."],
            "recommended_reading": [
                f"Reference: {target['category']} — Dissertation Section 3.2",
                "Hair et al. (2010) Multivariate Data Analysis",
                "Kuo & Chen (2008) Fuzzy Delphi Method Applications"
            ]
        }
