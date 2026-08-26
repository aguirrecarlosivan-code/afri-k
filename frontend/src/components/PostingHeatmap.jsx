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
  let maxVal = 15;

  if (heatmapData && heatmapData.heatmap) {
    daysEn.forEach((dayKey, dayIdx) => {
      const row = heatmapData.heatmap[dayKey] || heatmapData.heatmap[daysEsShort[dayIdx]] || [];
      row.forEach((val, hourIdx) => {
        const numVal = typeof val === 'number' ? val : parseFloat(val) || 0;
        if (numVal > maxVal) maxVal = Math.ceil(numVal);
        data.push([hourIdx, dayIdx, numVal]);
      });
    });
  }

  const option = {
    backgroundColor: 'transparent',
    tooltip: {
      position: 'top',
      backgroundColor: '#0F172A',
      borderColor: '#334155',
      borderWidth: 1,
      padding: [8, 12],
      textStyle: { color: '#F8FAFC', fontSize: 12 },
      formatter: (params) => {
        const dayLabel = daysEsShort[params.value[1]] || daysEn[params.value[1]];
        const hourLabel = hours[params.value[0]];
        const score = params.value[2];
        return `
          <div style="font-weight:700; color:#38BDF8; margin-bottom:2px;">${dayLabel} ${hourLabel} hrs</div>
          <div style="color:#CBD5E1;">Índice de Engagement: <b style="color:#F43F5E;">${score}%</b></div>
        `;
      },
    },
    grid: {
      left: '4%',
      right: '3%',
      bottom: '14%',
      top: '6%',
      containLabel: true,
    },
    xAxis: {
      type: 'category',
      data: hours,
      splitArea: { show: true, areaStyle: { color: ['rgba(255,255,255,0.015)', 'rgba(0,0,0,0.15)'] } },
      axisLabel: { color: '#94A3B8', fontSize: 10, interval: 1 },
      axisLine: { lineStyle: { color: '#334155' } },
    },
    yAxis: {
      type: 'category',
      data: daysEsShort,
      splitArea: { show: true },
      axisLabel: { color: '#CBD5E1', fontWeight: 600, fontSize: 11 },
      axisLine: { lineStyle: { color: '#334155' } },
    },
    visualMap: {
      min: 0,
      max: maxVal > 0 ? maxVal : 20,
      calculable: true,
      orient: 'horizontal',
      left: 'center',
      bottom: '0%',
      textStyle: { color: '#94A3B8', fontSize: 10 },
      inRange: {
        color: ['#0B132B', '#1C2541', '#1E40AF', '#3B82F6', '#8B5CF6', '#EC4899', '#F43F5E'],
      },
    },
    series: [
      {
        name: 'Engagement',
        type: 'heatmap',
        data: data,
        label: { show: false },
        itemStyle: {
          borderRadius: 2,
          borderColor: 'rgba(15, 23, 42, 0.4)',
          borderWidth: 1,
        },
        emphasis: {
          itemStyle: {
            borderColor: '#38BDF8',
            borderWidth: 2,
            shadowBlur: 10,
            shadowColor: 'rgba(56, 189, 248, 0.5)',
          },
        },
      },
    ],
  };

  const rawBest = heatmapData?.best_posting_slot || { day: 'Miércoles', hour: 15, avg_engagement: 73.9 };
  const bestDaySpanish = dayNameMap[rawBest.day] || rawBest.day;

  return (
    <div className="glass-panel p-6 rounded-2xl">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-4 gap-2">
        <div>
          <h3 className="text-lg font-extrabold text-white">Mapa de Calor: Mejores Horarios de Publicación</h3>
          <p className="text-xs text-slate-400">Intensidad de engagement según día y franja horaria de emisión</p>
        </div>

        <div className="px-3 py-1.5 rounded-xl bg-indigo-500/15 border border-indigo-500/30 text-indigo-300 text-xs font-semibold flex items-center gap-1.5 shadow-sm">
          <span>✨ Horario Óptimo:</span>
          <span className="text-white font-bold">{bestDaySpanish} {rawBest.hour}:00 hrs</span>
          <span className="text-pink-400 font-extrabold">({rawBest.avg_engagement}% eng)</span>
        </div>
      </div>

      <ReactECharts option={option} style={{ height: '280px', width: '100%' }} />
    </div>
  );
}
