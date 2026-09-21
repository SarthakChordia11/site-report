from pydantic import BaseModel, Field
from typing import Optional, List


class DPRSiteInfo(BaseModel):
    project_name: str = ""
    date: str = ""
    location: str = ""
    inspector: str = ""
    progress_pct: int = 0
    weather: str = ""


class DPRSummary(BaseModel):
    overall_progress: int = 0
    workers_today: int = 0
    ncrs_raised: int = 0
    delay_risk: str = "Low"


class DPRObservation(BaseModel):
    description: str = ""
    area: str = ""
    severity: str = "normal"  # normal, warning, error


class DPRLabourEntry(BaseModel):
    trade: str = ""
    contractor: str = ""
    present: int = 0
    hours: int = 8
    productivity: str = "Good"
    man_days: float = 0.0


class DPRMaterialEntry(BaseModel):
    item: str = ""
    quantity: str = ""
    status: str = ""  # Received, Consumed, Shortage


class DPRSafetyCheck(BaseModel):
    item: str = ""
    status: str = "PASS"  # PASS, FAIL, PARTIAL


class DPRWorkProgress(BaseModel):
    activity: str = ""
    actual_pct: int = 0
    planned_pct: int = 0
    status: str = "On track"


class DPRNCRReport(BaseModel):
    id: str = ""
    title: str = ""
    severity: str = "MINOR"  # MAJOR, MINOR
    description: str = ""
    action_required: str = ""
    deadline: str = ""


class DPRDelayRisk(BaseModel):
    probability: str = ""
    risk_level: str = "Low"
    risk_pct: int = 0
    causes: List[str] = []
    preventive_measures: List[str] = []


class DPRISCodeRef(BaseModel):
    code: str = ""
    description: str = ""


class DPRRecommendedAction(BaseModel):
    priority: int = 0
    action: str = ""


class DPRFullReport(BaseModel):
    site_info: Optional[DPRSiteInfo] = Field(default_factory=DPRSiteInfo)
    summary: Optional[DPRSummary] = Field(default_factory=DPRSummary)
    report_type: str = "Daily"
    cautions: List[str] = []
    observations: List[DPRObservation] = []
    labour: List[DPRLabourEntry] = []
    materials: List[DPRMaterialEntry] = []
    safety: List[DPRSafetyCheck] = []
    work_progress: List[DPRWorkProgress] = []
    ncr_reports: List[DPRNCRReport] = []
    delay_risk: DPRDelayRisk = Field(default_factory=DPRDelayRisk)
    is_codes: List[DPRISCodeRef] = []
    recommended_actions: List[DPRRecommendedAction] = []
