import os
import logging
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession, async_sessionmaker
from sqlalchemy.orm import DeclarativeBase
from backend.config.settings import settings

logger = logging.getLogger("radar.database")

# Ensure data directory exists for local database storage
os.makedirs("data", exist_ok=True)


class Base(DeclarativeBase):
    pass


# Default to SQLite for zero-config persistence, or PostgreSQL if configured
target_db_url = settings.DATABASE_URL
if not target_db_url or "sqlite" in target_db_url:
    target_db_url = "sqlite+aiosqlite:///./data/radar.db"

engine = create_async_engine(
    target_db_url,
    echo=False,
    future=True,
)

AsyncSessionLocal = async_sessionmaker(
    bind=engine,
    class_=AsyncSession,
    expire_on_commit=False,
    autocommit=False,
    autoflush=False,
)


async def init_db():
    """
    Initializes database tables.
    If target PostgreSQL server is unreachable, automatically falls back to local SQLite.
    """
    global engine, AsyncSessionLocal
    try:
        async with engine.begin() as conn:
            await conn.run_sync(Base.metadata.create_all)
        logger.info(f"Database initialized successfully with {engine.url.drivername}")
    except Exception as e:
        logger.warning(f"Primary database connection failed ({e}). Falling back to embedded SQLite.")
        sqlite_url = "sqlite+aiosqlite:///./data/radar.db"
        engine = create_async_engine(sqlite_url, echo=False, future=True)
        AsyncSessionLocal = async_sessionmaker(
            bind=engine,
            class_=AsyncSession,
            expire_on_commit=False,
            autocommit=False,
            autoflush=False,
        )
        async with engine.begin() as conn:
            await conn.run_sync(Base.metadata.create_all)
        logger.info("Embedded SQLite database initialized successfully.")


async def get_db():
    """Dependency for obtaining database session in FastAPI routes."""
    async with AsyncSessionLocal() as session:
        try:
            yield session
        finally:
            await session.close()
