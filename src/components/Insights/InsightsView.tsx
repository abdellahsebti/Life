import React, { useState, useEffect } from 'react';
import { api } from '@/services/api';
import { DailyLog } from '@/data/mockData';
import { Loader2, Lightbulb } from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend
} from 'recharts';
import { format, parseISO } from 'date-fns';

export default function InsightsView() {
  const [logs, setLogs] = useState<DailyLog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        const data = await api.fetchDailyLogs();
        setLogs(data);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchLogs();
  }, []);

  if (loading) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
      </div>
    );
  }

  // Sort logs by date ascending for chart
  const sortedLogs = [...logs].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  
  const chartData = sortedLogs.map(log => ({
    date: format(parseISO(log.date), 'MMM d'),
    mood: log.mood * 2, // Scale 1-5 to 1-10 for comparative plotting with energy
    energy: log.energy,
    rawMood: log.mood,
  }));

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-4 rounded-xl shadow-lg border border-slate-100 min-w-[150px]">
          <p className="font-bold text-slate-800 mb-2">{label}</p>
          <div className="space-y-1 text-sm font-medium">
            <p className="text-blue-500 flex justify-between">
              <span>Mood:</span> 
              <span>{payload.find((p: any) => p.dataKey === 'rawMood')?.value || payload[0].payload.rawMood}/5</span>
            </p>
            <p className="text-emerald-500 flex justify-between">
              <span>Energy:</span> 
              <span>{payload.find((p: any) => p.dataKey === 'energy')?.value}/10</span>
            </p>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-6">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Insights</h1>
        <p className="text-slate-500 mt-1">Understand your patterns over time.</p>
      </header>

      <div className="bg-gradient-to-br from-amber-50 to-yellow-50 rounded-3xl p-6 md:p-8 border border-amber-100 flex items-start gap-4 shadow-sm animate-in fade-in">
        <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shrink-0 shadow-sm text-amber-500">
          <Lightbulb className="w-6 h-6" />
        </div>
        <div>
          <h3 className="text-lg font-bold text-amber-900 mb-1">Your Wellbeing Correlation</h3>
          <p className="text-amber-800 leading-relaxed">
            <strong className="font-bold">Insight:</strong> You report a 20% higher mood on days you interact with friends! Staying connected seems to be a major driver of your overall energy and happiness.
          </p>
        </div>
      </div>

      <div className="bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-slate-100 animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div className="mb-6">
          <h2 className="text-xl font-bold text-slate-900">Mood & Energy Over Time</h2>
          <p className="text-sm text-slate-500">Last 30 Days (Mood scaled to 10 for comparison)</p>
        </div>
        
        <div className="h-[400px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="colorMood" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="colorEnergy" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis 
                dataKey="date" 
                axisLine={false}
                tickLine={false}
                tick={{ fill: '#94a3b8', fontSize: 12 }}
                minTickGap={30}
                dy={10}
              />
              <YAxis 
                axisLine={false}
                tickLine={false}
                tick={{ fill: '#94a3b8', fontSize: 12 }}
                domain={[0, 10]}
                dx={-10}
              />
              <Tooltip content={<CustomTooltip />} cursor={{ stroke: '#cbd5e1', strokeWidth: 1, strokeDasharray: '4 4' }} />
              <Legend verticalAlign="top" height={36} iconType="circle" wrapperStyle={{ fontSize: '14px', fontWeight: 500 }}/>
              
              {/* Invisible area just to pass the rawMood to tooltip */}
              <Area type="monotone" dataKey="rawMood" stroke="none" fill="none" />
              
              <Area 
                type="monotone" 
                name="Energy"
                dataKey="energy" 
                stroke="#10b981" 
                strokeWidth={3}
                fillOpacity={1} 
                fill="url(#colorEnergy)" 
              />
              <Area 
                type="monotone" 
                name="Mood"
                dataKey="mood" 
                stroke="#3b82f6" 
                strokeWidth={3}
                fillOpacity={1} 
                fill="url(#colorMood)" 
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
