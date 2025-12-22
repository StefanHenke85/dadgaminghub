import { useState, useEffect } from 'react';
import api from '../services/api';
import BanUserModal from './BanUserModal';
import ConfirmModal from './ConfirmModal';
import ChangeRoleModal from './ChangeRoleModal';

export default function UserManagement({ userRole }) {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0
  });

  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [bannedFilter, setBannedFilter] = useState('');

  // Modals
  const [banModal, setBanModal] = useState({ show: false, user: null });
  const [unbanModal, setUnbanModal] = useState({ show: false, user: null });
  const [deleteModal, setDeleteModal] = useState({ show: false, user: null });
  const [roleModal, setRoleModal] = useState({ show: false, user: null });

  useEffect(() => {
    loadUsers();
  }, [pagination.page, searchTerm, roleFilter, bannedFilter]);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const params = {
        page: pagination.page,
        limit: pagination.limit,
        ...(searchTerm && { search: searchTerm }),
        ...(roleFilter && { role: roleFilter }),
        ...(bannedFilter && { banned: bannedFilter })
      };

      const response = await api.get('/admin/users', { params });
      setUsers(response.data.users);
      setPagination(response.data.pagination);
      setError('');
    } catch (err) {
      setError(err.response?.data?.error || 'Fehler beim Laden der Benutzer');
    } finally {
      setLoading(false);
    }
  };

  const handleBan = async (userId, reason) => {
    try {
      await api.post(`/admin/users/${userId}/ban`, { reason });
      setBanModal({ show: false, user: null });
      loadUsers();
    } catch (err) {
      alert(err.response?.data?.error || 'Fehler beim Bannen');
    }
  };

  const handleUnban = async (userId) => {
    try {
      await api.post(`/admin/users/${userId}/unban`);
      setUnbanModal({ show: false, user: null });
      loadUsers();
    } catch (err) {
      alert(err.response?.data?.error || 'Fehler beim Entbannen');
    }
  };

  const handleDelete = async (userId) => {
    try {
      await api.delete(`/admin/users/${userId}`);
      setDeleteModal({ show: false, user: null });
      loadUsers();
    } catch (err) {
      alert(err.response?.data?.error || 'Fehler beim Löschen');
    }
  };

  const handleChangeRole = async (userId, newRole) => {
    try {
      await api.put(`/admin/users/${userId}/role`, { role: newRole });
      setRoleModal({ show: false, user: null });
      loadUsers();
    } catch (err) {
      alert(err.response?.data?.error || 'Fehler beim Ändern der Rolle');
    }
  };

  const getRoleBadgeColor = (role) => {
    switch (role) {
      case 'admin':
        return 'bg-purple-600';
      case 'moderator':
        return 'bg-blue-600';
      default:
        return 'bg-gray-600';
    }
  };

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="bg-gray-800 border border-gray-700 rounded-lg p-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <input
            type="text"
            placeholder="Suchen (Name/Username)..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />

          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Alle Rollen</option>
            <option value="user">User</option>
            <option value="moderator">Moderator</option>
            <option value="admin">Admin</option>
          </select>

          <select
            value={bannedFilter}
            onChange={(e) => setBannedFilter(e.target.value)}
            className="bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Alle Status</option>
            <option value="false">Aktiv</option>
            <option value="true">Gebannt</option>
          </select>

          <button
            onClick={() => {
              setSearchTerm('');
              setRoleFilter('');
              setBannedFilter('');
            }}
            className="bg-gray-700 hover:bg-gray-600 text-white rounded-lg px-4 py-2 transition-colors"
          >
            Filter zurücksetzen
          </button>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="bg-red-900/20 border border-red-700 rounded-lg p-4">
          <p className="text-red-400">{error}</p>
        </div>
      )}

      {/* Users Table */}
      <div className="bg-gray-800 border border-gray-700 rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-900">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Benutzer
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Rolle
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Registriert
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Aktionen
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700">
              {loading ? (
                <tr>
                  <td colSpan="5" className="px-6 py-4 text-center text-gray-400">
                    Lade Benutzer...
                  </td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-6 py-4 text-center text-gray-400">
                    Keine Benutzer gefunden
                  </td>
                </tr>
              ) : (
                users.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-700/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <img
                          src={user.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.username}`}
                          alt={user.name}
                          className="w-10 h-10 rounded-full"
                        />
                        <div className="ml-4">
                          <div className="text-sm font-medium text-white">{user.name}</div>
                          <div className="text-sm text-gray-400">@{user.username}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium text-white ${getRoleBadgeColor(
                          user.role
                        )}`}
                      >
                        {user.role}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {user.is_banned ? (
                        <div>
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-600 text-white">
                            Gebannt
                          </span>
                          {user.banned_reason && (
                            <p className="text-xs text-gray-400 mt-1">
                              Grund: {user.banned_reason}
                            </p>
                          )}
                        </div>
                      ) : user.online ? (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-600 text-white">
                          Online
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-600 text-white">
                          Offline
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-400">
                      {new Date(user.created_at).toLocaleDateString('de-DE')}
                    </td>
                    <td className="px-6 py-4 text-right text-sm font-medium space-x-2">
                      {user.is_banned ? (
                        <button
                          onClick={() => setUnbanModal({ show: true, user })}
                          className="text-green-400 hover:text-green-300 transition-colors"
                        >
                          Entbannen
                        </button>
                      ) : (
                        <button
                          onClick={() => setBanModal({ show: true, user })}
                          className="text-red-400 hover:text-red-300 transition-colors"
                        >
                          Bannen
                        </button>
                      )}

                      {userRole === 'admin' && (
                        <>
                          <button
                            onClick={() => setRoleModal({ show: true, user })}
                            className="text-blue-400 hover:text-blue-300 transition-colors"
                          >
                            Rolle
                          </button>
                          {user.role !== 'admin' && (
                            <button
                              onClick={() => setDeleteModal({ show: true, user })}
                              className="text-red-400 hover:text-red-300 transition-colors"
                            >
                              Löschen
                            </button>
                          )}
                        </>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <div className="bg-gray-900 px-6 py-4 flex items-center justify-between">
            <div className="text-sm text-gray-400">
              Seite {pagination.page} von {pagination.totalPages} ({pagination.total} Benutzer)
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

      {/* Modals */}
      {banModal.show && (
        <BanUserModal
          user={banModal.user}
          onConfirm={handleBan}
          onClose={() => setBanModal({ show: false, user: null })}
        />
      )}

      {unbanModal.show && (
        <ConfirmModal
          title="Benutzer entsperren"
          message={`Möchtest du ${unbanModal.user.name} (@${unbanModal.user.username}) wirklich entsperren?`}
          confirmText="Entsperren"
          onConfirm={() => handleUnban(unbanModal.user.id)}
          onClose={() => setUnbanModal({ show: false, user: null })}
        />
      )}

      {deleteModal.show && (
        <ConfirmModal
          title="Benutzer löschen"
          message={`Möchtest du ${deleteModal.user.name} (@${deleteModal.user.username}) wirklich PERMANENT löschen? Diese Aktion kann nicht rückgängig gemacht werden!`}
          confirmText="Löschen"
          confirmColor="red"
          onConfirm={() => handleDelete(deleteModal.user.id)}
          onClose={() => setDeleteModal({ show: false, user: null })}
        />
      )}

      {roleModal.show && (
        <ChangeRoleModal
          user={roleModal.user}
          onConfirm={handleChangeRole}
          onClose={() => setRoleModal({ show: false, user: null })}
        />
      )}
    </div>
  );
}
