"""
Machine Learning Engine for TQM Decision-Support.
Implements:
1. Unsupervised K-Means clustering to discover project TQM maturity archetypes.
2. Supervised comparative classification (Logistic Regression, Random Forest, XGBoost)
   to predict project quality compliance and defect risk.
"""
from __future__ import annotations
import numpy as np
import pandas as pd
from typing import List, Dict, Any, Tuple

from sklearn.cluster import KMeans
from sklearn.linear_model import LogisticRegression
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import cross_val_score, StratifiedKFold
from sklearn.metrics import accuracy_score, precision_score, recall_score, f1_score, roc_auc_score
from xgboost import XGBClassifier

class MLEngine:
    @staticmethod
    def run_clustering(
        responses: List[Dict[str, Any]],
        n_clusters: int = 3
    ) -> List[Dict[str, Any]]:
        if not responses or len(responses) < 6:
            return []

        matrix = [r["ratings"] for r in responses]
        df = pd.DataFrame(matrix).dropna()
        cols = list(df.columns)

        kmeans = KMeans(n_clusters=n_clusters, random_state=42, n_init=10)
        labels = kmeans.fit_predict(df)

        cluster_names = [
            "High TQM Maturity (Proactive Leaders)",
            "Moderate TQM Adopters (Transitional)",
            "Low TQM Adoption (Reactive / High Risk)"
        ]

        # Calculate average factor score per cluster to sort them appropriately
        cluster_scores = []
        for c in range(n_clusters):
            c_mask = (labels == c)
            c_df = df[c_mask]
            mean_score = float(c_df.mean().mean()) if len(c_df) > 0 else 0.0
            cluster_scores.append((c, mean_score, len(c_df)))

        # Sort descending so cluster with highest mean is labeled "High"
        cluster_scores.sort(key=lambda x: x[1], reverse=True)

        results = []
        total_n = len(df)
        for rank_idx, (orig_cluster_id, mean_val, size) in enumerate(cluster_scores):
            c_mask = (labels == orig_cluster_id)
            c_df = df[c_mask]
            characteristics = {col: round(float(c_df[col].mean()), 2) for col in cols[:8]}

            results.append({
                "cluster_id": rank_idx + 1,
                "cluster_label": cluster_names[rank_idx] if rank_idx < len(cluster_names) else f"Archetype {rank_idx + 1}",
                "size": int(size),
                "percentage": round(float(size / total_n * 100), 1),
                "characteristics": characteristics,
                "tqm_maturity_level": ["Advanced", "Developing", "Nascent"][min(rank_idx, 2)]
            })

        return results

    @staticmethod
    def train_predictive_models(
        responses: List[Dict[str, Any]]
    ) -> Tuple[List[Dict[str, Any]], Any, pd.DataFrame]:
        if not responses or len(responses) < 20:
            return [], None, pd.DataFrame()

        matrix = [r["ratings"] for r in responses]
        df = pd.DataFrame(matrix).dropna()

        # Construction of research outcome: High Quality Compliance (1) vs Quality Defect Risk (0)
        # CSFs positively contribute, Barriers indicate defect risk
        csf_cols = [c for c in df.columns if c.startswith("CSF")]
        bar_cols = [c for c in df.columns if c.startswith("BAR")]

        csf_mean = df[csf_cols].mean(axis=1) if csf_cols else df.mean(axis=1)
        bar_mean = df[bar_cols].mean(axis=1) if bar_cols else 3.0

        # Score index = csf_mean - 0.5 * (bar_mean - 3.0)
        quality_index = csf_mean - 0.4 * (bar_mean - 3.0)
        median_threshold = float(quality_index.median())
        y = (quality_index >= median_threshold).astype(int).values
        X = df.values
        feature_names = list(df.columns)

        cv = StratifiedKFold(n_splits=5, shuffle=True, random_state=42)

        models = {
            "Logistic Regression": LogisticRegression(max_iter=1000, random_state=42),
            "Random Forest": RandomForestClassifier(n_estimators=100, max_depth=5, random_state=42),
            "XGBoost": XGBClassifier(n_estimators=80, max_depth=4, learning_rate=0.08, eval_metric="logloss", random_state=42)
        }

        comparison = []
        best_model = None
        best_f1 = -1.0

        for name, model in models.items():
            model.fit(X, y)
            preds = model.predict(X)
            probs = model.predict_proba(X)[:, 1] if hasattr(model, "predict_proba") else preds

            acc = float(accuracy_score(y, preds))
            prec = float(precision_score(y, preds, zero_division=0))
            rec = float(recall_score(y, preds, zero_division=0))
            f1 = float(f1_score(y, preds, zero_division=0))
            try:
                auc = float(roc_auc_score(y, probs))
            except Exception:
                auc = acc

            cv_scores = cross_val_score(model, X, y, cv=cv, scoring="accuracy")
            cv_mean = float(np.mean(cv_scores))

            if f1 > best_f1:
                best_f1 = f1
                best_model = model

            comparison.append({
                "model_name": name,
                "accuracy": round(acc, 3),
                "precision": round(prec, 3),
                "recall": round(rec, 3),
                "f1_score": round(f1, 3),
                "roc_auc": round(auc, 3),
                "cv_mean": round(cv_mean, 3)
            })

        return comparison, best_model, df
