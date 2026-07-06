import React, { useState } from 'react';
import { api } from '@/services/api';
import { Contact } from '@/data/mockData';
import { Loader2, X, MessageSquare, Phone, Coffee, Video } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface Props {
  isOpen: boolean;
  contact: Contact;
  onClose: () => void;
  onSuccess: () => void;
}

const INTERACTION_TYPES = [
  { id: 'text', label: 'Text', icon: MessageSquare },
  { id: 'call', label: 'Call', icon: Phone },
  { id: 'in-person', label: 'In Person', icon: Coffee },
  { id: 'video', label: 'Video Call', icon: Video },
];

export default function LogInteractionModal({ isOpen, contact, onClose, onSuccess }: Props) {
  const [type, setType] = useState('text');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await api.logInteraction(contact.id, {
        type,
        notes,
        date: new Date().toISOString()
      });
      toast({ title: 'Interaction logged!', description: `Kept in touch with ${contact.name}.` });
      onSuccess();
    } catch (error) {
      toast({ title: 'Error logging interaction', variant: 'destructive' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/20 backdrop-blur-sm animate-in fade-in">
      <div className="bg-white rounded-3xl w-full max-w-md overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200">
        <div className="flex justify-between items-center p-6 border-b border-slate-100">
          <div>
            <h2 className="text-xl font-bold text-slate-800">Log Interaction</h2>
            <p className="text-sm text-slate-500">with {contact.name}</p>
          </div>
          <button onClick={onClose} className="p-2 text-slate-400 hover:bg-slate-100 rounded-full transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="space-y-3">
            <label className="text-sm font-medium text-slate-600">How did you connect?</label>
            <div className="grid grid-cols-2 gap-3">
              {INTERACTION_TYPES.map(it => {
                const Icon = it.icon;
                const isSelected = type === it.id;
                return (
                  <button
                    key={it.id}
                    type="button"
                    onClick={() => setType(it.id)}
                    className={`flex flex-col items-center justify-center p-4 rounded-2xl border-2 transition-all duration-200 gap-2 ${
                      isSelected 
                        ? 'border-blue-500 bg-blue-50 text-blue-700 shadow-sm' 
                        : 'border-slate-100 bg-white text-slate-500 hover:bg-slate-50 hover:border-slate-200'
                    }`}
                  >
                    <Icon className="w-6 h-6" />
                    <span className="text-sm font-medium">{it.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-600">Notes (optional)</label>
            <textarea 
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="What did you talk about?"
              className="w-full h-24 p-4 bg-slate-50 border-none rounded-xl resize-none focus:ring-2 focus:ring-blue-200 focus:bg-white transition-all text-sm outline-none"
            />
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3.5 bg-blue-500 text-white rounded-xl font-semibold hover:bg-blue-600 disabled:opacity-50 flex items-center justify-center gap-2 transition-colors"
            >
              {isSubmitting && <Loader2 className="w-5 h-5 animate-spin" />}
              Save Interaction
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
