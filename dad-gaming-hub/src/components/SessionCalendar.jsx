import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

export default function SessionCalendar() {
  const navigate = useNavigate();
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState('month'); // month, week, day
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(null);

  useEffect(() => {
    loadSessions();
  }, [currentDate, viewMode]);

  const loadSessions = async () => {
    try {
      setLoading(true);
      const response = await api.get('/sessions');
      setSessions(response.data || []);
    } catch (error) {
      console.error('Error loading sessions:', error);
    } finally {
      setLoading(false);
    }
  };

  const getDaysInMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startDayOfWeek = firstDay.getDay();

    return { daysInMonth, startDayOfWeek, year, month };
  };

  const getSessionsForDate = (date) => {
    return sessions.filter(session => {
      const sessionDate = new Date(session.scheduled_date);
      return (
        sessionDate.getDate() === date.getDate() &&
        sessionDate.getMonth() === date.getMonth() &&
        sessionDate.getFullYear() === date.getFullYear()
      );
    });
  };

  const changeMonth = (direction) => {
    const newDate = new Date(currentDate);
    newDate.setMonth(newDate.getMonth() + direction);
    setCurrentDate(newDate);
  };

  const changeWeek = (direction) => {
    const newDate = new Date(currentDate);
    newDate.setDate(newDate.getDate() + (direction * 7));
    setCurrentDate(newDate);
  };

  const getWeekDays = () => {
    const startOfWeek = new Date(currentDate);
    startOfWeek.setDate(currentDate.getDate() - currentDate.getDay());

    const days = [];
    for (let i = 0; i < 7; i++) {
      const day = new Date(startOfWeek);
      day.setDate(startOfWeek.getDate() + i);
      days.push(day);
    }
    return days;
  };

  const formatTime = (date) => {
    return new Date(date).toLocaleTimeString('de-DE', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const renderMonthView = () => {
    const { daysInMonth, startDayOfWeek, year, month } = getDaysInMonth(currentDate);
    const days = [];
    const weekDays = ['So', 'Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa'];

    // Week day headers
    const headers = weekDays.map(day => (
      <div key={day} className="text-center text-[10px] font-black text-slate-500 uppercase tracking-wider py-2">
        {day}
      </div>
    ));

    // Empty cells before first day
    for (let i = 0; i < startDayOfWeek; i++) {
      days.push(<div key={`empty-${i}`} className="aspect-square"></div>);
    }

    // Days of month
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day);
      const daySessions = getSessionsForDate(date);
      const isToday = date.toDateString() === new Date().toDateString();
      const isSelected = selectedDate && date.toDateString() === selectedDate.toDateString();

      days.push(
        <div
          key={day}
          onClick={() => setSelectedDate(date)}
          className={`aspect-square p-1 border border-white/5 cursor-pointer hover:bg-white/5 transition-all ${
            isToday ? 'bg-indigo-500/10 border-indigo-500/30' : ''
          } ${isSelected ? 'bg-indigo-500/20 border-indigo-500' : ''}`}
        >
          <div className="flex flex-col h-full">
            <div className={`text-xs font-bold mb-1 ${isToday ? 'text-indigo-400' : 'text-slate-300'}`}>
              {day}
            </div>
            <div className="flex-1 overflow-hidden space-y-0.5">
              {daySessions.slice(0, 3).map(session => (
                <div
                  key={session.id}
                  onClick={(e) => {
                    e.stopPropagation();
                    navigate(`/sessions?id=${session.id}`);
                  }}
                  className="text-[8px] bg-indigo-500 text-white px-1 py-0.5 rounded truncate hover:bg-indigo-600"
                  title={`${session.title} - ${formatTime(session.scheduled_date)}`}
                >
                  {formatTime(session.scheduled_date)} {session.game}
                </div>
              ))}
              {daySessions.length > 3 && (
                <div className="text-[8px] text-slate-500 font-bold">+{daySessions.length - 3} mehr</div>
              )}
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className="grid grid-cols-7 gap-0 bg-slate-900/50 rounded-2xl overflow-hidden">
        {headers}
        {days}
      </div>
    );
  };

  const renderWeekView = () => {
    const weekDays = getWeekDays();
    const weekDayNames = ['Sonntag', 'Montag', 'Dienstag', 'Mittwoch', 'Donnerstag', 'Freitag', 'Samstag'];

    return (
      <div className="grid grid-cols-7 gap-2">
        {weekDays.map((day, index) => {
          const daySessions = getSessionsForDate(day);
          const isToday = day.toDateString() === new Date().toDateString();

          return (
            <div
              key={index}
              className={`bg-slate-900/50 rounded-2xl p-4 border ${
                isToday ? 'border-indigo-500/30 bg-indigo-500/5' : 'border-white/5'
              }`}
            >
              <div className="text-center mb-4">
                <div className={`text-[10px] font-black uppercase tracking-wider ${
                  isToday ? 'text-indigo-400' : 'text-slate-500'
                }`}>
                  {weekDayNames[day.getDay()]}
                </div>
                <div className={`text-2xl font-black ${isToday ? 'text-indigo-400' : 'text-white'}`}>
                  {day.getDate()}
                </div>
              </div>
              <div className="space-y-2">
                {daySessions.length === 0 ? (
                  <p className="text-xs text-slate-500 text-center py-4">Keine Sessions</p>
                ) : (
                  daySessions.map(session => (
                    <div
                      key={session.id}
                      onClick={() => navigate(`/sessions?id=${session.id}`)}
                      className="bg-slate-800 hover:bg-indigo-500/20 border border-white/5 hover:border-indigo-500/30 rounded-xl p-3 cursor-pointer transition-all"
                    >
                      <div className="text-xs font-black text-white mb-1">{session.game}</div>
                      <div className="text-[10px] text-slate-400">{formatTime(session.scheduled_date)}</div>
                      <div className="text-[10px] text-indigo-400 mt-1">{session.title}</div>
                    </div>
                  ))
                )}
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  const renderDayView = () => {
    const hours = Array.from({ length: 24 }, (_, i) => i);
    const daySessions = getSessionsForDate(currentDate);

    return (
      <div className="bg-slate-900/50 rounded-2xl p-6">
        <div className="text-center mb-6">
          <div className="text-3xl font-black text-white mb-1">
            {currentDate.toLocaleDateString('de-DE', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
          </div>
          <div className="text-sm text-slate-400">{daySessions.length} Session(s)</div>
        </div>
        <div className="space-y-1">
          {hours.map(hour => {
            const hourSessions = daySessions.filter(session => {
              const sessionHour = new Date(session.scheduled_date).getHours();
              return sessionHour === hour;
            });

            return (
              <div key={hour} className="flex items-start gap-4">
                <div className="w-16 text-right">
                  <span className="text-xs font-bold text-slate-500">{hour.toString().padStart(2, '0')}:00</span>
                </div>
                <div className="flex-1 border-l border-white/5 pl-4 min-h-[60px] flex flex-col justify-center gap-2">
                  {hourSessions.map(session => (
                    <div
                      key={session.id}
                      onClick={() => navigate(`/sessions?id=${session.id}`)}
                      className="bg-indigo-500/10 hover:bg-indigo-500/20 border border-indigo-500/30 hover:border-indigo-500 rounded-xl p-3 cursor-pointer transition-all"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-black text-white">{session.game}</span>
                        <span className="text-xs font-bold text-indigo-400">{formatTime(session.scheduled_date)}</span>
                      </div>
                      <div className="text-xs text-slate-300">{session.title}</div>
                      <div className="text-[10px] text-slate-500 mt-1">
                        {session.platform} • {session.duration} Min
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 pt-28 px-4 md:px-6 pb-24">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-center py-20">
            <div className="text-lg text-indigo-400 animate-pulse">Lade Kalender...</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 pt-28 px-4 md:px-6 pb-24">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl md:text-5xl font-black text-white uppercase italic tracking-tighter mb-2">
            Session <span className="text-indigo-500">Kalender</span>
          </h1>
          <p className="text-slate-400 text-sm">Alle geplanten Gaming-Sessions im Überblick</p>
        </div>

        {/* Controls */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-6">
          {/* View Mode Switcher */}
          <div className="flex items-center gap-2 bg-slate-900/50 p-1 rounded-xl border border-white/5">
            <button
              onClick={() => setViewMode('month')}
              className={`px-4 py-2 rounded-lg text-xs font-black uppercase tracking-wider transition-all ${
                viewMode === 'month' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/20' : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}
            >
              Monat
            </button>
            <button
              onClick={() => setViewMode('week')}
              className={`px-4 py-2 rounded-lg text-xs font-black uppercase tracking-wider transition-all ${
                viewMode === 'week' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/20' : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}
            >
              Woche
            </button>
            <button
              onClick={() => setViewMode('day')}
              className={`px-4 py-2 rounded-lg text-xs font-black uppercase tracking-wider transition-all ${
                viewMode === 'day' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/20' : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}
            >
              Tag
            </button>
          </div>

          {/* Date Navigation */}
          <div className="flex items-center gap-4">
            <button
              onClick={() => setCurrentDate(new Date())}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold uppercase tracking-wider rounded-lg transition-all border border-white/5"
            >
              Heute
            </button>
            <div className="flex items-center gap-2">
              <button
                onClick={() => viewMode === 'month' ? changeMonth(-1) : viewMode === 'week' ? changeWeek(-1) : setCurrentDate(new Date(currentDate.getTime() - 86400000))}
                className="w-10 h-10 flex items-center justify-center bg-slate-800 hover:bg-slate-700 text-white rounded-lg transition-all border border-white/5"
              >
                ←
              </button>
              <div className="min-w-[200px] text-center">
                <span className="text-lg font-black text-white">
                  {viewMode === 'month' && currentDate.toLocaleDateString('de-DE', { month: 'long', year: 'numeric' })}
                  {viewMode === 'week' && `KW ${Math.ceil((currentDate.getDate() + new Date(currentDate.getFullYear(), 0, 1).getDay()) / 7)}`}
                  {viewMode === 'day' && currentDate.toLocaleDateString('de-DE', { day: 'numeric', month: 'long', year: 'numeric' })}
                </span>
              </div>
              <button
                onClick={() => viewMode === 'month' ? changeMonth(1) : viewMode === 'week' ? changeWeek(1) : setCurrentDate(new Date(currentDate.getTime() + 86400000))}
                className="w-10 h-10 flex items-center justify-center bg-slate-800 hover:bg-slate-700 text-white rounded-lg transition-all border border-white/5"
              >
                →
              </button>
            </div>
          </div>
        </div>

        {/* Calendar View */}
        {viewMode === 'month' && renderMonthView()}
        {viewMode === 'week' && renderWeekView()}
        {viewMode === 'day' && renderDayView()}

        {/* Selected Date Info */}
        {selectedDate && viewMode === 'month' && (
          <div className="mt-6 bg-slate-900/50 rounded-2xl p-6 border border-white/5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-black text-white">
                {selectedDate.toLocaleDateString('de-DE', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
              </h3>
              <button
                onClick={() => setSelectedDate(null)}
                className="w-8 h-8 flex items-center justify-center bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white rounded-lg transition-all"
              >
                ✕
              </button>
            </div>
            <div className="space-y-2">
              {getSessionsForDate(selectedDate).length === 0 ? (
                <p className="text-sm text-slate-500 text-center py-4">Keine Sessions an diesem Tag</p>
              ) : (
                getSessionsForDate(selectedDate).map(session => (
                  <div
                    key={session.id}
                    onClick={() => navigate(`/sessions?id=${session.id}`)}
                    className="bg-slate-800 hover:bg-indigo-500/20 border border-white/5 hover:border-indigo-500/30 rounded-xl p-4 cursor-pointer transition-all"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <div className="text-sm font-black text-white mb-1">{session.title}</div>
                        <div className="text-xs text-indigo-400">{session.game} • {session.platform}</div>
                      </div>
                      <div className="text-xs font-bold text-slate-400">{formatTime(session.scheduled_date)}</div>
                    </div>
                    <div className="text-[11px] text-slate-500">{session.duration} Minuten • {session.voice_chat}</div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
