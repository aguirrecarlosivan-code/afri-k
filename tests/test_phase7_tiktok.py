import pytest
import asyncio
from backend.connectors.tiktok.connector import TikTokConnector


def test_tiktok_connector_mock_flow():
    async def _run():
        tt = TikTokConnector()
        auth = await tt.authenticate()
        assert auth is True

        profile = await tt.get_profile()
        assert profile.platform == "tiktok"
        assert profile.followers_count == 154000

        posts = await tt.get_posts()
        assert len(posts) > 0
        assert posts[0].type == "video"

        metrics = await tt.get_post_metrics(posts[0].id)
        assert metrics.views > 0
        assert metrics.shares > 0

    asyncio.run(_run())
