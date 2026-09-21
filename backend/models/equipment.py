from sqlalchemy import Column, String, Integer, Float, Date, DateTime, ForeignKey, Boolean
from sqlalchemy.sql import func
from database import Base

class EquipmentAsset(Base):
    __tablename__ = "equipment_assets"
    id = Column(String, primary_key=True)
    site_id = Column(String, ForeignKey("sites.id"), nullable=False)
    name = Column(String, nullable=False)  # Tower Crane, JCB, Boom Pump
    owned = Column(Boolean, default=False)  # False = rented
    vendor = Column(String, default="")
    daily_rate = Column(Float, default=0)
    rental_start = Column(Date, nullable=True)
    rental_end = Column(Date, nullable=True)
    operator_name = Column(String, default="")
    active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

class EquipmentLog(Base):
    __tablename__ = "equipment_logs"
    id = Column(String, primary_key=True)
    asset_id = Column(String, ForeignKey("equipment_assets.id"), nullable=False)
    site_id = Column(String, ForeignKey("sites.id"), nullable=False)
    date = Column(Date, nullable=False)
    working_hrs = Column(Float, default=0)
    idle_hrs = Column(Float, default=0)
    breakdown_hrs = Column(Float, default=0)
    idle_reason = Column(String, default="")
    breakdown_reason = Column(String, default="")
    remarks = Column(String, default="")
    created_at = Column(DateTime(timezone=True), server_default=func.now())
