import pytest
import asyncio
from backend.connectors.youtube.connector import YouTubeConnector


def test_youtube_connector_mock_flow():
    async def _run():
        yt = YouTubeConnector()
        auth = await yt.authenticate()
        assert auth is True

        profile = await yt.get_profile()
        assert profile.platform == "youtube"
        assert profile.followers_count == 120500

        posts = await yt.get_posts()
        assert len(posts) > 0

        # Check Shorts classification
        has_short = any(p.type == "short" for p in posts)
        assert has_short is True

        metrics = await yt.get_post_metrics(posts[0].id)
        assert metrics.views > 0
        assert metrics.watch_time > 0

    asyncio.run(_run())
