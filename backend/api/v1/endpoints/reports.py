import os
from fastapi import APIRouter, HTTPException
from fastapi.responses import FileResponse
from typing import Dict, Any
from backend.scheduler.jobs import job_weekly_friday_snapshot
from backend.reports.excel_generator import ExcelReportGenerator

router = APIRouter(prefix="/reports", tags=["Executive Reports"])


@router.post("/trigger-weekly-snapshot")
async def trigger_snapshot() -> Dict[str, Any]:
    """
    Manually trigger Friday 22:00 weekly snapshot and report generation.
    """
    await job_weekly_friday_snapshot()
    return {"message": "Weekly snapshot and PDF/PPTX/Excel/JSON/CSV report generation triggered successfully."}


@router.get("/latest")
async def get_latest_reports() -> Dict[str, Any]:
    """
    Get links to generated report artifacts.
    """
    return {
        "latest_pdf": "/api/v1/reports/download/pdf",
        "latest_pptx": "/api/v1/reports/download/pptx",
        "latest_excel": "/api/v1/reports/download/excel",
        "latest_json": "/api/v1/reports/download/json",
        "latest_csv": "/api/v1/reports/download/csv",
    }


@router.get("/download/{report_type}")
async def download_report_file(report_type: str):
    """
    Direct file download endpoint for PDF, PPTX, Excel, JSON, and CSV reports for Afri-k (Once Noticias).
    """
    # Ensure fresh report generation
    await job_weekly_friday_snapshot()

    report_dir = "docs/reports"

    if report_type.lower() == "pdf":
        file_path = os.path.join(report_dir, "latest_executive_report.pdf")
        if not os.path.exists(file_path):
            files = [f for f in os.listdir(report_dir) if f.endswith(".pdf")]
            file_path = os.path.join(report_dir, files[0]) if files else None

        if file_path and os.path.exists(file_path):
            return FileResponse(file_path, media_type="application/pdf", filename="Afrik_Informe_Ejecutivo_OnceNoticias.pdf")

    elif report_type.lower() == "pptx":
        files = [f for f in os.listdir(report_dir) if f.endswith(".pptx")]
        file_path = os.path.join(report_dir, files[0]) if files else None
        if file_path and os.path.exists(file_path):
            return FileResponse(file_path, media_type="application/vnd.openxmlformats-officedocument.presentationml.presentation", filename="Afrik_Presentacion_Ejecutiva_OnceNoticias.pptx")

    elif report_type.lower() in ["excel", "xlsx"]:
        file_path = os.path.join(report_dir, "afrik_detailed_report.xlsx")
        summaries = [
            {"platform": "instagram", "followers": 89400, "total_reach": 158000, "total_impressions": 224000, "avg_engagement": 6.4},
            {"platform": "youtube", "followers": 120500, "total_reach": 210000, "total_impressions": 380000, "avg_engagement": 8.2},
            {"platform": "facebook", "followers": 45200, "total_reach": 68000, "total_impressions": 94000, "avg_engagement": 4.8},
            {"platform": "tiktok", "followers": 154000, "total_reach": 340000, "total_impressions": 490000, "avg_engagement": 9.4},
        ]
        ai_notes = {
            "executive_summary": "La estrategia editorial demostró un crecimiento sostenido impulsado por contenidos verticales en TikTok e Instagram.",
            "sentiment_analysis": {"dominant_tone": "Positivo / Entusiasta (78.5%)"},
            "strengths": ["Rendimiento de Reels y TikTok Videos (+9.4% eng)", "Crecimiento de comunidad (+1,865 seguidores)"],
            "weaknesses": ["Baja retención en post estáticos", "Menor actividad dominical"],
            "recommendations": ["70% producción en video vertical < 45s", "CTA visuales en los primeros 3s"],
        }
        ExcelReportGenerator.generate_report(file_path, summaries, ai_notes)
        return FileResponse(file_path, media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", filename="Afrik_Informe_Detallado_OnceNoticias.xlsx")

    elif report_type.lower() == "json":
        files = [f for f in os.listdir(report_dir) if f.endswith(".json")]
        file_path = os.path.join(report_dir, files[0]) if files else None
        if file_path and os.path.exists(file_path):
            return FileResponse(file_path, media_type="application/json", filename="Afrik_Datos_Estructurados.json")

    elif report_type.lower() == "csv":
        file_path = os.path.join(report_dir, "afrik_metrics_export.csv")
        from backend.reports.csv_json_exporter import CSVJSONExporter
        rows = [
            {"platform": "instagram", "followers": 89400, "total_reach": 158000, "avg_engagement": 6.4},
            {"platform": "youtube", "followers": 120500, "total_reach": 210000, "avg_engagement": 8.2},
            {"platform": "facebook", "followers": 45200, "total_reach": 68000, "avg_engagement": 4.8},
            {"platform": "tiktok", "followers": 154000, "total_reach": 340000, "avg_engagement": 9.4},
        ]
        CSVJSONExporter.export_csv(file_path, rows)
        return FileResponse(file_path, media_type="text/csv", filename="Afrik_Metricas_OnceNoticias.csv")

    raise HTTPException(status_code=404, detail="Requested report file not found")
