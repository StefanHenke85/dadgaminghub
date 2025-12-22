import { useState } from 'react';
import { supabase } from '../lib/supabase';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setMessage('');

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (error) throw error;

      setMessage(
        'Wir haben dir eine E-Mail mit einem Link zum Zurücksetzen deines Passworts geschickt. Bitte überprüfe dein Postfach.'
      );
      setEmail('');
    } catch (err) {
      setError(err.message || 'Fehler beim Senden der E-Mail');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 flex items-center justify-center p-4">
      <div className="bg-gray-800 rounded-lg shadow-xl p-8 w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Passwort vergessen?</h1>
          <p className="text-gray-400">
            Gib deine E-Mail-Adresse ein und wir schicken dir einen Link zum Zurücksetzen.
          </p>
        </div>

        {message && (
          <div className="mb-6 bg-green-900/20 border border-green-700 rounded-lg p-4">
            <p className="text-green-400 text-sm">{message}</p>
          </div>
        )}

        {error && (
          <div className="mb-6 bg-red-900/20 border border-red-700 rounded-lg p-4">
            <p className="text-red-400 text-sm">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-300 mb-2">
              E-Mail-Adresse
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="deine@email.com"
              className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white font-medium py-3 px-4 rounded-lg transition-colors disabled:cursor-not-allowed"
          >
            {loading ? 'Sende E-Mail...' : 'Passwort zurücksetzen'}
          </button>
        </form>

        <div className="mt-6 text-center">
          <a href="/login" className="text-blue-400 hover:text-blue-300 transition-colors">
            Zurück zum Login
          </a>
        </div>
      </div>
    </div>
  );
}
