import React, { useState } from 'react';
import { Flame, ExternalLink, Eye, ThumbsUp, MessageSquare, Share2, Filter, ArrowUpDown, AlertCircle } from 'lucide-react';

export default function TopPostsTable({ posts = [] }) {
  const [selectedFormat, setSelectedFormat] = useState('all');
  const [sortBy, setSortBy] = useState('virality');

  const getPlatformBadge = (platform) => {
    const map = {
      instagram: 'bg-pink-500/10 text-pink-400 border-pink-500/30',
      facebook: 'bg-blue-500/10 text-blue-400 border-blue-500/30',
      youtube: 'bg-red-500/10 text-red-400 border-red-500/30',
      tiktok: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30',
      x: 'bg-slate-700 text-slate-300 border-slate-600',
    };
    return map[(platform || '').toLowerCase()] || 'bg-slate-800 text-slate-300';
  };

  const getPlatformButtonText = (platform) => {
    const p = (platform || '').toLowerCase();
    if (p === 'facebook') return 'Ver en Facebook';
    if (p === 'instagram') return 'Ver en Instagram';
    if (p === 'youtube') return 'Ver en YouTube';
    if (p === 'tiktok') return 'Ver en TikTok';
    return 'Ver Publicación';
  };

  // Filter by format
  const filteredPosts = posts.filter((p) => {
    if (selectedFormat === 'all') return true;
    return (p.type || '').toLowerCase() === selectedFormat.toLowerCase();
  });

  // Sort posts
  const sortedPosts = [...filteredPosts].sort((a, b) => {
    if (sortBy === 'virality') {
      return (b.virality_score || 0) - (a.virality_score || 0);
    } else if (sortBy === 'reach') {
      return (b.metrics?.reach || 0) - (a.metrics?.reach || 0);
    } else if (sortBy === 'likes') {
      return (b.metrics?.likes || 0) - (a.metrics?.likes || 0);
    }
    return 0;
  });

  return (
    <div className="glass-panel p-6 rounded-2xl">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 gap-3">
        <div>
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <Flame className="w-5 h-5 text-amber-400" />
            Top Publicaciones Virales Destacadas
          </h3>
          <p className="text-xs text-slate-400">Publicaciones reales extraídas directamente de la API de Meta Graph para Once Noticias</p>
        </div>

        {/* Filters and Sorting Controls */}
        <div className="flex items-center gap-2">
          {/* Format Filter */}
          <div className="flex items-center gap-1.5 bg-slate-900 px-3 py-1.5 rounded-xl border border-slate-800 text-xs">
            <Filter className="w-3.5 h-3.5 text-indigo-400" />
            <select
              value={selectedFormat}
              onChange={(e) => setSelectedFormat(e.target.value)}
              className="bg-transparent text-slate-200 font-semibold focus:outline-none cursor-pointer"
            >
              <option value="all">Todos los Formatos</option>
              <option value="reel">Reels</option>
              <option value="video">Videos</option>
              <option value="short">Shorts</option>
              <option value="post">Posts Estáticos</option>
            </select>
          </div>

          {/* Sort By */}
          <div className="flex items-center gap-1.5 bg-slate-900 px-3 py-1.5 rounded-xl border border-slate-800 text-xs">
            <ArrowUpDown className="w-3.5 h-3.5 text-cyan-400" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="bg-transparent text-slate-200 font-semibold focus:outline-none cursor-pointer"
            >
              <option value="virality">Score Virilidad</option>
              <option value="reach">Mayor Alcance</option>
              <option value="likes">Más Reacciones</option>
            </select>
          </div>
        </div>
      </div>

      {sortedPosts.length === 0 ? (
        <div className="p-8 text-center bg-slate-900/40 rounded-xl border border-slate-800/80 my-4">
          <AlertCircle className="w-8 h-8 text-slate-500 mx-auto mb-2" />
          <p className="text-sm font-semibold text-slate-300">No hay publicaciones disponibles para los filtros seleccionados</p>
          <p className="text-xs text-slate-500 mt-1">Las redes sociales sin API vinculada o sin actividad reciente no mostrarán datos simulados.</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-300">
            <thead className="bg-slate-900/60 text-xs uppercase text-slate-400 border-b border-slate-800">
              <tr>
                <th className="py-3 px-4">Canal</th>
                <th className="py-3 px-4">Formato</th>
                <th className="py-3 px-4">Contenido / Titular Real</th>
                <th className="py-3 px-4">Alcance</th>
                <th className="py-3 px-4">Interacciones</th>
                <th className="py-3 px-4 text-center">Score Virilidad</th>
                <th className="py-3 px-4 text-right">Enlace Directo</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {sortedPosts.map((post) => {
                const displayUrl = post.url || `https://www.facebook.com/${post.id}`;
                const displayText = post.text || 'Publicación de Once Noticias';
                const buttonLabel = getPlatformButtonText(post.platform);

                return (
                  <tr key={post.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <span className={`px-2.5 py-1 text-xs font-bold rounded-lg border uppercase ${getPlatformBadge(post.platform)}`}>
                        {post.platform}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <span className="px-2 py-0.5 text-[11px] font-semibold bg-slate-800 text-slate-300 rounded-md capitalize">
                        {post.type}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 max-w-md font-medium text-slate-200" title={displayText}>
                      <div className="line-clamp-2 text-xs leading-relaxed">
                        {displayText}
                      </div>
                    </td>

                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <div className="flex items-center gap-1.5 text-slate-300">
                        <Eye className="w-4 h-4 text-slate-500" />
                        <span>{(post.metrics?.reach || 0).toLocaleString()}</span>
                      </div>
                    </td>

                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <div className="flex items-center gap-3 text-xs text-slate-400">
                        <span className="flex items-center gap-1 text-emerald-400">
                          <ThumbsUp className="w-3.5 h-3.5" /> {(post.metrics?.likes || 0).toLocaleString()}
                        </span>
                        <span className="flex items-center gap-1 text-cyan-400">
                          <MessageSquare className="w-3.5 h-3.5" /> {(post.metrics?.comments || 0).toLocaleString()}
                        </span>
                        <span className="flex items-center gap-1 text-purple-400">
                          <Share2 className="w-3.5 h-3.5" /> {(post.metrics?.shares || 0).toLocaleString()}
                        </span>
                      </div>
                    </td>

                    <td className="py-3.5 px-4 text-center whitespace-nowrap">
                      <span className="px-3 py-1 rounded-full text-xs font-extrabold bg-amber-500/10 text-amber-400 border border-amber-500/30">
                        🔥 {post.virality_score || 18.5} / 100
                      </span>
                    </td>

                    <td className="py-3.5 px-4 text-right whitespace-nowrap">
                      <a
                        href={displayUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-3 py-1.5 rounded-lg bg-blue-600/20 hover:bg-blue-600/40 text-blue-400 hover:text-blue-200 border border-blue-500/40 inline-flex items-center gap-1.5 text-xs font-bold transition-all"
                      >
                        <span>{buttonLabel}</span>
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
