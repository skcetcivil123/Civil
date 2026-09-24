from __future__ import annotations
from typing import Optional, List, Dict, Any
from pydantic import BaseModel, Field

class ChatMessage(BaseModel):
    message: str
    session_id: Optional[str] = "default"
    screen: Optional[str] = None
    mode: Optional[str] = "research"  # "simple" for kid-friendly, "research" for academic

class ChatResponse(BaseModel):
    response: str
    intent: str
    confidence: float
    sources: List[str]
    suggested_followups: List[str]

class VivaQuestion(BaseModel):
    id: str
    category: str
    question: str
    difficulty: str = "Medium"
    examiner_intent: str
    model_answer: str
    key_points: List[str]

class VivaEvaluationRequest(BaseModel):
    question_id: str
    user_answer: str

class VivaEvaluationResponse(BaseModel):
    score: int = Field(..., ge=1, le=10)
    feedback: str
    strengths: List[str]
    areas_for_improvement: List[str]
    recommended_reading: List[str]
