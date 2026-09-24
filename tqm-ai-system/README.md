# TQM AI Decision-Support System

> **An Empirical Assessment of TQM Implementation in Construction Projects
> Using FDM and Statistical Analysis**
>
> AI-Enhanced Decision-Support System — Coimbatore / Tamil Nadu

---

## Research Overview

This system supports the academic research study on **Total Quality Management (TQM)
implementation** in building and infrastructure construction projects. It wraps the
original, unmodified research methodology with a full-stack AI application.

### Original Methodology (Fixed — Do Not Alter)

```
Literature Review
→ TQM Critical Success Factors and Barriers
→ Fuzzy Delphi Method (FDM)
→ Expert Consensus
→ 5-point Likert Questionnaire
→ Pilot Testing
→ Cronbach's Alpha
→ Data Collection (~120 construction professionals)
→ Descriptive Statistics
→ Relative Importance Index (RII)
→ KMO and Bartlett's Test
→ Exploratory Factor Analysis (EFA)
→ ANOVA
→ Prioritized TQM Implementation Framework
→ Recommendations
```

---

## Technology Stack

| Layer | Technology |
|---|---|
| Frontend | React 18, Vite, Tailwind CSS, React Router v6, Axios, Recharts |
| Backend | Python 3.11, FastAPI, Pydantic v2, Uvicorn |
| Database | MongoDB Atlas |
| Statistics | NumPy, Pandas, SciPy, Statsmodels, factor_analyzer |
| ML | Scikit-learn, XGBoost, SHAP |
| Chatbot | TF-IDF + Logistic Regression (offline, no external LLM) |

---

## Project Modules

1. Dashboard
2. Literature / Factor Management
3. Fuzzy Delphi Method (FDM) Analysis
4. Expert Management
5. Questionnaire Builder
6. Survey Collection
7. Descriptive Statistics
8. Relative Importance Index (RII)
9. Reliability (Cronbach's Alpha)
10. KMO / Bartlett's Test
11. Exploratory Factor Analysis (EFA)
12. ANOVA
13. TQM Framework
14. Machine Learning Analysis
15. Model Comparison
16. Explainable AI (SHAP)
17. Recommendation Engine
18. Offline TQM Chatbot
19. Viva Mode
20. Review Mode
21. Report Generation
22. Admin Panel
23. Authentication (JWT)

---

## Setup

### Prerequisites
- Python 3.11+
- Node.js 18+
- MongoDB Atlas account (free tier)

### Backend

```bash
cd backend
python -m venv .venv
source .venv/bin/activate      # Windows: .venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env           # Fill in your secrets
uvicorn app.main:app --reload --port 8000
```

### Frontend

```bash
cd frontend
npm install
cp .env.example .env.local     # Fill in VITE_API_URL
npm run dev
```

### Environment Variables

See `backend/.env.example` and `frontend/.env.example` for all required variables.

---

## Important: Data Integrity

> **No research results are fabricated.**
> All statistical outputs, FDM results, and ML metrics are computed from
> real data supplied by the researcher. The system clearly labels:
> - ✅ REAL DATA — computed from actual survey/expert responses
> - ⚠️ DEMO DATA — illustrative placeholder, not for publication
> - ⏳ PENDING DATA — module awaiting real data input

---

## License

This project is for academic research purposes. All rights reserved.
