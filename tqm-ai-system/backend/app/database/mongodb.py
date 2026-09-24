"""
MongoDB connection module.
Uses Motor (async PyMongo) for all database operations.
Connection string is read from environment — never hardcoded.
"""
from __future__ import annotations

import motor.motor_asyncio
from pymongo import MongoClient
from loguru import logger
from app.config import get_settings

settings = get_settings()

# ── Async client (used by FastAPI routes) ────────────────────────────────────
_async_client: motor.motor_asyncio.AsyncIOMotorClient | None = None
_async_db: motor.motor_asyncio.AsyncIOMotorDatabase | None = None


def get_async_client() -> motor.motor_asyncio.AsyncIOMotorClient:
    global _async_client
    if _async_client is None:
        _async_client = motor.motor_asyncio.AsyncIOMotorClient(
            settings.mongodb_uri,
            serverSelectionTimeoutMS=5000,
            connectTimeoutMS=5000,
        )
    return _async_client


def get_db() -> motor.motor_asyncio.AsyncIOMotorDatabase:
    global _async_db
    if _async_db is None:
        _async_db = get_async_client()[settings.mongodb_db_name]
    return _async_db


import time

_ping_cache = {"result": None, "checked_at": 0.0}

async def ping_db(force: bool = False) -> dict:
    """
    Ping MongoDB and return a status dict.
    Cached for fast responses.
    """
    global _ping_cache
    now = time.time()
    ttl = 30.0 if (_ping_cache["result"] and _ping_cache["result"].get("mongodb") == "connected") else 10.0
    if not force and _ping_cache["result"] is not None and (now - _ping_cache["checked_at"] < ttl):
        return _ping_cache["result"]

    try:
        client = get_async_client()
        await client.admin.command("ping")
        res = {"mongodb": "connected", "db": settings.mongodb_db_name}
    except Exception as exc:
        res = {"mongodb": "disconnected", "error": str(exc)}

    _ping_cache["result"] = res
    _ping_cache["checked_at"] = now
    return res


async def close_db_connection() -> None:
    """Call during application shutdown."""
    global _async_client, _async_db
    if _async_client is not None:
        _async_client.close()
        _async_client = None
        _async_db = None
        logger.info("MongoDB connection closed.")
