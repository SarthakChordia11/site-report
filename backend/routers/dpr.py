import os
import re
import uuid
from datetime import date
from fastapi import APIRouter, UploadFile, File, HTTPException, Depends
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session
from database import get_db
from services.auth_utils import get_current_user
from services.dpr_transcriber import DPRTranscriber
from services.dpr_extractor import DPRExtractor
from services.dpr_pdf_generator import PDFGenerator
from models.dpr_models import DPRFullReport

router = APIRouter(prefix="/api/dpr", tags=["Module 5 – DPR"], dependencies=[Depends(get_current_user)])

_transcriber = DPRTranscriber()
_extractor = DPRExtractor()
_pdf_gen = PDFGenerator()


# Trade rate lookup – keep in sync with labour.py
TRADE_RATES = {
    "mason": 850, "helper": 550, "carpenter": 800,
    "fabricator": 900, "welder": 900, "rigger": 750,
    "module_fitter": 950, "equipment_operator": 1000, "other": 600,
}

TRADE_ALIASES = {
    "mason": "mason", "mason / brick layer": "mason",
    "helper": "helper", "unskilled": "helper",
    "carpenter": "carpenter", "shuttering carpenter": "carpenter",
    "fabricator": "fabricator", "bar bender": "fabricator", "rebar": "fabricator",
    "welder": "welder", "rigger": "rigger",
    "module fitter": "module_fitter",
    "equipment operator": "equipment_operator", "operator": "equipment_operator",
}


def _normalize_trade(trade: str) -> str:
    t = trade.lower().strip()
    for key, val in TRADE_ALIASES.items():
        if key in t:
            return val
    return "other"


def _sync_dpr_to_modules(report: DPRFullReport, site_id: str, db: Session) -> dict:
    """
    Commits LabourAttendance + LabourWage rows, MaterialItem + MaterialLog rows,
    EquipmentAsset + EquipmentLog rows, and SafetyInduction rows into the real
    database tables from the AI-extracted DPR.
    """
    from models.labour import LabourAttendance, LabourWage, SafetyInduction
    from models.resource import MaterialItem, MaterialLog
    from models.equipment import EquipmentAsset, EquipmentLog

    today = date.today()
    synced = {"labour_rows": [], "material_rows": [], "equipment_rows": [], "safety_rows": []}

    # ── Labour ────────────────────────────────────────────────────────────────
    for lbr in (report.labour or []):
        if not lbr.trade or lbr.present <= 0:
            continue
        trade_key = _normalize_trade(lbr.trade)
        rate = TRADE_RATES.get(trade_key, 600)
        ot_rate = rate / 8 * 1.5
        total_wages = lbr.present * rate

        attendance = LabourAttendance(
            id=str(uuid.uuid4()),
            site_id=site_id,
            date=today,
            trade=trade_key,
            agency=lbr.contractor or "",
            location="on_site",
            present=lbr.present,
            absent=0,
            ot_hours=0,
            remarks=f"[DPR Auto-Sync] Productivity: {lbr.productivity}",
        )
        wage = LabourWage(
            id=str(uuid.uuid4()),
            site_id=site_id,
            date=today,
            trade=trade_key,
            rate_per_day=rate,
            ot_rate_per_hour=ot_rate,
            present=lbr.present,
            ot_hours=0,
            total_wages=total_wages,
        )
        db.add(attendance)
        db.add(wage)
        synced["labour_rows"].append({"trade": trade_key, "present": lbr.present})

    # ── Materials ─────────────────────────────────────────────────────────────
    for mat in (report.materials or []):
        if not mat.item:
            continue

        # Parse numeric quantity from strings like "200 bags" or "3.5 MT"
        qty_number = 0.0
        m = re.search(r"[\d]+(?:\.\d+)?", mat.quantity or "0")
        if m:
            qty_number = float(m.group())

        unit = "Nos"
        for u in ["bags", "MT", "cum", "sqm", "litre", "kg", "nos"]:
            if u.lower() in (mat.quantity or "").lower():
                unit = u
                break

        # Find or create the MaterialItem for this site
        item = db.query(MaterialItem).filter(
            MaterialItem.site_id == site_id,
            MaterialItem.name.ilike(f"%{mat.item.split()[0]}%")
        ).first()

        if not item:
            item = MaterialItem(
                id=str(uuid.uuid4()),
                site_id=site_id,
                name=mat.item,
                unit=unit,
                unit_rate=0,
                reorder_level=0,
                current_stock=0,
            )
            db.add(item)
            db.flush()  # get id before referencing in log

        # Decide received vs consumed from AI status hint
        is_received = any(
            w in (mat.status or "").lower()
            for w in ["received", "grn", "delivered", "receipt", "incoming"]
        )
        received_qty = qty_number if is_received else 0.0
        consumed_qty = qty_number if not is_received else 0.0
        closing = item.current_stock + received_qty - consumed_qty

        log = MaterialLog(
            id=str(uuid.uuid4()),
            item_id=item.id,
            site_id=site_id,
            date=today,
            received=received_qty,
            consumed=consumed_qty,
            closing_stock=closing,
            wastage_pct=0,
            invoice_no="",
            remarks=f"[DPR Auto-Sync] Status: {mat.status}",
        )
        item.current_stock = closing
        db.add(log)
        synced["material_rows"].append({"item": mat.item, "received": received_qty, "consumed": consumed_qty})

    # ── Safety Inductions ─────────────────────────────────────────────────────
    for saf in (report.safety or []):
        if not saf.item:
            continue
        # Create a safety induction record for each safety check item
        existing = db.query(SafetyInduction).filter(
            SafetyInduction.site_id == site_id,
            SafetyInduction.worker_name == saf.item,
        ).first()
        if not existing:
            induction = SafetyInduction(
                id=str(uuid.uuid4()),
                site_id=site_id,
                worker_name=saf.item,
                trade="Safety",
                agency="[DPR Auto-Sync]",
                inducted=saf.status.upper() in ("PASS", "PASSED", "OK"),
                induction_date=today if saf.status.upper() in ("PASS", "PASSED", "OK") else None,
            )
            db.add(induction)
            synced["safety_rows"].append({"item": saf.item, "status": saf.status})

    # ── Equipment Logs ────────────────────────────────────────────────────────
    # DPR work_progress may contain equipment-related activities; create log entries
    for wp in (report.work_progress or []):
        activity_lower = (wp.activity or "").lower()
        # Match known equipment keywords
        equip_keywords = {
            "crane": "Tower Crane",
            "pump": "Boom Pump",
            "jcb": "JCB Backhoe",
            "mixer": "Transit Mixer",
            "excavator": "Excavator",
            "generator": "DG Set",
        }
        matched_name = None
        for kw, name in equip_keywords.items():
            if kw in activity_lower:
                matched_name = name
                break

        if matched_name:
            # Find or create equipment asset
            asset = db.query(EquipmentAsset).filter(
                EquipmentAsset.site_id == site_id,
                EquipmentAsset.name.ilike(f"%{matched_name.split()[0]}%"),
            ).first()
            if not asset:
                asset = EquipmentAsset(
                    id=str(uuid.uuid4()),
                    site_id=site_id,
                    name=matched_name,
                    owned=False,
                    vendor="",
                    daily_rate=0,
                    operator_name="",
                )
                db.add(asset)
                db.flush()

            # Create an equipment log for today
            existing_log = db.query(EquipmentLog).filter(
                EquipmentLog.asset_id == asset.id,
                EquipmentLog.date == today,
            ).first()
            if not existing_log:
                working_hrs = 8.0 if wp.actual_pct >= 50 else 4.0
                log = EquipmentLog(
                    id=str(uuid.uuid4()),
                    asset_id=asset.id,
                    site_id=site_id,
                    date=today,
                    working_hrs=working_hrs,
                    idle_hrs=0,
                    breakdown_hrs=0,
                    idle_reason="",
                    breakdown_reason="",
                    remarks=f"[DPR Auto-Sync] {wp.activity}",
                )
                db.add(log)
                synced["equipment_rows"].append({"asset": matched_name, "working_hrs": working_hrs})

    db.commit()
    return synced


# ── 1. Transcribe audio → text ────────────────────────────────────────────────
@router.post("/transcribe")
async def dpr_transcribe(audio: UploadFile = File(...)):
    """Upload audio file → returns transcript + detected language."""
    try:
        content = await audio.read()
        result = _transcriber.transcribe_bytes(content)
        return {"transcript": result["transcript"], "language": result["language"]}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# ── 2. Extract structured report from transcript ──────────────────────────────
@router.post("/extract")
async def dpr_extract(payload: dict):
    """
    Body: { "transcript": str, "language": str }
    Returns: full DPRFullReport JSON
    """
    try:
        transcript = payload.get("transcript", "")
        language = payload.get("language", "hi")
        if not transcript:
            raise HTTPException(status_code=400, detail="transcript is required")
        report = _extractor.extract(transcript, language)
        return report.model_dump()
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# ── 3. Generate PDF from structured report data ───────────────────────────────
@router.post("/generate-pdf")
async def dpr_generate_pdf(report_data: dict):
    """
    Body: full DPRFullReport JSON
    Returns: PDF file download
    """
    try:
        report = DPRFullReport(**report_data)
        date_str = report.site_info.date.replace("/", "-").replace(" ", "_") if report.site_info else "report"
        filename = f"DPR_{date_str}_{uuid.uuid4().hex[:6]}.pdf"
        import io
        buffer = io.BytesIO()
        _pdf_gen.generate_to_buffer(report, buffer)
        buffer.seek(0)
        from fastapi.responses import StreamingResponse
        return StreamingResponse(
            buffer,
            media_type="application/pdf",
            headers={"Content-Disposition": f"attachment; filename={filename}"},
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# ── 4. Full pipeline: audio → transcribe → extract → PDF ─────────────────────
@router.post("/generate-from-audio")
async def dpr_generate_from_audio(audio: UploadFile = File(...)):
    """
    Upload audio → transcribe → extract → PDF (one-shot).
    Returns PDF file download with X-Transcript header.
    """
    try:
        content = await audio.read()
        stt = _transcriber.transcribe_bytes(content)
        report = _extractor.extract(stt["transcript"], stt["language"])
        date_str = report.site_info.date.replace("/", "-").replace(" ", "_") if report.site_info else "report"
        filename = f"DPR_{date_str}_{uuid.uuid4().hex[:6]}.pdf"
        import io
        buffer = io.BytesIO()
        _pdf_gen.generate_to_buffer(report, buffer)
        buffer.seek(0)
        import urllib.parse
        from fastapi.responses import StreamingResponse
        return StreamingResponse(
            buffer,
            media_type="application/pdf",
            headers={
                "Content-Disposition": f"attachment; filename={filename}",
                "X-Transcript": urllib.parse.quote(stt["transcript"]),
            },
        )
    except Exception as e:
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))


# ── 5. Voice → DPR-shaped JSON (for frontend rendering before PDF) ────────────
@router.post("/process-voice")
async def dpr_process_voice(payload: dict, db: Session = Depends(get_db)):
    """
    Body: { "transcript": str, "language": str, "siteName": str, "projectName": str, "siteId": int }
    Returns a DPR-shaped data object and auto-syncs labour/materials to DB.
    """
    try:
        transcript = payload.get("transcript", "")
        language = payload.get("language", "en")
        site_name = payload.get("siteName", "")
        site_id = payload.get("siteId")

        if not transcript:
            raise HTTPException(status_code=400, detail="transcript is required")

        report = _extractor.extract(transcript, language)
        r = report

        # ── Auto-sync to Labour + Materials modules ────────────────────────
        sync_summary = {}
        if site_id:
            try:
                sync_summary = _sync_dpr_to_modules(report, site_id, db)
            except Exception as sync_err:
                import traceback
                traceback.print_exc()
                sync_summary = {"error": str(sync_err)}  # non-fatal

        work_completed = [
            {
                "zone": site_name,
                "activity": wp.activity,
                "status": "Completed" if wp.actual_pct >= 100 else "In Progress",
                "remarks": f"Planned {wp.planned_pct}% → Actual {wp.actual_pct}% | {wp.status}",
            }
            for wp in (r.work_progress or [])
        ]

        manpower_summary = [
            {
                "trade": lbr.trade,
                "present": lbr.present,
                "absent": 0,
                "otHours": 0,
                "remarks": f"{lbr.contractor} | {lbr.productivity} | {lbr.man_days} man-days",
            }
            for lbr in (r.labour or [])
        ]

        materials_log = [
            {"material": mat.item, "received": mat.quantity, "consumed": mat.quantity, "remarks": mat.status}
            for mat in (r.materials or [])
        ]

        safety_quality = [
            {"item": saf.item, "details": f"Status: {saf.status}"}
            for saf in (r.safety or [])
        ]

        critical_issues = [
            {
                "issue": f"[{ncr.id}] {ncr.title}: {ncr.description}",
                "responsible": "Site Team",
                "status": "Pending",
                "targetDate": ncr.deadline or "",
            }
            for ncr in (r.ncr_reports or [])
        ]

        next_day_plan = [
            {"zone": site_name, "activity": action.action, "targetQty": f"Priority {action.priority}"}
            for action in (r.recommended_actions or [])
        ]

        ai_highlights = list(r.cautions or [])
        if r.delay_risk:
            ai_highlights.append(f"Delay risk: {r.delay_risk.risk_level}")
        ai_highlights += [f"{c.code}: {c.description}" for c in (r.is_codes or [])]

        workers_today = sum(lbr.present for lbr in (r.labour or []))
        s = r.summary

        return {
            "success": True,
            "syncSummary": sync_summary,  # what was auto-populated in other modules
            "data": {
                "executiveSummary": (
                    f"Overall progress: {s.overall_progress}%. "
                    f"Workers today: {workers_today}. "
                    f"NCRs raised: {s.ncrs_raised}. "
                    f"Delay risk: {s.delay_risk}."
                ) if s else "",
                "weather": r.site_info.weather if r.site_info else "",
                "workCompleted": work_completed,
                "manpowerSummary": manpower_summary,
                "materialsLog": materials_log,
                "equipmentLog": [
                    {"equipment": eq_name, "working_hrs": eq_hrs}
                    for eq_row in (sync_summary.get("equipment_rows") or [])
                    for eq_name, eq_hrs in [eq_row.get("asset", ""), eq_row.get("working_hrs", 0)]
                ],
                "keyQuantities": [],
                "safetyQuality": safety_quality,
                "criticalIssues": critical_issues,
                "nextDayPlan": next_day_plan,
                "costTracking": {"budgeted": 0, "actual": 0, "variance": 0},
                "aiHighlights": ai_highlights,
                "fullReport": r.model_dump(),
            },
        }
    except HTTPException:
        raise
    except Exception as e:
        import traceback
        with open("dpr_error.txt", "a") as f:
            f.write(traceback.format_exc() + "\n")
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))
