from __future__ import annotations
from typing import Optional, List, Dict, Any
from pydantic import BaseModel, Field

class DescriptiveStatItem(BaseModel):
    code: str
    name: str
    category: str
    count: int
    mean: float
    std_dev: float
    variance: float
    skewness: float
    kurtosis: float

class RIIItem(BaseModel):
    rank: int
    code: str
    name: str
    category: str
    rii: float
    tier: str = Field(..., description="High (>=0.80), Medium-High (0.70-0.79), Medium (0.60-0.69), Low (<0.60)")
    sample_size: int

class ReliabilityResult(BaseModel):
    cronbach_alpha: float
    interpretation: str
    items_count: int
    sample_size: int
    item_statistics: List[Dict[str, Any]]

class KMOBartlettResult(BaseModel):
    kmo_overall: float
    kmo_interpretation: str
    item_msa: Dict[str, float]
    bartlett_chi_square: float
    bartlett_df: int
    bartlett_p_value: float
    is_suitable: bool

class EFAResult(BaseModel):
    factors_extracted: int
    variance_explained: List[float]
    total_variance_explained: float
    eigenvalues: List[float]
    factor_names: List[str]
    loadings_matrix: List[Dict[str, Any]]

class ANOVAGroupResult(BaseModel):
    factor_code: str
    factor_name: str
    grouping_variable: str
    f_statistic: float
    p_value: float
    eta_squared: float
    is_significant: bool
    group_means: Dict[str, float]
