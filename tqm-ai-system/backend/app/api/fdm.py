"""
FDM API Router — Expert Panel Management and Fuzzy Delphi Calculations.
"""
from __future__ import annotations
from typing import List, Optional
from fastapi import APIRouter, HTTPException, Query, status

from app.database.repository import Repository
from app.schemas.fdm import ExpertCreate, ExpertOut, FDMParameterConfig, FDMCalculationSummary
from app.research.fdm_engine import FDMEngine

router = APIRouter(prefix="/api/fdm", tags=["Fuzzy Delphi Method"])

@router.get("/experts", response_model=List[ExpertOut])
async def get_experts():
    """List all expert panel members participating in FDM."""
    experts = await Repository.get_experts()
    return experts

@router.post("/experts", response_model=ExpertOut, status_code=status.HTTP_201_CREATED)
async def create_expert(payload: ExpertCreate):
    """Register a new construction industry expert."""
    data = payload.model_dump()
    created = await Repository.create_expert(data)
    return created

@router.get("/scale")
async def get_linguistic_scale():
    """Retrieve the standard 5-point Triangular Fuzzy Number scale."""
    return FDMEngine.get_linguistic_scale()

@router.post("/calculate", response_model=FDMCalculationSummary)
async def calculate_fdm(config: Optional[FDMParameterConfig] = None):
    """
    Run FDM computation:
    Aggregates expert linguistic ratings into TFNs, defuzzifies values,
    and screens against threshold (default 0.70).
    """
    threshold = config.threshold if config else 0.70
    method = config.defuzzification_method if config else "graded_mean"

    factors = await Repository.get_factors()
    result = FDMEngine.calculate_fdm(
        factors=factors,
        threshold=threshold,
        defuzz_method=method
    )
    return result
