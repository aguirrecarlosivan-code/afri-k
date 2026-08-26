import logging
from fastapi import APIRouter, Query, Body
from typing import Dict, Any, Optional
from datetime import datetime, timedelta
from backend.ai.engine import AIEngine
from backend.ai.predictive_engine import ContentPerformancePredictor
from backend.services.analytics_service import AnalyticsService

logger = logging.getLogger("radar.api.ai")

router = APIRouter(prefix="/ai", tags=["AI Editorial Intelligence"])


@router.post("/generate-summary")
async def generate_ai_executive_summary() -> Dict[str, Any]:
    """
    Trigger AI Editorial Analysis based strictly on normalized AnalyticsService data.
    Generates: Resumen Ejecutivo, Fortalezas, Debilidades, Recomendaciones, and Hallazgos.
    """
    end_date = datetime.utcnow()
    start_date = end_date - timedelta(days=7)

    analytics_data = await AnalyticsService.get_analytics_for_ai_and_reports(platform="all", days=7)
    summaries = analytics_data.get("platforms", [])
    top_posts = analytics_data.get("posts", [])
    wow_comp = analytics_data.get("wow_comparison", {})

    engine = AIEngine()
    analysis = await engine.generate_executive_analysis(
        period_start=start_date,
        period_end=end_date,
        platform_summaries=summaries,
        top_posts=top_posts,
        wow_comparison=wow_comp,
        platform="all",
    )

    return {
        "status": "success",
        "period": f"{start_date.strftime('%Y-%m-%d')} to {end_date.strftime('%Y-%m-%d')}",
        "ai_report": analysis,
    }


@router.get("/deep-analysis")
async def get_deep_ai_analysis(
    platform: Optional[str] = Query("all", description="Platform to analyze"),
    days: Optional[int] = Query(7, description="Number of historical days to analyze"),
) -> Dict[str, Any]:
    """
    Generate parametric Deep AI Analysis filtered by platform and date range.
    """
    end_date = datetime.utcnow()
    start_date = end_date - timedelta(days=days or 7)

    analytics_data = await AnalyticsService.get_analytics_for_ai_and_reports(platform=platform or "all", days=days or 7)
    summaries = analytics_data.get("platforms", [])
    top_posts = analytics_data.get("posts", [])
    wow_comp = analytics_data.get("wow_comparison", {})

    engine = AIEngine()
    analysis = await engine.generate_executive_analysis(
        period_start=start_date,
        period_end=end_date,
        platform_summaries=summaries,
        top_posts=top_posts,
        wow_comparison=wow_comp,
        platform=platform or "all",
    )

    return {
        "platform_analyzed": platform,
        "days_analyzed": days,
        "ai_report": analysis,
    }


@router.post("/predict-performance")
async def predict_content_performance(payload: Dict[str, Any] = Body(...)) -> Dict[str, Any]:
    """
    AI Content Performance Predictor endpoint.
    Receives draft platform, format_type, planned_hour, and text to return forecasted reach & virality score.
    """
    platform = payload.get("platform", "instagram")
    format_type = payload.get("format_type", "reel")
    planned_hour = int(payload.get("planned_hour", 18))
    text = payload.get("text", "")

    prediction = ContentPerformancePredictor.predict_performance(
        platform=platform,
        format_type=format_type,
        planned_hour=planned_hour,
        char_count=len(text),
    )
    return {"prediction": prediction}
