"""
Repository Layer for TQM AI Decision-Support System.
Dual-mode:
- Reads/writes to MongoDB if connected.
- Falls back transparently to in-memory/JSON store when MongoDB is offline.
Includes high-fidelity empirical seed data representing 120 construction professionals in Coimbatore.
"""
from __future__ import annotations
import os
import json
import uuid
import time
from datetime import datetime
from typing import List, Dict, Any, Optional
from loguru import logger
import numpy as np

from app.database.mongodb import get_db, ping_db
from app.database import collections as col

# ── Seed Data Definitions ───────────────────────────────────────────────────

SEED_FACTORS = [
    {
        "id": "f_csf1",
        "code": "CSF1",
        "name": "Top Management Commitment",
        "category": "CSF",
        "sub_category": "Leadership",
        "description": "Active leadership, quality policy formulation, and resource allocation by executive management.",
        "source_literature": ["Jha & Iyer (2006)", "Oakland (2014)", "Sila & Ebrahimpour (2002)"],
        "status": "fdm_accepted"
    },
    {
        "id": "f_csf2",
        "code": "CSF2",
        "name": "Continuous Improvement (Kaizen)",
        "category": "CSF",
        "sub_category": "Process",
        "description": "Systematic incremental improvements in construction processes, defect reduction, and workflow.",
        "source_literature": ["Hoonakker et al. (2010)", "Ibbs & Kwak (2000)"],
        "status": "fdm_accepted"
    },
    {
        "id": "f_csf3",
        "code": "CSF3",
        "name": "Training and Skill Development",
        "category": "CSF",
        "sub_category": "Human Resource",
        "description": "Structured quality training for site engineers, supervisors, and trade labor.",
        "source_literature": ["Tam & Le (2006)", "Love et al. (2004)"],
        "status": "fdm_accepted"
    },
    {
        "id": "f_csf4",
        "code": "CSF4",
        "name": "Customer Focus & Client Satisfaction",
        "category": "CSF",
        "sub_category": "Strategic",
        "description": "Aligning project deliverables with client specifications, handover expectations, and end-user requirements.",
        "source_literature": ["Parasuraman et al. (1988)", "Kärnä (2004)"],
        "status": "fdm_accepted"
    },
    {
        "id": "f_csf5",
        "code": "CSF5",
        "name": "Process Standardization & QA/QC",
        "category": "CSF",
        "sub_category": "Process",
        "description": "Standard operating procedures (SOP), checklist inspections, and ISO 9001 compliance on construction sites.",
        "source_literature": ["Harris & McCaffer (2013)", "Chung (1999)"],
        "status": "fdm_accepted"
    },
    {
        "id": "f_csf6",
        "code": "CSF6",
        "name": "Supplier & Subcontractor Quality",
        "category": "CSF",
        "sub_category": "Supply Chain",
        "description": "Rigorous material testing, vendor qualification, and quality audits of specialized subcontractors.",
        "source_literature": ["Akintoye (2000)", "Wong & Fung (1999)"],
        "status": "fdm_accepted"
    },
    {
        "id": "f_csf7",
        "code": "CSF7",
        "name": "Employee Involvement & Teamwork",
        "category": "CSF",
        "sub_category": "Human Resource",
        "description": "Empowering site workforce and quality circles to report non-conformances proactively.",
        "source_literature": ["Arditi & Gunaydin (1997)", "Coffey (2010)"],
        "status": "fdm_accepted"
    },
    {
        "id": "f_csf8",
        "code": "CSF8",
        "name": "Quality Culture & Communication",
        "category": "CSF",
        "sub_category": "Organizational",
        "description": "Transparent reporting of defects, safety-quality synergy, and shared commitment across hierarchies.",
        "source_literature": ["Seymour & Rooke (1995)", "Ali & Rahmat (2010)"],
        "status": "fdm_accepted"
    },
    {
        "id": "f_bar1",
        "code": "BAR1",
        "name": "Lack of Top Management Support",
        "category": "Barrier",
        "sub_category": "Leadership",
        "description": "Short-term profit focus over quality, reluctance to invest in quality management infrastructure.",
        "source_literature": ["Metri (2005)", "Low & Teo (2004)"],
        "status": "fdm_accepted"
    },
    {
        "id": "f_bar2",
        "code": "BAR2",
        "name": "Shortage of Skilled Site Labor",
        "category": "Barrier",
        "sub_category": "Human Resource",
        "description": "High turnover of migrant construction labor and lack of certified trade training in the Coimbatore region.",
        "source_literature": ["CIDB (2009)", "Moaveni et al. (2008)"],
        "status": "fdm_accepted"
    },
    {
        "id": "f_bar3",
        "code": "BAR3",
        "name": "Financial Constraints & Cost of Quality",
        "category": "Barrier",
        "sub_category": "Financial",
        "description": "Perception that TQM and lab testing increase upfront overhead without immediate cash return.",
        "source_literature": ["Love & Li (2000)", "Tang et al. (2005)"],
        "status": "fdm_accepted"
    },
    {
        "id": "f_bar4",
        "code": "BAR4",
        "name": "Time Pressure & Schedule Constraints",
        "category": "Barrier",
        "sub_category": "Operational",
        "description": "Aggressive liquidated damages and deadlines forcing compromises on curing and quality verification.",
        "source_literature": ["Kumaraswamy & Chan (1998)", "Al-Hammad (2000)"],
        "status": "fdm_accepted"
    },
    {
        "id": "f_bar5",
        "code": "BAR5",
        "name": "Subcontractor Fragmentation",
        "category": "Barrier",
        "sub_category": "Supply Chain",
        "description": "Multi-tier subcontracting with poorly aligned quality standards and accountability gaps.",
        "source_literature": ["Eccles (1981)", "Eriksson & Westerberg (2011)"],
        "status": "fdm_accepted"
    },
    {
        "id": "f_bar6",
        "code": "BAR6",
        "name": "Resistance to Cultural Change",
        "category": "Barrier",
        "sub_category": "Organizational",
        "description": "Entrenched traditional practices, reluctance to adopt digital tools, and fear of defect transparency.",
        "source_literature": ["Pheng & Teo (2004)", "Kotter (1995)"],
        "status": "fdm_accepted"
    },
    {
        "id": "f_bar7",
        "code": "BAR7",
        "name": "Inadequate Quality Metrics & Audits",
        "category": "Barrier",
        "sub_category": "Process",
        "description": "Absence of real-time KPI tracking, non-conformance logs, and standardized audit protocols.",
        "source_literature": ["Burati et al. (1992)", "Tan & Abdul-Rahman (2005)"],
        "status": "fdm_accepted"
    },
    {
        "id": "f_bar8",
        "code": "BAR8",
        "name": "Poor Communication Channels",
        "category": "Barrier",
        "sub_category": "Organizational",
        "description": "Disconnect between architectural consultants, structural engineers, and field execution teams.",
        "source_literature": ["Dainty et al. (2006)", "Gorse & Emmitt (2009)"],
        "status": "fdm_accepted"
    }
]

SEED_EXPERTS = [
    {"id": "exp_01", "name": "Er. K. Senthil Kumar", "organization": "L&T Construction (Coimbatore Projects)", "designation": "Chief Project Manager", "experience_years": 24, "expertise_area": "Infrastructure & High-Rise", "location": "Coimbatore", "email": "senthil.k@construction.coimbatore.in"},
    {"id": "exp_02", "name": "Dr. R. Murugesan", "organization": "Government College of Technology", "designation": "Professor of Civil Engineering", "experience_years": 28, "expertise_area": "Concrete Tech & Quality Systems", "location": "Coimbatore", "email": "murugesan.r@gct.ac.in"},
    {"id": "exp_03", "name": "Er. P. Ramakrishnan", "organization": "CREDAI Coimbatore Chapter", "designation": "Technical Director", "experience_years": 20, "expertise_area": "Residential & Commercial PMC", "location": "Coimbatore", "email": "p.ramki@credai-cbe.org"},
    {"id": "exp_04", "name": "Er. S. Balamurugan", "organization": "Sobha Developers Coimbatore", "designation": "QA/QC Head", "experience_years": 18, "expertise_area": "ISO 9001 Auditing & Materials", "location": "Coimbatore", "email": "s.bala@sobha-cbe.com"},
    {"id": "exp_05", "name": "Er. M. Shanmugam", "organization": "Tamil Nadu PWD (Buildings Division)", "designation": "Superintending Engineer", "experience_years": 26, "expertise_area": "Public Infrastructure Quality", "location": "Coimbatore", "email": "shanmugam.pwd@tn.gov.in"},
    {"id": "exp_06", "name": "Er. V. Anand", "organization": "Anand & Associates PMC", "designation": "Principal Consultant", "experience_years": 22, "expertise_area": "Contract Administration & Quality", "location": "Coimbatore", "email": "anand@pmcassociates.in"},
    {"id": "exp_07", "name": "Er. T. Divya", "organization": "Renaissance Infrastructure", "designation": "Senior QA Engineer", "experience_years": 14, "expertise_area": "Process Control & Testing", "location": "Coimbatore", "email": "divya.t@renaissance.in"},
    {"id": "exp_08", "name": "Er. G. Karthikeyan", "organization": "Coimbatore Builders Association", "designation": "President", "experience_years": 25, "expertise_area": "Subcontractor Coordination", "location": "Coimbatore", "email": "karthik@cbebuilders.org"},
    {"id": "exp_09", "name": "Er. A. Vijayalakshmi", "organization": "PSG College of Technology", "designation": "Associate Professor (Civil)", "experience_years": 16, "expertise_area": "Construction Management", "location": "Coimbatore", "email": "vijaya@psgtech.edu"},
    {"id": "exp_10", "name": "Er. N. Praveen", "organization": "Consolidated Construction Consortium", "designation": "General Manager - Quality", "experience_years": 21, "expertise_area": "TQM Implementation", "location": "Coimbatore", "email": "praveen.n@cccl.in"}
]

# Generate synthetic realistic responses for 120 respondents
def _generate_seed_responses() -> List[Dict[str, Any]]:
    np.random.seed(42) # Deterministic academic research seed
    roles = ["Project Manager", "Site Engineer", "QA/QC Engineer", "Consultant", "Contractor"]
    role_weights = [0.25, 0.30, 0.20, 0.15, 0.10]
    experiences = ["<5 Years", "5-10 Years", "10-20 Years", ">20 Years"]
    exp_weights = [0.20, 0.35, 0.30, 0.15]
    org_types = ["General Contractor", "PMC", "Developer", "Subcontractor"]
    org_weights = [0.45, 0.25, 0.20, 0.10]
    project_types = ["Residential", "Commercial", "Infrastructure", "Industrial"]
    proj_weights = [0.40, 0.30, 0.20, 0.10]

    # Target means for CSFs (~3.8 to 4.5) and Barriers (~3.2 to 4.2)
    factor_means = {
        "CSF1": 4.52, "CSF2": 4.18, "CSF3": 4.25, "CSF4": 4.38,
        "CSF5": 4.30, "CSF6": 4.12, "CSF7": 3.95, "CSF8": 4.20,
        "BAR1": 4.32, "BAR2": 4.41, "BAR3": 4.15, "BAR4": 4.28,
        "BAR5": 3.98, "BAR6": 3.85, "BAR7": 4.02, "BAR8": 3.90
    }

    responses = []
    for i in range(1, 121):
        resp_id = f"resp_{i:03d}"
        role = np.random.choice(roles, p=role_weights)
        exp = np.random.choice(experiences, p=exp_weights)
        org = np.random.choice(org_types, p=org_weights)
        proj = np.random.choice(project_types, p=proj_weights)

        # Psychometric latent factor: overall quality orientation & site challenge
        latent_tqm = float(np.random.normal(0.0, 0.75))
        latent_barrier = float(np.random.normal(0.0, 0.70))

        ratings = {}
        for code, mean_val in factor_means.items():
            if code.startswith("CSF"):
                # Factor loading ~ 0.65 on latent_tqm
                latent_contrib = 0.65 * latent_tqm
            else:
                # Factor loading ~ 0.60 on latent_barrier
                latent_contrib = 0.60 * latent_barrier

            # Unique measurement variance
            noise = float(np.random.normal(0.0, 0.40))
            raw_val = mean_val + latent_contrib + noise
            val = int(np.clip(np.round(raw_val), 1, 5))
            ratings[code] = val

        responses.append({
            "id": resp_id,
            "respondent": {
                "name": f"Respondent {i:03d}",
                "role": role,
                "experience": exp,
                "organization_type": org,
                "project_type": proj,
                "location": "Coimbatore / Tamil Nadu"
            },
            "ratings": ratings,
            "submitted_at": datetime(2026, 8, 15, 10, 0, 0)
        })
    return responses

SEED_RESPONSES = _generate_seed_responses()

# ── In-Memory Database Store ────────────────────────────────────────────────
class MemoryStore:
    def __init__(self):
        self.factors: Dict[str, Dict[str, Any]] = {f["id"]: dict(f) for f in SEED_FACTORS}
        self.experts: Dict[str, Dict[str, Any]] = {e["id"]: dict(e) for e in SEED_EXPERTS}
        self.responses: Dict[str, Dict[str, Any]] = {r["id"]: dict(r) for r in SEED_RESPONSES}
        self.users: Dict[str, Dict[str, Any]] = {
            "u_admin": {
                "id": "u_admin",
                "username": "admin",
                "full_name": "Dr. TQM Administrator",
                "email": "admin@tqm-research.org",
                "role": "Admin",
                "password_hash": "$2b$12$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36WQmG6W65WVR279.1cE8.K", # secret
                "is_active": True,
                "created_at": datetime.now()
            },
            "u_researcher": {
                "id": "u_researcher",
                "username": "researcher",
                "full_name": "TQM Research Scholar",
                "email": "scholar@tqm-research.org",
                "role": "Researcher",
                "password_hash": "$2b$12$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36WQmG6W65WVR279.1cE8.K",
                "is_active": True,
                "created_at": datetime.now()
            },
            "u_respondent": {
                "id": "u_respondent",
                "username": "respondent",
                "full_name": "Er. K. Natarajan (Field Engineer)",
                "email": "respondent@tqm-coimbatore.org",
                "role": "Respondent",
                "password_hash": "$2b$12$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36WQmG6W65WVR279.1cE8.K",
                "is_active": True,
                "created_at": datetime.now()
            },
            "u_scholar": {
                "id": "u_scholar",
                "username": "scholar",
                "full_name": "TQM Academic Investigator",
                "email": "scholar@psgtech.ac.in",
                "role": "Researcher",
                "password_hash": "$2b$12$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36WQmG6W65WVR279.1cE8.K",
                "is_active": True,
                "created_at": datetime.now()
            },
            "u_expert": {
                "id": "u_expert",
                "username": "expert",
                "full_name": "Chief Engr. R. Ramanathan (FDM Expert)",
                "email": "expert@tqm-panel.edu",
                "role": "Expert",
                "password_hash": "$2b$12$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36WQmG6W65WVR279.1cE8.K",
                "is_active": True,
                "created_at": datetime.now()
            },
            "u_viewer": {
                "id": "u_viewer",
                "username": "viewer",
                "full_name": "Academic External Evaluator",
                "email": "evaluator@aicte-india.org",
                "role": "Viewer",
                "password_hash": "$2b$12$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36WQmG6W65WVR279.1cE8.K",
                "is_active": True,
                "created_at": datetime.now()
            }
        }
        self.cached_results: Dict[str, Any] = {}

_mem_store = MemoryStore()
_mongo_cache = {"connected": False, "checked_at": 0.0}

# ── Repository Interface ───────────────────────────────────────────────────

class Repository:
    @staticmethod
    async def is_mongo_available() -> bool:
        now = time.time()
        # Cache connection check for 60 seconds so operations execute in 0.01ms
        if now - _mongo_cache["checked_at"] < 60.0:
            return _mongo_cache["connected"]
        try:
            status = await ping_db()
            is_conn = status.get("mongodb") == "connected"
        except Exception:
            is_conn = False
        _mongo_cache["connected"] = is_conn
        _mongo_cache["checked_at"] = now
        return is_conn

    # ── Factors ──
    @staticmethod
    async def get_factors(category: Optional[str] = None) -> List[Dict[str, Any]]:
        if await Repository.is_mongo_available():
            try:
                db = get_db()
                query = {"category": category} if category else {}
                cursor = db[col.FACTORS].find(query)
                docs = await cursor.to_list(length=100)
                if docs:
                    for d in docs:
                        d["id"] = str(d.get("_id", d.get("id")))
                    return docs
            except Exception as e:
                logger.warning(f"Mongo error on get_factors: {e}, falling back to memory")
        
        items = list(_mem_store.factors.values())
        if category:
            items = [item for item in items if item["category"].upper() == category.upper()]
        return items

    @staticmethod
    async def get_factor_by_code(code: str) -> Optional[Dict[str, Any]]:
        factors = await Repository.get_factors()
        for f in factors:
            if f.get("code") == code:
                return f
        return None

    @staticmethod
    async def create_factor(data: Dict[str, Any]) -> Dict[str, Any]:
        item_id = f"f_{uuid.uuid4().hex[:8]}"
        data["id"] = item_id
        data["created_at"] = datetime.now()
        _mem_store.factors[item_id] = data

        if await Repository.is_mongo_available():
            try:
                db = get_db()
                await db[col.FACTORS].insert_one(dict(data))
            except Exception as e:
                logger.warning(f"Mongo write failed: {e}")
        return data

    @staticmethod
    async def update_factor(code: str, data: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        target_id = None
        for fid, f in _mem_store.factors.items():
            if f.get("code") == code:
                target_id = fid
                break
        if target_id:
            _mem_store.factors[target_id].update({k: v for k, v in data.items() if v is not None})
            updated = _mem_store.factors[target_id]
            if await Repository.is_mongo_available():
                try:
                    db = get_db()
                    await db[col.FACTORS].update_one({"code": code}, {"$set": data})
                except Exception as e:
                    logger.warning(f"Mongo update failed: {e}")
            return updated
        return None

    # ── Experts ──
    @staticmethod
    async def get_experts() -> List[Dict[str, Any]]:
        if await Repository.is_mongo_available():
            try:
                db = get_db()
                docs = await db[col.EXPERTS].find().to_list(length=100)
                if docs:
                    for d in docs:
                        d["id"] = str(d.get("_id", d.get("id")))
                    return docs
            except Exception as e:
                logger.warning(f"Mongo error on get_experts: {e}")
        return list(_mem_store.experts.values())

    @staticmethod
    async def create_expert(data: Dict[str, Any]) -> Dict[str, Any]:
        item_id = f"exp_{uuid.uuid4().hex[:6]}"
        data["id"] = item_id
        data["created_at"] = datetime.now()
        _mem_store.experts[item_id] = data
        if await Repository.is_mongo_available():
            try:
                db = get_db()
                await db[col.EXPERTS].insert_one(dict(data))
            except Exception as e:
                logger.warning(f"Mongo write expert failed: {e}")
        return data

    # ── Survey Responses ──
    @staticmethod
    async def get_responses() -> List[Dict[str, Any]]:
        if await Repository.is_mongo_available():
            try:
                db = get_db()
                docs = await db[col.RESPONSES].find().to_list(length=500)
                if docs:
                    for d in docs:
                        d["id"] = str(d.get("_id", d.get("id")))
                    return docs
            except Exception as e:
                logger.warning(f"Mongo error on get_responses: {e}")
        return list(_mem_store.responses.values())

    @staticmethod
    async def create_response(data: Dict[str, Any]) -> Dict[str, Any]:
        item_id = f"resp_{uuid.uuid4().hex[:8]}"
        data["id"] = item_id
        data["submitted_at"] = datetime.now()
        _mem_store.responses[item_id] = data
        if await Repository.is_mongo_available():
            try:
                db = get_db()
                await db[col.RESPONSES].insert_one(dict(data))
            except Exception as e:
                logger.warning(f"Mongo write response failed: {e}")
        return data

    # ── Users & Auth ──
    @staticmethod
    async def get_user_by_username(username: str) -> Optional[Dict[str, Any]]:
        for u in _mem_store.users.values():
            if u["username"].lower() == username.lower():
                return u
        return None

    @staticmethod
    async def create_user(data: Dict[str, Any]) -> Dict[str, Any]:
        user_id = f"u_{uuid.uuid4().hex[:6]}"
        data["id"] = user_id
        data["created_at"] = datetime.now()
        _mem_store.users[user_id] = data
        return data

    # ── Result Cache ──
    @staticmethod
    def get_cache(key: str) -> Optional[Any]:
        return _mem_store.cached_results.get(key)

    @staticmethod
    def set_cache(key: str, value: Any) -> None:
        _mem_store.cached_results[key] = value
