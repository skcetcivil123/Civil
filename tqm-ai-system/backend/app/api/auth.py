"""
Authentication API Router — JWT Token Issuance and RBAC.
Roles: Admin, Researcher, Respondent, Expert, Viewer.
Standard demo credentials:
  - admin       / secret
  - researcher  / secret
  - respondent  / secret
  - scholar     / secret
  - expert      / secret
  - viewer      / secret
"""
from __future__ import annotations
from datetime import datetime, timedelta
from typing import Optional, List, Dict, Any
from fastapi import APIRouter, HTTPException, Depends, Request, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from jose import jwt, JWTError
from passlib.context import CryptContext

from app.config import get_settings
from app.database.repository import Repository
from app.schemas.auth import UserCreate, UserLogin, UserOut, Token

settings = get_settings()
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
security = HTTPBearer(auto_error=False)

router = APIRouter(prefix="/api/auth", tags=["Authentication & RBAC"])

DEMO_PROFILES: Dict[str, Dict[str, Any]] = {
    "admin": {
        "id": "u_admin",
        "username": "admin",
        "full_name": "Dr. TQM Administrator",
        "email": "admin@tqm-research.org",
        "role": "Admin",
        "description": "Full analytical & system access: modify factors, train models, adjust weights, purge data",
        "password": "secret",
        "is_active": True
    },
    "researcher": {
        "id": "u_researcher",
        "username": "researcher",
        "full_name": "TQM Research Scholar",
        "email": "scholar@tqm-research.org",
        "role": "Researcher",
        "description": "Analytical permissions: FDM calculation, RII ranking, Cronbach Alpha, KMO/EFA, ANOVA, SHAP, viva defense",
        "password": "secret",
        "is_active": True
    },
    "respondent": {
        "id": "u_respondent",
        "username": "respondent",
        "full_name": "Er. K. Natarajan (Field Engineer)",
        "email": "respondent@tqm-coimbatore.org",
        "role": "Respondent",
        "description": "Field construction professional: 5-point Likert questionnaire participation & response review",
        "password": "secret",
        "is_active": True
    },
    "scholar": {
        "id": "u_scholar",
        "username": "scholar",
        "full_name": "TQM Academic Investigator",
        "email": "scholar@psgtech.ac.in",
        "role": "Researcher",
        "description": "Academic investigator conducting empirical TQM research in Coimbatore construction projects",
        "password": "secret",
        "is_active": True
    },
    "expert": {
        "id": "u_expert",
        "username": "expert",
        "full_name": "Chief Engr. R. Ramanathan (FDM Expert)",
        "email": "expert@tqm-panel.edu",
        "role": "Expert",
        "description": "FDM expert panel member: evaluate TQM success factors & barriers with triangular fuzzy numbers",
        "password": "secret",
        "is_active": True
    },
    "viewer": {
        "id": "u_viewer",
        "username": "viewer",
        "full_name": "Academic External Evaluator",
        "email": "evaluator@aicte-india.org",
        "role": "Viewer",
        "description": "Read-only audit: explore dashboard, empirical statistics, 4-tier framework, and recommendations",
        "password": "secret",
        "is_active": True
    }
}

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    to_encode = data.copy()
    expire = datetime.utcnow() + (expires_delta or timedelta(minutes=settings.jwt_access_token_expire_minutes))
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, settings.jwt_secret, algorithm=settings.jwt_algorithm)

@router.get("/credentials", response_model=List[Dict[str, Any]])
async def get_demo_credentials():
    """Retrieve all pre-configured login profiles and demo credentials for easy login."""
    return [
        {
            "username": u["username"],
            "password": u["password"],
            "role": u["role"],
            "full_name": u["full_name"],
            "email": u["email"],
            "description": u["description"],
        }
        for u in DEMO_PROFILES.values()
    ]

@router.post("/login", response_model=Token)
async def login(payload: UserLogin):
    """Authenticate and obtain JWT bearer token."""
    username_lower = payload.username.strip().lower()
    user = await Repository.get_user_by_username(username_lower)
    
    # Check against demo profiles if not found in db
    if not user and username_lower in DEMO_PROFILES:
        user = DEMO_PROFILES[username_lower]

    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"User '{payload.username}' not found. Please use one of the demo accounts: admin, researcher, respondent, scholar, expert, viewer (password: secret)."
        )

    # Password validation:
    # 1. Standard demo password "secret" or "<role>123" or "password"
    # 2. Or bcrypt hash match if stored
    valid_password = False
    if payload.password in ["secret", f"{username_lower}123", "password", "admin123"]:
        valid_password = True
    elif user.get("password_hash"):
        try:
            valid_password = pwd_context.verify(payload.password, user["password_hash"])
        except Exception:
            valid_password = False

    if not valid_password:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid password. The standard password for all accounts is: secret"
        )

    token = create_access_token(data={"sub": user["username"], "role": user.get("role", "Viewer")})
    user_out = UserOut(
        id=user["id"],
        username=user["username"],
        email=user.get("email", f"{user['username']}@tqm.edu"),
        full_name=user.get("full_name", user["username"].capitalize()),
        role=user.get("role", "Viewer"),
        is_active=user.get("is_active", True)
    )
    return Token(access_token=token, token_type="bearer", role=user_out.role, user=user_out)

@router.post("/register", response_model=UserOut, status_code=status.HTTP_201_CREATED)
async def register(payload: UserCreate):
    """Register a new research scholar or respondent."""
    existing = await Repository.get_user_by_username(payload.username)
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Username '{payload.username}' is already registered."
        )
    data = payload.model_dump()
    data["password_hash"] = pwd_context.hash(payload.password)
    del data["password"]
    created = await Repository.create_user(data)
    return UserOut(**created)

@router.get("/me", response_model=UserOut)
async def get_current_user(credentials: Optional[HTTPAuthorizationCredentials] = Depends(security)):
    """Retrieve demo/current session info using JWT Bearer token if provided."""
    if credentials and credentials.credentials:
        try:
            payload = jwt.decode(credentials.credentials, settings.jwt_secret, algorithms=[settings.jwt_algorithm])
            username = payload.get("sub")
            if username:
                user = await Repository.get_user_by_username(username)
                if not user and username.lower() in DEMO_PROFILES:
                    user = DEMO_PROFILES[username.lower()]
                if user:
                    return UserOut(
                        id=user["id"],
                        username=user["username"],
                        email=user.get("email", f"{username}@tqm.edu"),
                        full_name=user.get("full_name", username.capitalize()),
                        role=user.get("role", payload.get("role", "Viewer")),
                        is_active=user.get("is_active", True)
                    )
        except JWTError:
            pass

    # Default session fallback
    user = await Repository.get_user_by_username("researcher")
    if not user:
        user = DEMO_PROFILES["researcher"]
    return UserOut(**user)
