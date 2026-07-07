import { supabase } from '@/lib/supabase-client';
import type { Contact, DailyLog, LogInteractionData, CheckInData } from '../data/mockData';

// ─── Helpers ────────────────────────────────────────────────────────────────

async function getToken(): Promise<string> {
  const { data } = await supabase.auth.getSession();
  const token = data.session?.access_token;
  if (!token) throw new Error('Not authenticated');
  return token;
}

async function apiFetch<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = await getToken();
  const res = await fetch(path, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
      ...options.headers,
    },
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({ error: 'Unknown error' }));
    throw new Error(typeof body.error === 'string' ? body.error : JSON.stringify(body.error));
  }

  return res.json() as Promise<T>;
}

// ─── Frequency mapping ───────────────────────────────────────────────────────
// The DB stores frequency as integer days; the frontend uses 'weekly' | 'biweekly' | 'monthly'

type FrequencyLabel = 'weekly' | 'biweekly' | 'monthly';

const FREQ_DAYS: Record<FrequencyLabel, number> = { weekly: 7, biweekly: 14, monthly: 30 };

function daysToLabel(days: number): FrequencyLabel {
  if (days <= 7) return 'weekly';
  if (days <= 14) return 'biweekly';
  return 'monthly';
}

// ─── DB row → frontend shape ─────────────────────────────────────────────────

interface DbContact {
  id: string;
  name: string;
  relationship: string;
  frequency_days: number;
  last_contacted: string;
  notes?: string;
}

interface DbLog {
  id: string;
  log_date: string;
  mood: number;
  energy: number;
  note?: string;
}

function toContact(row: DbContact): Contact {
  return {
    id: row.id,
    name: row.name,
    relationship: row.relationship as Contact['relationship'],
    frequency: daysToLabel(row.frequency_days),
    lastContacted: row.last_contacted,
    notes: row.notes,
  };
}

function toLog(row: DbLog): DailyLog {
  return {
    id: row.id,
    date: row.log_date,
    mood: row.mood,
    energy: row.energy,
    note: row.note,
  };
}

// ─── API ─────────────────────────────────────────────────────────────────────

export const api = {
  fetchContacts: async (): Promise<Contact[]> => {
    const rows = await apiFetch<DbContact[]>('/api/contacts');
    return rows.map(toContact);
  },

  fetchDailyLogs: async (): Promise<DailyLog[]> => {
    const rows = await apiFetch<DbLog[]>('/api/logs');
    return rows.map(toLog);
  },

  logInteraction: async (contactId: string, data: LogInteractionData): Promise<void> => {
    await apiFetch<DbContact>('/api/contacts/interact', {
      method: 'POST',
      body: JSON.stringify({
        contact_id: contactId,
        type: data.type,
        note: data.notes,
        interaction_date: data.date,
      }),
    });
  },

  addContact: async (data: Omit<Contact, 'id' | 'lastContacted'>): Promise<Contact> => {
    const row = await apiFetch<DbContact>('/api/contacts/create', {
      method: 'POST',
      body: JSON.stringify({
        name: data.name,
        relationship: data.relationship,
        frequency_days: FREQ_DAYS[data.frequency] ?? 7,
        notes: data.notes ?? '',
      }),
    });
    return toContact(row);
  },

  submitCheckIn: async (data: CheckInData): Promise<DailyLog> => {
    const row = await apiFetch<DbLog>('/api/logs/create', {
      method: 'POST',
      body: JSON.stringify({
        mood: data.mood,
        energy: data.energy,
        note: data.note,
      }),
    });
    return toLog(row);
  },
};
