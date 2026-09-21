from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func
from database import get_db
from services.auth_utils import get_current_user
from models.resource import MaterialItem, MaterialLog, FinishedElement, Dispatch, Vendor
from pydantic import BaseModel
from typing import Optional, List
import uuid
from datetime import date

router = APIRouter(prefix="/api/resource", tags=["resource"], dependencies=[Depends(get_current_user)])

class MaterialItemIn(BaseModel):
    site_id: str
    name: str
    unit: str = ""
    unit_rate: float = 0
    reorder_level: float = 0

class MaterialLogIn(BaseModel):
    item_id: str
    site_id: str
    date: date
    received: float = 0
    consumed: float = 0
    invoice_no: str = ""
    vendor_id: Optional[str] = None
    remarks: str = ""

class FinishedElementIn(BaseModel):
    site_id: str
    element_id: str
    element_type: str = ""
    stage: str = "cast"
    cast_date: Optional[date] = None
    remarks: str = ""

@router.get("/{site_id}/materials")
def list_materials(site_id: str, db: Session = Depends(get_db)):
    items = db.query(MaterialItem).filter(MaterialItem.site_id == site_id).all()
    result = []
    for item in items:
        logs = db.query(MaterialLog).filter(MaterialLog.item_id == item.id).all()
        total_received = sum(l.received for l in logs)
        total_consumed = sum(l.consumed for l in logs)
        result.append({
            "id": item.id, "name": item.name, "unit": item.unit,
            "current_stock": item.current_stock, "reorder_level": item.reorder_level,
            "total_received": total_received, "total_consumed": total_consumed,
            "low_stock": item.current_stock <= item.reorder_level and item.reorder_level > 0
        })
    return result

@router.post("/materials")
def add_material(data: MaterialItemIn, db: Session = Depends(get_db)):
    item = MaterialItem(id=str(uuid.uuid4()), **data.model_dump())
    db.add(item)
    db.commit()
    return {"id": item.id}

@router.post("/materials/log")
def log_material(data: MaterialLogIn, db: Session = Depends(get_db)):
    item = db.query(MaterialItem).filter(MaterialItem.id == data.item_id).first()
    if not item:
        raise HTTPException(404, "Material item not found")
    planned = item.current_stock + data.received
    closing = planned - data.consumed
    wastage = (data.consumed - (planned - closing)) / data.consumed * 100 if data.consumed > 0 else 0
    log = MaterialLog(id=str(uuid.uuid4()), closing_stock=closing,
                      wastage_pct=max(0, wastage), **data.model_dump())
    item.current_stock = closing
    db.add(log)
    db.commit()
    return {"closing_stock": closing, "low_stock": closing <= item.reorder_level and item.reorder_level > 0}

@router.get("/{site_id}/elements")
def list_elements(site_id: str, stage: Optional[str] = None, db: Session = Depends(get_db)):
    q = db.query(FinishedElement).filter(FinishedElement.site_id == site_id)
    if stage:
        q = q.filter(FinishedElement.stage == stage)
    rows = q.all()
    return [{"id": r.id, "element_id": r.element_id, "element_type": r.element_type,
             "stage": r.stage, "cast_date": str(r.cast_date) if r.cast_date else None,
             "dispatch_date": str(r.dispatch_date) if r.dispatch_date else None} for r in rows]

@router.post("/elements")
def add_element(data: FinishedElementIn, db: Session = Depends(get_db)):
    el = FinishedElement(id=str(uuid.uuid4()), **data.model_dump())
    db.add(el)
    db.commit()
    return {"id": el.id}

@router.patch("/elements/{el_id}/stage")
def update_stage(el_id: str, stage: str, db: Session = Depends(get_db)):
    el = db.query(FinishedElement).filter(FinishedElement.id == el_id).first()
    if not el:
        raise HTTPException(404, "Element not found")
    el.stage = stage
    db.commit()
    return {"ok": True, "stage": stage}

@router.get("/{site_id}/summary")
def resource_summary(site_id: str, db: Session = Depends(get_db)):
    items = db.query(MaterialItem).filter(MaterialItem.site_id == site_id).all()
    low_stock = [i for i in items if i.current_stock <= i.reorder_level and i.reorder_level > 0]
    elements = db.query(FinishedElement).filter(FinishedElement.site_id == site_id).all()
    stage_counts = {}
    for e in elements:
        stage_counts[e.stage] = stage_counts.get(e.stage, 0) + 1
    return {"total_materials": len(items), "low_stock_alerts": len(low_stock),
            "element_pipeline": stage_counts}

class DispatchIn(BaseModel):
    site_id: str
    element_id: Optional[str] = None
    material_item_id: Optional[str] = None
    dispatch_type: str = "material"
    date: date
    transporter: str = ""
    vehicle_no: str = ""
    quantity: str = ""
    eta: str = ""
    received_confirmed: bool = False
    remarks: str = ""

class VendorIn(BaseModel):
    site_id: str
    name: str
    vendor_type: str = "material"
    contact: str = ""
    on_time_pct: float = 100
    quality_issues: int = 0
    active: bool = True

@router.get("/{site_id}/dispatches")
def list_dispatches(site_id: str, db: Session = Depends(get_db)):
    rows = db.query(Dispatch).filter(Dispatch.site_id == site_id).all()
    return [{"id": r.id, "element_id": r.element_id, "material_item_id": r.material_item_id,
             "dispatch_type": r.dispatch_type, "date": str(r.date), "transporter": r.transporter,
             "vehicle_no": r.vehicle_no, "quantity": r.quantity, "eta": r.eta,
             "received_confirmed": r.received_confirmed, "remarks": r.remarks} for r in rows]

@router.post("/dispatches")
def add_dispatch(data: DispatchIn, db: Session = Depends(get_db)):
    d = Dispatch(id=str(uuid.uuid4()), **data.model_dump())
    db.add(d)
    db.commit()
    return {"id": d.id}

@router.patch("/dispatches/{dispatch_id}/confirm")
def confirm_dispatch(dispatch_id: str, db: Session = Depends(get_db)):
    d = db.query(Dispatch).filter(Dispatch.id == dispatch_id).first()
    if not d:
        raise HTTPException(404, "Dispatch not found")
    d.received_confirmed = True
    db.commit()
    return {"ok": True}

@router.get("/{site_id}/vendors")
def list_vendors(site_id: str, db: Session = Depends(get_db)):
    rows = db.query(Vendor).filter(Vendor.site_id == site_id).all()
    return [{"id": r.id, "name": r.name, "vendor_type": r.vendor_type,
             "contact": r.contact, "on_time_pct": r.on_time_pct,
             "quality_issues": r.quality_issues, "active": r.active} for r in rows]

@router.post("/vendors")
def add_vendor(data: VendorIn, db: Session = Depends(get_db)):
    v = Vendor(id=str(uuid.uuid4()), **data.model_dump())
    db.add(v)
    db.commit()
    return {"id": v.id}

@router.patch("/vendors/{vendor_id}/issues")
def add_vendor_issue(vendor_id: str, db: Session = Depends(get_db)):
    v = db.query(Vendor).filter(Vendor.id == vendor_id).first()
    if not v:
        raise HTTPException(404, "Vendor not found")
    v.quality_issues += 1
    db.commit()
    return {"ok": True, "issues": v.quality_issues}
