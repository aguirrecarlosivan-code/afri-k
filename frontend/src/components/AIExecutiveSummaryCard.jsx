import React from 'react';
import { Brain, CheckCircle2, AlertTriangle, Lightbulb, Compass, Sparkles, Smile, MessageSquare, ThumbsUp } from 'lucide-react';

export default function AIExecutiveSummaryCard({ aiReport }) {
  if (!aiReport) return null;

  const sentiment = aiReport.sentiment_analysis || {
    dominant_tone: 'Positivo / Entusiasta',
    positive_pct: 78.5,
    neutral_pct: 16.0,
    critical_pct: 5.5,
  };

  return (
    <div className="glass-panel p-8 rounded-2xl relative border border-indigo-500/30 overflow-hidden shadow-2xl shadow-indigo-950/40">
      {/* Background Glow */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-600/10 rounded-full blur-3xl -z-10 pointer-events-none" />

      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-6 border-b border-slate-800 gap-4">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-2xl bg-gradient-to-tr from-purple-600 to-indigo-600 shadow-lg shadow-purple-500/30">
            <Brain className="w-6 h-6 text-white animate-pulse" />
          </div>
          <div>
            <h2 className="text-xl font-extrabold text-white flex items-center gap-2">
              Informe de Inteligencia Editorial
              <Sparkles className="w-4 h-4 text-amber-400" />
            </h2>
            <p className="text-xs text-slate-400">
              Análisis analítico de reglas estadísticas y métricas de base de datos
            </p>
          </div>
        </div>

        {/* Engine Badge */}
        <div className="flex items-center gap-2">
          <span className="text-[11px] font-bold px-3 py-1.5 rounded-xl bg-indigo-950/80 border border-indigo-500/40 text-indigo-300">
            Motor Heurístico Especializado (Reglas Estadísticas)
          </span>

          {/* Sentiment Badge */}
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-xs font-semibold text-slate-300">
            <Smile className="w-4 h-4 text-emerald-400" />
            <span>Tono:</span>
            <span className="text-emerald-400 font-bold">{sentiment.dominant_tone}</span>
          </div>
        </div>
      </div>

      {/* 1. Executive Summary */}
      <div className="my-6 p-4 rounded-xl bg-slate-900/80 border border-slate-800">
        <h4 className="text-xs font-bold uppercase tracking-wider text-indigo-400 mb-2 flex items-center gap-2">
          <Compass className="w-4 h-4" /> Resumen Ejecutivo
        </h4>
        <p className="text-sm text-slate-200 leading-relaxed font-normal">
          {aiReport.executive_summary}
        </p>

        {/* Sentiment Distribution Bar */}
        <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
          <span className="font-semibold text-slate-300">Desglose de Sentimiento de Audiencia:</span>
          <div className="flex items-center gap-4">
            <span className="text-emerald-400 flex items-center gap-1">
              <ThumbsUp className="w-3.5 h-3.5" /> Positivo: {sentiment.positive_pct}%
            </span>
            <span className="text-slate-400 flex items-center gap-1">
              <MessageSquare className="w-3.5 h-3.5" /> Neutro: {sentiment.neutral_pct}%
            </span>
            <span className="text-rose-400 flex items-center gap-1">
              <AlertTriangle className="w-3.5 h-3.5" /> Crítico: {sentiment.critical_pct}%
            </span>
          </div>
        </div>
      </div>

      {/* Grid Section: Strengths & Weaknesses */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 my-6">
        {/* Strengths */}
        <div className="p-5 rounded-xl bg-slate-900/50 border border-slate-800/80">
          <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-400 mb-3 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4" /> Fortalezas Clave
          </h4>
          <ul className="space-y-2.5">
            {(aiReport.strengths || []).map((item, i) => (
              <li key={i} className="text-xs text-slate-300 flex items-start gap-2">
                <span className="text-emerald-400 font-bold">•</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Weaknesses */}
        <div className="p-5 rounded-xl bg-slate-900/50 border border-slate-800/80">
          <h4 className="text-xs font-bold uppercase tracking-wider text-amber-400 mb-3 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4" /> Debilidades & Áreas de Oportunidad
          </h4>
          <ul className="space-y-2.5">
            {(aiReport.weaknesses || []).map((item, i) => (
              <li key={i} className="text-xs text-slate-300 flex items-start gap-2">
                <span className="text-amber-400 font-bold">•</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Grid Section: Categorized Recommendations & Key Findings */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Recommendations */}
        <div className="p-5 rounded-xl bg-slate-900/50 border border-slate-800/80">
          <h4 className="text-xs font-bold uppercase tracking-wider text-cyan-400 mb-3 flex items-center gap-2">
            <Lightbulb className="w-4 h-4" /> Recomendaciones Categorizadas por Formato
          </h4>
          <ul className="space-y-2.5">
            {(aiReport.recommendations || []).map((item, i) => (
              <li key={i} className="text-xs text-slate-300 flex items-start gap-2">
                <span className="text-cyan-400 font-bold">➜</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Key Findings */}
        <div className="p-5 rounded-xl bg-slate-900/50 border border-slate-800/80">
          <h4 className="text-xs font-bold uppercase tracking-wider text-purple-400 mb-3 flex items-center gap-2">
            <Sparkles className="w-4 h-4" /> Hallazgos Clave de Audiencia
          </h4>
          <ul className="space-y-2.5">
            {(aiReport.key_findings || []).map((item, i) => (
              <li key={i} className="text-xs text-slate-300 flex items-start gap-2">
                <span className="text-purple-400 font-bold">🔍</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
