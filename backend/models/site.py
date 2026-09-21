from sqlalchemy import Column, String, Integer, Float, Enum, DateTime, Text
from sqlalchemy.sql import func
from database import Base
import enum

class SiteType(str, enum.Enum):
    road = "road"
    building = "building"
    precast = "precast"
    container = "container"

class SiteStatus(str, enum.Enum):
    active = "Active"
    on_schedule = "On Schedule"
    delayed = "Delayed"
    near_completion = "Near Completion"

class Site(Base):
    __tablename__ = "sites"
    id = Column(String, primary_key=True)
    name = Column(String, nullable=False)
    project_name = Column(String, nullable=False)
    client = Column(String, default="")
    contractor = Column(String, default="")
    location = Column(String, default="")
    site_type = Column(String, default=SiteType.building)
    status = Column(String, default=SiteStatus.active)
    progress_percent = Column(Float, default=0)
    active_workers = Column(Integer, default=0)
    weather = Column(String, default="")
    image = Column(String, default="")
    created_at = Column(DateTime(timezone=True), server_default=func.now())
