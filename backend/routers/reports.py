import uuid
from typing import Any, Optional
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.orm import Session

from database import get_db
from models.report import SiteReport
from models.user import User
from services.auth_utils import get_current_user


router = APIRouter(prefix="/api/reports", tags=["reports"], dependencies=[Depends(get_current_user)])


class ReportIn(BaseModel):
    site_id: str
    name: str
    project_name: str = ""
    report_date: str = ""
    report_type: str = "Daily"
    status: str = "Completed"
    author: str = ""
    summary: str = ""
    trades_present_count: int = 0
    critical_issues_count: int = 0
    materials_received_summary: str = ""
    equipment_uptime_percent: int = 0
    evm_status: str = ""
    voice_transcript: Optional[str] = None
    extracted_data: Optional[dict[str, Any]] = None


def serialize(report: SiteReport) -> dict:
    rep_type = getattr(report, "report_type", "Daily") or "Daily"
    return {
        "id": report.id,
        "site_id": report.site_id,
        "siteId": report.site_id,
        "name": report.name,
        "project_name": report.project_name,
        "projectName": report.project_name,
        "date": report.report_date,
        "report_date": report.report_date,
        "report_type": rep_type,
        "reportType": rep_type,
        "status": report.status,
        "author": report.author,
        "summary": report.summary,
        "trades_present_count": report.trades_present_count,
        "tradesPresentCount": report.trades_present_count,
        "critical_issues_count": report.critical_issues_count,
        "criticalIssuesCount": report.critical_issues_count,
        "materials_received_summary": report.materials_received_summary,
        "materialsReceivedSummary": report.materials_received_summary,
        "equipment_uptime_percent": report.equipment_uptime_percent,
        "equipmentUptimePercent": report.equipment_uptime_percent,
        "evm_status": report.evm_status,
        "evmStatus": report.evm_status,
        "voice_transcript": report.voice_transcript,
        "extracted_data": report.extracted_data,
        "extractedData": report.extracted_data,
        "created_at": report.created_at.isoformat() if report.created_at else None,
    }


@router.get("")
def list_reports(site_id: str, db: Session = Depends(get_db)):
    rows = db.query(SiteReport).filter(SiteReport.site_id == site_id).order_by(SiteReport.created_at.desc()).all()
    return [serialize(row) for row in rows]


@router.post("", status_code=201)
def create_report(data: ReportIn, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    data_dict = data.model_dump()
    author = data_dict.pop("author", "") or current_user.name
    report = SiteReport(
        id=str(uuid.uuid4()), author_id=current_user.id,
        author=author, **data_dict
    )
    db.add(report)
    db.commit()
    db.refresh(report)

    # Sync to modules
    try:
        if report.extracted_data and "fullReport" in report.extracted_data:
            from models.dpr_models import DPRFullReport
            from routers.dpr import _sync_dpr_to_modules
            dpr = DPRFullReport(**report.extracted_data["fullReport"])
            _sync_dpr_to_modules(dpr, report.site_id, db)
            db.commit()
    except Exception as e:
        print("Sync error:", e)
        db.rollback()

    # Trigger rollups
    try:
        from services.rollup import trigger_rollups
        trigger_rollups(data.site_id, db, current_user.id, author)
    except Exception as e:
        print("Rollup error:", e)

    return serialize(report)


@router.post("/trigger-rollup")
def trigger_rollup_endpoint(
    site_id: str,
    rollup_type: str = "Weekly",
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Manually triggers generation of a Weekly or Monthly progress report
    from existing daily records.
    """
    from services.rollup import trigger_rollups
    force_w = rollup_type in ("Weekly", "All")
    force_m = rollup_type in ("Monthly", "All")
    result = trigger_rollups(
        site_id=site_id,
        db=db,
        current_user_id=current_user.id,
        author_name=current_user.name or "Site Engineer",
        force_weekly=force_w,
        force_monthly=force_m,
    )
    # Return updated list of reports
    rows = db.query(SiteReport).filter(SiteReport.site_id == site_id).order_by(SiteReport.created_at.desc()).all()
    return {
        "success": True,
        "rollup_result": result,
        "reports": [serialize(row) for row in rows],
    }


@router.delete("/{report_id}")
def delete_report(report_id: str, db: Session = Depends(get_db)):
    report = db.query(SiteReport).filter(SiteReport.id == report_id).first()
    if not report:
        raise HTTPException(404, "Report not found")
    db.delete(report)
    db.commit()
    return {"ok": True}
