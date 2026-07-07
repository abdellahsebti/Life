import React, { useState, useEffect } from 'react';
import { api } from '@/services/api';
import { DailyLog, Contact } from '@/data/mockData';
import DailyCheckIn from './DailyCheckIn';
import TodaySummary from './TodaySummary';
import ContactReminders from './ContactReminders';
import MoodTrend from './MoodTrend';
import { Loader2 } from 'lucide-react';
import { format } from 'date-fns';

export default function Dashboard() {
  const [logs, setLogs] = useState<DailyLog[]>([]);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [fetchedLogs, fetchedContacts] = await Promise.all([
        api.fetchDailyLogs(),
        api.fetchContacts()
      ]);
      setLogs(fetchedLogs);
      setContacts(fetchedContacts);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
      </div>
    );
  }

  const todayStr = format(new Date(), 'EEEE, MMMM do');

  return (
    <div className="space-y-6">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Good Morning!</h1>
        <p className="text-slate-500 mt-1">Today is {todayStr}</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column */}
        <div className="lg:col-span-2 space-y-6">
          <DailyCheckIn onLogSubmitted={fetchData} />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <TodaySummary logs={logs} />
            <MoodTrend logs={logs} />
          </div>
        </div>

        {/* Right Column */}
        <div className="lg:col-span-1">
          <ContactReminders contacts={contacts} onLogInteraction={fetchData} />
        </div>
      </div>
    </div>
  );
}
