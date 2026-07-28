from fastapi import APIRouter, Body
from typing import List, Dict, Any
from backend.connectors.facebook.connector import FacebookConnector
from backend.connectors.instagram.connector import InstagramConnector
from backend.connectors.youtube.connector import YouTubeConnector
from backend.connectors.tiktok.connector import TikTokConnector
from backend.connectors.x.connector import XConnector
from backend.services.meta_auth import MetaAuthService
from backend.services.sync_service import DatabaseSyncService

router = APIRouter(prefix="/connectors", tags=["Platform Connectors"])


@router.get("/status")
async def get_connectors_status() -> List[Dict[str, Any]]:
    """
    Check connection status for all 5 social media platform connectors.
    """
    fb = FacebookConnector()
    ig = InstagramConnector()
    yt = YouTubeConnector()
    tt = TikTokConnector()
    x_conn = XConnector()

    statuses = [
        {"platform": "facebook", "connected": await fb.authenticate()},
        {"platform": "instagram", "connected": await ig.authenticate()},
        {"platform": "youtube", "connected": await yt.authenticate()},
        {"platform": "tiktok", "connected": await tt.authenticate()},
        {"platform": "x", "connected": await x_conn.authenticate()},
    ]
    return statuses


@router.post("/exchange-meta-token")
async def exchange_meta_token(payload: Dict[str, Any] = Body(...)) -> Dict[str, Any]:
    """
    Exchange short-lived Meta user token for a 60-day long-lived access token.
    """
    token = payload.get("short_lived_token", "")
    res = await MetaAuthService.exchange_for_long_lived_token(token)
    return res


@router.post("/trigger-sync")
async def trigger_full_database_sync() -> Dict[str, Any]:
    """
    Trigger manual synchronization of social media posts and metrics into PostgreSQL.
    """
    fb = FacebookConnector()
    ig = InstagramConnector()

    fb_profile = await fb.get_profile()
    fb_posts = await fb.get_posts()
    fb_metrics = {p.id: await fb.get_post_metrics(p.id) for p in fb_posts}

    ig_profile = await ig.get_profile()
    ig_posts = await ig.get_posts()
    ig_metrics = {p.id: await ig.get_post_metrics(p.id) for p in ig_posts}

    # Persist in Database
    await DatabaseSyncService.sync_account_profile(fb_profile)
    synced_fb = await DatabaseSyncService.sync_posts_and_metrics(fb_posts, fb_metrics)

    await DatabaseSyncService.sync_account_profile(ig_profile)
    synced_ig = await DatabaseSyncService.sync_posts_and_metrics(ig_posts, ig_metrics)

    return {
        "status": "success",
        "synced_posts_count": synced_fb + synced_ig,
        "platforms_synced": ["facebook", "instagram"],
    }


@router.get("/{platform}/profile")
async def get_connector_profile(platform: str) -> Dict[str, Any]:
    """Fetch profile info for a specific platform."""
    p_lower = platform.lower()
    if p_lower == "facebook":
        conn = FacebookConnector()
    elif p_lower == "instagram":
        conn = InstagramConnector()
    elif p_lower == "youtube":
        conn = YouTubeConnector()
    elif p_lower == "tiktok":
        conn = TikTokConnector()
    elif p_lower == "x":
        conn = XConnector()
    else:
        return {"error": "Unsupported platform"}

    profile = await conn.get_profile()
    return profile.model_dump()


@router.get("/{platform}/posts")
async def get_connector_posts(platform: str) -> List[Dict[str, Any]]:
    """Fetch latest posts for a specific platform."""
    p_lower = platform.lower()
    if p_lower == "facebook":
        conn = FacebookConnector()
    elif p_lower == "instagram":
        conn = InstagramConnector()
    elif p_lower == "youtube":
        conn = YouTubeConnector()
    elif p_lower == "tiktok":
        conn = TikTokConnector()
    elif p_lower == "x":
        conn = XConnector()
    else:
        return []

    posts = await conn.get_posts()
    return [p.model_dump() for p in posts]
