"""
Chatbot & Viva Voce API Router.
"""
from __future__ import annotations
from typing import List, Dict, Any
from fastapi import APIRouter

from app.chatbot.bot_engine import get_chatbot_engine
from app.chatbot.viva_engine import VivaEngine
from app.schemas.chatbot import (
    ChatMessage, ChatResponse, VivaQuestion,
    VivaEvaluationRequest, VivaEvaluationResponse
)

router = APIRouter(prefix="/api/chatbot", tags=["AI Research Assistant & Viva Voce"])

@router.post("/query", response_model=ChatResponse)
async def query_chatbot(payload: ChatMessage):
    """Query the offline TQM Research Assistant with TF-IDF and knowledge base matching."""
    bot = get_chatbot_engine()
    result = bot.answer_query(payload.message, screen=payload.screen, mode=payload.mode)
    return result

@router.get("/viva/questions", response_model=List[VivaQuestion])
async def get_viva_questions():
    """Retrieve the bank of Viva Voce defense questions with examiner intent."""
    return VivaEngine.get_questions()

@router.post("/viva/evaluate", response_model=VivaEvaluationResponse)
async def evaluate_viva_answer(payload: VivaEvaluationRequest):
    """Evaluate a candidate's viva answer against academic key points and scoring rubric."""
    return VivaEngine.evaluate_answer(payload.question_id, payload.user_answer)
