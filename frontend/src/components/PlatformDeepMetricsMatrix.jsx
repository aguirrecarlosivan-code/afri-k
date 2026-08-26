import React from 'react';
import { Share2, Clock, ArrowUpRight, CheckCircle2, AlertCircle, PlusCircle, Settings, Video, MousePointer, ThumbsUp, MessageSquare } from 'lucide-react';

export default function PlatformDeepMetricsMatrix({ platforms = [], onOpenConnector, onSelectPlatform, selectedPlatform = 'all' }) {
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
  const ytConnected = Boolean(ytData && ytData.followers > 0);
  const ttConnected = Boolean(ttData && ttData.followers > 0);

  const matrix = [
    {
      id: 'facebook',
      platform: 'Facebook',
      status: fbConnected ? 'API Graph v21.0 Conectada' : 'Sin API Vinculada (0)',
      isLive: fbConnected,
      color: '#1877F2',
      bgGradient: 'from-blue-950/40 via-slate-900/60 to-slate-900',
      borderColor: 'border-blue-500/40',
      activeBorder: 'ring-2 ring-blue-500',
      followers: (fbData?.followers || 0).toLocaleString(),
      reach: (fbData?.total_reach || 0).toLocaleString(),
      impressions: (fbData?.total_impressions || 0).toLocaleString(),
      engagement: `${fbData?.avg_engagement || 0}%`,
    },
    {
      id: 'instagram',
      platform: 'Instagram',
      status: igConnected ? 'API Meta Conectada' : 'Sin API Vinculada (0)',
      isLive: igConnected,
      color: '#E1306C',
      bgGradient: 'from-pink-950/40 via-slate-900/60 to-slate-900',
      borderColor: 'border-pink-500/40',
      activeBorder: 'ring-2 ring-pink-500',
      followers: (igData?.followers || 0).toLocaleString(),
      reach: (igData?.total_reach || 0).toLocaleString(),
      impressions: (igData?.total_impressions || 0).toLocaleString(),
      engagement: `${igData?.avg_engagement || 0}%`,
    },
    {
      id: 'youtube',
      platform: 'YouTube',
      status: ytConnected ? 'API v3 Conectada' : 'Sin API Vinculada (0)',
      isLive: ytConnected,
      color: '#FF0000',
      bgGradient: 'from-red-950/20 via-slate-900/40 to-slate-950',
      borderColor: ytConnected ? 'border-red-500/40' : 'border-slate-800',
      activeBorder: 'ring-2 ring-red-500',
      followers: (ytData?.followers || 0).toLocaleString(),
      reach: (ytData?.total_reach || 0).toLocaleString(),
      impressions: (ytData?.total_impressions || 0).toLocaleString(),
      engagement: `${ytData?.avg_engagement || 0}%`,
    },
    {
      id: 'tiktok',
      platform: 'TikTok',
      status: ttConnected ? 'Display API Conectada' : 'Sin API Vinculada (0)',
      isLive: ttConnected,
      color: '#00F2FE',
      bgGradient: 'from-cyan-950/20 via-slate-900/40 to-slate-950',
      borderColor: ttConnected ? 'border-cyan-500/40' : 'border-slate-800',
      activeBorder: 'ring-2 ring-cyan-500',
      followers: (ttData?.followers || 0).toLocaleString(),
      reach: (ttData?.total_reach || 0).toLocaleString(),
      impressions: (ttData?.total_impressions || 0).toLocaleString(),
      engagement: `${ttData?.avg_engagement || 0}%`,
    },
  ];

  return (
    <div className="glass-panel p-6 rounded-2xl space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h3 className="text-lg font-extrabold text-white flex items-center gap-2">
            Matriz de Métricas Detalladas por Canal
            <ArrowUpRight className="w-4 h-4 text-cyan-400" />
          </h3>
          <p className="text-xs text-slate-400">
            Centro de control y conexión de APIs oficiales para Once Noticias
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold px-3 py-1 rounded-full bg-slate-800 text-slate-300 border border-slate-700 flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> Meta Graph API v21.0 Conectada
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 pt-2">
        {matrix.map((item) => {
          const isSelected = selectedPlatform.toLowerCase() === item.id;

          return (
            <div
              key={item.platform}
              onClick={() => onSelectPlatform && onSelectPlatform(item.id)}
              className={`bg-gradient-to-b ${item.bgGradient} p-5 rounded-2xl border ${item.borderColor} relative overflow-hidden transition-all cursor-pointer ${
                isSelected ? item.activeBorder + ' shadow-xl' : 'hover:border-slate-600 hover:scale-[1.01]'
              } ${item.isLive ? 'opacity-100' : 'opacity-85'}`}
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
                      <span className="text-[10px] text-slate-400 font-medium flex items-center gap-1">
                        <AlertCircle className="w-3 h-3 text-slate-500" /> Sin API Vinculada (0)
                      </span>
                    )}
                  </div>
                </div>

                <span
                  className={`text-xs font-extrabold px-2.5 py-1 rounded-lg border ${
                    item.isLive ? 'bg-slate-900/90 text-slate-200 border-slate-800' : 'bg-slate-900/40 text-slate-500 border-slate-800/50'
                  }`}
                >
                  Eng: <span style={{ color: item.isLive ? item.color : '#64748B' }}>{item.engagement}</span>
                </span>
              </div>

              {/* Metrics List - Pure API Data */}
              <div className="space-y-2.5 text-xs mb-4">
                <div className="flex items-center justify-between text-slate-300">
                  <span className="text-slate-400 flex items-center gap-1.5">
                    <Video className="w-3.5 h-3.5 text-cyan-400" /> Comunidad / Seguidores:
                  </span>
                  <span className={`font-bold ${item.isLive ? 'text-white' : 'text-slate-500'}`}>{item.followers}</span>
                </div>

                <div className="flex items-center justify-between text-slate-300">
                  <span className="text-slate-400 flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-purple-400" /> Alcance Real (Reach):
                  </span>
                  <span className={`font-bold ${item.isLive ? 'text-white' : 'text-slate-500'}`}>{item.reach}</span>
                </div>

                <div className="flex items-center justify-between text-slate-300">
                  <span className="text-slate-400 flex items-center gap-1.5">
                    <Share2 className="w-3.5 h-3.5 text-emerald-400" /> Impresiones Totales:
                  </span>
                  <span className={`font-bold ${item.isLive ? 'text-emerald-400' : 'text-slate-500'}`}>{item.impressions}</span>
                </div>

                <div className="flex items-center justify-between text-slate-300 pt-1 border-t border-slate-800/60">
                  <span className="text-slate-400 flex items-center gap-1.5">
                    <MousePointer className="w-3.5 h-3.5 text-indigo-400" /> Tasa de Engagement:
                  </span>
                  <span className={`font-bold ${item.isLive ? 'text-indigo-300' : 'text-slate-500'}`}>{item.engagement}</span>
                </div>
              </div>

              {/* Interactive Connect / Configure Button */}
              <div className="pt-2 border-t border-slate-800/80">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    if (onOpenConnector) onOpenConnector(item.id);
                  }}
                  className={`w-full py-1.5 px-3 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
                    item.isLive
                      ? 'bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700'
                      : 'bg-indigo-600/30 hover:bg-indigo-600/50 text-indigo-300 hover:text-white border border-indigo-500/40 shadow-sm'
                  }`}
                >
                  {item.isLive ? (
                    <>
                      <Settings className="w-3.5 h-3.5" /> Configurar Token
                    </>
                  ) : (
                    <>
                      <PlusCircle className="w-3.5 h-3.5 text-indigo-400" /> Conectar Canal API
                    </>
                  )}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
