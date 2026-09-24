"""
Machine Learning API Router — Clustering, Supervised Comparison & Defect Prediction.
"""
from __future__ import annotations
from typing import List, Dict, Any
from fastapi import APIRouter, Query

from app.database.repository import Repository
from app.ml.ml_engine import MLEngine
from app.ml.xai_engine import XAIEngine
from app.schemas.ml import ModelMetrics, ClusterProfile, PredictionRequest, PredictionResponse

router = APIRouter(prefix="/api/ml", tags=["Machine Learning"])

@router.get("/clusters", response_model=List[ClusterProfile])
async def get_clusters(
    n_clusters: int = Query(3, ge=2, le=5, description="Number of clusters (default 3)")
):
    """Unsupervised K-Means clustering discovering TQM maturity archetypes."""
    responses = await Repository.get_responses()
    return MLEngine.run_clustering(responses, n_clusters=n_clusters)

@router.get("/models", response_model=List[ModelMetrics])
async def get_model_comparison():
    """Comparison of Logistic Regression, Random Forest, and XGBoost classifiers."""
    responses = await Repository.get_responses()
    comparison, _, _ = MLEngine.train_predictive_models(responses)
    return comparison

@router.post("/predict", response_model=PredictionResponse)
async def predict_project_outcome(payload: PredictionRequest):
    """Predict project quality outcome and defect risk from Likert ratings."""
    responses = await Repository.get_responses()
    factors = await Repository.get_factors()
    return XAIEngine.predict_project_assessment(
        ratings=payload.ratings,
        factors=factors,
        responses=responses
    )
