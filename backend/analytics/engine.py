from typing import List, Dict, Any, Optional
from datetime import datetime, timedelta


class AnalyticsEngine:
    """
    Independent Analytics Engine for Radar Social Media Intelligence.
    Calculates WoW growth, viral posts, engagement rates, optimal posting times, format efficiency, and cross-platform rankings.
    """

    @staticmethod
    def calculate_engagement_rate(likes: int, comments: int, shares: int, clicks: int, reach: int) -> float:
        """Calculate engagement rate percentage based on reach."""
        if reach <= 0:
            return 0.0
        total_interactions = likes + comments + shares + clicks
        return round((total_interactions / reach) * 100, 2)

    @staticmethod
    def calculate_virality_score(likes: int, comments: int, shares: int, reach: int, impressions: int) -> float:
        """
        Calculate virality score based on share weight (highest viral impact), comments, and reach-to-impression ratio.
        Score normalized between 0.0 and 100.0.
        """
        if reach <= 0:
            return 0.0

        weighted_interactions = likes + (comments * 2.0) + (shares * 3.5)
        reach_expansion_ratio = impressions / reach if reach > 0 else 1.0

        raw_score = (weighted_interactions / reach * 100) * reach_expansion_ratio
        return round(min(raw_score, 100.0), 2)

    @staticmethod
    def filter_posts(
        posts_data: List[Dict[str, Any]],
        platform: Optional[str] = None,
        content_type: Optional[str] = None,
        start_date: Optional[datetime] = None,
        end_date: Optional[datetime] = None,
    ) -> List[Dict[str, Any]]:
        """Filter post list by platform, content_type, and date bounds."""
        filtered = []
        for p in posts_data:
            if platform and platform.lower() != "all" and p.get("platform", "").lower() != platform.lower():
                continue

            if content_type and content_type.lower() != "all" and p.get("type", "").lower() != content_type.lower():
                continue

            dt_raw = p.get("published_at")
            if dt_raw:
                if isinstance(dt_raw, str):
                    dt = datetime.fromisoformat(dt_raw)
                else:
                    dt = dt_raw

                if start_date and dt < start_date:
                    continue
                if end_date and dt > end_date:
                    continue

            filtered.append(p)
        return filtered

    @staticmethod
    def format_efficiency_breakdown(posts_data: List[Dict[str, Any]]) -> Dict[str, Dict[str, Any]]:
        """
        Calculate average reach, engagement rate, and virality by content format (reel, video, post, short, tweet).
        """
        formats = {}
        for p in posts_data:
            fmt = p.get("type", "post").lower()
            if fmt not in formats:
                formats[fmt] = {"count": 0, "total_reach": 0, "total_likes": 0, "total_comments": 0, "total_shares": 0}

            m = p.get("metrics", {})
            formats[fmt]["count"] += 1
            formats[fmt]["total_reach"] += m.get("reach", 0)
            formats[fmt]["total_likes"] += m.get("likes", 0)
            formats[fmt]["total_comments"] += m.get("comments", 0)
            formats[fmt]["total_shares"] += m.get("shares", 0)

        result = {}
        for fmt, val in formats.items():
            count = val["count"]
            avg_reach = round(val["total_reach"] / count) if count > 0 else 0
            eng_rate = AnalyticsEngine.calculate_engagement_rate(
                likes=val["total_likes"],
                comments=val["total_comments"],
                shares=val["total_shares"],
                clicks=0,
                reach=val["total_reach"],
            )
            result[fmt] = {
                "posts_count": count,
                "avg_reach": avg_reach,
                "engagement_rate": eng_rate,
            }
        return result

    @staticmethod
    def detect_viral_posts(posts_data: List[Dict[str, Any]], virality_threshold: float = 12.0) -> List[Dict[str, Any]]:
        """Rank posts primarily by Likes, then Comments, then Shares, then Reach."""
        ranked_posts = []
        for p in posts_data:
            m = p.get("metrics", {})
            likes = m.get("likes", 0)
            comments = m.get("comments", 0)
            shares = m.get("shares", 0)
            reach = m.get("reach", 0)
            v_score = AnalyticsEngine.calculate_virality_score(
                likes=likes,
                comments=comments,
                shares=shares,
                reach=reach if reach > 0 else 1,
                impressions=m.get("impressions", reach if reach > 0 else 1),
            )
            post_copy = dict(p)
            post_copy["virality_score"] = v_score
            post_copy["total_interactions"] = likes + comments + shares
            ranked_posts.append(post_copy)

        # Primary criterion: Likes (desc), then Comments (desc), then Shares (desc), then Reach (desc)
        return sorted(
            ranked_posts,
            key=lambda x: (
                x.get("metrics", {}).get("likes", 0),
                x.get("metrics", {}).get("comments", 0),
                x.get("metrics", {}).get("shares", 0),
                x.get("metrics", {}).get("reach", 0),
            ),
            reverse=True,
        )

    @staticmethod
    def compare_weeks(current_week_metrics: Dict[str, Any], previous_week_metrics: Dict[str, Any]) -> Dict[str, Any]:
        """Calculate Week-over-Week (WoW) percentage change for key metrics."""
        keys = ["reach", "impressions", "engagement", "followers_gained", "posts_published"]
        comparison = {}

        for k in keys:
            curr = current_week_metrics.get(k, 0)
            prev = previous_week_metrics.get(k, 0)

            if prev == 0:
                pct_change = 100.0 if curr > 0 else 0.0
            else:
                pct_change = round(((curr - prev) / prev) * 100, 2)

            comparison[k] = {
                "current": curr,
                "previous": prev,
                "change_pct": pct_change,
                "trend": "up" if pct_change > 0 else ("down" if pct_change < 0 else "neutral"),
            }

        return comparison

    @staticmethod
    def calculate_best_posting_times(posts_data: List[Dict[str, Any]]) -> Dict[str, Any]:
        """Analyze engagement by hour of day and day of week in Spanish."""
        day_names_en = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]
        day_names_es = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado", "Domingo"]

        # Editorial engagement baseline for Once Noticias broadcast windows
        # Base hourly curves: peaks at 7-9h (Matutino), 14-16h (Meridiano), 20-22h (Nocturno)
        base_hourly = [
            1.2, 0.8, 0.5, 0.4, 0.6, 1.8, 3.5, 8.2, 9.5, 7.8,  # 00:00 - 09:00
            6.2, 5.8, 6.4, 7.2, 10.4, 11.2, 9.0, 7.8, 8.4, 11.8, # 10:00 - 19:00
            14.2, 13.5, 9.8, 4.2                                   # 20:00 - 23:00
        ]

        # Day factors (mid-week & Friday tend to peak higher in news consumption)
        day_factors = {
            "Mon": 1.05,
            "Tue": 1.10,
            "Wed": 1.15,
            "Thu": 1.12,
            "Fri": 1.18,
            "Sat": 0.85,
            "Sun": 0.90,
        }

        # Initialize with editorial baseline
        heatmap = {}
        for day in day_names_en:
            factor = day_factors.get(day, 1.0)
            heatmap[day] = [round(val * factor, 1) for val in base_hourly]

        # Overlay actual live posts data
        live_counts = {day: [0] * 24 for day in day_names_en}
        live_sums = {day: [0.0] * 24 for day in day_names_en}

        for p in posts_data:
            dt_str = p.get("published_at")
            if isinstance(dt_str, str):
                try:
                    dt = datetime.fromisoformat(dt_str.replace("Z", "+00:00"))
                except Exception:
                    continue
            elif isinstance(dt_str, datetime):
                dt = dt_str
            else:
                continue

            day_str = day_names_en[dt.weekday()]
            hour = dt.hour
            m = p.get("metrics", {})
            likes = m.get("likes", 0)
            comments = m.get("comments", 0)
            shares = m.get("shares", 0)
            reach = m.get("reach", 0)
            total_actions = likes + comments + shares

            if "engagement" in m and float(m["engagement"]) > 0:
                eng = float(m["engagement"])
            elif reach > 0:
                eng = round((total_actions / reach) * 100, 1)
            else:
                eng = float(total_actions)

            live_sums[day_str][hour] += eng
            live_counts[day_str][hour] += 1

        # Apply live posts boost to heatmap
        for idx, day in enumerate(day_names_en):
            for h in range(24):
                if live_counts[day][h] > 0:
                    avg_live = round(live_sums[day][h] / live_counts[day][h], 1)
                    # Blend live data with baseline
                    heatmap[day][h] = round((heatmap[day][h] * 0.3) + (avg_live * 0.7), 1)

        # Find absolute peak slot
        best_slot = {"day": "Viernes", "hour": 20, "avg_engagement": 16.8}
        max_val = -1.0

        for idx, day in enumerate(day_names_en):
            for h in range(24):
                val = heatmap[day][h]
                if val > max_val:
                    max_val = val
                    best_slot = {
                        "day": day_names_es[idx],
                        "hour": h,
                        "avg_engagement": val,
                    }

        return {
            "heatmap": heatmap,
            "best_posting_slot": best_slot,
        }

    @staticmethod
    def platform_rankings(platform_summaries: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """Rank platforms by total reach and engagement efficiency."""
        ranked = sorted(platform_summaries, key=lambda x: x.get("total_reach", 0), reverse=True)
        for idx, item in enumerate(ranked, start=1):
            item["rank"] = idx
        return ranked
