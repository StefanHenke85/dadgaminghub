import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { sessionAPI } from '../services/api';

export default function Sessions() {
  const { user } = useAuth();
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [formData, setFormData] = useState({
    game: '',
    platform: '',
    maxPlayers: 4,
    scheduledFor: '',
    description: '',
    discordWebhookUrl: ''
  });

  useEffect(() => {
    loadSessions();
  }, []);

  const loadSessions = async () => {
    try {
      const response = await sessionAPI.getSessions();
      setSessions(response.data);
    } catch (error) {
      console.error('Error loading sessions:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await sessionAPI.createSession(formData);
      setShowCreateModal(false);
      setFormData({ game: '', platform: '', maxPlayers: 4, scheduledFor: '', description: '', discordWebhookUrl: '' });
      loadSessions();
    } catch (error) {
      alert(error.response?.data?.error || 'Fehler beim Erstellen');
    }
  };

  const handleJoin = async (sessionId) => {
    try {
      await sessionAPI.joinSession(sessionId);
      loadSessions();
    } catch (error) {
      alert(error.response?.data?.error || 'Fehler beim Beitreten');
    }
  };

  const handleDelete = async (sessionId) => {
    if (window.confirm('Session wirklich löschen?')) {
      try {
        await sessionAPI.deleteSession(sessionId);
        loadSessions();
      } catch (error) {
        alert(error.response?.data?.error || 'Fehler beim Löschen');
      }
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0e27] flex items-center justify-center">
        <div className="relative">
          <div className="w-16 h-16 border-4 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin"></div>
          <div className="absolute inset-0 w-16 h-16 border-4 border-purple-500/20 border-t-purple-500 rounded-full animate-spin" style={{animationDuration: '1.5s', animationDirection: 'reverse'}}></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0e27] text-white pt-24 pb-12 px-4 relative overflow-hidden">
      {/* Background Effects */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute inset-0 opacity-5">
          <div className="absolute top-10 right-10 w-40 h-40 bg-contain bg-no-repeat opacity-40" style={{backgroundImage: "url('https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=200&h=200&fit=crop')"}}></div>
          <div className="absolute bottom-20 left-20 w-36 h-36 bg-contain bg-no-repeat opacity-30" style={{backgroundImage: "url('https://images.unsplash.com/photo-1538481199705-c710c4e965fc?w=200&h=200&fit=crop')"}}></div>
        </div>
        <div className="absolute top-0 right-1/4 w-125 h-125 bg-indigo-600/10 rounded-full blur-[150px] animate-pulse"></div>
        <div className="absolute bottom-0 left-1/4 w-125 h-125 bg-purple-600/10 rounded-full blur-[150px] animate-pulse" style={{animationDelay: '1s'}}></div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-10">
          <div>
            <h1 className="text-5xl font-black uppercase italic tracking-tighter mb-2">
              <span className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-transparent bg-clip-text">GAMING</span>
              <span className="text-white"> SESSIONS</span>
            </h1>
            <p className="text-slate-400 font-medium">Organisiere epische Zock-Sessions mit deinem Squad</p>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 hover:from-indigo-500 hover:via-purple-500 hover:to-pink-500 text-white px-8 py-4 rounded-2xl font-black uppercase tracking-wider shadow-xl shadow-indigo-500/20 hover:shadow-indigo-500/40 transition-all hover:scale-105"
          >
            ⚡ Neue Session
          </button>
        </div>

        {/* Sessions Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sessions.map(session => (
            <div key={session.id} className="group relative">
              {/* Glow Effect */}
              <div className="absolute -inset-0.5 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 rounded-3xl opacity-0 group-hover:opacity-30 blur transition-all duration-500"></div>

              {/* Card */}
              <div className="relative bg-slate-900/80 backdrop-blur-xl border border-slate-800/50 rounded-3xl p-6 transition-all duration-300 group-hover:border-indigo-500/30">

                {/* Header */}
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <h3 className="text-xl font-black text-white uppercase italic tracking-tight mb-1">{session.game}</h3>
                    <div className="flex items-center gap-2">
                      <span className="text-indigo-400 text-xs font-bold uppercase">🎮 {session.platform}</span>
                    </div>
                  </div>
                  {session.host?.id === user?.id && (
                    <button
                      onClick={() => handleDelete(session.id)}
                      className="w-10 h-10 flex items-center justify-center bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-xl transition-all border border-red-500/20"
                      title="Session löschen"
                    >
                      🗑️
                    </button>
                  )}
                </div>

                {/* Description */}
                {session.description && (
                  <p className="text-slate-400 text-sm mb-4 line-clamp-2 italic">"{session.description}"</p>
                )}

                {/* Info Grid */}
                <div className="space-y-3 mb-4 text-sm">
                  <div className="flex items-center gap-2 text-slate-300">
                    <span className="text-indigo-400 font-bold">👑 Host:</span>
                    <span className="font-bold">{session.host?.name || 'Unknown'}</span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-300">
                    <span className="text-purple-400 font-bold">📅 Wann:</span>
                    <span className="font-medium">{new Date(session.scheduled_for).toLocaleString('de-DE', {
                      day: '2-digit',
                      month: '2-digit',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-pink-400 font-bold">👥 Spieler:</span>
                    <span className="font-bold text-white">{session.participants?.length || 0}/{session.max_players}</span>
                  </div>
                </div>

                {/* Participants */}
                <div className="flex flex-wrap gap-2 mb-4 min-h-[2rem]">
                  {session.participants?.map(p => (
                    <span key={p.id} className="px-3 py-1 bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 text-xs rounded-lg font-bold uppercase">
                      {p.name}
                    </span>
                  ))}
                </div>

                {/* Action Button */}
                {session.participants?.some(p => p.id === user?.id) ? (
                  <div className="bg-green-500/20 border border-green-500/50 text-green-400 px-4 py-3 rounded-2xl text-center font-black uppercase text-sm">
                    ✓ Du bist dabei
                  </div>
                ) : (session.participants?.length || 0) >= session.max_players ? (
                  <div className="bg-slate-800/50 border border-slate-700/50 text-slate-500 px-4 py-3 rounded-2xl text-center font-black uppercase text-sm">
                    Session voll
                  </div>
                ) : (
                  <button
                    onClick={() => handleJoin(session.id)}
                    className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white py-3 rounded-2xl font-black uppercase text-sm tracking-wider transition-all shadow-lg shadow-indigo-500/20 hover:shadow-indigo-500/40"
                  >
                    ⚡ Beitreten
                  </button>
                )}
              </div>
            </div>
          ))}

          {/* Empty State */}
          {sessions.length === 0 && (
            <div className="col-span-full text-center py-20">
              <div className="text-6xl mb-4 opacity-20">🎮</div>
              <h3 className="text-2xl font-black text-slate-400 uppercase mb-2">Keine Sessions vorhanden</h3>
              <p className="text-slate-600">Erstelle die erste Gaming-Session für dein Squad!</p>
            </div>
          )}
        </div>
      </div>

      {/* Create Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
          <div className="relative max-w-lg w-full">
            {/* Glow Effect */}
            <div className="absolute -inset-1 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 rounded-[3rem] opacity-30 blur-2xl"></div>

            {/* Modal Content */}
            <div className="relative bg-slate-900/95 backdrop-blur-xl border border-slate-800/50 rounded-[3rem] p-8">

              {/* Header */}
              <div className="flex justify-between items-start mb-8">
                <div>
                  <h2 className="text-3xl font-black uppercase italic tracking-tight mb-2">
                    <span className="bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 text-transparent bg-clip-text">
                      Neue Session
                    </span>
                  </h2>
                  <p className="text-slate-400 text-sm">Organisiere eine Gaming-Session</p>
                </div>
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="w-10 h-10 bg-slate-800/50 hover:bg-slate-700/50 text-slate-400 rounded-xl flex items-center justify-center transition-all"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleCreate} className="space-y-5">
                {/* Game */}
                <div>
                  <label className="block text-xs font-black text-slate-400 uppercase tracking-wider mb-2">Spiel</label>
                  <input
                    type="text"
                    value={formData.game}
                    onChange={(e) => setFormData({ ...formData, game: e.target.value })}
                    className="w-full px-5 py-3 bg-slate-800/50 border border-slate-700/50 rounded-2xl outline-none focus:border-indigo-500/50 transition-all text-white font-medium"
                    placeholder="z.B. Call of Duty, FIFA"
                    required
                  />
                </div>

                {/* Platform */}
                <div>
                  <label className="block text-xs font-black text-slate-400 uppercase tracking-wider mb-2">Plattform</label>
                  <select
                    value={formData.platform}
                    onChange={(e) => setFormData({ ...formData, platform: e.target.value })}
                    className="w-full px-5 py-3 bg-slate-800/50 border border-slate-700/50 rounded-2xl outline-none focus:border-indigo-500/50 transition-all text-white font-medium"
                    required
                  >
                    <option value="">Wählen...</option>
                    <option value="PC">💻 PC</option>
                    <option value="PlayStation">🎮 PlayStation</option>
                    <option value="Xbox">🎯 Xbox</option>
                    <option value="Nintendo Switch">🕹️ Nintendo Switch</option>
                  </select>
                </div>

                {/* Max Players */}
                <div>
                  <label className="block text-xs font-black text-slate-400 uppercase tracking-wider mb-2">Max. Spieler</label>
                  <input
                    type="number"
                    value={formData.maxPlayers}
                    onChange={(e) => setFormData({ ...formData, maxPlayers: parseInt(e.target.value) })}
                    min="2"
                    max="16"
                    className="w-full px-5 py-3 bg-slate-800/50 border border-slate-700/50 rounded-2xl outline-none focus:border-indigo-500/50 transition-all text-white font-medium"
                    required
                  />
                </div>

                {/* Scheduled Time */}
                <div>
                  <label className="block text-xs font-black text-slate-400 uppercase tracking-wider mb-2">Wann?</label>
                  <input
                    type="datetime-local"
                    value={formData.scheduledFor}
                    onChange={(e) => setFormData({ ...formData, scheduledFor: e.target.value })}
                    className="w-full px-5 py-3 bg-slate-800/50 border border-slate-700/50 rounded-2xl outline-none focus:border-indigo-500/50 transition-all text-white font-medium"
                    required
                  />
                </div>

                {/* Description */}
                <div>
                  <label className="block text-xs font-black text-slate-400 uppercase tracking-wider mb-2">Beschreibung</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows="3"
                    className="w-full px-5 py-3 bg-slate-800/50 border border-slate-700/50 rounded-2xl outline-none focus:border-indigo-500/50 transition-all text-white font-medium resize-none"
                    placeholder="Optional: Was habt ihr vor?"
                  />
                </div>

                {/* Discord Webhook URL */}
                <div className="pt-4 border-t border-slate-700/50">
                  <label className="block text-xs font-black text-slate-400 uppercase tracking-wider mb-2">
                    💬 Discord Webhook URL (Optional)
                  </label>
                  <input
                    type="url"
                    value={formData.discordWebhookUrl}
                    onChange={(e) => setFormData({ ...formData, discordWebhookUrl: e.target.value })}
                    className="w-full px-5 py-3 bg-slate-800/50 border border-slate-700/50 rounded-2xl outline-none focus:border-indigo-500/50 transition-all text-white font-medium"
                    placeholder="https://discord.com/api/webhooks/..."
                  />
                  <p className="text-xs text-slate-500 mt-2 italic">
                    📌 Wenn angegeben, wird eine Nachricht mit den Session-Details automatisch an deinen Discord-Server gesendet!
                  </p>
                </div>

                {/* Buttons */}
                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowCreateModal(false)}
                    className="flex-1 bg-slate-800/50 hover:bg-slate-700/50 text-slate-300 py-4 rounded-2xl font-black uppercase tracking-wider transition-all"
                  >
                    Abbrechen
                  </button>
                  <button
                    type="submit"
                    className="flex-1 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 hover:from-indigo-500 hover:via-purple-500 hover:to-pink-500 text-white py-4 rounded-2xl font-black uppercase tracking-wider shadow-xl shadow-indigo-500/20 hover:shadow-indigo-500/40 transition-all"
                  >
                    ⚡ Erstellen
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
