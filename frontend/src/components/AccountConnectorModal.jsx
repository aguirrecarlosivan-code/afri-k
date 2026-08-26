import React, { useState } from 'react';
import { X, CheckCircle2, ShieldCheck, Key, RefreshCw, AlertCircle, Youtube, Video, Share2, Instagram, Facebook } from 'lucide-react';

export default function AccountConnectorModal({ isOpen, onClose, defaultPlatform = 'facebook', onCredentialsSaved }) {
  const [platform, setPlatform] = useState(defaultPlatform || 'facebook');
  const [loading, setLoading] = useState(false);
  const [statusMsg, setStatusMsg] = useState(null);

  // Form Fields
  const [fbToken, setFbToken] = useState('');
  const [fbAppId, setFbAppId] = useState('');
  const [fbAppSecret, setFbAppSecret] = useState('');

  const [igToken, setIgToken] = useState('');
  const [igAccountId, setIgAccountId] = useState('');

  const [ytApiKey, setYtApiKey] = useState('');
  const [ytChannelId, setYtChannelId] = useState('');

  const [ttToken, setTtToken] = useState('');
  const [ttClientKey, setTtClientKey] = useState('');

  if (!isOpen) return null;

  const handleSave = async (e) => {
    e.preventDefault();
    setLoading(true);
    setStatusMsg(null);

    let credentials = {};
    if (platform === 'facebook') {
      credentials = { access_token: fbToken, app_id: fbAppId, app_secret: fbAppSecret };
    } else if (platform === 'instagram') {
      credentials = { access_token: igToken, account_id: igAccountId };
    } else if (platform === 'youtube') {
      credentials = { api_key: ytApiKey, channel_id: ytChannelId };
    } else if (platform === 'tiktok') {
      credentials = { access_token: ttToken, client_key: ttClientKey };
    }

    try {
      const res = await fetch('/api/v1/connectors/save-credentials', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ platform, credentials }),
      }).then((r) => r.json());

      if (res.status === 'success') {
        setStatusMsg({ type: 'success', message: res.message || `API de ${platform.toUpperCase()} conectada con éxito a todo el entorno.` });
        if (onCredentialsSaved) {
          setTimeout(() => {
            onCredentialsSaved(platform);
            onClose();
          }, 1200);
        }
      } else {
        setStatusMsg({ type: 'error', message: res.detail || 'Error al validar las credenciales.' });
      }
    } catch (err) {
      setStatusMsg({ type: 'error', message: 'No se pudo comunicar con el servidor backend.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md">
      <div className="glass-panel w-full max-w-xl p-6 rounded-2xl border border-slate-700 shadow-2xl relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3 mb-4">
          <div className="p-3 rounded-2xl bg-gradient-to-tr from-indigo-600 to-blue-600 shadow-lg shadow-indigo-500/30">
            <ShieldCheck className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className="text-xl font-extrabold text-white">Centro de Conexión de APIs Oficiales</h3>
            <p className="text-xs text-slate-400">Vincula o actualiza credenciales que alimentarán todo el entorno de Once Noticias</p>
          </div>
        </div>

        {/* Platform Selector Tabs */}
        <div className="grid grid-cols-4 gap-2 my-4 p-1.5 bg-slate-900/80 rounded-xl border border-slate-800">
          <button
            type="button"
            onClick={() => { setPlatform('facebook'); setStatusMsg(null); }}
            className={`flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-bold transition-all ${
              platform === 'facebook' ? 'bg-blue-600 text-white shadow-md' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Facebook className="w-3.5 h-3.5" /> Facebook
          </button>
          <button
            type="button"
            onClick={() => { setPlatform('instagram'); setStatusMsg(null); }}
            className={`flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-bold transition-all ${
              platform === 'instagram' ? 'bg-pink-600 text-white shadow-md' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Instagram className="w-3.5 h-3.5" /> Instagram
          </button>
          <button
            type="button"
            onClick={() => { setPlatform('youtube'); setStatusMsg(null); }}
            className={`flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-bold transition-all ${
              platform === 'youtube' ? 'bg-red-600 text-white shadow-md' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Youtube className="w-3.5 h-3.5" /> YouTube
          </button>
          <button
            type="button"
            onClick={() => { setPlatform('tiktok'); setStatusMsg(null); }}
            className={`flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-bold transition-all ${
              platform === 'tiktok' ? 'bg-cyan-600 text-white shadow-md' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Video className="w-3.5 h-3.5" /> TikTok
          </button>
        </div>

        <form onSubmit={handleSave} className="space-y-4">
          {/* Dynamic Platform Inputs */}
          {platform === 'facebook' && (
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold uppercase text-slate-300 mb-1 flex items-center gap-1.5">
                  <Key className="w-3.5 h-3.5 text-blue-400" /> Page Access Token (Meta Graph API)
                </label>
                <input
                  type="password"
                  placeholder="EAAZAVGbBt..."
                  value={fbToken}
                  onChange={(e) => setFbToken(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-200 text-xs font-mono focus:border-blue-500 focus:outline-none"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">App ID (Opcional)</label>
                  <input
                    type="text"
                    placeholder="1782418682748283"
                    value={fbAppId}
                    onChange={(e) => setFbAppId(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-200 text-xs font-mono focus:border-blue-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">App Secret (Opcional)</label>
                  <input
                    type="password"
                    placeholder="f1018fc247..."
                    value={fbAppSecret}
                    onChange={(e) => setFbAppSecret(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-200 text-xs font-mono focus:border-blue-500 focus:outline-none"
                  />
                </div>
              </div>
            </div>
          )}

          {platform === 'instagram' && (
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold uppercase text-slate-300 mb-1 flex items-center gap-1.5">
                  <Key className="w-3.5 h-3.5 text-pink-400" /> Instagram User/Business Access Token
                </label>
                <input
                  type="password"
                  placeholder="IGQWR..."
                  value={igToken}
                  onChange={(e) => setIgToken(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-200 text-xs font-mono focus:border-pink-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">Instagram Business Account ID</label>
                <input
                  type="text"
                  placeholder="17841400..."
                  value={igAccountId}
                  onChange={(e) => setIgAccountId(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-200 text-xs font-mono focus:border-pink-500 focus:outline-none"
                />
              </div>
            </div>
          )}

          {platform === 'youtube' && (
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold uppercase text-slate-300 mb-1 flex items-center gap-1.5">
                  <Key className="w-3.5 h-3.5 text-red-400" /> Google Cloud YouTube Data API v3 Key
                </label>
                <input
                  type="password"
                  placeholder="AIzaSy..."
                  value={ytApiKey}
                  onChange={(e) => setYtApiKey(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-200 text-xs font-mono focus:border-red-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">Channel ID de Once Noticias</label>
                <input
                  type="text"
                  placeholder="UC_x5XG1OV2P6uZZ5FSM9Ttw"
                  value={ytChannelId}
                  onChange={(e) => setYtChannelId(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-200 text-xs font-mono focus:border-red-500 focus:outline-none"
                />
              </div>
            </div>
          )}

          {platform === 'tiktok' && (
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold uppercase text-slate-300 mb-1 flex items-center gap-1.5">
                  <Key className="w-3.5 h-3.5 text-cyan-400" /> TikTok Display API Access Token
                </label>
                <input
                  type="password"
                  placeholder="act.exampleToken123..."
                  value={ttToken}
                  onChange={(e) => setTtToken(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-200 text-xs font-mono focus:border-cyan-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">Client Key / App Key</label>
                <input
                  type="text"
                  placeholder="aw1234567..."
                  value={ttClientKey}
                  onChange={(e) => setTtClientKey(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-200 text-xs font-mono focus:border-cyan-500 focus:outline-none"
                />
              </div>
            </div>
          )}

          {statusMsg && (
            <div
              className={`p-3 rounded-xl text-xs font-medium flex items-center gap-2 ${
                statusMsg.type === 'success'
                  ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                  : 'bg-rose-500/10 text-rose-400 border border-rose-500/30'
              }`}
            >
              {statusMsg.type === 'success' ? <CheckCircle2 className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
              <span>{statusMsg.message}</span>
            </div>
          )}

          <div className="pt-3 border-t border-slate-800 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 text-white text-xs font-bold transition-all shadow-md shadow-indigo-500/20 disabled:opacity-50"
            >
              {loading && <RefreshCw className="w-4 h-4 animate-spin" />}
              <span>Guardar & Aplicar al Entorno</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
