import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

export default function ProfileEdit() {
  const { user, updateProfile } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [uploading, setUploading] = useState(false);

  const [formData, setFormData] = useState({
    name: user?.name || '',
    age: user?.age || '',
    kids: user?.kids || 0,
    bio: user?.bio || '',
    platforms: user?.platforms || [],
    games: user?.games || [],
    availability: user?.availability || [],
    time_preference: user?.time_preference || '',
    discord: user?.discord || '',
    psn: user?.psn || '',
    xbox: user?.xbox || '',
    steam: user?.steam || '',
    switch: user?.switch || ''
  });

  const platformOptions = ['PS4', 'PS5', 'Xbox One', 'Xbox Series X/S', 'PC', 'Nintendo Switch', 'Mobile'];
  const availabilityOptions = ['Wochentags abends', 'Wochenende', 'Nachts', 'Flexibel'];
  const timePreferences = [
    'Morgens (6-12 Uhr)',
    'Mittags (12-18 Uhr)',
    'Abends (18-22 Uhr)',
    'Nachts (22-2 Uhr)',
    'Spätnachts (2-6 Uhr)',
    'Flexibel'
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleCheckbox = (name, value) => {
    setFormData(prev => {
      const current = prev[name] || [];
      const updated = current.includes(value)
        ? current.filter(item => item !== value)
        : [...current, value];
      return { ...prev, [name]: updated };
    });
  };

  const handleAvatarUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      setError('Bild darf maximal 10MB groß sein');
      return;
    }

    setUploading(true);
    setError('');

    const formData = new FormData();
    formData.append('avatar', file);

    try {
      const response = await fetch('http://localhost:5000/api/auth/upload-avatar', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: formData
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess(true);
        window.location.reload();
      } else {
        setError(data.error || 'Upload fehlgeschlagen');
      }
    } catch (err) {
      setError('Upload fehlgeschlagen');
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess(false);

    const result = await updateProfile(formData);

    if (result.success) {
      setSuccess(true);
      setTimeout(() => navigate('/'), 2000);
    } else {
      setError(result.error);
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-2xl shadow-2xl p-8">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-3xl font-bold text-gray-800">Profil bearbeiten</h1>
            <button
              onClick={() => navigate('/')}
              className="text-gray-600 hover:text-gray-800"
            >
              Zurück
            </button>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">
              {error}
            </div>
          )}

          {success && (
            <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg mb-4">
              Profil erfolgreich aktualisiert!
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Avatar Upload */}
            <div className="flex flex-col items-center pb-6 border-b">
              <div className="relative">
                <img
                  src={user?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.username || 'User')}&size=128`}
                  alt="Avatar"
                  className="w-32 h-32 rounded-full object-cover border-4 border-blue-500"
                />
                <label className="absolute bottom-0 right-0 bg-blue-600 hover:bg-blue-700 text-white p-2 rounded-full cursor-pointer shadow-lg">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleAvatarUpload}
                    className="hidden"
                    disabled={uploading}
                  />
                  📷
                </label>
              </div>
              {uploading && <p className="mt-2 text-sm text-gray-600">Upload läuft...</p>}
              <p className="mt-2 text-sm text-gray-500">Max. 2MB</p>
            </div>

            {/* Basic Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Name</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Alter</label>
                <input
                  type="number"
                  name="age"
                  value={formData.age}
                  onChange={handleChange}
                  min="18"
                  max="99"
                  className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Anzahl Kinder</label>
                <input
                  type="number"
                  name="kids"
                  value={formData.kids}
                  onChange={handleChange}
                  min="0"
                  max="10"
                  className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
                />
              </div>
            </div>

            {/* Bio */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Über mich</label>
              <textarea
                name="bio"
                value={formData.bio}
                onChange={handleChange}
                rows="4"
                className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
                placeholder="Erzähle etwas über dich..."
              />
            </div>

            {/* Platforms */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Plattformen</label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {platformOptions.map(platform => (
                  <label key={platform} className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.platforms.includes(platform)}
                      onChange={() => handleCheckbox('platforms', platform)}
                      className="w-4 h-4 text-blue-600"
                    />
                    <span className="text-sm">{platform}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Gaming IDs */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Discord</label>
                <input
                  type="text"
                  name="discord"
                  value={formData.discord}
                  onChange={handleChange}
                  placeholder="username#1234"
                  className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">PSN</label>
                <input
                  type="text"
                  name="psn"
                  value={formData.psn}
                  onChange={handleChange}
                  placeholder="PSN ID"
                  className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Xbox</label>
                <input
                  type="text"
                  name="xbox"
                  value={formData.xbox}
                  onChange={handleChange}
                  placeholder="Gamertag"
                  className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Steam</label>
                <input
                  type="text"
                  name="steam"
                  value={formData.steam}
                  onChange={handleChange}
                  placeholder="Steam ID"
                  className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Switch</label>
                <input
                  type="text"
                  name="switch"
                  value={formData.switch}
                  onChange={handleChange}
                  placeholder="Friend Code"
                  className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
                />
              </div>
            </div>

            {/* Availability */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Verfügbarkeit</label>
              <div className="grid grid-cols-2 gap-2">
                {availabilityOptions.map(option => (
                  <label key={option} className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.availability.includes(option)}
                      onChange={() => handleCheckbox('availability', option)}
                      className="w-4 h-4 text-blue-600"
                    />
                    <span className="text-sm">{option}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Time Preference */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Bevorzugte Spielzeit</label>
              <select
                name="time_preference"
                value={formData.time_preference}
                onChange={handleChange}
                className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
              >
                <option value="">Wähle eine Zeit</option>
                {timePreferences.map(time => (
                  <option key={time} value={time}>{time}</option>
                ))}
              </select>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white py-3 rounded-lg font-semibold transition-all shadow-lg hover:shadow-xl disabled:opacity-50"
            >
              {loading ? 'Speichern...' : 'Profil speichern'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
