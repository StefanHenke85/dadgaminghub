import { useState, useEffect } from 'react';
import api from '../services/api';

export default function AdminLogs() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 50,
    total: 0,
    totalPages: 0
  });

  const [actionFilter, setActionFilter] = useState('');

  useEffect(() => {
    loadLogs();
  }, [pagination.page, actionFilter]);

  const loadLogs = async () => {
    try {
      setLoading(true);
      const params = {
        page: pagination.page,
        limit: pagination.limit,
        ...(actionFilter && { action: actionFilter })
      };

      const response = await api.get('/admin/logs', { params });
      setLogs(response.data.logs);
      setPagination(response.data.pagination);
      setError('');
    } catch (err) {
      setError(err.response?.data?.error || 'Fehler beim Laden der Logs');
    } finally {
      setLoading(false);
    }
  };

  const getActionLabel = (action) => {
    const labels = {
      ban_user: 'User gebannt',
      unban_user: 'User entsperrt',
      delete_user: 'User gelöscht',
      update_role: 'Rolle geändert'
    };
    return labels[action] || action;
  };

  const getActionColor = (action) => {
    const colors = {
      ban_user: 'text-red-400',
      unban_user: 'text-green-400',
      delete_user: 'text-red-600',
      update_role: 'text-blue-400'
    };
    return colors[action] || 'text-gray-400';
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('de-DE', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    }).format(date);
  };

  return (
    <div className="space-y-6">
      {/* Filter */}
      <div className="bg-gray-800 border border-gray-700 rounded-lg p-4">
        <div className="flex items-center space-x-4">
          <label className="text-sm font-medium text-gray-300">Aktion filtern:</label>
          <select
            value={actionFilter}
            onChange={(e) => setActionFilter(e.target.value)}
            className="bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Alle Aktionen</option>
            <option value="ban_user">User gebannt</option>
            <option value="unban_user">User entsperrt</option>
            <option value="delete_user">User gelöscht</option>
            <option value="update_role">Rolle geändert</option>
          </select>
          {actionFilter && (
            <button
              onClick={() => setActionFilter('')}
              className="text-sm text-blue-400 hover:text-blue-300 transition-colors"
            >
              Filter zurücksetzen
            </button>
          )}
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="bg-red-900/20 border border-red-700 rounded-lg p-4">
          <p className="text-red-400">{error}</p>
        </div>
      )}

      {/* Logs */}
      <div className="bg-gray-800 border border-gray-700 rounded-lg overflow-hidden">
        {loading ? (
          <div className="p-6 text-center text-gray-400">Lade Logs...</div>
        ) : logs.length === 0 ? (
          <div className="p-6 text-center text-gray-400">Keine Logs gefunden</div>
        ) : (
          <div className="divide-y divide-gray-700">
            {logs.map((log) => (
              <div key={log.id} className="p-4 hover:bg-gray-700/50 transition-colors">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <span className={`font-medium ${getActionColor(log.action)}`}>
                        {getActionLabel(log.action)}
                      </span>
                      <span className="text-gray-500">•</span>
                      <span className="text-sm text-gray-400">
                        {formatDate(log.created_at)}
                      </span>
                    </div>

                    <div className="text-sm text-gray-300 space-y-1">
                      {log.admin && (
                        <p>
                          <span className="text-gray-400">Admin:</span>{' '}
                          <span className="font-medium text-white">
                            {log.admin.name} (@{log.admin.username})
                          </span>
                        </p>
                      )}

                      {log.target && (
                        <p>
                          <span className="text-gray-400">Betroffen:</span>{' '}
                          <span className="font-medium text-white">
                            {log.target.name} (@{log.target.username})
                          </span>
                        </p>
                      )}

                      {log.details && (
                        <div className="mt-2 p-2 bg-gray-900 rounded text-xs">
                          {log.details.reason && (
                            <p>
                              <span className="text-gray-400">Grund:</span>{' '}
                              <span className="text-gray-300">{log.details.reason}</span>
                            </p>
                          )}
                          {log.details.new_role && (
                            <p>
                              <span className="text-gray-400">Neue Rolle:</span>{' '}
                              <span className="text-gray-300">{log.details.new_role}</span>
                            </p>
                          )}
                          {log.details.username && (
                            <p>
                              <span className="text-gray-400">Username:</span>{' '}
                              <span className="text-gray-300">@{log.details.username}</span>
                            </p>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <div className="bg-gray-900 px-6 py-4 flex items-center justify-between border-t border-gray-700">
            <div className="text-sm text-gray-400">
              Seite {pagination.page} von {pagination.totalPages} ({pagination.total} Logs)
            </div>
            <div className="flex space-x-2">
              <button
                onClick={() => setPagination({ ...pagination, page: pagination.page - 1 })}
                disabled={pagination.page === 1}
                className="px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Zurück
              </button>
              <button
                onClick={() => setPagination({ ...pagination, page: pagination.page + 1 })}
                disabled={pagination.page === pagination.totalPages}
                className="px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Weiter
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
