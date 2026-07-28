import React from 'react';
import { Share2, Bookmark, MousePointer, Video, Clock, ArrowUpRight, CheckCircle2, AlertCircle } from 'lucide-react';

export default function PlatformDeepMetricsMatrix({ platforms = [] }) {
  const findPlatform = (name) => {
    if (!platforms) return null;
    return platforms.find((p) => (p.platform || '').toLowerCase() === name.toLowerCase());
  };

  const fbData = findPlatform('facebook');
  const igData = findPlatform('instagram');
  const ytData = findPlatform('youtube');
  const ttData = findPlatform('tiktok');

  const fbConnected = Boolean(fbData && fbData.followers > 0);
  const igConnected = Boolean(igData && igData.followers > 0);

  const matrix = [
    {
      platform: 'Facebook',
      status: fbConnected ? 'API Graph v21.0 Conectada' : 'Sin API Vinculada (0)',
      isLive: fbConnected,
      color: '#1877F2',
      bgGradient: 'from-blue-950/40 to-slate-900',
      borderColor: 'border-blue-500/40',
      followers: (fbData?.followers || 0).toLocaleString(),
      reach: (fbData?.total_reach || 0).toLocaleString(),
      impressions: (fbData?.total_impressions || 0).toLocaleString(),
      engagement: `${fbData?.avg_engagement || 0}%`,
    },
    {
      platform: 'Instagram',
      status: igConnected ? 'API Meta Conectada' : 'Sin API Vinculada (0)',
      isLive: igConnected,
      color: '#E1306C',
      bgGradient: 'from-pink-950/40 to-slate-900',
      borderColor: 'border-pink-500/40',
      followers: (igData?.followers || 0).toLocaleString(),
      reach: (igData?.total_reach || 0).toLocaleString(),
      impressions: (igData?.total_impressions || 0).toLocaleString(),
      engagement: `${igData?.avg_engagement || 0}%`,
    },
    {
      platform: 'YouTube',
      status: 'Sin API Vinculada (0)',
      isLive: false,
      color: '#FF0000',
      bgGradient: 'from-slate-900/60 to-slate-950',
      borderColor: 'border-slate-800',
      followers: '0',
      reach: '0',
      impressions: '0',
      engagement: '0.0%',
    },
    {
      platform: 'TikTok',
      status: 'Sin API Vinculada (0)',
      isLive: false,
      color: '#00F2FE',
      bgGradient: 'from-slate-900/60 to-slate-950',
      borderColor: 'border-slate-800',
      followers: '0',
      reach: '0',
      impressions: '0',
      engagement: '0.0%',
    },
  ];

  return (
    <div className="glass-panel p-6 rounded-2xl space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <h3 className="text-lg font-extrabold text-white flex items-center gap-2">
            Matriz de Métricas Detalladas por Canal
            <ArrowUpRight className="w-4 h-4 text-cyan-400" />
          </h3>
          <p className="text-xs text-slate-400">
            Conexión en vivo con Graph API para Once Noticias | Integraciones en progreso
          </p>
        </div>
        <span className="text-xs font-semibold px-3 py-1 rounded-full bg-slate-800 text-slate-300 border border-slate-700 flex items-center gap-1.5">
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> Meta Graph API v21.0 Conectada
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 pt-2">
        {matrix.map((item) => (
          <div
            key={item.platform}
            className={`bg-gradient-to-b ${item.bgGradient} p-5 rounded-xl border ${item.borderColor} relative overflow-hidden transition-all ${
              item.isLive ? 'hover:scale-[1.01]' : 'opacity-80'
            }`}
          >
            {/* Header with Title and Connection Status */}
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-800/80">
              <div>
                <h4 className="text-base font-extrabold text-white flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                  {item.platform}
                </h4>
                <div className="flex items-center gap-1 mt-0.5">
                  {item.isLive ? (
                    <span className="text-[10px] text-emerald-400 font-semibold flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" /> API Conectada
                    </span>
                  ) : (
                    <span className="text-[10px] text-slate-500 font-semibold flex items-center gap-1">
                      <AlertCircle className="w-3 h-3 text-slate-500" /> Sin API Vinculada (0)
                    </span>
                  )}
                </div>
              </div>

              <span className={`text-xs font-extrabold px-2.5 py-1 rounded-lg border ${
                item.isLive ? 'bg-slate-900/90 text-slate-200 border-slate-800' : 'bg-slate-900/40 text-slate-600 border-slate-800/50'
              }`}>
                Eng: <span style={{ color: item.isLive ? item.color : '#64748B' }}>{item.engagement}</span>
              </span>
            </div>

            {/* Metrics List - Pure API Data */}
            <div className="space-y-2.5 text-xs">
              <div className="flex items-center justify-between text-slate-300">
                <span className="text-slate-400 flex items-center gap-1.5">
                  <Video className="w-3.5 h-3.5 text-cyan-400" /> Comunidad / Seguidores:
                </span>
                <span className={`font-bold ${item.isLive ? 'text-white' : 'text-slate-600'}`}>{item.followers}</span>
              </div>

              <div className="flex items-center justify-between text-slate-300">
                <span className="text-slate-400 flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-purple-400" /> Alcance Real (Reach):
                </span>
                <span className={`font-bold ${item.isLive ? 'text-white' : 'text-slate-600'}`}>{item.reach}</span>
              </div>

              <div className="flex items-center justify-between text-slate-300">
                <span className="text-slate-400 flex items-center gap-1.5">
                  <Share2 className="w-3.5 h-3.5 text-emerald-400" /> Impresiones Totales:
                </span>
                <span className={`font-bold ${item.isLive ? 'text-emerald-400' : 'text-slate-600'}`}>{item.impressions}</span>
              </div>

              <div className="flex items-center justify-between text-slate-300 pt-1 border-t border-slate-800/60">
                <span className="text-slate-400 flex items-center gap-1.5">
                  <MousePointer className="w-3.5 h-3.5 text-indigo-400" /> Tasa de Engagement:
                </span>
                <span className={`font-bold ${item.isLive ? 'text-indigo-300' : 'text-slate-600'}`}>{item.engagement}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
