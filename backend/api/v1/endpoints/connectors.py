import os
import re
import logging
from fastapi import APIRouter, Body, HTTPException
from typing import List, Dict, Any
from backend.connectors.facebook.connector import FacebookConnector
from backend.connectors.instagram.connector import InstagramConnector
from backend.connectors.youtube.connector import YouTubeConnector
from backend.connectors.tiktok.connector import TikTokConnector
from backend.connectors.x.connector import XConnector
from backend.services.meta_auth import MetaAuthService
from backend.services.sync_service import DatabaseSyncService
from backend.services.analytics_service import AnalyticsService
from backend.config.settings import settings

logger = logging.getLogger("radar.api.connectors")

router = APIRouter(prefix="/connectors", tags=["Platform Connectors"])


def _update_env_file(key: str, value: str):
    """Safely updates or appends a key-value pair in .env file."""
    env_path = ".env"
    if not os.path.exists(env_path):
        with open(env_path, "w", encoding="utf-8") as f:
            f.write(f"{key}={value}\n")
        return

    with open(env_path, "r", encoding="utf-8") as f:
        content = f.read()

    pattern = rf"^{key}=.*$"
    if re.search(pattern, content, flags=re.MULTILINE):
        new_content = re.sub(pattern, f"{key}={value}", content, flags=re.MULTILINE)
    else:
        new_content = content.rstrip() + f"\n{key}={value}\n"

    with open(env_path, "w", encoding="utf-8") as f:
        f.write(new_content)


@router.get("/status")
async def get_connectors_status() -> List[Dict[str, Any]]:
    """
    Check live connection status for all social media platform connectors.
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


@router.post("/save-credentials")
async def save_platform_credentials(payload: Dict[str, Any] = Body(...)) -> Dict[str, Any]:
    """
    Saves and activates API credentials for any platform across the entire environment.
    Immediately updates .env, reinitializes connector, and syncs live data.
    """
    platform = payload.get("platform", "").lower()
    credentials = payload.get("credentials", {})

    if not platform:
        raise HTTPException(status_code=400, detail="Platform identifier is required.")

    if platform == "facebook":
        token = credentials.get("access_token") or credentials.get("page_access_token")
        if token:
            _update_env_file("FACEBOOK_PAGE_ACCESS_TOKEN", token)
            settings.FACEBOOK_PAGE_ACCESS_TOKEN = token
        app_id = credentials.get("app_id")
        if app_id:
            _update_env_file("FACEBOOK_APP_ID", app_id)
            settings.FACEBOOK_APP_ID = app_id
        app_secret = credentials.get("app_secret")
        if app_secret:
            _update_env_file("FACEBOOK_APP_SECRET", app_secret)
            settings.FACEBOOK_APP_SECRET = app_secret

    elif platform == "instagram":
        token = credentials.get("access_token") or credentials.get("instagram_access_token")
        if token:
            _update_env_file("INSTAGRAM_ACCESS_TOKEN", token)
            settings.INSTAGRAM_ACCESS_TOKEN = token
        acc_id = credentials.get("account_id") or credentials.get("instagram_account_id")
        if acc_id:
            _update_env_file("INSTAGRAM_ACCOUNT_ID", acc_id)
            settings.INSTAGRAM_ACCOUNT_ID = acc_id

    elif platform == "youtube":
        api_key = credentials.get("api_key") or credentials.get("youtube_api_key")
        if api_key:
            _update_env_file("YOUTUBE_API_KEY", api_key)
            settings.YOUTUBE_API_KEY = api_key
        channel_id = credentials.get("channel_id") or credentials.get("youtube_channel_id")
        if channel_id:
            _update_env_file("YOUTUBE_CHANNEL_ID", channel_id)
            settings.YOUTUBE_CHANNEL_ID = channel_id

    elif platform == "tiktok":
        token = credentials.get("access_token") or credentials.get("tiktok_access_token")
        if token:
            _update_env_file("TIKTOK_ACCESS_TOKEN", token)
            settings.TIKTOK_ACCESS_TOKEN = token
        client_key = credentials.get("client_key") or credentials.get("tiktok_client_key")
        if client_key:
            _update_env_file("TIKTOK_CLIENT_KEY", client_key)
            settings.TIKTOK_CLIENT_KEY = client_key

    elif platform == "x":
        bearer = credentials.get("bearer_token") or credentials.get("x_bearer_token")
        if bearer:
            _update_env_file("X_BEARER_TOKEN", bearer)
            settings.X_BEARER_TOKEN = bearer

    else:
        raise HTTPException(status_code=400, detail=f"Plataforma '{platform}' no soportada.")

    # Trigger fresh data aggregation across the whole environment
    try:
        fresh_data = await AnalyticsService.get_aggregated_data(platform="all")
    except Exception as e:
        logger.warning(f"Post-save data aggregation notice: {e}")
        fresh_data = {}

    return {
        "status": "success",
        "message": f"Credenciales de {platform.capitalize()} guardadas e integradas al entorno.",
        "platform": platform,
        "kpis": fresh_data.get("kpis", {}),
    }


@router.post("/exchange-meta-token")
async def exchange_meta_token(payload: Dict[str, Any] = Body(...)) -> Dict[str, Any]:
    """
    Exchange short-lived Meta user token for a permanent Page Access Token.
    """
    token = payload.get("short_lived_token", "")
    res = await MetaAuthService.exchange_for_long_lived_token(token)
    if "access_token" in res:
        _update_env_file("FACEBOOK_PAGE_ACCESS_TOKEN", res["access_token"])
        settings.FACEBOOK_PAGE_ACCESS_TOKEN = res["access_token"]
    return res


@router.post("/trigger-sync")
async def trigger_full_database_sync() -> Dict[str, Any]:
    """
    Trigger manual synchronization of social media posts and metrics.
    """
    data = await AnalyticsService.get_aggregated_data(platform="all")
    return {
        "status": "success",
        "synced_posts_count": len(data.get("posts", [])),
        "platforms_synced": ["facebook", "instagram", "youtube", "tiktok"],
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
