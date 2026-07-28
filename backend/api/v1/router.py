from fastapi import APIRouter
from backend.api.v1.endpoints.analytics import router as analytics_router
from backend.api.v1.endpoints.ai import router as ai_router
from backend.api.v1.endpoints.reports import router as reports_router
from backend.api.v1.endpoints.connectors import router as connectors_router

api_v1_router = APIRouter()
api_v1_router.include_router(analytics_router)
api_v1_router.include_router(ai_router)
api_v1_router.include_router(reports_router)
api_v1_router.include_router(connectors_router)
