import React from 'react';
import { Contact } from '@/data/mockData';
import { differenceInDays } from 'date-fns';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { getInitials, getAvatarColor, getContactStatus, STATUS_META } from '@/lib/contact-utils';
import { ChevronRight } from 'lucide-react';

const REL_COLORS: Record<Contact['relationship'], string> = {
  friend:    'border-blue-200   bg-blue-50   text-blue-700',
  family:    'border-green-200  bg-green-50  text-green-700',
  colleague: 'border-purple-200 bg-purple-50 text-purple-700',
  mentor:    'border-orange-200 bg-orange-50 text-orange-700',
};

const REL_EMOJI: Record<Contact['relationship'], string> = {
  friend: '🤝', family: '🏡', colleague: '💼', mentor: '🎓',
};

export default function SimpleContactList({
  contacts,
  onContactClick,
}: {
  contacts: Contact[];
  onContactClick: (contact: Contact) => void;
}) {
  if (contacts.length === 0) {
    return (
      <div className="text-center py-16 text-slate-400">
        <p className="text-sm">No contacts yet. Add someone!</p>
      </div>
    );
  }

  return (
    <div className="space-y-2 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {contacts.map((contact, index) => {
        const days = differenceInDays(new Date(), new Date(contact.lastContacted));
        const status = getContactStatus(contact.lastContacted, contact.frequency);
        const statusMeta = STATUS_META[status];
        const color = getAvatarColor(contact.name);

        return (
          <div
            key={contact.id}
            role="button"
            tabIndex={0}
            onClick={() => onContactClick(contact)}
            onKeyDown={(e) => e.key === 'Enter' && onContactClick(contact)}
            className="flex items-center gap-4 p-4 bg-white rounded-2xl border border-slate-100 hover:border-slate-200 hover:shadow-sm active:scale-[0.99] transition-all cursor-pointer group"
            style={{ animationDelay: `${index * 40}ms` }}
          >
            {/* Avatar */}
            <Avatar className="h-11 w-11 shrink-0">
              <AvatarFallback className={`${color.bg} ${color.text} text-sm font-bold`}>
                {getInitials(contact.name)}
              </AvatarFallback>
            </Avatar>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-sm font-semibold text-slate-900 truncate">
                  {contact.name}
                </span>
                <span className={`inline-flex items-center gap-1 text-[10px] font-semibold px-1.5 py-0.5 rounded-full border ${REL_COLORS[contact.relationship]}`}>
                  <span aria-hidden>{REL_EMOJI[contact.relationship]}</span>
                  <span className="capitalize">{contact.relationship}</span>
                </span>
              </div>
              <div className="flex items-center gap-1.5 mt-1">
                <span className={`w-1.5 h-1.5 rounded-full ${statusMeta.dot}`} />
                <span className="text-xs text-slate-500">
                  {days === 0 ? 'Contacted today' : `Last contacted ${days}d ago`}
                </span>
              </div>
            </div>

            {/* Status badge + chevron */}
            <div className="flex items-center gap-2 shrink-0">
              <Badge
                variant="outline"
                className={`text-[10px] py-0 ${statusMeta.badge} hidden sm:inline-flex`}
              >
                {statusMeta.label}
              </Badge>
              <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-slate-500 transition-colors" />
            </div>
          </div>
        );
      })}
    </div>
  );
}
