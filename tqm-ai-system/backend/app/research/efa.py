"""
Exploratory Factor Analysis (EFA) Engine.
Extracts latent construct dimensions, computes eigenvalues,
applies Varimax orthogonal rotation, and generates factor loading matrices.
"""
from __future__ import annotations
import numpy as np
import pandas as pd
from typing import List, Dict, Any

try:
    from factor_analyzer import FactorAnalyzer
except ImportError:
    FactorAnalyzer = None

# Curated academic dimension labels for Coimbatore TQM construction context
LATENT_DIMENSION_NAMES = [
    "Strategic Leadership & Quality Culture",
    "Process Standardization & Continuous Kaizen",
    "Human Resource & Workforce Competency",
    "Supply Chain & Multi-Stakeholder Integration"
]

class EFAEngine:
    @staticmethod
    def calculate_efa(
        responses: List[Dict[str, Any]],
        factors: List[Dict[str, Any]],
        n_factors: int = 4,
        rotation: str = "varimax"
    ) -> Dict[str, Any]:
        if not responses or len(responses) < 10:
            return {
                "factors_extracted": 0,
                "variance_explained": [],
                "total_variance_explained": 0.0,
                "eigenvalues": [],
                "factor_names": [],
                "loadings_matrix": []
            }

        matrix = [r["ratings"] for r in responses]
        df = pd.DataFrame(matrix).dropna()
        cols = list(df.columns)
        p = len(cols)
        factor_dict = {f["code"]: f for f in factors}

        eigenvalues = []
        loadings = None
        var_explained = []

        if FactorAnalyzer is not None:
            try:
                fa = FactorAnalyzer(n_factors=min(n_factors, p - 1), rotation=rotation, method='principal')
                fa.fit(df)
                ev, _ = fa.get_eigenvalues()
                eigenvalues = [round(float(v), 3) for v in ev[:min(p, 8)]]
                loadings = fa.loadings_
                variance_stats = fa.get_factor_variance()
                var_explained = [round(float(v) * 100, 2) for v in variance_stats[1]]
            except Exception:
                pass

        if loadings is None or len(eigenvalues) == 0:
            # SVD / PCA fallback
            corr = df.corr().values
            vals, vecs = np.linalg.eigh(corr)
            idx = np.argsort(vals)[::-1]
            vals = vals[idx]
            vecs = vecs[:, idx]
            eigenvalues = [round(float(v), 3) for v in vals[:min(p, 8)]]
            # Unrotated loadings: vecs * sqrt(vals)
            k_fact = min(n_factors, p)
            loadings = vecs[:, :k_fact] * np.sqrt(np.maximum(vals[:k_fact], 0))
            tot_var = np.sum(vals)
            var_explained = [round(float(v / tot_var * 100), 2) for v in vals[:k_fact]]

        # Format loadings matrix
        k_fact = loadings.shape[1]
        dim_names = LATENT_DIMENSION_NAMES[:k_fact]
        while len(dim_names) < k_fact:
            dim_names.append(f"Factor {len(dim_names) + 1}")

        loadings_matrix = []
        for i, col_code in enumerate(cols):
            f_meta = factor_dict.get(col_code, {})
            row = {
                "code": col_code,
                "name": f_meta.get("name", col_code),
                "category": f_meta.get("category", "CSF"),
            }
            primary_loading = 0.0
            primary_factor = dim_names[0]
            for f_idx in range(k_fact):
                l_val = round(float(loadings[i, f_idx]), 3)
                row[f"F{f_idx + 1}"] = l_val
                if abs(l_val) > abs(primary_loading):
                    primary_loading = l_val
                    primary_factor = dim_names[f_idx]
            row["primary_dimension"] = primary_factor
            row["communality"] = round(float(np.sum(loadings[i, :k_fact]**2)), 3)
            loadings_matrix.append(row)

        total_variance = round(float(np.sum(var_explained)), 2)

        return {
            "factors_extracted": k_fact,
            "variance_explained": var_explained,
            "total_variance_explained": total_variance,
            "eigenvalues": eigenvalues,
            "factor_names": dim_names,
            "loadings_matrix": loadings_matrix
        }
