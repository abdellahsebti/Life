import React from 'react';
import { Contact } from '@/data/mockData';
import { differenceInDays } from 'date-fns';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

const getInitials = (name: string) => {
  return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
};

export default function RelationshipBubbles({ 
  contacts, 
  onContactClick 
}: { 
  contacts: Contact[];
  onContactClick: (contact: Contact) => void;
}) {
  
  const getBubbleStyles = (contact: Contact) => {
    // Colors by relationship
    const colors = {
      friend: 'bg-blue-100 text-blue-700 border-blue-200 hover:shadow-blue-200',
      family: 'bg-pink-100 text-pink-700 border-pink-200 hover:shadow-pink-200',
      colleague: 'bg-purple-100 text-purple-700 border-purple-200 hover:shadow-purple-200',
      mentor: 'bg-teal-100 text-teal-700 border-teal-200 hover:shadow-teal-200',
    };

    // Size by closeness (frequency)
    const sizes = {
      weekly: 'w-28 h-28 text-2xl',
      biweekly: 'w-24 h-24 text-xl',
      monthly: 'w-20 h-20 text-lg',
    };

    return `${colors[contact.relationship]} ${sizes[contact.frequency]}`;
  };

  return (
    <div className="flex flex-wrap justify-center items-center gap-6 p-8 min-h-[400px] animate-in fade-in duration-700 bg-white rounded-3xl border border-slate-100 shadow-sm">
      <TooltipProvider delayDuration={200}>
        {contacts.map((contact, i) => {
          const days = differenceInDays(new Date(), new Date(contact.lastContacted));
          // Slight random offset for organic feel
          const translateY = i % 2 === 0 ? 'translate-y-4' : '-translate-y-4';

          return (
            <Tooltip key={contact.id}>
              <TooltipTrigger asChild>
                <button
                  onClick={() => onContactClick(contact)}
                  className={`
                    relative rounded-full flex items-center justify-center font-bold border-2
                    transition-all duration-300 ease-out hover:scale-110 hover:shadow-xl hover:z-10
                    ${getBubbleStyles(contact)} ${translateY}
                  `}
                  style={{ animationDelay: `${i * 100}ms`, animationFillMode: 'both' }}
                >
                  {getInitials(contact.name)}
                  
                  {/* Indicator dot if overdue */}
                  {days > 14 && (
                    <span className="absolute top-2 right-2 w-3 h-3 bg-rose-500 rounded-full border-2 border-white"></span>
                  )}
                </button>
              </TooltipTrigger>
              <TooltipContent className="bg-slate-800 text-white font-medium px-4 py-2 rounded-xl">
                <p className="text-base mb-1">{contact.name}</p>
                <p className="text-xs text-slate-300">Last contacted: {days === 0 ? 'Today' : `${days} days ago`}</p>
              </TooltipContent>
            </Tooltip>
          );
        })}
      </TooltipProvider>
    </div>
  );
}
