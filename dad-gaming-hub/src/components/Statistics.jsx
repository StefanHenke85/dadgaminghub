import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

export default function Statistics() {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [leaderboard, setLeaderboard] = useState({ hosts: [], players: [] });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStatistics();
  }, []);

  const loadStatistics = async () => {
    try {
      const [statsRes, leaderboardRes] = await Promise.all([
        api.get('/statistics/user'),
        api.get('/statistics/leaderboard')
      ]);

      setStats(statsRes.data);
      setLeaderboard(leaderboardRes.data);
    } catch (error) {
      console.error('Error loading statistics:', error);
    } finally {
      setLoading(false);
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

  const achievements = [
    {
      id: 'first_session',
      name: 'First Session',
      description: 'Erstelle deine erste Gaming-Session',
      icon: '🎮',
      unlocked: stats?.totalSessions > 0,
      progress: Math.min(stats?.totalSessions || 0, 1),
      max: 1
    },
    {
      id: 'veteran',
      name: '10 Sessions Veteran',
      description: 'Nimm an 10 Sessions teil',
      icon: '⭐',
      unlocked: stats?.totalSessions >= 10,
      progress: Math.min(stats?.totalSessions || 0, 10),
      max: 10
    },
    {
      id: 'squad_leader',
      name: 'Squad Leader',
      description: 'Hoste 5 Gaming-Sessions',
      icon: '👑',
      unlocked: stats?.hostedSessions >= 5,
      progress: Math.min(stats?.hostedSessions || 0, 5),
      max: 5
    },
    {
      id: 'night_owl',
      name: 'Night Owl',
      description: 'Spiele 5 Sessions nach 22 Uhr',
      icon: '🦉',
      unlocked: stats?.nightSessions >= 5,
      progress: Math.min(stats?.nightSessions || 0, 5),
      max: 5
    }
  ];

  return (
    <div className="min-h-screen bg-[#0a0e27] text-white pt-24 pb-12 px-4 relative overflow-hidden">
      {/* Background Effects */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-indigo-600/10 rounded-full blur-[150px] animate-pulse"></div>
        <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-purple-600/10 rounded-full blur-[150px] animate-pulse" style={{animationDelay: '1s'}}></div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-12 text-center">
          <h1 className="text-5xl md:text-6xl font-black uppercase italic tracking-tighter mb-4">
            <span className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-transparent bg-clip-text">GAMING</span>
            <span className="text-white"> STATS</span>
          </h1>
          <p className="text-slate-400 text-lg font-medium">Deine Gaming-Statistiken und Achievements</p>
        </div>

        {/* Personal Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {/* Total Sessions */}
          <div className="group relative">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-3xl opacity-20 group-hover:opacity-40 blur transition-all"></div>
            <div className="relative bg-slate-900/90 backdrop-blur-xl border border-slate-800/50 rounded-3xl p-6">
              <div className="text-4xl mb-2">🎮</div>
              <div className="text-3xl font-black text-white mb-1">{stats?.totalSessions || 0}</div>
              <div className="text-sm text-slate-400 font-bold uppercase tracking-wider">Total Sessions</div>
            </div>
          </div>

          {/* Hosted Sessions */}
          <div className="group relative">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-600 to-pink-600 rounded-3xl opacity-20 group-hover:opacity-40 blur transition-all"></div>
            <div className="relative bg-slate-900/90 backdrop-blur-xl border border-slate-800/50 rounded-3xl p-6">
              <div className="text-4xl mb-2">👑</div>
              <div className="text-3xl font-black text-white mb-1">{stats?.hostedSessions || 0}</div>
              <div className="text-sm text-slate-400 font-bold uppercase tracking-wider">Als Host</div>
            </div>
          </div>

          {/* Playtime */}
          <div className="group relative">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-pink-600 to-red-600 rounded-3xl opacity-20 group-hover:opacity-40 blur transition-all"></div>
            <div className="relative bg-slate-900/90 backdrop-blur-xl border border-slate-800/50 rounded-3xl p-6">
              <div className="text-4xl mb-2">⏱️</div>
              <div className="text-3xl font-black text-white mb-1">{Math.floor((stats?.totalPlaytime || 0) / 60)}h</div>
              <div className="text-sm text-slate-400 font-bold uppercase tracking-wider">Spielzeit</div>
            </div>
          </div>

          {/* Favorite Platform */}
          <div className="group relative">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-green-600 to-emerald-600 rounded-3xl opacity-20 group-hover:opacity-40 blur transition-all"></div>
            <div className="relative bg-slate-900/90 backdrop-blur-xl border border-slate-800/50 rounded-3xl p-6">
              <div className="text-4xl mb-2">🎯</div>
              <div className="text-3xl font-black text-white mb-1">{stats?.favoritePlatform || 'N/A'}</div>
              <div className="text-sm text-slate-400 font-bold uppercase tracking-wider">Top Plattform</div>
            </div>
          </div>
        </div>

        {/* Top Games */}
        <div className="mb-12">
          <h2 className="text-3xl font-black uppercase italic tracking-tight mb-6 text-white">
            🏆 Deine Top Games
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {stats?.topGames?.length > 0 ? (
              stats.topGames.map((game, index) => (
                <div key={game.game} className="group relative">
                  <div className="absolute -inset-0.5 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 rounded-3xl opacity-20 group-hover:opacity-30 blur transition-all"></div>
                  <div className="relative bg-slate-900/90 backdrop-blur-xl border border-slate-800/50 rounded-3xl p-6">
                    <div className="flex items-center gap-4">
                      <div className="text-5xl font-black text-transparent bg-gradient-to-r from-indigo-500 to-purple-500 bg-clip-text">
                        #{index + 1}
                      </div>
                      <div className="flex-1">
                        <h3 className="text-xl font-black text-white uppercase italic mb-1">{game.game}</h3>
                        <p className="text-sm text-slate-400 font-bold">{game.count} Sessions</p>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="col-span-3 text-center py-12 text-slate-500">
                Noch keine Sessions gespielt - erstelle deine erste!
              </div>
            )}
          </div>
        </div>

        {/* Achievements */}
        <div className="mb-12">
          <h2 className="text-3xl font-black uppercase italic tracking-tight mb-6 text-white">
            🏅 Achievements
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {achievements.map(achievement => (
              <div key={achievement.id} className="group relative">
                <div className={`absolute -inset-0.5 rounded-3xl opacity-20 group-hover:opacity-30 blur transition-all ${
                  achievement.unlocked
                    ? 'bg-gradient-to-r from-yellow-600 to-orange-600'
                    : 'bg-gradient-to-r from-slate-600 to-slate-700'
                }`}></div>
                <div className={`relative backdrop-blur-xl border rounded-3xl p-6 transition-all ${
                  achievement.unlocked
                    ? 'bg-slate-900/90 border-yellow-500/30'
                    : 'bg-slate-900/50 border-slate-800/50 opacity-60'
                }`}>
                  <div className="flex items-center gap-4 mb-4">
                    <div className={`text-5xl ${achievement.unlocked ? 'grayscale-0' : 'grayscale opacity-40'}`}>
                      {achievement.icon}
                    </div>
                    <div className="flex-1">
                      <h3 className={`text-xl font-black uppercase italic mb-1 ${
                        achievement.unlocked ? 'text-yellow-400' : 'text-slate-500'
                      }`}>
                        {achievement.name}
                      </h3>
                      <p className="text-sm text-slate-400">{achievement.description}</p>
                    </div>
                    {achievement.unlocked && (
                      <div className="text-green-400 text-2xl">✓</div>
                    )}
                  </div>
                  {/* Progress Bar */}
                  <div className="relative h-2 bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className={`absolute inset-y-0 left-0 rounded-full transition-all ${
                        achievement.unlocked
                          ? 'bg-gradient-to-r from-yellow-500 to-orange-500'
                          : 'bg-gradient-to-r from-indigo-600 to-purple-600'
                      }`}
                      style={{ width: `${(achievement.progress / achievement.max) * 100}%` }}
                    ></div>
                  </div>
                  <div className="mt-2 text-xs text-slate-500 font-bold text-right">
                    {achievement.progress} / {achievement.max}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Leaderboards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Top Hosts */}
          <div>
            <h2 className="text-3xl font-black uppercase italic tracking-tight mb-6 text-white">
              👑 Top Hosts
            </h2>
            <div className="space-y-4">
              {leaderboard.hosts?.map((host, index) => (
                <div key={host.id} className="group relative">
                  <div className="absolute -inset-0.5 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl opacity-0 group-hover:opacity-20 blur transition-all"></div>
                  <div className="relative bg-slate-900/80 backdrop-blur-xl border border-slate-800/50 rounded-2xl p-4 flex items-center gap-4">
                    <div className={`text-2xl font-black w-8 ${
                      index === 0 ? 'text-yellow-400' :
                      index === 1 ? 'text-slate-300' :
                      index === 2 ? 'text-orange-400' :
                      'text-slate-500'
                    }`}>
                      #{index + 1}
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-black text-white">{host.name}</h3>
                      <p className="text-sm text-slate-400">{host.hosted_sessions} Sessions gehostet</p>
                    </div>
                    {index < 3 && (
                      <div className="text-3xl">
                        {index === 0 ? '🥇' : index === 1 ? '🥈' : '🥉'}
                      </div>
                    )}
                  </div>
                </div>
              ))}
              {leaderboard.hosts?.length === 0 && (
                <div className="text-center py-12 text-slate-500">
                  Noch keine Hosts vorhanden
                </div>
              )}
            </div>
          </div>

          {/* Top Players */}
          <div>
            <h2 className="text-3xl font-black uppercase italic tracking-tight mb-6 text-white">
              ⭐ Top Players
            </h2>
            <div className="space-y-4">
              {leaderboard.players?.map((player, index) => (
                <div key={player.id} className="group relative">
                  <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl opacity-0 group-hover:opacity-20 blur transition-all"></div>
                  <div className="relative bg-slate-900/80 backdrop-blur-xl border border-slate-800/50 rounded-2xl p-4 flex items-center gap-4">
                    <div className={`text-2xl font-black w-8 ${
                      index === 0 ? 'text-yellow-400' :
                      index === 1 ? 'text-slate-300' :
                      index === 2 ? 'text-orange-400' :
                      'text-slate-500'
                    }`}>
                      #{index + 1}
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-black text-white">{player.name}</h3>
                      <p className="text-sm text-slate-400">{player.total_sessions} Sessions gespielt</p>
                    </div>
                    {index < 3 && (
                      <div className="text-3xl">
                        {index === 0 ? '🥇' : index === 1 ? '🥈' : '🥉'}
                      </div>
                    )}
                  </div>
                </div>
              ))}
              {leaderboard.players?.length === 0 && (
                <div className="text-center py-12 text-slate-500">
                  Noch keine Players vorhanden
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
