import React from 'react';
import { DailyLog } from '@/data/mockData';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { format, parseISO, subDays } from 'date-fns';

export default function MoodTrend({ logs }: { logs: DailyLog[] }) {
  // Get last 7 days
  const last7Days = Array.from({ length: 7 }).map((_, i) => {
    const date = subDays(new Date(), 6 - i);
    const dateStr = date.toISOString().split('T')[0];
    
    // Find log for this day
    const log = logs.find(l => l.date.startsWith(dateStr));
    
    return {
      name: format(date, 'EEE'), // Mon, Tue, etc.
      mood: log ? log.mood : 0,
      fullDate: date,
    };
  });

  const getBarColor = (mood: number) => {
    if (mood === 0) return '#e2e8f0'; // slate-200
    if (mood <= 2) return '#94a3b8'; // slate-400
    if (mood === 3) return '#60a5fa'; // blue-400
    if (mood === 4) return '#3b82f6'; // blue-500
    return '#2563eb'; // blue-600
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const val = payload[0].value;
      return (
        <div className="bg-white p-3 rounded-xl shadow-lg border border-slate-100 text-sm">
          <p className="font-bold text-slate-800 mb-1">{label}</p>
          {val > 0 ? (
            <p className="text-slate-600">Mood: <span className="font-semibold text-blue-600">{val}/5</span></p>
          ) : (
            <p className="text-slate-400">No log for this day</p>
          )}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 h-full flex flex-col">
      <h2 className="text-xl font-bold text-slate-800 mb-6">Mood Trend (Last 7 Days)</h2>
      <div className="flex-1 min-h-[200px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={last7Days} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
            <XAxis 
              dataKey="name" 
              axisLine={false} 
              tickLine={false} 
              tick={{ fontSize: 12, fill: '#94a3b8' }}
              dy={10}
            />
            <YAxis 
              domain={[0, 5]} 
              axisLine={false} 
              tickLine={false}
              tick={{ fontSize: 12, fill: '#94a3b8' }}
              dx={-10}
            />
            <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(241, 245, 249, 0.5)' }} />
            <Bar dataKey="mood" radius={[6, 6, 6, 6]} maxBarSize={40}>
              {last7Days.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={getBarColor(entry.mood)} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
