import React, { useState } from 'react';
import { Contact } from '@/data/mockData';
import { differenceInDays } from 'date-fns';
import LogInteractionModal from '../Contacts/LogInteractionModal';

const getInitials = (name: string) => {
  return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
};

export default function ContactReminders({ contacts, onLogInteraction }: { contacts: Contact[], onLogInteraction: () => void }) {
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);

  const getStatus = (contact: Contact) => {
    const days = differenceInDays(new Date(), new Date(contact.lastContacted));
    const thresholds = {
      weekly: 7,
      biweekly: 14,
      monthly: 30,
    };
    const max = thresholds[contact.frequency];
    
    if (days > max + 3) return { label: 'Overdue', color: 'text-rose-600 bg-rose-50 border-rose-100', dot: 'bg-rose-500' };
    if (days > max - 2) return { label: 'Due Soon', color: 'text-amber-600 bg-amber-50 border-amber-100', dot: 'bg-amber-400' };
    return { label: 'Fresh', color: 'text-emerald-600 bg-emerald-50 border-emerald-100', dot: 'bg-emerald-400' };
  };

  const sortedContacts = [...contacts].sort((a, b) => {
    const aDays = differenceInDays(new Date(), new Date(a.lastContacted));
    const bDays = differenceInDays(new Date(), new Date(b.lastContacted));
    return bDays - aDays;
  }).slice(0, 4);

  return (
    <>
      <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 flex flex-col h-full">
        <h2 className="text-xl font-bold text-slate-800 mb-6">Who to reach out to</h2>
        
        <div className="space-y-4 flex-1">
          {sortedContacts.map((contact) => {
            const status = getStatus(contact);
            const days = differenceInDays(new Date(), new Date(contact.lastContacted));
            
            return (
              <div key={contact.id} className="flex items-center gap-4 p-3 rounded-2xl hover:bg-slate-50 transition-colors group">
                <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 font-bold shrink-0">
                  {getInitials(contact.name)}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-slate-900 truncate">{contact.name}</h3>
                  <div className="flex items-center gap-2 mt-1">
                    <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${status.color} flex items-center gap-1.5`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${status.dot}`}></span>
                      {status.label}
                    </span>
                    <span className="text-xs text-slate-400">{days} days ago</span>
                  </div>
                </div>
                <button 
                  onClick={() => setSelectedContact(contact)}
                  className="px-4 py-2 text-sm font-medium text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-xl transition-colors opacity-0 group-hover:opacity-100 md:opacity-100"
                >
                  Log
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {selectedContact && (
        <LogInteractionModal 
          contact={selectedContact} 
          isOpen={true} 
          onClose={() => setSelectedContact(null)}
          onSuccess={() => {
            setSelectedContact(null);
            onLogInteraction();
          }}
        />
      )}
    </>
  );
}
