import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import KPICard from './components/KPICard';
import PlatformBreakdown from './components/PlatformBreakdown';
import PostingHeatmap from './components/PostingHeatmap';
import FormatEfficiencyChart from './components/FormatEfficiencyChart';
import SentimentAnalysisChart from './components/SentimentAnalysisChart';
import PlatformReachShareChart from './components/PlatformReachShareChart';
import PlatformDeepMetricsMatrix from './components/PlatformDeepMetricsMatrix';
import TopPostsTable from './components/TopPostsTable';
import AIExecutiveSummaryCard from './components/AIExecutiveSummaryCard';
import ReportExportModal from './components/ReportExportModal';
import DateRangeFilter from './components/DateRangeFilter';
import PlatformTabs from './components/PlatformTabs';
import { Users, Eye, Zap, Activity, Video, Clock, Share2 } from 'lucide-react';

export default function App() {
  const [data, setData] = useState(null);
  const [heatmap, setHeatmap] = useState(null);
  const [aiReport, setAiReport] = useState(null);
  const [isSyncing, setIsSyncing] = useState(false);
  const [isExportOpen, setIsExportOpen] = useState(false);
  const [lastUpdated, setLastUpdated] = useState('');

  const [selectedDays, setSelectedDays] = useState(7);
  const [selectedPlatform, setSelectedPlatform] = useState('all');
  const [customDates, setCustomDates] = useState(null);

  const updateTimestamp = (backendTimestamp) => {
    if (backendTimestamp) {
      setLastUpdated(backendTimestamp);
    } else {
      const now = new Date();
      const formatted =
        now.toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' }) +
        ' ' +
        now.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' }) +
        ' hrs';
      setLastUpdated(formatted);
    }
  };

  useEffect(() => {
    fetchData();
  }, [selectedDays, selectedPlatform, customDates]);

  const fetchData = async (retryCount = 0) => {
    try {
      let queryUrl = `/api/v1/analytics/filtered?platform=${selectedPlatform}`;
      if (customDates?.start && customDates?.end) {
        queryUrl += `&start_date=${customDates.start}&end_date=${customDates.end}`;
      } else {
        queryUrl += `&days=${selectedDays}`;
      }

      const [resFiltered, resHeatmap, resAI] = await Promise.all([
        fetch(queryUrl).then((r) => r.json()),
        fetch('/api/v1/analytics/posting-heatmap').then((r) => r.json()),
        fetch('/api/v1/ai/generate-summary', { method: 'POST' }).then((r) => r.json()),
      ]);

      setData(resFiltered);
      setHeatmap(resHeatmap);
      if (resAI && resAI.ai_report) setAiReport(resAI.ai_report);
      updateTimestamp(resFiltered?.last_updated_at);
    } catch (err) {
      console.log(`Backend not available (attempt ${retryCount + 1}/5) - retrying in 3s...`);
      // Auto-retry up to 5 times with 3-second delay
      if (retryCount < 4) {
        setTimeout(() => fetchData(retryCount + 1), 3000);
      } else {
        console.log('Backend unavailable after 5 attempts - showing empty state');
        setData({
          kpis: {
            total_followers: 0, total_reach: 0, total_impressions: 0,
            avg_engagement: 0, total_views: 0, total_watch_time: 0, total_shares: 0,
          },
          platforms: [
            { platform: 'facebook', followers: 0, total_reach: 0, total_impressions: 0, avg_engagement: 0 },
            { platform: 'instagram', followers: 0, total_reach: 0, total_impressions: 0, avg_engagement: 0 },
            { platform: 'youtube', followers: 0, total_reach: 0, total_impressions: 0, avg_engagement: 0 },
            { platform: 'tiktok', followers: 0, total_reach: 0, total_impressions: 0, avg_engagement: 0 },
          ],
          posts: [],
          wow_comparison: {},
        });
        updateTimestamp();
      }
    }
  };

  const handleSelectDaysPreset = (daysValue) => {
    setCustomDates(null);
    setSelectedDays(daysValue);
  };

  const handleSelectCustomDates = (start, end) => {
    setCustomDates({ start, end });
  };

  const handleTriggerAI = async () => {
    setIsSyncing(true);
    try {
      const res = await fetch('/api/v1/ai/generate-summary', { method: 'POST' }).then((r) => r.json());
      if (res && res.ai_report) setAiReport(res.ai_report);

      const queryUrl = customDates?.start && customDates?.end
        ? `/api/v1/analytics/filtered?platform=${selectedPlatform}&start_date=${customDates.start}&end_date=${customDates.end}`
        : `/api/v1/analytics/filtered?platform=${selectedPlatform}&days=${selectedDays}`;

      const resFiltered = await fetch(queryUrl).then((r) => r.json());
      updateTimestamp(resFiltered?.last_updated_at);
    } catch (e) {
      console.error(e);
      updateTimestamp();
    } finally {
      setIsSyncing(false);
    }
  };

  const kpis = data?.kpis || {};
  const wow = data?.wow_comparison || {};

  return (
    <div className="min-h-screen bg-[#0B0F17] text-slate-100 font-sans pb-16">
      <Header
        onTriggerAI={handleTriggerAI}
        onOpenExport={() => setIsExportOpen(true)}
        isSyncing={isSyncing}
        lastUpdated={lastUpdated}
      />

      <main className="max-w-7xl mx-auto px-6 pt-8 space-y-8">
        {/* Filter Control Bar with Presets & Custom Date Range */}
        <section className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4 glass-panel p-4 rounded-2xl">
          <PlatformTabs selectedPlatform={selectedPlatform} onSelectPlatform={setSelectedPlatform} />
          <DateRangeFilter
            selectedDays={selectedDays}
            onSelectDays={handleSelectDaysPreset}
            customDates={customDates}
            onSelectCustomDates={handleSelectCustomDates}
          />
        </section>

        {/* Extended 6-KPI Row displaying full API metrics */}
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
          <KPICard
            title="Comunidad Total"
            value={(kpis.total_followers || 0).toLocaleString()}
            changePct={wow.followers_gained?.change_pct}
            trend={wow.followers_gained?.trend}
            icon={Users}
            color="indigo"
          />
          <KPICard
            title="Alcance Global"
            value={(kpis.total_reach || 0).toLocaleString()}
            changePct={wow.reach?.change_pct}
            trend={wow.reach?.trend}
            icon={Eye}
            color="blue"
          />
          <KPICard
            title="Reproducciones (Views)"
            value={(kpis.total_views || 0).toLocaleString()}
            changePct={wow.views?.change_pct}
            trend={wow.views?.trend}
            icon={Video}
            color="cyan"
          />
          <KPICard
            title="Watch Time (Horas)"
            value={`${(kpis.total_watch_time || 0).toLocaleString()} h`}
            changePct={wow.watch_time?.change_pct}
            trend={wow.watch_time?.trend}
            icon={Clock}
            color="purple"
          />
          <KPICard
            title="Tasa Engagement Prom."
            value={`${kpis.avg_engagement || 0}%`}
            changePct={wow.engagement?.change_pct}
            trend={wow.engagement?.trend}
            icon={Zap}
            color="emerald"
          />
          <KPICard
            title="Acciones Virales (Shares)"
            value={(kpis.total_shares || 0).toLocaleString()}
            changePct={wow.shares?.change_pct}
            trend={wow.shares?.trend}
            icon={Share2}
            color="pink"
          />
        </section>

        {/* AI Executive Intelligence Report Card */}
        <section>
          <AIExecutiveSummaryCard aiReport={aiReport} />
        </section>

        {/* 2x2 Comprehensive Charts Grid */}
        <section className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-extrabold text-white tracking-tight">Análisis Estratégico & Visualizaciones Avanzadas</h2>
            <span className="text-xs text-slate-400 font-semibold">4 Paneles de Mapeo Editorial</span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <PlatformBreakdown platforms={data?.platforms || []} />
            <PostingHeatmap heatmapData={heatmap} />
            <FormatEfficiencyChart formatData={data?.format_efficiency} />
            <SentimentAnalysisChart sentimentData={aiReport?.sentiment_analysis} />
          </div>

          <div className="grid grid-cols-1 gap-8">
            <PlatformReachShareChart platforms={data?.platforms || []} />
          </div>
        </section>

        {/* Detailed API Metrics Matrix Across All Networks */}
        <section>
          <PlatformDeepMetricsMatrix platforms={data?.platforms || []} />
        </section>

        {/* Top Posts Table - ONLY real data from APIs, no mock fallback */}
        <section>
          <TopPostsTable posts={data?.posts || []} />
        </section>
      </main>

      <ReportExportModal isOpen={isExportOpen} onClose={() => setIsExportOpen(false)} />
    </div>
  );
}
