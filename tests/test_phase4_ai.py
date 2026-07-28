import pytest
import asyncio
from datetime import datetime, timedelta
from backend.ai.sentiment import SentimentAnalyzer
from backend.ai.engine import AIEngine


def test_sentiment_tone_analysis_positive():
    res = SentimentAnalyzer.analyze_tone("Lanzamiento increíble y éxito total", likes=1200, comments=80, shares=150)
    assert res["dominant_tone"] == "Positivo / Entusiasta"
    assert res["positive_pct"] > 70.0


def test_sentiment_tone_analysis_critical():
    res = SentimentAnalyzer.analyze_tone("Error y fallo grave en el sistema", likes=10, comments=200, shares=5)
    assert "Crítico" in res["dominant_tone"] or "Debate" in res["dominant_tone"]


def test_ai_deep_analysis_categorized_recommendations():
    async def _run():
        engine = AIEngine(provider="gemini", api_key="mock_key")
        start = datetime.utcnow() - timedelta(days=7)
        end = datetime.utcnow()

        result = await engine.generate_executive_analysis(
            period_start=start,
            period_end=end,
            platform_summaries=[{"platform": "instagram", "total_reach": 50000}],
            top_posts=[{"text": "Prueba", "metrics": {"likes": 1000, "comments": 50, "shares": 20}}],
            wow_comparison={"reach": {"change_pct": 15.0}},
            platform="instagram",
        )

        assert "sentiment_analysis" in result
        assert "positive_pct" in result["sentiment_analysis"]
        assert len(result["recommendations"]) >= 3

    asyncio.run(_run())
