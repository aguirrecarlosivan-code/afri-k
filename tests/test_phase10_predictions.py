import pytest
from backend.ai.predictive_engine import ContentPerformancePredictor


def test_predict_performance_reel_peak_hour():
    pred = ContentPerformancePredictor.predict_performance(
        platform="instagram",
        format_type="reel",
        planned_hour=18,
        char_count=150,
    )
    assert pred["platform"] == "instagram"
    assert pred["format_type"] == "reel"
    assert pred["predicted_reach"] > 30000
    assert pred["virality_score"] > 20.0
    assert "✅" in pred["strategic_recommendation"]


def test_predict_performance_reprogram_recommendation():
    pred = ContentPerformancePredictor.predict_performance(
        platform="tiktok",
        format_type="video",
        planned_hour=4,  # Non-peak hour 04:00 AM
        char_count=100,
    )
    assert pred["planned_hour"] == 4
    assert "💡" in pred["strategic_recommendation"]
