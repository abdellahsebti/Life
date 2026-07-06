import { subDays, format } from 'date-fns';

export type ContactRelationship = 'friend' | 'family' | 'colleague' | 'mentor';
export type ContactFrequency = 'weekly' | 'biweekly' | 'monthly';

export interface Contact {
  id: string;
  name: string;
  relationship: ContactRelationship;
  lastContacted: string; // ISO date string
  frequency: ContactFrequency;
  notes?: string;
}

export interface DailyLog {
  id: string;
  date: string; // ISO date string
  mood: number; // 1-5
  energy: number; // 1-10
  note?: string;
}

export interface LogInteractionData {
  type: string;
  notes: string;
  date: string;
}

export interface CheckInData {
  mood: number;
  energy: number;
  note: string;
}

const today = new Date();

export const MOCK_CONTACTS: Contact[] = [
  {
    id: '1',
    name: 'Sarah Jenkins',
    relationship: 'friend',
    lastContacted: subDays(today, 3).toISOString(),
    frequency: 'weekly',
  },
  {
    id: '2',
    name: 'Mom',
    relationship: 'family',
    lastContacted: subDays(today, 12).toISOString(),
    frequency: 'weekly',
    notes: 'Ask about the new garden',
  },
  {
    id: '3',
    name: 'Alex Chen',
    relationship: 'colleague',
    lastContacted: subDays(today, 45).toISOString(),
    frequency: 'monthly',
  },
  {
    id: '4',
    name: 'Dr. Emily Carter',
    relationship: 'mentor',
    lastContacted: subDays(today, 15).toISOString(),
    frequency: 'monthly',
  },
  {
    id: '5',
    name: 'Marcus Williams',
    relationship: 'friend',
    lastContacted: subDays(today, 32).toISOString(),
    frequency: 'biweekly',
  },
  {
    id: '6',
    name: 'Uncle Bob',
    relationship: 'family',
    lastContacted: subDays(today, 5).toISOString(),
    frequency: 'monthly',
  },
  {
    id: '7',
    name: 'Jessica T.',
    relationship: 'friend',
    lastContacted: subDays(today, 25).toISOString(),
    frequency: 'weekly',
  }
];

export const MOCK_DAILY_LOGS: DailyLog[] = Array.from({ length: 30 }).map((_, i) => {
  const date = subDays(today, 29 - i);
  // Generate a somewhat realistic trend: mostly 3-5 mood, 5-8 energy
  const baseMood = 3 + Math.sin(i / 3) * 1.5;
  const mood = Math.max(1, Math.min(5, Math.round(baseMood)));
  
  const baseEnergy = 6 + Math.cos(i / 2) * 3;
  const energy = Math.max(1, Math.min(10, Math.round(baseEnergy)));

  return {
    id: `log-${i}`,
    date: date.toISOString(),
    mood,
    energy,
    note: i % 4 === 0 ? 'Felt pretty good today, took a nice walk.' : undefined,
  };
});
