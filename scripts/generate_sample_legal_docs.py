import os
import shutil
from reportlab.lib.pagesizes import letter
from reportlab.platypus import (
    SimpleDocTemplate,
    Paragraph,
    Spacer,
    Table,
    TableStyle,
    HRFlowable,
    KeepTogether,
)
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib import colors
from reportlab.pdfgen import canvas

class NumberedCanvas(canvas.Canvas):
    """
    Two-pass canvas to dynamically compute and draw total page count
    along with running header and footer.
    """
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self._saved_page_states = []

    def showPage(self):
        self._saved_page_states.append(dict(self.__dict__))
        self._startPage()

    def save(self):
        num_pages = len(self._saved_page_states)
        for state in self._saved_page_states:
            self.__dict__.update(state)
            self.draw_page_decorations(num_pages)
            super().showPage()
        super().save()

    def draw_page_decorations(self, page_count):
        self.saveState()
        self.setFont("Helvetica", 8)
        self.setFillColor(colors.HexColor("#64748B"))  # Slate-500

        # Running header (pages 2+)
        if self._pageNumber > 1:
            self.drawString(54, 750, getattr(self, "doc_title", "LEGAL DOCUMENT"))
            self.drawRightString(612 - 54, 750, getattr(self, "doc_ref", "CONFIDENTIAL"))
            self.setStrokeColor(colors.HexColor("#CBD5E1"))
            self.setLineWidth(0.5)
            self.line(54, 742, 612 - 54, 742)

        # Running footer (all pages)
        self.setStrokeColor(colors.HexColor("#E2E8F0"))
        self.setLineWidth(0.5)
        self.line(54, 45, 612 - 54, 45)

        self.drawString(54, 32, "CONFIDENTIAL & PROPRIETARY — LEGAL CONTRACT SAMPLE")
        page_str = f"Page {self._pageNumber} of {page_count}"
        self.drawRightString(612 - 54, 32, page_str)
        self.restoreState()


def build_styles():
    base_styles = getSampleStyleSheet()

    styles = {
        'DocTitle': ParagraphStyle(
            'DocTitle',
            parent=base_styles['Normal'],
            fontName='Helvetica-Bold',
            fontSize=18,
            leading=22,
            textColor=colors.HexColor('#0F172A'),
            alignment=0,
            spaceAfter=4,
        ),
        'DocSubtitle': ParagraphStyle(
            'DocSubtitle',
            parent=base_styles['Normal'],
            fontName='Helvetica',
            fontSize=10,
            leading=14,
            textColor=colors.HexColor('#475569'),
            spaceAfter=12,
        ),
        'MetaBox': ParagraphStyle(
            'MetaBox',
            parent=base_styles['Normal'],
            fontName='Helvetica',
            fontSize=8.5,
            leading=12,
            textColor=colors.HexColor('#334155'),
        ),
        'MetaBoxBold': ParagraphStyle(
            'MetaBoxBold',
            parent=base_styles['Normal'],
            fontName='Helvetica-Bold',
            fontSize=8.5,
            leading=12,
            textColor=colors.HexColor('#0F172A'),
        ),
        'Heading1': ParagraphStyle(
            'Heading1',
            parent=base_styles['Normal'],
            fontName='Helvetica-Bold',
            fontSize=12,
            leading=16,
            textColor=colors.HexColor('#1E293B'),
            spaceBefore=12,
            spaceAfter=6,
            keepWithNext=True,
        ),
        'Heading2': ParagraphStyle(
            'Heading2',
            parent=base_styles['Normal'],
            fontName='Helvetica-Bold',
            fontSize=10,
            leading=14,
            textColor=colors.HexColor('#2563EB'),
            spaceBefore=8,
            spaceAfter=4,
            keepWithNext=True,
        ),
        'Body': ParagraphStyle(
            'Body',
            parent=base_styles['Normal'],
            fontName='Helvetica',
            fontSize=9,
            leading=13.5,
            textColor=colors.HexColor('#1E293B'),
            spaceAfter=6,
        ),
        'BodyBold': ParagraphStyle(
            'BodyBold',
            parent=base_styles['Normal'],
            fontName='Helvetica-Bold',
            fontSize=9,
            leading=13.5,
            textColor=colors.HexColor('#0F172A'),
        ),
        'HighlightBox': ParagraphStyle(
            'HighlightBox',
            parent=base_styles['Normal'],
            fontName='Helvetica',
            fontSize=8.5,
            leading=12.5,
            textColor=colors.HexColor('#1E3A8A'),
        ),
        'WarningBox': ParagraphStyle(
            'WarningBox',
            parent=base_styles['Normal'],
            fontName='Helvetica',
            fontSize=8.5,
            leading=12.5,
            textColor=colors.HexColor('#7F1D1D'),
        ),
        'TableHeader': ParagraphStyle(
            'TableHeader',
            parent=base_styles['Normal'],
            fontName='Helvetica-Bold',
            fontSize=8.5,
            leading=11,
            textColor=colors.HexColor('#0F172A'),
        ),
        'TableCell': ParagraphStyle(
            'TableCell',
            parent=base_styles['Normal'],
            fontName='Helvetica',
            fontSize=8,
            leading=11,
            textColor=colors.HexColor('#334155'),
        ),
        'TableCellBold': ParagraphStyle(
            'TableCellBold',
            parent=base_styles['Normal'],
            fontName='Helvetica-Bold',
            fontSize=8,
            leading=11,
            textColor=colors.HexColor('#0F172A'),
        ),
        'SignName': ParagraphStyle(
            'SignName',
            parent=base_styles['Normal'],
            fontName='Helvetica-Bold',
            fontSize=9,
            leading=12,
            textColor=colors.HexColor('#0F172A'),
        ),
        'SignRole': ParagraphStyle(
            'SignRole',
            parent=base_styles['Normal'],
            fontName='Helvetica',
            fontSize=8.5,
            leading=11,
            textColor=colors.HexColor('#475569'),
        ),
    }
    return styles


def create_document_v1(output_path):
    """
    Generates Document 1: Master_Services_Agreement_v1.pdf
    Baseline Contract with standard clauses, Net 30, NY jurisdiction, $250k liability cap.
    """
    doc = SimpleDocTemplate(
        output_path,
        pagesize=letter,
        leftMargin=54,
        rightMargin=54,
        topMargin=54,
        bottomMargin=54,
    )

    styles = build_styles()
    story = []

    # Document Header Title
    story.append(Paragraph("MASTER SERVICES AGREEMENT", styles['DocTitle']))
    story.append(Paragraph("Contract Reference: <b>MSA-2026-001-V1</b> &nbsp;|&nbsp; Effective Date: <b>January 15, 2026</b>", styles['DocSubtitle']))
    story.append(HRFlowable(width="100%", thickness=1.5, color=colors.HexColor("#2563EB"), spaceAfter=10))

    # Parties Metadata Card Table
    parties_data = [
        [
            Paragraph("<b>SERVICE PROVIDER / CONTRACTOR:</b><br/><b>Acme Cloud Dynamics Inc.</b><br/>100 Innovation Way, Suite 400<br/>New York, NY 10001<br/>Notice Contact: legal@acmeclouddynamics.com", styles['MetaBox']),
            Paragraph("<b>CLIENT / CUSTOMER:</b><br/><b>Apex Global Retail LLC</b><br/>500 Madison Avenue, 18th Floor<br/>New York, NY 10022<br/>Notice Contact: contracts@apexretailglobal.com", styles['MetaBox']),
        ]
    ]
    parties_table = Table(parties_data, colWidths=[245, 245])
    parties_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, -1), colors.HexColor("#F8FAFC")),
        ('BOX', (0, 0), (-1, -1), 1, colors.HexColor("#CBD5E1")),
        ('VALIGN', (0, 0), (-1, -1), 'TOP'),
        ('TOPPADDING', (0, 0), (-1, -1), 8),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 8),
        ('LEFTPADDING', (0, 0), (-1, -1), 10),
        ('RIGHTPADDING', (0, 0), (-1, -1), 10),
    ]))
    story.append(parties_table)
    story.append(Spacer(1, 10))

    # Recitals
    story.append(Paragraph("RECITALS & PREAMBLE", styles['Heading1']))
    story.append(Paragraph(
        "This Master Services Agreement (\"Agreement\") is entered into and made effective as of <b>January 15, 2026</b> (\"Effective Date\"), "
        "by and between <b>Acme Cloud Dynamics Inc.</b>, a Delaware corporation having offices at 100 Innovation Way, Suite 400, New York, NY 10001 "
        "(\"Service Provider\"), and <b>Apex Global Retail LLC</b>, a New York limited liability company having offices at 500 Madison Avenue, 18th Floor, "
        "New York, NY 10022 (\"Client\"). Service Provider and Client may individually be referred to as a \"Party\" and collectively as the \"Parties\".",
        styles['Body']
    ))
    story.append(Paragraph(
        "<b>WHEREAS</b>, Service Provider provides enterprise cloud migration, managed hosting infrastructure, and automated data synchronization services; and<br/>"
        "<b>WHEREAS</b>, Client desires to retain Service Provider to implement, migrate, support, and maintain Client's multi-region cloud workloads in accordance with the terms herein.",
        styles['Body']
    ))

    # Section 1
    story.append(Paragraph("SECTION 1 — SCOPE OF SERVICES & MILESTONE DEADLINES", styles['Heading1']))
    story.append(Paragraph(
        "<b>1.1 Performance of Services:</b> Service Provider shall provide the technical deliverables, software engineering, and cloud managed infrastructure set forth in Statement of Work #1 (\"SOW #1\"). All work shall be executed in a professional, workmanlike manner adhering to prevailing industry standards.",
        styles['Body']
    ))
    story.append(Paragraph(
        "<b>1.2 Affirmative Project Deadlines & Milestones:</b> The Parties hereby agree to the following contractual project milestones and firm delivery dates:",
        styles['Body']
    ))

    milestone_data = [
        [Paragraph("Milestone Description", styles['TableHeader']), Paragraph("Delivery Target Date", styles['TableHeader']), Paragraph("Obligated Party", styles['TableHeader']), Paragraph("Acceptance Criteria", styles['TableHeader'])],
        [Paragraph("Milestone 1: Multi-Region Infrastructure Architecture Plan", styles['TableCell']), Paragraph("<b>March 15, 2026</b>", styles['TableCell']), Paragraph("Service Provider", styles['TableCell']), Paragraph("Full architecture diagram & sign-off", styles['TableCell'])],
        [Paragraph("Milestone 2: Phase 1 Database & Asset Migration Deliverable", styles['TableCell']), Paragraph("<b>October 15, 2026</b>", styles['TableCell']), Paragraph("Service Provider", styles['TableCell']), Paragraph("Production verification <0.01% error rate", styles['TableCell'])],
        [Paragraph("Milestone 3: Security & SOC 2 Compliance Audit Package", styles['TableCell']), Paragraph("<b>November 30, 2026</b>", styles['TableCell']), Paragraph("Service Provider", styles['TableCell']), Paragraph("Third-party auditor validation report", styles['TableCell'])],
        [Paragraph("Milestone 4: Client User Acceptance Sign-Off", styles['TableCell']), Paragraph("<b>December 20, 2026</b>", styles['TableCell']), Paragraph("Client", styles['TableCell']), Paragraph("Formal written acceptance certificate", styles['TableCell'])],
    ]
    ms_table = Table(milestone_data, colWidths=[160, 105, 95, 144])
    ms_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor("#EFF6FF")),
        ('GRID', (0, 0), (-1, -1), 0.5, colors.HexColor("#CBD5E1")),
        ('VALIGN', (0, 0), (-1, -1), 'TOP'),
        ('TOPPADDING', (0, 0), (-1, -1), 4),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 4),
        ('LEFTPADDING', (0, 0), (-1, -1), 6),
        ('RIGHTPADDING', (0, 0), (-1, -1), 6),
    ]))
    story.append(ms_table)
    story.append(Spacer(1, 8))

    # Section 2
    story.append(Paragraph("SECTION 2 — INVOICING, FEES & PAYMENT TERMS", styles['Heading1']))
    story.append(Paragraph(
        "<b>2.1 Contract Sum:</b> Client shall pay Service Provider an aggregate contract sum of <b>$180,000.00 USD</b> for the Initial Term, invoiced in equal monthly installments of <b>$15,000.00 USD</b> on the first calendar day of each operating month.",
        styles['Body']
    ))
    story.append(Paragraph(
        "<b>2.2 Payment Terms (Net 30):</b> All properly submitted and undisputed invoices shall be due and payable within <b>thirty (30) calendar days (Net 30)</b> of the invoice issuance date.",
        styles['Body']
    ))
    story.append(Paragraph(
        "<b>2.3 Late Payment Interest:</b> Any undisputed amount not paid within the required thirty (30) day timeframe shall accrue interest at the rate of <b>1.5% per month</b> (or the maximum lawful rate permitted under applicable state law, whichever is lower), calculated daily from the due date until paid in full.",
        styles['Body']
    ))
    story.append(Paragraph(
        "<b>2.4 Taxes & Withholdings:</b> Stated fees are exclusive of applicable federal, state, or municipal sales and use taxes, which shall be remitted by Client unless a valid tax exemption certificate is provided prior to billing.",
        styles['Body']
    ))

    # Section 3
    story.append(Paragraph("SECTION 3 — INTELLECTUAL PROPERTY & WORK PRODUCT", styles['Heading1']))
    story.append(Paragraph(
        "<b>3.1 Work Made for Hire:</b> All custom software code, documentation, workflows, and deliverables created specifically for Client under this Agreement (\"Deliverables\") shall be deemed \"work made for hire\" owned exclusively by Client upon receipt of full payment.",
        styles['Body']
    ))
    story.append(Paragraph(
        "<b>3.2 Pre-Existing IP & Tools:</b> Service Provider retains sole and exclusive ownership of its pre-existing libraries, toolkits, scaffolding, algorithms, and general know-how (\"Background IP\"). Service Provider grants Client a perpetual, worldwide, non-exclusive, royalty-free license to use Background IP solely as integrated within the Deliverables.",
        styles['Body']
    ))

    # Section 4
    story.append(Paragraph("SECTION 4 — CONFIDENTIALITY & NON-DISCLOSURE", styles['Heading1']))
    story.append(Paragraph(
        "<b>4.1 Definition of Confidential Information:</b> \"Confidential Information\" refers to non-public technical, business, customer, or financial data disclosed by one Party (\"Disclosing Party\") to the other (\"Receiving Party\").",
        styles['Body']
    ))
    story.append(Paragraph(
        "<b>4.2 Standard of Protection:</b> Receiving Party agrees to protect Confidential Information with the same degree of care it exercises with respect to its own sensitive information, but in no case less than reasonable care.",
        styles['Body']
    ))
    story.append(Paragraph(
        "<b>4.3 Survival Period:</b> The obligations of non-disclosure and restricted use under this Section 4 shall survive the termination or expiration of this Agreement for a period of <b>three (3) years</b>.",
        styles['Body']
    ))

    # Section 5
    story.append(Paragraph("SECTION 5 — DATA SECURITY & AFFIRMATIVE NOTIFICATION DUTIES", styles['Heading1']))
    story.append(Paragraph(
        "<b>5.1 Safeguards:</b> Service Provider shall maintain commercially reasonable technical, physical, and organizational safeguards compliant with SOC 2 Type II controls to ensure the confidentiality, integrity, and availability of Client data.",
        styles['Body']
    ))
    story.append(Paragraph(
        "<b>5.2 Affirmative Duty — 48-Hour Security Incident Notice:</b> In the event of any confirmed security incident, data breach, or unauthorized access to Client PII or systems, Service Provider has an affirmative duty to notify Client in writing within <b>forty-eight (48) hours</b> of initial discovery, followed by regular status updates.",
        styles['Body']
    ))

    # Section 6
    story.append(Paragraph("SECTION 6 — REPRESENTATIONS & WARRANTIES", styles['Heading1']))
    story.append(Paragraph(
        "<b>6.1 Deliverable Warranty:</b> Service Provider warrants that for a period of <b>ninety (90) days</b> following acceptance, the Deliverables will substantially conform to the agreed written specifications in SOW #1.",
        styles['Body']
    ))
    story.append(Paragraph(
        "<b>6.2 Disclaimer:</b> EXCEPT FOR THE EXPRESS WARRANTIES IN THIS SECTION, NEITHER PARTY MAKES ANY WARRANTIES OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING IMPLIED WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, OR NON-INFRINGEMENT.",
        styles['Body']
    ))

    # Section 7 - Limitation of Liability
    story.append(Paragraph("SECTION 7 — LIMITATION OF LIABILITY", styles['Heading1']))
    story.append(Paragraph(
        "<b>7.1 Aggregate Liability Ceiling:</b> TO THE MAXIMUM EXTENT PERMITTED UNDER APPLICABLE LAW, IN NO EVENT SHALL EITHER PARTY'S AGGREGATE CUMULATIVE LIABILITY ARISING OUT OF OR RELATING TO THIS AGREEMENT EXCEED THE TOTAL FEES PAID OR PAYABLE BY CLIENT UNDER THIS AGREEMENT IN THE TWELVE (12) MONTHS PRECEDING THE CLAIM, OR <b>$250,000.00 USD</b>, WHICHEVER IS LESS.",
        styles['Body']
    ))
    story.append(Paragraph(
        "<b>7.2 Consequential Damages Waiver:</b> IN NO EVENT SHALL EITHER PARTY BE LIABLE FOR ANY INDIRECT, INCIDENTAL, CONSEQUENTIAL, SPECIAL, EXEMPLARY, OR PUNITIVE DAMAGES, INCLUDING LOSS OF PROFITS, DATA LOSS, OR BUSINESS INTERRUPTION.",
        styles['Body']
    ))

    # Section 8 - Indemnification
    story.append(Paragraph("SECTION 8 — INDEMNIFICATION & RISK ALLOCATION", styles['Heading1']))
    story.append(Paragraph(
        "<b>8.1 Intellectual Property Indemnification:</b> Service Provider agrees to defend, indemnify, and hold harmless Client, its officers, and employees against third-party claims alleging that the Deliverables infringe a valid United States patent, copyright, or trademark.",
        styles['Body']
    ))
    # Risk note callout
    story.append(Paragraph(
        "<b>8.2 Uncapped Indemnity Carve-Out (Legal Review Flag):</b> Liability arising under Service Provider's indemnification obligations in Section 8.1 shall NOT be subject to the limitation of liability cap set forth in Section 7.1.",
        styles['WarningBox']
    ))
    story.append(Spacer(1, 4))

    # Section 9 - Term and Termination
    story.append(Paragraph("SECTION 9 — TERM, RENEWAL & TERMINATION", styles['Heading1']))
    story.append(Paragraph(
        "<b>9.1 Initial Term & Automatic Renewal:</b> The initial term of this Agreement shall commence on <b>January 15, 2026</b> and continue for twelve (12) months through <b>January 14, 2027</b> (\"Initial Term\"). This Agreement shall automatically renew for successive twelve (12) month terms unless either Party provides written notice of non-renewal at least <b>sixty (60) calendar days</b> prior to expiration.",
        styles['Body']
    ))
    story.append(Paragraph(
        "<b>9.2 Clause 14.2 / 9.2 — Termination for Convenience:</b> Either Party may terminate this Agreement or any Statement of Work without cause and for convenience upon providing at least <b>thirty (30) calendar days' advance written notice</b> to the other Party.",
        styles['Body']
    ))
    story.append(Paragraph(
        "<b>9.3 Termination for Material Cause:</b> Either Party may immediately terminate this Agreement upon written notice if the other Party materially breaches any term and fails to cure such breach within <b>fifteen (15) calendar days</b> following receipt of written notice.",
        styles['Body']
    ))

    # Section 10 - Governing Law
    story.append(Paragraph("SECTION 10 — GOVERNING LAW & DISPUTE RESOLUTION", styles['Heading1']))
    story.append(Paragraph(
        "<b>10.1 Governing Law:</b> This Agreement and any disputes arising out of it shall be governed by and construed in accordance with the substantive laws of the <b>State of New York</b>, without giving effect to conflict of law principles.",
        styles['Body']
    ))
    story.append(Paragraph(
        "<b>10.2 Mandatory Arbitration:</b> Any dispute, claim, or controversy arising out of this Agreement shall be resolved through final and binding arbitration administered by the <b>American Arbitration Association (AAA)</b> in <b>New York County, New York</b>.",
        styles['Body']
    ))

    # Signatures
    story.append(Spacer(1, 10))
    story.append(Paragraph("IN WITNESS WHEREOF, the Parties have executed this Master Services Agreement as of the Effective Date.", styles['BodyBold']))
    story.append(Spacer(1, 6))

    sig_data = [
        [
            Paragraph("<b>FOR SERVICE PROVIDER:</b><br/><b>Acme Cloud Dynamics Inc.</b><br/><br/><br/>____________________________________<br/>By: <b>Marcus Vance</b><br/>Title: <b>Chief Executive Officer</b><br/>Date: <b>January 15, 2026</b>", styles['TableCell']),
            Paragraph("<b>FOR CLIENT:</b><br/><b>Apex Global Retail LLC</b><br/><br/><br/>____________________________________<br/>By: <b>Elena Rostova</b><br/>Title: <b>Chief Operating Officer</b><br/>Date: <b>January 15, 2026</b>", styles['TableCell']),
        ]
    ]
    sig_table = Table(sig_data, colWidths=[245, 245])
    sig_table.setStyle(TableStyle([
        ('BOX', (0, 0), (-1, -1), 1, colors.HexColor("#CBD5E1")),
        ('BACKGROUND', (0, 0), (-1, -1), colors.HexColor("#F8FAFC")),
        ('VALIGN', (0, 0), (-1, -1), 'TOP'),
        ('TOPPADDING', (0, 0), (-1, -1), 10),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 10),
        ('LEFTPADDING', (0, 0), (-1, -1), 10),
        ('RIGHTPADDING', (0, 0), (-1, -1), 10),
    ]))
    story.append(KeepTogether(sig_table))

    def on_first_page(canvas_obj, doc_obj):
        canvas_obj.doc_title = "MASTER SERVICES AGREEMENT"
        canvas_obj.doc_ref = "MSA-2026-001-V1"

    doc.build(story, canvasmaker=NumberedCanvas, onFirstPage=on_first_page)
    print(f"Successfully generated Document 1: {output_path}")


def create_document_v2(output_path):
    """
    Generates Document 2: Master_Services_Agreement_v2_Amended.pdf
    Amended & Restated Agreement (Version 2.0).
    Features deliberate high-impact changes for comparison and conflict testing:
    - Net 60 payment terms (changed from Net 30)
    - 2.0% late payment penalty (changed from 1.5%)
    - $1,000,000 liability cap with confidentiality/breach carve-outs (changed from $250k)
    - 15-day termination for convenience notice (changed from 30 days)
    - $15,000 Early Termination Fee penalty (new clause!)
    - 24-hour breach notice requirement + 10-day forensic report duty (changed from 48 hrs)
    - State of Delaware jurisdiction (changed from State of New York AAA arbitration)
    - Strict AI model training restriction clause (new clause!)
    """
    doc = SimpleDocTemplate(
        output_path,
        pagesize=letter,
        leftMargin=54,
        rightMargin=54,
        topMargin=54,
        bottomMargin=54,
    )

    styles = build_styles()
    story = []

    # Document Header Title
    story.append(Paragraph("AMENDED & RESTATED MASTER SERVICES AGREEMENT", styles['DocTitle']))
    story.append(Paragraph("Contract Reference: <b>MSA-2026-001-REV2</b> &nbsp;|&nbsp; Effective Date: <b>April 1, 2026</b> (Superseding v1.0)", styles['DocSubtitle']))
    story.append(HRFlowable(width="100%", thickness=1.5, color=colors.HexColor("#DC2626"), spaceAfter=10))

    # Version comparison badge notice
    story.append(Paragraph(
        "<b>AMENDMENT NOTICE:</b> This Agreement amends, restates, and supersedes in its entirety the Master Services Agreement dated January 15, 2026. "
        "Key revisions pertain to payment cycles (Section 2.2), liability thresholds (Section 7.1), accelerated incident notification (Section 5.2), "
        "and dispute venue jurisdiction (Section 10.1).",
        styles['HighlightBox']
    ))
    story.append(Spacer(1, 8))

    # Parties Metadata Card Table
    parties_data = [
        [
            Paragraph("<b>SERVICE PROVIDER / CONTRACTOR:</b><br/><b>Acme Cloud Dynamics Inc.</b><br/>100 Innovation Way, Suite 400<br/>New York, NY 10001<br/>Notice Contact: legal@acmeclouddynamics.com", styles['MetaBox']),
            Paragraph("<b>CLIENT / CUSTOMER:</b><br/><b>Apex Global Retail LLC</b><br/>500 Madison Avenue, 18th Floor<br/>New York, NY 10022<br/>Notice Contact: contracts@apexretailglobal.com", styles['MetaBox']),
        ]
    ]
    parties_table = Table(parties_data, colWidths=[245, 245])
    parties_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, -1), colors.HexColor("#FEF2F2")),
        ('BOX', (0, 0), (-1, -1), 1, colors.HexColor("#FECACA")),
        ('VALIGN', (0, 0), (-1, -1), 'TOP'),
        ('TOPPADDING', (0, 0), (-1, -1), 8),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 8),
        ('LEFTPADDING', (0, 0), (-1, -1), 10),
        ('RIGHTPADDING', (0, 0), (-1, -1), 10),
    ]))
    story.append(parties_table)
    story.append(Spacer(1, 10))

    # Recitals
    story.append(Paragraph("RECITALS & REVISED PREAMBLE", styles['Heading1']))
    story.append(Paragraph(
        "This Amended & Restated Master Services Agreement (\"Agreement\") is entered into and made effective as of <b>April 1, 2026</b> (\"Restatement Date\"), "
        "by and between <b>Acme Cloud Dynamics Inc.</b> (\"Service Provider\") and <b>Apex Global Retail LLC</b> (\"Client\"). "
        "The Parties previously entered into that certain Master Services Agreement dated January 15, 2026 (\"Original Agreement\"), and now desire to amend and restate the terms in their entirety.",
        styles['Body']
    ))

    # Section 1
    story.append(Paragraph("SECTION 1 — EXPANDED SCOPE & REVISED MILESTONES", styles['Heading1']))
    story.append(Paragraph(
        "<b>1.1 Performance of Enhanced Services:</b> In addition to core cloud migration, Service Provider shall implement enterprise generative AI analytics pipelines, real-time edge processing, and automated disaster recovery failover.",
        styles['Body']
    ))
    story.append(Paragraph(
        "<b>1.2 Revised Project Deadlines & Milestones:</b> The Parties agree to the modified milestone timeline below:",
        styles['Body']
    ))

    milestone_data = [
        [Paragraph("Milestone Description", styles['TableHeader']), Paragraph("Delivery Target Date", styles['TableHeader']), Paragraph("Obligated Party", styles['TableHeader']), Paragraph("Status / Change vs v1", styles['TableHeader'])],
        [Paragraph("Milestone 1: Multi-Region Infrastructure Architecture Plan", styles['TableCell']), Paragraph("<b>April 30, 2026</b>", styles['TableCell']), Paragraph("Service Provider", styles['TableCell']), Paragraph("Completed & Extended", styles['TableCell'])],
        [Paragraph("Milestone 2: Disaster Recovery & Failover Simulation Test", styles['TableCell']), Paragraph("<b>October 31, 2026</b>", styles['TableCell']), Paragraph("Service Provider", styles['TableCell']), Paragraph("<b>NEW Milestone</b>", styles['TableCellBold'])],
        [Paragraph("Milestone 3: Phase 1 Cloud Migration Final Sign-Off", styles['TableCell']), Paragraph("<b>December 15, 2026</b>", styles['TableCell']), Paragraph("Service Provider", styles['TableCell']), Paragraph("Extended from Oct 15", styles['TableCell'])],
        [Paragraph("Milestone 4: Security & SOC 2 Type II Final Attestation", styles['TableCell']), Paragraph("<b>January 31, 2027</b>", styles['TableCell']), Paragraph("Service Provider", styles['TableCell']), Paragraph("Extended from Nov 30", styles['TableCell'])],
    ]
    ms_table = Table(milestone_data, colWidths=[160, 105, 95, 144])
    ms_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor("#FEF2F2")),
        ('GRID', (0, 0), (-1, -1), 0.5, colors.HexColor("#CBD5E1")),
        ('VALIGN', (0, 0), (-1, -1), 'TOP'),
        ('TOPPADDING', (0, 0), (-1, -1), 4),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 4),
        ('LEFTPADDING', (0, 0), (-1, -1), 6),
        ('RIGHTPADDING', (0, 0), (-1, -1), 6),
    ]))
    story.append(ms_table)
    story.append(Spacer(1, 8))

    # Section 2 - Changed Fees and Payment Terms (DIFF / CONFLICT)
    story.append(Paragraph("SECTION 2 — INVOICING, FEES & REVISED PAYMENT TERMS", styles['Heading1']))
    story.append(Paragraph(
        "<b>2.1 Increased Contract Sum:</b> Client shall pay Service Provider an expanded aggregate contract sum of <b>$240,000.00 USD</b> for the remaining term, payable in monthly installments of <b>$20,000.00 USD</b> (increased from $15,000/month).",
        styles['Body']
    ))
    story.append(Paragraph(
        "<b>2.2 Payment Terms (Extended to Net 60 — Modified Term):</b> All undisputed invoices shall be due and payable within <b>sixty (60) calendar days (Net 60)</b> of invoice receipt (extended from thirty (30) calendar days in Original Agreement).",
        styles['Body']
    ))
    story.append(Paragraph(
        "<b>2.3 Increased Late Payment Interest:</b> Overdue amounts shall accrue interest at the accelerated rate of <b>2.0% per month</b> (increased from 1.5% per month), calculated from the due date until paid in full.",
        styles['Body']
    ))

    # Section 3 - Intellectual Property & AI Training Restriction (NEW RESTRICTION)
    story.append(Paragraph("SECTION 3 — INTELLECTUAL PROPERTY & AI DATA RESTRICTION", styles['Heading1']))
    story.append(Paragraph(
        "<b>3.1 Work Made for Hire:</b> Client retains exclusive proprietary ownership of all Deliverables and custom code created specifically for Client.",
        styles['Body']
    ))
    story.append(Paragraph(
        "<b>3.2 AI Model Training Prohibition (New Clause 3.2):</b> Service Provider is strictly prohibited from utilizing Client Confidential Information, proprietary code, customer records, or personally identifiable data (PII) to train, fine-tune, or benchmark any commercial artificial intelligence or machine learning model without explicit, written advance authorization from Client's Chief Information Security Officer.",
        styles['WarningBox']
    ))
    story.append(Spacer(1, 4))

    # Section 4 - Extended Confidentiality
    story.append(Paragraph("SECTION 4 — CONFIDENTIALITY & NON-DISCLOSURE", styles['Heading1']))
    story.append(Paragraph(
        "<b>4.1 Extended Survival Period (Modified Term):</b> The confidentiality and non-disclosure obligations shall survive for a period of <b>five (5) years</b> following termination or expiration (increased from three (3) years under Original Agreement).",
        styles['Body']
    ))

    # Section 5 - Accelerated 24-Hour Breach Notification (DIFF / CONFLICT)
    story.append(Paragraph("SECTION 5 — EXPEDITED DATA SECURITY & INCIDENT RESPONSE", styles['Heading1']))
    story.append(Paragraph(
        "<b>5.1 Technical Controls:</b> Service Provider shall maintain ISO 27001 and SOC 2 Type II certifications.",
        styles['Body']
    ))
    story.append(Paragraph(
        "<b>5.2 Affirmative Duty — Accelerated 24-Hour Breach Notice (Modified Duty):</b> Service Provider must notify Client in writing within <b>twenty-four (24) hours</b> (accelerated from 48 hours) of discovering any confirmed or suspected data compromise or unauthorized network penetration.",
        styles['Body']
    ))
    story.append(Paragraph(
        "<b>5.3 Mandatory Forensic Report Deadline (New Duty):</b> Service Provider shall deliver a comprehensive independent third-party forensic root cause analysis to Client within <b>ten (10) business days</b> following incident containment.",
        styles['HighlightBox']
    ))
    story.append(Spacer(1, 4))

    # Section 6 - SLA
    story.append(Paragraph("SECTION 6 — SERVICE LEVEL AGREEMENT (SLA) & WARRANTIES", styles['Heading1']))
    story.append(Paragraph(
        "<b>6.1 Service Availability:</b> Service Provider commits to a <b>99.9% monthly cloud uptime availability</b>. Failure to meet the SLA shall entitle Client to a 5% credit of that month's service fee for every one (1) hour of unexcused downtime.",
        styles['Body']
    ))
    story.append(Paragraph(
        "<b>6.2 Extended Warranty:</b> Deliverables warranty period is extended to <b>one hundred eighty (180) days</b> (extended from 90 days).",
        styles['Body']
    ))

    # Section 7 - Modified Limitation of Liability (DIFF / HIGH RISK)
    story.append(Paragraph("SECTION 7 — REVISED LIMITATION OF LIABILITY", styles['Heading1']))
    story.append(Paragraph(
        "<b>7.1 Increased Liability Cap (Modified Cap):</b> TO THE MAXIMUM EXTENT PERMITTED BY LAW, EACH PARTY'S TOTAL AGGREGATE LIABILITY ARISING UNDER THIS REVISED AGREEMENT SHALL BE CAPPED AT <b>$1,000,000.00 USD</b> (INCREASED FROM $250,000.00 IN ORIGINAL AGREEMENT).",
        styles['Body']
    ))
    story.append(Paragraph(
        "<b>7.2 Exclusion of Consequential Damages Waiver for Breaches (Critical Risk Flag):</b> The waiver of consequential, indirect, and punitive damages set forth herein shall <b>NOT</b> apply to: (a) breaches of Section 4 (Confidentiality); (b) security failures under Section 5 (Data Security); or (c) gross negligence or willful misconduct. (Substantial exposure for Service Provider).",
        styles['WarningBox']
    ))
    story.append(Spacer(1, 4))

    # Section 8 - Indemnification
    story.append(Paragraph("SECTION 8 — EXPANDED INDEMNIFICATION", styles['Heading1']))
    story.append(Paragraph(
        "<b>8.1 Mutual Indemnity:</b> Each Party shall defend and indemnify the other against third-party IP infringement claims and regulatory fines arising directly from a Party's willful breach of privacy commitments, subject to a separate regulatory defense limit of $500,000.00 USD.",
        styles['Body']
    ))

    # Section 9 - Term, Termination & Penalty Fee (DIFF / CONFLICT)
    story.append(Paragraph("SECTION 9 — TERM, TERMINATION & EARLY TERMINATION FEE", styles['Heading1']))
    story.append(Paragraph(
        "<b>9.1 Extended Term & 90-Day Renewal Window:</b> The term is extended through <b>December 31, 2027</b>. Either Party may opt out of auto-renewal by delivering written notice at least <b>ninety (90) calendar days</b> prior to expiration (increased from 60 days).",
        styles['Body']
    ))
    story.append(Paragraph(
        "<b>9.2 Shortened Notice for Convenience (Modified Term):</b> Either Party may terminate for convenience upon providing <b>fifteen (15) calendar days' written notice</b> (shortened from 30 days in Original Agreement).",
        styles['Body']
    ))
    story.append(Paragraph(
        "<b>9.3 Early Termination Penalty Fee (New Affirmative Penalty):</b> If Client elects to terminate this Agreement for convenience prior to <b>December 31, 2026</b>, Client shall pay Service Provider an early termination fee of <b>$15,000.00 USD</b> within ten (10) days of the termination notice date to offset committed infrastructure allocation costs.",
        styles['WarningBox']
    ))
    story.append(Spacer(1, 4))
    story.append(Paragraph(
        "<b>9.4 Expedited Material Breach Cure:</b> Material breach cure period is reduced from 15 days to <b>ten (10) calendar days</b>.",
        styles['Body']
    ))

    # Section 10 - Governing Law Changed to Delaware (DIFF / CONFLICT)
    story.append(Paragraph("SECTION 10 — GOVERNING LAW & DELAWARE JURISDICTION", styles['Heading1']))
    story.append(Paragraph(
        "<b>10.1 Governing Law (Changed Jurisdiction):</b> This Agreement shall be governed by, and construed in accordance with, the laws of the <b>State of Delaware</b> (changed from State of New York in Original Agreement), without giving effect to conflicts of laws principles.",
        styles['Body']
    ))
    story.append(Paragraph(
        "<b>10.2 Exclusive Judicial Forum:</b> The Parties irrevocably submit to the exclusive jurisdiction of the <b>Court of Chancery of the State of Delaware</b> (and the Delaware Supreme Court on appeal), expressly waiving mandatory arbitration and jury trials.",
        styles['Body']
    ))

    # Signatures
    story.append(Spacer(1, 10))
    story.append(Paragraph("IN WITNESS WHEREOF, the Parties have executed this Amended and Restated Master Services Agreement as of the Restatement Date.", styles['BodyBold']))
    story.append(Spacer(1, 6))

    sig_data = [
        [
            Paragraph("<b>FOR SERVICE PROVIDER:</b><br/><b>Acme Cloud Dynamics Inc.</b><br/><br/><br/>____________________________________<br/>By: <b>Marcus Vance</b><br/>Title: <b>Chief Executive Officer</b><br/>Date: <b>April 1, 2026</b>", styles['TableCell']),
            Paragraph("<b>FOR CLIENT:</b><br/><b>Apex Global Retail LLC</b><br/><br/><br/>____________________________________<br/>By: <b>Elena Rostova</b><br/>Title: <b>Chief Operating Officer</b><br/>Date: <b>April 1, 2026</b>", styles['TableCell']),
        ]
    ]
    sig_table = Table(sig_data, colWidths=[245, 245])
    sig_table.setStyle(TableStyle([
        ('BOX', (0, 0), (-1, -1), 1, colors.HexColor("#CBD5E1")),
        ('BACKGROUND', (0, 0), (-1, -1), colors.HexColor("#FEF2F2")),
        ('VALIGN', (0, 0), (-1, -1), 'TOP'),
        ('TOPPADDING', (0, 0), (-1, -1), 10),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 10),
        ('LEFTPADDING', (0, 0), (-1, -1), 10),
        ('RIGHTPADDING', (0, 0), (-1, -1), 10),
    ]))
    story.append(KeepTogether(sig_table))

    def on_first_page(canvas_obj, doc_obj):
        canvas_obj.doc_title = "AMENDED & RESTATED MASTER SERVICES AGREEMENT"
        canvas_obj.doc_ref = "MSA-2026-001-REV2"

    doc.build(story, canvasmaker=NumberedCanvas, onFirstPage=on_first_page)
    print(f"Successfully generated Document 2: {output_path}")


if __name__ == '__main__':
    base_dir = r"c:\Users\OM TRIVEDI\Desktop\Legallens-AI"
    sample_dir = os.path.join(base_dir, "sample_documents")
    os.makedirs(sample_dir, exist_ok=True)

    file1 = os.path.join(sample_dir, "Master_Services_Agreement_v1.pdf")
    file2 = os.path.join(sample_dir, "Master_Services_Agreement_v2_Amended.pdf")

    create_document_v1(file1)
    create_document_v2(file2)

    # Also copy to root directory for immediate user access
    root_file1 = os.path.join(base_dir, "Master_Services_Agreement_v1.pdf")
    root_file2 = os.path.join(base_dir, "Master_Services_Agreement_v2_Amended.pdf")
    shutil.copyfile(file1, root_file1)
    shutil.copyfile(file2, root_file2)
    print(f"Copied both PDF files to root: {root_file1} and {root_file2}")
