from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import get_db
from services.auth_utils import get_current_user
from models.site import Site
from pydantic import BaseModel
from typing import Optional
import uuid, datetime

router = APIRouter(prefix="/api/sites", tags=["sites"], dependencies=[Depends(get_current_user)])

class SiteCreate(BaseModel):
    name: str
    project_name: str
    client: Optional[str] = ""
    contractor: Optional[str] = ""
    location: Optional[str] = ""
    site_type: Optional[str] = "building"
    status: Optional[str] = "Active"
    progress_percent: Optional[float] = 0
    active_workers: Optional[int] = 0
    weather: Optional[str] = ""

@router.get("")
def list_sites(db: Session = Depends(get_db)):
    sites = db.query(Site).all()
    return [{"id": s.id, "name": s.name, "project_name": s.project_name,
             "client": s.client, "contractor": s.contractor, "location": s.location,
             "site_type": s.site_type, "status": s.status,
             "progress_percent": s.progress_percent, "active_workers": s.active_workers,
             "weather": s.weather, "image": s.image} for s in sites]

@router.post("")
def create_site(data: SiteCreate, db: Session = Depends(get_db)):
    site = Site(id=str(uuid.uuid4()), **data.model_dump())
    db.add(site)
    db.commit()
    db.refresh(site)
    return {"id": site.id, "name": site.name, "project_name": site.project_name,
            "site_type": site.site_type, "status": site.status}

@router.get("/{site_id}")
def get_site(site_id: str, db: Session = Depends(get_db)):
    site = db.query(Site).filter(Site.id == site_id).first()
    if not site:
        raise HTTPException(status_code=404, detail="Site not found")
    return site

@router.patch("/{site_id}")
def update_site(site_id: str, data: dict, db: Session = Depends(get_db)):
    site = db.query(Site).filter(Site.id == site_id).first()
    if not site:
        raise HTTPException(status_code=404, detail="Site not found")
    for k, v in data.items():
        if hasattr(site, k):
            setattr(site, k, v)
    db.commit()
    return {"ok": True}

@router.delete("/{site_id}")
def delete_site(site_id: str, db: Session = Depends(get_db)):
    site = db.query(Site).filter(Site.id == site_id).first()
    if not site:
        raise HTTPException(status_code=404, detail="Site not found")
    db.delete(site)
    db.commit()
    return {"ok": True}
