import os
import logging
from typing import Dict, Any, List
from reportlab.lib.pagesizes import letter
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, HRFlowable
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib import colors

logger = logging.getLogger("afrik.reports.pdf")


class PDFReportGenerator:
    """
    Generates professional PDF executive reports for Afri-k (Once Noticias).
    """

    @staticmethod
    def generate_report(
        output_path: str,
        report_data: Dict[str, Any],
        ai_analysis: Dict[str, Any],
        platform_summaries: List[Dict[str, Any]],
    ) -> str:
        """
        Creates a PDF file at output_path.
        """
        os.makedirs(os.path.dirname(output_path), exist_ok=True)
        doc = SimpleDocTemplate(
            output_path,
            pagesize=letter,
            rightMargin=36,
            leftMargin=36,
            topMargin=36,
            bottomMargin=36,
        )

        styles = getSampleStyleSheet()

        title_style = ParagraphStyle(
            "AfrikTitle",
            parent=styles["Title"],
            fontName="Helvetica-Bold",
            fontSize=24,
            leading=28,
            textColor=colors.HexColor("#0F172A"),
            alignment=0,
        )
        subtitle_style = ParagraphStyle(
            "AfrikSubtitle",
            parent=styles["Normal"],
            fontName="Helvetica",
            fontSize=11,
            leading=14,
            textColor=colors.HexColor("#64748B"),
        )
        heading_style = ParagraphStyle(
            "AfrikHeading",
            parent=styles["Heading2"],
            fontName="Helvetica-Bold",
            fontSize=14,
            leading=18,
            textColor=colors.HexColor("#2563EB"),
            spaceBefore=12,
            spaceAfter=6,
        )
        body_style = ParagraphStyle(
            "AfrikBody",
            parent=styles["BodyText"],
            fontName="Helvetica",
            fontSize=10,
            leading=14,
            textColor=colors.HexColor("#334155"),
        )
        bullet_style = ParagraphStyle(
            "AfrikBullet",
            parent=body_style,
            leftIndent=12,
            bulletIndent=4,
            spaceAfter=4,
        )

        story = []

        # Header Title
        story.append(Paragraph("<b>Afri-k</b> | Inteligencia & Analítica Editorial de Once Noticias", title_style))
        story.append(Paragraph(f"Período: {report_data.get('period_start', '2026-07-01')} al {report_data.get('period_end', '2026-07-24')}", subtitle_style))
        story.append(Spacer(1, 12))
        story.append(HRFlowable(width="100%", thickness=2, color=colors.HexColor("#2563EB"), spaceAfter=12))

        # 1. Executive Summary & Sentiment
        story.append(Paragraph("1. Resumen Ejecutivo", heading_style))
        exec_summary = ai_analysis.get("executive_summary", "Sin resumen disponible.")
        story.append(Paragraph(exec_summary, body_style))

        sentiment = ai_analysis.get("sentiment_analysis", {})
        if sentiment:
            story.append(Spacer(1, 6))
            story.append(Paragraph(f"<b>Tono de Audiencia Predominante:</b> {sentiment.get('dominant_tone', 'Positivo')} | Positivo: {sentiment.get('positive_pct', 78.5)}% | Neutro: {sentiment.get('neutral_pct', 16.0)}% | Crítico: {sentiment.get('critical_pct', 5.5)}%", body_style))

        story.append(Spacer(1, 10))

        # 2. Key Metrics Table
        story.append(Paragraph("2. Métricas Clave por Plataforma", heading_style))
        table_data = [["Plataforma", "Seguidores", "Alcance Total", "Impresiones", "Engagement Prom."]]

        for ps in platform_summaries:
            table_data.append([
                ps.get("platform", "").capitalize(),
                f"{ps.get('followers', 0):,}",
                f"{ps.get('total_reach', 0):,}",
                f"{ps.get('total_impressions', 0):,}",
                f"{ps.get('avg_engagement', 0.0)}%",
            ])

        t = Table(table_data, colWidths=[100, 100, 110, 110, 120])
        t.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor("#0F172A")),
            ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
            ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
            ('FONTSIZE', (0, 0), (-1, 0), 10),
            ('BOTTOMPADDING', (0, 0), (-1, 0), 8),
            ('BACKGROUND', (0, 1), (-1, -1), colors.HexColor("#F8FAFC")),
            ('GRID', (0, 0), (-1, -1), 0.5, colors.HexColor("#E2E8F0")),
            ('ALIGN', (1, 0), (-1, -1), 'CENTER'),
        ]))
        story.append(t)
        story.append(Spacer(1, 14))

        # 3. Strengths & Weaknesses
        story.append(Paragraph("3. Fortalezas Estratégicas", heading_style))
        for st in ai_analysis.get("strengths", []):
            story.append(Paragraph(f"• {st}", bullet_style))

        story.append(Spacer(1, 8))
        story.append(Paragraph("4. Áreas de Oportunidad y Debilidades", heading_style))
        for wk in ai_analysis.get("weaknesses", []):
            story.append(Paragraph(f"• {wk}", bullet_style))

        story.append(Spacer(1, 8))
        story.append(Paragraph("5. Recomendaciones Categorizadas por Formato", heading_style))
        for rec in ai_analysis.get("recommendations", []):
            story.append(Paragraph(f"<b>➜</b> {rec}", bullet_style))

        doc.build(story)
        logger.info(f"PDF Executive Report successfully generated at {output_path}")
        return output_path
