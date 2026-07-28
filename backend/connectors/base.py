from abc import ABC, abstractmethod
from typing import List, Optional
from datetime import datetime, date
from pydantic import BaseModel, Field


# --- Pydantic Data Transfer Objects (DTOs) for Unified Models ---

class UnifiedAccountProfile(BaseModel):
    id: str
    platform: str
    name: str
    username: Optional[str] = None
    profile_picture_url: Optional[str] = None
    followers_count: int = 0


class UnifiedPostDTO(BaseModel):
    id: str
    account_id: str
    platform: str  # 'facebook' | 'instagram' | 'youtube' | 'tiktok' | 'x'
    published_at: datetime
    type: str  # 'post' | 'video' | 'reel' | 'story' | 'tweet' | 'short'
    text: Optional[str] = None
    url: Optional[str] = None


class UnifiedMetricsDTO(BaseModel):
    reach: int = 0
    impressions: int = 0
    engagement: float = 0.0
    likes: int = 0
    comments: int = 0
    shares: int = 0
    clicks: int = 0
    views: int = 0
    watch_time: int = 0  # seconds
    followers: int = 0


class UnifiedDailyMetricsDTO(BaseModel):
    account_id: str
    snapshot_date: date
    followers: int = 0
    followers_gained: int = 0
    reach: int = 0
    impressions: int = 0
    total_engagement: int = 0
    posts_published: int = 0


# --- Abstract Base Connector Interface ---

class BaseConnector(ABC):
    """
    Standard interface for all social media platform connectors in Radar.
    Each connector MUST implement these 6 methods without mixing business logic.
    """

    @abstractmethod
    async def authenticate(self) -> bool:
        """Validate API credentials/tokens for the platform."""
        pass

    @abstractmethod
    async def get_profile(self) -> UnifiedAccountProfile:
        """Fetch account/page profile information."""
        pass

    @abstractmethod
    async def get_posts(self, since: Optional[datetime] = None) -> List[UnifiedPostDTO]:
        """Fetch list of posts published on the platform."""
        pass

    @abstractmethod
    async def get_post_metrics(self, post_id: str) -> UnifiedMetricsDTO:
        """Fetch post-level metrics for a specific post."""
        pass

    @abstractmethod
    async def get_followers(self, history_days: int = 30) -> int:
        """Fetch current follower count."""
        pass

    @abstractmethod
    async def get_daily_metrics(self, target_date: date) -> UnifiedDailyMetricsDTO:
        """Fetch account-level daily aggregated metrics for a specific date."""
        pass
