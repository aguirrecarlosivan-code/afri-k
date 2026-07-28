import pytest
from datetime import datetime, timedelta
from backend.analytics.engine import AnalyticsEngine


def test_filter_posts_by_platform():
    mock_posts = [
        {"id": "1", "platform": "facebook", "type": "post"},
        {"id": "2", "platform": "instagram", "type": "reel"},
        {"id": "3", "platform": "facebook", "type": "video"},
    ]
    fb_posts = AnalyticsEngine.filter_posts(mock_posts, platform="facebook")
    assert len(fb_posts) == 2
    assert all(p["platform"] == "facebook" for p in fb_posts)


def test_filter_posts_by_content_type():
    mock_posts = [
        {"id": "1", "platform": "instagram", "type": "reel"},
        {"id": "2", "platform": "youtube", "type": "short"},
        {"id": "3", "platform": "facebook", "type": "reel"},
    ]
    reels = AnalyticsEngine.filter_posts(mock_posts, content_type="reel")
    assert len(reels) == 2
    assert all(p["type"] == "reel" for p in reels)


def test_format_efficiency_breakdown():
    mock_posts = [
        {"id": "1", "type": "reel", "metrics": {"reach": 10000, "likes": 500, "comments": 50, "shares": 30}},
        {"id": "2", "type": "reel", "metrics": {"reach": 20000, "likes": 1000, "comments": 100, "shares": 60}},
        {"id": "3", "type": "post", "metrics": {"reach": 5000, "likes": 100, "comments": 10, "shares": 5}},
    ]
    breakdown = AnalyticsEngine.format_efficiency_breakdown(mock_posts)

    assert "reel" in breakdown
    assert "post" in breakdown
    assert breakdown["reel"]["posts_count"] == 2
    assert breakdown["reel"]["avg_reach"] == 15000
