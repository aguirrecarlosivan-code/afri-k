import React from 'react';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

export default function KPICard({ title, value, changePct, trend, icon: Icon, color = 'indigo' }) {
  const isUp = trend === 'up';
  const isDown = trend === 'down';

  const colorClasses = {
    indigo: 'from-indigo-500/20 to-indigo-500/5 text-indigo-400 border-indigo-500/30',
    blue: 'from-blue-500/20 to-blue-500/5 text-blue-400 border-blue-500/30',
    purple: 'from-purple-500/20 to-purple-500/5 text-purple-400 border-purple-500/30',
    cyan: 'from-cyan-500/20 to-cyan-500/5 text-cyan-400 border-cyan-500/30',
  }[color] || 'from-indigo-500/20 to-indigo-500/5 text-indigo-400 border-indigo-500/30';

  return (
    <div className="glass-panel glass-panel-hover p-6 rounded-2xl relative overflow-hidden">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">{title}</span>
        <div className={`p-3 rounded-xl bg-gradient-to-br ${colorClasses} border`}>
          <Icon className="w-5 h-5" />
        </div>
      </div>

      <div className="mt-4 flex items-baseline justify-between">
        <h3 className="text-3xl font-extrabold text-white tracking-tight">{value}</h3>

        {changePct !== undefined && (
          <div className={`flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-full border ${
            isUp
              ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
              : isDown
              ? 'bg-rose-500/10 text-rose-400 border-rose-500/20'
              : 'bg-slate-800 text-slate-400 border-slate-700'
          }`}>
            {isUp && <TrendingUp className="w-3.5 h-3.5" />}
            {isDown && <TrendingDown className="w-3.5 h-3.5" />}
            {!isUp && !isDown && <Minus className="w-3.5 h-3.5" />}
            <span>{isUp ? '+' : ''}{changePct}% WoW</span>
          </div>
        )}
      </div>
    </div>
  );
}
