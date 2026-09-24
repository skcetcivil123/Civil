"""
ANOVA (Analysis of Variance) Engine.
Conducts One-Way ANOVA to test whether perception of TQM CSFs and Barriers
differs significantly across professional experience, role, or project type.
"""
from __future__ import annotations
import numpy as np
import pandas as pd
from scipy import stats
from typing import List, Dict, Any

class ANOVAEngine:
    @staticmethod
    def calculate_anova(
        responses: List[Dict[str, Any]],
        factors: List[Dict[str, Any]],
        group_by: str = "experience" # or 'role', 'project_type', 'organization_type'
    ) -> List[Dict[str, Any]]:
        if not responses or len(responses) < 6:
            return []

        # Prepare records
        records = []
        for r in responses:
            resp_info = r.get("respondent", {})
            group_val = resp_info.get(group_by, "Unknown")
            row = dict(r["ratings"])
            row["_group"] = str(group_val)
            records.append(row)

        df = pd.DataFrame(records).dropna()
        groups = df["_group"].unique()
        factor_dict = {f["code"]: f for f in factors}

        if len(groups) < 2:
            return []

        results = []
        factor_cols = [c for c in df.columns if c != "_group"]

        for code in factor_cols:
            grouped_samples = [df[df["_group"] == g][code].values for g in groups]
            # Filter out empty groups
            grouped_samples = [s for s in grouped_samples if len(s) > 0]

            if len(grouped_samples) < 2:
                continue

            f_stat, p_val = stats.f_oneway(*grouped_samples)
            if np.isnan(f_stat) or np.isnan(p_val):
                f_stat, p_val = 0.0, 1.0

            # Calculate Eta-Squared (effect size): SS_between / SS_total
            all_vals = df[code].values
            grand_mean = np.mean(all_vals)
            ss_total = np.sum((all_vals - grand_mean)**2)
            ss_between = sum(len(s) * (np.mean(s) - grand_mean)**2 for s in grouped_samples)
            eta_sq = float(ss_between / ss_total) if ss_total > 0 else 0.0

            # Group means
            group_means = {str(g): round(float(df[df["_group"] == g][code].mean()), 2) for g in groups}
            f_meta = factor_dict.get(code, {})

            results.append({
                "factor_code": code,
                "factor_name": f_meta.get("name", code),
                "category": f_meta.get("category", "CSF"),
                "grouping_variable": group_by,
                "f_statistic": round(float(f_stat), 3),
                "p_value": round(float(p_val), 4),
                "eta_squared": round(float(np.clip(eta_sq, 0.0, 1.0)), 4),
                "is_significant": bool(p_val < 0.05),
                "group_means": group_means
            })

        # Sort by F-statistic descending
        results.sort(key=lambda x: x["f_statistic"], reverse=True)
        return results
