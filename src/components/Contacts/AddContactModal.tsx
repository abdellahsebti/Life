import React, { useState, useEffect, useId } from 'react';
import { api } from '@/services/api';
import { Contact } from '@/data/mockData';
import { Loader2, X, UserPlus } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const RELATIONSHIPS: {
  value: Contact['relationship'];
  label: string;
  emoji: string;
  activeClasses: string;
}[] = [
  { value: 'friend',    label: 'Friend',    emoji: '🤝', activeClasses: 'bg-blue-500   text-white border-blue-500   shadow-blue-100'   },
  { value: 'family',    label: 'Family',    emoji: '🏡', activeClasses: 'bg-green-500  text-white border-green-500  shadow-green-100'  },
  { value: 'colleague', label: 'Colleague', emoji: '💼', activeClasses: 'bg-purple-500 text-white border-purple-500 shadow-purple-100' },
  { value: 'mentor',    label: 'Mentor',    emoji: '🎓', activeClasses: 'bg-orange-500 text-white border-orange-500 shadow-orange-100' },
];

const FREQUENCIES: { value: Contact['frequency']; label: string; sublabel: string }[] = [
  { value: 'weekly',   label: 'Weekly',    sublabel: 'Every 7 days'  },
  { value: 'biweekly', label: 'Bi-weekly', sublabel: 'Every 2 weeks' },
  { value: 'monthly',  label: 'Monthly',   sublabel: 'Every month'   },
];

const SUBMIT_GRADIENT: Record<Contact['relationship'], string> = {
  friend:    'from-blue-500   to-indigo-600  shadow-blue-100',
  family:    'from-green-500  to-emerald-600 shadow-green-100',
  colleague: 'from-purple-500 to-violet-600  shadow-purple-100',
  mentor:    'from-orange-500 to-amber-600   shadow-orange-100',
};

function getInitials(name: string) {
  return name.trim().split(/\s+/).map(w => w[0]).join('').toUpperCase().slice(0, 2) || '?';
}

function getAvatarGrad(name: string) {
  const grads = [
    'from-blue-400 to-blue-600',
    'from-green-400 to-green-600',
    'from-purple-400 to-purple-600',
    'from-orange-400 to-orange-600',
    'from-pink-400 to-pink-600',
    'from-indigo-400 to-indigo-600',
  ];
  let h = 0;
  for (let i = 0; i < name.length; i++) h += name.charCodeAt(i);
  return grads[h % grads.length];
}

const isDbMissingTable = (msg: string) =>
  /relation ".+?" does not exist/i.test(msg) || /table ".+?" does not exist/i.test(msg);

export default function AddContactModal({ isOpen, onClose, onSuccess }: Props) {
  const uid = useId();
  const titleId = `${uid}-title`;
  const nameId  = `${uid}-name`;
  const notesId = `${uid}-notes`;

  const [name, setName]         = useState('');
  const [relationship, setRel]  = useState<Contact['relationship']>('friend');
  const [frequency, setFreq]    = useState<Contact['frequency']>('weekly');
  const [notes, setNotes]       = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  // Close on Escape
  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') handleClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [isOpen]); // eslint-disable-line react-hooks/exhaustive-deps

  if (!isOpen) return null;

  const handleClose = () => {
    if (isSubmitting) return;
    setName(''); setRel('friend'); setFreq('weekly'); setNotes('');
    onClose();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    setIsSubmitting(true);
    try {
      await api.addContact({ name: name.trim(), relationship, frequency, notes });
      toast({ title: '🎉 Contact added!', description: `${name.trim()} is now in your people.` });
      handleClose();
      onSuccess();
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : 'Something went wrong';
      toast({
        title: 'Could not save contact',
        description: isDbMissingTable(msg)
          ? 'Database tables not found — run supabase-schema.sql in Supabase first.'
          : msg,
        variant: 'destructive',
      });
      console.error('[AddContactModal]', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const initials = getInitials(name);
  const grad     = getAvatarGrad(name || 'default');

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/30 backdrop-blur-sm"
      onClick={(e) => { if (e.target === e.currentTarget) handleClose(); }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className="bg-white w-full sm:max-w-md rounded-t-3xl sm:rounded-3xl overflow-hidden shadow-2xl animate-in slide-in-from-bottom-4 sm:zoom-in-95 duration-200"
      >
        {/* ── Header ───────────────────────────────────────────────── */}
        <div className="bg-gradient-to-br from-slate-800 to-slate-900 px-6 pt-6 pb-8 relative">
          <button
            onClick={handleClose}
            aria-label="Close dialog"
            className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white hover:bg-white/10 rounded-full transition-colors"
          >
            <X className="w-5 h-5" aria-hidden="true" />
          </button>

          {/* Avatar preview */}
          <div
            aria-hidden="true"
            className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${grad} flex items-center justify-center text-white text-xl font-bold shadow-lg mb-4 transition-all duration-300`}
          >
            {initials}
          </div>

          <h2 id={titleId} className="text-white text-xl font-bold">Add someone special</h2>
          <p className="text-slate-400 text-sm mt-1">Track someone you want to stay connected with</p>
        </div>

        {/* Decorative overlap curve */}
        <div className="h-4 bg-gradient-to-br from-slate-800 to-slate-900 relative">
          <div className="absolute inset-x-0 bottom-0 h-4 bg-white rounded-t-3xl" />
        </div>

        {/* ── Form ─────────────────────────────────────────────────── */}
        <form onSubmit={handleSubmit} className="px-6 pb-6 space-y-5">
          {/* Name */}
          <div className="space-y-1.5">
            <label htmlFor={nameId} className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Name
            </label>
            <input
              id={nameId}
              type="text"
              autoFocus
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Jamie Smith"
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-300 focus:border-transparent focus:bg-white transition-all"
            />
          </div>

          {/* Relationship */}
          <fieldset className="space-y-2">
            <legend className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Relationship
            </legend>
            <div className="grid grid-cols-2 gap-2">
              {RELATIONSHIPS.map((rel) => (
                <button
                  key={rel.value}
                  type="button"
                  aria-pressed={relationship === rel.value}
                  onClick={() => setRel(rel.value)}
                  className={`py-2.5 px-3 rounded-xl border-2 text-sm font-semibold transition-all duration-200 flex items-center gap-2 shadow-sm
                    ${relationship === rel.value
                      ? `${rel.activeClasses} shadow-md scale-[1.02]`
                      : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300 hover:bg-slate-50'
                    }`}
                >
                  <span className="text-base leading-none" aria-hidden="true">{rel.emoji}</span>
                  {rel.label}
                </button>
              ))}
            </div>
          </fieldset>

          {/* Frequency */}
          <fieldset className="space-y-2">
            <legend className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              How often to connect?
            </legend>
            <div className="flex gap-2">
              {FREQUENCIES.map((f) => (
                <button
                  key={f.value}
                  type="button"
                  aria-pressed={frequency === f.value}
                  onClick={() => setFreq(f.value)}
                  className={`flex-1 py-2.5 rounded-xl border-2 text-center transition-all duration-200
                    ${frequency === f.value
                      ? 'bg-indigo-500 border-indigo-500 text-white shadow-md shadow-indigo-100 scale-[1.02]'
                      : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300'
                    }`}
                >
                  <div className="text-xs font-bold">{f.label}</div>
                  <div className={`text-[10px] mt-0.5 ${frequency === f.value ? 'text-indigo-100' : 'text-slate-400'}`}>
                    {f.sublabel}
                  </div>
                </button>
              ))}
            </div>
          </fieldset>

          {/* Notes */}
          <div className="space-y-1.5">
            <label htmlFor={notesId} className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Notes <span className="normal-case font-normal text-slate-400">(optional)</span>
            </label>
            <textarea
              id={notesId}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Anything to remember about them…"
              rows={2}
              maxLength={300}
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-300 focus:border-transparent focus:bg-white transition-all resize-none"
            />
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={isSubmitting || !name.trim()}
            className={`w-full py-4 rounded-2xl font-semibold text-sm tracking-wide transition-all duration-200 flex items-center justify-center gap-2 shadow-md mt-1
              bg-gradient-to-r ${SUBMIT_GRADIENT[relationship]}
              text-white hover:shadow-lg hover:brightness-105
              disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none`}
          >
            {isSubmitting ? (
              <><Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" /> Saving…</>
            ) : (
              <><UserPlus className="w-4 h-4" aria-hidden="true" /> Add to My People</>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
