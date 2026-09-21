import os
from reportlab.lib.pagesizes import A4
from reportlab.lib import colors
from reportlab.lib.units import mm
from reportlab.platypus import SimpleDocTemplate, Table, TableStyle, Paragraph, Spacer
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from models.dpr_models import DPRFullReport

class PDFGenerator:
    def __init__(self):
        self.styles = getSampleStyleSheet()
        self.styles.add(ParagraphStyle(name='ReportTitle', fontSize=14, fontName='Helvetica-Bold', textColor=colors.HexColor('#1f3864'), alignment=1, spaceAfter=15))
        self.styles.add(ParagraphStyle(name='SectionHeader', fontSize=11, fontName='Helvetica-Bold', textColor=colors.HexColor('#1f3864'), spaceBefore=10, spaceAfter=5))
        self.styles.add(ParagraphStyle(name='NormalText', fontSize=9, fontName='Helvetica'))

    def generate(self, report, output_path: str) -> str:
        doc = SimpleDocTemplate(output_path, pagesize=A4, topMargin=15*mm, bottomMargin=15*mm, leftMargin=15*mm, rightMargin=15*mm)
        elements = self._build_elements(report)
        doc.build(elements)
        return output_path

    def generate_to_buffer(self, report, buffer) -> None:
        """Generate PDF into an in-memory BytesIO buffer instead of a file path."""
        import io
        from reportlab.lib.pagesizes import A4
        from reportlab.platypus import SimpleDocTemplate
        # Build elements same as generate() but write to buffer
        doc = SimpleDocTemplate(buffer, pagesize=A4, topMargin=15*mm, bottomMargin=15*mm, leftMargin=15*mm, rightMargin=15*mm)
        elements = self._build_elements(report)
        doc.build(elements)

    def _build_elements(self, report) -> list:
        elements = []
        report_type = getattr(report, "report_type", "Daily")

        if report_type == "Weekly":
            title = "B. WEEKLY PROGRESS REPORT (WPR)"
        elif report_type == "Monthly":
            title = "C. MONTHLY PROGRESS REPORT (MPR)"
        else:
            title = "A. DAILY PROGRESS REPORT (DPR)"

        elements.append(Paragraph(title, self.styles['ReportTitle']))

        # Header Table
        si = report.site_info

        class FallbackSI:
            project_name = ""
            date = ""
            location = ""
            weather = ""
            inspector = ""

        if not si:
            si = FallbackSI()

        header_data = [
            ["Project Name:", si.project_name, "Report / Day No.:", si.date],
            ["Location / Site:", si.location, "Report Date:", si.date],
            ["Client:", "", "Weather (AM/PM):", si.weather],
            ["Contractor / PMC:", "", "Prepared By:", si.inspector]
        ]
        t = Table(header_data, colWidths=[35*mm, 55*mm, 35*mm, 55*mm])
        t.setStyle(TableStyle([
            ('BACKGROUND', (0,0), (0,-1), colors.HexColor('#e6e6e6')),
            ('BACKGROUND', (2,0), (2,-1), colors.HexColor('#e6e6e6')),
            ('GRID', (0,0), (-1,-1), 0.5, colors.grey),
            ('FONTNAME', (0,0), (0,-1), 'Helvetica-Bold'),
            ('FONTNAME', (2,0), (2,-1), 'Helvetica-Bold'),
            ('FONTSIZE', (0,0), (-1,-1), 9),
            ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
        ]))
        elements.append(t)
        elements.append(Spacer(1, 10))

        # A1. Manpower Log
        elements.append(Paragraph("A1. Agency / Team-wise Manpower & Activity Log", self.styles['SectionHeader']))
        mp_data = [["Sr No", "Agency / Team", "Work Location / Zone", "Manpower", "Activity Description", "Status", "Remarks"]]
        for idx, l in enumerate(report.labour or []):
            mp_data.append([str(idx+1), l.contractor, "Site", str(l.present), l.trade, "Active", l.productivity])
        if len(mp_data) == 1:
            mp_data.append(["", "", "", "", "", "", ""])

        t = Table(mp_data, colWidths=[10*mm, 30*mm, 35*mm, 20*mm, 45*mm, 15*mm, 25*mm])
        t.setStyle(TableStyle([
            ('BACKGROUND', (0,0), (-1,0), colors.HexColor('#1f3864')),
            ('TEXTCOLOR', (0,0), (-1,0), colors.white),
            ('GRID', (0,0), (-1,-1), 0.5, colors.grey),
            ('FONTNAME', (0,0), (-1,0), 'Helvetica-Bold'),
            ('FONTSIZE', (0,0), (-1,-1), 8),
        ]))
        elements.append(t)
        elements.append(Spacer(1, 10))

        # A3. Material Received / Consumed
        elements.append(Paragraph("A3. Material Received / Consumed Today", self.styles['SectionHeader']))
        mat_data = [["Material", "Qty Received", "Unit", "Qty Consumed", "Remarks"]]
        for m in (report.materials or []):
            mat_data.append([m.item, m.quantity if "rec" in (m.status or "").lower() else "0", "", m.quantity if "cons" in (m.status or "").lower() else "0", m.status])
        if len(mat_data) == 1:
            mat_data.append(["", "", "", "", ""])

        t = Table(mat_data, colWidths=[50*mm, 30*mm, 20*mm, 30*mm, 50*mm])
        t.setStyle(TableStyle([
            ('BACKGROUND', (0,0), (-1,0), colors.HexColor('#1f3864')),
            ('TEXTCOLOR', (0,0), (-1,0), colors.white),
            ('GRID', (0,0), (-1,-1), 0.5, colors.grey),
            ('FONTNAME', (0,0), (-1,0), 'Helvetica-Bold'),
            ('FONTSIZE', (0,0), (-1,-1), 8),
        ]))
        elements.append(t)
        elements.append(Spacer(1, 10))

        # A6. Safety
        elements.append(Paragraph("A6. Safety & Quality", self.styles['SectionHeader']))
        safe_data = [["Item", "Details"]]
        for s in (report.safety or []):
            safe_data.append([s.item, s.status])
        if len(safe_data) == 1:
            safe_data.append(["", ""])

        t = Table(safe_data, colWidths=[50*mm, 130*mm])
        t.setStyle(TableStyle([
            ('BACKGROUND', (0,0), (-1,0), colors.HexColor('#1f3864')),
            ('TEXTCOLOR', (0,0), (-1,0), colors.white),
            ('GRID', (0,0), (-1,-1), 0.5, colors.grey),
            ('FONTNAME', (0,0), (-1,0), 'Helvetica-Bold'),
            ('FONTSIZE', (0,0), (-1,-1), 8),
        ]))
        elements.append(t)
        elements.append(Spacer(1, 10))

        # A7. Critical Issues
        elements.append(Paragraph("A7. Critical Issues / Site Hindrances", self.styles['SectionHeader']))
        ncr_data = [["Sr No", "Issue", "Raised On", "Responsible", "Target Date", "Status"]]
        for idx, n in enumerate(report.ncr_reports or []):
            ncr_data.append([str(idx+1), n.title, si.date, "PM", n.deadline, n.severity])
        if len(ncr_data) == 1:
            ncr_data.append(["", "", "", "", "", ""])

        t = Table(ncr_data, colWidths=[10*mm, 70*mm, 20*mm, 30*mm, 25*mm, 25*mm])
        t.setStyle(TableStyle([
            ('BACKGROUND', (0,0), (-1,0), colors.HexColor('#1f3864')),
            ('TEXTCOLOR', (0,0), (-1,0), colors.white),
            ('GRID', (0,0), (-1,-1), 0.5, colors.grey),
            ('FONTNAME', (0,0), (-1,0), 'Helvetica-Bold'),
            ('FONTSIZE', (0,0), (-1,-1), 8),
        ]))
        elements.append(t)

        return elements

_pdf_gen = PDFGenerator()
