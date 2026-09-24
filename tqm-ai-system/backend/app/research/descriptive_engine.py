"""
Descriptive Statistics Engine.
Calculates Mean, Standard Deviation, Variance, Skewness, Kurtosis
for Likert scale survey responses.
"""
from __future__ import annotations
import numpy as np
import pandas as pd
from scipy import stats
from typing import List, Dict, Any

class DescriptiveEngine:
    @staticmethod
    def calculate_descriptives(
        responses: List[Dict[str, Any]],
        factors: List[Dict[str, Any]]
    ) -> List[Dict[str, Any]]:
        if not responses:
            return []

        # Convert responses to dataframe
        matrix = [r["ratings"] for r in responses]
        df = pd.DataFrame(matrix)

        factor_dict = {f["code"]: f for f in factors}
        results = []

        for code in df.columns:
            series = df[code].dropna().astype(float)
            if len(series) == 0:
                continue

            f_meta = factor_dict.get(code, {})
            mean_val = float(series.mean())
            std_val = float(series.std(ddof=1)) if len(series) > 1 else 0.0
            var_val = float(series.var(ddof=1)) if len(series) > 1 else 0.0
            skew_val = float(stats.skew(series, bias=False)) if len(series) > 2 else 0.0
            kurt_val = float(stats.kurtosis(series, bias=False)) if len(series) > 3 else 0.0

            results.append({
                "code": code,
                "name": f_meta.get("name", code),
                "category": f_meta.get("category", "CSF"),
                "sub_category": f_meta.get("sub_category", "General"),
                "count": int(len(series)),
                "mean": round(mean_val, 3),
                "std_dev": round(std_val, 3),
                "variance": round(var_val, 3),
                "skewness": round(skew_val, 3),
                "kurtosis": round(kurt_val, 3)
            })

        # Sort by mean descending
        results.sort(key=lambda x: x["mean"], reverse=True)
        return results
