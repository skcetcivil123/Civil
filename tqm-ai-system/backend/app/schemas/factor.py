from __future__ import annotations
from typing import Optional, List
from pydantic import BaseModel, Field
from datetime import datetime

class FactorBase(BaseModel):
    code: str = Field(..., description="Unique factor code, e.g. CSF1, BAR1")
    name: str = Field(..., description="Short factor name")
    category: str = Field(..., description="'CSF' or 'Barrier'")
    sub_category: Optional[str] = Field(None, description="E.g. Management, Human Resource, Technical")
    description: str = Field(..., description="Detailed description in construction context")
    source_literature: List[str] = Field(default_factory=list, description="Academic citations")
    status: str = Field(default="active", description="active, fdm_accepted, fdm_rejected, inactive")

class FactorCreate(FactorBase):
    pass

class FactorUpdate(BaseModel):
    name: Optional[str] = None
    category: Optional[str] = None
    sub_category: Optional[str] = None
    description: Optional[str] = None
    source_literature: Optional[List[str]] = None
    status: Optional[str] = None

class FactorOut(FactorBase):
    id: str
    created_at: Optional[datetime] = None
    model_config = {"from_attributes": True}
