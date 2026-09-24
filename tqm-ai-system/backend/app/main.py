"""
TQM AI Decision-Support System — FastAPI Application Entry Point

Architecture:
  React (frontend)
  → FastAPI REST API (this file)
  → Research Engine / ML Engine / Chatbot Engine
  → MongoDB Atlas
"""
from __future__ import annotations

from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from loguru import logger

from app.config import get_settings
from app.database.mongodb import close_db_connection
from app.database.indexes import create_indexes

# ── Routers (imported here so they register on startup) ───────────────────────
from app.api.health import router as health_router
from app.api.factors import router as factors_router
from app.api.fdm import router as fdm_router
from app.api.survey import router as survey_router
from app.api.statistics import router as statistics_router
from app.api.ml import router as ml_router
from app.api.xai import router as xai_router
from app.api.recommendations import router as recommendations_router
from app.api.chatbot import router as chatbot_router
from app.api.reports import router as reports_router
from app.api.auth import router as auth_router

settings = get_settings()


@asynccontextmanager
async def lifespan(app: FastAPI):
    """
    Application lifespan handler.
    - Startup: create DB indexes.
    - Shutdown: close DB connection gracefully.
    """
    logger.info(f"Starting TQM AI System v{settings.app_version} [{settings.app_env}]")
    await create_indexes()
    yield
    logger.info("Shutting down TQM AI System…")
    await close_db_connection()


# ── FastAPI app ───────────────────────────────────────────────────────────────
app = FastAPI(
    title="TQM AI Decision-Support System",
    description=(
        "AI-enhanced platform for the empirical assessment of TQM implementation "
        "in construction projects using FDM and statistical analysis. "
        "Research scope: Coimbatore / Tamil Nadu."
    ),
    version=settings.app_version,
    docs_url="/api/docs",
    redoc_url="/api/redoc",
    openapi_url="/api/openapi.json",
    lifespan=lifespan,
)

# ── CORS ──────────────────────────────────────────────────────────────────────
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Register routers ──────────────────────────────────────────────────────────
app.include_router(health_router)
app.include_router(factors_router)
app.include_router(fdm_router)
app.include_router(survey_router)
app.include_router(statistics_router)
app.include_router(ml_router)
app.include_router(xai_router)
app.include_router(recommendations_router)
app.include_router(chatbot_router)
app.include_router(reports_router)
app.include_router(auth_router)


@app.get("/", include_in_schema=False)
async def root() -> dict:
    return {
        "message": "TQM AI Decision-Support System API",
        "docs": "/api/docs",
        "health": "/api/health",
    }
