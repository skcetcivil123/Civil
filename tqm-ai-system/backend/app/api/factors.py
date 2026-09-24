"""
Factors API Router — CRUD and categorization for TQM Critical Success Factors and Barriers.
"""
from __future__ import annotations
from typing import List, Optional
from fastapi import APIRouter, HTTPException, Query, status

from app.database.repository import Repository
from app.schemas.factor import FactorCreate, FactorUpdate, FactorOut

router = APIRouter(prefix="/api/factors", tags=["Factors & Literature"])

@router.get("", response_model=List[FactorOut])
async def get_factors(
    category: Optional[str] = Query(None, description="Filter by 'CSF' or 'Barrier'")
):
    """Retrieve all TQM factors or filter by category."""
    items = await Repository.get_factors(category=category)
    return items

@router.get("/{code}", response_model=FactorOut)
async def get_factor(code: str):
    """Retrieve a single factor by its unique code (e.g. CSF1, BAR1)."""
    factor = await Repository.get_factor_by_code(code)
    if not factor:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Factor with code '{code}' not found."
        )
    return factor

@router.post("", response_model=FactorOut, status_code=status.HTTP_201_CREATED)
async def create_factor(payload: FactorCreate):
    """Add a new factor to the literature repository."""
    existing = await Repository.get_factor_by_code(payload.code)
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Factor with code '{payload.code}' already exists."
        )
    data = payload.model_dump()
    created = await Repository.create_factor(data)
    return created

@router.put("/{code}", response_model=FactorOut)
async def update_factor(code: str, payload: FactorUpdate):
    """Update factor details or change status (e.g. fdm_accepted)."""
    existing = await Repository.get_factor_by_code(code)
    if not existing:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Factor with code '{code}' not found."
        )
    data = payload.model_dump(exclude_unset=True)
    updated = await Repository.update_factor(code, data)
    return updated
