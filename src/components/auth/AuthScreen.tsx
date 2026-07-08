import React, { useState, useId } from 'react';
import { supabase } from '@/lib/supabase-client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Loader2, Mail, Lock, User, AlertCircle, CheckCircle2 } from 'lucide-react';

type Mode = 'login' | 'register';

export default function AuthScreen() {
  const uid = useId();
  const [mode, setMode]         = useState<Mode>('login');
  const [name, setName]         = useState('');
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [error, setError]       = useState('');
  const [success, setSuccess]   = useState('');
  const [loading, setLoading]   = useState(false);

  const switchMode = (m: Mode) => { setMode(m); setError(''); setSuccess(''); };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(''); setSuccess('');
    setLoading(true);
    try {
      if (mode === 'login') {
        const res  = await fetch('/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password }),
        });
        const json = await res.json();
        if (!res.ok) throw new Error(typeof json.error === 'string' ? json.error : 'Login failed');
        await supabase.auth.setSession({ access_token: json.session.access_token, refresh_token: json.session.refresh_token });
      } else {
        const res  = await fetch('/api/auth/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password, name }),
        });
        const json = await res.json();
        if (!res.ok) throw new Error(typeof json.error === 'string' ? json.error : 'Registration failed');
        if (json.session) {
          await supabase.auth.setSession({ access_token: json.session.access_token, refresh_token: json.session.refresh_token });
        } else {
          setSuccess('Account created! Check your email to confirm before logging in.');
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
      <div className="w-full max-w-sm">

        {/* Brand */}
        <div className="flex items-center justify-center gap-3 mb-8">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 text-white flex items-center justify-center shadow-lg shadow-blue-200">
            <span className="text-xl leading-none">♥</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">LifePulse</h1>
        </div>

        {/* Card */}
        <div className="bg-white rounded-3xl shadow-lg shadow-slate-100/80 border border-slate-100 overflow-hidden">

          {/* Tab toggle */}
          <div className="flex border-b border-slate-100">
            {(['login', 'register'] as Mode[]).map((m) => (
              <button
                key={m}
                onClick={() => switchMode(m)}
                aria-selected={mode === m}
                className={`flex-1 py-4 text-sm font-semibold transition-colors duration-150
                  ${mode === m
                    ? 'text-blue-600 border-b-2 border-blue-500 -mb-px bg-white'
                    : 'text-slate-500 hover:text-slate-700 bg-slate-50/60'
                  }`}
              >
                {m === 'login' ? 'Log In' : 'Create Account'}
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            {/* Name — register only */}
            {mode === 'register' && (
              <div className="space-y-1.5">
                <label htmlFor={`${uid}-name`} className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                  Your name
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" aria-hidden />
                  <Input
                    id={`${uid}-name`}
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Jane Smith"
                    autoComplete="name"
                    className="pl-9 h-11 rounded-xl border-slate-200 bg-slate-50 focus:bg-white"
                  />
                </div>
              </div>
            )}

            {/* Email */}
            <div className="space-y-1.5">
              <label htmlFor={`${uid}-email`} className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" aria-hidden />
                <Input
                  id={`${uid}-email`}
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  autoComplete="email"
                  className="pl-9 h-11 rounded-xl border-slate-200 bg-slate-50 focus:bg-white"
                />
              </div>
            </div>

            {/* Password */}
            <div className="space-y-1.5">
              <label htmlFor={`${uid}-pw`} className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" aria-hidden />
                <Input
                  id={`${uid}-pw`}
                  type="password"
                  required
                  minLength={6}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="At least 6 characters"
                  autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
                  className="pl-9 h-11 rounded-xl border-slate-200 bg-slate-50 focus:bg-white"
                />
              </div>
            </div>

            {/* Error */}
            {error && (
              <div role="alert" className="flex items-start gap-2.5 bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-xl">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            {/* Success */}
            {success && (
              <div role="status" className="flex items-start gap-2.5 bg-emerald-50 border border-emerald-200 text-emerald-700 text-sm px-4 py-3 rounded-xl">
                <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{success}</span>
              </div>
            )}

            {/* Submit */}
            <Button
              type="submit"
              disabled={loading}
              className="w-full h-11 rounded-xl mt-1 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white border-0 font-semibold shadow-md shadow-blue-100 hover:shadow-lg hover:shadow-blue-200 transition-all"
            >
              {loading
                ? <><Loader2 className="w-4 h-4 animate-spin" /> Please wait…</>
                : mode === 'login' ? 'Log In' : 'Create Account'}
            </Button>
          </form>

          <p className="text-center text-[11px] text-slate-400 pb-5 -mt-1">
            Your wellness data is private and secure.
          </p>
        </div>
      </div>
    </div>
  );
}
