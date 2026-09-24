"""
Statistical Analysis API Router.
Hosts all academic statistical research modules:
- Descriptive Statistics
- Relative Importance Index (RII)
- Cronbach's Alpha Reliability
- KMO & Bartlett's Test of Sphericity
- Exploratory Factor Analysis (EFA)
- One-Way ANOVA Group Comparisons
- 4-Tier Prioritized TQM Framework
"""
from __future__ import annotations
from typing import List, Optional, Dict, Any
from fastapi import APIRouter, Query

from app.database.repository import Repository
from app.research.descriptive_engine import DescriptiveEngine
from app.research.rii_engine import RIIEngine
from app.research.reliability import ReliabilityEngine
from app.research.kmo_bartlett import KMOBartlettEngine
from app.research.efa import EFAEngine
from app.research.anova import ANOVAEngine
from app.research.framework_engine import FrameworkEngine
from app.schemas.statistics import (
    DescriptiveStatItem, RIIItem, ReliabilityResult,
    KMOBartlettResult, EFAResult, ANOVAGroupResult
)

router = APIRouter(prefix="/api/statistics", tags=["Statistical Research Engines"])

@router.get("/descriptive", response_model=List[DescriptiveStatItem])
async def get_descriptive_stats():
    """Descriptive statistics (Mean, SD, Variance, Skewness, Kurtosis)."""
    responses = await Repository.get_responses()
    factors = await Repository.get_factors()
    return DescriptiveEngine.calculate_descriptives(responses, factors)

@router.get("/rii", response_model=List[RIIItem])
async def get_rii_rankings():
    """Relative Importance Index (RII) ranking across CSFs and Barriers."""
    responses = await Repository.get_responses()
    factors = await Repository.get_factors()
    return RIIEngine.calculate_rii(responses, factors)

@router.get("/reliability", response_model=ReliabilityResult)
async def get_reliability():
    """Cronbach's Alpha reliability and item-total correlations."""
    responses = await Repository.get_responses()
    factors = await Repository.get_factors()
    return ReliabilityEngine.calculate_cronbach_alpha(responses, factors)

@router.get("/kmo", response_model=KMOBartlettResult)
async def get_kmo_bartlett():
    """KMO Measure of Sampling Adequacy and Bartlett's Test of Sphericity."""
    responses = await Repository.get_responses()
    return KMOBartlettEngine.calculate_suitability(responses)

@router.get("/efa", response_model=EFAResult)
async def get_efa(
    n_factors: int = Query(4, ge=2, le=8, description="Number of factors to extract"),
    rotation: str = Query("varimax", description="Rotation method: varimax or promax")
):
    """Exploratory Factor Analysis with eigenvalues and rotated loadings matrix."""
    responses = await Repository.get_responses()
    factors = await Repository.get_factors()
    return EFAEngine.calculate_efa(responses, factors, n_factors=n_factors, rotation=rotation)

@router.get("/anova", response_model=List[ANOVAGroupResult])
async def get_anova(
    group_by: str = Query("experience", description="experience, role, project_type, organization_type")
):
    """One-Way ANOVA hypothesis testing across demographic groups."""
    responses = await Repository.get_responses()
    factors = await Repository.get_factors()
    return ANOVAEngine.calculate_anova(responses, factors, group_by=group_by)

@router.get("/framework")
async def get_framework():
    """Synthesized 4-Tier Prioritized TQM Implementation Framework."""
    responses = await Repository.get_responses()
    factors = await Repository.get_factors()
    rii_results = RIIEngine.calculate_rii(responses, factors)
    efa_results = EFAEngine.calculate_efa(responses, factors, n_factors=4)
    return FrameworkEngine.generate_framework(rii_results, efa_results)
