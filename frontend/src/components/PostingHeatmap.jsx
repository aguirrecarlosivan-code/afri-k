import React from 'react';
import ReactECharts from 'echarts-for-react';

export default function PostingHeatmap({ heatmapData }) {
  const daysEn = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const daysEsShort = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];

  const dayNameMap = {
    Mon: 'Lunes',
    Tue: 'Martes',
    Wed: 'Miércoles',
    Thu: 'Jueves',
    Fri: 'Viernes',
    Sat: 'Sábado',
    Sun: 'Domingo',
    Lun: 'Lunes',
    Mar: 'Martes',
    Mié: 'Miércoles',
    Jue: 'Jueves',
    Vie: 'Viernes',
    Sáb: 'Sábado',
    Dom: 'Domingo',
  };

  const hours = Array.from({ length: 24 }, (_, i) => `${i}:00`);

  // Transform backend heatmap structure to ECharts format [hour, dayIndex, val]
  const data = [];
  if (heatmapData && heatmapData.heatmap) {
    daysEn.forEach((dayKey, dayIdx) => {
      const row = heatmapData.heatmap[dayKey] || heatmapData.heatmap[daysEsShort[dayIdx]] || [];
      row.forEach((val, hourIdx) => {
        data.push([hourIdx, dayIdx, val]);
      });
    });
  }

  const option = {
    backgroundColor: 'transparent',
    tooltip: {
      position: 'top',
      backgroundColor: '#1E293B',
      borderColor: '#334155',
      textStyle: { color: '#F8FAFC' },
      formatter: (params) => {
        const dayLabel = daysEsShort[params.value[1]] || daysEn[params.value[1]];
        return `<b>${dayLabel} ${hours[params.value[0]]}</b><br/>Engagement Promedio: ${params.value[2]}%`;
      },
    },
    grid: {
      left: '3%',
      right: '3%',
      bottom: '10%',
      top: '5%',
      containLabel: true,
    },
    xAxis: {
      type: 'category',
      data: hours,
      splitArea: { show: true, areaStyle: { color: ['rgba(255,255,255,0.01)', 'rgba(0,0,0,0.1)'] } },
      axisLabel: { color: '#94A3B8', fontSize: 10 },
      axisLine: { lineStyle: { color: '#334155' } },
    },
    yAxis: {
      type: 'category',
      data: daysEsShort,
      splitArea: { show: true },
      axisLabel: { color: '#94A3B8', fontWeight: 600 },
      axisLine: { lineStyle: { color: '#334155' } },
    },
    visualMap: {
      min: 0,
      max: 15,
      calculable: true,
      orient: 'horizontal',
      left: 'center',
      bottom: '0%',
      textStyle: { color: '#94A3B8' },
      inRange: {
        color: ['#1E293B', '#3B82F6', '#8B5CF6', '#EC4899'],
      },
    },
    series: [
      {
        name: 'Engagement',
        type: 'heatmap',
        data: data,
        label: { show: false },
        emphasis: {
          itemStyle: {
            shadowBlur: 10,
            shadowColor: 'rgba(0, 0, 0, 0.5)',
          },
        },
      },
    ],
  };

  const rawBest = heatmapData?.best_posting_slot || { day: 'Wed', hour: 18, avg_engagement: 14.8 };
  const bestDaySpanish = dayNameMap[rawBest.day] || rawBest.day;

  return (
    <div className="glass-panel p-6 rounded-2xl">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-4 gap-2">
        <div>
          <h3 className="text-lg font-bold text-white">Mapa de Calor: Mejores Horarios de Publicación</h3>
          <p className="text-xs text-slate-400">Intensidad de engagement según día y hora de emisión</p>
        </div>

        <div className="px-3 py-1.5 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-xs font-semibold">
          ✨ Horario Óptimo Recomendado: <span className="text-white font-bold">{bestDaySpanish} {rawBest.hour}:00 hrs</span> ({rawBest.avg_engagement}% eng)
        </div>
      </div>

      <ReactECharts option={option} style={{ height: '280px', width: '100%' }} />
    </div>
  );
}
