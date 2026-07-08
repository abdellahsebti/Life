import React from 'react';
import { Link, useLocation } from 'wouter';
import { LayoutDashboard, Users, LineChart, LogOut } from 'lucide-react';
import { supabase } from '@/lib/supabase-client';
import { Button } from '@/components/ui/button';

interface LayoutProps {
  children: React.ReactNode;
}

const NAV_ITEMS = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/contacts',  label: 'My People',  icon: Users           },
  { href: '/insights',  label: 'Insights',   icon: LineChart        },
];

export default function Layout({ children }: LayoutProps) {
  const [location] = useLocation();

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  return (
    <div className="min-h-[100dvh] flex flex-col md:flex-row bg-slate-50 text-slate-900">

      {/* ── Desktop Sidebar ───────────────────────────────────── */}
      <aside className="hidden md:flex flex-col w-64 border-r border-slate-100 bg-white px-3 py-8 shrink-0 fixed h-full z-10">

        {/* Brand */}
        <div className="flex items-center gap-2.5 px-3 mb-8">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 text-white flex items-center justify-center shadow-sm shadow-blue-200">
            <span className="text-lg leading-none">♥</span>
          </div>
          <span className="text-xl font-bold text-slate-900 tracking-tight">LifePulse</span>
        </div>

        {/* Nav links */}
        <nav className="flex-1 space-y-1" aria-label="Main navigation">
          {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
            const active = location === href;
            return (
              <Link key={href} href={href}>
                <span
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors duration-150 cursor-pointer
                    ${active
                      ? 'bg-blue-50 text-blue-700'
                      : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                    }`}
                >
                  <Icon className={`w-[18px] h-[18px] shrink-0 ${active ? 'text-blue-600' : 'text-slate-400'}`} />
                  {label}
                  {active && <span className="ml-auto w-1.5 h-1.5 rounded-full bg-blue-500" />}
                </span>
              </Link>
            );
          })}
        </nav>

        {/* Logout */}
        <Button
          variant="ghost"
          onClick={handleLogout}
          className="w-full justify-start gap-3 px-3 py-2.5 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-xl text-sm font-medium h-auto"
        >
          <LogOut className="w-[18px] h-[18px] shrink-0" />
          Log out
        </Button>
      </aside>

      {/* ── Main Content ─────────────────────────────────────── */}
      <main className="flex-1 md:ml-64 pb-20 md:pb-0 min-w-0">
        <div className="max-w-6xl mx-auto p-4 md:p-8 animate-in fade-in duration-500">
          {children}
        </div>
      </main>

      {/* ── Mobile Bottom Nav ────────────────────────────────── */}
      <nav
        aria-label="Mobile navigation"
        className="md:hidden fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-sm border-t border-slate-100 pb-safe z-50"
      >
        <div className="flex justify-around px-2 pt-2 pb-3">
          {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
            const active = location === href;
            return (
              <Link key={href} href={href}>
                <span className={`flex flex-col items-center gap-1 px-4 py-1 rounded-xl transition-colors cursor-pointer
                  ${active ? 'text-blue-600' : 'text-slate-500 hover:text-slate-700'}`}>
                  <div className={`p-1.5 rounded-xl ${active ? 'bg-blue-50' : ''}`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <span className={`text-[10px] font-semibold ${active ? 'text-blue-600' : 'text-slate-500'}`}>
                    {label}
                  </span>
                </span>
              </Link>
            );
          })}

          <button
            onClick={handleLogout}
            className="flex flex-col items-center gap-1 px-4 py-1 rounded-xl text-slate-500 hover:text-red-500 transition-colors"
          >
            <div className="p-1.5 rounded-xl">
              <LogOut className="w-5 h-5" />
            </div>
            <span className="text-[10px] font-semibold">Log out</span>
          </button>
        </div>
      </nav>
    </div>
  );
}
