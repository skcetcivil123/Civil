"""
MongoDB index creation.
Call create_indexes() once at application startup.
"""
from __future__ import annotations

from loguru import logger
from pymongo import ASCENDING, DESCENDING, TEXT
from app.database.mongodb import get_db
from app.database import collections as C


async def create_indexes() -> None:
    """
    Create all required indexes on application startup.
    Motor's create_index is idempotent — safe to call on every startup.
    Non-fatal: if MongoDB is unavailable, a warning is logged and startup continues.
    The /api/health endpoint will report the DB as disconnected.
    """
    try:
        db = get_db()
        logger.info("Creating MongoDB indexes…")

        # factors
        await db[C.FACTORS].create_index([("code", ASCENDING)], unique=True)
        await db[C.FACTORS].create_index([("category", ASCENDING)])
        await db[C.FACTORS].create_index([("status", ASCENDING)])

        # experts
        await db[C.EXPERTS].create_index([("email", ASCENDING)], unique=True)

        # fdm_ratings
        await db[C.FDM_RATINGS].create_index(
            [("expert_id", ASCENDING), ("factor_id", ASCENDING)], unique=True
        )

        # questions
        await db[C.QUESTIONS].create_index([("questionnaire_id", ASCENDING)])
        await db[C.QUESTIONS].create_index([("factor_id", ASCENDING)])

        # respondents
        await db[C.RESPONDENTS].create_index([("email", ASCENDING)], sparse=True)
        await db[C.RESPONDENTS].create_index([("token", ASCENDING)], unique=True)

        # responses
        await db[C.RESPONSES].create_index(
            [("respondent_id", ASCENDING), ("questionnaire_id", ASCENDING)],
            unique=True,
            sparse=True,
        )

        # users
        await db[C.USERS].create_index([("username", ASCENDING)], unique=True)
        await db[C.USERS].create_index([("email", ASCENDING)], unique=True)

        # chatbot_kb — full-text search
        await db[C.CHATBOT_KB].create_index([("intent", ASCENDING)], unique=True)

        logger.info("MongoDB indexes created successfully.")

    except Exception as exc:
        logger.warning(
            f"MongoDB index creation skipped (DB not reachable at startup): {exc}\n"
            "The server will start anyway. Check /api/health for DB status."
        )

