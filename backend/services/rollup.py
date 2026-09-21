import uuid
from datetime import datetime
from sqlalchemy.orm import Session
from models.report import SiteReport

def trigger_rollups(site_id: str, db: Session, current_user_id: str = None, author_name: str = "System"):
    """
    Checks if enough Daily reports exist to create a Weekly report,
    and if enough Weekly reports exist to create a Monthly report.
    """
    # 1. Check Daily -> Weekly
    daily_reports = db.query(SiteReport).filter_by(site_id=site_id, report_type="Daily").order_by(SiteReport.created_at.asc()).all()
    weekly_reports = db.query(SiteReport).filter_by(site_id=site_id, report_type="Weekly").all()
    
    expected_weeklies = len(daily_reports) // 7
    if expected_weeklies > len(weekly_reports):
        for i in range(len(weekly_reports), expected_weeklies):
            week_dailies = daily_reports[i*7 : (i+1)*7]
            summary_text = "Weekly Rollup: \n" + "\n".join([r.summary for r in week_dailies if r.summary])
            total_trades = sum(r.trades_present_count for r in week_dailies)
            total_critical = sum(r.critical_issues_count for r in week_dailies)
            avg_uptime = sum(r.equipment_uptime_percent for r in week_dailies) // 7 if week_dailies else 0
            
            wr = SiteReport(
                id=str(uuid.uuid4()),
                site_id=site_id,
                author_id=current_user_id,
                name=f"Auto Weekly Report (W{i+1})",
                project_name=week_dailies[-1].project_name if week_dailies else "",
                report_date=datetime.now().isoformat(),
                report_type="Weekly",
                status="Completed",
                author="System Auto-Rollup",
                summary=summary_text[:1000],
                trades_present_count=total_trades,
                critical_issues_count=total_critical,
                equipment_uptime_percent=avg_uptime,
                evm_status=week_dailies[-1].evm_status if week_dailies else "",
                extracted_data={"is_rollup": True, "num_reports": 7}
            )
            db.add(wr)
        db.commit()

    # 2. Check Weekly -> Monthly
    weekly_reports = db.query(SiteReport).filter_by(site_id=site_id, report_type="Weekly").order_by(SiteReport.created_at.asc()).all()
    monthly_reports = db.query(SiteReport).filter_by(site_id=site_id, report_type="Monthly").all()
    
    expected_monthlies = len(weekly_reports) // 4
    if expected_monthlies > len(monthly_reports):
        for i in range(len(monthly_reports), expected_monthlies):
            month_weeklies = weekly_reports[i*4 : (i+1)*4]
            summary_text = "Monthly Rollup: \n" + "\n".join([r.summary for r in month_weeklies if r.summary])
            total_trades = sum(r.trades_present_count for r in month_weeklies)
            total_critical = sum(r.critical_issues_count for r in month_weeklies)
            avg_uptime = sum(r.equipment_uptime_percent for r in month_weeklies) // 4 if month_weeklies else 0
            
            mr = SiteReport(
                id=str(uuid.uuid4()),
                site_id=site_id,
                author_id=current_user_id,
                name=f"Auto Monthly Report (M{i+1})",
                project_name=month_weeklies[-1].project_name if month_weeklies else "",
                report_date=datetime.now().isoformat(),
                report_type="Monthly",
                status="Completed",
                author="System Auto-Rollup",
                summary=summary_text[:1000],
                trades_present_count=total_trades,
                critical_issues_count=total_critical,
                equipment_uptime_percent=avg_uptime,
                evm_status=month_weeklies[-1].evm_status if month_weeklies else "",
                extracted_data={"is_rollup": True, "num_reports": 4}
            )
            db.add(mr)
        db.commit()
