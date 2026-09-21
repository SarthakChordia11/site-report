from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func
from database import get_db
from services.auth_utils import get_current_user
from models.labour import LabourAttendance, LabourWage, SafetyInduction
from pydantic import BaseModel
from typing import Optional, List
import uuid
from datetime import date

router = APIRouter(prefix="/api/labour", tags=["labour"], dependencies=[Depends(get_current_user)])

TRADE_RATES = {
    "mason": 850, "helper": 550, "carpenter": 800,
    "fabricator": 900, "welder": 900, "rigger": 750,
    "module_fitter": 950, "equipment_operator": 1000, "other": 600
}

# --- Attendance ---
class AttendanceIn(BaseModel):
    site_id: str
    date: date
    trade: str
    agency: Optional[str] = ""
    location: Optional[str] = "on_site"
    present: int = 0
    absent: int = 0
    ot_hours: float = 0
    remarks: Optional[str] = ""


def _trade_key(trade: str) -> str:
    return trade.lower().strip().replace(" ", "_")


def _create_wage(data: AttendanceIn, trade: str) -> LabourWage:
    rate = TRADE_RATES.get(trade, TRADE_RATES["other"])
    ot_rate = rate / 8 * 1.5
    total = (data.present * rate) + (data.ot_hours * ot_rate)
    return LabourWage(
        id=str(uuid.uuid4()), site_id=data.site_id, date=data.date,
        trade=trade, rate_per_day=rate, ot_rate_per_hour=ot_rate,
        present=data.present, ot_hours=data.ot_hours, total_wages=total,
    )

@router.get("/{site_id}/attendance")
def get_attendance(site_id: str, log_date: Optional[date] = None, db: Session = Depends(get_db)):
    q = db.query(LabourAttendance).filter(LabourAttendance.site_id == site_id)
    if log_date:
        q = q.filter(LabourAttendance.date == log_date)
    rows = q.order_by(LabourAttendance.date.desc()).all()
    return [{"id": r.id, "date": str(r.date), "trade": r.trade, "agency": r.agency,
             "location": r.location, "present": r.present, "absent": r.absent,
             "ot_hours": r.ot_hours, "remarks": r.remarks} for r in rows]

@router.post("/attendance")
def log_attendance(data: AttendanceIn, db: Session = Depends(get_db)):
    data.trade = _trade_key(data.trade)
    row = LabourAttendance(id=str(uuid.uuid4()), **data.model_dump())
    wage = _create_wage(data, data.trade)
    db.add(row)
    db.add(wage)
    db.commit()
    return {"id": row.id, "total_wages": wage.total_wages, "rate": wage.rate_per_day}


@router.put("/attendance/upsert")
def upsert_attendance(data: AttendanceIn, db: Session = Depends(get_db)):
    """Replace one site's attendance row for a trade and day without duplicating wages."""
    trade = _trade_key(data.trade)
    row = db.query(LabourAttendance).filter(
        LabourAttendance.site_id == data.site_id,
        LabourAttendance.date == data.date,
        LabourAttendance.trade == trade,
    ).first()
    payload = data.model_dump() | {"trade": trade}
    if row:
        for key, value in payload.items():
            setattr(row, key, value)
        db.query(LabourWage).filter(
            LabourWage.site_id == data.site_id,
            LabourWage.date == data.date,
            LabourWage.trade == trade,
        ).delete()
    else:
        row = LabourAttendance(id=str(uuid.uuid4()), **payload)
        db.add(row)
    wage = _create_wage(data, trade)
    db.add(wage)
    db.commit()
    return {"id": row.id, "total_wages": wage.total_wages, "rate": wage.rate_per_day}

@router.post("/attendance/bulk")
def log_attendance_bulk(items: List[AttendanceIn], db: Session = Depends(get_db)):
    results = []
    for data in items:
        data.trade = _trade_key(data.trade)
        row = LabourAttendance(id=str(uuid.uuid4()), **data.model_dump())
        wage = _create_wage(data, data.trade)
        db.add(row)
        db.add(wage)
        results.append({"trade": data.trade, "total_wages": wage.total_wages})
    db.commit()
    return results

@router.get("/{site_id}/wages/summary")
def wages_summary(site_id: str, db: Session = Depends(get_db)):
    rows = db.query(
        LabourWage.trade,
        func.sum(LabourWage.total_wages).label("total"),
        func.sum(LabourWage.present).label("person_days"),
    ).filter(LabourWage.site_id == site_id).group_by(LabourWage.trade).all()
    return [{"trade": r.trade, "total_wages": r.total, "person_days": r.person_days} for r in rows]

@router.get("/{site_id}/summary")
def labour_summary(site_id: str, for_date: Optional[date] = None, db: Session = Depends(get_db)):
    q = db.query(LabourAttendance).filter(LabourAttendance.site_id == site_id)
    if for_date:
        q = q.filter(LabourAttendance.date == for_date)
    rows = q.all()
    total_present = sum(r.present for r in rows)
    total_absent = sum(r.absent for r in rows)
    total_ot = sum(r.ot_hours for r in rows)
    wq = db.query(func.sum(LabourWage.total_wages)).filter(LabourWage.site_id == site_id)
    if for_date:
        wq = wq.filter(LabourWage.date == for_date)
    total_wages = wq.scalar() or 0
    from models.labour import LabourMobilization
    m_rows = db.query(LabourMobilization).filter(LabourMobilization.site_id == site_id).all()
    shortfall = sum(max(0, r.required_count - r.mobilized_count) for r in m_rows)
    return {"total_present": total_present, "total_absent": total_absent,
            "total_ot_hours": total_ot, "total_wages": total_wages,
            "shortfall": shortfall, "trades": len(set(r.trade for r in rows))}

class MobilizationIn(BaseModel):
    site_id: str
    trade: str
    agency: str = ""
    required_count: int = 0
    mobilized_count: int = 0

@router.get("/{site_id}/mobilization")
def get_mobilization(site_id: str, db: Session = Depends(get_db)):
    from models.labour import LabourMobilization
    rows = db.query(LabourMobilization).filter(LabourMobilization.site_id == site_id).all()
    return [{"id": r.id, "trade": r.trade, "agency": r.agency,
             "required_count": r.required_count, "mobilized_count": r.mobilized_count,
             "shortfall": max(0, r.required_count - r.mobilized_count)} for r in rows]

@router.post("/mobilization")
def add_mobilization(data: MobilizationIn, db: Session = Depends(get_db)):
    from models.labour import LabourMobilization
    m = LabourMobilization(id=str(uuid.uuid4()), **data.model_dump())
    db.add(m)
    db.commit()
    return {"id": m.id}

class SafetyIn(BaseModel):
    site_id: str
    worker_name: str
    trade: str = ""
    agency: str = ""
    inducted: bool = False

@router.get("/{site_id}/safety")
def get_safety(site_id: str, db: Session = Depends(get_db)):
    from models.labour import SafetyInduction
    rows = db.query(SafetyInduction).filter(SafetyInduction.site_id == site_id).all()
    return [{"id": r.id, "worker_name": r.worker_name, "trade": r.trade, "agency": r.agency,
             "inducted": r.inducted, "induction_date": str(r.induction_date) if r.induction_date else None} for r in rows]

@router.post("/safety")
def add_safety(data: SafetyIn, db: Session = Depends(get_db)):
    from models.labour import SafetyInduction
    s = SafetyInduction(id=str(uuid.uuid4()), **data.model_dump())
    if data.inducted:
        s.induction_date = date.today()
    db.add(s)
    db.commit()
    return {"id": s.id}

@router.patch("/safety/{induction_id}/induct")
def confirm_induction(induction_id: str, db: Session = Depends(get_db)):
    from models.labour import SafetyInduction
    s = db.query(SafetyInduction).filter(SafetyInduction.id == induction_id).first()
    if not s:
        raise HTTPException(404, "Record not found")
    s.inducted = True
    s.induction_date = date.today()
    db.commit()
    return {"ok": True}
