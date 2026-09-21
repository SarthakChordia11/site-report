from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
import traceback
import os
import uuid
import logging
import sys

logging.basicConfig(
    stream=sys.stdout,
    level=logging.INFO,
    format="%(asctime)s %(levelname)s %(name)s: %(message)s",
)
logger = logging.getLogger(__name__)

# Load environment variables from .env
load_dotenv()

# Validate required env vars in production
_required_vars = ["JWT_SECRET", "GROQ_API_KEY", "DATABASE_URL"]
_missing = [v for v in _required_vars if not os.getenv(v)]
if _missing and os.getenv("ENVIRONMENT", "development").lower() == "production":
    sys.exit(f"FATAL: Missing required environment variables: {_missing}")

from database import engine, Base, get_db
import models  # Register all models

from routers import sites, labour, resource, equipment, cost, ai_voice, dpr, auth, reports

# Create all DB tables
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Site Manager AI",
    description="AI-powered 5-module construction site management system (incl. DPR)",
    version="2.0.0"
)

@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    logger.exception(f"Unhandled error at {request.url}")
    return JSONResponse(status_code=500, content={"detail": "Internal server error"})


allowed_origins = [
    origin.strip()
    for origin in os.getenv("CORS_ORIGINS", "http://localhost:3000,http://127.0.0.1:3000").split(",")
    if origin.strip()
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allow_headers=["Authorization", "Content-Type"],
)

app.include_router(sites.router)
app.include_router(labour.router)
app.include_router(resource.router)
app.include_router(equipment.router)
app.include_router(cost.router)
app.include_router(ai_voice.router)
app.include_router(dpr.router)
app.include_router(auth.router)
app.include_router(reports.router)

@app.get("/")
def root():
    return {
        "status": "ok",
        "app": "Site Manager AI",
        "message": "Backend API is running. Open the frontend at http://localhost:3000.",
    }

@app.get("/health")
def health():
    return {"status": "ok", "app": "Site Manager AI"}


def _seed_demo_reports():
    """Insert demo report history if the reports table is empty."""
    from models.report import SiteReport
    from sqlalchemy.orm import Session as DBSession

    db: DBSession = next(get_db())
    try:
        if db.query(SiteReport).count() > 0:
            return  # Already seeded

        demo_reports = [
            {
                "id": str(uuid.uuid4()),
                "site_id": "site-1",
                "author_id": None,
                "name": "Weekly Site Report #128",
                "project_name": "Sector 62 Precast Casting Yard",
                "report_date": "24 May 2024",
                "status": "Completed",
                "author": "Darshan Girase (PM)",
                "summary": "Full structural slab pouring completed for 22nd floor. 78 manpower present, 320 bags cement received with zero QC rejection.",
                "trades_present_count": 78,
                "critical_issues_count": 0,
                "materials_received_summary": "320 Bags Cement, 4.5 MT Rebar",
                "equipment_uptime_percent": 96,
                "evm_status": "CPI 1.04 (Under Budget)",
                "voice_transcript": None,
                "extracted_data": None,
            },
            {
                "id": str(uuid.uuid4()),
                "site_id": "site-1",
                "author_id": None,
                "name": "Foundation Inspection",
                "project_name": "Greenfield Towers",
                "report_date": "23 May 2024",
                "status": "Completed",
                "author": "Rajesh Sharma (QC Lead)",
                "summary": "Raft foundation core sample testing cleared 35 MPa target. Rebar tie density verified at 150mm spacing.",
                "trades_present_count": 42,
                "critical_issues_count": 0,
                "materials_received_summary": "Core Drill Samples Approved",
                "equipment_uptime_percent": 100,
                "evm_status": "CPI 1.02 (On Track)",
                "voice_transcript": None,
                "extracted_data": None,
            },
            {
                "id": str(uuid.uuid4()),
                "site_id": "site-3",
                "author_id": None,
                "name": "Progress Report #45",
                "project_name": "Metro Station Phase 2",
                "report_date": "22 May 2024",
                "status": "Completed",
                "author": "Amitabh Sen (Site Eng)",
                "summary": "Pier 42 segment erection finished using 250T mobile crane. Traffic diversion conducted in coordination with metro police.",
                "trades_present_count": 65,
                "critical_issues_count": 1,
                "materials_received_summary": "2 Modular Precast Girders",
                "equipment_uptime_percent": 91,
                "evm_status": "SPI 0.99 (On Schedule)",
                "voice_transcript": None,
                "extracted_data": None,
            },
            {
                "id": str(uuid.uuid4()),
                "site_id": "site-1",
                "author_id": None,
                "name": "Safety Audit Report",
                "project_name": "Highway Project",
                "report_date": "21 May 2024",
                "status": "In Progress",
                "author": "Vikram Jadhav (Safety Officer)",
                "summary": "Weekly high-altitude PPE compliance verification. 2 non-compliance citations issued for scaffold harness clip-on.",
                "trades_present_count": 54,
                "critical_issues_count": 2,
                "materials_received_summary": "45 New Harness Kits Issued",
                "equipment_uptime_percent": 88,
                "evm_status": "CPI 1.01 (Under Review)",
                "voice_transcript": None,
                "extracted_data": None,
            },
            {
                "id": str(uuid.uuid4()),
                "site_id": "site-1",
                "author_id": None,
                "name": "Daily Shift & Concrete Pour Log #89",
                "project_name": "Sector 62 Casting Yard",
                "report_date": "20 May 2024",
                "status": "Completed",
                "author": "Suresh Patil (Foreman)",
                "summary": "Voice logged daily shift. 73 workers checked in across Masons, Riggers, and Helpers. 140 bags cement consumed.",
                "trades_present_count": 73,
                "critical_issues_count": 1,
                "materials_received_summary": "140 Bags Cement, 3.5 MT Steel",
                "equipment_uptime_percent": 94,
                "evm_status": "CPI 1.03 (Under Budget)",
                "voice_transcript": None,
                "extracted_data": None,
            },
        ]

        for report_data in demo_reports:
            report = SiteReport(**report_data)
            db.add(report)
        db.commit()
        print(f"Seeded {len(demo_reports)} demo reports into the database.")
    except Exception as e:
        db.rollback()
        print(f"Warning: Failed to seed demo reports: {e}")
    finally:
        db.close()


# Seed demo reports on startup
try:
    _seed_demo_reports()
except Exception:
    pass  # Non-fatal: seeding is best-effort


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8002, reload=True)
