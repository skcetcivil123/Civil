"""
Reports & Data Export API Router.
"""
from __future__ import annotations
import csv
import io
from datetime import datetime
from typing import Dict, Any
from fastapi import APIRouter, Response

from app.database.repository import Repository
from app.research.descriptive_engine import DescriptiveEngine
from app.research.rii_engine import RIIEngine
from app.research.reliability import ReliabilityEngine
from app.research.kmo_bartlett import KMOBartlettEngine
from app.research.efa import EFAEngine
from app.research.anova import ANOVAEngine
from app.ml.ml_engine import MLEngine

router = APIRouter(prefix="/api/reports", tags=["Reports & Export"])

@router.get("/summary")
async def get_summary_report() -> Dict[str, Any]:
    """Generates a complete, comprehensive academic synthesis report."""
    responses = await Repository.get_responses()
    factors = await Repository.get_factors()

    descriptives = DescriptiveEngine.calculate_descriptives(responses, factors)
    rii = RIIEngine.calculate_rii(responses, factors)
    reliability = ReliabilityEngine.calculate_cronbach_alpha(responses, factors)
    kmo = KMOBartlettEngine.calculate_suitability(responses)
    efa = EFAEngine.calculate_efa(responses, factors)
    anova = ANOVAEngine.calculate_anova(responses, factors, group_by="experience")
    clusters = MLEngine.run_clustering(responses)
    models, _, _ = MLEngine.train_predictive_models(responses)

    return {
        "report_title": "Empirical Assessment of TQM Implementation in Construction Projects",
        "region": "Coimbatore / Tamil Nadu",
        "generated_at": datetime.now().isoformat(),
        "sample_size": len(responses),
        "total_factors": len(factors),
        "key_metrics": {
            "cronbach_alpha": reliability.get("cronbach_alpha"),
            "kmo_overall": kmo.get("kmo_overall"),
            "bartlett_p_value": kmo.get("bartlett_p_value"),
            "total_variance_explained": efa.get("total_variance_explained"),
            "top_csf": rii[0]["name"] if rii else "None",
            "top_barrier": next((r["name"] for r in rii if r["category"] == "Barrier"), "None")
        },
        "rii_rankings": rii[:8],
        "efa_dimensions": efa.get("factor_names", []),
        "ml_best_model": max(models, key=lambda m: m["f1_score"]) if models else {},
        "cluster_summary": clusters
    }

@router.get("/export/csv")
async def export_csv():
    """Exports raw 120-respondent survey dataset as CSV."""
    responses = await Repository.get_responses()
    factors = await Repository.get_factors()
    factor_codes = [f["code"] for f in factors]

    output = io.StringIO()
    fieldnames = [
        "Respondent_ID", "Role", "Experience", "Organization_Type", "Project_Type", "Location"
    ] + factor_codes

    writer = csv.DictWriter(output, fieldnames=fieldnames)
    writer.writeheader()

    for r in responses:
        resp_meta = r.get("respondent", {})
        ratings = r.get("ratings", {})
        row = {
            "Respondent_ID": r.get("id"),
            "Role": resp_meta.get("role"),
            "Experience": resp_meta.get("experience"),
            "Organization_Type": resp_meta.get("organization_type"),
            "Project_Type": resp_meta.get("project_type"),
            "Location": resp_meta.get("location", "Coimbatore"),
        }
        for code in factor_codes:
            row[code] = ratings.get(code, "")
        writer.writerow(row)

    return Response(
        content=output.getvalue(),
        media_type="text/csv",
        headers={"Content-Disposition": "attachment; filename=tqm_coimbatore_survey_data.csv"}
    )
