from __future__ import annotations
from typing import Optional, List
from pydantic import BaseModel, Field
from datetime import datetime

class UserBase(BaseModel):
    username: str
    email: str = Field(default="user@tqm.edu", description="User email")
    full_name: str
    role: str = Field(default="Viewer", description="Admin, Researcher, Respondent, Viewer")
    is_active: bool = True

class UserCreate(UserBase):
    password: str

class UserLogin(BaseModel):
    username: str
    password: str

class UserOut(UserBase):
    id: str
    created_at: Optional[datetime] = None

class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
    role: str
    user: UserOut

class TokenData(BaseModel):
    username: Optional[str] = None
    role: Optional[str] = None
