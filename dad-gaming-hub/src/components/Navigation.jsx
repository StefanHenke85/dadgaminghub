import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Navigation() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <header className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-6 px-4 shadow-2xl">
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">🎮 Dad-Gaming Hub</h1>
          <p className="text-sm text-blue-100">Zocken, wenn die Kinder schlafen</p>
        </div>

        <div className="flex items-center gap-4">
          {user && (
            <>
              <button
                onClick={() => navigate('/')}
                className="hover:bg-white/20 px-3 py-2 rounded-lg transition-all"
              >
                Spieler
              </button>

              <button
                onClick={() => navigate('/sessions')}
                className="hover:bg-white/20 px-3 py-2 rounded-lg transition-all"
              >
                Sessions
              </button>

              <button
                onClick={() => navigate('/chat')}
                className="hover:bg-white/20 px-3 py-2 rounded-lg transition-all"
              >
                Chat
              </button>

              <button
                onClick={() => navigate('/profile/edit')}
                className="hover:bg-white/20 px-3 py-2 rounded-lg transition-all"
              >
                Profil
              </button>

              {(user.role === 'admin' || user.role === 'moderator') && (
                <button
                  onClick={() => navigate('/admin')}
                  className="bg-purple-700 hover:bg-purple-800 px-4 py-2 rounded-lg font-semibold transition-all"
                >
                  Admin
                </button>
              )}

              <div className="text-right">
                <p className="font-semibold">{user.name}</p>
                <p className="text-xs text-blue-100">@{user.username}</p>
              </div>

              <button
                onClick={handleLogout}
                className="bg-white/20 hover:bg-white/30 px-4 py-2 rounded-lg font-semibold transition-all"
              >
                Abmelden
              </button>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
