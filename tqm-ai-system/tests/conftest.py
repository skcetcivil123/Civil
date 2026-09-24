"""
Shared pytest fixtures for all TQM AI System tests.
Sets MONGODB_URI to a non-existent host so tests don't require a live DB.
The health test still passes because MongoDB errors are caught and reported,
not raised as exceptions.
"""
import os
import pytest

# Override env before any app module imports
os.environ.setdefault("MONGODB_URI", "mongodb://localhost:27017")
os.environ.setdefault("MONGODB_DB_NAME", "tqm_test_db")
os.environ.setdefault("JWT_SECRET", "test_secret_not_for_production")
os.environ.setdefault("CORS_ORIGINS", "http://localhost:5173")
os.environ.setdefault("APP_ENV", "test")
