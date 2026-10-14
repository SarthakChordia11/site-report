from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any


# ==============================================================================
# Legacy Compatible Models
# ==============================================================================

class DPRSiteInfo(BaseModel):
    project_name: str = ""
    date: str = ""
    location: str = ""
    inspector: str = ""
    progress_pct: int = 0
    weather: str = ""
    client: str = ""
    contractor: str = ""
    report_no: str = ""


class DPRSummary(BaseModel):
    overall_progress: Optional[int] = 0
    workers_today: Optional[int] = 0
    ncrs_raised: Optional[int] = 0
    delay_risk: str = "Low"


class DPRObservation(BaseModel):
    description: str = ""
    area: str = ""
    severity: str = "normal"


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
    status: str = ""


class DPRSafetyCheck(BaseModel):
    item: str = ""
    status: str = "PASS"


class DPRWorkProgress(BaseModel):
    activity: str = ""
    actual_pct: int = 0
    planned_pct: int = 0
    status: str = "On track"


class DPRNCRReport(BaseModel):
    id: str = ""
    title: str = ""
    severity: str = "MINOR"
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


# ==============================================================================
# UNIVERSAL TEMPLATE A: DAILY PROGRESS REPORT (DPR) SECTIONS A1 - A13
# ==============================================================================

class A1AgencyManpower(BaseModel):
    sr_no: Optional[int] = None
    agency_team: str = ""
    work_location_zone: str = ""
    manpower: str = ""
    activity_description: str = ""


class A2ManpowerSummary(BaseModel):
    trade: str = ""
    today: Optional[int] = 0
    yesterday: Optional[int] = 0
    variance: Optional[int] = 0
    remarks: str = ""


class A3MaterialLog(BaseModel):
    material: str = ""
    qty_received: str = ""
    unit: str = ""
    qty_consumed: str = ""
    remarks: str = ""


class A4Equipment(BaseModel):
    equipment: str = ""
    available: Optional[int] = 0
    working: Optional[int] = 0
    idle_breakdown: Optional[int] = 0
    remarks: str = ""


class A5ProductionLog(BaseModel):
    work_location_zone: str = ""
    item_grade_stage: str = ""
    planned_qty: str = ""
    achieved_qty: str = ""
    cumulative_till_date: str = ""


class A6SafetyQuality(BaseModel):
    item: str = ""
    details: str = ""


class A7CriticalIssue(BaseModel):
    sr_no: Optional[int] = None
    issue: str = ""
    raised_on: str = ""
    responsible: str = ""
    target_date: str = ""
    status: str = "Open"


class A8WorkStoppage(BaseModel):
    hours_lost: Optional[float] = 0.0
    reason: str = ""


class A10NextDayPlan(BaseModel):
    work_location_zone: str = ""
    planned_activity: str = ""
    target_quantity: str = ""


class A11AttendanceWage(BaseModel):
    trade: str = ""
    present: Optional[int] = 0
    absent: Optional[int] = 0
    ot_hours: Optional[float] = 0.0
    wage_rate: Optional[float] = 0.0
    amount_payable: Optional[float] = 0.0
    remarks: str = ""


class A12DailyCost(BaseModel):
    cost_head: str = ""
    budgeted_day: Optional[float] = 0.0
    actual_day: Optional[float] = 0.0
    cumulative_budgeted: Optional[float] = 0.0
    cumulative_actual: Optional[float] = 0.0
    variance: Optional[float] = 0.0


class A13ResourceForecast(BaseModel):
    resource_type: str = ""
    item: str = ""
    required_qty: str = ""
    available: str = ""
    shortfall: str = ""
    action_owner: str = ""


# ==============================================================================
# UNIVERSAL TEMPLATE B: WEEKLY PROGRESS REPORT (WPR) SECTIONS B1 - B14
# ==============================================================================

class B1ExecutiveSummary(BaseModel):
    highlights: List[str] = []
    milestones: List[str] = []


class B2ZoneProgress(BaseModel):
    work_location_zone: str = ""
    activity_stage: str = ""
    planned_pct_till_date: int = 0
    achieved_pct_till_date: int = 0
    variance: int = 0
    remarks: str = ""


class B3QuantityProgress(BaseModel):
    activity: str = ""
    unit: str = ""
    planned_week: str = ""
    achieved_week: str = ""
    cumulative_planned: str = ""
    cumulative_achieved: str = ""
    pct_achievement: str = ""


class B4ManpowerTrend(BaseModel):
    trade: str = ""
    mon: int = 0
    tue: int = 0
    wed: int = 0
    thu: int = 0
    fri: int = 0
    sat: int = 0
    sun: int = 0
    avg: float = 0.0


class B5MaterialSummary(BaseModel):
    material: str = ""
    opening_stock: str = ""
    received_this_week: str = ""
    consumed_this_week: str = ""
    closing_stock: str = ""


class B6EquipmentUtilization(BaseModel):
    equipment: str = ""
    available: int = 0
    avg_working: float = 0.0
    idle_days: int = 0
    remarks: str = ""


class B7SafetyQualitySummary(BaseModel):
    item: str = ""
    details: str = ""


class B8DelayCriticalPath(BaseModel):
    issue: str = ""
    impact_on_schedule: str = ""
    responsible: str = ""
    target_resolution: str = ""


class B10NextWeekForecast(BaseModel):
    work_location_zone: str = ""
    planned_activity: str = ""
    target_quantity: str = ""


class B11LabourWageSummary(BaseModel):
    trade: str = ""
    man_days_week: float = 0.0
    avg_daily_strength: float = 0.0
    total_wages_paid: float = 0.0
    remarks: str = ""


class B12WeeklyCost(BaseModel):
    cost_head: str = ""
    budgeted_week: float = 0.0
    actual_week: float = 0.0
    cumulative_budgeted: float = 0.0
    cumulative_actual: float = 0.0
    variance: float = 0.0


class B13ResourcePlanning(BaseModel):
    resource_type: str = ""
    item: str = ""
    required_qty: str = ""
    available: str = ""
    shortfall: str = ""
    action_owner: str = ""


class B14ManagementSummary(BaseModel):
    sr_no: Optional[int] = None
    item: str = ""
    category: str = ""
    owner: str = ""
    status: str = "Pending"
    target_date: str = ""


class UniversalWPRReport(BaseModel):
    report_type: str = "Weekly"
    project_name: str = ""
    week_no: str = ""
    location: str = ""
    week_period: str = ""
    client: str = ""
    prepared_by: str = ""
    contractor_pmc: str = ""
    b1_executive_summary: B1ExecutiveSummary = Field(default_factory=B1ExecutiveSummary)
    b2_zone_progress: List[B2ZoneProgress] = []
    b3_quantities: List[B3QuantityProgress] = []
    b4_manpower_trend: List[B4ManpowerTrend] = []
    b5_materials: List[B5MaterialSummary] = []
    b6_equipment: List[B6EquipmentUtilization] = []
    b7_safety_quality: List[B7SafetyQualitySummary] = []
    b8_delays: List[B8DelayCriticalPath] = []
    b10_next_week_forecast: List[B10NextWeekForecast] = []
    b11_labour_wages: List[B11LabourWageSummary] = []
    b12_cost_tracking: List[B12WeeklyCost] = []
    b13_resource_planning: List[B13ResourcePlanning] = []
    b14_management_summary: List[B14ManagementSummary] = []


# ==============================================================================
# UNIVERSAL TEMPLATE C: MONTHLY PROGRESS REPORT (MPR) SECTIONS C1 - C15
# ==============================================================================

class C1DisciplineSummary(BaseModel):
    discipline_location: str = ""
    status_summary: str = ""


class C2ProjectProgress(BaseModel):
    planned_pct_cumulative: int = 0
    achieved_pct_cumulative: int = 0
    delay_lead_days: int = 0


class C3ValueOfWork(BaseModel):
    sr_no: Optional[int] = None
    description: str = ""
    target_month: str = ""
    achieved_month: str = ""
    cumulative_achieved: str = ""


class C4ZoneQuantityProgress(BaseModel):
    work_location_zone: str = ""
    planned_quantity: str = ""
    actual_quantity: str = ""
    pct_achievement: str = ""
    remarks: str = ""


class C5MaterialReconciliation(BaseModel):
    material: str = ""
    opening: str = ""
    received_month: str = ""
    consumed_month: str = ""
    closing_balance: str = ""
    wastage_pct: float = 0.0


class C6EquipmentDeployment(BaseModel):
    equipment: str = ""
    required: int = 0
    deployed_avg: float = 0.0
    utilization_pct: float = 0.0
    remarks: str = ""


class C7SafetyPerformance(BaseModel):
    item: str = ""
    details: str = ""


class C8QualityPerformance(BaseModel):
    item: str = ""
    details: str = ""


class C9CriticalRisk(BaseModel):
    sr_no: Optional[int] = None
    issue: str = ""
    impact: str = ""
    mitigation_action: str = ""
    responsible: str = ""
    target_date: str = ""


class C10NextMonthForecast(BaseModel):
    work_location_zone: str = ""
    planned_activity: str = ""
    planned_quantity: str = ""
    target_milestone_date: str = ""


class C12LabourPayroll(BaseModel):
    trade: str = ""
    man_days_month: float = 0.0
    avg_daily_strength: float = 0.0
    total_wages_paid: float = 0.0
    remarks: str = ""


class C13MonthlyCost(BaseModel):
    cost_head: str = ""
    budgeted_month: float = 0.0
    actual_month: float = 0.0
    cumulative_budgeted: float = 0.0
    cumulative_actual: float = 0.0
    variance: float = 0.0


class C14NextMonthResource(BaseModel):
    resource_type: str = ""
    item: str = ""
    required_qty: str = ""
    available: str = ""
    shortfall: str = ""
    action_owner: str = ""


class C15ManagementAction(BaseModel):
    sr_no: Optional[int] = None
    item: str = ""
    category: str = ""
    owner: str = ""
    status: str = "Pending"
    target_date: str = ""


class UniversalMPRReport(BaseModel):
    report_type: str = "Monthly"
    project_name: str = ""
    project_code: str = ""
    location: str = ""
    month_considered: str = ""
    client: str = ""
    report_no: str = ""
    contractor_pmc: str = ""
    status_date: str = ""
    c1_executive_summary: List[C1DisciplineSummary] = []
    c2_project_progress: C2ProjectProgress = Field(default_factory=C2ProjectProgress)
    c3_value_of_work: List[C3ValueOfWork] = []
    c4_zone_progress: List[C4ZoneQuantityProgress] = []
    c5_materials: List[C5MaterialReconciliation] = []
    c6_equipment: List[C6EquipmentDeployment] = []
    c7_safety: List[C7SafetyPerformance] = []
    c8_quality: List[C8QualityPerformance] = []
    c9_risks: List[C9CriticalRisk] = []
    c10_next_month_forecast: List[C10NextMonthForecast] = []
    c12_payroll: List[C12LabourPayroll] = []
    c13_cost_report: List[C13MonthlyCost] = []
    c14_resource_planning: List[C14NextMonthResource] = []
    c15_management_summary: List[C15ManagementAction] = []


# ==============================================================================
# FULL UNIFIED DPR REPORT MODEL (Includes Universal A1-A13 + Backward Compatibility)
# ==============================================================================

class DPRFullReport(BaseModel):
    # Header & Meta
    site_info: Optional[DPRSiteInfo] = Field(default_factory=DPRSiteInfo)
    summary: Optional[DPRSummary] = Field(default_factory=DPRSummary)
    report_type: str = "Daily"
    cautions: List[str] = []
    observations: List[DPRObservation] = []

    # Legacy fields (for backward compatibility)
    labour: List[DPRLabourEntry] = []
    materials: List[DPRMaterialEntry] = []
    safety: List[DPRSafetyCheck] = []
    work_progress: List[DPRWorkProgress] = []
    ncr_reports: List[DPRNCRReport] = []
    delay_risk: DPRDelayRisk = Field(default_factory=DPRDelayRisk)
    is_codes: List[DPRISCodeRef] = []
    recommended_actions: List[DPRRecommendedAction] = []

    # Universal A1 - A13 Sections
    a1_agency_manpower: List[A1AgencyManpower] = []
    a2_manpower_summary: List[A2ManpowerSummary] = []
    a3_materials: List[A3MaterialLog] = []
    a4_equipment: List[A4Equipment] = []
    a5_production_log: List[A5ProductionLog] = []
    a6_safety_quality: List[A6SafetyQuality] = []
    a7_critical_issues: List[A7CriticalIssue] = []
    a8_work_stoppage: Optional[A8WorkStoppage] = None
    a10_next_day_plan: List[A10NextDayPlan] = []
    a11_attendance_wages: List[A11AttendanceWage] = []
    a12_daily_cost: List[A12DailyCost] = []
    a13_resource_forecast: List[A13ResourceForecast] = []

    # Optional nested Weekly (WPR) and Monthly (MPR) structures if report_type is Weekly/Monthly
    wpr_data: Optional[UniversalWPRReport] = None
    mpr_data: Optional[UniversalMPRReport] = None


UniversalDPRReport = DPRFullReport
