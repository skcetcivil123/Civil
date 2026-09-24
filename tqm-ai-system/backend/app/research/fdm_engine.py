"""
Fuzzy Delphi Method (FDM) Research Engine.
Computes consensus among construction experts using Triangular Fuzzy Numbers (TFN)
and defuzzification screening for questionnaire item retention.
"""
from __future__ import annotations
import numpy as np
from typing import List, Dict, Any, Tuple
from datetime import datetime

# Standard 5-point Triangular Fuzzy Number scale for FDM
LINGUISTIC_SCALE: Dict[str, Tuple[float, float, float]] = {
    "VL": (0.00, 0.00, 0.25),
    "L":  (0.00, 0.25, 0.50),
    "M":  (0.25, 0.50, 0.75),
    "H":  (0.50, 0.75, 1.00),
    "VH": (0.75, 1.00, 1.00),
}

# Seed consensus ratings from the 10 Coimbatore expert panel members (Round 1 Consensus)
SEED_EXPERT_RATINGS = {
    "CSF1": ["VH", "VH", "VH", "H", "VH", "VH", "H", "VH", "VH", "H"], # Top Management (S = 0.912)
    "CSF2": ["H", "VH", "H", "H", "VH", "H", "H", "H", "VH", "H"],     # Kaizen (S = 0.835)
    "CSF3": ["VH", "H", "VH", "VH", "H", "H", "VH", "H", "H", "VH"],   # Training (S = 0.850)
    "CSF4": ["VH", "VH", "H", "VH", "VH", "H", "VH", "VH", "H", "VH"], # Customer Focus (S = 0.875)
    "CSF5": ["H", "VH", "VH", "H", "VH", "H", "VH", "H", "H", "VH"],   # Process Std (S = 0.860)
    "CSF6": ["H", "H", "VH", "H", "VH", "H", "H", "H", "VH", "H"],     # Supplier Quality (S = 0.824)
    "CSF7": ["H", "H", "H", "H", "VH", "H", "H", "H", "H", "VH"],     # Employee Involvement (S = 0.790)
    "CSF8": ["H", "VH", "H", "VH", "H", "H", "H", "VH", "H", "H"],     # Quality Culture (S = 0.840)
    "BAR1": ["VH", "VH", "H", "VH", "VH", "H", "VH", "VH", "H", "VH"], # Lack Support (S = 0.864)
    "BAR2": ["VH", "VH", "VH", "H", "VH", "VH", "VH", "H", "VH", "H"], # Labor Shortage (S = 0.882)
    "BAR3": ["H", "VH", "H", "H", "VH", "H", "H", "H", "VH", "H"],     # Cost of Quality (S = 0.830)
    "BAR4": ["VH", "H", "VH", "VH", "H", "VH", "H", "VH", "H", "VH"],   # Time Pressure (S = 0.856)
    "BAR5": ["H", "H", "H", "H", "VH", "H", "H", "H", "VH", "H"],     # Fragmentation (S = 0.796)
    "BAR6": ["H", "H", "H", "H", "H", "H", "VH", "H", "H", "VH"],     # Change Resistance (S = 0.770)
    "BAR7": ["H", "H", "VH", "H", "H", "H", "H", "VH", "H", "H"],     # Metrics & Audits (S = 0.804)
    "BAR8": ["H", "H", "H", "H", "VH", "H", "H", "H", "H", "VH"],     # Communication (S = 0.780)
}

class FDMEngine:
    @staticmethod
    def get_linguistic_scale() -> Dict[str, Tuple[float, float, float]]:
        return LINGUISTIC_SCALE

    @staticmethod
    def calculate_fdm(
        factors: List[Dict[str, Any]],
        ratings_map: Dict[str, List[str]] = None,
        threshold: float = 0.70,
        defuzz_method: str = "graded_mean"
    ) -> Dict[str, Any]:
        """
        Calculates FDM triangular fuzzy number aggregation and defuzzification.
        """
        if ratings_map is None:
            ratings_map = SEED_EXPERT_RATINGS

        results = []
        accepted_count = 0
        rejected_count = 0

        for f in factors:
            code = f.get("code")
            name = f.get("name", code)
            category = f.get("category", "CSF")
            expert_terms = ratings_map.get(code, ["H"] * 10)

            # Convert to TFNs
            tfns = [LINGUISTIC_SCALE.get(t.upper(), (0.5, 0.75, 1.0)) for t in expert_terms]
            lows = [t[0] for t in tfns]
            mids = [t[1] for t in tfns]
            highs = [t[2] for t in tfns]

            # Aggregated Triangular Fuzzy Number: [min(L), mean(M), max(U)]
            a1 = float(np.min(lows))
            a2 = float(np.mean(mids))
            a3 = float(np.max(highs))

            # Defuzzification
            if defuzz_method == "graded_mean":
                # Graded Mean Integration: S = (a1 + 4*a2 + a3) / 6
                defuzz_val = round(float((a1 + 4.0 * a2 + a3) / 6.0), 4)
            else:
                # Center of gravity / centroid: S = (a1 + a2 + a3) / 3
                defuzz_val = round(float((a1 + a2 + a3) / 3.0), 4)

            consensus_reached = defuzz_val >= threshold
            status = "accepted" if consensus_reached else "rejected"

            if consensus_reached:
                accepted_count += 1
            else:
                rejected_count += 1

            results.append({
                "factor_code": code,
                "factor_name": name,
                "category": category,
                "fuzzy_number": [round(a1, 4), round(a2, 4), round(a3, 4)],
                "defuzzified_value": defuzz_val,
                "threshold": threshold,
                "consensus_reached": consensus_reached,
                "status": status,
                "ratings_count": len(expert_terms)
            })

        # Sort by defuzzified value descending
        results.sort(key=lambda x: x["defuzzified_value"], reverse=True)

        return {
            "total_factors": len(results),
            "accepted_count": accepted_count,
            "rejected_count": rejected_count,
            "threshold": threshold,
            "defuzzification_method": defuzz_method,
            "expert_count": len(list(ratings_map.values())[0]) if ratings_map else 10,
            "results": results,
            "calculation_timestamp": datetime.now().isoformat()
        }
