from __future__ import annotations
from typing import Optional, List, Dict, Any
from pydantic import BaseModel, Field
from datetime import datetime

class QuestionItem(BaseModel):
    id: str
    factor_code: str
    factor_name: str
    category: str
    text: str
    scale: List[str] = ["1 - Strongly Disagree", "2 - Disagree", "3 - Neutral", "4 - Agree", "5 - Strongly Agree"]

class RespondentProfile(BaseModel):
    name: Optional[str] = "Anonymous"
    role: str = Field(..., description="Project Manager, Site Engineer, QA/QC Engineer, Consultant, Contractor")
    experience: str = Field(..., description="<5 Years, 5-10 Years, 10-20 Years, >20 Years")
    organization_type: str = Field(..., description="General Contractor, PMC, Developer, Subcontractor")
    project_type: str = Field(..., description="Residential, Commercial, Infrastructure, Industrial")
    location: str = "Coimbatore / Tamil Nadu"

class SurveySubmission(BaseModel):
    respondent: RespondentProfile
    ratings: Dict[str, int] = Field(..., description="Dict mapping factor_code or question_id to Likert rating 1-5")

class SurveyResponseOut(BaseModel):
    id: str
    respondent: RespondentProfile
    ratings: Dict[str, int]
    submitted_at: datetime
