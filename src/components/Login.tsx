import React, { useState } from 'react';
import { Lock } from 'lucide-react';

interface LoginProps {
  onLoginSuccess: () => void;
}

export default function Login({ onLoginSuccess }: LoginProps) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        onLoginSuccess();
      } else {
        setError(data.error || 'Login failed');
      }
    } catch (err) {
      setError('A network error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl p-8 w-full max-w-md shadow-2xl">
        <div className="flex justify-center mb-6">
          <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center">
            <Lock className="w-8 h-8 text-blue-600" />
          </div>
        </div>
        
        <h2 className="text-2xl font-bold text-center text-slate-800 mb-2">Admin Login</h2>
        <p className="text-sm text-center text-slate-500 mb-8">
          Please sign in to access the CRM
        </p>

        {error && (
          <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm mb-6 text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">
              Username
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 text-slate-800 p-3 rounded-lg outline-none focus:border-blue-500 focus:bg-white transition-colors"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 text-slate-800 p-3 rounded-lg outline-none focus:border-blue-500 focus:bg-white transition-colors"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white font-bold py-3 rounded-lg mt-6 hover:bg-blue-700 transition-colors disabled:bg-blue-400"
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>
      </div>
    </div>
  );
}
