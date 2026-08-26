import httpx
import asyncio
import logging
from typing import Dict, Any

logger = logging.getLogger("radar.connectors.meta_base")


class MetaResilientClient:
    """
    Fast Async HTTP Client for Meta Graph API v21.0.
    Instantly detects token expiration (code 190) and fails fast without slow retries.
    """

    GRAPH_VERSION = "v21.0"
    BASE_URL = f"https://graph.facebook.com/{GRAPH_VERSION}"

    @classmethod
    async def get(
        cls,
        endpoint: str,
        params: Dict[str, Any],
        max_retries: int = 1,
    ) -> Dict[str, Any]:
        """
        Execute GET request against Meta Graph API fast.
        """
        url = f"{cls.BASE_URL}/{endpoint.lstrip('/')}"

        async with httpx.AsyncClient(timeout=12.0) as client:
            try:
                res = await client.get(url, params=params)
                data = res.json()

                if res.status_code == 200:
                    return data

                error = data.get("error", {})
                code = error.get("code")

                # Token Expired (code 190) - Fail FAST immediately!
                if code == 190 or res.status_code == 400:
                    logger.warning("Meta Access Token Expired (code 190). Returning fast error.")
                    return {"error": "token_expired", "message": error.get("message")}

                logger.error(f"Meta Graph API error response: {error}")
                return {"error": error.get("message", "API request failed")}

            except Exception as e:
                logger.warning(f"Meta HTTP request exception: {e}")
                return {"error": str(e)}
