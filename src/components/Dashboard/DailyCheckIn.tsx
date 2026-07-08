import React, { useState } from 'react';
import { api } from '@/services/api';
import { CheckInData } from '@/data/mockData';
import { Loader2, Sparkles, Zap, MessageSquare } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';

const MOODS = [
  { value: 1, emoji: '😞', label: 'Rough',  bg: 'bg-red-50',    ring: 'ring-red-200',    text: 'text-red-500',    activeBg: 'bg-red-100'   },
  { value: 2, emoji: '😐', label: 'Meh',    bg: 'bg-orange-50', ring: 'ring-orange-200', text: 'text-orange-500', activeBg: 'bg-orange-100' },
  { value: 3, emoji: '🙂', label: 'Okay',   bg: 'bg-yellow-50', ring: 'ring-yellow-200', text: 'text-yellow-600', activeBg: 'bg-yellow-100' },
  { value: 4, emoji: '😊', label: 'Good',   bg: 'bg-green-50',  ring: 'ring-green-200',  text: 'text-green-600',  activeBg: 'bg-green-100'  },
  { value: 5, emoji: '🤩', label: 'Great',  bg: 'bg-blue-50',   ring: 'ring-blue-200',   text: 'text-blue-600',   activeBg: 'bg-blue-100'   },
];

function getEnergyColor(v: number) {
  if (v <= 3)  return { bar: 'bg-red-400',    label: 'Low',     labelColor: 'text-red-500 bg-red-50' };
  if (v <= 6)  return { bar: 'bg-yellow-400', label: 'Normal',  labelColor: 'text-yellow-600 bg-yellow-50' };
  if (v <= 8)  return { bar: 'bg-green-400',  label: 'High',    labelColor: 'text-green-600 bg-green-50' };
  return            { bar: 'bg-blue-500',    label: 'Wired',   labelColor: 'text-blue-600 bg-blue-50' };
}

const MAX_NOTE = 300;

export default function DailyCheckIn({ onLogSubmitted }: { onLogSubmitted: () => void }) {
  const [mood, setMood]         = useState<number | null>(null);
  const [energy, setEnergy]     = useState<number>(5);
  const [note, setNote]         = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const energyMeta = getEnergyColor(energy);

  const handleSubmit = async () => {
    if (mood === null) {
      toast({ title: 'Pick a mood first', description: 'Tap one of the emoji above.' });
      return;
    }
    setIsSubmitting(true);
    try {
      await api.submitCheckIn({ mood, energy, note });
      toast({ title: '✅ Check-in saved!', description: 'Nice work tracking today.' });
      onLogSubmitted();
      setMood(null);
      setEnergy(5);
      setNote('');
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Something went wrong';
      const isSetup = msg.toLowerCase().includes('does not exist') || msg.toLowerCase().includes('relation');
      toast({
        title: 'Could not save check-in',
        description: isSetup
          ? 'Database tables not found — run supabase-schema.sql in Supabase first.'
          : msg,
        variant: 'destructive',
      });
      console.error('[DailyCheckIn]', e);
    } finally {
      setIsSubmitting(false);
    }
  };

  const today = format(new Date(), 'EEEE, MMMM d');

  return (
    <div className="bg-white rounded-3xl overflow-hidden shadow-sm border border-slate-100">
      {/* Header */}
      <div className="bg-gradient-to-br from-blue-500 to-indigo-600 px-6 py-5">
        <p className="text-blue-100 text-sm font-medium">{today}</p>
        <h2 className="text-white text-xl font-bold mt-0.5 flex items-center gap-2">
          How are you feeling?
          <Sparkles className="w-4 h-4 text-blue-200" />
        </h2>
      </div>

      <div className="p-6 flex flex-col gap-6">
        {/* Mood selector */}
        <div className="space-y-3">
          <div className="flex justify-between gap-2">
            {MOODS.map((m) => {
              const selected = mood === m.value;
              return (
                <button
                  key={m.value}
                  onClick={() => setMood(m.value)}
                  className={`
                    flex-1 flex flex-col items-center justify-center py-3 rounded-2xl border-2 transition-all duration-200
                    ${selected
                      ? `${m.activeBg} border-current ${m.ring} scale-105 shadow-md`
                      : 'bg-slate-50 border-transparent hover:bg-slate-100 hover:scale-102'}
                  `}
                >
                  <span className={`text-3xl leading-none mb-1.5 transition-transform duration-200 ${selected ? 'scale-110' : ''}`}>
                    {m.emoji}
                  </span>
                  <span className={`text-[9px] font-bold uppercase tracking-widest ${selected ? m.text : 'text-slate-400'}`}>
                    {m.label}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Energy slider */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-sm font-medium text-slate-600">
              <Zap className="w-4 h-4 text-slate-400" />
              Energy Level
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xl font-bold text-slate-800">{energy}</span>
              <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${energyMeta.labelColor}`}>
                {energyMeta.label}
              </span>
            </div>
          </div>

          {/* Custom styled track with invisible input layered on top */}
          <div className="relative h-3">
            <div className="absolute inset-0 bg-slate-100 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-200 ${energyMeta.bar}`}
                style={{ width: `${(energy / 10) * 100}%` }}
              />
            </div>
            <input
              type="range"
              min="1"
              max="10"
              value={energy}
              onChange={(e) => setEnergy(Number(e.target.value))}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            />
          </div>
          <div className="flex justify-between text-xs text-slate-400 font-medium -mt-1">
            <span>Exhausted</span>
            <span>Energized</span>
          </div>
        </div>

        {/* Note */}
        <div className="space-y-2">
          <div className="flex items-center gap-1.5 text-sm font-medium text-slate-600">
            <MessageSquare className="w-4 h-4 text-slate-400" />
            Note <span className="text-slate-400 font-normal">(optional)</span>
          </div>
          <div className="relative">
            <textarea
              placeholder="What's on your mind today?"
              value={note}
              maxLength={MAX_NOTE}
              onChange={(e) => setNote(e.target.value)}
              className="w-full h-24 p-4 bg-slate-50 rounded-2xl resize-none text-sm text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-200 focus:bg-white transition-all"
            />
            <span className={`absolute bottom-3 right-3 text-[10px] font-medium ${note.length > MAX_NOTE * 0.9 ? 'text-orange-400' : 'text-slate-300'}`}>
              {note.length}/{MAX_NOTE}
            </span>
          </div>
        </div>

        {/* Submit */}
        <button
          onClick={handleSubmit}
          disabled={isSubmitting || mood === null}
          className="w-full py-4 rounded-2xl font-semibold text-sm tracking-wide transition-all duration-200 flex items-center justify-center gap-2
            bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-md shadow-blue-100
            hover:from-blue-600 hover:to-indigo-700 hover:shadow-lg hover:shadow-blue-200
            disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none"
        >
          {isSubmitting ? (
            <><Loader2 className="w-4 h-4 animate-spin" /> Saving…</>
          ) : (
            <><Sparkles className="w-4 h-4" /> Save Check-in</>
          )}
        </button>
      </div>
    </div>
  );
}
