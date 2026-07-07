import { Contact, DailyLog, LogInteractionData, CheckInData, MOCK_CONTACTS, MOCK_DAILY_LOGS } from '../data/mockData';

// Simple in-memory storage for the session
let contacts = [...MOCK_CONTACTS];
let dailyLogs = [...MOCK_DAILY_LOGS];

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const api = {
  fetchContacts: async (): Promise<Contact[]> => {
    await delay(300);
    return [...contacts];
  },

  fetchDailyLogs: async (): Promise<DailyLog[]> => {
    await delay(300);
    return [...dailyLogs];
  },

  logInteraction: async (contactId: string, data: LogInteractionData): Promise<void> => {
    await delay(300);
    contacts = contacts.map(c => 
      c.id === contactId 
        ? { ...c, lastContacted: data.date, notes: data.notes || c.notes }
        : c
    );
  },

  addContact: async (data: Omit<Contact, 'id' | 'lastContacted'>): Promise<Contact> => {
    await delay(300);
    const newContact: Contact = {
      ...data,
      id: Math.random().toString(36).substring(7),
      lastContacted: new Date().toISOString(), // default to today on creation
    };
    contacts = [...contacts, newContact];
    return newContact;
  },

  submitCheckIn: async (data: CheckInData): Promise<DailyLog> => {
    await delay(300);
    const todayStr = new Date().toISOString();
    
    // Check if we already logged today
    const existingIdx = dailyLogs.findIndex(log => 
      new Date(log.date).toDateString() === new Date().toDateString()
    );

    const newLog: DailyLog = {
      id: Math.random().toString(36).substring(7),
      date: todayStr,
      mood: data.mood,
      energy: data.energy,
      note: data.note,
    };

    if (existingIdx >= 0) {
      dailyLogs[existingIdx] = newLog;
    } else {
      dailyLogs.push(newLog);
    }
    
    return newLog;
  }
};
