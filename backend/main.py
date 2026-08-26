import logging
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from backend.config.settings import settings
from backend.database.session import engine, Base
from backend.api.v1.router import api_v1_router
from backend.scheduler.jobs import start_scheduler, scheduler

logging.basicConfig(level=logging.INFO, format="%(asctime)s - %(name)s - %(levelname)s - %(message)s")
logger = logging.getLogger("radar.main")


@asynccontextmanager
async def lifespan(app: FastAPI):
    """
    Application startup and shutdown lifespan context manager.
    """
    logger.info("Initializing Afri-k Social Intelligence Backend Engine...")

    # Initialize database with auto-fallback
    try:
        from backend.database.session import init_db
        await init_db()
    except Exception as e:
        logger.warning(f"Database initialization notice: {e}")

    # Start APScheduler
    try:
        start_scheduler()
    except Exception as e:
        logger.warning(f"Scheduler start skipped: {e}")

    yield

    logger.info("Shutting down Afri-k Backend...")
    if scheduler.running:
        scheduler.shutdown()


app = FastAPI(
    title="Afri-k - Plataforma de Inteligencia y Analítica Editorial de Once Noticias",
    description="Backend API REST para recopilación, almacenamiento histórico, analítica editorial y generación de reportes ejecutivos con IA.",
    version="1.0.0",
    openapi_url=f"{settings.API_V1_STR}/openapi.json",
    docs_url="/docs",
    redoc_url="/redoc",
    lifespan=lifespan,
)

# CORS Setup
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include Routers
app.include_router(api_v1_router, prefix=settings.API_V1_STR)


@app.get("/", tags=["Health Check"])
async def root():
    return {
        "status": "online",
        "app_name": settings.APP_NAME,
        "environment": settings.APP_ENV,
        "docs_url": "/docs",
        "api_v1": settings.API_V1_STR,
    }
