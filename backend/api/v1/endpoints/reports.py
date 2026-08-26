import os
import logging
from fastapi import APIRouter, HTTPException
from fastapi.responses import FileResponse
from typing import Dict, Any
from backend.scheduler.jobs import job_weekly_friday_snapshot
from backend.services.analytics_service import AnalyticsService
from backend.reports.excel_generator import ExcelReportGenerator
from backend.reports.csv_json_exporter import CSVJSONExporter

logger = logging.getLogger("radar.api.reports")

router = APIRouter(prefix="/reports", tags=["Executive Reports"])


@router.post("/trigger-weekly-snapshot")
async def trigger_snapshot() -> Dict[str, Any]:
    """
    Manually trigger weekly snapshot and PDF/PPTX/Excel/JSON/CSV report generation.
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
    Direct file download endpoint for PDF, PPTX, Excel, JSON, and CSV reports for Once Noticias.
    """
    report_dir = "docs/reports"
    os.makedirs(report_dir, exist_ok=True)

    # Always ensure fresh report generation
    await job_weekly_friday_snapshot()

    r_type = report_type.lower()

    if r_type == "pdf":
        file_path = os.path.join(report_dir, "latest_executive_report.pdf")
        if os.path.exists(file_path):
            return FileResponse(file_path, media_type="application/pdf", filename="Afrik_Informe_Ejecutivo_OnceNoticias.pdf")

    elif r_type == "pptx":
        file_path = os.path.join(report_dir, "latest_presentation.pptx")
        if os.path.exists(file_path):
            return FileResponse(file_path, media_type="application/vnd.openxmlformats-officedocument.presentationml.presentation", filename="Afrik_Presentacion_Ejecutiva_OnceNoticias.pptx")

    elif r_type in ["excel", "xlsx"]:
        file_path = os.path.join(report_dir, "afrik_detailed_report.xlsx")
        if os.path.exists(file_path):
            return FileResponse(file_path, media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", filename="Afrik_Informe_Detallado_OnceNoticias.xlsx")

    elif r_type == "json":
        file_path = os.path.join(report_dir, "afrik_structured_data.json")
        if os.path.exists(file_path):
            return FileResponse(file_path, media_type="application/json", filename="Afrik_Datos_Estructurados.json")

    elif r_type == "csv":
        file_path = os.path.join(report_dir, "afrik_metrics_export.csv")
        if os.path.exists(file_path):
            return FileResponse(file_path, media_type="text/csv", filename="Afrik_Metricas_OnceNoticias.csv")

    raise HTTPException(status_code=404, detail="Requested report file could not be generated or found.")
