import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

export default function UserProfile() {
  const { userId } = useParams();
  const { user: currentUser } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [sessions, setSessions] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isFriend, setIsFriend] = useState(false);
  const [friendRequestPending, setFriendRequestPending] = useState(false);

  useEffect(() => {
    loadProfile();
  }, [userId]);

  const loadProfile = async () => {
    try {
      setLoading(true);

      // Load profile
      const profileRes = await api.get(`/users/${userId}`);
      setProfile(profileRes.data);

      // Load user's sessions
      const sessionsRes = await api.get(`/sessions?userId=${userId}`);
      setSessions(sessionsRes.data || []);

      // Load friendship status
      const friendsRes = await api.get('/friends');
      const friends = friendsRes.data || [];
      const friendData = friends.find(f =>
        (f.user_id === userId || f.friend_id === userId) && f.status === 'accepted'
      );
      const pendingData = friends.find(f =>
        (f.user_id === userId || f.friend_id === userId) && f.status === 'pending'
      );

      setIsFriend(!!friendData);
      setFriendRequestPending(!!pendingData);

      // Load user stats (simulated for now)
      setStats({
        totalSessions: sessionsRes.data?.length || 0,
        hostedSessions: sessionsRes.data?.filter(s => s.host_id === userId).length || 0,
        joinedSessions: sessionsRes.data?.filter(s => s.host_id !== userId).length || 0
      });
    } catch (error) {
      console.error('Error loading profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const sendFriendRequest = async () => {
    try {
      await api.post('/friends/request', { friendId: userId });
      setFriendRequestPending(true);
    } catch (error) {
      console.error('Error sending friend request:', error);
    }
  };

  const removeFriend = async () => {
    if (!confirm('Freundschaft wirklich beenden?')) return;

    try {
      await api.delete(`/friends/${userId}`);
      setIsFriend(false);
    } catch (error) {
      console.error('Error removing friend:', error);
    }
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('de-DE', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const formatDateTime = (date) => {
    return new Date(date).toLocaleString('de-DE', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 pt-28 px-4 md:px-6 pb-24">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-center py-20">
            <div className="text-lg text-indigo-400 animate-pulse">Lade Profil...</div>
          </div>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 pt-28 px-4 md:px-6 pb-24">
        <div className="max-w-7xl mx-auto">
          <div className="text-center py-20">
            <span className="text-6xl opacity-20">👤</span>
            <h2 className="text-2xl font-black text-white mt-4">Benutzer nicht gefunden</h2>
            <button
              onClick={() => navigate('/')}
              className="mt-6 px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold uppercase tracking-wider transition-all"
            >
              Zurück
            </button>
          </div>
        </div>
      </div>
    );
  }

  const isOwnProfile = currentUser?.id === userId;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 pt-28 px-4 md:px-6 pb-24">
      <div className="max-w-7xl mx-auto">
        {/* Back Button */}
        <button
          onClick={() => navigate(-1)}
          className="mb-6 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-sm font-bold uppercase tracking-wider transition-all flex items-center gap-2"
        >
          ← Zurück
        </button>

        {/* Profile Header */}
        <div className="bg-slate-900/50 backdrop-blur-xl border border-white/10 rounded-3xl p-8 mb-6">
          <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
            {/* Avatar */}
            <div className="w-24 h-24 md:w-32 md:h-32 bg-slate-800 rounded-full border-4 border-indigo-500/30 overflow-hidden flex-shrink-0">
              <img
                src={profile.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${profile.username}`}
                alt="Avatar"
                className="w-full h-full object-cover"
              />
            </div>

            {/* Info */}
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-3xl md:text-4xl font-black text-white uppercase italic tracking-tighter">
                  {profile.name}
                </h1>
                {profile.online && (
                  <span className="px-3 py-1 bg-green-500/20 border border-green-500/30 text-green-400 text-xs font-bold uppercase tracking-wider rounded-full">
                    Online
                  </span>
                )}
                {profile.role === 'admin' && (
                  <span className="px-3 py-1 bg-red-500/20 border border-red-500/30 text-red-400 text-xs font-bold uppercase tracking-wider rounded-full">
                    Admin
                  </span>
                )}
              </div>
              <p className="text-lg text-slate-400 mb-4">@{profile.username}</p>

              {profile.bio && (
                <p className="text-sm text-slate-300 mb-4">{profile.bio}</p>
              )}

              <div className="flex flex-wrap gap-2 mb-4">
                {profile.age && (
                  <span className="px-3 py-1 bg-slate-800 text-slate-300 text-xs font-bold rounded-lg">
                    {profile.age} Jahre
                  </span>
                )}
                {profile.kids > 0 && (
                  <span className="px-3 py-1 bg-slate-800 text-slate-300 text-xs font-bold rounded-lg">
                    {profile.kids} {profile.kids === 1 ? 'Kind' : 'Kinder'}
                  </span>
                )}
                {profile.time_preference && (
                  <span className="px-3 py-1 bg-slate-800 text-slate-300 text-xs font-bold rounded-lg">
                    {profile.time_preference}
                  </span>
                )}
              </div>

              {/* Platforms */}
              {profile.platforms && profile.platforms.length > 0 && (
                <div className="mb-4">
                  <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Plattformen</p>
                  <div className="flex flex-wrap gap-2">
                    {profile.platforms.map(platform => (
                      <span key={platform} className="px-3 py-1 bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 text-xs font-bold rounded-lg">
                        {platform}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Games */}
              {profile.games && profile.games.length > 0 && (
                <div>
                  <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Lieblingsspiele</p>
                  <div className="flex flex-wrap gap-2">
                    {profile.games.slice(0, 5).map(game => (
                      <span key={game} className="px-3 py-1 bg-slate-800 text-slate-300 text-xs font-bold rounded-lg">
                        {game}
                      </span>
                    ))}
                    {profile.games.length > 5 && (
                      <span className="px-3 py-1 bg-slate-800 text-slate-500 text-xs font-bold rounded-lg">
                        +{profile.games.length - 5} mehr
                      </span>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Actions */}
            {!isOwnProfile && (
              <div className="flex flex-col gap-2 w-full md:w-auto">
                {isFriend ? (
                  <>
                    <button
                      onClick={() => navigate(`/chat?user=${userId}`)}
                      className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold uppercase tracking-wider transition-all"
                    >
                      Nachricht senden
                    </button>
                    <button
                      onClick={removeFriend}
                      className="px-6 py-3 bg-slate-800 hover:bg-red-500/20 hover:text-red-400 text-slate-400 rounded-xl font-bold uppercase tracking-wider transition-all border border-white/5"
                    >
                      Freundschaft beenden
                    </button>
                  </>
                ) : friendRequestPending ? (
                  <button
                    disabled
                    className="px-6 py-3 bg-slate-800 text-slate-500 rounded-xl font-bold uppercase tracking-wider cursor-not-allowed"
                  >
                    Anfrage ausstehend
                  </button>
                ) : (
                  <button
                    onClick={sendFriendRequest}
                    className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold uppercase tracking-wider transition-all"
                  >
                    Freundschaftsanfrage
                  </button>
                )}
                {isOwnProfile && (
                  <button
                    onClick={() => navigate('/profile/edit')}
                    className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold uppercase tracking-wider transition-all"
                  >
                    Profil bearbeiten
                  </button>
                )}
              </div>
            )}
            {isOwnProfile && (
              <button
                onClick={() => navigate('/profile/edit')}
                className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold uppercase tracking-wider transition-all"
              >
                Profil bearbeiten
              </button>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Stats */}
          <div className="lg:col-span-1">
            <div className="bg-slate-900/50 backdrop-blur-xl border border-white/10 rounded-3xl p-6">
              <h2 className="text-xl font-black text-white uppercase italic tracking-tighter mb-6">
                Statistiken
              </h2>
              <div className="space-y-4">
                <div className="bg-slate-800/50 rounded-xl p-4">
                  <div className="text-3xl font-black text-indigo-400 mb-1">{stats?.totalSessions || 0}</div>
                  <div className="text-xs text-slate-500 font-bold uppercase tracking-wider">Total Sessions</div>
                </div>
                <div className="bg-slate-800/50 rounded-xl p-4">
                  <div className="text-3xl font-black text-green-400 mb-1">{stats?.hostedSessions || 0}</div>
                  <div className="text-xs text-slate-500 font-bold uppercase tracking-wider">Gehostet</div>
                </div>
                <div className="bg-slate-800/50 rounded-xl p-4">
                  <div className="text-3xl font-black text-blue-400 mb-1">{stats?.joinedSessions || 0}</div>
                  <div className="text-xs text-slate-500 font-bold uppercase tracking-wider">Teilgenommen</div>
                </div>
              </div>
            </div>

            {/* Social Links */}
            {(profile.discord || profile.psn || profile.xbox || profile.steam || profile.switch) && (
              <div className="bg-slate-900/50 backdrop-blur-xl border border-white/10 rounded-3xl p-6 mt-6">
                <h2 className="text-xl font-black text-white uppercase italic tracking-tighter mb-4">
                  Social Links
                </h2>
                <div className="space-y-2">
                  {profile.discord && (
                    <div className="flex items-center gap-2 text-sm text-slate-300">
                      <span className="text-lg">💬</span>
                      <span className="text-slate-500 font-bold">Discord:</span>
                      <span className="font-mono">{profile.discord}</span>
                    </div>
                  )}
                  {profile.psn && (
                    <div className="flex items-center gap-2 text-sm text-slate-300">
                      <span className="text-lg">🎮</span>
                      <span className="text-slate-500 font-bold">PSN:</span>
                      <span className="font-mono">{profile.psn}</span>
                    </div>
                  )}
                  {profile.xbox && (
                    <div className="flex items-center gap-2 text-sm text-slate-300">
                      <span className="text-lg">🎮</span>
                      <span className="text-slate-500 font-bold">Xbox:</span>
                      <span className="font-mono">{profile.xbox}</span>
                    </div>
                  )}
                  {profile.steam && (
                    <div className="flex items-center gap-2 text-sm text-slate-300">
                      <span className="text-lg">🎮</span>
                      <span className="text-slate-500 font-bold">Steam:</span>
                      <span className="font-mono">{profile.steam}</span>
                    </div>
                  )}
                  {profile.switch && (
                    <div className="flex items-center gap-2 text-sm text-slate-300">
                      <span className="text-lg">🎮</span>
                      <span className="text-slate-500 font-bold">Switch:</span>
                      <span className="font-mono">{profile.switch}</span>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Sessions History */}
          <div className="lg:col-span-2">
            <div className="bg-slate-900/50 backdrop-blur-xl border border-white/10 rounded-3xl p-6">
              <h2 className="text-xl font-black text-white uppercase italic tracking-tighter mb-6">
                Session-Verlauf
              </h2>
              {sessions.length === 0 ? (
                <div className="text-center py-12">
                  <span className="text-4xl opacity-20">🎮</span>
                  <p className="text-sm text-slate-500 mt-2">Noch keine Sessions</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {sessions.slice(0, 10).map(session => (
                    <div
                      key={session.id}
                      onClick={() => navigate(`/sessions?id=${session.id}`)}
                      className="bg-slate-800/50 hover:bg-slate-800 border border-white/5 hover:border-indigo-500/30 rounded-xl p-4 cursor-pointer transition-all group"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h3 className="text-sm font-black text-white group-hover:text-indigo-400 transition-colors">
                            {session.title}
                          </h3>
                          <p className="text-xs text-indigo-400 mt-1">{session.game} • {session.platform}</p>
                        </div>
                        {session.host_id === userId && (
                          <span className="px-2 py-1 bg-green-500/20 border border-green-500/30 text-green-400 text-[10px] font-bold uppercase tracking-wider rounded">
                            Host
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-4 text-[11px] text-slate-500">
                        <span>📅 {formatDateTime(session.scheduled_date)}</span>
                        <span>⏱️ {session.duration} Min</span>
                        <span className={`px-2 py-0.5 rounded ${
                          session.status === 'completed' ? 'bg-green-500/20 text-green-400' :
                          session.status === 'cancelled' ? 'bg-red-500/20 text-red-400' :
                          'bg-indigo-500/20 text-indigo-400'
                        }`}>
                          {session.status}
                        </span>
                      </div>
                    </div>
                  ))}
                  {sessions.length > 10 && (
                    <p className="text-xs text-slate-500 text-center py-2">
                      +{sessions.length - 10} weitere Sessions
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
