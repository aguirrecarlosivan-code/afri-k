import pytest
import asyncio
from datetime import datetime
from backend.connectors.facebook.connector import FacebookConnector
from backend.connectors.instagram.connector import InstagramConnector
from backend.services.meta_auth import MetaAuthService


def test_meta_token_exchange_mock():
    async def _run():
        res = await MetaAuthService.exchange_for_long_lived_token("mock_short_token")
        assert "access_token" in res
        assert res.get("is_mock") is True

    asyncio.run(_run())


def test_facebook_connector_mock_flow():
    async def _run():
        fb = FacebookConnector()
        auth = await fb.authenticate()
        assert auth is True

        profile = await fb.get_profile()
        assert profile.platform == "facebook"
        assert profile.followers_count > 0

        posts = await fb.get_posts()
        assert len(posts) > 0

        metrics = await fb.get_post_metrics(posts[0].id)
        assert metrics.reach >= 0

    asyncio.run(_run())


def test_instagram_connector_mock_flow():
    async def _run():
        ig = InstagramConnector()
        auth = await ig.authenticate()
        assert auth is True

        profile = await ig.get_profile()
        assert profile.platform == "instagram"

        posts = await ig.get_posts()
        assert len(posts) > 0

        metrics = await ig.get_post_metrics(posts[0].id)
        assert metrics.reach > 0

    asyncio.run(_run())
