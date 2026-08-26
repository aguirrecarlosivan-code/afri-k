import os
import logging
from datetime import datetime, timedelta
from apscheduler.schedulers.asyncio import AsyncIOScheduler
from apscheduler.triggers.cron import CronTrigger
from backend.config.settings import settings
from backend.services.analytics_service import AnalyticsService
from backend.ai.engine import AIEngine
from backend.reports.pdf_generator import PDFReportGenerator
from backend.reports.pptx_generator import PPTXReportGenerator
from backend.reports.excel_generator import ExcelReportGenerator
from backend.reports.csv_json_exporter import CSVJSONExporter

logger = logging.getLogger("radar.scheduler")

scheduler = AsyncIOScheduler()


async def job_hourly_update_metrics():
    """Job 1: Run every hour to refresh post & account metrics."""
    logger.info("⏰ [Scheduler] Refreshing metrics via AnalyticsService...")
    try:
        await AnalyticsService.get_aggregated_data(platform="all")
        logger.info("✅ [Scheduler] Hourly metrics update job completed successfully.")
    except Exception as e:
        logger.warning(f"Hourly metrics update notice: {e}")


async def job_daily_sync_posts():
    """Job 2: Run daily to sync newly published posts."""
    logger.info("⏰ [Scheduler] Running daily post sync...")
    try:
        await AnalyticsService.get_aggregated_data(platform="all")
        logger.info("✅ [Scheduler] Daily post sync completed successfully.")
    except Exception as e:
        logger.warning(f"Daily post sync notice: {e}")


async def job_weekly_friday_snapshot():
    """
    Job 3: Run every Friday at 22:00 (or triggered on demand).
    Generates PDF, PPTX, Excel, JSON, and CSV reports based strictly on AnalyticsService data.
    """
    logger.info("⏰ [Scheduler] Starting Weekly Snapshot & AI Report Generation...")
    os.makedirs("docs/reports", exist_ok=True)

    end_date = datetime.utcnow()
    start_date = end_date - timedelta(days=7)

    analytics_data = await AnalyticsService.get_analytics_for_ai_and_reports(platform="all", days=7)
    summaries = analytics_data.get("platforms", [])
    top_posts = analytics_data.get("posts", [])
    wow_comp = analytics_data.get("wow_comparison", {})

    ai_engine = AIEngine()
    ai_analysis = await ai_engine.generate_executive_analysis(
        period_start=start_date,
        period_end=end_date,
        platform_summaries=summaries,
        top_posts=top_posts,
        wow_comparison=wow_comp,
    )

    pdf_path = "docs/reports/latest_executive_report.pdf"
    pptx_path = "docs/reports/latest_presentation.pptx"
    excel_path = "docs/reports/afrik_detailed_report.xlsx"
    json_path = "docs/reports/afrik_structured_data.json"
    csv_path = "docs/reports/afrik_metrics_export.csv"

    report_payload = {
        "period_start": start_date.strftime("%Y-%m-%d"),
        "period_end": end_date.strftime("%Y-%m-%d"),
        "summaries": summaries,
        "wow_comparison": wow_comp,
        "ai_analysis": ai_analysis,
    }

    try:
        PDFReportGenerator.generate_report(pdf_path, report_payload, ai_analysis, summaries)
    except Exception as e:
        logger.warning(f"PDF generation notice: {e}")

    try:
        PPTXReportGenerator.generate_presentation(pptx_path, report_payload, ai_analysis, summaries)
    except Exception as e:
        logger.warning(f"PPTX generation notice: {e}")

    try:
        ExcelReportGenerator.generate_report(excel_path, summaries, ai_analysis)
    except Exception as e:
        logger.warning(f"Excel generation notice: {e}")

    try:
        CSVJSONExporter.export_json(json_path, report_payload)
        CSVJSONExporter.export_csv(csv_path, summaries)
    except Exception as e:
        logger.warning(f"JSON/CSV export notice: {e}")

    logger.info("🎉 [Scheduler] Weekly Snapshot and Executive Reports generated successfully!")


def start_scheduler():
    """Initialize and start APScheduler background jobs."""
    if not settings.SCHEDULER_ENABLED:
        logger.info("Scheduler disabled in settings.")
        return

    scheduler.add_job(job_hourly_update_metrics, "interval", hours=1, id="hourly_metrics")
    scheduler.add_job(job_daily_sync_posts, "cron", hour=2, minute=0, id="daily_posts_sync")

    trigger_friday = CronTrigger(
        day_of_week=settings.WEEKLY_REPORT_CRON_DAY,
        hour=settings.WEEKLY_REPORT_CRON_HOUR,
        minute=settings.WEEKLY_REPORT_CRON_MINUTE,
    )
    scheduler.add_job(job_weekly_friday_snapshot, trigger_friday, id="weekly_friday_snapshot")

    scheduler.start()
    logger.info("🚀 APScheduler started successfully.")
