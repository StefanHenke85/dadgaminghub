import { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

export default function Navigation() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const notificationsRef = useRef(null);
  const pollIntervalRef = useRef(null);

  // Load notifications on mount and poll every 30 seconds
  useEffect(() => {
    loadNotifications();
    pollIntervalRef.current = setInterval(loadNotifications, 30000);
    return () => clearInterval(pollIntervalRef.current);
  }, []);

  // Close notifications dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (notificationsRef.current && !notificationsRef.current.contains(event.target)) {
        setNotificationsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const loadNotifications = async () => {
    try {
      const response = await api.get('/notifications');
      const allNotifications = response.data || [];
      setNotifications(allNotifications.slice(0, 10)); // Show latest 10
      setUnreadCount(allNotifications.filter(n => !n.read).length);
    } catch (error) {
      console.error('Error loading notifications:', error);
    }
  };

  const markAsRead = async (notificationId) => {
    try {
      await api.put(`/notifications/${notificationId}/read`);
      setNotifications(prev =>
        prev.map(n => n.id === notificationId ? { ...n, read: true } : n)
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      await api.put('/notifications/read-all');
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
      setUnreadCount(0);
    } catch (error) {
      console.error('Error marking all as read:', error);
    }
  };

  const handleNotificationClick = (notification) => {
    markAsRead(notification.id);
    setNotificationsOpen(false);
    if (notification.link) {
      navigate(notification.link);
    }
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'friend_request': return '👤';
      case 'friend_accepted': return '🤝';
      case 'session_invite': return '🎮';
      case 'session_accepted': return '✅';
      case 'session_declined': return '❌';
      case 'session_starting': return '⏰';
      case 'new_message': return '💬';
      case 'session_cancelled': return '🚫';
      default: return '📢';
    }
  };

  const formatTimeAgo = (timestamp) => {
    const now = new Date();
    const then = new Date(timestamp);
    const diffMs = now - then;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return 'Gerade eben';
    if (diffMins < 60) return `vor ${diffMins}min`;
    if (diffHours < 24) return `vor ${diffHours}h`;
    if (diffDays < 7) return `vor ${diffDays}d`;
    return then.toLocaleDateString('de-DE');
  };

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const handleNavigate = (path) => {
    navigate(path);
    setMobileMenuOpen(false);
  };

  // Hilfsfunktion für aktiven Link-Style
  const isActive = (path) => location.pathname === path;

  if (!user) return null; // Zeige Navi nur wenn eingeloggt

  return (
    <>
      <nav className="fixed top-0 left-0 right-0 z-[100] p-4 md:p-6 pointer-events-none">
        <div className="max-w-7xl mx-auto flex justify-between items-center bg-slate-900/80 backdrop-blur-xl border border-white/10 rounded-[2rem] px-6 py-3 shadow-2xl pointer-events-auto">

          {/* Logo Section */}
          <div
            className="flex items-center gap-3 cursor-pointer group"
            onClick={() => navigate('/')}
          >
            <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/20 group-hover:scale-110 transition-transform">
              <span className="text-xl">🎮</span>
            </div>
            <div className="hidden sm:block">
              <h1 className="text-lg font-black text-white leading-none uppercase italic tracking-tighter">
                DadGaming<span className="text-indigo-500">Hub</span>
              </h1>
              <p className="text-[9px] text-slate-500 font-bold uppercase tracking-widest">Late Night Squad</p>
            </div>
          </div>

        {/* Navigation Links */}
        <div className="hidden lg:flex items-center gap-1 bg-slate-800/50 p-1 rounded-2xl border border-white/5">
          <button
            onClick={() => navigate('/')}
            className={`px-5 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${
              isActive('/') ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/20' : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
          >
            Spieler
          </button>
          <button
            onClick={() => navigate('/sessions')}
            className={`px-5 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${
              isActive('/sessions') ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/20' : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
          >
            Sessions
          </button>
          <button
            onClick={() => navigate('/calendar')}
            className={`px-5 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${
              isActive('/calendar') ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/20' : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
          >
            Kalender
          </button>
          <button
            onClick={() => navigate('/chat')}
            className={`px-5 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${
              isActive('/chat') ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/20' : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
          >
            Chat
          </button>
          <button
            onClick={() => navigate('/friends')}
            className={`px-5 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${
              isActive('/friends') ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/20' : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
          >
            Freunde
          </button>
          <button
            onClick={() => navigate('/statistics')}
            className={`px-5 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${
              isActive('/statistics') ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/20' : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
          >
            Stats
          </button>
        </div>

        {/* Right Side: User & Meta */}
        <div className="flex items-center gap-4">
          {/* Notifications Bell */}
          <div className="relative" ref={notificationsRef}>
            <button
              onClick={() => setNotificationsOpen(!notificationsOpen)}
              className="relative w-10 h-10 flex items-center justify-center bg-slate-800 hover:bg-indigo-500/20 text-slate-400 hover:text-indigo-400 rounded-xl transition-all border border-white/5"
              title="Benachrichtigungen"
            >
              <span className="text-lg">🔔</span>
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-black rounded-full w-5 h-5 flex items-center justify-center">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </button>

            {/* Notifications Dropdown */}
            {notificationsOpen && (
              <div className="absolute top-14 right-0 w-80 max-h-96 overflow-y-auto bg-slate-900/95 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl pointer-events-auto">
                {/* Header */}
                <div className="sticky top-0 bg-slate-900 border-b border-white/10 p-4 flex items-center justify-between">
                  <h3 className="text-sm font-black text-white uppercase tracking-wider">
                    Benachrichtigungen
                  </h3>
                  {unreadCount > 0 && (
                    <button
                      onClick={markAllAsRead}
                      className="text-[10px] font-bold text-indigo-400 hover:text-indigo-300 uppercase tracking-wider"
                    >
                      Alle lesen
                    </button>
                  )}
                </div>

                {/* Notifications List */}
                {notifications.length === 0 ? (
                  <div className="p-8 text-center">
                    <span className="text-4xl opacity-20">🔔</span>
                    <p className="text-sm text-slate-500 mt-2">Keine Benachrichtigungen</p>
                  </div>
                ) : (
                  <div className="divide-y divide-white/5">
                    {notifications.map((notification) => (
                      <div
                        key={notification.id}
                        onClick={() => handleNotificationClick(notification)}
                        className={`p-4 cursor-pointer transition-all hover:bg-white/5 ${
                          !notification.read ? 'bg-indigo-500/5' : ''
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          <span className="text-2xl flex-shrink-0">
                            {getNotificationIcon(notification.type)}
                          </span>
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-bold text-white leading-tight mb-1">
                              {notification.title}
                            </p>
                            <p className="text-[11px] text-slate-400 leading-snug">
                              {notification.message}
                            </p>
                            <div className="flex items-center justify-between mt-2">
                              <span className="text-[10px] text-slate-500 font-medium">
                                {formatTimeAgo(notification.created_at)}
                              </span>
                              {!notification.read && (
                                <span className="w-2 h-2 bg-indigo-500 rounded-full"></span>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Admin Tag */}
          {(user.role === 'admin' || user.role === 'moderator') && (
            <button
              onClick={() => navigate('/admin')}
              className="hidden md:block px-3 py-1.5 bg-red-500/10 border border-red-500/20 text-red-500 rounded-lg text-[10px] font-black uppercase tracking-tighter hover:bg-red-500 hover:text-white transition-all"
            >
              Admin
            </button>
          )}

          {/* User Info & Profile */}
          <div
            className="flex items-center gap-3 pl-4 border-l border-white/10 cursor-pointer group"
            onClick={() => navigate('/profile/edit')}
          >
            <div className="text-right hidden sm:block">
              <p className="text-xs font-black text-white uppercase italic tracking-tight group-hover:text-indigo-400 transition-colors">
                {user.name}
              </p>
              <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">
                @{user.username}
              </p>
            </div>
            <div className="w-10 h-10 bg-slate-800 rounded-full border-2 border-indigo-500/30 overflow-hidden group-hover:border-indigo-500 transition-all">
               <img
                 src={user.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.username}`}
                 alt="Avatar"
                 className="w-full h-full object-cover"
               />
            </div>
          </div>

          {/* Logout - Hidden on mobile */}
          <button
            onClick={handleLogout}
            className="hidden sm:flex w-10 h-10 items-center justify-center bg-slate-800 hover:bg-red-500/20 hover:text-red-500 text-slate-400 rounded-xl transition-all border border-white/5"
            title="Abmelden"
          >
            <span className="text-lg">🚪</span>
          </button>

          {/* Mobile Menu Toggle */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden w-10 h-10 flex items-center justify-center bg-slate-800 hover:bg-indigo-500/20 text-slate-400 hover:text-indigo-400 rounded-xl transition-all border border-white/5"
            title="Menü"
          >
            <span className="text-xl">{mobileMenuOpen ? '✕' : '☰'}</span>
          </button>
        </div>
      </div>
    </nav>

    {/* Mobile Menu Drawer */}
    {mobileMenuOpen && (
      <>
        {/* Backdrop */}
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[90] lg:hidden pointer-events-auto"
          onClick={() => setMobileMenuOpen(false)}
        />

        {/* Mobile Menu */}
        <div className="fixed top-24 right-4 left-4 z-[95] bg-slate-900/95 backdrop-blur-xl border border-white/10 rounded-3xl p-6 shadow-2xl lg:hidden pointer-events-auto">
          {/* Navigation Links */}
          <div className="flex flex-col gap-2 mb-6">
            <button
              onClick={() => handleNavigate('/')}
              className={`w-full px-5 py-3 rounded-xl text-sm font-black uppercase tracking-widest transition-all text-left ${
                isActive('/') ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/20' : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}
            >
              🏠 Spieler
            </button>
            <button
              onClick={() => handleNavigate('/sessions')}
              className={`w-full px-5 py-3 rounded-xl text-sm font-black uppercase tracking-widest transition-all text-left ${
                isActive('/sessions') ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/20' : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}
            >
              🎮 Sessions
            </button>
            <button
              onClick={() => handleNavigate('/calendar')}
              className={`w-full px-5 py-3 rounded-xl text-sm font-black uppercase tracking-widest transition-all text-left ${
                isActive('/calendar') ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/20' : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}
            >
              📅 Kalender
            </button>
            <button
              onClick={() => handleNavigate('/chat')}
              className={`w-full px-5 py-3 rounded-xl text-sm font-black uppercase tracking-widest transition-all text-left ${
                isActive('/chat') ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/20' : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}
            >
              💬 Chat
            </button>
            <button
              onClick={() => handleNavigate('/friends')}
              className={`w-full px-5 py-3 rounded-xl text-sm font-black uppercase tracking-widest transition-all text-left ${
                isActive('/friends') ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/20' : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}
            >
              👥 Freunde
            </button>
            <button
              onClick={() => handleNavigate('/statistics')}
              className={`w-full px-5 py-3 rounded-xl text-sm font-black uppercase tracking-widest transition-all text-left ${
                isActive('/statistics') ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/20' : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}
            >
              📊 Stats
            </button>

            {/* Admin Link (if applicable) */}
            {(user.role === 'admin' || user.role === 'moderator') && (
              <button
                onClick={() => handleNavigate('/admin')}
                className={`w-full px-5 py-3 rounded-xl text-sm font-black uppercase tracking-widest transition-all text-left ${
                  isActive('/admin') ? 'bg-red-600 text-white shadow-lg shadow-red-500/20' : 'bg-red-500/10 border border-red-500/20 text-red-500 hover:bg-red-500 hover:text-white'
                }`}
              >
                🔐 Admin
              </button>
            )}
          </div>

          {/* Logout Button */}
          <button
            onClick={handleLogout}
            className="w-full px-5 py-3 bg-slate-800 hover:bg-red-500/20 hover:text-red-500 text-slate-400 rounded-xl transition-all border border-white/5 text-sm font-black uppercase tracking-widest"
          >
            🚪 Abmelden
          </button>
        </div>
      </>
    )}
  </>
  );
}
