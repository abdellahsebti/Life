import React from 'react';
import { DailyLog } from '@/data/mockData';
import { Sparkles, Battery } from 'lucide-react';

export default function TodaySummary({ logs }: { logs: DailyLog[] }) {
  const today = new Date().toDateString();
  const todaysLog = logs.find(l => new Date(l.date).toDateString() === today);

  return (
    <div className="grid grid-cols-2 gap-4">
      <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-3xl p-5 border border-amber-100 flex flex-col items-center justify-center text-center relative overflow-hidden">
        <Sparkles className="w-5 h-5 text-amber-400 absolute top-4 right-4 opacity-50" />
        <span className="text-sm font-medium text-amber-700 mb-2">Today's Mood</span>
        <span className="text-4xl font-bold text-amber-600 mb-1">
          {todaysLog ? todaysLog.mood : '-'}
          <span className="text-lg text-amber-400 font-normal">/5</span>
        </span>
        <span className="text-xs text-amber-600/70">{todaysLog ? 'Logged' : 'Not logged yet'}</span>
      </div>

      <div className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-3xl p-5 border border-emerald-100 flex flex-col items-center justify-center text-center relative overflow-hidden">
        <Battery className="w-5 h-5 text-emerald-400 absolute top-4 right-4 opacity-50" />
        <span className="text-sm font-medium text-emerald-700 mb-2">Energy</span>
        <span className="text-4xl font-bold text-emerald-600 mb-1">
          {todaysLog ? todaysLog.energy : '-'}
          <span className="text-lg text-emerald-400 font-normal">/10</span>
        </span>
        <span className="text-xs text-emerald-600/70">{todaysLog ? 'Logged' : 'Not logged yet'}</span>
      </div>
    </div>
  );
}
