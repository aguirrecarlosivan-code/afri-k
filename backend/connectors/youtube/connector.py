import httpx
import logging
from typing import List, Optional
from datetime import datetime, date, timezone
from backend.connectors.base import (
    BaseConnector,
    UnifiedAccountProfile,
    UnifiedPostDTO,
    UnifiedMetricsDTO,
    UnifiedDailyMetricsDTO,
)
from backend.config.settings import settings

logger = logging.getLogger("radar.connectors.youtube")


class YouTubeConnector(BaseConnector):
    """
    YouTube Data API v3 Connector for Channels, Videos, and Shorts.
    """

    BASE_URL = "https://www.googleapis.com/youtube/v3"

    def __init__(self, channel_id: Optional[str] = None, api_key: Optional[str] = None):
        self.channel_id = channel_id or "yt_channel_default"
        self.api_key = api_key or settings.YOUTUBE_API_KEY or ""

    async def authenticate(self) -> bool:
        """Validate YouTube API Key."""
        if not self.api_key or self.api_key.startswith("mock"):
            logger.info("YouTube Connector running in Mock/Development Mode")
            return True

        async with httpx.AsyncClient() as client:
            try:
                res = await client.get(
                    f"{self.BASE_URL}/channels",
                    params={"part": "snippet", "id": self.channel_id, "key": self.api_key},
                )
                return res.status_code == 200 and len(res.json().get("items", [])) > 0
            except Exception as e:
                logger.error(f"YouTube authentication failed: {e}")
                return False

    async def get_profile(self) -> UnifiedAccountProfile:
        """Fetch YouTube channel statistics and snippet."""
        if not self.api_key or self.api_key.startswith("mock"):
            return UnifiedAccountProfile(
                id=self.channel_id,
                platform="youtube",
                name="Radar Intelligence Channel",
                username="@RadarIntelligence",
                profile_picture_url="https://images.unsplash.com/photo-1611162618071-b39a2ec055fb?w=150",
                followers_count=120500,  # Subscribers
            )

        async with httpx.AsyncClient() as client:
            res = await client.get(
                f"{self.BASE_URL}/channels",
                params={"part": "snippet,statistics", "id": self.channel_id, "key": self.api_key},
            )
            items = res.json().get("items", [])
            if not items:
                return UnifiedAccountProfile(id=self.channel_id, platform="youtube", name="YouTube Channel", followers_count=0)

            ch = items[0]
            snippet = ch.get("snippet", {})
            stats = ch.get("statistics", {})

            return UnifiedAccountProfile(
                id=ch["id"],
                platform="youtube",
                name=snippet.get("title", "YouTube Channel"),
                username=f"@{snippet.get('customUrl', snippet.get('title', ''))}",
                profile_picture_url=snippet.get("thumbnails", {}).get("default", {}).get("url"),
                followers_count=int(stats.get("subscriberCount", 0)),
            )

    async def get_posts(self, since: Optional[datetime] = None) -> List[UnifiedPostDTO]:
        """Fetch YouTube videos and Shorts using Search / PlaylistItems API."""
        if not self.api_key or self.api_key.startswith("mock"):
            now_utc = datetime.now(timezone.utc)
            return [
                UnifiedPostDTO(
                    id="yt_video_301",
                    account_id=self.channel_id,
                    platform="youtube",
                    published_at=now_utc,
                    type="video",
                    text="Análisis Completo de Tendencias Digitales 2026: Estrategias y Métricas Clave",
                    url="https://youtube.com/watch?v=301",
                ),
                UnifiedPostDTO(
                    id="yt_video_302",
                    account_id=self.channel_id,
                    platform="youtube",
                    published_at=now_utc,
                    type="short",
                    text="¿Cómo calcular tu tasa de engagement real en 30 segundos? #Shorts",
                    url="https://youtube.com/shorts/302",
                ),
            ]

        async with httpx.AsyncClient() as client:
            res = await client.get(
                f"{self.BASE_URL}/search",
                params={
                    "part": "snippet",
                    "channelId": self.channel_id,
                    "order": "date",
                    "type": "video",
                    "maxResults": 15,
                    "key": self.api_key,
                },
            )
            items = res.json().get("data", res.json().get("items", []))
            posts = []
            for item in items:
                v_id = item.get("id", {}).get("videoId")
                snippet = item.get("snippet", {})
                title = snippet.get("title", "")
                pub_raw = snippet.get("publishedAt", "")
                pub_time = datetime.strptime(pub_raw, "%Y-%m-%dT%H:%M:%SZ") if pub_raw else datetime.utcnow()

                is_short = "#shorts" in title.lower() or "short" in title.lower()
                posts.append(
                    UnifiedPostDTO(
                        id=v_id or "yt_vid",
                        account_id=self.channel_id,
                        platform="youtube",
                        published_at=pub_time,
                        type="short" if is_short else "video",
                        text=title,
                        url=f"https://youtube.com/watch?v={v_id}",
                    )
                )
            return posts

    async def get_post_metrics(self, post_id: str) -> UnifiedMetricsDTO:
        """Fetch video viewCount, likeCount, commentCount from YouTube Data API."""
        if not self.api_key or self.api_key.startswith("mock"):
            return UnifiedMetricsDTO(
                reach=45000,
                impressions=78000,
                engagement=8.2,
                likes=3400,
                comments=480,
                shares=620,
                clicks=1100,
                views=45000,
                watch_time=145000,
                followers=120500,
            )

        async with httpx.AsyncClient() as client:
            res = await client.get(
                f"{self.BASE_URL}/videos",
                params={"part": "statistics", "id": post_id, "key": self.api_key},
            )
            items = res.json().get("items", [])
            if not items:
                return UnifiedMetricsDTO(reach=0, impressions=0, engagement=0.0)

            stats = items[0].get("statistics", {})
            views = int(stats.get("viewCount", 0))
            likes = int(stats.get("likeCount", 0))
            comments = int(stats.get("commentCount", 0))

            eng_rate = ((likes + comments) / views * 100) if views > 0 else 0.0

            return UnifiedMetricsDTO(
                reach=views,
                impressions=int(views * 1.5),
                engagement=round(eng_rate, 2),
                likes=likes,
                comments=comments,
                shares=0,
                clicks=0,
                views=views,
                watch_time=views * 120,  # Estimated 2 minutes average watch time
                followers=120500,
            )

    async def get_followers(self, history_days: int = 30) -> int:
        profile = await self.get_profile()
        return profile.followers_count

    async def get_daily_metrics(self, target_date: date) -> UnifiedDailyMetricsDTO:
        profile = await self.get_profile()
        return UnifiedDailyMetricsDTO(
            account_id=self.channel_id,
            snapshot_date=target_date,
            followers=profile.followers_count,
            followers_gained=450,
            reach=52000,
            impressions=89000,
            total_engagement=4500,
            posts_published=1,
        )
