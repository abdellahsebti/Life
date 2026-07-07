import React from 'react';
import { Contact } from '@/data/mockData';
import { differenceInDays } from 'date-fns';

const getInitials = (name: string) => {
  return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
};

export default function SimpleContactList({ 
  contacts, 
  onContactClick 
}: { 
  contacts: Contact[];
  onContactClick: (contact: Contact) => void;
}) {

  return (
    <div className="grid gap-3 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {contacts.map((contact, index) => {
        const days = differenceInDays(new Date(), new Date(contact.lastContacted));
        return (
          <div 
            key={contact.id}
            onClick={() => onContactClick(contact)}
            className="flex items-center p-4 bg-white rounded-2xl shadow-sm border border-slate-100 hover:border-blue-200 hover:shadow-md transition-all cursor-pointer group"
            style={{ animationDelay: `${index * 50}ms` }}
          >
            <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 font-bold mr-4 group-hover:bg-blue-50 group-hover:text-blue-600 transition-colors">
              {getInitials(contact.name)}
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-slate-800">{contact.name}</h3>
              <span className="text-xs text-slate-400 capitalize">{contact.relationship}</span>
            </div>
            <div className="text-right">
              <div className="text-sm font-medium text-slate-600 group-hover:text-blue-600 transition-colors">
                {days === 0 ? 'Today' : `${days}d ago`}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
