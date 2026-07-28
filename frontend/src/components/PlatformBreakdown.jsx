import React from 'react';
import ReactECharts from 'echarts-for-react';

export default function PlatformBreakdown({ platforms = [] }) {
  const platformNames = platforms.map(p => p.platform.toUpperCase());
  const reachData = platforms.map(p => p.total_reach);
  const engagementData = platforms.map(p => p.avg_engagement);

  const option = {
    backgroundColor: 'transparent',
    tooltip: {
      trigger: 'axis',
      backgroundColor: '#1E293B',
      borderColor: '#334155',
      textStyle: { color: '#F8FAFC' },
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      top: '12%',
      containLabel: true,
    },
    xAxis: {
      type: 'category',
      data: platformNames,
      axisLine: { lineStyle: { color: '#334155' } },
      axisLabel: { color: '#94A3B8', fontWeight: 600 },
    },
    yAxis: [
      {
        type: 'value',
        name: 'Alcance Total',
        nameTextStyle: { color: '#94A3B8' },
        axisLine: { show: false },
        splitLine: { lineStyle: { color: '#1E293B' } },
        axisLabel: { color: '#94A3B8' },
      },
      {
        type: 'value',
        name: 'Engagement %',
        nameTextStyle: { color: '#94A3B8' },
        axisLine: { show: false },
        splitLine: { show: false },
        axisLabel: { color: '#94A3B8', formatter: '{value}%' },
      },
    ],
    series: [
      {
        name: 'Alcance Total',
        type: 'bar',
        barWidth: '40%',
        data: reachData,
        itemStyle: {
          borderRadius: [6, 6, 0, 0],
          color: {
            type: 'linear',
            x: 0, y: 0, x2: 0, y2: 1,
            colorStops: [
              { offset: 0, color: '#6366F1' },
              { offset: 1, color: '#3B82F6' },
            ],
          },
        },
      },
      {
        name: 'Engagement Promedio',
        type: 'line',
        yAxisIndex: 1,
        smooth: true,
        data: engagementData,
        lineStyle: { width: 3, color: '#F59E0B' },
        itemStyle: { color: '#F59E0B' },
      },
    ],
  };

  return (
    <div className="glass-panel p-6 rounded-2xl">
      <h3 className="text-lg font-bold text-white mb-2">Desempeño Comparativo por Plataforma</h3>
      <p className="text-xs text-slate-400 mb-4">Alcance total (Barras) vs Tasa de Engagement % (Línea)</p>
      <ReactECharts option={option} style={{ height: '320px', width: '100%' }} />
    </div>
  );
}
