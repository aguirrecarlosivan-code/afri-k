# Radar - API Specification & Technical Documentation

## 1. Overview
Radar is a social media intelligence and editorial analytics platform. It collects historical metrics across Facebook, Instagram, YouTube, TikTok, and X (Twitter), standardizes them into a single unified model, calculates Week-over-Week (WoW) trends, and generates AI-driven executive reports.

---

## 2. Architecture & Tech Stack
- **Backend Framework**: Python 3.14 / FastAPI
- **Database**: PostgreSQL with SQLAlchemy 2.0 (Async Engine)
- **Scheduler**: APScheduler (AsyncIOScheduler)
- **AI Intelligence**: Gemini 2.5 / OpenAI GPT-4o-mini / Heuristic Fallback
- **Frontend**: React 18, Vite 5, TailwindCSS, ECharts

---

## 3. Unified Data Models

### Account
- `id` (String): Platform-specific account ID
- `platform` (String): `facebook` | `instagram` | `youtube` | `tiktok` | `x`
- `name` (String): Display name
- `username` (String): Account handle
- `followers_count` (Integer): Total community count

### Post
- `id` (String): Unified post ID
- `account_id` (String): Account reference
- `platform` (String): Platform identifier
- `published_at` (DateTime): ISO publication date
- `type` (String): `post` | `video` | `reel` | `story` | `tweet` | `short`
- `text` (String): Post caption / content
- `url` (String): Permalink

### Metrics
- `reach` (Integer): Unique accounts reached
- `impressions` (Integer): Total views/impressions
- `engagement` (Float): Calculated engagement rate %
- `likes` (Integer)
- `comments` (Integer)
- `shares` (Integer)
- `clicks` (Integer)
- `views` (Integer)
- `watch_time` (Integer): Duration in seconds

---

## 4. API Endpoints

### Health Check
- `GET /` -> Status check and OpenAPI link

### Analytics Engine
- `GET /api/v1/analytics/overview` -> Executive KPIs, WoW changes, and platform rankings
- `GET /api/v1/analytics/posting-heatmap` -> Optimal posting hours and days matrix

### AI Editorial Intelligence
- `POST /api/v1/ai/generate-summary` -> Triggers AI analysis on historical metrics

### Executive Reports
- `POST /api/v1/reports/trigger-weekly-snapshot` -> Triggers Friday 22:00 snapshot & PDF/PPTX generation
- `GET /api/v1/reports/latest` -> URLs of generated report files

### Platform Connectors
- `GET /api/v1/connectors/status` -> Health status for 5 platform connectors
- `GET /api/v1/connectors/{platform}/profile` -> Fetches account profile
- `GET /api/v1/connectors/{platform}/posts` -> Fetches latest posts

---

## 5. Automated Jobs (APScheduler)
- **Hourly**: Refresh metrics for active posts & accounts
- **Daily (02:00)**: Synchronize newly published posts
- **Fridays (22:00)**: Weekly snapshot cut, WoW calculation, AI summary, PDF & PPTX report generation
