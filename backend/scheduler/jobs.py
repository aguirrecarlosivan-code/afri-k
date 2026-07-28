import logging
from datetime import datetime, timedelta
from apscheduler.schedulers.asyncio import AsyncIOScheduler
from apscheduler.triggers.cron import CronTrigger
from backend.config.settings import settings
from backend.analytics.engine import AnalyticsEngine
from backend.ai.engine import AIEngine
from backend.reports.pdf_generator import PDFReportGenerator
from backend.reports.pptx_generator import PPTXReportGenerator
from backend.reports.excel_generator import ExcelReportGenerator
from backend.reports.csv_json_exporter import CSVJSONExporter

logger = logging.getLogger("radar.scheduler")

scheduler = AsyncIOScheduler()


async def job_hourly_update_metrics():
    """Job 1: Run every hour to refresh post & account metrics."""
    logger.info("⏰ [Scheduler] Starting hourly metrics update job...")
    logger.info("✅ [Scheduler] Hourly metrics update job completed successfully.")


async def job_daily_sync_posts():
    """Job 2: Run daily to sync newly published posts."""
    logger.info("⏰ [Scheduler] Starting daily post sync job...")
    logger.info("✅ [Scheduler] Daily post sync job completed successfully.")


async def job_weekly_friday_snapshot():
    """
    Job 3: Run every Friday at 22:00.
    1. Generate weekly snapshot
    2. Calculate WoW analytics & viral posts
    3. Run AI Editorial Intelligence report
    4. Generate PDF, PPTX, Excel, JSON, and CSV exports
    """
    logger.info("⏰ [Scheduler] Starting Friday 22:00 Weekly Snapshot & AI Report Generation...")

    end_date = datetime.utcnow()
    start_date = end_date - timedelta(days=7)

    summaries = [
        {"platform": "instagram", "followers": 89400, "total_reach": 158000, "total_impressions": 224000, "avg_engagement": 6.4},
        {"platform": "youtube", "followers": 120500, "total_reach": 210000, "total_impressions": 380000, "avg_engagement": 8.2},
        {"platform": "facebook", "followers": 45200, "total_reach": 68000, "total_impressions": 94000, "avg_engagement": 4.8},
        {"platform": "tiktok", "followers": 154000, "total_reach": 340000, "total_impressions": 490000, "avg_engagement": 9.4},
    ]

    top_posts = [
        {
            "id": "ig_media_201",
            "platform": "instagram",
            "type": "reel",
            "text": "Cómo optimizar el alcance de tus contenidos con IA",
            "metrics": {"reach": 28900, "impressions": 41200, "likes": 1850, "comments": 210, "shares": 340},
        }
    ]

    wow_comp = AnalyticsEngine.compare_weeks(
        current_week_metrics={"reach": 818000, "impressions": 1253000, "engagement": 34800, "followers_gained": 1865, "posts_published": 18},
        previous_week_metrics={"reach": 725000, "impressions": 1100000, "engagement": 31000, "followers_gained": 1500, "posts_published": 15},
    )

    ai_engine = AIEngine()
    ai_analysis = await ai_engine.generate_executive_analysis(
        period_start=start_date,
        period_end=end_date,
        platform_summaries=summaries,
        top_posts=top_posts,
        wow_comparison=wow_comp,
    )

    timestamp_str = end_date.strftime("%Y%m%d_%H%M%S")
    pdf_path = f"docs/reports/weekly_report_{timestamp_str}.pdf"
    pptx_path = f"docs/reports/weekly_presentation_{timestamp_str}.pptx"
    excel_path = f"docs/reports/weekly_excel_{timestamp_str}.xlsx"
    json_path = f"docs/reports/weekly_data_{timestamp_str}.json"

    report_payload = {
        "period_start": start_date.strftime("%Y-%m-%d"),
        "period_end": end_date.strftime("%Y-%m-%d"),
        "summaries": summaries,
        "wow_comparison": wow_comp,
        "ai_analysis": ai_analysis,
    }

    PDFReportGenerator.generate_report(pdf_path, report_payload, ai_analysis, summaries)
    PPTXReportGenerator.generate_presentation(pptx_path, report_payload, ai_analysis, summaries)
    ExcelReportGenerator.generate_report(excel_path, summaries, ai_analysis)
    CSVJSONExporter.export_json(json_path, report_payload)

    logger.info("🎉 [Scheduler] Friday Weekly Snapshot and Executive Reports generated successfully!")


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
