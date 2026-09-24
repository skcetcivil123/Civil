"""
Reliability Analysis Engine — Cronbach's Alpha.
Calculates internal consistency for survey instrument scale items.
"""
from __future__ import annotations
import numpy as np
import pandas as pd
from typing import List, Dict, Any

class ReliabilityEngine:
    @staticmethod
    def calculate_cronbach_alpha(
        responses: List[Dict[str, Any]],
        factors: List[Dict[str, Any]]
    ) -> Dict[str, Any]:
        if not responses or len(responses) < 2:
            return {
                "cronbach_alpha": 0.0,
                "interpretation": "Insufficient data",
                "items_count": 0,
                "sample_size": 0,
                "item_statistics": []
            }

        matrix = [r["ratings"] for r in responses]
        df = pd.DataFrame(matrix).dropna()
        factor_dict = {f["code"]: f for f in factors}

        k = df.shape[1]
        n = df.shape[0]

        if k < 2:
            return {
                "cronbach_alpha": 0.0,
                "interpretation": "At least 2 items required",
                "items_count": k,
                "sample_size": n,
                "item_statistics": []
            }

        # Item variances
        item_variances = df.var(axis=0, ddof=1)
        sum_item_variances = item_variances.sum()

        # Total scale scores
        total_scores = df.sum(axis=1)
        total_variance = total_scores.var(ddof=1)

        if total_variance == 0:
            alpha = 0.0
        else:
            alpha = (k / (k - 1)) * (1 - (sum_item_variances / total_variance))

        alpha = float(np.clip(alpha, 0.0, 0.9999))

        # Academic interpretation (Nunnally, 1978; George & Mallery, 2003)
        if alpha >= 0.90:
            interp = "Excellent (Very High Internal Consistency)"
        elif alpha >= 0.80:
            interp = "Good (High Reliability for Field Research)"
        elif alpha >= 0.70:
            interp = "Acceptable (Satisfactory Scale Consistency)"
        elif alpha >= 0.60:
            interp = "Questionable"
        elif alpha >= 0.50:
            interp = "Poor"
        else:
            interp = "Unacceptable"

        # Item-level statistics (Corrected item-total correlation & Alpha if item deleted)
        item_stats = []
        for col_name in df.columns:
            sub_df = df.drop(columns=[col_name])
            sub_total = sub_df.sum(axis=1)
            
            # Corrected item-total correlation
            corr = float(df[col_name].corr(sub_total)) if sub_total.std() > 0 else 0.0

            # Alpha if deleted
            sub_k = k - 1
            if sub_k >= 2:
                sub_sum_vars = sub_df.var(axis=0, ddof=1).sum()
                sub_tot_var = sub_total.var(ddof=1)
                del_alpha = (sub_k / (sub_k - 1)) * (1 - (sub_sum_vars / sub_tot_var)) if sub_tot_var > 0 else 0.0
                del_alpha = float(np.clip(del_alpha, 0.0, 0.9999))
            else:
                del_alpha = 0.0

            f_meta = factor_dict.get(col_name, {})
            item_stats.append({
                "code": col_name,
                "name": f_meta.get("name", col_name),
                "category": f_meta.get("category", "CSF"),
                "mean": round(float(df[col_name].mean()), 3),
                "variance": round(float(item_variances[col_name]), 3),
                "corrected_item_total_corr": round(corr, 3),
                "alpha_if_item_deleted": round(del_alpha, 3)
            })

        return {
            "cronbach_alpha": round(alpha, 4),
            "interpretation": interp,
            "items_count": k,
            "sample_size": n,
            "item_statistics": item_stats
        }
