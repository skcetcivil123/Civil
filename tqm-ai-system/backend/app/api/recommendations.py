"""
Recommendations API Router.
"""
from __future__ import annotations
from typing import List, Dict, Any
from fastapi import APIRouter

from app.database.repository import Repository
from app.research.rii_engine import RIIEngine
from app.research.anova import ANOVAEngine
from app.recommendations.engine import RecommendationsEngine

router = APIRouter(prefix="/api/recommendations", tags=["Recommendations"])

@router.get("", response_model=List[Dict[str, Any]])
async def get_recommendations():
    """Tailored recommendations and implementation action items."""
    responses = await Repository.get_responses()
    factors = await Repository.get_factors()
    rii_results = RIIEngine.calculate_rii(responses, factors)
    anova_results = ANOVAEngine.calculate_anova(responses, factors, group_by="experience")
    return RecommendationsEngine.generate_recommendations(rii_results, anova_results)
