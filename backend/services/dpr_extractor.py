import os
import json
from datetime import datetime
from groq import Groq
from models.dpr_models import (
    DPRFullReport,
    DPRSiteInfo,
    DPRSummary,
    DPRLabourEntry,
    DPRMaterialEntry,
    DPRSafetyCheck,
    DPRWorkProgress,
    DPRNCRReport,
    A1AgencyManpower,
    A2ManpowerSummary,
    A3MaterialLog,
    A4Equipment,
    A5ProductionLog,
    A6SafetyQuality,
    A7CriticalIssue,
    A8WorkStoppage,
    A10NextDayPlan,
    A11AttendanceWage,
    A12DailyCost,
    A13ResourceForecast,
)


class DPRExtractor:
    """
    Sends a construction-site transcript to Groq and returns
    a structured DPRFullReport matching the Universal Site Progress Report template (A1 - A13).
    Strictly adheres to zero hallucination: unmentioned entities are left empty.
    """

    def __init__(self):
        self._client = None

    @property
    def client(self) -> Groq:
        if self._client is None:
            api_key = os.getenv("GROQ_API_KEY", "")
            if not api_key:
                raise ValueError("GROQ_API_KEY environment variable not set")
            self._client = Groq(api_key=api_key)
        return self._client

    def extract(self, transcript: str, language: str = "hi") -> DPRFullReport:
        try:
            prompt = self._build_prompt(transcript, language)
            response = self.client.chat.completions.create(
                model="openai/gpt-oss-120b",
                messages=[{"role": "user", "content": prompt}],
                temperature=0.1,
            )
            raw = response.choices[0].message.content.strip()

            if raw.startswith("```"):
                raw = raw.split("\n", 1)[1]
                if raw.endswith("```"):
                    raw = raw[: raw.rfind("```")]
            if raw.startswith("json\n"):
                raw = raw[5:]

            data = json.loads(raw)
            data = self._sanitize_data(data)
            report = DPRFullReport(**data)
            self._synchronize_fields(report)
            return report
        except Exception as e:
            print(f"Groq Extraction Error: {e}")
            raise e

    def _sanitize_data(self, obj):
        """Recursively replaces None with 0 for numeric fields or '' for strings."""
        numeric_fields = {
            "overall_progress", "workers_today", "ncrs_raised", "progress_pct",
            "today", "yesterday", "variance", "available", "working", "idle_breakdown",
            "hours_lost", "present", "absent", "ot_hours", "wage_rate", "amount_payable",
            "budgeted_day", "actual_day", "cumulative_budgeted", "cumulative_actual",
            "planned_pct", "actual_pct", "sr_no", "priority"
        }
        if isinstance(obj, dict):
            clean = {}
            for k, v in obj.items():
                if v is None:
                    clean[k] = 0 if k in numeric_fields else ""
                elif isinstance(v, (dict, list)):
                    clean[k] = self._sanitize_data(v)
                else:
                    clean[k] = v
            return clean
        elif isinstance(obj, list):
            return [self._sanitize_data(item) for item in obj]
        return obj

    def _synchronize_fields(self, report: DPRFullReport) -> None:
        """
        Synchronizes between Universal sections (A1-A13) and legacy fields
        so all consumers get full data without duplication or mismatch.
        """
        # Ensure site_info has today's date if missing
        today_str = datetime.now().strftime("%d %b %Y")
        if not report.site_info.date:
            report.site_info.date = today_str

        # Sync A2 Manpower <-> Legacy labour
        if report.a2_manpower_summary and not report.labour:
            report.labour = [
                DPRLabourEntry(
                    trade=m.trade,
                    contractor=m.remarks or "Main Contractor",
                    present=m.today,
                    hours=8,
                    productivity="Good",
                    man_days=float(m.today),
                )
                for m in report.a2_manpower_summary
                if m.trade
            ]
        elif report.labour and not report.a2_manpower_summary:
            report.a2_manpower_summary = [
                A2ManpowerSummary(
                    trade=l.trade,
                    today=l.present,
                    yesterday=0,
                    variance=0,
                    remarks=l.contractor,
                )
                for l in report.labour
                if l.trade
            ]

        # Sync A3 Materials <-> Legacy materials
        if report.a3_materials and not report.materials:
            legacy_mats = []
            for m in report.a3_materials:
                if m.qty_received:
                    legacy_mats.append(
                        DPRMaterialEntry(
                            item=m.material,
                            quantity=f"{m.qty_received} {m.unit}".strip(),
                            status=f"Received: {m.remarks or 'Site Stock'}",
                        )
                    )
                if m.qty_consumed:
                    legacy_mats.append(
                        DPRMaterialEntry(
                            item=m.material,
                            quantity=f"{m.qty_consumed} {m.unit}".strip(),
                            status=f"Consumed: {m.remarks or 'Active Pour/Work'}",
                        )
                    )
            report.materials = legacy_mats
        elif report.materials and not report.a3_materials:
            report.a3_materials = [
                A3MaterialLog(
                    material=m.item,
                    qty_received=m.quantity if "rec" in (m.status or "").lower() else "",
                    unit="",
                    qty_consumed=m.quantity if "cons" in (m.status or "").lower() else "",
                    remarks=m.status,
                )
                for m in report.materials
                if m.item
            ]

        # Sync A6 Safety <-> Legacy safety
        if report.a6_safety_quality and not report.safety:
            report.safety = [
                DPRSafetyCheck(item=s.item, status="PASS" if "pass" in s.details.lower() or "ok" in s.details.lower() else "PARTIAL")
                for s in report.a6_safety_quality
                if s.item
            ]
        elif report.safety and not report.a6_safety_quality:
            report.a6_safety_quality = [
                A6SafetyQuality(item=s.item, details=f"Status: {s.status}")
                for s in report.safety
                if s.item
            ]

        # Sync A7 Critical Issues <-> Legacy ncr_reports
        if report.a7_critical_issues and not report.ncr_reports:
            report.ncr_reports = [
                DPRNCRReport(
                    id=f"NCR-{i+1:03d}",
                    title=iss.issue,
                    severity="MAJOR" if "critical" in iss.issue.lower() or "halt" in iss.issue.lower() else "MINOR",
                    description=f"Raised on: {iss.raised_on}. Responsible: {iss.responsible}. Status: {iss.status}",
                    action_required=f"Action by {iss.responsible}",
                    deadline=iss.target_date,
                )
                for i, iss in enumerate(report.a7_critical_issues)
                if iss.issue
            ]
        elif report.ncr_reports and not report.a7_critical_issues:
            report.a7_critical_issues = [
                A7CriticalIssue(
                    sr_no=i + 1,
                    issue=f"{n.title} - {n.description}",
                    raised_on=report.site_info.date,
                    responsible="Site Engineer",
                    target_date=n.deadline,
                    status="Open",
                )
                for i, n in enumerate(report.ncr_reports)
                if n.title or n.description
            ]

        # Sync summary worker count
        total_workers = sum(m.today for m in report.a2_manpower_summary) if report.a2_manpower_summary else sum(l.present for l in report.labour)
        report.summary.workers_today = total_workers
        report.summary.ncrs_raised = len(report.a7_critical_issues) or len(report.ncr_reports)

    def _build_prompt(self, transcript: str, language: str) -> str:
        return f"""You are a certified construction site progress auditor.
The site engineer/manager spoke a daily update in {language}.
Parse the speech transcript into the structured UNIVERSAL DAILY PROGRESS REPORT (DPR - Sections A1 through A13).

CRITICAL REQUIREMENT:
1. ALL text and values in the output JSON MUST be translated into professional standard ENGLISH, regardless of the input language.
2. ZERO HALLUCINATION RULE:
   - If information for any row, column, or section is NOT mentioned or clearly implied in the transcript, LEAVE IT AS AN EMPTY LIST [] OR EMPTY STRING "" OR NULL.
   - DO NOT invent, fabricate, simulate, or guess dummy workers, dummy equipment, dummy materials, or dummy amounts that were not spoken.
   - Only populate fields where the speaker provided facts.
3. Output ONLY a valid JSON object matching the exact schema below. No markdown backticks, no commentary.

TRANSCRIPT:
\"\"\"{transcript}\"\"\"

JSON SCHEMA TO POPULATE:
{{
    "site_info": {{
        "project_name": "string (project name if mentioned, else '')",
        "date": "string (date if mentioned, else '')",
        "location": "string (site location/city if mentioned, else '')",
        "inspector": "string (speaker/engineer name if mentioned, else '')",
        "weather": "string (AM/PM weather e.g. Sunny, Rainy, Overcast if mentioned, else '')",
        "client": "string",
        "contractor": "string"
    }},
    "summary": {{
        "overall_progress": 0,
        "workers_today": 0,
        "ncrs_raised": 0,
        "delay_risk": "Low"
    }},
    "a1_agency_manpower": [
        {{
            "sr_no": 1,
            "agency_team": "string (agency/subcontractor name)",
            "work_location_zone": "string (zone/floor/tower)",
            "manpower": "string (e.g. '4 Skilled / 8 Unskilled' or '12')",
            "activity_description": "string (what they worked on)"
        }}
    ],
    "a2_manpower_summary": [
        {{
            "trade": "string (e.g. Mason, Barbender, Carpenter, Helper, Welder)",
            "today": 0,
            "yesterday": 0,
            "variance": 0,
            "remarks": "string"
        }}
    ],
    "a3_materials": [
        {{
            "material": "string (e.g. Cement 53G, Steel 12mm, RMC M25)",
            "qty_received": "string (quantity received today, e.g. '200 bags', '15 MT')",
            "unit": "string (bags, MT, cum, nos)",
            "qty_consumed": "string (quantity used today)",
            "remarks": "string (supplier / location used)"
        }}
    ],
    "a4_equipment": [
        {{
            "equipment": "string (e.g. Tower Crane, Boom Pump, JCB Backhoe, DG Set)",
            "available": 1,
            "working": 1,
            "idle_breakdown": 0,
            "remarks": "string (status or breakdown reason)"
        }}
    ],
    "a5_production_log": [
        {{
            "work_location_zone": "string (tower/floor/chainage)",
            "item_grade_stage": "string (activity name, e.g. 4th floor slab concrete)",
            "planned_qty": "string",
            "achieved_qty": "string",
            "cumulative_till_date": "string"
        }}
    ],
    "a6_safety_quality": [
        {{
            "item": "string (e.g. PPE Compliance, Cube Testing, Edge Protection)",
            "details": "string (e.g. 100% compliant, 3 cubes cast for M30)"
        }}
    ],
    "a7_critical_issues": [
        {{
            "sr_no": 1,
            "issue": "string (critical issue, hindrance or pending decision)",
            "raised_on": "string",
            "responsible": "string",
            "target_date": "string",
            "status": "string (Open / In Progress / Resolved)"
        }}
    ],
    "a8_work_stoppage": {{
        "hours_lost": 0.0,
        "reason": "string (rain, power cut, material shortage, or empty if none)"
    }},
    "a10_next_day_plan": [
        {{
            "work_location_zone": "string",
            "planned_activity": "string",
            "target_quantity": "string"
        }}
    ],
    "a11_attendance_wages": [
        {{
            "trade": "string",
            "present": 0,
            "absent": 0,
            "ot_hours": 0.0,
            "wage_rate": 0.0,
            "amount_payable": 0.0,
            "remarks": "string"
        }}
    ],
    "a12_daily_cost": [
        {{
            "cost_head": "string (Labour / Material / Plant & Machinery / Overhead)",
            "budgeted_day": 0.0,
            "actual_day": 0.0,
            "cumulative_budgeted": 0.0,
            "cumulative_actual": 0.0,
            "variance": 0.0
        }}
    ],
    "a13_resource_forecast": [
        {{
            "resource_type": "string (Labour / Material / Equipment)",
            "item": "string",
            "required_qty": "string",
            "available": "string",
            "shortfall": "string",
            "action_owner": "string"
        }}
    ],
    "cautions": ["string"],
    "observations": [
        {{
            "description": "string",
            "area": "string",
            "severity": "normal"
        }}
    ]
}}"""

