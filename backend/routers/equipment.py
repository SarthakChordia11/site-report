from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func
from database import get_db
from services.auth_utils import get_current_user
from models.equipment import EquipmentAsset, EquipmentLog
from pydantic import BaseModel
from typing import Optional, List
import uuid
from datetime import date

router = APIRouter(prefix="/api/equipment", tags=["equipment"], dependencies=[Depends(get_current_user)])

class AssetIn(BaseModel):
    site_id: str
    name: str
    owned: bool = False
    vendor: str = ""
    daily_rate: float = 0
    rental_start: Optional[date] = None
    rental_end: Optional[date] = None
    operator_name: str = ""

class EquipmentLogIn(BaseModel):
    asset_id: str
    site_id: str
    date: date
    working_hrs: float = 0
    idle_hrs: float = 0
    breakdown_hrs: float = 0
    idle_reason: str = ""
    breakdown_reason: str = ""
    remarks: str = ""

@router.get("/{site_id}/assets")
def list_assets(site_id: str, db: Session = Depends(get_db)):
    assets = db.query(EquipmentAsset).filter(
        EquipmentAsset.site_id == site_id, EquipmentAsset.active == True
    ).all()
    result = []
    for a in assets:
        latest_log = db.query(EquipmentLog).filter(
            EquipmentLog.asset_id == a.id
        ).order_by(EquipmentLog.date.desc()).first()
        # Total rental cost accrued
        total_rental = db.query(func.count(EquipmentLog.id)).filter(
            EquipmentLog.asset_id == a.id
        ).scalar() or 0
        result.append({
            "id": a.id, "name": a.name, "owned": a.owned, "vendor": a.vendor,
            "daily_rate": a.daily_rate, "operator_name": a.operator_name,
            "rental_start": str(a.rental_start) if a.rental_start else None,
            "rental_end": str(a.rental_end) if a.rental_end else None,
            "rental_days_logged": total_rental,
            "total_rental_cost": total_rental * a.daily_rate,
            "today_status": {
                "working_hrs": latest_log.working_hrs if latest_log else 0,
                "idle_hrs": latest_log.idle_hrs if latest_log else 0,
                "breakdown_hrs": latest_log.breakdown_hrs if latest_log else 0,
            } if latest_log else None
        })
    return result

@router.post("/assets")
def add_asset(data: AssetIn, db: Session = Depends(get_db)):
    asset = EquipmentAsset(id=str(uuid.uuid4()), **data.model_dump())
    db.add(asset)
    db.commit()
    return {"id": asset.id}

@router.post("/log")
def log_equipment(data: EquipmentLogIn, db: Session = Depends(get_db)):
    log = EquipmentLog(id=str(uuid.uuid4()), **data.model_dump())
    db.add(log)
    db.commit()
    asset = db.query(EquipmentAsset).filter(EquipmentAsset.id == data.asset_id).first()
    rental_cost = asset.daily_rate if asset else 0
    return {"id": log.id, "daily_rental_cost": rental_cost}


@router.put("/log/upsert")
def upsert_equipment_log(data: EquipmentLogIn, db: Session = Depends(get_db)):
    """Keep a single operational log per asset and date for idempotent UI edits."""
    log = db.query(EquipmentLog).filter(
        EquipmentLog.asset_id == data.asset_id,
        EquipmentLog.date == data.date,
    ).first()
    if log:
        for key, value in data.model_dump().items():
            setattr(log, key, value)
    else:
        log = EquipmentLog(id=str(uuid.uuid4()), **data.model_dump())
        db.add(log)
    db.commit()
    return {"id": log.id}

@router.post("/log/bulk")
def log_equipment_bulk(items: List[EquipmentLogIn], db: Session = Depends(get_db)):
    for data in items:
        log = EquipmentLog(id=str(uuid.uuid4()), **data.model_dump())
        db.add(log)
    db.commit()
    return {"logged": len(items)}

@router.get("/{site_id}/summary")
def equipment_summary(site_id: str, for_date: Optional[date] = None, db: Session = Depends(get_db)):
    assets = db.query(EquipmentAsset).filter(
        EquipmentAsset.site_id == site_id, EquipmentAsset.active == True
    ).all()
    total_rental_cost = sum(
        (db.query(func.count(EquipmentLog.id)).filter(EquipmentLog.asset_id == a.id).scalar() or 0) * a.daily_rate
        for a in assets
    )
    return {"total_assets": len(assets), "total_rental_cost_accrued": total_rental_cost,
            "owned": sum(1 for a in assets if a.owned),
            "rented": sum(1 for a in assets if not a.owned)}

@router.get("/{site_id}/breakdowns")
def equipment_breakdowns(site_id: str, db: Session = Depends(get_db)):
    logs = db.query(EquipmentLog, EquipmentAsset).join(
        EquipmentAsset, EquipmentLog.asset_id == EquipmentAsset.id
    ).filter(
        EquipmentLog.site_id == site_id,
        EquipmentLog.breakdown_hrs > 0
    ).order_by(EquipmentLog.date.desc()).all()
    
    return [{
        "id": log.id,
        "asset_name": asset.name,
        "date": str(log.date),
        "breakdown_hrs": log.breakdown_hrs,
        "reason": log.breakdown_reason
    } for log, asset in logs]
