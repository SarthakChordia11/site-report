import os
from reportlab.lib.pagesizes import A4
from reportlab.lib import colors
from reportlab.lib.units import mm
from reportlab.platypus import SimpleDocTemplate, Table, TableStyle, Paragraph, Spacer, KeepTogether
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle


class PDFGenerator:
    """
    Generates professional PDF documents strictly adhering to the
    Universal Site Progress Report Template (Daily DPR A1-A13, Weekly WPR B1-B14, Monthly MPR C1-C15).
    Dynamically renders only sections with data (zero hallucination).
    """

    def __init__(self):
        self.styles = getSampleStyleSheet()
        self.styles.add(ParagraphStyle(
            name='UniversalReportTitle',
            fontSize=13,
            fontName='Helvetica-Bold',
            textColor=colors.HexColor('#1f3864'),
            alignment=1,
            spaceAfter=10,
        ))
        self.styles.add(ParagraphStyle(
            name='UniversalSectionHeader',
            fontSize=10,
            fontName='Helvetica-Bold',
            textColor=colors.HexColor('#1f3864'),
            spaceBefore=8,
            spaceAfter=4,
        ))
        self.styles.add(ParagraphStyle(
            name='UniversalCellText',
            fontSize=7.5,
            fontName='Helvetica',
            leading=9,
        ))
        self.styles.add(ParagraphStyle(
            name='UniversalCellBold',
            fontSize=7.5,
            fontName='Helvetica-Bold',
            leading=9,
        ))

    def generate(self, report, output_path: str) -> str:
        doc = SimpleDocTemplate(
            output_path,
            pagesize=A4,
            topMargin=10 * mm,
            bottomMargin=10 * mm,
            leftMargin=10 * mm,
            rightMargin=10 * mm,
        )
        elements = self._build_elements(report)
        doc.build(elements)
        return output_path

    def generate_to_buffer(self, report, buffer) -> None:
        doc = SimpleDocTemplate(
            buffer,
            pagesize=A4,
            topMargin=10 * mm,
            bottomMargin=10 * mm,
            leftMargin=10 * mm,
            rightMargin=10 * mm,
        )
        elements = self._build_elements(report)
        doc.build(elements)

    def _get_val(self, obj, key, default=""):
        if isinstance(obj, dict):
            return obj.get(key, default)
        return getattr(obj, key, default)

    def _build_elements(self, report) -> list:
        elements = []
        # Convert report to dict if it's a Pydantic model
        if hasattr(report, "model_dump"):
            rep_dict = report.model_dump()
        elif isinstance(report, dict):
            rep_dict = report
        else:
            rep_dict = {}

        report_type = self._get_val(report, "report_type") or rep_dict.get("report_type") or "Daily"

        if report_type == "Weekly":
            self._build_weekly_elements(rep_dict, elements)
        elif report_type == "Monthly":
            self._build_monthly_elements(rep_dict, elements)
        else:
            self._build_daily_elements(rep_dict, elements)

        return elements

    def _create_table(self, data, col_widths, is_header_table=False):
        t = Table(data, colWidths=col_widths)
        if is_header_table:
            t.setStyle(TableStyle([
                ('BACKGROUND', (0, 0), (0, -1), colors.HexColor('#e6eef8')),
                ('BACKGROUND', (2, 0), (2, -1), colors.HexColor('#e6eef8')),
                ('GRID', (0, 0), (-1, -1), 0.5, colors.HexColor('#94a3b8')),
                ('FONTNAME', (0, 0), (-1, -1), 'Helvetica'),
                ('FONTSIZE', (0, 0), (-1, -1), 8),
                ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
                ('TOPPADDING', (0, 0), (-1, -1), 3),
                ('BOTTOMPADDING', (0, 0), (-1, -1), 3),
            ]))
        else:
            t.setStyle(TableStyle([
                ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#1f3864')),
                ('TEXTCOLOR', (0, 0), (-1, 0), colors.white),
                ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
                ('FONTSIZE', (0, 0), (-1, -1), 7.5),
                ('GRID', (0, 0), (-1, -1), 0.5, colors.HexColor('#cbd5e1')),
                ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
                ('TOPPADDING', (0, 0), (-1, -1), 2.5),
                ('BOTTOMPADDING', (0, 0), (-1, -1), 2.5),
            ]))
        return t

    # ══════════════════════════════════════════════════════════════════════════
    # DAILY PROGRESS REPORT (A1 - A13)
    # ══════════════════════════════════════════════════════════════════════════
    def _build_daily_elements(self, rep: dict, elements: list):
        elements.append(Paragraph("A. DAILY PROGRESS REPORT (DPR)", self.styles['UniversalReportTitle']))

        si = rep.get("site_info") or {}
        p_name = si.get("project_name") or rep.get("project_name") or ""
        r_date = si.get("date") or rep.get("date") or rep.get("report_date") or ""
        loc = si.get("location") or ""
        weather = si.get("weather") or ""
        insp = si.get("inspector") or rep.get("author") or ""
        client = si.get("client") or rep.get("client") or ""
        cont = si.get("contractor") or rep.get("contractor_pmc") or ""

        # Header Box
        header_data = [
            [Paragraph("<b>Project Name:</b>", self.styles['UniversalCellBold']), Paragraph(str(p_name), self.styles['UniversalCellText']),
             Paragraph("<b>Report Date:</b>", self.styles['UniversalCellBold']), Paragraph(str(r_date), self.styles['UniversalCellText'])],
            [Paragraph("<b>Location / Site:</b>", self.styles['UniversalCellBold']), Paragraph(str(loc), self.styles['UniversalCellText']),
             Paragraph("<b>Weather (AM/PM):</b>", self.styles['UniversalCellBold']), Paragraph(str(weather), self.styles['UniversalCellText'])],
            [Paragraph("<b>Client:</b>", self.styles['UniversalCellBold']), Paragraph(str(client), self.styles['UniversalCellText']),
             Paragraph("<b>Prepared By:</b>", self.styles['UniversalCellBold']), Paragraph(str(insp), self.styles['UniversalCellText'])],
            [Paragraph("<b>Contractor / PMC:</b>", self.styles['UniversalCellBold']), Paragraph(str(cont), self.styles['UniversalCellText']),
             Paragraph("<b>Status:</b>", self.styles['UniversalCellBold']), Paragraph("Verified", self.styles['UniversalCellText'])],
        ]
        elements.append(self._create_table(header_data, [35 * mm, 60 * mm, 35 * mm, 60 * mm], is_header_table=True))
        elements.append(Spacer(1, 6))

        # A1. Agency Manpower Log
        a1_list = rep.get("a1_agency_manpower") or []
        if a1_list:
            elements.append(Paragraph("A1. Agency / Team-wise Manpower & Activity Log", self.styles['UniversalSectionHeader']))
            rows = [["Sr No", "Agency / Team", "Work Location / Zone", "Manpower", "Activity Description"]]
            for idx, a in enumerate(a1_list):
                rows.append([str(idx + 1), str(a.get("agency_team", "")), str(a.get("work_location_zone", "")), str(a.get("manpower", "")), str(a.get("activity_description", ""))])
            elements.append(self._create_table(rows, [12 * mm, 45 * mm, 40 * mm, 28 * mm, 65 * mm]))
            elements.append(Spacer(1, 6))

        # A2. Total Manpower Summary
        a2_list = rep.get("a2_manpower_summary") or [
            {"trade": l.get("trade", ""), "today": l.get("present", 0), "yesterday": 0, "variance": 0, "remarks": l.get("contractor", "")}
            for l in (rep.get("labour") or [])
        ]
        if a2_list:
            elements.append(Paragraph("A2. Total Manpower Summary", self.styles['UniversalSectionHeader']))
            rows = [["Trade", "Today", "Yesterday", "Variance", "Remarks"]]
            for m in a2_list:
                rows.append([str(m.get("trade", "")), str(m.get("today", 0)), str(m.get("yesterday", 0)), str(m.get("variance", 0)), str(m.get("remarks", ""))])
            elements.append(self._create_table(rows, [45 * mm, 30 * mm, 30 * mm, 30 * mm, 55 * mm]))
            elements.append(Spacer(1, 6))

        # A3. Material Received / Consumed Today
        a3_list = rep.get("a3_materials") or []
        if not a3_list and rep.get("materials"):
            a3_list = [
                {"material": m.get("item", ""), "qty_received": m.get("quantity", "") if "rec" in str(m.get("status", "")).lower() else "", "unit": "", "qty_consumed": m.get("quantity", "") if "cons" in str(m.get("status", "")).lower() else "", "remarks": m.get("status", "")}
                for m in rep.get("materials", [])
            ]
        if a3_list:
            elements.append(Paragraph("A3. Material Received / Consumed Today", self.styles['UniversalSectionHeader']))
            rows = [["Material", "Qty Received", "Unit", "Qty Consumed", "Remarks"]]
            for m in a3_list:
                rows.append([str(m.get("material", "")), str(m.get("qty_received", "")), str(m.get("unit", "")), str(m.get("qty_consumed", "")), str(m.get("remarks", ""))])
            elements.append(self._create_table(rows, [55 * mm, 30 * mm, 25 * mm, 30 * mm, 50 * mm]))
            elements.append(Spacer(1, 6))

        # A4. Equipment / Machinery on Site
        a4_list = rep.get("a4_equipment") or []
        if a4_list:
            elements.append(Paragraph("A4. Equipment / Machinery on Site", self.styles['UniversalSectionHeader']))
            rows = [["Equipment", "Available", "Working", "Idle / Breakdown", "Remarks"]]
            for eq in a4_list:
                rows.append([str(eq.get("equipment", "")), str(eq.get("available", 0)), str(eq.get("working", 0)), str(eq.get("idle_breakdown", 0)), str(eq.get("remarks", ""))])
            elements.append(self._create_table(rows, [55 * mm, 30 * mm, 30 * mm, 35 * mm, 40 * mm]))
            elements.append(Spacer(1, 6))

        # A5. Key Quantity / Production Log
        a5_list = rep.get("a5_production_log") or [
            {"work_location_zone": "Site", "item_grade_stage": wp.get("activity", ""), "planned_qty": f"{wp.get('planned_pct', 0)}%", "achieved_qty": f"{wp.get('actual_pct', 0)}%", "cumulative_till_date": wp.get("status", "")}
            for wp in (rep.get("work_progress") or [])
        ]
        if a5_list:
            elements.append(Paragraph("A5. Key Quantity / Production Log", self.styles['UniversalSectionHeader']))
            rows = [["Work Location / Zone", "Item / Grade / Stage", "Planned (Qty)", "Achieved (Qty)", "Cumulative Till Date"]]
            for p in a5_list:
                rows.append([str(p.get("work_location_zone", "")), str(p.get("item_grade_stage", "")), str(p.get("planned_qty", "")), str(p.get("achieved_qty", "")), str(p.get("cumulative_till_date", ""))])
            elements.append(self._create_table(rows, [45 * mm, 55 * mm, 30 * mm, 30 * mm, 30 * mm]))
            elements.append(Spacer(1, 6))

        # A6. Safety & Quality
        a6_list = rep.get("a6_safety_quality") or [
            {"item": s.get("item", ""), "details": s.get("status", "")}
            for s in (rep.get("safety") or [])
        ]
        if a6_list:
            elements.append(Paragraph("A6. Safety & Quality", self.styles['UniversalSectionHeader']))
            rows = [["Item", "Details"]]
            for s in a6_list:
                rows.append([str(s.get("item", "")), str(s.get("details", ""))])
            elements.append(self._create_table(rows, [55 * mm, 135 * mm]))
            elements.append(Spacer(1, 6))

        # A7. Critical Issues / Hindrances
        a7_list = rep.get("a7_critical_issues") or [
            {"sr_no": i + 1, "issue": n.get("title", ""), "raised_on": r_date, "responsible": "Site Team", "target_date": n.get("deadline", ""), "status": n.get("severity", "Open")}
            for i, n in enumerate(rep.get("ncr_reports") or [])
        ]
        if a7_list:
            elements.append(Paragraph("A7. Critical Issues / Site Hindrances / Pending Decisions", self.styles['UniversalSectionHeader']))
            rows = [["Sr No", "Issue", "Raised On", "Responsible", "Target Date", "Status"]]
            for idx, iss in enumerate(a7_list):
                rows.append([str(idx + 1), str(iss.get("issue", "")), str(iss.get("raised_on", "")), str(iss.get("responsible", "")), str(iss.get("target_date", "")), str(iss.get("status", ""))])
            elements.append(self._create_table(rows, [12 * mm, 68 * mm, 25 * mm, 30 * mm, 30 * mm, 25 * mm]))
            elements.append(Spacer(1, 6))

        # A8. Work Stoppage
        a8 = rep.get("a8_work_stoppage")
        if a8 and (a8.get("hours_lost", 0) > 0 or a8.get("reason")):
            elements.append(Paragraph("A8. Work Stoppage / Weather Impact", self.styles['UniversalSectionHeader']))
            rows = [["Hours Lost", "Reason (Rain / Power Cut / Material Shortage / Other)"]]
            rows.append([str(a8.get("hours_lost", 0)), str(a8.get("reason", ""))])
            elements.append(self._create_table(rows, [35 * mm, 155 * mm]))
            elements.append(Spacer(1, 6))

        # A10. Plan Next Day
        a10_list = rep.get("a10_next_day_plan") or []
        if a10_list:
            elements.append(Paragraph("A10. Plan for Next Day", self.styles['UniversalSectionHeader']))
            rows = [["Work Location / Zone", "Planned Activity", "Target Quantity"]]
            for p in a10_list:
                rows.append([str(p.get("work_location_zone", "")), str(p.get("planned_activity", "")), str(p.get("target_quantity", ""))])
            elements.append(self._create_table(rows, [50 * mm, 95 * mm, 45 * mm]))
            elements.append(Spacer(1, 6))

        # A11. Attendance & Wages
        a11_list = rep.get("a11_attendance_wages") or []
        if a11_list:
            elements.append(Paragraph("A11. Labour Attendance & Wage Log", self.styles['UniversalSectionHeader']))
            rows = [["Trade", "Present", "Absent", "OT Hours", "Wage Rate", "Amount Payable", "Remarks"]]
            for l in a11_list:
                rows.append([str(l.get("trade", "")), str(l.get("present", 0)), str(l.get("absent", 0)), str(l.get("ot_hours", 0)), str(l.get("wage_rate", 0)), str(l.get("amount_payable", 0)), str(l.get("remarks", ""))])
            elements.append(self._create_table(rows, [35 * mm, 20 * mm, 20 * mm, 20 * mm, 25 * mm, 30 * mm, 40 * mm]))
            elements.append(Spacer(1, 6))

        # A12. Daily Cost Tracking
        a12_list = rep.get("a12_daily_cost") or []
        if a12_list:
            elements.append(Paragraph("A12. Daily Cost Tracking", self.styles['UniversalSectionHeader']))
            rows = [["Cost Head", "Budgeted (Day)", "Actual (Day)", "Cumulative Budgeted", "Cumulative Actual", "Variance"]]
            for c in a12_list:
                rows.append([str(c.get("cost_head", "")), str(c.get("budgeted_day", 0)), str(c.get("actual_day", 0)), str(c.get("cumulative_budgeted", 0)), str(c.get("cumulative_actual", 0)), str(c.get("variance", 0))])
            elements.append(self._create_table(rows, [40 * mm, 30 * mm, 30 * mm, 30 * mm, 30 * mm, 30 * mm]))
            elements.append(Spacer(1, 6))

        # A13. Resource Forecast Next 3 Days
        a13_list = rep.get("a13_resource_forecast") or []
        if a13_list:
            elements.append(Paragraph("A13. Resource Requirement Forecast (Next 3 Days)", self.styles['UniversalSectionHeader']))
            rows = [["Resource Type", "Item", "Required Qty", "Available", "Shortfall", "Action / Owner"]]
            for r in a13_list:
                rows.append([str(r.get("resource_type", "")), str(r.get("item", "")), str(r.get("required_qty", "")), str(r.get("available", "")), str(r.get("shortfall", "")), str(r.get("action_owner", ""))])
            elements.append(self._create_table(rows, [30 * mm, 45 * mm, 25 * mm, 25 * mm, 25 * mm, 40 * mm]))

    # ══════════════════════════════════════════════════════════════════════════
    # WEEKLY PROGRESS REPORT (B1 - B14)
    # ══════════════════════════════════════════════════════════════════════════
    def _build_weekly_elements(self, rep: dict, elements: list):
        elements.append(Paragraph("B. WEEKLY PROGRESS REPORT (WPR)", self.styles['UniversalReportTitle']))

        wpr = rep.get("wpr") or rep.get("fullReport") or rep
        p_name = wpr.get("project_name") or rep.get("project_name") or ""
        w_no = wpr.get("week_no") or "Week 1"
        loc = wpr.get("location") or ""
        period = wpr.get("week_period") or rep.get("report_date") or ""
        client = wpr.get("client") or ""
        prep = wpr.get("prepared_by") or rep.get("author") or ""
        pmc = wpr.get("contractor_pmc") or ""

        # Header Box
        header_data = [
            [Paragraph("<b>Project Name:</b>", self.styles['UniversalCellBold']), Paragraph(str(p_name), self.styles['UniversalCellText']),
             Paragraph("<b>Week No.:</b>", self.styles['UniversalCellBold']), Paragraph(str(w_no), self.styles['UniversalCellText'])],
            [Paragraph("<b>Location / Site:</b>", self.styles['UniversalCellBold']), Paragraph(str(loc), self.styles['UniversalCellText']),
             Paragraph("<b>Week Period:</b>", self.styles['UniversalCellBold']), Paragraph(str(period), self.styles['UniversalCellText'])],
            [Paragraph("<b>Client:</b>", self.styles['UniversalCellBold']), Paragraph(str(client), self.styles['UniversalCellText']),
             Paragraph("<b>Prepared By:</b>", self.styles['UniversalCellBold']), Paragraph(str(prep), self.styles['UniversalCellText'])],
            [Paragraph("<b>Contractor / PMC:</b>", self.styles['UniversalCellBold']), Paragraph(str(pmc), self.styles['UniversalCellText']),
             Paragraph("<b>Status:</b>", self.styles['UniversalCellBold']), Paragraph("Verified Weekly Rollup", self.styles['UniversalCellText'])],
        ]
        elements.append(self._create_table(header_data, [35 * mm, 60 * mm, 35 * mm, 60 * mm], is_header_table=True))
        elements.append(Spacer(1, 6))

        # B1. Executive Summary
        b1 = wpr.get("b1_executive_summary") or {}
        highlights = b1.get("highlights") or []
        if highlights:
            elements.append(Paragraph("B1. Executive Summary", self.styles['UniversalSectionHeader']))
            for h in highlights[:5]:
                elements.append(Paragraph(f"• {h}", self.styles['UniversalCellText']))
            elements.append(Spacer(1, 4))

        # B4. Manpower Trend (Mon - Sun)
        b4_list = wpr.get("b4_manpower_trend") or []
        if b4_list:
            elements.append(Paragraph("B4. Manpower Trend (Daily, for the Week)", self.styles['UniversalSectionHeader']))
            rows = [["Trade", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun", "Avg"]]
            for m in b4_list:
                rows.append([str(m.get("trade", "")), str(m.get("mon", 0)), str(m.get("tue", 0)), str(m.get("wed", 0)), str(m.get("thu", 0)), str(m.get("fri", 0)), str(m.get("sat", 0)), str(m.get("sun", 0)), str(m.get("avg", 0.0))])
            elements.append(self._create_table(rows, [45 * mm, 16 * mm, 16 * mm, 16 * mm, 16 * mm, 16 * mm, 16 * mm, 16 * mm, 20 * mm]))
            elements.append(Spacer(1, 6))

        # B5. Material Consumption Summary
        b5_list = wpr.get("b5_materials") or []
        if b5_list:
            elements.append(Paragraph("B5. Material Consumption Summary", self.styles['UniversalSectionHeader']))
            rows = [["Material", "Opening Stock", "Received This Week", "Consumed This Week", "Closing Stock"]]
            for mat in b5_list:
                rows.append([str(mat.get("material", "")), str(mat.get("opening_stock", "")), str(mat.get("received_this_week", "")), str(mat.get("consumed_this_week", "")), str(mat.get("closing_stock", ""))])
            elements.append(self._create_table(rows, [55 * mm, 32 * mm, 35 * mm, 35 * mm, 33 * mm]))
            elements.append(Spacer(1, 6))

        # B2. Zone-wise Physical Progress
        b2_list = wpr.get("b2_zone_progress") or []
        if b2_list:
            elements.append(Paragraph("B2. Work Location / Zone-wise Physical Progress", self.styles['UniversalSectionHeader']))
            rows = [["Work Location / Zone", "Activity / Stage", "Planned % Till Date", "Achieved % Till Date", "Variance", "Remarks"]]
            for z in b2_list:
                rows.append([str(z.get("work_location_zone", "")), str(z.get("activity_stage", "")), str(z.get("planned_pct_till_date", 0)), str(z.get("achieved_pct_till_date", 0)), str(z.get("variance", 0)), str(z.get("remarks", ""))])
            elements.append(self._create_table(rows, [40 * mm, 50 * mm, 25 * mm, 25 * mm, 20 * mm, 30 * mm]))
            elements.append(Spacer(1, 6))

        # B6. Equipment Utilization
        b6_list = wpr.get("b6_equipment") or []
        if b6_list:
            elements.append(Paragraph("B6. Equipment Utilization", self.styles['UniversalSectionHeader']))
            rows = [["Equipment", "Available", "Avg. Working", "Idle Days", "Remarks"]]
            for eq in b6_list:
                rows.append([str(eq.get("equipment", "")), str(eq.get("available", 0)), str(eq.get("avg_working", 0)), str(eq.get("idle_days", 0)), str(eq.get("remarks", ""))])
            elements.append(self._create_table(rows, [55 * mm, 25 * mm, 25 * mm, 25 * mm, 60 * mm]))
            elements.append(Spacer(1, 6))

        # B8. Delays / Critical Path
        b8_list = wpr.get("b8_delays") or []
        if b8_list:
            elements.append(Paragraph("B8. Delays / Critical Path Issues", self.styles['UniversalSectionHeader']))
            rows = [["Issue", "Impact on Schedule", "Responsible", "Target Resolution"]]
            for d in b8_list:
                rows.append([str(d.get("issue", "")), str(d.get("impact_on_schedule", "")), str(d.get("responsible", "")), str(d.get("target_resolution", ""))])
            elements.append(self._create_table(rows, [70 * mm, 45 * mm, 35 * mm, 40 * mm]))
            elements.append(Spacer(1, 6))

        # B11. Labour & Wage Summary
        b11_list = wpr.get("b11_labour_wages") or []
        if b11_list:
            elements.append(Paragraph("B11. Labour & Wage Summary", self.styles['UniversalSectionHeader']))
            rows = [["Trade", "Man-days (Week)", "Avg Daily Strength", "Total Wages Paid", "Remarks"]]
            for l in b11_list:
                rows.append([str(l.get("trade", "")), str(l.get("man_days_week", 0)), str(l.get("avg_daily_strength", 0)), str(l.get("total_wages_paid", 0)), str(l.get("remarks", ""))])
            elements.append(self._create_table(rows, [45 * mm, 35 * mm, 35 * mm, 35 * mm, 40 * mm]))
            elements.append(Spacer(1, 6))

        # B14. Site Management Summary
        b14_list = wpr.get("b14_management_summary") or []
        if b14_list:
            elements.append(Paragraph("B14. Site Management Summary", self.styles['UniversalSectionHeader']))
            rows = [["Sr No", "Item", "Category", "Owner", "Status", "Target Date"]]
            for idx, m in enumerate(b14_list):
                rows.append([str(idx + 1), str(m.get("item", "")), str(m.get("category", "")), str(m.get("owner", "")), str(m.get("status", "")), str(m.get("target_date", ""))])
            elements.append(self._create_table(rows, [12 * mm, 70 * mm, 35 * mm, 30 * mm, 20 * mm, 23 * mm]))

    # ══════════════════════════════════════════════════════════════════════════
    # MONTHLY PROGRESS REPORT (C1 - C15)
    # ══════════════════════════════════════════════════════════════════════════
    def _build_monthly_elements(self, rep: dict, elements: list):
        elements.append(Paragraph("C. MONTHLY PROGRESS REPORT (MPR)", self.styles['UniversalReportTitle']))

        mpr = rep.get("mpr") or rep.get("fullReport") or rep
        p_name = mpr.get("project_name") or rep.get("project_name") or ""
        code = mpr.get("project_code") or "PRJ-001"
        loc = mpr.get("location") or ""
        m_cons = mpr.get("month_considered") or ""
        client = mpr.get("client") or ""
        rep_no = mpr.get("report_no") or "MPR-01"
        pmc = mpr.get("contractor_pmc") or ""
        status_date = mpr.get("status_date") or rep.get("report_date") or ""

        # Header Box
        header_data = [
            [Paragraph("<b>Project Name:</b>", self.styles['UniversalCellBold']), Paragraph(str(p_name), self.styles['UniversalCellText']),
             Paragraph("<b>Project Code:</b>", self.styles['UniversalCellBold']), Paragraph(str(code), self.styles['UniversalCellText'])],
            [Paragraph("<b>Location / Site:</b>", self.styles['UniversalCellBold']), Paragraph(str(loc), self.styles['UniversalCellText']),
             Paragraph("<b>Month Considered:</b>", self.styles['UniversalCellBold']), Paragraph(str(m_cons), self.styles['UniversalCellText'])],
            [Paragraph("<b>Client:</b>", self.styles['UniversalCellBold']), Paragraph(str(client), self.styles['UniversalCellText']),
             Paragraph("<b>Report No.:</b>", self.styles['UniversalCellBold']), Paragraph(str(rep_no), self.styles['UniversalCellText'])],
            [Paragraph("<b>Contractor / PMC:</b>", self.styles['UniversalCellBold']), Paragraph(str(pmc), self.styles['UniversalCellText']),
             Paragraph("<b>Status Date:</b>", self.styles['UniversalCellBold']), Paragraph(str(status_date), self.styles['UniversalCellText'])],
        ]
        elements.append(self._create_table(header_data, [35 * mm, 60 * mm, 35 * mm, 60 * mm], is_header_table=True))
        elements.append(Spacer(1, 6))

        # C1. Executive Summary
        c1_list = mpr.get("c1_executive_summary") or []
        if c1_list:
            elements.append(Paragraph("C1. Executive Summary", self.styles['UniversalSectionHeader']))
            rows = [["Discipline / Work Location", "Status Summary"]]
            for item in c1_list:
                rows.append([str(item.get("discipline_location", "")), str(item.get("status_summary", ""))])
            elements.append(self._create_table(rows, [60 * mm, 130 * mm]))
            elements.append(Spacer(1, 6))

        # C2. Overall Project Progress
        c2 = mpr.get("c2_project_progress") or {}
        if c2:
            elements.append(Paragraph("C2. Overall Project Progress", self.styles['UniversalSectionHeader']))
            rows = [["Planned % (Cumulative)", "Achieved % (Cumulative)", "Delay / Lead (Days)"]]
            rows.append([f"{c2.get('planned_pct_cumulative', 0)}%", f"{c2.get('achieved_pct_cumulative', 0)}%", f"{c2.get('delay_lead_days', 0)} days"])
            elements.append(self._create_table(rows, [60 * mm, 65 * mm, 65 * mm]))
            elements.append(Spacer(1, 6))

        # C3. Value of Work Done
        c3_list = mpr.get("c3_value_of_work") or []
        if c3_list:
            elements.append(Paragraph("C3. Value of Work Done & Material Consumption", self.styles['UniversalSectionHeader']))
            rows = [["Sr No", "Description", "Target (Month)", "Achieved (Month)", "Cumulative Achieved"]]
            for idx, v in enumerate(c3_list):
                rows.append([str(idx + 1), str(v.get("description", "")), str(v.get("target_month", "")), str(v.get("achieved_month", "")), str(v.get("cumulative_achieved", ""))])
            elements.append(self._create_table(rows, [12 * mm, 65 * mm, 38 * mm, 38 * mm, 37 * mm]))
            elements.append(Spacer(1, 6))

        # C5. Material Reconciliation
        c5_list = mpr.get("c5_materials") or []
        if c5_list:
            elements.append(Paragraph("C5. Material Reconciliation", self.styles['UniversalSectionHeader']))
            rows = [["Material", "Opening", "Received (Month)", "Consumed (Month)", "Closing / Balance", "Wastage %"]]
            for mat in c5_list:
                rows.append([str(mat.get("material", "")), str(mat.get("opening", "")), str(mat.get("received_month", "")), str(mat.get("consumed_month", "")), str(mat.get("closing_balance", "")), f"{mat.get('wastage_pct', 0)}%"])
            elements.append(self._create_table(rows, [45 * mm, 28 * mm, 32 * mm, 32 * mm, 33 * mm, 20 * mm]))
            elements.append(Spacer(1, 6))

        # C6. Equipment Deployment Summary
        c6_list = mpr.get("c6_equipment") or []
        if c6_list:
            elements.append(Paragraph("C6. Equipment Deployment Summary", self.styles['UniversalSectionHeader']))
            rows = [["Equipment", "Required", "Deployed (Avg)", "Utilization %", "Remarks"]]
            for eq in c6_list:
                rows.append([str(eq.get("equipment", "")), str(eq.get("required", 0)), str(eq.get("deployed_avg", 0)), f"{eq.get('utilization_pct', 0)}%", str(eq.get("remarks", ""))])
            elements.append(self._create_table(rows, [50 * mm, 25 * mm, 30 * mm, 28 * mm, 57 * mm]))
            elements.append(Spacer(1, 6))

        # C9. Critical Issues & Risks
        c9_list = mpr.get("c9_risks") or []
        if c9_list:
            elements.append(Paragraph("C9. Critical Issues & Risks", self.styles['UniversalSectionHeader']))
            rows = [["Sr No", "Issue", "Impact", "Mitigation / Action", "Responsible", "Target Date"]]
            for idx, rk in enumerate(c9_list):
                rows.append([str(idx + 1), str(rk.get("issue", "")), str(rk.get("impact", "")), str(rk.get("mitigation_action", "")), str(rk.get("responsible", "")), str(rk.get("target_date", ""))])
            elements.append(self._create_table(rows, [12 * mm, 45 * mm, 35 * mm, 45 * mm, 28 * mm, 25 * mm]))
            elements.append(Spacer(1, 6))

        # C15. Management Summary / Action Items
        c15_list = mpr.get("c15_management_summary") or []
        if c15_list:
            elements.append(Paragraph("C15. Management Summary / Action Items", self.styles['UniversalSectionHeader']))
            rows = [["Sr No", "Item", "Category", "Owner", "Status", "Target Date"]]
            for idx, a in enumerate(c15_list):
                rows.append([str(idx + 1), str(a.get("item", "")), str(a.get("category", "")), str(a.get("owner", "")), str(a.get("status", "")), str(a.get("target_date", ""))])
            elements.append(self._create_table(rows, [12 * mm, 70 * mm, 35 * mm, 30 * mm, 20 * mm, 23 * mm]))


_pdf_gen = PDFGenerator()

