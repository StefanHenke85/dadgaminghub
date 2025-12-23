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
      const matchesSearch =
        u.games?.some(game => game.toLowerCase().includes(searchTerm.toLowerCase())) ||
        u.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.username?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesPlatform = platformFilter === "All" || u.platforms?.includes(platformFilter);
      const matchesOnline = onlineFilter === "All" ||
                            (onlineFilter === "Online" && u.online) ||
                            (onlineFilter === "Offline" && !u.online);
      return matchesSearch && matchesPlatform && matchesOnline;
    });
  }, [users, searchTerm, platformFilter, onlineFilter]);

  const getPlatformIcon = (platform) => {
    const icons = { 'PC': '💻', 'PS5': '🎮', 'Xbox': '🎯', 'Switch': '🕹️' };
    return icons[platform] || '🎮';
  };

  const handleSendRequest = async (targetUser) => {
    try {
      const userId = targetUser.id || targetUser._id;
      if (!userId) {
        alert('User ID fehlt');
        return;
      }
      await userAPI.sendFriendRequest(userId);
      alert(`Anfrage an ${targetUser.name} wurde gesendet!`);
      setSelectedUser(null);
    } catch (error) {
      console.error('Friend request error:', error);
      alert(error.response?.data?.error || 'Fehler beim Senden');
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
    <div className="min-h-screen bg-[#0a0e27] text-white font-sans pb-12 pt-24 relative overflow-hidden">
      {/* Epic Background Effects */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        {/* Gaming Images Background */}
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-10 left-10 w-64 h-64 bg-contain bg-no-repeat opacity-60" style={{backgroundImage: "url('https://images.unsplash.com/photo-1511512578047-dfb367046420?w=400&h=400&fit=crop')"}}></div>
          <div className="absolute top-40 right-20 w-72 h-72 bg-contain bg-no-repeat opacity-50" style={{backgroundImage: "url('https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=400&h=400&fit=crop')"}}></div>
          <div className="absolute bottom-20 left-1/4 w-64 h-64 bg-contain bg-no-repeat opacity-55" style={{backgroundImage: "url('https://images.unsplash.com/photo-1542751371-adc38448a05e?w=400&h=400&fit=crop')"}}></div>
          <div className="absolute top-1/3 right-1/3 w-60 h-60 bg-contain bg-no-repeat opacity-45" style={{backgroundImage: "url('https://images.unsplash.com/photo-1552820728-8b83bb6b773f?w=400&h=400&fit=crop')"}}></div>
          <div className="absolute bottom-40 right-10 w-72 h-72 bg-contain bg-no-repeat opacity-50" style={{backgroundImage: "url('https://images.unsplash.com/photo-1538481199705-c710c4e965fc?w=400&h=400&fit=crop')"}}></div>
        </div>

        {/* Gradient Blobs */}
        <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-indigo-600/10 rounded-full blur-[150px] animate-pulse"></div>
        <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-purple-600/10 rounded-full blur-[150px] animate-pulse" style={{animationDelay: '1s'}}></div>
        <div className="absolute top-1/2 left-1/2 w-[400px] h-[400px] bg-pink-600/5 rounded-full blur-[120px] animate-pulse" style={{animationDelay: '2s'}}></div>
      </div>

      <main className="relative z-10 max-w-7xl mx-auto px-4 md:px-6">

        {/* Hero Header */}
        <div className="mb-12 text-center">
          <h1 className="text-6xl md:text-7xl font-black uppercase italic tracking-tighter mb-4">
            <span className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-transparent bg-clip-text animate-gradient">
              SQUAD
            </span>
            <span className="text-white">FINDER</span>
          </h1>
          <p className="text-slate-400 text-lg font-medium">
            Finde deinen perfekten Gaming-Partner für epische Late-Night-Sessions
          </p>
          <div className="mt-6 flex items-center justify-center gap-3">
            <div className="px-4 py-2 bg-green-500/10 border border-green-500/30 rounded-full text-green-400 text-sm font-bold">
              <span className="inline-block w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></span>
              {filteredUsers.filter(u => u.online).length} Online
            </div>
            <div className="px-4 py-2 bg-indigo-500/10 border border-indigo-500/30 rounded-full text-indigo-400 text-sm font-bold">
              {filteredUsers.length} Dads gefunden
            </div>
          </div>
        </div>

        {/* Info Banner */}
        <div className="mb-10 relative group">
          <div className="absolute -inset-1 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 rounded-3xl opacity-20 group-hover:opacity-30 blur-xl transition-all duration-500"></div>
          <div className="relative bg-slate-900/90 backdrop-blur-xl border border-slate-800/50 rounded-3xl p-8 md:p-10">
            <div className="flex flex-col md:flex-row items-center gap-6">
              <div className="flex-shrink-0">
                <div className="w-20 h-20 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-2xl flex items-center justify-center text-4xl shadow-xl shadow-indigo-500/30">
                  🎮
                </div>
              </div>
              <div className="flex-1 text-center md:text-left">
                <h2 className="text-3xl font-black uppercase italic tracking-tight mb-3 text-white">
                  Willkommen im Dad Gaming Hub!
                </h2>
                <p className="text-slate-300 text-base leading-relaxed mb-4">
                  <span className="text-indigo-400 font-bold">Exklusiv für Väter</span>, die ihre Gaming-Leidenschaft leben wollen.
                  Hier findest du Gleichgesinnte für deine Lieblingsspiele, organisierst Sessions und chattst mit deinem Squad.
                  <span className="text-purple-400 font-bold"> Keine Toxizität, nur entspanntes Zocken</span> – wenn die Kids im Bett sind.
                </p>
                <div className="flex flex-wrap gap-2 justify-center md:justify-start">
                  <span className="px-3 py-1 bg-indigo-500/10 border border-indigo-500/30 rounded-lg text-indigo-300 text-xs font-bold">#DadLife</span>
                  <span className="px-3 py-1 bg-purple-500/10 border border-purple-500/30 rounded-lg text-purple-300 text-xs font-bold">#NoToxic</span>
                  <span className="px-3 py-1 bg-pink-500/10 border border-pink-500/30 rounded-lg text-pink-300 text-xs font-bold">#LateNightGaming</span>
                </div>
              </div>
              <div className="flex-shrink-0">
                <button
                  onClick={() => window.location.href = '/sessions'}
                  className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 hover:from-indigo-500 hover:via-purple-500 hover:to-pink-500 text-white px-8 py-4 rounded-2xl font-black uppercase tracking-wider shadow-xl shadow-indigo-500/30 hover:shadow-indigo-500/50 transition-all hover:scale-105"
                >
                  ⚡ Session erstellen
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Search & Filters */}
        <div className="mb-10 flex flex-col md:flex-row gap-4">
          {/* Search Bar */}
          <div className="flex-1 relative group">
            <div className="absolute inset-0 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 rounded-2xl opacity-0 group-hover:opacity-20 blur-xl transition-all duration-500"></div>
            <input
              type="text"
              placeholder="🔍 Suche nach Namen, Games..."
              className="relative w-full px-6 py-4 bg-slate-900/80 backdrop-blur-xl border border-slate-800/50 rounded-2xl outline-none focus:border-indigo-500/50 transition-all text-white placeholder-slate-500 font-medium"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {/* Platform Filter */}
          <div className="flex gap-2 overflow-x-auto pb-2 md:pb-0">
            {['All', 'PC', 'PS5', 'Xbox', 'Switch'].map(platform => (
              <button
                key={platform}
                onClick={() => setPlatformFilter(platform)}
                className={`px-6 py-4 rounded-2xl text-sm font-black uppercase tracking-wider whitespace-nowrap transition-all ${
                  platformFilter === platform
                    ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg shadow-indigo-500/30'
                    : 'bg-slate-900/50 text-slate-400 border border-slate-800/50 hover:border-indigo-500/30 hover:text-white'
                }`}
              >
                {platform === 'All' ? '🌐 Alle' : `${getPlatformIcon(platform)} ${platform}`}
              </button>
            ))}
          </div>

          {/* Online Filter */}
          <div className="flex gap-2">
            {['All', 'Online', 'Offline'].map(status => (
              <button
                key={status}
                onClick={() => setOnlineFilter(status)}
                className={`px-6 py-4 rounded-2xl text-sm font-black uppercase tracking-wider transition-all ${
                  onlineFilter === status
                    ? 'bg-gradient-to-r from-green-600 to-emerald-600 text-white shadow-lg shadow-green-500/30'
                    : 'bg-slate-900/50 text-slate-400 border border-slate-800/50 hover:border-green-500/30 hover:text-white'
                }`}
              >
                {status === 'Online' ? '🟢' : status === 'Offline' ? '⚫' : '🌐'} {status}
              </button>
            ))}
          </div>
        </div>

        {/* Player Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredUsers.map(u => (
            <div
              key={u.id || u._id}
              onClick={() => setSelectedUser(u)}
              className="group relative cursor-pointer"
            >
              {/* Glow Effect on Hover */}
              <div className="absolute -inset-0.5 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 rounded-3xl opacity-0 group-hover:opacity-40 blur transition-all duration-500"></div>

              {/* Card */}
              <div className="relative bg-slate-900/80 backdrop-blur-xl border border-slate-800/50 group-hover:border-indigo-500/30 rounded-3xl p-6 transition-all duration-300 group-hover:translate-y-[-4px]">

                {/* Online Status Badge */}
                {u.online && (
                  <div className="absolute top-4 right-4 px-3 py-1 bg-green-500/20 border border-green-500/50 rounded-full text-green-400 text-xs font-black uppercase flex items-center gap-1">
                    <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                    Online
                  </div>
                )}

                {/* User Info */}
                <div className="flex items-center gap-4 mb-4">
                  <div className="relative">
                    <div className="w-16 h-16 bg-slate-800 rounded-2xl overflow-hidden border-2 border-slate-700 group-hover:border-indigo-500/50 transition-all">
                      <img
                        src={u.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${u.username}`}
                        alt={u.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    {u.online && (
                      <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-500 border-2 border-slate-900 rounded-full"></div>
                    )}
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-black text-white uppercase italic tracking-tight group-hover:text-transparent group-hover:bg-gradient-to-r group-hover:from-indigo-400 group-hover:to-purple-400 group-hover:bg-clip-text transition-all">
                      {u.name}
                    </h3>
                    <p className="text-indigo-400 text-xs font-bold uppercase tracking-wider">@{u.username}</p>
                  </div>
                </div>

                {/* Bio */}
                <p className="text-slate-400 text-sm line-clamp-2 italic mb-4 min-h-[2.5rem]">
                  "{u.currentActivity || u.bio || 'Ready für epische Gaming-Sessions...'}"
                </p>

                {/* Platforms & Games */}
                <div className="space-y-3">
                  {/* Platforms */}
                  <div className="flex flex-wrap gap-2">
                    {u.platforms?.slice(0, 3).map(p => (
                      <span key={p} className="px-3 py-1 bg-slate-800/80 border border-slate-700/50 rounded-lg text-xs font-bold text-slate-300 flex items-center gap-1">
                        {getPlatformIcon(p)} {p}
                      </span>
                    ))}
                  </div>

                  {/* Top Games */}
                  {u.games && u.games.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {u.games.slice(0, 3).map(g => (
                        <span key={g} className="px-2 py-1 bg-gradient-to-r from-indigo-500/10 to-purple-500/10 border border-indigo-500/30 rounded text-indigo-300 text-xs font-black uppercase">
                          {g}
                        </span>
                      ))}
                      {u.games.length > 3 && (
                        <span className="px-2 py-1 text-slate-500 text-xs font-bold">+{u.games.length - 3}</span>
                      )}
                    </div>
                  )}
                </div>

                {/* Hover Indicator */}
                <div className="mt-4 pt-4 border-t border-slate-800/50 flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <span className="text-indigo-400 text-xs font-black uppercase tracking-wider">Profil anzeigen</span>
                  <span className="text-indigo-400">→</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Empty State */}
        {filteredUsers.length === 0 && (
          <div className="text-center py-20">
            <div className="text-6xl mb-4 opacity-30">🎮</div>
            <h3 className="text-2xl font-black text-slate-400 uppercase mb-2">Keine Dads gefunden</h3>
            <p className="text-slate-600">Versuche andere Filter oder Suchbegriffe</p>
          </div>
        )}

        {/* Epic Profile Modal */}
        {selectedUser && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 backdrop-blur-md bg-black/80 animate-in fade-in duration-200">
            <div className="relative max-w-3xl w-full">

              {/* Glow Effect */}
              <div className="absolute -inset-1 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 rounded-[3rem] opacity-30 blur-2xl"></div>

              {/* Modal Content */}
              <div className="relative bg-slate-900/95 backdrop-blur-xl border border-slate-800/50 rounded-[3rem] overflow-hidden shadow-2xl">

                {/* Header with Gradient */}
                <div className="relative h-40 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 overflow-hidden">
                  <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI0MCIgaGVpZ2h0PSI0MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAwIDEwIEwgNDAgMTAgTSAxMCAwIEwgMTAgNDAgTSAwIDIwIEwgNDAgMjAgTSAyMCAwIEwgMjAgNDAgTSAwIDMwIEwgNDAgMzAgTSAzMCAwIEwgMzAgNDAiIGZpbGw9Im5vbmUiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS13aWR0aD0iMC41IiBvcGFjaXR5PSIwLjEiLz48L3BhdHRlcm4+PC9kZWZzPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InVybCgjZ3JpZCkiLz48L3N2Zz4=')] opacity-20"></div>

                  {/* Close Button */}
                  <button
                    onClick={() => setSelectedUser(null)}
                    className="absolute top-4 right-4 w-12 h-12 bg-black/30 hover:bg-black/50 backdrop-blur-xl text-white rounded-2xl flex items-center justify-center transition-all z-20 border border-white/10 hover:border-white/20 hover:scale-110"
                  >✕</button>

                  {/* Online Status Badge */}
                  {selectedUser.online && (
                    <div className="absolute top-4 left-4 px-4 py-2 bg-green-500/20 backdrop-blur-xl border border-green-500/50 rounded-xl text-green-300 text-xs font-black uppercase flex items-center gap-2">
                      <span className="w-2.5 h-2.5 bg-green-500 rounded-full animate-pulse"></span>
                      Bereit zum Zocken
                    </div>
                  )}

                  {/* Avatar */}
                  <div className="absolute -bottom-16 left-8 w-32 h-32 bg-slate-900 rounded-3xl border-4 border-slate-900 overflow-hidden shadow-2xl">
                    <img
                      src={selectedUser.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${selectedUser.username}`}
                      alt={selectedUser.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>

                {/* Profile Info */}
                <div className="pt-20 px-8 pb-8">

                  {/* Name & Username */}
                  <div className="mb-8">
                    <h2 className="text-4xl font-black uppercase italic tracking-tight mb-2">
                      <span className="bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 text-transparent bg-clip-text">
                        {selectedUser.name}
                      </span>
                    </h2>
                    <p className="text-indigo-400 font-bold uppercase tracking-widest text-sm">@{selectedUser.username}</p>
                  </div>

                  {/* Content Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">

                    {/* Left Column */}
                    <div className="space-y-6">
                      {/* Bio */}
                      <div>
                        <h4 className="text-xs font-black text-slate-500 uppercase tracking-widest mb-3">Über den Dad</h4>
                        <p className="text-slate-300 leading-relaxed italic text-sm">
                          "{selectedUser.bio || selectedUser.currentActivity || 'Keine Bio hinterlegt.'}"
                        </p>
                      </div>

                      {/* Stats */}
                      <div className="flex gap-6">
                        <div className="px-4 py-3 bg-slate-800/50 border border-slate-700/50 rounded-xl">
                          <p className="text-xs font-black text-slate-500 uppercase mb-1">Alter</p>
                          <p className="text-2xl font-black text-white">{selectedUser.age || 'N/A'}</p>
                        </div>
                        <div className="px-4 py-3 bg-slate-800/50 border border-slate-700/50 rounded-xl">
                          <p className="text-xs font-black text-slate-500 uppercase mb-1">Kinder</p>
                          <p className="text-2xl font-black text-white">{selectedUser.kids || 0} 👶</p>
                        </div>
                      </div>

                      {/* Discord & Steam */}
                      {(selectedUser.discordId || selectedUser.steamId) && (
                        <div className="space-y-2">
                          <h4 className="text-xs font-black text-slate-500 uppercase tracking-widest mb-2">Gaming IDs</h4>
                          {selectedUser.discordId && (
                            <div className="px-4 py-2 bg-indigo-500/10 border border-indigo-500/30 rounded-xl">
                              <p className="text-xs text-slate-400 uppercase font-bold mb-1">Discord</p>
                              <p className="text-indigo-300 font-mono text-sm">{selectedUser.discordId}</p>
                            </div>
                          )}
                          {selectedUser.steamId && (
                            <div className="px-4 py-2 bg-purple-500/10 border border-purple-500/30 rounded-xl">
                              <p className="text-xs text-slate-400 uppercase font-bold mb-1">Steam</p>
                              <p className="text-purple-300 font-mono text-sm">{selectedUser.steamId}</p>
                            </div>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Right Column */}
                    <div className="space-y-6">
                      {/* Platforms */}
                      <div>
                        <h4 className="text-xs font-black text-slate-500 uppercase tracking-widest mb-3">Gaming-Setup</h4>
                        <div className="flex flex-wrap gap-2">
                          {selectedUser.platforms?.map(p => (
                            <span key={p} className="px-4 py-2 bg-slate-800/80 border border-slate-700/50 text-white rounded-xl text-sm font-bold flex items-center gap-2">
                              {getPlatformIcon(p)} {p}
                            </span>
                          ))}
                        </div>
                      </div>

                      {/* Top Games */}
                      <div>
                        <h4 className="text-xs font-black text-slate-500 uppercase tracking-widest mb-3">Top Games</h4>
                        <div className="flex flex-wrap gap-2">
                          {selectedUser.games && selectedUser.games.length > 0 ? (
                            selectedUser.games.map(g => (
                              <span key={g} className="px-3 py-1.5 bg-gradient-to-r from-indigo-500/20 to-purple-500/20 border border-indigo-500/30 text-indigo-300 rounded-lg text-xs font-black uppercase">
                                {g}
                              </span>
                            ))
                          ) : (
                            <span className="text-slate-600 text-sm italic">Keine Games angegeben</span>
                          )}
                        </div>
                      </div>

                      {/* Current Activity */}
                      {selectedUser.currentActivity && (
                        <div className="px-4 py-3 bg-green-500/10 border border-green-500/20 rounded-xl">
                          <p className="text-xs text-green-400 uppercase font-bold mb-1">Aktuell</p>
                          <p className="text-green-300 italic text-sm">"{selectedUser.currentActivity}"</p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Action Button */}
                  <div className="pt-6 border-t border-slate-800/50">
                    <button
                      onClick={() => handleSendRequest(selectedUser)}
                      className="w-full bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 hover:from-indigo-500 hover:via-purple-500 hover:to-pink-500 text-white py-5 rounded-2xl font-black uppercase tracking-widest text-sm transition-all shadow-xl shadow-indigo-500/20 hover:shadow-indigo-500/40 hover:scale-[1.02] active:scale-[0.98]"
                    >
                      ⚡ Freundschaftsanfrage senden
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Custom CSS for gradient animation */}
      <style jsx>{`
        @keyframes gradient {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }
        .animate-gradient {
          background-size: 200% 200%;
          animation: gradient 3s ease infinite;
        }
      `}</style>
    </div>
  );
}
