"""
Relative Importance Index (RII) Engine.
Formula:
RII = sum(w * n_w) / (A * N)
where w = weight assigned to response (1 to 5),
n_w = frequency of respondents selecting weight w,
A = highest weight (5 for 5-point Likert),
N = total number of respondents.
"""
from __future__ import annotations
import numpy as np
import pandas as pd
from typing import List, Dict, Any

class RIIEngine:
    @staticmethod
    def calculate_rii(
        responses: List[Dict[str, Any]],
        factors: List[Dict[str, Any]],
        scale_max: int = 5
    ) -> List[Dict[str, Any]]:
        if not responses:
            return []

        matrix = [r["ratings"] for r in responses]
        df = pd.DataFrame(matrix)
        factor_dict = {f["code"]: f for f in factors}
        n_respondents = len(df)

        raw_ranks = []
        for code in df.columns:
            series = df[code].dropna().astype(float)
            if len(series) == 0:
                continue

            sum_w = float(series.sum())
            rii_val = sum_w / (scale_max * len(series))
            f_meta = factor_dict.get(code, {})

            # Academic categorization
            if rii_val >= 0.80:
                tier = "High"
            elif rii_val >= 0.70:
                tier = "Medium-High"
            elif rii_val >= 0.60:
                tier = "Medium"
            else:
                tier = "Low"

            raw_ranks.append({
                "code": code,
                "name": f_meta.get("name", code),
                "category": f_meta.get("category", "CSF"),
                "sub_category": f_meta.get("sub_category", "General"),
                "sum_w": sum_w,
                "rii": round(rii_val, 4),
                "tier": tier,
                "sample_size": len(series)
            })

        # Sort descending by RII
        raw_ranks.sort(key=lambda x: x["rii"], reverse=True)

        # Assign ordinal ranks (1 to K)
        for i, item in enumerate(raw_ranks, start=1):
            item["rank"] = i

        return raw_ranks
