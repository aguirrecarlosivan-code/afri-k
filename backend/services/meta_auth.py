import httpx
import logging
from typing import Dict, Any, Optional
from backend.config.settings import settings

logger = logging.getLogger("radar.services.meta_auth")


class MetaAuthService:
    """
    Meta Graph API Authentication & Token Management Service.
    Handles exchange of short-lived tokens for long-lived (60-day) access tokens.
    """

    GRAPH_VERSION = "v21.0"
    BASE_URL = f"https://graph.facebook.com/{GRAPH_VERSION}"

    @classmethod
    async def exchange_for_long_lived_token(
        cls, short_lived_token: str, app_id: Optional[str] = None, app_secret: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        Exchange short-lived User Access Token for 60-day Long-Lived Token.
        """
        client_id = app_id or settings.FACEBOOK_APP_ID
        client_secret = app_secret or settings.FACEBOOK_APP_SECRET

        if not client_id or not client_secret or short_lived_token.startswith("mock"):
            logger.info("MetaAuthService running in Mock Mode")
            return {
                "access_token": "mock_long_lived_meta_token_60days",
                "token_type": "bearer",
                "expires_in": 5184000,  # 60 days in seconds
                "is_mock": True,
            }

        async with httpx.AsyncClient() as client:
            try:
                res = await client.get(
                    f"{cls.BASE_URL}/oauth/access_token",
                    params={
                        "grant_type": "fb_exchange_token",
                        "client_id": client_id,
                        "client_secret": client_secret,
                        "fb_exchange_token": short_lived_token,
                    },
                )
                data = res.json()
                if res.status_code == 200:
                    logger.info("Successfully exchanged Meta short-lived token for long-lived token")
                    return data
                else:
                    logger.error(f"Meta token exchange error: {data}")
                    return {"error": data.get("error", {}).get("message", "Token exchange failed")}
            except Exception as e:
                logger.error(f"Exception during Meta token exchange: {e}")
                return {"error": str(e)}

    @classmethod
    async def validate_token(cls, token: str) -> Dict[str, Any]:
        """
        Inspect and validate access token metadata.
        """
        if not token or token.startswith("mock"):
            return {
                "is_valid": True,
                "app_id": "mock_app",
                "type": "USER",
                "expires_at": 1799999999,
                "scopes": ["pages_read_engagement", "instagram_basic", "instagram_manage_insights"],
            }

        async with httpx.AsyncClient() as client:
            try:
                res = await client.get(
                    f"{cls.BASE_URL}/debug_token",
                    params={
                        "input_token": token,
                        "access_token": f"{settings.FACEBOOK_APP_ID}|{settings.FACEBOOK_APP_SECRET}",
                    },
                )
                data = res.json().get("data", {})
                return {
                    "is_valid": data.get("is_valid", False),
                    "app_id": data.get("app_id"),
                    "expires_at": data.get("expires_at"),
                    "scopes": data.get("scopes", []),
                }
            except Exception as e:
                logger.error(f"Token validation failed: {e}")
                return {"is_valid": False, "error": str(e)}
