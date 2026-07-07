import React, { useState } from 'react';
import { api } from '@/services/api';
import { CheckInData } from '@/data/mockData';
import { Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const MOODS = [
  { value: 1, emoji: '😞', label: 'Rough' },
  { value: 2, emoji: '😐', label: 'Meh' },
  { value: 3, emoji: '🙂', label: 'Okay' },
  { value: 4, emoji: '😊', label: 'Good' },
  { value: 5, emoji: '🤩', label: 'Great' },
];

export default function DailyCheckIn({ onLogSubmitted }: { onLogSubmitted: () => void }) {
  const [mood, setMood] = useState<number | null>(null);
  const [energy, setEnergy] = useState<number>(5);
  const [note, setNote] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async () => {
    if (mood === null) {
      toast({ title: 'Please select a mood', variant: 'destructive' });
      return;
    }
    
    setIsSubmitting(true);
    try {
      await api.submitCheckIn({ mood, energy, note });
      toast({ title: 'Check-in saved!', description: 'Great job tracking today.' });
      onLogSubmitted();
      setMood(null);
      setEnergy(5);
      setNote('');
    } catch (e) {
      toast({ title: 'Error saving log', variant: 'destructive' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 flex flex-col gap-6">
      <h2 className="text-xl font-bold text-slate-800">How are you today?</h2>
      
      <div className="space-y-3">
        <label className="text-sm font-medium text-slate-500">Mood</label>
        <div className="flex justify-between items-center gap-2">
          {MOODS.map((m) => {
            const isSelected = mood === m.value;
            return (
              <button
                key={m.value}
                onClick={() => setMood(m.value)}
                className={`
                  flex-1 flex flex-col items-center justify-center p-3 rounded-2xl transition-all duration-300
                  ${isSelected 
                    ? 'bg-blue-50 scale-110 shadow-md ring-2 ring-blue-200' 
                    : 'bg-slate-50 hover:bg-slate-100 grayscale-[0.5] opacity-70 hover:grayscale-0 hover:opacity-100'}
                `}
              >
                <span className="text-3xl lg:text-4xl leading-none block mb-2">{m.emoji}</span>
                <span className={`text-[10px] uppercase font-bold tracking-wider ${isSelected ? 'text-blue-600' : 'text-slate-400'}`}>
                  {m.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <label className="text-sm font-medium text-slate-500">Energy Level: {energy}</label>
          <span className="text-xs text-slate-400 bg-slate-100 px-2 py-1 rounded-full">{energy < 4 ? 'Low' : energy > 7 ? 'High' : 'Normal'}</span>
        </div>
        <input 
          type="range" 
          min="1" 
          max="10" 
          value={energy} 
          onChange={(e) => setEnergy(Number(e.target.value))}
          className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-500"
        />
        <div className="flex justify-between text-xs text-slate-400">
          <span>Exhausted</span>
          <span>Wired</span>
        </div>
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium text-slate-500">Note (optional)</label>
        <textarea 
          placeholder="What's on your mind?"
          value={note}
          onChange={(e) => setNote(e.target.value)}
          className="w-full h-24 p-4 bg-slate-50 border-none rounded-2xl resize-none focus:ring-2 focus:ring-blue-200 focus:bg-white transition-all text-sm"
        />
      </div>

      <button 
        onClick={handleSubmit}
        disabled={isSubmitting || mood === null}
        className="w-full py-4 bg-blue-500 text-white rounded-2xl font-semibold hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
      >
        {isSubmitting && <Loader2 className="w-5 h-5 animate-spin" />}
        Save Check-in
      </button>
    </div>
  );
}
