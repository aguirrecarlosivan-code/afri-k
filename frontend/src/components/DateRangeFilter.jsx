import React, { useState } from 'react';
import { Calendar, ChevronRight } from 'lucide-react';

export default function DateRangeFilter({ selectedDays, onSelectDays, customDates, onSelectCustomDates }) {
  const [isCustom, setIsCustom] = useState(false);
  const [startDate, setStartDate] = useState(customDates?.start || '2026-07-01');
  const [endDate, setEndDate] = useState(customDates?.end || '2026-07-24');

  const presets = [
    { label: '7 Días (Corte Semanal)', value: 7 },
    { label: '30 Días (Mes Activo)', value: 30 },
    { label: '90 Días (Trimestre Q3)', value: 90 },
  ];

  const handleSelectPreset = (value) => {
    setIsCustom(false);
    onSelectDays(value);
  };

  const handleCustomToggle = () => {
    setIsCustom(true);
    onSelectCustomDates(startDate, endDate);
  };

  const handleStartChange = (e) => {
    const val = e.target.value;
    setStartDate(val);
    onSelectCustomDates(val, endDate);
  };

  const handleEndChange = (e) => {
    const val = e.target.value;
    setEndDate(val);
    onSelectCustomDates(startDate, val);
  };

  return (
    <div className="flex flex-wrap items-center gap-2 bg-slate-900/80 p-1.5 rounded-xl border border-slate-800">
      <div className="flex items-center gap-1.5 text-xs text-slate-400 font-semibold px-2">
        <Calendar className="w-4 h-4 text-indigo-400" />
        <span>Período:</span>
      </div>

      {presets.map((preset) => (
        <button
          key={preset.value}
          onClick={() => handleSelectPreset(preset.value)}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
            !isCustom && selectedDays === preset.value
              ? 'bg-indigo-600 text-white shadow-md shadow-indigo-500/20'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
          }`}
        >
          {preset.label}
        </button>
      ))}

      {/* Custom Period Button */}
      <button
        onClick={handleCustomToggle}
        className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
          isCustom
            ? 'bg-indigo-600 text-white shadow-md shadow-indigo-500/20'
            : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
        }`}
      >
        Personalizado
      </button>

      {/* Date Pickers for Custom Range */}
      {isCustom && (
        <div className="flex items-center gap-2 pl-2 border-l border-slate-800 text-xs">
          <div className="flex items-center gap-1">
            <span className="text-slate-400">Desde:</span>
            <input
              type="date"
              value={startDate}
              onChange={handleStartChange}
              className="bg-slate-800 text-slate-200 text-xs font-semibold px-2 py-1 rounded border border-slate-700 focus:outline-none"
            />
          </div>
          <ChevronRight className="w-3.5 h-3.5 text-slate-500" />
          <div className="flex items-center gap-1">
            <span className="text-slate-400">Hasta:</span>
            <input
              type="date"
              value={endDate}
              onChange={handleEndChange}
              className="bg-slate-800 text-slate-200 text-xs font-semibold px-2 py-1 rounded border border-slate-700 focus:outline-none"
            />
          </div>
        </div>
      )}
    </div>
  );
}
