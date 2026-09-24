"""
MongoDB collection name constants.
Define all collection names here so they are never magic-stringed elsewhere.
"""

# ── Core research data ────────────────────────────────────────────────────────
FACTORS = "factors"               # TQM factors (CSFs and barriers)
EXPERTS = "experts"               # FDM expert panel members
FDM_RATINGS = "fdm_ratings"       # Linguistic ratings from experts
FDM_RESULTS = "fdm_results"       # Aggregated FDM computation results

# ── Survey ────────────────────────────────────────────────────────────────────
QUESTIONNAIRES = "questionnaires" # Questionnaire definitions
QUESTIONS = "questions"           # Individual question items
RESPONDENTS = "respondents"       # Survey respondent profiles
RESPONSES = "responses"           # Individual survey responses

# ── Statistical outputs ───────────────────────────────────────────────────────
STAT_RESULTS = "stat_results"     # Cached statistical computation results

# ── ML ────────────────────────────────────────────────────────────────────────
ML_RUNS = "ml_runs"               # ML training run metadata and metrics

# ── System ────────────────────────────────────────────────────────────────────
USERS = "users"                   # Authenticated users
AUDIT_LOG = "audit_log"          # Audit trail for sensitive operations
REPORTS = "reports"              # Generated report metadata
CHATBOT_KB = "chatbot_kb"         # Chatbot knowledge base entries
VIVA_QUESTIONS = "viva_questions" # Viva mode Q&A bank
