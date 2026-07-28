import pytest
import asyncio
from datetime import datetime, timedelta
from backend.analytics.engine import AnalyticsEngine
from backend.ai.engine import AIEngine


def test_engagement_rate_calculation():
    eng_rate = AnalyticsEngine.calculate_engagement_rate(
        likes=100, comments=20, shares=10, clicks=30, reach=1000
    )
    # (100+20+10+30) / 1000 * 100 = 16.0%
    assert eng_rate == 16.0


def test_virality_score_calculation():
    score = AnalyticsEngine.calculate_virality_score(
        likes=500, comments=100, shares=50, reach=10000, impressions=15000
    )
    assert score > 0
    assert score <= 100.0


def test_week_over_week_comparison():
    curr = {"reach": 10000, "impressions": 15000, "engagement": 500, "followers_gained": 100, "posts_published": 5}
    prev = {"reach": 8000, "impressions": 12000, "engagement": 400, "followers_gained": 80, "posts_published": 4}
    comp = AnalyticsEngine.compare_weeks(curr, prev)
    
    assert comp["reach"]["change_pct"] == 25.0
    assert comp["reach"]["trend"] == "up"


def test_ai_engine_heuristic_fallback():
    async def _run():
        engine = AIEngine(provider="gemini", api_key="mock_key")
        start = datetime.utcnow() - timedelta(days=7)
        end = datetime.utcnow()
        
        result = await engine.generate_executive_analysis(
            period_start=start,
            period_end=end,
            platform_summaries=[{"platform": "instagram", "total_reach": 50000}],
            top_posts=[],
            wow_comparison={"reach": {"change_pct": 10.0}},
        )

        assert "executive_summary" in result
        assert "strengths" in result
        assert len(result["strengths"]) >= 3
        assert len(result["recommendations"]) >= 3

    asyncio.run(_run())
