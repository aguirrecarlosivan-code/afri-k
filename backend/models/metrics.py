from sqlalchemy import String, Integer, Float, DateTime, ForeignKey, Date
from sqlalchemy.orm import Mapped, mapped_column, relationship
from datetime import datetime, date
from backend.database.session import Base


class PostMetrics(Base):
    __tablename__ = "post_metrics"

    id: Mapped[str] = mapped_column(String(255), primary_key=True)  # Format: {post_id}_metrics
    post_id: Mapped[str] = mapped_column(String(255), ForeignKey("posts.id"), nullable=False, unique=True, index=True)
    reach: Mapped[int] = mapped_column(Integer, default=0)
    impressions: Mapped[int] = mapped_column(Integer, default=0)
    engagement: Mapped[float] = mapped_column(Float, default=0.0)
    likes: Mapped[int] = mapped_column(Integer, default=0)
    comments: Mapped[int] = mapped_column(Integer, default=0)
    shares: Mapped[int] = mapped_column(Integer, default=0)
    clicks: Mapped[int] = mapped_column(Integer, default=0)
    views: Mapped[int] = mapped_column(Integer, default=0)
    watch_time: Mapped[int] = mapped_column(Integer, default=0)  # In seconds
    updated_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    post = relationship("Post", back_populates="metrics")


class DailyMetricsSnapshot(Base):
    __tablename__ = "daily_metrics_snapshots"

    id: Mapped[str] = mapped_column(String(255), primary_key=True)  # Format: {account_id}_{snapshot_date}
    account_id: Mapped[str] = mapped_column(String(255), ForeignKey("accounts.id"), nullable=False, index=True)
    snapshot_date: Mapped[date] = mapped_column(Date, nullable=False, index=True)
    followers: Mapped[int] = mapped_column(Integer, default=0)
    followers_gained: Mapped[int] = mapped_column(Integer, default=0)
    reach: Mapped[int] = mapped_column(Integer, default=0)
    impressions: Mapped[int] = mapped_column(Integer, default=0)
    total_engagement: Mapped[int] = mapped_column(Integer, default=0)
    posts_published: Mapped[int] = mapped_column(Integer, default=0)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

    # Relationships
    account = relationship("Account", back_populates="snapshots")
