"""
Phase 1 — Health endpoint integration test.
Acceptance criteria: GET /api/health returns { "status": "ok" }.

Run with:
    cd backend
    source .venv/bin/activate
    pytest tests/test_health.py -v
"""
import pytest
from httpx import AsyncClient, ASGITransport
from app.main import app


@pytest.mark.asyncio
async def test_health_returns_ok():
    """Health endpoint must return status=ok."""
    async with AsyncClient(
        transport=ASGITransport(app=app), base_url="http://test"
    ) as client:
        response = await client.get("/api/health")

    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "ok", f"Expected status=ok, got: {data}"
    assert "version" in data, "Response must include version"
    assert "mongodb" in data, "Response must include mongodb field"


@pytest.mark.asyncio
async def test_root_endpoint():
    """Root endpoint must return API info."""
    async with AsyncClient(
        transport=ASGITransport(app=app), base_url="http://test"
    ) as client:
        response = await client.get("/")

    assert response.status_code == 200
    data = response.json()
    assert "message" in data
    assert "docs" in data


@pytest.mark.asyncio
async def test_openapi_schema_available():
    """OpenAPI schema must be accessible."""
    async with AsyncClient(
        transport=ASGITransport(app=app), base_url="http://test"
    ) as client:
        response = await client.get("/api/openapi.json")

    assert response.status_code == 200
    schema = response.json()
    assert schema["info"]["title"] == "TQM AI Decision-Support System"
