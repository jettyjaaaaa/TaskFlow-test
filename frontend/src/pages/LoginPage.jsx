import React, { useState } from 'react';
import { useStore } from '../store/useStore';

export default function LoginPage() {
  const [email, setEmail] = useState('user1@taskflow.com');
  const [password, setPassword] = useState('password123');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useStore();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login(email, password);
    } catch (err) {
      setError(err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = (user) => {
    setEmail(user.email);
    setPassword('password123');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 to-blue-800 flex items-center justify-center">
      <div className="bg-white rounded-lg shadow-2xl p-8 max-w-md w-full">
        <h1 className="text-3xl font-bold text-center mb-2 text-gray-800">TaskFlow</h1>
        <p className="text-center text-gray-600 mb-6">Task Management Dashboard</p>

        {error && (
          <div className="mb-4 p-3 bg-red-100 text-red-700 rounded text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Email address"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Password"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
          >
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>

        <div className="border-t pt-6">
          <p className="text-sm text-gray-600 text-center mb-3">Demo Users:</p>
          <div className="space-y-2">
            {[
              { name: 'Alice (Admin)', email: 'user1@taskflow.com' },
              { name: 'Bob', email: 'user2@taskflow.com' },
              { name: 'Carol', email: 'user3@taskflow.com' },
              { name: 'David', email: 'user4@taskflow.com' },
              { name: 'Emma', email: 'user5@taskflow.com' }
            ].map((user) => (
              <button
                key={user.email}
                onClick={() => handleDemoLogin(user)}
                className="w-full text-sm text-gray-700 hover:text-blue-600 py-1 px-2 rounded hover:bg-gray-100 transition"
              >
                {user.name}
              </button>
            ))}
          </div>
        </div>

        <p className="text-xs text-gray-500 text-center mt-6">
          Password: password123
        </p>
      </div>
    </div>
  );
}
