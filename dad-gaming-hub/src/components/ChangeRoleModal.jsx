import { useState } from 'react';

export default function ChangeRoleModal({ user, onConfirm, onClose }) {
  const [selectedRole, setSelectedRole] = useState(user.role);

  const roles = [
    { value: 'user', label: 'User', description: 'Normaler Benutzer' },
    { value: 'moderator', label: 'Moderator', description: 'Kann User bannen/entbannen' },
    { value: 'admin', label: 'Admin', description: 'Volle Berechtigung' }
  ];

  const handleSubmit = (e) => {
    e.preventDefault();
    onConfirm(user.id, selectedRole);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-800 rounded-lg max-w-md w-full p-6">
        <h3 className="text-xl font-bold text-white mb-4">Rolle ändern</h3>

        <div className="mb-4">
          <p className="text-gray-300">
            Rolle für <span className="font-bold text-white">{user.name}</span> (
            <span className="text-gray-400">@{user.username}</span>) ändern:
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="mb-6 space-y-3">
            {roles.map((role) => (
              <label
                key={role.value}
                className={`flex items-start p-4 rounded-lg border-2 cursor-pointer transition-colors ${
                  selectedRole === role.value
                    ? 'bg-blue-900/30 border-blue-500'
                    : 'bg-gray-700 border-gray-600 hover:border-gray-500'
                }`}
              >
                <input
                  type="radio"
                  name="role"
                  value={role.value}
                  checked={selectedRole === role.value}
                  onChange={(e) => setSelectedRole(e.target.value)}
                  className="mt-1 text-blue-600 focus:ring-blue-500"
                />
                <div className="ml-3">
                  <div className="text-white font-medium">{role.label}</div>
                  <div className="text-sm text-gray-400">{role.description}</div>
                </div>
              </label>
            ))}
          </div>

          <div className="flex space-x-3">
            <button
              type="submit"
              disabled={selectedRole === user.role}
              className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-medium py-2 px-4 rounded-lg transition-colors"
            >
              Ändern
            </button>
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-gray-700 hover:bg-gray-600 text-white font-medium py-2 px-4 rounded-lg transition-colors"
            >
              Abbrechen
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
