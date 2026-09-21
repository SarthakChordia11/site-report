from sqlalchemy import Column, String, Float, Date, DateTime, ForeignKey, Integer
from sqlalchemy.sql import func
from database import Base

class CostBudget(Base):
    __tablename__ = "cost_budgets"
    id = Column(String, primary_key=True)
    site_id = Column(String, ForeignKey("sites.id"), nullable=False)
    category = Column(String, nullable=False)  # labour / material / equipment
    work_package = Column(String, default="overall")
    budget_amount = Column(Float, default=0)
    created_at = Column(DateTime(timezone=True), server_default=func.now())


class EVMSnapshot(Base):
    """Historical EVM data point for S-Curve and trend analysis."""
    __tablename__ = "evm_snapshots"
    id = Column(String, primary_key=True)
    site_id = Column(String, ForeignKey("sites.id"), nullable=False, index=True)
    snapshot_date = Column(Date, nullable=False)
    planned_value = Column(Float, default=0)
    earned_value = Column(Float, default=0)
    actual_cost = Column(Float, default=0)
    cpi = Column(Float, default=0)
    spi = Column(Float, default=0)
    cv = Column(Float, default=0)  # Cost Variance
    sv = Column(Float, default=0)  # Schedule Variance
    created_at = Column(DateTime(timezone=True), server_default=func.now())


class CostBaseline(Base):
    """Project budget baseline for EVM calculations."""
    __tablename__ = "cost_baselines"
    id = Column(String, primary_key=True)
    site_id = Column(String, ForeignKey("sites.id"), nullable=False, unique=True)
    total_budget = Column(Float, default=0)
    labour_budget = Column(Float, default=0)
    material_budget = Column(Float, default=0)
    equipment_budget = Column(Float, default=0)
    planned_start_date = Column(Date, nullable=True)
    planned_end_date = Column(Date, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
