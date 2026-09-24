"""
Explainable AI (XAI) Router — SHAP Feature Importance.
"""
from __future__ import annotations
from typing import List, Dict, Any
from fastapi import APIRouter

from app.database.repository import Repository
from app.ml.xai_engine import XAIEngine
from app.schemas.ml import SHAPFeatureImportance, PredictionRequest, PredictionResponse

router = APIRouter(prefix="/api/xai", tags=["Explainable AI (SHAP)"])

@router.get("/shap", response_model=List[Dict[str, Any]])
async def get_shap_importances():
    """Shapley feature importances highlighting top drivers of quality success."""
    responses = await Repository.get_responses()
    factors = await Repository.get_factors()
    return XAIEngine.calculate_shap_importance(responses, factors)

@router.post("/simulate", response_model=PredictionResponse)
async def simulate_scenario(payload: PredictionRequest):
    """Simulate the effect of upgrading or degrading specific quality practices."""
    responses = await Repository.get_responses()
    factors = await Repository.get_factors()
    return XAIEngine.predict_project_assessment(
        ratings=payload.ratings,
        factors=factors,
        responses=responses
    )
