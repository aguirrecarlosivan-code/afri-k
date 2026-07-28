import React from 'react';
import ReactECharts from 'echarts-for-react';
import { Smile } from 'lucide-react';

export default function SentimentAnalysisChart({ sentimentData }) {
  const sentiment = sentimentData || {
    positive_pct: 78.5,
    neutral_pct: 16.0,
    critical_pct: 5.5,
  };

  const option = {
    backgroundColor: 'transparent',
    tooltip: {
      trigger: 'item',
      backgroundColor: '#1E293B',
      borderColor: '#334155',
      textStyle: { color: '#F8FAFC' },
      formatter: '{b}: <b>{c}%</b> ({d}%)',
    },
    legend: {
      orient: 'vertical',
      right: '5%',
      top: 'center',
      textStyle: { color: '#94A3B8', fontSize: 12 },
    },
    series: [
      {
        name: 'Sentimiento de Audiencia',
        type: 'pie',
        radius: ['45%', '75%'],
        center: ['40%', '50%'],
        avoidLabelOverlap: false,
        itemStyle: {
          borderRadius: 8,
          borderColor: '#0F172A',
          borderWidth: 3,
        },
        label: {
          show: false,
          position: 'center',
        },
        emphasis: {
          label: {
            show: true,
            fontSize: 16,
            fontWeight: 'bold',
            color: '#F8FAFC',
            formatter: '{b}\n{c}%',
          },
        },
        labelLine: {
          show: false,
        },
        data: [
          {
            value: sentiment.positive_pct,
            name: 'Positivo / Entusiasta',
            itemStyle: { color: '#10B981' },
          },
          {
            value: sentiment.neutral_pct,
            name: 'Informativo / Neutro',
            itemStyle: { color: '#64748B' },
          },
          {
            value: sentiment.critical_pct,
            name: 'Debate / Crítico',
            itemStyle: { color: '#F43F5E' },
          },
        ],
      },
    ],
  };

  return (
    <div className="glass-panel p-6 rounded-2xl">
      <div className="flex items-center gap-3 mb-4">
        <div className="p-2.5 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-600 shadow-md">
          <Smile className="w-5 h-5 text-white" />
        </div>
        <div>
          <h3 className="text-lg font-bold text-white">Distribución de Sentimiento de Audiencia</h3>
          <p className="text-xs text-slate-400">Análisis cualitativo del tono de comentarios y reacciones</p>
        </div>
      </div>

      <ReactECharts option={option} style={{ height: '280px', width: '100%' }} />
    </div>
  );
}
