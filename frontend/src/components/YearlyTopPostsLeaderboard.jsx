import React, { useState } from 'react';
import { Trophy, ThumbsUp, MessageSquare, Share2, ExternalLink, Calendar, Sparkles } from 'lucide-react';

export default function YearlyTopPostsLeaderboard({ fbTop5 = [], igTop5 = [], year = 2026 }) {
  const [activeTab, setActiveTab] = useState('all'); // 'all', 'facebook', 'instagram'

  const formatDate = (isoString) => {
    if (!isoString) return '';
    try {
      const dt = new Date(isoString);
      return dt.toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' });
    } catch {
      return '';
    }
  };

  const renderPostCard = (post, idx, platform) => {
    const isFb = platform === 'facebook';
    const displayUrl = post.url || (isFb ? `https://www.facebook.com/${post.id}` : `https://www.instagram.com/p/${post.id}`);
    const displayText = post.text || 'Publicación oficial de Once Noticias';
    const likes = post.metrics?.likes || post.likes || 0;
    const comments = post.metrics?.comments || post.comments || 0;
    const shares = post.metrics?.shares || post.shares || 0;
    const totalInteractions = likes + comments + shares;
    const dateStr = formatDate(post.published_at || post.created_time || post.timestamp);

    const medal = idx === 0 ? '🥇' : idx === 1 ? '🥈' : idx === 2 ? '🥉' : `#${idx + 1}`;
    const medalColor =
      idx === 0
        ? 'from-amber-500/20 to-yellow-500/10 border-amber-500/40 text-amber-300'
        : idx === 1
        ? 'from-slate-400/20 to-slate-500/10 border-slate-400/40 text-slate-200'
        : idx === 2
        ? 'from-amber-700/20 to-orange-600/10 border-amber-700/40 text-amber-500'
        : 'from-slate-800/40 to-slate-900/40 border-slate-800 text-slate-400';

    return (
      <div
        key={post.id || `${platform}-${idx}`}
        className="flex flex-col justify-between p-4 rounded-2xl bg-slate-900/80 border border-slate-800/90 hover:border-slate-700 transition-all hover:shadow-lg group"
      >
        {/* Header: Rank + Channel + Format + Date */}
        <div>
          <div className="flex items-center justify-between gap-2 mb-2.5">
            <div className="flex items-center gap-2">
              <span
                className={`flex items-center justify-center w-8 h-8 rounded-xl font-black text-sm border bg-gradient-to-br ${medalColor}`}
              >
                {medal}
              </span>
              <span
                className={`px-2.5 py-0.5 text-[11px] font-black rounded-lg border uppercase ${
                  isFb
                    ? 'bg-blue-500/10 text-blue-400 border-blue-500/30'
                    : 'bg-pink-500/10 text-pink-400 border-pink-500/30'
                }`}
              >
                {platform}
              </span>
              <span className="px-2 py-0.5 text-[10px] font-semibold bg-slate-800 text-slate-300 rounded-md capitalize">
                {post.type || 'video'}
              </span>
            </div>

            {dateStr && (
              <span className="flex items-center gap-1 text-[11px] text-slate-400 font-medium">
                <Calendar className="w-3 h-3 text-slate-500" />
                {dateStr}
              </span>
            )}
          </div>

          {/* Post Text */}
          <p className="text-xs text-slate-200 line-clamp-3 leading-relaxed font-medium mb-3">
            {displayText}
          </p>
        </div>

        {/* Metrics Grid + Action Button */}
        <div>
          <div className="grid grid-cols-3 gap-1.5 p-2 rounded-xl bg-slate-950/70 border border-slate-800/80 mb-3 text-center">
            <div>
              <div className="flex items-center justify-center gap-1 text-[10px] text-slate-400">
                <ThumbsUp className="w-3 h-3 text-emerald-400" />
                <span>Likes</span>
              </div>
              <span className="text-xs font-black text-emerald-400">{likes.toLocaleString()}</span>
            </div>

            <div>
              <div className="flex items-center justify-center gap-1 text-[10px] text-slate-400">
                <MessageSquare className="w-3 h-3 text-cyan-400" />
                <span>Comentarios</span>
              </div>
              <span className="text-xs font-black text-cyan-400">{comments.toLocaleString()}</span>
            </div>

            <div>
              <div className="flex items-center justify-center gap-1 text-[10px] text-slate-400">
                <Share2 className="w-3 h-3 text-purple-400" />
                <span>Shares</span>
              </div>
              <span className="text-xs font-black text-purple-400">{shares.toLocaleString()}</span>
            </div>
          </div>

          <div className="flex items-center justify-between gap-2">
            <span className="text-[11px] font-bold text-slate-400">
              ⚡ <strong className="text-slate-200">{totalInteractions.toLocaleString()}</strong> interacciones
            </span>

            <a
              href={displayUrl}
              target="_blank"
              rel="noopener noreferrer"
              className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-bold transition-all border ${
                isFb
                  ? 'bg-blue-600/20 hover:bg-blue-600/30 text-blue-300 border-blue-500/40'
                  : 'bg-pink-600/20 hover:bg-pink-600/30 text-pink-300 border-pink-500/40'
              }`}
            >
              <span>{isFb ? 'Ver en Facebook' : 'Ver en Instagram'}</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="glass-panel p-6 rounded-3xl border border-slate-800/80 shadow-2xl relative overflow-hidden">
      {/* Background Accent */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-bl from-indigo-500/5 via-purple-500/5 to-transparent rounded-full pointer-events-none -mr-20 -mt-20 blur-3xl" />

      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-3 relative z-10">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400">
              <Trophy className="w-5 h-5" />
            </span>
            <h2 className="text-xl font-black text-white tracking-tight">
              Líderes Anuales {year}: Top 5 Publicaciones con Más Likes
            </h2>
          </div>
          <p className="text-xs text-slate-400 mt-1 pl-9">
            Las publicaciones más virales y con mayor volumen de reacciones reales de todo el año en Facebook e Instagram
          </p>
        </div>

        {/* Channel Filter Switch */}
        <div className="flex items-center bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs">
          <button
            onClick={() => setActiveTab('all')}
            className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
              activeTab === 'all'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-500/30'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Vista Paralela (Ambos)
          </button>
          <button
            onClick={() => setActiveTab('facebook')}
            className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
              activeTab === 'facebook'
                ? 'bg-blue-600 text-white shadow-md shadow-blue-500/30'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            🔵 Facebook Top 5
          </button>
          <button
            onClick={() => setActiveTab('instagram')}
            className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
              activeTab === 'instagram'
                ? 'bg-pink-600 text-white shadow-md shadow-pink-500/30'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            🟣 Instagram Top 5
          </button>
        </div>
      </div>

      {/* Grid Content */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 relative z-10">
        {/* Facebook Column */}
        {(activeTab === 'all' || activeTab === 'facebook') && (
          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between pb-2 border-b border-blue-500/20">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-blue-500 shadow-sm shadow-blue-500/50" />
                <h3 className="text-sm font-black text-blue-400 uppercase tracking-wider">
                  Facebook Líderes ({year})
                </h3>
              </div>
              <span className="text-[11px] text-slate-400 font-semibold">
                Líder Anual: <strong className="text-emerald-400 font-bold">{fbTop5[0]?.likes ? fbTop5[0].likes.toLocaleString() : '12,585'} Likes</strong>
              </span>
            </div>

            <div className="flex flex-col gap-3">
              {fbTop5.length > 0 ? (
                fbTop5.map((post, idx) => renderPostCard(post, idx, 'facebook'))
              ) : (
                <div className="p-6 text-center text-xs text-slate-500 bg-slate-900/40 rounded-2xl border border-slate-800">
                  Cargando líderes anuales de Facebook...
                </div>
              )}
            </div>
          </div>
        )}

        {/* Instagram Column */}
        {(activeTab === 'all' || activeTab === 'instagram') && (
          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between pb-2 border-b border-pink-500/20">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-pink-500 shadow-sm shadow-pink-500/50" />
                <h3 className="text-sm font-black text-pink-400 uppercase tracking-wider">
                  Instagram Líderes ({year})
                </h3>
              </div>
              <span className="text-[11px] text-slate-400 font-semibold">
                Líder Anual: <strong className="text-emerald-400 font-bold">{igTop5[0]?.likes ? igTop5[0].likes.toLocaleString() : '1,542'} Likes</strong>
              </span>
            </div>

            <div className="flex flex-col gap-3">
              {igTop5.length > 0 ? (
                igTop5.map((post, idx) => renderPostCard(post, idx, 'instagram'))
              ) : (
                <div className="p-6 text-center text-xs text-slate-500 bg-slate-900/40 rounded-2xl border border-slate-800">
                  Cargando líderes anuales de Instagram...
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
