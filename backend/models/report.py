from sqlalchemy import Column, String, Integer, DateTime, ForeignKey, Text
from sqlalchemy.types import JSON
from sqlalchemy.sql import func
from database import Base


class SiteReport(Base):
    __tablename__ = "site_reports"

    id = Column(String, primary_key=True)
    site_id = Column(String, ForeignKey("sites.id"), nullable=False, index=True)
    author_id = Column(String, ForeignKey("users.id"), nullable=True)
    name = Column(String, nullable=False)
    project_name = Column(String, default="")
    report_date = Column(String, default="")
    report_type = Column(String, default="Daily")
    status = Column(String, default="Completed")
    author = Column(String, default="")
    summary = Column(Text, default="")
    trades_present_count = Column(Integer, default=0)
    critical_issues_count = Column(Integer, default=0)
    materials_received_summary = Column(String, default="")
    equipment_uptime_percent = Column(Integer, default=0)
    evm_status = Column(String, default="")
    voice_transcript = Column(Text, nullable=True)
    extracted_data = Column(JSON, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
