import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../context/AuthContext';
import { userAPI } from '../services/api';

export default function Dashboard() {
  const { user } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [platformFilter, setPlatformFilter] = useState("All");
  const [onlineFilter, setOnlineFilter] = useState("All");
  const [selectedUser, setSelectedUser] = useState(null);

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      const response = await userAPI.getUsers();
      setUsers(response.data);
    } catch (error) {
      console.error('Error loading users:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredUsers = useMemo(() => {
    return users.filter(u => {
      // Don't show current user
      if (u._id === user?.id) return false;

      const matchesSearch =
        u.games?.some(game => game.toLowerCase().includes(searchTerm.toLowerCase())) ||
        u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.username.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesPlatform = platformFilter === "All" || u.platforms?.includes(platformFilter);

      const matchesOnline = onlineFilter === "All" ||
                            (onlineFilter === "Online" && u.online) ||
                            (onlineFilter === "Offline" && !u.online);

      return matchesSearch && matchesPlatform && matchesOnline;
    });
  }, [users, searchTerm, platformFilter, onlineFilter, user]);

  const getPlatformIcon = (platform) => {
    const icons = {
      'PC': '💻',
      'PS5': '🎮',
      'Xbox': '🎯',
      'Switch': '🕹️'
    };
    return icons[platform] || '🎮';
  };

  const handleSendRequest = async (targetUser) => {
    try {
      await userAPI.sendFriendRequest(targetUser._id);
      alert(`Freundschaftsanfrage an ${targetUser.name} gesendet!`);
      setSelectedUser(null);
    } catch (error) {
      alert(error.response?.data?.error || 'Fehler beim Senden der Anfrage');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500"></div>
          <p className="mt-4 text-white text-lg">Lädt Benutzer...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 font-sans pb-8">
      <main className="max-w-7xl mx-auto p-6">
        {/* Filter Section */}
        <div className="bg-white/95 backdrop-blur-sm p-6 rounded-2xl shadow-xl mb-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Suche</label>
              <input
                type="text"
                placeholder="Spiel oder Name suchen..."
                className="border-2 border-gray-300 focus:border-blue-500 focus:outline-none p-3 rounded-lg w-full transition-all"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Plattform</label>
              <select
                className="border-2 border-gray-300 focus:border-blue-500 focus:outline-none p-3 rounded-lg bg-white w-full transition-all"
                value={platformFilter}
                onChange={(e) => setPlatformFilter(e.target.value)}
              >
                <option value="All">Alle Plattformen</option>
                <option value="PC">💻 PC</option>
                <option value="PS5">🎮 PS5</option>
                <option value="Xbox">🎯 Xbox</option>
                <option value="Switch">🕹️ Switch</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Status</label>
              <select
                className="border-2 border-gray-300 focus:border-blue-500 focus:outline-none p-3 rounded-lg bg-white w-full transition-all"
                value={onlineFilter}
                onChange={(e) => setOnlineFilter(e.target.value)}
              >
                <option value="All">Alle</option>
                <option value="Online">🟢 Online</option>
                <option value="Offline">⚫ Offline</option>
              </select>
            </div>
          </div>
          <div className="mt-4 text-sm text-gray-600 text-center">
            {filteredUsers.length} {filteredUsers.length === 1 ? 'Vater gefunden' : 'Väter gefunden'}
          </div>
        </div>

        {/* User Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredUsers.map(targetUser => (
            <div
              key={targetUser._id}
              className="bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden border-t-4 border-blue-500 hover:scale-105"
            >
              {/* Header with Online Status */}
              <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-5 border-b border-gray-200">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h2 className="text-xl font-bold text-gray-800">{targetUser.name}</h2>
                    <p className="text-sm text-gray-600">@{targetUser.username}</p>
                    <p className="text-xs text-gray-600">{targetUser.age} Jahre · {targetUser.kids} {targetUser.kids === 1 ? 'Kind' : 'Kinder'}</p>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <div className={`flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold ${
                      targetUser.online
                        ? 'bg-green-100 text-green-700'
                        : 'bg-gray-200 text-gray-600'
                    }`}>
                      <div className={`h-2 w-2 rounded-full ${targetUser.online ? 'bg-green-500 animate-pulse' : 'bg-gray-400'}`}></div>
                      {targetUser.online ? 'Online' : 'Offline'}
                    </div>
                  </div>
                </div>
                <p className="text-sm text-gray-700 italic">{targetUser.currentActivity}</p>
              </div>

              {/* Body */}
              <div className="p-5">
                {/* Platforms */}
                {targetUser.platforms && targetUser.platforms.length > 0 && (
                  <div className="mb-4">
                    <h3 className="text-xs font-semibold text-gray-500 uppercase mb-2">Plattformen</h3>
                    <div className="flex gap-2 flex-wrap">
                      {targetUser.platforms.map(plat => (
                        <span
                          key={plat}
                          className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium"
                        >
                          {getPlatformIcon(plat)} {plat}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Games */}
                {targetUser.games && targetUser.games.length > 0 && (
                  <div className="mb-4">
                    <h3 className="text-xs font-semibold text-gray-500 uppercase mb-2">Spiele</h3>
                    <div className="flex flex-wrap gap-1">
                      {targetUser.games.map((game, idx) => (
                        <span
                          key={idx}
                          className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded"
                        >
                          {game}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Availability */}
                {targetUser.availability && targetUser.availability.length > 0 && (
                  <div className="mb-4">
                    <h3 className="text-xs font-semibold text-gray-500 uppercase mb-2">Verfügbarkeit</h3>
                    <div className="flex gap-1 mb-2">
                      {['Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa', 'So'].map(day => (
                        <div
                          key={day}
                          className={`flex-1 text-center py-1 rounded text-xs font-semibold ${
                            targetUser.availability.includes(day)
                              ? 'bg-green-500 text-white'
                              : 'bg-gray-200 text-gray-400'
                          }`}
                        >
                          {day}
                        </div>
                      ))}
                    </div>
                    {targetUser.timePreference && (
                      <p className="text-sm text-gray-600">⏰ {targetUser.timePreference}</p>
                    )}
                  </div>
                )}

                {/* Contact Info */}
                {targetUser.contacts && Object.keys(targetUser.contacts).some(k => targetUser.contacts[k]) && (
                  <div className="mb-4 text-xs space-y-1 bg-gray-50 p-3 rounded-lg">
                    {targetUser.contacts.discord && <p className="text-gray-700"><span className="font-semibold">Discord:</span> {targetUser.contacts.discord}</p>}
                    {targetUser.contacts.psn && <p className="text-gray-700"><span className="font-semibold">PSN:</span> {targetUser.contacts.psn}</p>}
                    {targetUser.contacts.xbox && <p className="text-gray-700"><span className="font-semibold">Xbox:</span> {targetUser.contacts.xbox}</p>}
                    {targetUser.contacts.steam && <p className="text-gray-700"><span className="font-semibold">Steam:</span> {targetUser.contacts.steam}</p>}
                    {targetUser.contacts.switch && <p className="text-gray-700"><span className="font-semibold">Switch:</span> {targetUser.contacts.switch}</p>}
                  </div>
                )}

                {/* Action Button */}
                <button
                  onClick={() => setSelectedUser(targetUser)}
                  className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white py-3 rounded-lg font-semibold transition-all duration-300 shadow-md hover:shadow-xl"
                >
                  Anfrage senden
                </button>
              </div>
            </div>
          ))}

          {filteredUsers.length === 0 && (
            <div className="col-span-full text-center py-12">
              <p className="text-gray-400 text-lg">Keine Väter gefunden</p>
              <p className="text-gray-500 text-sm mt-2">Versuche andere Filter oder Suchbegriffe</p>
            </div>
          )}
        </div>

        {/* Modal */}
        {selectedUser && (
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50"
            onClick={() => setSelectedUser(null)}
          >
            <div
              className="bg-white rounded-2xl p-8 max-w-md w-full shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <h2 className="text-2xl font-bold mb-4 text-gray-800">Anfrage an {selectedUser.name}</h2>
              <p className="text-gray-600 mb-6">
                Möchtest du {selectedUser.name} eine Freundschaftsanfrage senden? Du kannst dann direkt über die Plattformen Kontakt aufnehmen.
              </p>

              {selectedUser.contacts && (
                <div className="space-y-3 mb-6">
                  {selectedUser.contacts.discord && (
                    <div className="bg-indigo-50 p-3 rounded-lg">
                      <p className="text-sm font-semibold text-indigo-900">Discord</p>
                      <p className="text-indigo-700">{selectedUser.contacts.discord}</p>
                    </div>
                  )}
                  {selectedUser.contacts.psn && (
                    <div className="bg-blue-50 p-3 rounded-lg">
                      <p className="text-sm font-semibold text-blue-900">PlayStation Network</p>
                      <p className="text-blue-700">{selectedUser.contacts.psn}</p>
                    </div>
                  )}
                  {selectedUser.contacts.xbox && (
                    <div className="bg-green-50 p-3 rounded-lg">
                      <p className="text-sm font-semibold text-green-900">Xbox Live</p>
                      <p className="text-green-700">{selectedUser.contacts.xbox}</p>
                    </div>
                  )}
                  {selectedUser.contacts.steam && (
                    <div className="bg-gray-50 p-3 rounded-lg">
                      <p className="text-sm font-semibold text-gray-900">Steam</p>
                      <p className="text-gray-700">{selectedUser.contacts.steam}</p>
                    </div>
                  )}
                  {selectedUser.contacts.switch && (
                    <div className="bg-red-50 p-3 rounded-lg">
                      <p className="text-sm font-semibold text-red-900">Nintendo Switch</p>
                      <p className="text-red-700">{selectedUser.contacts.switch}</p>
                    </div>
                  )}
                </div>
              )}

              <div className="flex gap-3">
                <button
                  onClick={() => setSelectedUser(null)}
                  className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 py-3 rounded-lg font-semibold transition-all"
                >
                  Abbrechen
                </button>
                <button
                  onClick={() => handleSendRequest(selectedUser)}
                  className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white py-3 rounded-lg font-semibold transition-all"
                >
                  Anfrage senden
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
