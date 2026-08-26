from pydantic_settings import BaseSettings, SettingsConfigDict
from typing import Optional


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8", extra="ignore")

    APP_NAME: str = "Afri-k"
    APP_ENV: str = "development"
    DEBUG: bool = True
    API_V1_STR: str = "/api/v1"
    SECRET_KEY: str = "super-secret-radar-key"

    # Database (defaults to embedded SQLite; PostgreSQL enabled via .env)
    DATABASE_URL: str = "sqlite+aiosqlite:///./data/radar.db"

    # Redis
    REDIS_URL: Optional[str] = "redis://localhost:6379/0"

    # AI
    AI_PROVIDER: str = "gemini"
    GEMINI_API_KEY: Optional[str] = None
    OPENAI_API_KEY: Optional[str] = None
    AI_MODEL_NAME: str = "gemini-2.5-flash"

    # Social Media API Credentials
    FACEBOOK_APP_ID: Optional[str] = None
    FACEBOOK_APP_SECRET: Optional[str] = None
    FACEBOOK_PAGE_ACCESS_TOKEN: Optional[str] = None

    INSTAGRAM_ACCOUNT_ID: Optional[str] = None
    INSTAGRAM_ACCESS_TOKEN: Optional[str] = None

    YOUTUBE_CHANNEL_ID: Optional[str] = None
    YOUTUBE_API_KEY: Optional[str] = None

    TIKTOK_CLIENT_KEY: Optional[str] = None
    TIKTOK_ACCESS_TOKEN: Optional[str] = None

    X_BEARER_TOKEN: Optional[str] = None

    # Scheduler
    SCHEDULER_ENABLED: bool = True
    WEEKLY_REPORT_CRON_DAY: str = "fri"
    WEEKLY_REPORT_CRON_HOUR: int = 22
    WEEKLY_REPORT_CRON_MINUTE: int = 0


settings = Settings()
