import React, { useState, useEffect, useId } from 'react';
import { api } from '@/services/api';
import { Contact } from '@/data/mockData';
import { Loader2, X, MessageSquare, Phone, Coffee, Video, Mail } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { getInitials, getAvatarColor } from '@/lib/contact-utils';

interface Props {
  isOpen: boolean;
  contact: Contact;
  onClose: () => void;
  onSuccess: () => void;
}

const INTERACTION_TYPES = [
  { id: 'text',      label: 'Text',      icon: MessageSquare, color: 'text-blue-600   bg-blue-50   border-blue-200'   },
  { id: 'call',      label: 'Call',      icon: Phone,         color: 'text-green-600  bg-green-50  border-green-200'  },
  { id: 'in-person', label: 'In Person', icon: Coffee,        color: 'text-amber-600  bg-amber-50  border-amber-200'  },
  { id: 'video',     label: 'Video',     icon: Video,         color: 'text-violet-600 bg-violet-50 border-violet-200' },
  { id: 'email',     label: 'Email',     icon: Mail,          color: 'text-teal-600   bg-teal-50   border-teal-200'   },
];

export default function LogInteractionModal({ isOpen, contact, onClose, onSuccess }: Props) {
  const uid = useId();
  const notesId = `${uid}-notes`;

  const [type, setType]     = useState('text');
  const [notes, setNotes]   = useState('');
  const [busy, setBusy]     = useState(false);
  const { toast } = useToast();

  const avatarColor = getAvatarColor(contact.name);

  // Escape to close
  useEffect(() => {
    if (!isOpen) return;
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    try {
      await api.logInteraction(contact.id, { type, notes, date: new Date().toISOString() });
      toast({ title: '✅ Interaction logged!', description: `Kept in touch with ${contact.name}.` });
      setNotes('');
      onSuccess();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Something went wrong';
      toast({ title: 'Could not log interaction', description: msg, variant: 'destructive' });
      console.error('[LogInteractionModal]', err);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/30 backdrop-blur-sm"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label={`Log interaction with ${contact.name}`}
        className="bg-white w-full sm:max-w-md rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-hidden animate-in slide-in-from-bottom-4 sm:zoom-in-95 duration-200"
      >
        {/* Header */}
        <div className="flex items-center gap-4 px-6 py-5 border-b border-slate-100">
          <Avatar className="h-11 w-11 shrink-0">
            <AvatarFallback className={`${avatarColor.bg} ${avatarColor.text} text-sm font-bold`}>
              {getInitials(contact.name)}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <h2 className="text-base font-semibold text-slate-900 truncate">
              Log interaction
            </h2>
            <p className="text-xs text-slate-500 truncate">with {contact.name}</p>
          </div>
          <button
            onClick={onClose}
            aria-label="Close"
            className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="px-6 py-5 space-y-5">
          {/* Interaction type */}
          <fieldset>
            <legend className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-3">
              How did you connect?
            </legend>
            <div className="grid grid-cols-5 gap-2">
              {INTERACTION_TYPES.map((it) => {
                const Icon = it.icon;
                const isSelected = type === it.id;
                return (
                  <button
                    key={it.id}
                    type="button"
                    aria-pressed={isSelected}
                    onClick={() => setType(it.id)}
                    className={`flex flex-col items-center justify-center py-3 px-1 rounded-2xl border-2 gap-1.5 transition-all duration-150
                      ${isSelected
                        ? `${it.color} border-current scale-[1.04] shadow-sm`
                        : 'border-slate-100 bg-white text-slate-400 hover:border-slate-200 hover:text-slate-600'
                      }`}
                  >
                    <Icon className="w-5 h-5" aria-hidden />
                    <span className="text-[9px] font-bold uppercase tracking-wider leading-none">
                      {it.label}
                    </span>
                  </button>
                );
              })}
            </div>
          </fieldset>

          {/* Notes */}
          <div className="space-y-1.5">
            <label
              htmlFor={notesId}
              className="text-xs font-semibold uppercase tracking-wider text-slate-500"
            >
              Notes <span className="normal-case font-normal text-slate-400">(optional)</span>
            </label>
            <textarea
              id={notesId}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="What did you talk about?"
              rows={3}
              maxLength={500}
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-300 focus:border-transparent focus:bg-white transition-all resize-none"
            />
          </div>

          {/* Submit */}
          <Button
            type="submit"
            disabled={busy}
            className="w-full h-11 rounded-2xl text-sm font-semibold bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white border-0 shadow-md shadow-blue-100"
          >
            {busy ? (
              <><Loader2 className="w-4 h-4 animate-spin" /> Saving…</>
            ) : (
              'Save Interaction'
            )}
          </Button>
        </form>
      </div>
    </div>
  );
}
