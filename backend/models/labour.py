from sqlalchemy import Column, String, Integer, Float, Date, Boolean, DateTime, ForeignKey, Text
from sqlalchemy.sql import func
from database import Base

class LabourAttendance(Base):
    __tablename__ = "labour_attendance"
    id = Column(String, primary_key=True)
    site_id = Column(String, ForeignKey("sites.id"), nullable=False)
    date = Column(Date, nullable=False)
    trade = Column(String, nullable=False)  # mason, helper, carpenter, etc.
    agency = Column(String, default="")
    location = Column(String, default="on_site")  # on_site / factory / casting_yard
    present = Column(Integer, default=0)
    absent = Column(Integer, default=0)
    ot_hours = Column(Float, default=0)
    remarks = Column(String, default="")
    created_at = Column(DateTime(timezone=True), server_default=func.now())

class LabourWage(Base):
    __tablename__ = "labour_wages"
    id = Column(String, primary_key=True)
    site_id = Column(String, ForeignKey("sites.id"), nullable=False)
    date = Column(Date, nullable=False)
    trade = Column(String, nullable=False)
    rate_per_day = Column(Float, default=0)
    ot_rate_per_hour = Column(Float, default=0)
    present = Column(Integer, default=0)
    ot_hours = Column(Float, default=0)
    total_wages = Column(Float, default=0)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

class SafetyInduction(Base):
    __tablename__ = "safety_inductions"
    id = Column(String, primary_key=True)
    site_id = Column(String, ForeignKey("sites.id"), nullable=False)
    worker_name = Column(String, nullable=False)
    trade = Column(String, default="")
    agency = Column(String, default="")
    inducted = Column(Boolean, default=False)
    induction_date = Column(Date, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

class LabourMobilization(Base):
    __tablename__ = "labour_mobilizations"
    id = Column(String, primary_key=True)
    site_id = Column(String, ForeignKey("sites.id"), nullable=False)
    trade = Column(String, nullable=False)
    agency = Column(String, default="")
    required_count = Column(Integer, default=0)
    mobilized_count = Column(Integer, default=0)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
