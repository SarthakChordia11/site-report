from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func
from database import get_db
from services.auth_utils import get_current_user
from models.labour import LabourWage
from models.resource import MaterialLog, MaterialItem
from models.equipment import EquipmentAsset, EquipmentLog
from models.cost import CostBudget, EVMSnapshot, CostBaseline
from pydantic import BaseModel
from typing import Optional, List
from datetime import date
import uuid

router = APIRouter(prefix="/api/cost", tags=["cost"], dependencies=[Depends(get_current_user)])

class BudgetIn(BaseModel):
    site_id: str
    category: str  # labour / material / equipment
    work_package: str = "overall"
    budget_amount: float

class BaselineIn(BaseModel):
    site_id: str
    total_budget: float = 0
    labour_budget: float = 0
    material_budget: float = 0
    equipment_budget: float = 0
    planned_start_date: Optional[date] = None
    planned_end_date: Optional[date] = None

class EVMSnapshotIn(BaseModel):
    site_id: str
    snapshot_date: date
    planned_value: float = 0
    earned_value: float = 0
    actual_cost: float = 0

@router.get("/{site_id}/summary")
def cost_summary(site_id: str, db: Session = Depends(get_db)):
    # Labour cost
    labour_actual = db.query(func.sum(LabourWage.total_wages)).filter(
        LabourWage.site_id == site_id
    ).scalar() or 0

    # Material cost
    material_logs = db.query(MaterialLog, MaterialItem).join(
        MaterialItem, MaterialLog.item_id == MaterialItem.id
    ).filter(MaterialLog.site_id == site_id).all()
    material_actual = sum(log.consumed * item.unit_rate for log, item in material_logs)

    # Equipment cost
    assets = db.query(EquipmentAsset).filter(EquipmentAsset.site_id == site_id).all()
    equipment_actual = sum(
        (db.query(func.count(EquipmentLog.id)).filter(EquipmentLog.asset_id == a.id).scalar() or 0) * a.daily_rate
        for a in assets
    )

    # Budgets
    budgets = db.query(CostBudget).filter(CostBudget.site_id == site_id).all()
    budget_map = {b.category: b.budget_amount for b in budgets}

    labour_budget = budget_map.get("labour", 0)
    equipment_budget = budget_map.get("equipment", 0)
    material_budget = budget_map.get("material", 0)
    total_budget = budget_map.get("total", labour_budget + equipment_budget + material_budget)

    total_actual = labour_actual + equipment_actual + material_actual

    return {
        "labour": {"actual": labour_actual, "budget": labour_budget,
                   "variance": labour_budget - labour_actual,
                   "pct_used": (labour_actual / labour_budget * 100) if labour_budget > 0 else 0},
        "material": {"actual": material_actual, "budget": material_budget,
                     "variance": material_budget - material_actual,
                     "pct_used": (material_actual / material_budget * 100) if material_budget > 0 else 0},
        "equipment": {"actual": equipment_actual, "budget": equipment_budget,
                      "variance": equipment_budget - equipment_actual,
                      "pct_used": (equipment_actual / equipment_budget * 100) if equipment_budget > 0 else 0},
        "total": {"actual": total_actual, "budget": total_budget,
                  "variance": total_budget - total_actual,
                  "pct_used": (total_actual / total_budget * 100) if total_budget > 0 else 0}
    }

import os
from groq import Groq
@router.get("/{site_id}/narrative")
def cost_narrative(site_id: str, db: Session = Depends(get_db)):
    summary = cost_summary(site_id, db)
    client = Groq(api_key=os.getenv("GROQ_API_KEY"))
    prompt = f"""
    You are an expert construction project manager. Write a concise, one-paragraph executive summary (max 3 sentences)
    of the following cost data for a site. Highlight the biggest overspend or risk area.
    Data:
    Total Actual: ₹{summary['total']['actual']} / Budget: ₹{summary['total']['budget']}
    Labour Actual: ₹{summary['labour']['actual']} / Budget: ₹{summary['labour']['budget']}
    Material Actual: ₹{summary['material']['actual']} / Budget: ₹{summary['material']['budget']}
    Equipment Actual: ₹{summary['equipment']['actual']} / Budget: ₹{summary['equipment']['budget']}
    """
    
    try:
        response = client.chat.completions.create(
            model="openai/gpt-oss-120b",
            messages=[{"role": "user", "content": prompt}],
            temperature=0.3
        )
        return {"narrative": response.choices[0].message.content}
    except Exception as e:
        return {"narrative": "AI Narrative unavailable: " + str(e)}

@router.post("/budget")
def set_budget(data: BudgetIn, db: Session = Depends(get_db)):
    existing = db.query(CostBudget).filter(
        CostBudget.site_id == data.site_id, CostBudget.category == data.category
    ).first()
    if existing:
        existing.budget_amount = data.budget_amount
    else:
        db.add(CostBudget(id=str(uuid.uuid4()), **data.model_dump()))
    db.commit()
    return {"ok": True}

@router.get("/{site_id}/budgets")
def get_budgets(site_id: str, db: Session = Depends(get_db)):
    budgets = db.query(CostBudget).filter(CostBudget.site_id == site_id).all()
    return [{"category": b.category, "budget_amount": b.budget_amount} for b in budgets]


# ── EVM Snapshot Endpoints ───────────────────────────────────────────────────

@router.post("/evm/snapshot")
def save_evm_snapshot(data: EVMSnapshotIn, db: Session = Depends(get_db)):
    """Save an EVM data point for historical S-Curve tracking."""
    # Check if snapshot already exists for this date
    existing = db.query(EVMSnapshot).filter(
        EVMSnapshot.site_id == data.site_id,
        EVMSnapshot.snapshot_date == data.snapshot_date,
    ).first()
    if existing:
        existing.planned_value = data.planned_value
        existing.earned_value = data.earned_value
        existing.actual_cost = data.actual_cost
        existing.cpi = data.earned_value / data.actual_cost if data.actual_cost > 0 else 0
        existing.spi = data.earned_value / data.planned_value if data.planned_value > 0 else 0
        existing.cv = data.earned_value - data.actual_cost
        existing.sv = data.earned_value - data.planned_value
    else:
        cpi = data.earned_value / data.actual_cost if data.actual_cost > 0 else 0
        spi = data.earned_value / data.planned_value if data.planned_value > 0 else 0
        snapshot = EVMSnapshot(
            id=str(uuid.uuid4()),
            site_id=data.site_id,
            snapshot_date=data.snapshot_date,
            planned_value=data.planned_value,
            earned_value=data.earned_value,
            actual_cost=data.actual_cost,
            cpi=cpi,
            spi=spi,
            cv=data.earned_value - data.actual_cost,
            sv=data.earned_value - data.planned_value,
        )
        db.add(snapshot)
    db.commit()
    return {"ok": True}


@router.get("/{site_id}/evm/history")
def get_evm_history(site_id: str, db: Session = Depends(get_db)):
    """Get historical EVM snapshots for S-Curve rendering."""
    rows = db.query(EVMSnapshot).filter(
        EVMSnapshot.site_id == site_id
    ).order_by(EVMSnapshot.snapshot_date.asc()).all()
    return [{
        "date": str(r.snapshot_date),
        "planned_value": r.planned_value,
        "earned_value": r.earned_value,
        "actual_cost": r.actual_cost,
        "cpi": r.cpi,
        "spi": r.spi,
        "cv": r.cv,
        "sv": r.sv,
    } for r in rows]


# ── Cost Baseline Endpoints ─────────────────────────────────────────────────

@router.post("/baseline")
def set_baseline(data: BaselineIn, db: Session = Depends(get_db)):
    """Set or update the project budget baseline for EVM calculations."""
    existing = db.query(CostBaseline).filter(CostBaseline.site_id == data.site_id).first()
    if existing:
        existing.total_budget = data.total_budget
        existing.labour_budget = data.labour_budget
        existing.material_budget = data.material_budget
        existing.equipment_budget = data.equipment_budget
        existing.planned_start_date = data.planned_start_date
        existing.planned_end_date = data.planned_end_date
    else:
        baseline = CostBaseline(id=str(uuid.uuid4()), **data.model_dump())
        db.add(baseline)
    db.commit()
    return {"ok": True}


@router.get("/{site_id}/baseline")
def get_baseline(site_id: str, db: Session = Depends(get_db)):
    """Get the project budget baseline."""
    baseline = db.query(CostBaseline).filter(CostBaseline.site_id == site_id).first()
    if not baseline:
        return None
    return {
        "site_id": baseline.site_id,
        "total_budget": baseline.total_budget,
        "labour_budget": baseline.labour_budget,
        "material_budget": baseline.material_budget,
        "equipment_budget": baseline.equipment_budget,
        "planned_start_date": str(baseline.planned_start_date) if baseline.planned_start_date else None,
        "planned_end_date": str(baseline.planned_end_date) if baseline.planned_end_date else None,
    }
