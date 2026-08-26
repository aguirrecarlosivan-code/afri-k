import logging
from typing import Dict, Any, Optional
from fastapi import APIRouter, Query, UploadFile, File, HTTPException
from backend.services.analytics_service import AnalyticsService
from backend.services.meta_suite_importer import MetaSuiteImporter

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


@router.get("/top-yearly-posts")
async def get_top_yearly_posts(
    year: Optional[int] = Query(2026, description="Year to analyze"),
) -> Dict[str, Any]:
    """Returns the top 5 most-liked publications of the entire year for Facebook and Instagram."""
    return await AnalyticsService.get_yearly_top_posts(year=year)


@router.post("/import-meta-suite")
async def import_meta_business_suite_file(
    file: UploadFile = File(...),
) -> Dict[str, Any]:
    """
    Ingests and parses official Meta Business Suite export files (CSV or Excel).
    Instantly populates dashboard with authentic Content Library data.
    """
    if not file.filename:
        raise HTTPException(status_code=400, detail="No se proporcionó ningún archivo.")

    contents = await file.read()
    try:
        posts = MetaSuiteImporter.parse_file(file.filename, contents)
        return {
            "status": "success",
            "message": f"Se importaron con éxito {len(posts)} publicaciones de Meta Business Suite.",
            "filename": file.filename,
            "total_posts": len(posts),
            "total_views": sum(p["metrics"]["views"] for p in posts),
            "total_reach": sum(p["metrics"]["reach"] for p in posts),
            "total_interactions": sum(p["metrics"]["total_interactions"] for p in posts),
        }
    except Exception as e:
        logger.error(f"Error parsing Meta Suite file: {e}")
        raise HTTPException(status_code=400, detail=str(e))

