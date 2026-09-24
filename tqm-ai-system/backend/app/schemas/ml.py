from __future__ import annotations
from typing import Optional, List, Dict, Any
from pydantic import BaseModel, Field

class ModelMetrics(BaseModel):
    model_name: str
    accuracy: float
    precision: float
    recall: float
    f1_score: float
    roc_auc: float
    cv_mean: float

class ClusterProfile(BaseModel):
    cluster_id: int
    cluster_label: str
    size: int
    percentage: float
    characteristics: Dict[str, float]
    tqm_maturity_level: str

class SHAPFeatureImportance(BaseModel):
    feature: str
    mean_abs_shap: float
    impact_direction: str = "positive" # or negative

class PredictionRequest(BaseModel):
    ratings: Dict[str, int]
    experience_years: Optional[int] = 10
    organization_type: Optional[str] = "General Contractor"

class PredictionResponse(BaseModel):
    predicted_quality_outcome: str
    probability_high_quality: float
    predicted_cluster: str
    risk_level: str
    top_driving_factors: List[str]
