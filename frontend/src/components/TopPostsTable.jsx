import React, { useState, useEffect } from 'react';
import { ThumbsUp, MessageSquare, Share2, Eye, Users, ExternalLink, Filter, ArrowUpDown, AlertCircle, Award, ChevronLeft, ChevronRight, Sparkles, Database } from 'lucide-react';

export default function TopPostsTable({ posts = [] }) {
  const [selectedFormat, setSelectedFormat] = useState('all');
  const [sortBy, setSortBy] = useState('likes'); // Default: Likes -> Comments -> Shares
  const [currentPage, setCurrentPage] = useState(1);
  const postsPerPage = 10;

  // Reset page to 1 when filters or sorting change
  useEffect(() => {
    setCurrentPage(1);
  }, [selectedFormat, sortBy, posts]);

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

  // Sort posts dynamically
  const sortedPosts = [...filteredPosts].sort((a, b) => {
    const aLikes = a.metrics?.likes || 0;
    const bLikes = b.metrics?.likes || 0;
    const aComments = a.metrics?.comments || 0;
    const bComments = b.metrics?.comments || 0;
    const aShares = a.metrics?.shares || 0;
    const bShares = b.metrics?.shares || 0;
    const aViews = a.metrics?.views || 0;
    const bViews = b.metrics?.views || 0;
    const aReach = a.metrics?.reach || 0;
    const bReach = b.metrics?.reach || 0;

    if (sortBy === 'likes') {
      if (bLikes !== aLikes) return bLikes - aLikes;
      if (bComments !== aComments) return bComments - aComments;
      return bShares - aShares;
    } else if (sortBy === 'comments') {
      if (bComments !== aComments) return bComments - aComments;
      if (bLikes !== aLikes) return bLikes - aLikes;
      return bShares - aShares;
    } else if (sortBy === 'shares') {
      if (bShares !== aShares) return bShares - aShares;
      if (bLikes !== aLikes) return bLikes - aLikes;
      return bComments - aComments;
    } else if (sortBy === 'views') {
      if (bViews !== aViews) return bViews - aViews;
      return bReach - aReach;
    } else if (sortBy === 'reach') {
      if (bReach !== aReach) return bReach - aReach;
      return bViews - aViews;
    }
    return 0;
  });

  // Pagination calculations (10 posts per page)
  const totalPages = Math.max(1, Math.ceil(sortedPosts.length / postsPerPage));
  const startIndex = (currentPage - 1) * postsPerPage;
  const currentPosts = sortedPosts.slice(startIndex, startIndex + postsPerPage);

  return (
    <div className="glass-panel p-6 rounded-2xl">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 gap-3">
        <div>
          <h3 className="text-lg font-extrabold text-white flex items-center gap-2">
            <Award className="w-5 h-5 text-amber-400" />
            Top Publicaciones • Base Híbrida (Meta Suite + En Vivo API)
          </h3>
          <p className="text-xs text-slate-400">
            Mostrando {currentPosts.length} de {sortedPosts.length} publicaciones • 10 por página
          </p>
        </div>

        {/* Filters and Sorting Controls */}
        <div className="flex items-center gap-2 flex-wrap">
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
              <option value="enlace">Enlaces</option>
              <option value="foto">Fotos / Infografías</option>
              <option value="post">Posts Estáticos</option>
            </select>
          </div>

          {/* Sort By Dropdown */}
          <div className="flex items-center gap-1.5 bg-slate-900 px-3 py-1.5 rounded-xl border border-slate-800 text-xs">
            <ArrowUpDown className="w-3.5 h-3.5 text-cyan-400" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="bg-transparent text-slate-200 font-semibold focus:outline-none cursor-pointer"
            >
              <option value="likes">Más Reacciones (Likes)</option>
              <option value="views">Más Visualizaciones</option>
              <option value="reach">Más Espectadores (Alcance)</option>
              <option value="comments">Más Comentadas</option>
              <option value="shares">Más Compartidas</option>
            </select>
          </div>
        </div>
      </div>

      {sortedPosts.length === 0 ? (
        <div className="p-8 text-center bg-slate-900/40 rounded-xl border border-slate-800/80 my-4">
          <AlertCircle className="w-8 h-8 text-slate-500 mx-auto mb-2" />
          <p className="text-sm font-semibold text-slate-300">No hay publicaciones disponibles para este período</p>
          <p className="text-xs text-slate-500 mt-1">Selecciona otro mes, trimestre o importa un reporte oficial de Meta Suite.</p>
        </div>
      ) : (
        <>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-300">
              <thead className="bg-slate-900/60 text-xs uppercase text-slate-400 border-b border-slate-800">
                <tr>
                  <th className="py-3 px-2 text-center">#</th>
                  <th className="py-3 px-2">Canal</th>
                  <th className="py-3 px-2">Origen</th>
                  <th className="py-3 px-2">Formato</th>
                  <th className="py-3 px-3">Contenido / Titular Real</th>
                  <th className="py-3 px-3 text-center">Visualizaciones</th>
                  <th className="py-3 px-3 text-center">Espectadores</th>
                  <th className="py-3 px-3 text-center">Likes</th>
                  <th className="py-3 px-2 text-center">Comentarios</th>
                  <th className="py-3 px-2 text-center">Shares</th>
                  <th className="py-3 px-3 text-center">Total Acciones</th>
                  <th className="py-3 px-3 text-right">Enlace</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {currentPosts.map((post, idx) => {
                  const globalIdx = startIndex + idx;
                  const displayUrl = post.url || `https://www.facebook.com/${post.id}`;
                  const displayText = post.text || 'Publicación de Once Noticias';
                  const buttonLabel = getPlatformButtonText(post.platform);
                  const totalActions = post.metrics?.total_interactions || ((post.metrics?.likes || 0) + (post.metrics?.comments || 0) + (post.metrics?.shares || 0));
                  const isMetaSuite = post.source_type === 'meta_suite';

                  return (
                    <tr key={post.id || globalIdx} className="hover:bg-slate-800/40 transition-colors text-xs">
                      <td className="py-3 px-2 text-center font-bold text-slate-500 whitespace-nowrap">
                        {globalIdx === 0 ? <span className="text-amber-400 font-extrabold text-sm">🥇 1</span> :
                         globalIdx === 1 ? <span className="text-slate-300 font-extrabold text-sm">🥈 2</span> :
                         globalIdx === 2 ? <span className="text-amber-600 font-extrabold text-sm">🥉 3</span> :
                         <span>#{globalIdx + 1}</span>}
                      </td>

                      <td className="py-3 px-2 whitespace-nowrap">
                        <span className={`px-2 py-0.5 text-[10px] font-bold rounded-md border uppercase ${getPlatformBadge(post.platform)}`}>
                          {post.platform}
                        </span>
                      </td>

                      <td className="py-3 px-2 whitespace-nowrap">
                        {isMetaSuite ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-950/60 text-emerald-400 border border-emerald-500/30 text-[10px] font-bold" title="Métricas oficiales de telemetría de Meta Suite">
                            <Database className="w-3 h-3" /> Meta Suite
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-amber-950/60 text-amber-300 border border-amber-500/30 text-[10px] font-bold" title="Sincronizado en tiempo real por la API">
                            <Sparkles className="w-3 h-3 text-amber-400" /> En Vivo (API)
                          </span>
                        )}
                      </td>

                      <td className="py-3 px-2 whitespace-nowrap">
                        <span className="px-2 py-0.5 text-[10px] font-semibold bg-slate-800 text-slate-300 rounded-md capitalize">
                          {post.type}
                        </span>
                      </td>

                      <td className="py-3 px-3 max-w-xs font-medium text-slate-200" title={displayText}>
                        <div className="line-clamp-2 leading-relaxed">
                          {displayText}
                        </div>
                      </td>

                      <td className="py-3 px-3 text-center whitespace-nowrap">
                        {(post.metrics?.views || post.metrics?.impressions || 0) > 0 ? (
                          <span className="inline-flex items-center gap-1 text-cyan-400 font-bold bg-cyan-950/40 px-2 py-0.5 rounded-md border border-cyan-500/20">
                            <Eye className="w-3 h-3" /> {(post.metrics?.views || post.metrics?.impressions).toLocaleString()}
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-slate-500 italic text-[11px]" title="Telemetría de visualizaciones disponible al exportar el reporte oficial de Meta Suite">
                            -- (Meta Suite)
                          </span>
                        )}
                      </td>

                      <td className="py-3 px-3 text-center whitespace-nowrap">
                        <span className="inline-flex items-center gap-1 text-indigo-300 font-bold bg-indigo-950/40 px-2 py-0.5 rounded-md border border-indigo-500/20">
                          <Users className="w-3 h-3" /> {(post.metrics?.reach || 0).toLocaleString()}
                        </span>
                      </td>

                      <td className="py-3 px-3 text-center whitespace-nowrap">
                        <span className="inline-flex items-center gap-1 text-emerald-400 font-bold bg-emerald-950/40 px-2 py-0.5 rounded-md border border-emerald-500/20">
                          <ThumbsUp className="w-3 h-3" /> {(post.metrics?.likes || 0).toLocaleString()}
                        </span>
                      </td>

                      <td className="py-3 px-2 text-center whitespace-nowrap">
                        <span className="inline-flex items-center gap-1 text-slate-300 font-semibold">
                          <MessageSquare className="w-3 h-3 text-slate-400" /> {(post.metrics?.comments || 0).toLocaleString()}
                        </span>
                      </td>

                      <td className="py-3 px-2 text-center whitespace-nowrap">
                        <span className="inline-flex items-center gap-1 text-purple-400 font-semibold">
                          <Share2 className="w-3 h-3" /> {(post.metrics?.shares || 0).toLocaleString()}
                        </span>
                      </td>

                      <td className="py-3 px-3 text-center whitespace-nowrap">
                        <span className="px-2.5 py-0.5 rounded-full font-extrabold bg-gradient-to-r from-emerald-950 to-indigo-950 text-emerald-300 border border-emerald-500/40">
                          ⚡ {totalActions.toLocaleString()}
                        </span>
                      </td>

                      <td className="py-3 px-3 text-right whitespace-nowrap">
                        <a
                          href={displayUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 hover:text-indigo-200 border border-indigo-500/40 font-bold transition-all group"
                        >
                          <span>{buttonLabel}</span>
                          <ExternalLink className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                        </a>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 mt-2 border-t border-slate-800/80 text-xs">
              <span className="text-slate-400 font-medium">
                Página <strong className="text-slate-200">{currentPage}</strong> de <strong className="text-slate-200">{totalPages}</strong> ({sortedPosts.length} publicaciones totales)
              </span>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                  className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-300 hover:text-white disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                >
                  <ChevronLeft className="w-4 h-4" />
                  <span>Anterior</span>
                </button>

                <div className="flex items-center gap-1 px-2">
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    let pageNum = i + 1;
                    if (totalPages > 5 && currentPage > 3) {
                      pageNum = Math.min(totalPages - 4 + i, currentPage - 2 + i);
                    }
                    return (
                      <button
                        key={pageNum}
                        onClick={() => setCurrentPage(pageNum)}
                        className={`w-7 h-7 rounded-lg font-bold transition-all ${
                          currentPage === pageNum
                            ? 'bg-indigo-600 text-white shadow-md shadow-indigo-500/30'
                            : 'bg-slate-900/60 text-slate-400 hover:text-slate-200 border border-slate-800'
                        }`}
                      >
                        {pageNum}
                      </button>
                    );
                  })}
                </div>

                <button
                  onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
                  disabled={currentPage === totalPages}
                  className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-300 hover:text-white disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                >
                  <span>Siguiente</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
