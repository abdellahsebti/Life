import React, { useState } from 'react';
import { supabase } from '@/lib/supabase-client';

type Mode = 'login' | 'register';

export default function AuthScreen() {
  const [mode, setMode] = useState<Mode>('login');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');
    setLoading(true);

    try {
      if (mode === 'login') {
        const res = await fetch('/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password }),
        });
        const json = await res.json();
        if (!res.ok) throw new Error(typeof json.error === 'string' ? json.error : 'Login failed');

        // Set the session in the Supabase client so the app picks it up
        await supabase.auth.setSession({
          access_token: json.session.access_token,
          refresh_token: json.session.refresh_token,
        });
      } else {
        const res = await fetch('/api/auth/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password, name }),
        });
        const json = await res.json();
        if (!res.ok) throw new Error(typeof json.error === 'string' ? json.error : 'Registration failed');

        if (json.session) {
          await supabase.auth.setSession({
            access_token: json.session.access_token,
            refresh_token: json.session.refresh_token,
          });
        } else {
          setSuccessMsg('Account created! Check your email to confirm before logging in.');
        }
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[100dvh] flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-indigo-50 p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="flex items-center justify-center gap-3 mb-8">
          <div className="w-12 h-12 rounded-2xl bg-blue-500 text-white flex items-center justify-center shadow-lg shadow-blue-200">
            <span className="text-2xl leading-none">♥</span>
          </div>
          <h1 className="text-3xl font-bold text-blue-500">LifePulse</h1>
        </div>

        {/* Card */}
        <div className="bg-white rounded-3xl shadow-xl shadow-slate-100 border border-slate-100 p-8">
          {/* Tab toggle */}
          <div className="flex bg-slate-100 rounded-2xl p-1 mb-8">
            {(['login', 'register'] as Mode[]).map((m) => (
              <button
                key={m}
                onClick={() => { setMode(m); setError(''); setSuccessMsg(''); }}
                className={`flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 ${
                  mode === m
                    ? 'bg-white text-blue-600 shadow-sm'
                    : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                {m === 'login' ? 'Log In' : 'Create Account'}
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === 'register' && (
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  Your name
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Jane Smith"
                  className="w-full px-4 py-3 rounded-2xl border border-slate-200 bg-slate-50 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-300 focus:border-blue-300 transition"
                />
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                Email
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full px-4 py-3 rounded-2xl border border-slate-200 bg-slate-50 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-300 focus:border-blue-300 transition"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                Password
              </label>
              <input
                type="password"
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="At least 6 characters"
                className="w-full px-4 py-3 rounded-2xl border border-slate-200 bg-slate-50 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-300 focus:border-blue-300 transition"
              />
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 text-sm px-4 py-3 rounded-2xl">
                {error}
              </div>
            )}

            {successMsg && (
              <div className="bg-green-50 border border-green-200 text-green-600 text-sm px-4 py-3 rounded-2xl">
                {successMsg}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 rounded-2xl bg-blue-500 hover:bg-blue-600 active:bg-blue-700 text-white font-semibold text-base transition-colors duration-200 disabled:opacity-60 disabled:cursor-not-allowed shadow-md shadow-blue-100 mt-2"
            >
              {loading
                ? 'Please wait…'
                : mode === 'login'
                ? 'Log In'
                : 'Create Account'}
            </button>
          </form>

          <p className="text-center text-xs text-slate-400 mt-6">
            Your wellness data is private and secure.
          </p>
        </div>
      </div>
    </div>
  );
}
