import React from 'react';
import { Layers } from 'lucide-react';

export default function PlatformTabs({ selectedPlatform, onSelectPlatform }) {
  const tabs = [
    { id: 'all', label: 'Todas las Plataformas' },
    { id: 'instagram', label: 'Instagram' },
    { id: 'youtube', label: 'YouTube' },
    { id: 'facebook', label: 'Facebook' },
    { id: 'tiktok', label: 'TikTok' },
    { id: 'x', label: 'X (Twitter)' },
  ];

  return (
    <div className="flex items-center gap-2 overflow-x-auto pb-1">
      <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-400 mr-1">
        <Layers className="w-4 h-4 text-cyan-400" />
        <span>Filtro de Canal:</span>
      </div>

      <div className="flex items-center gap-1.5 bg-slate-900/60 p-1.5 rounded-xl border border-slate-800">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => onSelectPlatform(tab.id)}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${
              selectedPlatform === tab.id
                ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md shadow-blue-500/20'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>
    </div>
  );
}
