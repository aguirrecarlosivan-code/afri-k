import os
import pytest
from datetime import datetime, timedelta
from backend.reports.pdf_generator import PDFReportGenerator
from backend.reports.pptx_generator import PPTXReportGenerator
from backend.reports.csv_json_exporter import CSVJSONExporter


def test_pdf_report_generation(tmp_path):
    output_pdf = str(tmp_path / "test_report.pdf")
    report_data = {"period_start": "2026-07-01", "period_end": "2026-07-24"}
    ai_analysis = {
        "executive_summary": "Prueba ejecutiva",
        "strengths": ["Fortaleza 1", "Fortaleza 2"],
        "weaknesses": ["Debilidad 1"],
        "recommendations": ["Recomendación 1"],
        "sentiment_analysis": {"dominant_tone": "Positivo", "positive_pct": 80.0, "neutral_pct": 15.0, "critical_pct": 5.0},
    }
    summaries = [{"platform": "instagram", "followers": 89400, "total_reach": 158000, "total_impressions": 224000, "avg_engagement": 6.4}]

    res_path = PDFReportGenerator.generate_report(output_pdf, report_data, ai_analysis, summaries)
    assert os.path.exists(res_path)
    assert os.path.getsize(res_path) > 0


def test_pptx_report_generation(tmp_path):
    output_pptx = str(tmp_path / "test_report.pptx")
    report_data = {"period_start": "2026-07-01", "period_end": "2026-07-24"}
    ai_analysis = {"executive_summary": "Prueba ejecutiva", "recommendations": ["Recomendación 1"]}
    summaries = [{"platform": "instagram", "followers": 89400, "total_reach": 158000, "avg_engagement": 6.4}]

    res_path = PPTXReportGenerator.generate_presentation(output_pptx, report_data, ai_analysis, summaries)
    assert os.path.exists(res_path)
    assert os.path.getsize(res_path) > 0


def test_csv_json_export(tmp_path):
    json_path = str(tmp_path / "data.json")
    csv_path = str(tmp_path / "data.csv")

    CSVJSONExporter.export_json(json_path, {"test": "value"})
    CSVJSONExporter.export_csv(csv_path, [{"col1": "val1", "col2": "val2"}])

    assert os.path.exists(json_path)
    assert os.path.exists(csv_path)
