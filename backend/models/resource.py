from sqlalchemy import Column, String, Integer, Float, Date, DateTime, ForeignKey, Text, Boolean
from sqlalchemy.sql import func
from database import Base

class MaterialItem(Base):
    __tablename__ = "material_items"
    id = Column(String, primary_key=True)
    site_id = Column(String, ForeignKey("sites.id"), nullable=False)
    name = Column(String, nullable=False)
    unit = Column(String, default="")  # bags, MT, cu.m, nos, sqm
    unit_rate = Column(Float, default=0)
    reorder_level = Column(Float, default=0)
    current_stock = Column(Float, default=0)
    mould_reuse_cycles = Column(Integer, default=0)  # precast/container
    created_at = Column(DateTime(timezone=True), server_default=func.now())

class MaterialLog(Base):
    __tablename__ = "material_logs"
    id = Column(String, primary_key=True)
    item_id = Column(String, ForeignKey("material_items.id"), nullable=False)
    site_id = Column(String, ForeignKey("sites.id"), nullable=False)
    date = Column(Date, nullable=False)
    received = Column(Float, default=0)
    consumed = Column(Float, default=0)
    closing_stock = Column(Float, default=0)
    wastage_pct = Column(Float, default=0)
    vendor_id = Column(String, nullable=True)
    invoice_no = Column(String, default="")
    remarks = Column(String, default="")
    created_at = Column(DateTime(timezone=True), server_default=func.now())

class FinishedElement(Base):  # Precast / Container specific
    __tablename__ = "finished_elements"
    id = Column(String, primary_key=True)
    site_id = Column(String, ForeignKey("sites.id"), nullable=False)
    element_id = Column(String, nullable=False)  # e.g. "Panel-A-001"
    element_type = Column(String, default="")  # slab, wall, module
    stage = Column(String, default="cast")  # cast, cured, ready, dispatched, erected
    cast_date = Column(Date, nullable=True)
    cure_complete_date = Column(Date, nullable=True)
    dispatch_date = Column(Date, nullable=True)
    erection_date = Column(Date, nullable=True)
    remarks = Column(String, default="")
    created_at = Column(DateTime(timezone=True), server_default=func.now())

class Dispatch(Base):
    __tablename__ = "dispatches"
    id = Column(String, primary_key=True)
    site_id = Column(String, ForeignKey("sites.id"), nullable=False)
    element_id = Column(String, nullable=True)  # for precast elements
    material_item_id = Column(String, nullable=True)  # for bulk material
    dispatch_type = Column(String, default="material")  # material / element
    date = Column(Date, nullable=False)
    transporter = Column(String, default="")
    vehicle_no = Column(String, default="")
    quantity = Column(String, default="")
    eta = Column(String, default="")
    received_confirmed = Column(Boolean, default=False)
    remarks = Column(String, default="")
    created_at = Column(DateTime(timezone=True), server_default=func.now())

class Vendor(Base):
    __tablename__ = "vendors"
    id = Column(String, primary_key=True)
    site_id = Column(String, ForeignKey("sites.id"), nullable=False)
    name = Column(String, nullable=False)
    vendor_type = Column(String, default="material")  # material / transport
    contact = Column(String, default="")
    on_time_pct = Column(Float, default=100)
    quality_issues = Column(Integer, default=0)
    active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
