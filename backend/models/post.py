from sqlalchemy import String, DateTime, Text, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship
from datetime import datetime
from backend.database.session import Base


class Post(Base):
    __tablename__ = "posts"

    id: Mapped[str] = mapped_column(String(255), primary_key=True)  # Unified or platform post ID
    account_id: Mapped[str] = mapped_column(String(255), ForeignKey("accounts.id"), nullable=False, index=True)
    platform: Mapped[str] = mapped_column(String(50), nullable=False, index=True)  # facebook, instagram, youtube, etc.
    published_at: Mapped[datetime] = mapped_column(DateTime, nullable=False, index=True)
    type: Mapped[str] = mapped_column(String(50), nullable=False, default="post")  # post, video, reel, story, tweet, short
    text: Mapped[str] = mapped_column(Text, nullable=True)
    url: Mapped[str] = mapped_column(Text, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    updated_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    account = relationship("Account", back_populates="posts")
    metrics = relationship("PostMetrics", back_populates="post", uselist=False, cascade="all, delete-orphan")
