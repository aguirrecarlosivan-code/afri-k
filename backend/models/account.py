from sqlalchemy import String, Integer, DateTime, Boolean, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship
from datetime import datetime
from backend.database.session import Base


class Account(Base):
    __tablename__ = "accounts"

    id: Mapped[str] = mapped_column(String(255), primary_key=True)  # Platform account ID
    platform: Mapped[str] = mapped_column(String(50), nullable=False, index=True)  # facebook, instagram, youtube, etc.
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    username: Mapped[str] = mapped_column(String(255), nullable=True)
    profile_picture_url: Mapped[str] = mapped_column(Text, nullable=True)
    followers_count: Mapped[int] = mapped_column(Integer, default=0)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    updated_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    posts = relationship("Post", back_populates="account", cascade="all, delete-orphan")
    snapshots = relationship("DailyMetricsSnapshot", back_populates="account", cascade="all, delete-orphan")
