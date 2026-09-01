import React, { useState, useEffect } from 'react';
import { Radio, Download, RefreshCw, Layers, Clock, ShieldCheck, Key, FileSpreadsheet, Database } from 'lucide-react';

export default function Header({ onTriggerAI, onOpenExport, onOpenConnector, onOpenMetaImport, isSyncing, lastUpdated, databaseCount = 0 }) {
  const [connectors, setConnectors] = useState([
    { platform: 'facebook', name: 'FB', connected: true },
    { platform: 'instagram', name: 'IG', connected: true },
    { platform: 'youtube', name: 'YT', connected: false },
    { platform: 'tiktok', name: 'TT', connected: false },
  ]);

  useEffect(() => {
    fetch('/api/v1/connectors/status')
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setConnectors(data.filter((c) => c.platform.toLowerCase() !== 'x'));
        }
      })
      .catch(() => console.log('Using default connector statuses'));
  }, [isSyncing, lastUpdated]);

  return (
    <header className="sticky top-0 z-40 bg-[#0B0F17]/85 backdrop-blur-md border-b border-slate-800/80 px-6 py-4">
      <div className="max-w-7xl mx-auto flex flex-col lg:flex-row items-center justify-between gap-4">
        {/* Brand */}
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-gradient-to-tr from-indigo-600 via-blue-600 to-cyan-500 shadow-lg shadow-indigo-500/20">
            <Radio className="w-6 h-6 text-white animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-extrabold bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent font-sans tracking-tight">
                Afri-k
              </h1>
              <span className="px-2 py-0.5 text-[10px] font-semibold bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 rounded-full">
                v1.0 Pro
              </span>
            </div>
            <p className="text-xs text-slate-400">Plataforma de Inteligencia & Analítica Editorial de Once Noticias</p>
          </div>
        </div>

        {/* Connector Status Indicators with Clickable Connector Opener */}
        <div
          onClick={() => onOpenConnector && onOpenConnector('facebook')}
          className="flex items-center gap-2 bg-slate-900/80 hover:bg-slate-900 p-2.5 rounded-xl border border-slate-800 hover:border-slate-700 cursor-pointer transition-all group"
          title="Administrar y conectar APIs de redes sociales"
        >
          <Layers className="w-4 h-4 text-slate-400 ml-1 group-hover:text-indigo-400 transition-colors" />
          <span className="text-xs font-medium text-slate-400 mr-1">Canales:</span>
          {connectors.map((c) => (
            <div key={c.platform} className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-slate-800/80 text-xs font-semibold text-slate-300">
              <span className={`w-2 h-2 rounded-full ${c.connected ? 'bg-emerald-400 shadow-sm shadow-emerald-400' : 'bg-rose-500'}`} />
              <span className="uppercase">{c.platform}</span>
            </div>
          ))}
          <span className="text-[10px] text-indigo-400 font-semibold px-1.5 py-0.5 rounded bg-indigo-950/80 border border-indigo-500/30 ml-1">
            + Conectar
          </span>
        </div>

        {/* Action Buttons & Last Updated Timestamp */}
        <div className="flex items-center gap-3">
          {/* Meta Reports Database Status Pill */}
          <div
            onClick={onOpenMetaImport}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900/80 hover:bg-slate-900 border border-slate-800 hover:border-emerald-500/40 text-xs cursor-pointer transition-all"
            title="Haz clic para importar o ver el estado del repositorio de Meta Suite"
          >
            <Database className="w-3.5 h-3.5 text-emerald-400" />
            <span className="text-slate-400">Base Meta:</span>
            <span className="text-emerald-400 font-bold">{databaseCount > 0 ? `${databaseCount} posts` : 'Híbrida'}</span>
          </div>

          {/* Last Updated Timestamp Badge */}
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900/80 border border-slate-800 text-xs text-slate-400">
            <Clock className="w-3.5 h-3.5 text-indigo-400" />
            <span>Última actualización:</span>
            <span className="text-slate-200 font-semibold">{lastUpdated || 'En vivo'}</span>
          </div>

          <button
            onClick={onOpenMetaImport}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs transition-all shadow-md shadow-emerald-500/20 hover:shadow-emerald-500/40"
            title="Importar reporte oficial CSV / Excel de Meta Business Suite"
          >
            <FileSpreadsheet className="w-3.5 h-3.5" />
            <span>Importar Meta Suite</span>
          </button>

          <button
            onClick={onTriggerAI}
            disabled={isSyncing}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 text-white font-semibold text-xs transition-all shadow-md shadow-indigo-500/20 hover:shadow-indigo-500/40 disabled:opacity-50"
            title="Recalcula el informe de métricas en tiempo real"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
            <span>Actualizar</span>
          </button>

          <button
            onClick={onOpenExport}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-semibold text-xs transition-all"
          >
            <Download className="w-3.5 h-3.5 text-cyan-400" />
            <span>Exportar</span>
          </button>
        </div>
      </div>
    </header>
  );
}
