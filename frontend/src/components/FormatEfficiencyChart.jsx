import React from 'react';
import ReactECharts from 'echarts-for-react';
import { Layers } from 'lucide-react';

export default function FormatEfficiencyChart({ formatData }) {
  const formats = [
    { name: 'Reels / Video Vertical', reach: 48500, engagement: 9.4, color: '#8B5CF6' },
    { name: 'Shorts (YouTube)', reach: 42000, engagement: 8.2, color: '#3B82F6' },
    { name: 'Video Horizontal', reach: 31000, engagement: 6.1, color: '#06B6D4' },
    { name: 'Posts / Carruseles', reach: 18400, engagement: 4.8, color: '#EC4899' },
  ];

  const categories = formats.map((f) => f.name);
  const reachData = formats.map((f) => f.reach);
  const engagementData = formats.map((f) => f.engagement);

  const option = {
    backgroundColor: 'transparent',
    tooltip: {
      trigger: 'axis',
      backgroundColor: '#1E293B',
      borderColor: '#334155',
      textStyle: { color: '#F8FAFC' },
      axisPointer: { type: 'shadow' },
    },
    legend: {
      data: ['Alcance Promedio por Post', 'Tasa de Engagement (%)'],
      textStyle: { color: '#94A3B8', fontSize: 11 },
      top: '0%',
      right: '0%',
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      top: '18%',
      containLabel: true,
    },
    xAxis: {
      type: 'category',
      data: categories,
      axisLabel: { color: '#94A3B8', fontSize: 11, interval: 0, rotate: 10 },
      axisLine: { lineStyle: { color: '#334155' } },
    },
    yAxis: [
      {
        type: 'value',
        name: 'Alcance Prom.',
        axisLabel: { color: '#94A3B8', fontSize: 10 },
        splitLine: { lineStyle: { color: 'rgba(255,255,255,0.05)' } },
      },
      {
        type: 'value',
        name: 'Engagement %',
        min: 0,
        max: 12,
        axisLabel: { color: '#94A3B8', fontSize: 10, formatter: '{value}%' },
        splitLine: { show: false },
      },
    ],
    series: [
      {
        name: 'Alcance Promedio por Post',
        type: 'bar',
        barWidth: '35%',
        data: reachData,
        itemStyle: {
          borderRadius: [6, 6, 0, 0],
          color: {
            type: 'linear',
            x: 0, y: 0, x2: 0, y2: 1,
            colorStops: [
              { offset: 0, color: '#6366F1' },
              { offset: 1, color: '#4F46E5' },
            ],
          },
        },
      },
      {
        name: 'Tasa de Engagement (%)',
        type: 'line',
        yAxisIndex: 1,
        smooth: true,
        data: engagementData,
        symbolSize: 8,
        itemStyle: { color: '#EC4899' },
        lineStyle: { width: 3, color: '#EC4899' },
      },
    ],
  };

  return (
    <div className="glass-panel p-6 rounded-2xl">
      <div className="flex items-center gap-3 mb-4">
        <div className="p-2.5 rounded-xl bg-gradient-to-tr from-indigo-600 to-purple-600 shadow-md">
          <Layers className="w-5 h-5 text-white" />
        </div>
        <div>
          <h3 className="text-lg font-bold text-white">Eficiencia por Formato de Contenido</h3>
          <p className="text-xs text-slate-400">Comparativa de alcance promedio e interacción por formato</p>
        </div>
      </div>

      <ReactECharts option={option} style={{ height: '280px', width: '100%' }} />
    </div>
  );
}
