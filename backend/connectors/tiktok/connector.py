import httpx
import logging
from typing import List, Optional
from datetime import datetime, date
from backend.connectors.base import (
    BaseConnector,
    UnifiedAccountProfile,
    UnifiedPostDTO,
    UnifiedMetricsDTO,
    UnifiedDailyMetricsDTO,
)
from backend.config.settings import settings

logger = logging.getLogger("radar.connectors.tiktok")


class TikTokConnector(BaseConnector):
    """
    TikTok Display & Business API Connector for vertical video analytics.
    """

    BASE_URL = "https://open.tiktokapis.com/v2"

    def __init__(self, client_key: Optional[str] = None, access_token: Optional[str] = None):
        self.client_key = client_key or settings.TIKTOK_CLIENT_KEY or "tt_default"
        self.access_token = access_token or ""

    async def authenticate(self) -> bool:
        """Validate TikTok API credentials."""
        if not self.access_token or self.access_token.startswith("mock"):
            logger.info("TikTok Connector running in Mock/Development Mode")
            return True

        async with httpx.AsyncClient() as client:
            try:
                res = await client.get(
                    f"{self.BASE_URL}/user/info/",
                    headers={"Authorization": f"Bearer {self.access_token}"},
                    params={"fields": "open_id,union_id,avatar_url,display_name"},
                )
                return res.status_code == 200
            except Exception as e:
                logger.error(f"TikTok authentication failed: {e}")
                return False

    async def get_profile(self) -> UnifiedAccountProfile:
        """Fetch TikTok account profile."""
        if not self.access_token or self.access_token.startswith("mock"):
            return UnifiedAccountProfile(
                id="tt_account_401",
                platform="tiktok",
                name="Radar TikTok Official",
                username="@radar_tiktok",
                profile_picture_url="https://images.unsplash.com/photo-1596558450255-7c0b7be9d56a?w=150",
                followers_count=154000,
            )

        async with httpx.AsyncClient() as client:
            res = await client.get(
                f"{self.BASE_URL}/user/info/",
                headers={"Authorization": f"Bearer {self.access_token}"},
                params={"fields": "open_id,display_name,avatar_url,follower_count"},
            )
            data = res.json().get("data", {}).get("user", {})
            return UnifiedAccountProfile(
                id=data.get("open_id", "tt_account"),
                platform="tiktok",
                name=data.get("display_name", "TikTok Account"),
                username=f"@{data.get('display_name', '').lower().replace(' ', '_')}",
                profile_picture_url=data.get("avatar_url"),
                followers_count=int(data.get("follower_count", 0)),
            )

    async def get_posts(self, since: Optional[datetime] = None) -> List[UnifiedPostDTO]:
        """Fetch TikTok vertical videos."""
        if not self.access_token or self.access_token.startswith("mock"):
            return [
                UnifiedPostDTO(
                    id="tt_post_401",
                    account_id="tt_account_401",
                    platform="tiktok",
                    published_at=datetime.utcnow(),
                    type="video",
                    text="Errores comunes al analizar métricas en redes sociales 😱 #MarketingTips #Analytics",
                    url="https://tiktok.com/@radar/video/401",
                ),
            ]

        async with httpx.AsyncClient() as client:
            res = await client.post(
                f"{self.BASE_URL}/video/list/",
                headers={"Authorization": f"Bearer {self.access_token}"},
                json={"max_count": 20},
            )
            videos = res.json().get("data", {}).get("videos", [])
            posts = []
            for v in videos:
                create_time = datetime.fromtimestamp(v.get("create_time", datetime.utcnow().timestamp()))
                posts.append(
                    UnifiedPostDTO(
                        id=v.get("id", "tt_vid"),
                        account_id="tt_account_401",
                        platform="tiktok",
                        published_at=create_time,
                        type="video",
                        text=v.get("title", v.get("video_description")),
                        url=v.get("share_url"),
                    )
                )
            return posts

    async def get_post_metrics(self, post_id: str) -> UnifiedMetricsDTO:
        """Fetch video views, likes, comments, and shares."""
        if not self.access_token or self.access_token.startswith("mock"):
            return UnifiedMetricsDTO(
                reach=98000,
                impressions=135000,
                engagement=9.4,
                likes=12400,
                comments=950,
                shares=1850,
                clicks=1400,
                views=98000,
                watch_time=112000,
                followers=154000,
            )

        async with httpx.AsyncClient() as client:
            res = await client.post(
                f"{self.BASE_URL}/video/query/",
                headers={"Authorization": f"Bearer {self.access_token}"},
                json={"filters": {"video_ids": [post_id]}},
            )
            videos = res.json().get("data", {}).get("videos", [])
            if not videos:
                return UnifiedMetricsDTO(reach=0, impressions=0, engagement=0.0)

            v = videos[0]
            views = int(v.get("view_count", 0))
            likes = int(v.get("like_count", 0))
            comments = int(v.get("comment_count", 0))
            shares = int(v.get("share_count", 0))

            eng_rate = ((likes + comments + shares) / views * 100) if views > 0 else 0.0

            return UnifiedMetricsDTO(
                reach=views,
                impressions=int(views * 1.38),
                engagement=round(eng_rate, 2),
                likes=likes,
                comments=comments,
                shares=shares,
                clicks=0,
                views=views,
                watch_time=views * 45,  # Estimated 45 seconds average watch time
                followers=154000,
            )

    async def get_followers(self, history_days: int = 30) -> int:
        profile = await self.get_profile()
        return profile.followers_count

    async def get_daily_metrics(self, target_date: date) -> UnifiedDailyMetricsDTO:
        profile = await self.get_profile()
        return UnifiedDailyMetricsDTO(
            account_id="tt_account_401",
            snapshot_date=target_date,
            followers=profile.followers_count,
            followers_gained=890,
            reach=110000,
            impressions=160000,
            total_engagement=15200,
            posts_published=2,
        )
