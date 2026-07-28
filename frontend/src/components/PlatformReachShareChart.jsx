import React from 'react';
import ReactECharts from 'echarts-for-react';
import { PieChart } from 'lucide-react';

export default function PlatformReachShareChart({ platforms }) {
  const defaultPlatforms = [
    { platform: 'tiktok', total_reach: 340000 },
    { platform: 'youtube', total_reach: 210000 },
    { platform: 'instagram', total_reach: 158000 },
    { platform: 'facebook', total_reach: 68000 },
  ];

  const list = (platforms && platforms.length > 0) ? platforms : defaultPlatforms;

  const colorMap = {
    tiktok: '#00F2FE',
    youtube: '#FF0000',
    instagram: '#E1306C',
    facebook: '#1877F2',
  };

  const chartData = list.map((p) => ({
    value: p.total_reach,
    name: p.platform.charAt(0).toUpperCase() + p.platform.slice(1),
    itemStyle: { color: colorMap[p.platform.toLowerCase()] || '#8B5CF6' },
  }));

  const option = {
    backgroundColor: 'transparent',
    tooltip: {
      trigger: 'item',
      backgroundColor: '#1E293B',
      borderColor: '#334155',
      textStyle: { color: '#F8FAFC' },
      formatter: (params) => {
        return `<b>${params.name}</b><br/>Alcance: ${params.value.toLocaleString()} (${params.percent}%)`;
      },
    },
    legend: {
      orient: 'vertical',
      right: '5%',
      top: 'center',
      textStyle: { color: '#94A3B8', fontSize: 12 },
    },
    series: [
      {
        name: 'Alcance por Canal',
        type: 'pie',
        radius: '70%',
        center: ['40%', '50%'],
        data: chartData,
        roseType: 'radius',
        itemStyle: {
          borderRadius: 6,
          borderColor: '#0F172A',
          borderWidth: 2,
        },
        label: {
          show: false,
        },
        emphasis: {
          itemStyle: {
            shadowBlur: 15,
            shadowColor: 'rgba(0, 0, 0, 0.5)',
          },
        },
      },
    ],
  };

  return (
    <div className="glass-panel p-6 rounded-2xl">
      <div className="flex items-center gap-3 mb-4">
        <div className="p-2.5 rounded-xl bg-gradient-to-tr from-cyan-600 to-blue-600 shadow-md">
          <PieChart className="w-5 h-5 text-white" />
        </div>
        <div>
          <h3 className="text-lg font-bold text-white">Cuota de Alcance por Plataforma (Share of Voice)</h3>
          <p className="text-xs text-slate-400">Distribución porcentual del impacto editorial total</p>
        </div>
      </div>

      <ReactECharts option={option} style={{ height: '280px', width: '100%' }} />
    </div>
  );
}
