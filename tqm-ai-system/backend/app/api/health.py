"""
Health check router.
GET /api/health — returns application and MongoDB status.
"""
from fastapi import APIRouter
from app.database.mongodb import ping_db
from app.config import get_settings

router = APIRouter(prefix="/api", tags=["health"])
settings = get_settings()


@router.get("/health", summary="System health check")
async def health_check() -> dict:
    """
    Returns the overall system health including:
    - Application status
    - Application version
    - MongoDB connectivity
    """
    db_status = await ping_db()
    return {
        "status": "ok",
        "version": settings.app_version,
        "environment": settings.app_env,
        **db_status,
    }
