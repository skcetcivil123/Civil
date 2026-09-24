"""
Comprehensive Automated Verification of all Research & AI Engines.
Tests end-to-end consistency from FDM -> Survey -> Stats -> EFA -> ML -> Chatbot.
"""
import asyncio

async def run_all_tests():
    from app.research.fdm_engine import FDMEngine
    from app.database.repository import Repository
    
    # 1. Database & Survey Data
    factors = await Repository.get_factors()
    responses = await Repository.get_responses()
    assert len(factors) == 16, f"Expected 16 factors, got {len(factors)}"
    assert len(responses) >= 120, f"Expected >=120 responses, got {len(responses)}"
    print(f"✓ Repository: {len(responses)} verified survey responses and {len(factors)} factors")

    # 2. FDM Consensus
    fdm_res = FDMEngine.calculate_fdm(factors=factors, threshold=0.70)
    assert fdm_res["accepted_count"] == 16, f"Expected 16 accepted, got {fdm_res['accepted_count']}"
    assert fdm_res["rejected_count"] == 0
    print("✓ FDM Engine: 16 factors validated (S >= 0.70)")

    # 3. Scale Reliability
    from app.research.reliability import ReliabilityEngine
    rel_res = ReliabilityEngine.calculate_cronbach_alpha(responses, factors)
    assert rel_res["cronbach_alpha"] >= 0.70, f"Expected alpha >= 0.70, got {rel_res['cronbach_alpha']}"
    print(f"✓ Scale Reliability: Cronbach's Alpha = {rel_res['cronbach_alpha']} (Passed >= 0.70)")

    # 4. KMO & Bartlett
    from app.research.kmo_bartlett import KMOBartlettEngine
    kmo_res = KMOBartlettEngine.calculate_suitability(responses)
    assert kmo_res["kmo_overall"] >= 0.70, f"Expected KMO >= 0.70, got {kmo_res['kmo_overall']}"
    assert kmo_res["bartlett_p_value"] < 0.05, f"Expected Bartlett p < 0.05, got {kmo_res['bartlett_p_value']}"
    print(f"✓ Data Suitability: KMO = {kmo_res['kmo_overall']}, Bartlett p = {kmo_res['bartlett_p_value']}")

    # 5. EFA
    from app.research.efa import EFAEngine
    efa_res = EFAEngine.calculate_efa(responses, factors, n_factors=4, rotation="varimax")
    assert efa_res["factors_extracted"] == 4
    assert efa_res["total_variance_explained"] >= 50.0
    print(f"✓ EFA: 4 Latent Dimensions, Variance Explained = {efa_res['total_variance_explained']}%")

    # 6. ANOVA
    from app.research.anova import ANOVAEngine
    anova_res = ANOVAEngine.calculate_anova(responses, factors, group_by="experience")
    assert len(anova_res) == 16
    print("✓ ANOVA: Group comparisons across experience completed for 16 factors")

    # 7. ML & XAI
    from app.ml.ml_engine import MLEngine
    from app.ml.xai_engine import XAIEngine
    models_comparison, _, _ = MLEngine.train_predictive_models(responses)
    assert len(models_comparison) >= 3
    best_m = max(models_comparison, key=lambda m: m.get("f1_score", 0))
    shap_res = XAIEngine.calculate_shap_importance(responses, factors)
    assert len(shap_res) == 16
    print(f"✓ ML & XAI: Best model = {best_m['model_name']} (F1 = {best_m['f1_score']}), 16 SHAP importances computed")

    # 8. Chatbot Engine
    from app.chatbot.bot_engine import get_chatbot_engine
    bot = get_chatbot_engine()
    test_queries = [
        ("What is CSF1?", "csf1_detail"),
        ("What is BAR2?", "bar2_detail"),
        ("What is this project about?", "project_overview"),
        ("Who are the experts?", "expert_panel"),
        ("What is the sample size?", "sample_size_and_demographics"),
        ("What is Relative Importance Index?", "rii_formula_and_results"),
        ("What is Cronbach's Alpha?", "cronbach_alpha_reliability"),
        ("Explain the 4-Tier TQM Framework", "tqm_4_tier_framework"),
        ("Why is XGBoost the best model?", "xgboost_superiority"),
    ]
    for q, expected_tag in test_queries:
        res = bot.answer_query(q)
        assert res["intent"] == expected_tag, f"Query '{q}' expected {expected_tag}, got {res['intent']}"
        assert len(res["response"]) > 40, f"Query '{q}' returned too short response"
    print("✓ AI Chatbot: All 9 benchmark questions resolved with structured, readable answers")

if __name__ == "__main__":
    asyncio.run(run_all_tests())
    print("\n🎉 ALL 8 RESEARCH & AI SUBSYSTEMS VERIFIED AND FULLY PASSING!")
