from __future__ import annotations
from typing import Optional, List, Dict
from pydantic import BaseModel, Field
from datetime import datetime

class ExpertBase(BaseModel):
    name: str
    organization: str
    designation: str
    experience_years: int
    expertise_area: str
    location: str = "Coimbatore / Tamil Nadu"
    email: Optional[str] = None

class ExpertCreate(ExpertBase):
    pass

class ExpertOut(ExpertBase):
    id: str
    created_at: Optional[datetime] = None

class LinguisticEvaluation(BaseModel):
    factor_code: str
    linguistic_term: str = Field(..., description="VL, L, M, H, VH")

class ExpertEvaluationSubmission(BaseModel):
    expert_id: str
    evaluations: List[LinguisticEvaluation]

class FDMParameterConfig(BaseModel):
    threshold: float = Field(default=0.70, description="Screening cutoff (default 0.70)")
    defuzzification_method: str = Field(default="graded_mean", description="graded_mean or center_of_gravity")

class FDMResultItem(BaseModel):
    factor_code: str
    factor_name: str
    category: str
    fuzzy_number: List[float] = Field(..., description="Triangular fuzzy number [a1, a2, a3]")
    defuzzified_value: float
    threshold: float
    consensus_reached: bool
    status: str = Field(..., description="'accepted' or 'rejected'")

class FDMCalculationSummary(BaseModel):
    total_factors: int
    accepted_count: int
    rejected_count: int
    threshold: float
    expert_count: int
    results: List[FDMResultItem]
    calculation_timestamp: datetime
