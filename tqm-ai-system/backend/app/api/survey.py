"""
Survey API Router — 5-Point Likert Questionnaire and Response Collection.
"""
from __future__ import annotations
from typing import List, Dict, Any
from fastapi import APIRouter, HTTPException, status
from collections import Counter

from app.database.repository import Repository
from app.schemas.survey import QuestionItem, SurveySubmission, SurveyResponseOut

router = APIRouter(prefix="/api/survey", tags=["Survey & Questionnaire"])

@router.get("/questionnaire", response_model=List[QuestionItem])
async def get_questionnaire():
    """
    Generate survey items from FDM-accepted CSFs and Barriers.
    """
    factors = await Repository.get_factors()
    items = []
    for f in factors:
        code = f.get("code")
        name = f.get("name")
        cat = f.get("category")
        if cat == "CSF":
            text = f"To what extent does '{name}' directly contribute to overall project quality success on your construction sites?"
        else:
            text = f"To what extent is '{name}' a critical impediment/barrier to quality performance in your construction projects?"

        items.append({
            "id": f"q_{code.lower()}",
            "factor_code": code,
            "factor_name": name,
            "category": cat,
            "text": text,
            "scale": [
                "1 - Strongly Disagree",
                "2 - Disagree",
                "3 - Neutral",
                "4 - Agree",
                "5 - Strongly Agree"
            ]
        })
    return items

@router.get("/responses", response_model=List[SurveyResponseOut])
async def get_responses():
    """Retrieve all collected empirical survey responses."""
    responses = await Repository.get_responses()
    return responses

@router.post("/submit", response_model=SurveyResponseOut, status_code=status.HTTP_201_CREATED)
async def submit_response(payload: SurveySubmission):
    """Submit a completed Likert scale survey response."""
    data = payload.model_dump()
    created = await Repository.create_response(data)
    return created

@router.get("/stats/summary")
async def get_survey_summary():
    """Demographic and response breakdown across the sample."""
    responses = await Repository.get_responses()
    total = len(responses)

    roles = [r["respondent"]["role"] for r in responses]
    experiences = [r["respondent"]["experience"] for r in responses]
    org_types = [r["respondent"]["organization_type"] for r in responses]
    project_types = [r["respondent"]["project_type"] for r in responses]

    return {
        "total_responses": total,
        "role_breakdown": dict(Counter(roles)),
        "experience_breakdown": dict(Counter(experiences)),
        "organization_breakdown": dict(Counter(org_types)),
        "project_breakdown": dict(Counter(project_types)),
        "location": "Coimbatore / Tamil Nadu"
    }
