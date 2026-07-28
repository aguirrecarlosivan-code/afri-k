import logging
from datetime import datetime, date
from typing import List, Dict, Any
from sqlalchemy import select
from backend.database.session import AsyncSessionLocal
from backend.models.account import Account
from backend.models.post import Post
from backend.models.metrics import PostMetrics, DailyMetricsSnapshot
from backend.connectors.base import (
    UnifiedAccountProfile,
    UnifiedPostDTO,
    UnifiedMetricsDTO,
    UnifiedDailyMetricsDTO,
)

logger = logging.getLogger("radar.services.sync_service")


class DatabaseSyncService:
    """
    Sync Service to persist normalized accounts, posts, metrics, and daily snapshots into PostgreSQL.
    """

    @classmethod
    async def sync_account_profile(cls, profile: UnifiedAccountProfile) -> Account:
        """Upsert social media account profile."""
        async with AsyncSessionLocal() as db:
            result = await db.execute(select(Account).where(Account.id == profile.id))
            account = result.scalar_one_or_none()

            if not account:
                account = Account(
                    id=profile.id,
                    platform=profile.platform,
                    name=profile.name,
                    username=profile.username,
                    profile_picture_url=profile.profile_picture_url,
                    followers_count=profile.followers_count,
                )
                db.add(account)
            else:
                account.name = profile.name
                account.username = profile.username
                account.profile_picture_url = profile.profile_picture_url
                account.followers_count = profile.followers_count
                account.updated_at = datetime.utcnow()

            await db.commit()
            await db.refresh(account)
            logger.info(f"Synced account profile: {profile.platform} ({profile.name})")
            return account

    @classmethod
    async def sync_posts_and_metrics(
        cls, posts: List[UnifiedPostDTO], metrics_map: Dict[str, UnifiedMetricsDTO]
    ) -> int:
        """Upsert posts and their corresponding post-level metrics."""
        count = 0
        async with AsyncSessionLocal() as db:
            for p in posts:
                # Upsert Post
                res = await db.execute(select(Post).where(Post.id == p.id))
                post_obj = res.scalar_one_or_none()

                if not post_obj:
                    post_obj = Post(
                        id=p.id,
                        account_id=p.account_id,
                        platform=p.platform,
                        published_at=p.published_at,
                        type=p.type,
                        text=p.text,
                        url=p.url,
                    )
                    db.add(post_obj)
                else:
                    post_obj.text = p.text
                    post_obj.url = p.url

                # Upsert Post Metrics
                if p.id in metrics_map:
                    m_dto = metrics_map[p.id]
                    metrics_id = f"{p.id}_metrics"
                    m_res = await db.execute(select(PostMetrics).where(PostMetrics.id == metrics_id))
                    m_obj = m_res.scalar_one_or_none()

                    if not m_obj:
                        m_obj = PostMetrics(
                            id=metrics_id,
                            post_id=p.id,
                            reach=m_dto.reach,
                            impressions=m_dto.impressions,
                            engagement=m_dto.engagement,
                            likes=m_dto.likes,
                            comments=m_dto.comments,
                            shares=m_dto.shares,
                            clicks=m_dto.clicks,
                            views=m_dto.views,
                            watch_time=m_dto.watch_time,
                        )
                        db.add(m_obj)
                    else:
                        m_obj.reach = m_dto.reach
                        m_obj.impressions = m_dto.impressions
                        m_obj.engagement = m_dto.engagement
                        m_obj.likes = m_dto.likes
                        m_obj.comments = m_dto.comments
                        m_obj.shares = m_dto.shares
                        m_obj.clicks = m_dto.clicks
                        m_obj.views = m_dto.views
                        m_obj.watch_time = m_dto.watch_time

                count += 1

            await db.commit()
            logger.info(f"Successfully synced {count} posts and metrics to database.")
            return count

    @classmethod
    async def sync_daily_snapshot(cls, snapshot: UnifiedDailyMetricsDTO) -> DailyMetricsSnapshot:
        """Upsert daily account-level metrics snapshot."""
        snapshot_id = f"{snapshot.account_id}_{snapshot.snapshot_date.strftime('%Y%m%d')}"
        async with AsyncSessionLocal() as db:
            res = await db.execute(select(DailyMetricsSnapshot).where(DailyMetricsSnapshot.id == snapshot_id))
            snap_obj = res.scalar_one_or_none()

            if not snap_obj:
                snap_obj = DailyMetricsSnapshot(
                    id=snapshot_id,
                    account_id=snapshot.account_id,
                    snapshot_date=snapshot.snapshot_date,
                    followers=snapshot.followers,
                    followers_gained=snapshot.followers_gained,
                    reach=snapshot.reach,
                    impressions=snapshot.impressions,
                    total_engagement=snapshot.total_engagement,
                    posts_published=snapshot.posts_published,
                )
                db.add(snap_obj)
            else:
                snap_obj.followers = snapshot.followers
                snap_obj.followers_gained = snapshot.followers_gained
                snap_obj.reach = snapshot.reach
                snap_obj.impressions = snapshot.impressions
                snap_obj.total_engagement = snapshot.total_engagement
                snap_obj.posts_published = snapshot.posts_published

            await db.commit()
            await db.refresh(snap_obj)
            logger.info(f"Daily snapshot stored for account {snapshot.account_id} on {snapshot.snapshot_date}")
            return snap_obj
