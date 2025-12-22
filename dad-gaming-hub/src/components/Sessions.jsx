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
    description: ''
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
      setFormData({ game: '', platform: '', maxPlayers: 4, scheduledFor: '', description: '' });
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
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <div className="text-white text-xl">Lädt Sessions...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold text-white">Gaming Sessions</h1>
          <button
            onClick={() => setShowCreateModal(true)}
            className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-6 py-3 rounded-lg font-semibold shadow-lg"
          >
            + Neue Session
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sessions.map(session => (
            <div key={session._id} className="bg-white rounded-2xl shadow-xl p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-xl font-bold text-gray-800">{session.game}</h3>
                  <p className="text-sm text-gray-600">{session.platform}</p>
                </div>
                {session.host._id === user?.id && (
                  <button
                    onClick={() => handleDelete(session._id)}
                    className="text-red-600 hover:text-red-800"
                  >
                    🗑️
                  </button>
                )}
              </div>

              {session.description && (
                <p className="text-gray-700 text-sm mb-4">{session.description}</p>
              )}

              <div className="space-y-2 text-sm mb-4">
                <p><strong>Host:</strong> {session.host.name}</p>
                <p><strong>Wann:</strong> {new Date(session.scheduledFor).toLocaleString('de-DE')}</p>
                <p><strong>Spieler:</strong> {session.participants.length}/{session.maxPlayers}</p>
              </div>

              <div className="flex flex-wrap gap-2 mb-4">
                {session.participants.map(p => (
                  <span key={p._id} className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">
                    {p.name}
                  </span>
                ))}
              </div>

              {session.participants.some(p => p._id === user?.id) ? (
                <div className="bg-green-50 text-green-700 px-4 py-2 rounded-lg text-center font-semibold">
                  ✓ Dabei
                </div>
              ) : session.participants.length >= session.maxPlayers ? (
                <div className="bg-gray-200 text-gray-600 px-4 py-2 rounded-lg text-center">
                  Voll
                </div>
              ) : (
                <button
                  onClick={() => handleJoin(session._id)}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg font-semibold"
                >
                  Beitreten
                </button>
              )}
            </div>
          ))}

          {sessions.length === 0 && (
            <div className="col-span-full text-center py-12">
              <p className="text-gray-400 text-lg">Keine Sessions vorhanden</p>
              <p className="text-gray-500 text-sm mt-2">Erstelle die erste Session!</p>
            </div>
          )}
        </div>
      </div>

      {/* Create Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl p-8 max-w-md w-full">
            <h2 className="text-2xl font-bold mb-6">Neue Gaming Session</h2>
            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Spiel</label>
                <input
                  type="text"
                  value={formData.game}
                  onChange={(e) => setFormData({ ...formData, game: e.target.value })}
                  className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Plattform</label>
                <select
                  value={formData.platform}
                  onChange={(e) => setFormData({ ...formData, platform: e.target.value })}
                  className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
                  required
                >
                  <option value="">Wählen...</option>
                  <option value="PC">PC</option>
                  <option value="PlayStation">PlayStation</option>
                  <option value="Xbox">Xbox</option>
                  <option value="Nintendo Switch">Nintendo Switch</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Max. Spieler</label>
                <input
                  type="number"
                  value={formData.maxPlayers}
                  onChange={(e) => setFormData({ ...formData, maxPlayers: parseInt(e.target.value) })}
                  min="2"
                  max="16"
                  className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Wann?</label>
                <input
                  type="datetime-local"
                  value={formData.scheduledFor}
                  onChange={(e) => setFormData({ ...formData, scheduledFor: e.target.value })}
                  className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Beschreibung</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows="3"
                  className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
                  placeholder="Optional..."
                />
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 py-3 rounded-lg font-semibold"
                >
                  Abbrechen
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white py-3 rounded-lg font-semibold"
                >
                  Erstellen
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
