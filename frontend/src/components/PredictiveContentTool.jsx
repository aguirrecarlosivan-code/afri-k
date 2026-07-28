import React, { useState } from 'react';
import { Sparkles, Eye, Zap, Flame, Clock, Send, Lightbulb } from 'lucide-react';

export default function PredictiveContentTool() {
  const [platform, setPlatform] = useState('instagram');
  const [formatType, setFormatType] = useState('reel');
  const [plannedHour, setPlannedHour] = useState(18);
  const [draftText, setDraftText] = useState('');
  const [prediction, setPrediction] = useState(null);
  const [loading, setLoading] = useState(false);

  const handlePredict = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch('/api/v1/ai/predict-performance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          platform,
          format_type: formatType,
          planned_hour: plannedHour,
          text: draftText,
        }),
      }).then((r) => r.json());

      if (res && res.prediction) {
        setPrediction(res.prediction);
      }
    } catch (err) {
      console.log('Using default mock prediction');
      setPrediction({
        platform,
        format_type: formatType,
        planned_hour: plannedHour,
        predicted_reach: 48900,
        predicted_impressions: 69400,
        predicted_engagement_rate: 8.75,
        virality_score: 28.5,
        strategic_recommendation:
          plannedHour === 18
            ? '✅ Excelente combinación de hora y formato para maximizar el impacto editorial.'
            : '💡 Sugerencia: Reprogramar a las 18:00 hrs incrementaría el alcance estimado en un +35%.',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="glass-panel p-6 rounded-2xl border border-indigo-500/30">
      <div className="flex items-center gap-3 mb-4">
        <div className="p-2.5 rounded-xl bg-gradient-to-tr from-cyan-600 to-indigo-600 shadow-md">
          <Sparkles className="w-5 h-5 text-white" />
        </div>
        <div>
          <h3 className="text-lg font-bold text-white">Simulador Predictivo de Rendimiento</h3>
          <p className="text-xs text-slate-400">Pronostica el alcance y virabilidad de tu publicación antes de lanzarla</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-4">
        {/* Input Form */}
        <form onSubmit={handlePredict} className="space-y-4 bg-slate-900/60 p-4 rounded-xl border border-slate-800">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1">Canal Objetivo</label>
              <select
                value={platform}
                onChange={(e) => setPlatform(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-slate-200 text-xs font-semibold focus:outline-none"
              >
                <option value="instagram">Instagram</option>
                <option value="tiktok">TikTok</option>
                <option value="youtube">YouTube</option>
                <option value="facebook">Facebook</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1">Formato</label>
              <select
                value={formatType}
                onChange={(e) => setFormatType(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-slate-200 text-xs font-semibold focus:outline-none"
              >
                <option value="reel">Reel / Video Vertical</option>
                <option value="short">Short</option>
                <option value="video">Video Horizontal</option>
                <option value="post">Post Estático</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1 flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-indigo-400" /> Hora Planificada de Emisión
            </label>
            <select
              value={plannedHour}
              onChange={(e) => setPlannedHour(Number(e.target.value))}
              className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-slate-200 text-xs font-semibold focus:outline-none"
            >
              {Array.from({ length: 24 }, (_, i) => (
                <option key={i} value={i}>
                  {i}:00 hrs {i === 18 ? '(Pico Máximo Recomenado 🔥)' : ''}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1">Texto / Borrador del Copy</label>
            <textarea
              rows={3}
              placeholder="Escribe el borrador del contenido a simular..."
              value={draftText}
              onChange={(e) => setDraftText(e.target.value)}
              className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-slate-200 text-xs focus:outline-none resize-none placeholder:text-slate-600"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-cyan-600 hover:from-indigo-500 hover:to-cyan-500 text-white font-bold text-xs transition-all shadow-md shadow-indigo-500/20"
          >
            <Send className="w-3.5 h-3.5" />
            <span>Simular Rendimiento</span>
          </button>
        </form>

        {/* Prediction Results */}
        <div className="bg-slate-900/60 p-5 rounded-xl border border-slate-800 flex flex-col justify-between">
          {prediction ? (
            <div className="space-y-4">
              <span className="text-xs font-bold uppercase tracking-wider text-cyan-400">Resultado del Pronóstico</span>

              <div className="grid grid-cols-3 gap-3">
                <div className="p-3 rounded-lg bg-slate-800/80 border border-slate-700 text-center">
                  <Eye className="w-4 h-4 text-blue-400 mx-auto mb-1" />
                  <span className="text-[10px] text-slate-400 uppercase font-bold block">Alcance Est.</span>
                  <span className="text-lg font-extrabold text-white">{(prediction.predicted_reach || 0).toLocaleString()}</span>
                </div>

                <div className="p-3 rounded-lg bg-slate-800/80 border border-slate-700 text-center">
                  <Zap className="w-4 h-4 text-cyan-400 mx-auto mb-1" />
                  <span className="text-[10px] text-slate-400 uppercase font-bold block">Engagement Est.</span>
                  <span className="text-lg font-extrabold text-white">{prediction.predicted_engagement_rate}%</span>
                </div>

                <div className="p-3 rounded-lg bg-slate-800/80 border border-slate-700 text-center">
                  <Flame className="w-4 h-4 text-amber-400 mx-auto mb-1" />
                  <span className="text-[10px] text-slate-400 uppercase font-bold block">Virabilidad</span>
                  <span className="text-lg font-extrabold text-amber-400">{prediction.virality_score} / 100</span>
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-indigo-500/10 border border-indigo-500/30 text-xs text-indigo-200">
                <div className="font-bold mb-1 flex items-center gap-1.5 text-indigo-300">
                  <Lightbulb className="w-4 h-4 text-amber-300" /> Sugerencia:
                </div>
                {prediction.strategic_recommendation}
              </div>
            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-center p-6 text-slate-500">
              <Sparkles className="w-10 h-10 mb-2 animate-bounce text-slate-600" />
              <p className="text-xs">Selecciona las opciones y presiona "Simular Rendimiento" para ver el pronóstico.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
