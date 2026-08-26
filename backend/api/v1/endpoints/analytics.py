import logging
from typing import Dict, Any, Optional
from fastapi import APIRouter, Query
from backend.services.analytics_service import AnalyticsService

logger = logging.getLogger("radar.api.analytics")

router = APIRouter(prefix="/analytics", tags=["Analytics Engine"])


@router.get("/overview")
async def get_analytics_overview() -> Dict[str, Any]:
    """Provides high-level consolidated analytics overview."""
    data = await AnalyticsService.get_aggregated_data(platform="all")
    return {
        "last_updated_at": data.get("last_updated_at"),
        "kpis": data.get("kpis"),
        "platforms": data.get("platforms"),
        "wow_comparison": data.get("wow_comparison"),
    }


@router.get("/filtered")
async def get_filtered_analytics(
    platform: Optional[str] = Query("all", description="Platform filter: all, facebook, instagram, youtube, tiktok"),
    content_type: Optional[str] = Query("all", description="Content type filter: all, video, reel, short, post"),
    days: Optional[int] = Query(7, description="Preset days range: 7, 30, 90"),
    start_date: Optional[str] = Query(None, description="Custom start date (YYYY-MM-DD)"),
    end_date: Optional[str] = Query(None, description="Custom end date (YYYY-MM-DD)"),
) -> Dict[str, Any]:
    """
    Returns filtered KPIs, rankings, format efficiencies, and posts from AnalyticsService.
    """
    return await AnalyticsService.get_aggregated_data(
        platform=platform,
        content_type=content_type,
        days=days,
        start_date=start_date,
        end_date=end_date,
    )


@router.get("/posting-heatmap")
async def get_best_posting_times() -> Dict[str, Any]:
    """Returns optimal posting time recommendations and heatmap."""
    return await AnalyticsService.get_heatmap_data()
