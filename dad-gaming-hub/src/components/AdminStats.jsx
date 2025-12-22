import { useState, useEffect } from 'react';
import api from '../services/api';

export default function AdminStats() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      setLoading(true);
      const response = await api.get('/admin/stats');
      setStats(response.data);
    } catch (err) {
      setError(err.response?.data?.error || 'Fehler beim Laden der Statistiken');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="text-gray-400">Lade Statistiken...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-900/20 border border-red-700 rounded-lg p-4">
        <p className="text-red-400">{error}</p>
      </div>
    );
  }

  const statCards = [
    {
      label: 'Gesamt Benutzer',
      value: stats?.totalUsers || 0,
      icon: '👥',
      color: 'blue'
    },
    {
      label: 'Online',
      value: stats?.onlineUsers || 0,
      icon: '🟢',
      color: 'green'
    },
    {
      label: 'Neue Heute',
      value: stats?.newUsersToday || 0,
      icon: '🆕',
      color: 'purple'
    },
    {
      label: 'Gebannt',
      value: stats?.bannedUsers || 0,
      icon: '🚫',
      color: 'red'
    },
    {
      label: 'Gaming Sessions',
      value: stats?.totalSessions || 0,
      icon: '🎮',
      color: 'yellow'
    }
  ];

  const colorClasses = {
    blue: 'bg-blue-900/30 border-blue-700',
    green: 'bg-green-900/30 border-green-700',
    purple: 'bg-purple-900/30 border-purple-700',
    red: 'bg-red-900/30 border-red-700',
    yellow: 'bg-yellow-900/30 border-yellow-700'
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        {statCards.map((stat) => (
          <div
            key={stat.label}
            className={`${colorClasses[stat.color]} border rounded-lg p-6`}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">{stat.label}</p>
                <p className="text-3xl font-bold text-white mt-2">{stat.value}</p>
              </div>
              <div className="text-4xl">{stat.icon}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Übersicht</h3>
        <div className="space-y-3 text-gray-300">
          <p>
            Die Plattform hat aktuell <span className="font-bold text-white">{stats?.totalUsers}</span> registrierte Benutzer.
          </p>
          <p>
            Davon sind <span className="font-bold text-green-400">{stats?.onlineUsers}</span> online und{' '}
            <span className="font-bold text-red-400">{stats?.bannedUsers}</span> gebannt.
          </p>
          <p>
            Heute haben sich <span className="font-bold text-purple-400">{stats?.newUsersToday}</span> neue Benutzer registriert.
          </p>
          <p>
            Insgesamt wurden <span className="font-bold text-yellow-400">{stats?.totalSessions}</span> Gaming Sessions erstellt.
          </p>
        </div>
      </div>
    </div>
  );
}
