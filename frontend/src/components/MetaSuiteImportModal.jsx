import React, { useState, useRef } from 'react';
import { UploadCloud, FileSpreadsheet, CheckCircle2, AlertCircle, X, Sparkles, ArrowRight, RefreshCw } from 'lucide-react';

export default function MetaSuiteImportModal({ isOpen, onClose, onImportSuccess }) {
  const [dragActive, setDragActive] = useState(false);
  const [file, setFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadResult, setUploadResult] = useState(null);
  const [errorMsg, setErrorMsg] = useState('');
  const inputRef = useRef(null);

  if (!isOpen) return null;

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleSelectedFile(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      handleSelectedFile(e.target.files[0]);
    }
  };

  const handleSelectedFile = (selectedFile) => {
    setErrorMsg('');
    setUploadResult(null);
    const validExtensions = ['.csv', '.xlsx', '.xls'];
    const fileName = selectedFile.name.toLowerCase();
    const isValid = validExtensions.some((ext) => fileName.endsWith(ext));

    if (!isValid) {
      setErrorMsg('Por favor selecciona un archivo válido de Meta Suite (.csv, .xlsx o .xls).');
      return;
    }
    setFile(selectedFile);
  };

  const handleUpload = async () => {
    if (!file) return;
    setIsUploading(true);
    setErrorMsg('');

    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await fetch('/api/v1/analytics/import-meta-suite', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.detail || 'Error al procesar el archivo.');
      }

      setUploadResult(data);
      if (onImportSuccess) {
        onImportSuccess(data);
      }
    } catch (err) {
      setErrorMsg(err.message || 'Ocurrió un error al procesar el archivo.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleResetAndClose = () => {
    setFile(null);
    setUploadResult(null);
    setErrorMsg('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-xl bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl shadow-indigo-950/40 text-slate-100 overflow-hidden">
        {/* Background glow */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />

        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-indigo-600/20 border border-indigo-500/30 text-indigo-400">
              <FileSpreadsheet className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg font-black text-white">Importar Datos de Meta Business Suite</h2>
              <p className="text-xs text-slate-400">Exportaciones oficiales de Facebook e Instagram (CSV / Excel)</p>
            </div>
          </div>
          <button
            onClick={handleResetAndClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Step-by-Step Instructions Guide */}
        <div className="my-5 p-4 rounded-2xl bg-slate-950/60 border border-slate-800/80 text-xs space-y-2">
          <p className="font-extrabold text-indigo-300 flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-indigo-400" />
            ¿Cómo exportar desde Meta Business Suite?
          </p>
          <ol className="list-decimal list-inside space-y-1 text-slate-300 pl-1 leading-relaxed">
            <li>Ingresa a tu <strong>Meta Business Suite</strong> y ve a <strong>"Biblioteca de contenido"</strong>.</li>
            <li>Selecciona el rango de fechas que deseas (<em>Mes, Trimestre o Todo el Año</em>).</li>
            <li>Haz clic en el botón superior <strong>`⬇ Exportar datos`</strong> y descarga el archivo CSV o Excel.</li>
            <li>Arrastra el archivo descargado a la zona de abajo.</li>
          </ol>
        </div>

        {/* Upload State or Success State */}
        {!uploadResult ? (
          <div>
            {/* Drag and drop box */}
            <div
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
              onClick={() => inputRef.current?.click()}
              className={`relative flex flex-col items-center justify-center p-8 rounded-2xl border-2 border-dashed transition-all cursor-pointer ${
                dragActive
                  ? 'border-indigo-500 bg-indigo-950/20'
                  : file
                  ? 'border-emerald-500/50 bg-emerald-950/10'
                  : 'border-slate-700 hover:border-slate-600 bg-slate-950/30'
              }`}
            >
              <input
                ref={inputRef}
                type="file"
                accept=".csv, .xlsx, .xls"
                onChange={handleChange}
                className="hidden"
              />

              {file ? (
                <div className="flex flex-col items-center text-center">
                  <div className="p-3 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 mb-3">
                    <CheckCircle2 className="w-8 h-8" />
                  </div>
                  <p className="text-sm font-bold text-white mb-1">{file.name}</p>
                  <p className="text-xs text-slate-400">
                    {(file.size / 1024).toFixed(1)} KB • Listo para procesar
                  </p>
                </div>
              ) : (
                <div className="flex flex-col items-center text-center">
                  <div className="p-3 rounded-2xl bg-slate-800 text-slate-400 mb-3">
                    <UploadCloud className="w-8 h-8" />
                  </div>
                  <p className="text-sm font-bold text-white mb-1">
                    Arrastra tu archivo CSV o Excel aquí
                  </p>
                  <p className="text-xs text-slate-400">
                    o haz clic para explorar en tu computadora (.csv, .xlsx, .xls)
                  </p>
                </div>
              )}
            </div>

            {errorMsg && (
              <div className="mt-4 p-3 rounded-xl bg-red-950/40 border border-red-500/30 text-red-300 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            {/* Actions */}
            <div className="flex items-center justify-end gap-3 mt-6">
              <button
                onClick={handleResetAndClose}
                disabled={isUploading}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleUpload}
                disabled={!file || isUploading}
                className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-black transition-all ${
                  file && !isUploading
                    ? 'bg-gradient-to-r from-indigo-600 to-cyan-600 hover:from-indigo-500 hover:to-cyan-500 text-white shadow-lg shadow-indigo-500/30 cursor-pointer'
                    : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                }`}
              >
                {isUploading ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Procesando archivo...</span>
                  </>
                ) : (
                  <>
                    <span>Procesar e Importar al Dashboard</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </div>
        ) : (
          /* Success Summary Card */
          <div className="space-y-5 animate-fade-in">
            <div className="p-4 rounded-2xl bg-emerald-950/30 border border-emerald-500/40 text-emerald-300 flex items-center gap-3">
              <CheckCircle2 className="w-6 h-6 text-emerald-400 flex-shrink-0" />
              <div>
                <h4 className="text-sm font-black text-white">¡Importación Exitosa!</h4>
                <p className="text-xs text-emerald-200/80">{uploadResult.message}</p>
              </div>
            </div>

            {/* Metrics extracted preview */}
            <div className="grid grid-cols-3 gap-3 p-4 rounded-2xl bg-slate-950/80 border border-slate-800 text-center">
              <div>
                <span className="text-[11px] text-slate-400 block mb-1">Publicaciones</span>
                <strong className="text-base font-black text-indigo-400">
                  {uploadResult.total_posts?.toLocaleString()}
                </strong>
              </div>
              <div>
                <span className="text-[11px] text-slate-400 block mb-1">Visualizaciones</span>
                <strong className="text-base font-black text-cyan-400">
                  {uploadResult.total_views?.toLocaleString()}
                </strong>
              </div>
              <div>
                <span className="text-[11px] text-slate-400 block mb-1">Interacciones Totales</span>
                <strong className="text-base font-black text-emerald-400">
                  {uploadResult.total_interactions?.toLocaleString()}
                </strong>
              </div>
            </div>

            <button
              onClick={handleResetAndClose}
              className="w-full py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-black text-xs transition-all shadow-lg shadow-indigo-500/30"
            >
              Ver Dashboard Actualizado
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
