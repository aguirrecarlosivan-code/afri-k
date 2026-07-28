import React, { useState } from 'react';
import { X, FileText, Presentation, FileSpreadsheet, FileJson, Download, CheckCircle2 } from 'lucide-react';

export default function ReportExportModal({ isOpen, onClose }) {
  const [downloading, setDownloading] = useState(null);
  const [success, setSuccess] = useState(null);

  if (!isOpen) return null;

  const handleExport = (type) => {
    setDownloading(type);

    const downloadUrl = `/api/v1/reports/download/${type}`;
    const link = document.createElement('a');
    link.href = downloadUrl;
    link.download = `Afrik_Reporte_${type.toUpperCase()}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    setTimeout(() => {
      setDownloading(null);
      setSuccess(type);
      setTimeout(() => setSuccess(null), 3000);
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div className="glass-panel w-full max-w-lg p-6 rounded-2xl border border-slate-700 shadow-2xl relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <h3 className="text-xl font-extrabold text-white mb-1">Exportar Reportes de Once Noticias</h3>
        <p className="text-xs text-slate-400 mb-6">Selecciona el formato de exportación ejecutiva para el período activo.</p>

        <div className="grid grid-cols-2 gap-4 mb-6">
          {/* Excel Multi-Tab Option */}
          <div
            onClick={() => handleExport('excel')}
            className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 hover:border-emerald-500/50 cursor-pointer transition-all hover:bg-slate-800/60 group col-span-2 sm:col-span-1"
          >
            <div className="flex items-center justify-between mb-2">
              <div className="p-2.5 rounded-lg bg-emerald-500/10 text-emerald-400">
                <FileSpreadsheet className="w-6 h-6" />
              </div>
              {downloading === 'excel' ? (
                <span className="text-xs text-emerald-400 animate-pulse">Generando...</span>
              ) : success === 'excel' ? (
                <CheckCircle2 className="w-5 h-5 text-emerald-400" />
              ) : (
                <Download className="w-4 h-4 text-slate-500 group-hover:text-white" />
              )}
            </div>
            <h4 className="text-sm font-bold text-white">Excel Multi-Pestaña (.xlsx)</h4>
            <p className="text-[11px] text-slate-400">1 pestaña por red + Evaluación General final.</p>
          </div>

          {/* PDF Option */}
          <div
            onClick={() => handleExport('pdf')}
            className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 hover:border-red-500/50 cursor-pointer transition-all hover:bg-slate-800/60 group col-span-2 sm:col-span-1"
          >
            <div className="flex items-center justify-between mb-2">
              <div className="p-2.5 rounded-lg bg-red-500/10 text-red-400">
                <FileText className="w-6 h-6" />
              </div>
              {downloading === 'pdf' ? (
                <span className="text-xs text-red-400 animate-pulse">Generando...</span>
              ) : success === 'pdf' ? (
                <CheckCircle2 className="w-5 h-5 text-emerald-400" />
              ) : (
                <Download className="w-4 h-4 text-slate-500 group-hover:text-white" />
              )}
            </div>
            <h4 className="text-sm font-bold text-white">Informe PDF</h4>
            <p className="text-[11px] text-slate-400">Documento listo para impresión ejecutiva.</p>
          </div>

          {/* PPTX Option */}
          <div
            onClick={() => handleExport('pptx')}
            className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 hover:border-orange-500/50 cursor-pointer transition-all hover:bg-slate-800/60 group col-span-2 sm:col-span-1"
          >
            <div className="flex items-center justify-between mb-2">
              <div className="p-2.5 rounded-lg bg-orange-500/10 text-orange-400">
                <Presentation className="w-6 h-6" />
              </div>
              {downloading === 'pptx' ? (
                <span className="text-xs text-orange-400 animate-pulse">Generando...</span>
              ) : success === 'pptx' ? (
                <CheckCircle2 className="w-5 h-5 text-emerald-400" />
              ) : (
                <Download className="w-4 h-4 text-slate-500 group-hover:text-white" />
              )}
            </div>
            <h4 className="text-sm font-bold text-white">Presentación PPTX</h4>
            <p className="text-[11px] text-slate-400">Diapositivas 16:9 editables.</p>
          </div>

          {/* JSON Option */}
          <div
            onClick={() => handleExport('json')}
            className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 hover:border-cyan-500/50 cursor-pointer transition-all hover:bg-slate-800/60 group col-span-2 sm:col-span-1"
          >
            <div className="flex items-center justify-between mb-2">
              <div className="p-2.5 rounded-lg bg-cyan-500/10 text-cyan-400">
                <FileJson className="w-6 h-6" />
              </div>
              {downloading === 'json' ? (
                <span className="text-xs text-cyan-400 animate-pulse">Generando...</span>
              ) : success === 'json' ? (
                <CheckCircle2 className="w-5 h-5 text-emerald-400" />
              ) : (
                <Download className="w-4 h-4 text-slate-500 group-hover:text-white" />
              )}
            </div>
            <h4 className="text-sm font-bold text-white">Datos JSON</h4>
            <p className="text-[11px] text-slate-400">Payload estructurado completo.</p>
          </div>
        </div>

        <button
          onClick={onClose}
          className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-sm transition-colors"
        >
          Cerrar
        </button>
      </div>
    </div>
  );
}
