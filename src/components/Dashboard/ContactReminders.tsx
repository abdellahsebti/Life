import React, { useState } from 'react';
import { Contact } from '@/data/mockData';
import { differenceInDays } from 'date-fns';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { getInitials, getAvatarColor, getContactStatus, STATUS_META } from '@/lib/contact-utils';
import LogInteractionModal from '../Contacts/LogInteractionModal';
import { Users } from 'lucide-react';

export default function ContactReminders({
  contacts,
  onLogInteraction,
}: {
  contacts: Contact[];
  onLogInteraction: () => void;
}) {
  const [selected, setSelected] = useState<Contact | null>(null);

  const sorted = [...contacts]
    .sort((a, b) => {
      const aDays = differenceInDays(new Date(), new Date(a.lastContacted));
      const bDays = differenceInDays(new Date(), new Date(b.lastContacted));
      return bDays - aDays;
    })
    .slice(0, 5);

  return (
    <>
      <div className="bg-white rounded-3xl border border-slate-100 shadow-sm flex flex-col h-full overflow-hidden">
        {/* Header */}
        <div className="px-6 pt-6 pb-4 flex items-center justify-between border-b border-slate-50">
          <div>
            <h2 className="text-base font-semibold text-slate-900">Stay connected</h2>
            <p className="text-xs text-slate-400 mt-0.5">Who to reach out to next</p>
          </div>
          {contacts.length > 0 && (
            <Badge variant="secondary" className="text-xs">
              {contacts.filter(c => getContactStatus(c.lastContacted, c.frequency) !== 'fresh').length} pending
            </Badge>
          )}
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto divide-y divide-slate-50">
          {sorted.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 px-6 text-center">
              <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center mb-3">
                <Users className="w-5 h-5 text-slate-400" />
              </div>
              <p className="text-sm font-medium text-slate-600">No contacts yet</p>
              <p className="text-xs text-slate-400 mt-1">Add people in My People to see reminders here</p>
            </div>
          ) : (
            sorted.map((contact) => {
              const status = getContactStatus(contact.lastContacted, contact.frequency);
              const meta = STATUS_META[status];
              const color = getAvatarColor(contact.name);
              const days = differenceInDays(new Date(), new Date(contact.lastContacted));

              return (
                <div
                  key={contact.id}
                  className="flex items-center gap-3 px-5 py-3.5 hover:bg-slate-50 transition-colors group"
                >
                  {/* Avatar */}
                  <Avatar className="h-10 w-10 shrink-0">
                    <AvatarFallback className={`${color.bg} ${color.text} text-xs font-bold`}>
                      {getInitials(contact.name)}
                    </AvatarFallback>
                  </Avatar>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-slate-900 truncate leading-tight">
                      {contact.name}
                    </p>
                    <div className="flex items-center gap-1.5 mt-1">
                      <span className={`inline-flex items-center gap-1 text-[10px] font-semibold px-1.5 py-0.5 rounded-full border ${meta.badge}`}>
                        <span className={`w-1 h-1 rounded-full ${meta.dot}`} />
                        {meta.label}
                      </span>
                      <span className="text-[10px] text-slate-400">
                        {days === 0 ? 'today' : `${days}d ago`}
                      </span>
                    </div>
                  </div>

                  {/* Action */}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setSelected(contact)}
                    className="shrink-0 text-xs h-7 px-2.5 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    Log
                  </Button>
                </div>
              );
            })
          )}
        </div>
      </div>

      {selected && (
        <LogInteractionModal
          contact={selected}
          isOpen
          onClose={() => setSelected(null)}
          onSuccess={() => { setSelected(null); onLogInteraction(); }}
        />
      )}
    </>
  );
}
