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

logger = logging.getLogger("radar.connectors.x")


class XConnector(BaseConnector):
    """X (Twitter) API v2 Connector."""

    def __init__(self, bearer_token: Optional[str] = None):
        self.bearer_token = bearer_token or settings.X_BEARER_TOKEN or "x_default"

    async def authenticate(self) -> bool:
        return True

    async def get_profile(self) -> UnifiedAccountProfile:
        return UnifiedAccountProfile(
            id="x_account_501",
            platform="x",
            name="Radar Intelligence",
            username="@RadarIntel",
            profile_picture_url="https://images.unsplash.com/photo-1611605698335-8b1569810432?w=150",
            followers_count=34200,
        )

    async def get_posts(self, since: Optional[datetime] = None) -> List[UnifiedPostDTO]:
        return [
            UnifiedPostDTO(
                id="x_tweet_501",
                account_id="x_account_501",
                platform="x",
                published_at=datetime.utcnow(),
                type="tweet",
                text="📊 El 82% de las estrategias de contenido fallan por no medir el alcance real frente al engagement. Hilo 🧵👇",
                url="https://x.com/RadarIntel/status/501",
            ),
        ]

    async def get_post_metrics(self, post_id: str) -> UnifiedMetricsDTO:
        return UnifiedMetricsDTO(
            reach=18500,
            impressions=29400,
            engagement=5.1,
            likes=410,
            comments=62,
            shares=180,  # Reposts
            clicks=390,
            views=29400,
            watch_time=0,
            followers=34200,
        )

    async def get_followers(self, history_days: int = 30) -> int:
        return 34200

    async def get_daily_metrics(self, target_date: date) -> UnifiedDailyMetricsDTO:
        return UnifiedDailyMetricsDTO(
            account_id="x_account_501",
            snapshot_date=target_date,
            followers=34200,
            followers_gained=85,
            reach=22000,
            impressions=34000,
            total_engagement=1042,
            posts_published=4,
        )
