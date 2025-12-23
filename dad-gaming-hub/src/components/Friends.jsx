import { useState, useEffect } from 'react';
import { userAPI } from '../services/api';

export default function Friends() {
  const [activeTab, setActiveTab] = useState('friends'); // 'friends' or 'requests'
  const [friends, setFriends] = useState([]);
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [friendsRes, requestsRes] = await Promise.all([
        userAPI.getFriends(),
        userAPI.getFriendRequests()
      ]);
      setFriends(friendsRes.data);
      setRequests(requestsRes.data);
    } catch (error) {
      console.error('Error loading friends data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAccept = async (requestId) => {
    try {
      await userAPI.acceptFriendRequest(requestId);
      await loadData();
    } catch (error) {
      alert(error.response?.data?.error || 'Fehler beim Akzeptieren');
    }
  };

  const handleDecline = async (requestId) => {
    try {
      await userAPI.declineFriendRequest(requestId);
      await loadData();
    } catch (error) {
      alert(error.response?.data?.error || 'Fehler beim Ablehnen');
    }
  };

  const handleRemoveFriend = async (friendId) => {
    if (!confirm('Freund wirklich entfernen?')) return;
    try {
      await userAPI.removeFriend(friendId);
      await loadData();
    } catch (error) {
      alert(error.response?.data?.error || 'Fehler beim Entfernen');
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

  const pendingRequests = requests.filter(r => r.status === 'pending');

  return (
    <div className="min-h-screen bg-[#0a0e27] text-white pt-24 pb-12 px-4 relative overflow-hidden">
      {/* Background Effects */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute inset-0 opacity-5">
          <div className="absolute top-20 right-20 w-32 h-32 bg-contain bg-no-repeat opacity-40" style={{backgroundImage: "url('https://images.unsplash.com/photo-1552820728-8b83bb6b773f?w=200&h=200&fit=crop')"}}></div>
          <div className="absolute bottom-40 left-40 w-40 h-40 bg-contain bg-no-repeat opacity-30" style={{backgroundImage: "url('https://images.unsplash.com/photo-1511512578047-dfb367046420?w=200&h=200&fit=crop')"}}></div>
        </div>
        <div className="absolute top-0 left-1/4 w-125 h-125 bg-indigo-600/10 rounded-full blur-[150px] animate-pulse"></div>
        <div className="absolute bottom-0 right-1/4 w-125 h-125 bg-purple-600/10 rounded-full blur-[150px] animate-pulse" style={{animationDelay: '1s'}}></div>
      </div>

      <div className="relative z-10 max-w-6xl mx-auto">

        {/* Header */}
        <div className="mb-10">
          <h1 className="text-5xl font-black uppercase italic tracking-tighter mb-2">
            <span className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-transparent bg-clip-text">FREUNDE</span>
            <span className="text-white">LISTE</span>
          </h1>
          <p className="text-slate-400 font-medium">Verwalte deine Gaming-Buddies</p>
        </div>

        {/* Tabs */}
        <div className="flex gap-3 mb-8">
          <button
            onClick={() => setActiveTab('friends')}
            className={`px-8 py-4 rounded-2xl font-black uppercase text-sm tracking-wider transition-all ${
              activeTab === 'friends'
                ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg shadow-indigo-500/30'
                : 'bg-slate-900/50 text-slate-400 border border-slate-800/50 hover:text-white hover:border-indigo-500/30'
            }`}
          >
            👥 Meine Freunde ({friends.length})
          </button>
          <button
            onClick={() => setActiveTab('requests')}
            className={`relative px-8 py-4 rounded-2xl font-black uppercase text-sm tracking-wider transition-all ${
              activeTab === 'requests'
                ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg shadow-indigo-500/30'
                : 'bg-slate-900/50 text-slate-400 border border-slate-800/50 hover:text-white hover:border-indigo-500/30'
            }`}
          >
            📬 Anfragen ({pendingRequests.length})
            {pendingRequests.length > 0 && (
              <span className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-bold animate-pulse">
                {pendingRequests.length}
              </span>
            )}
          </button>
        </div>

        {/* Friends List */}
        {activeTab === 'friends' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {friends.length === 0 ? (
              <div className="col-span-full text-center py-20">
                <div className="text-6xl mb-4 opacity-20">👥</div>
                <h3 className="text-2xl font-black text-slate-400 uppercase mb-2">Noch keine Freunde</h3>
                <p className="text-slate-600">Sende Freundschaftsanfragen im Dashboard!</p>
              </div>
            ) : (
              friends.map(friend => (
                <div key={friend.id} className="group relative">
                  {/* Glow Effect */}
                  <div className="absolute -inset-0.5 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 rounded-3xl opacity-0 group-hover:opacity-30 blur transition-all duration-500"></div>

                  {/* Card */}
                  <div className="relative bg-slate-900/80 backdrop-blur-xl border border-slate-800/50 group-hover:border-indigo-500/30 rounded-3xl p-6 transition-all">

                    {/* Header */}
                    <div className="flex items-center gap-4 mb-4">
                      <div className="relative">
                        <div className="w-16 h-16 bg-slate-800 rounded-2xl overflow-hidden border-2 border-slate-700 group-hover:border-indigo-500/50 transition-all">
                          <img
                            src={friend.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${friend.username}`}
                            alt={friend.name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        {friend.online && (
                          <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-500 border-2 border-slate-900 rounded-full animate-pulse"></div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-lg font-black text-white uppercase italic truncate">{friend.name}</h3>
                        <p className="text-indigo-400 text-xs font-bold uppercase tracking-wider">@{friend.username}</p>
                      </div>
                    </div>

                    {/* Bio */}
                    {friend.bio && (
                      <p className="text-slate-400 text-sm italic mb-4 line-clamp-2">"{friend.bio}"</p>
                    )}

                    {/* Actions */}
                    <div className="flex gap-2">
                      <button
                        onClick={() => window.location.href = '/chat'}
                        className="flex-1 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white py-3 rounded-xl text-sm font-black uppercase tracking-wider transition-all shadow-lg shadow-indigo-500/20"
                      >
                        💬 Chat
                      </button>
                      <button
                        onClick={() => handleRemoveFriend(friend.id)}
                        className="px-4 bg-red-500/10 hover:bg-red-500/20 text-red-400 py-3 rounded-xl font-bold transition-all border border-red-500/20 hover:border-red-500/40"
                        title="Freund entfernen"
                      >
                        🗑️
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* Friend Requests */}
        {activeTab === 'requests' && (
          <div className="space-y-4">
            {pendingRequests.length === 0 ? (
              <div className="text-center py-20">
                <div className="text-6xl mb-4 opacity-20">📬</div>
                <h3 className="text-2xl font-black text-slate-400 uppercase mb-2">Keine offenen Anfragen</h3>
                <p className="text-slate-600">Du hast alle Anfragen bearbeitet</p>
              </div>
            ) : (
              pendingRequests.map(request => (
                <div key={request.id} className="group relative">
                  {/* Glow Effect */}
                  <div className="absolute -inset-0.5 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 rounded-3xl opacity-0 group-hover:opacity-20 blur transition-all duration-500"></div>

                  {/* Card */}
                  <div className="relative bg-slate-900/80 backdrop-blur-xl border border-slate-800/50 group-hover:border-indigo-500/30 rounded-3xl p-6 transition-all">
                    <div className="flex items-center justify-between gap-6 flex-wrap md:flex-nowrap">

                      {/* User Info */}
                      <div className="flex items-center gap-4 flex-1 min-w-0">
                        <div className="relative flex-shrink-0">
                          <div className="w-16 h-16 bg-slate-800 rounded-2xl overflow-hidden border-2 border-slate-700">
                            <img
                              src={request.sender.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${request.sender.username}`}
                              alt={request.sender.name}
                              className="w-full h-full object-cover"
                            />
                          </div>
                          {request.sender.online && (
                            <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-500 border-2 border-slate-900 rounded-full"></div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="text-lg font-black text-white uppercase italic truncate">{request.sender.name}</h3>
                          <p className="text-indigo-400 text-xs font-bold uppercase tracking-wider">@{request.sender.username}</p>
                          {request.message && (
                            <p className="text-slate-400 text-sm mt-2 italic truncate">"{request.message}"</p>
                          )}
                          <p className="text-slate-600 text-xs mt-1.5 font-bold">
                            {new Date(request.created_at).toLocaleDateString('de-DE', {
                              day: '2-digit',
                              month: '2-digit',
                              year: 'numeric'
                            })}
                          </p>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex gap-3 w-full md:w-auto">
                        <button
                          onClick={() => handleAccept(request.id)}
                          className="flex-1 md:flex-none bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 text-white px-6 py-3 rounded-xl font-black text-sm uppercase tracking-wider transition-all shadow-lg shadow-green-500/20"
                        >
                          ✓ Annehmen
                        </button>
                        <button
                          onClick={() => handleDecline(request.id)}
                          className="flex-1 md:flex-none bg-red-500/10 hover:bg-red-500/20 text-red-400 px-6 py-3 rounded-xl font-black text-sm uppercase tracking-wider transition-all border border-red-500/20 hover:border-red-500/40"
                        >
                          ✗ Ablehnen
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}
