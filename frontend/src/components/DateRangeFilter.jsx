import React, { useState } from 'react';
import { Calendar, ChevronRight, BarChart2, Clock, CalendarDays } from 'lucide-react';

const MONTHS = [
  { id: '01', name: 'Enero', days: 31 },
  { id: '02', name: 'Febrero', days: 28 },
  { id: '03', name: 'Marzo', days: 31 },
  { id: '04', name: 'Abril', days: 30 },
  { id: '05', name: 'Mayo', days: 31 },
  { id: '06', name: 'Junio', days: 30 },
  { id: '07', name: 'Julio', days: 31 },
  { id: '08', name: 'Agosto', days: 31 },
  { id: '09', name: 'Septiembre', days: 30 },
  { id: '10', name: 'Octubre', days: 31 },
  { id: '11', name: 'Noviembre', days: 30 },
  { id: '12', name: 'Diciembre', days: 31 },
];

const QUARTERS = [
  { id: 'Q1', name: 'Trimestre 1', subtitle: 'Ene - Mar', start: '2026-01-01', end: '2026-03-31' },
  { id: 'Q2', name: 'Trimestre 2', subtitle: 'Abr - Jun', start: '2026-04-01', end: '2026-06-30' },
  { id: 'Q3', name: 'Trimestre 3', subtitle: 'Jul - Sep', start: '2026-07-01', end: '2026-09-30' },
  { id: 'Q4', name: 'Trimestre 4', subtitle: 'Oct - Dic', start: '2026-10-01', end: '2026-12-31' },
];

export default function DateRangeFilter({ selectedDays, onSelectDays, customDates, onSelectCustomDates }) {
  const [filterMode, setFilterMode] = useState('months'); // 'months', 'quarters', 'custom'
  const [activeMonth, setActiveMonth] = useState('08'); // Default Agosto (current active month)
  const [activeQuarter, setActiveQuarter] = useState('Q3'); // Default Q3

  const todayStr = new Date().toISOString().split('T')[0];
  const [startDate, setStartDate] = useState(customDates?.start || '2026-08-01');
  const [endDate, setEndDate] = useState(customDates?.end || todayStr);

  const handleSelectMonth = (monthObj) => {
    setActiveMonth(monthObj.id);
    const start = `2026-${monthObj.id}-01`;
    const end = `2026-${monthObj.id}-${monthObj.days}`;
    onSelectCustomDates(start, end);
  };

  const handleSelectQuarter = (qObj) => {
    setActiveQuarter(qObj.id);
    onSelectCustomDates(qObj.start, qObj.end);
  };

  const handleApplyCustom = () => {
    onSelectCustomDates(startDate, endDate);
  };

  return (
    <div className="flex flex-col gap-2.5 bg-slate-900/90 p-3 rounded-2xl border border-slate-800 shadow-xl">
      {/* Top Header: Mode Switcher */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800/80 pb-2">
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 text-xs text-slate-400 font-bold px-1">
            <Calendar className="w-4 h-4 text-indigo-400" />
            <span>Filtro de Período 2026:</span>
          </div>

          <div className="flex items-center bg-slate-950 p-1 rounded-xl border border-slate-800/80">
            <button
              onClick={() => {
                setFilterMode('months');
                const m = MONTHS.find((item) => item.id === activeMonth) || MONTHS[7];
                handleSelectMonth(m);
              }}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                filterMode === 'months'
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-500/30'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              <CalendarDays className="w-3.5 h-3.5" />
              Por Mes (Ene - Dic)
            </button>

            <button
              onClick={() => {
                setFilterMode('quarters');
                const q = QUARTERS.find((item) => item.id === activeQuarter) || QUARTERS[2];
                handleSelectQuarter(q);
              }}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                filterMode === 'quarters'
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-500/30'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              <BarChart2 className="w-3.5 h-3.5" />
              Por Trimestre (T1 - T4)
            </button>

            <button
              onClick={() => setFilterMode('custom')}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                filterMode === 'custom'
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-500/30'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              <Clock className="w-3.5 h-3.5" />
              Personalizado
            </button>
          </div>
        </div>

        {/* Quick Recent 7 Days Badge */}
        <button
          onClick={() => {
            setFilterMode('recent7');
            onSelectDays(7);
          }}
          className={`px-3 py-1 rounded-lg text-xs font-bold transition-all border ${
            filterMode === 'recent7'
              ? 'bg-emerald-600/30 text-emerald-300 border-emerald-500/50'
              : 'bg-slate-800/40 text-slate-400 border-slate-700 hover:text-slate-200 hover:bg-slate-800'
          }`}
        >
          ⚡ Últimos 7 Días en Vivo
        </button>
      </div>

      {/* Mode Content: Months Buttons */}
      {filterMode === 'months' && (
        <div className="grid grid-cols-6 sm:grid-cols-12 gap-1.5 pt-1">
          {MONTHS.map((m) => {
            const isSelected = activeMonth === m.id;
            const isCurrentMonth = m.id === '08';
            return (
              <button
                key={m.id}
                onClick={() => handleSelectMonth(m)}
                className={`flex flex-col items-center justify-center py-1.5 px-1 rounded-xl text-xs font-semibold transition-all border ${
                  isSelected
                    ? 'bg-indigo-600 text-white border-indigo-400 shadow-md shadow-indigo-500/30 font-bold scale-[1.03]'
                    : isCurrentMonth
                    ? 'bg-slate-800/90 text-indigo-300 border-indigo-500/40 hover:bg-slate-800'
                    : 'bg-slate-950/60 text-slate-400 border-slate-800/80 hover:bg-slate-800/80 hover:text-slate-200'
                }`}
              >
                <span className="text-[11px] leading-tight">{m.name}</span>
                {isCurrentMonth && <span className="text-[9px] text-emerald-400 font-normal">Activo</span>}
              </button>
            );
          })}
        </div>
      )}

      {/* Mode Content: Quarters Buttons */}
      {filterMode === 'quarters' && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
          {QUARTERS.map((q) => {
            const isSelected = activeQuarter === q.id;
            return (
              <button
                key={q.id}
                onClick={() => handleSelectQuarter(q)}
                className={`flex flex-col items-center justify-center py-2 px-3 rounded-xl text-xs font-bold transition-all border ${
                  isSelected
                    ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white border-indigo-400 shadow-lg shadow-indigo-500/30 scale-[1.02]'
                    : 'bg-slate-950/60 text-slate-300 border-slate-800 hover:bg-slate-800/80 hover:border-slate-700'
                }`}
              >
                <span className="text-xs font-black">{q.name}</span>
                <span className="text-[11px] text-indigo-300 font-normal">{q.subtitle}</span>
              </button>
            );
          })}
        </div>
      )}

      {/* Mode Content: Custom Date Pickers */}
      {filterMode === 'custom' && (
        <div className="flex flex-wrap items-center gap-3 pt-1 text-xs">
          <div className="flex items-center gap-1.5">
            <span className="text-slate-400 font-semibold">Desde:</span>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="bg-slate-800 text-slate-200 text-xs font-semibold px-2.5 py-1.5 rounded-lg border border-slate-700 focus:outline-none focus:border-indigo-500 cursor-pointer"
            />
          </div>
          <ChevronRight className="w-4 h-4 text-slate-500" />
          <div className="flex items-center gap-1.5">
            <span className="text-slate-400 font-semibold">Hasta:</span>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="bg-slate-800 text-slate-200 text-xs font-semibold px-2.5 py-1.5 rounded-lg border border-slate-700 focus:outline-none focus:border-indigo-500 cursor-pointer"
            />
          </div>
          <button
            onClick={handleApplyCustom}
            className="px-4 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-md shadow-indigo-500/20 transition-all cursor-pointer"
          >
            Aplicar Rango
          </button>
        </div>
      )}
    </div>
  );
}
