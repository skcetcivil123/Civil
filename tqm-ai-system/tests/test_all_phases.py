"""
Comprehensive Integration Tests for All Phases (Phases 2 - 25).
Verifies:
- Factor repository & literature endpoints
- FDM expert panel & consensus screening
- Survey questionnaire & responses
- Descriptive statistics, RII, Cronbach's Alpha, KMO/Bartlett, EFA, ANOVA, Framework
- Machine Learning (Clustering, Supervised Models, SHAP)
- Recommendations
- Offline Chatbot & Viva Voce defense
- Reports & CSV Data Export
"""
import pytest
from httpx import AsyncClient, ASGITransport
from app.main import app

def get_test_client():
    return AsyncClient(transport=ASGITransport(app=app), base_url="http://test")

@pytest.mark.asyncio
async def test_factors_endpoints():
    async with get_test_client() as client:
        res = await client.get("/api/factors")
        assert res.status_code == 200
        factors = res.json()
        assert len(factors) >= 16
        codes = [f["code"] for f in factors]
        assert "CSF1" in codes
        assert "BAR1" in codes

        # Test single factor
        res_csf1 = await client.get("/api/factors/CSF1")
        assert res_csf1.status_code == 200
        data = res_csf1.json()
        assert data["code"] == "CSF1"
        assert data["category"] == "CSF"

@pytest.mark.asyncio
async def test_fdm_endpoints():
    async with get_test_client() as client:
        # Experts
        res_exp = await client.get("/api/fdm/experts")
        assert res_exp.status_code == 200
        experts = res_exp.json()
        assert len(experts) >= 10

        # Calculate FDM
        res_calc = await client.post("/api/fdm/calculate", json={"threshold": 0.70})
        assert res_calc.status_code == 200
        fdm_res = res_calc.json()
        assert fdm_res["total_factors"] >= 16
        assert fdm_res["accepted_count"] > 0
        assert "results" in fdm_res

@pytest.mark.asyncio
async def test_survey_endpoints():
    async with get_test_client() as client:
        res_q = await client.get("/api/survey/questionnaire")
        assert res_q.status_code == 200
        q_items = res_q.json()
        assert len(q_items) >= 16

        res_resp = await client.get("/api/survey/responses")
        assert res_resp.status_code == 200
        responses = res_resp.json()
        assert len(responses) >= 120

@pytest.mark.asyncio
async def test_statistics_endpoints():
    async with get_test_client() as client:
        # Descriptive
        res_desc = await client.get("/api/statistics/descriptive")
        assert res_desc.status_code == 200
        desc_items = res_desc.json()
        assert len(desc_items) >= 16

        # RII
        res_rii = await client.get("/api/statistics/rii")
        assert res_rii.status_code == 200
        rii_items = res_rii.json()
        assert len(rii_items) >= 16
        assert rii_items[0]["rank"] == 1
        assert 0.0 < rii_items[0]["rii"] <= 1.0

        # Reliability
        res_rel = await client.get("/api/statistics/reliability")
        assert res_rel.status_code == 200
        rel_data = res_rel.json()
        assert rel_data["cronbach_alpha"] >= 0.70 # Nunnally criteria

        # KMO & Bartlett
        res_kmo = await client.get("/api/statistics/kmo")
        assert res_kmo.status_code == 200
        kmo_data = res_kmo.json()
        assert kmo_data["kmo_overall"] >= 0.70 # Meritorious suitability
        assert kmo_data["bartlett_p_value"] < 0.05

        # EFA
        res_efa = await client.get("/api/statistics/efa?n_factors=4")
        assert res_efa.status_code == 200
        efa_data = res_efa.json()
        assert efa_data["factors_extracted"] == 4
        assert len(efa_data["loadings_matrix"]) >= 16

        # ANOVA
        res_anova = await client.get("/api/statistics/anova?group_by=experience")
        assert res_anova.status_code == 200
        anova_items = res_anova.json()
        assert len(anova_items) >= 16

        # Framework
        res_fw = await client.get("/api/statistics/framework")
        assert res_fw.status_code == 200
        fw_data = res_fw.json()
        assert len(fw_data["tiers"]) == 4

@pytest.mark.asyncio
async def test_ml_and_xai_endpoints():
    async with get_test_client() as client:
        # Clusters
        res_clusters = await client.get("/api/ml/clusters?n_clusters=3")
        assert res_clusters.status_code == 200
        clusters = res_clusters.json()
        assert len(clusters) == 3

        # Supervised Models
        res_models = await client.get("/api/ml/models")
        assert res_models.status_code == 200
        models = res_models.json()
        assert len(models) == 3
        model_names = [m["model_name"] for m in models]
        assert "Logistic Regression" in model_names
        assert "Random Forest" in model_names
        assert "XGBoost" in model_names

        # Prediction
        sample_ratings = {f"CSF{i}": 5 for i in range(1, 9)}
        sample_ratings.update({f"BAR{i}": 2 for i in range(1, 9)})
        res_pred = await client.post("/api/ml/predict", json={"ratings": sample_ratings})
        assert res_pred.status_code == 200
        pred = res_pred.json()
        assert "predicted_quality_outcome" in pred
        assert pred["probability_high_quality"] > 0.5

        # SHAP
        res_shap = await client.get("/api/xai/shap")
        assert res_shap.status_code == 200
        shap_items = res_shap.json()
        assert len(shap_items) >= 16

@pytest.mark.asyncio
async def test_recommendations_and_chatbot():
    async with get_test_client() as client:
        # Recommendations
        res_rec = await client.get("/api/recommendations")
        assert res_rec.status_code == 200
        recs = res_rec.json()
        assert len(recs) >= 3

        # Chatbot Query
        res_chat = await client.post("/api/chatbot/query", json={"message": "What is the sample size of this study?"})
        assert res_chat.status_code == 200
        chat_resp = res_chat.json()
        assert "120" in chat_resp["response"]

        # Viva Questions
        res_viva = await client.get("/api/chatbot/viva/questions")
        assert res_viva.status_code == 200
        viva_q = res_viva.json()
        assert len(viva_q) >= 5

        # Viva Evaluation
        res_eval = await client.post("/api/chatbot/viva/evaluate", json={
            "question_id": viva_q[0]["id"],
            "user_answer": "FDM resolves linguistic vagueness of human experts using triangular fuzzy numbers and single round screening threshold."
        })
        assert res_eval.status_code == 200
        eval_resp = res_eval.json()
        assert 1 <= eval_resp["score"] <= 10

@pytest.mark.asyncio
async def test_reports_and_export():
    async with get_test_client() as client:
        res_sum = await client.get("/api/reports/summary")
        assert res_sum.status_code == 200
        rep = res_sum.json()
        assert rep["sample_size"] == 120

        res_csv = await client.get("/api/reports/export/csv")
        assert res_csv.status_code == 200
        assert "text/csv" in res_csv.headers["content-type"]
        assert "CSF1" in res_csv.text
