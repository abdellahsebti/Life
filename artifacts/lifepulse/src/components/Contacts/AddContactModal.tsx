import React, { useState } from 'react';
import { api } from '@/services/api';
import { Contact } from '@/data/mockData';
import { Loader2, X } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function AddContactModal({ isOpen, onClose, onSuccess }: Props) {
  const [name, setName] = useState('');
  const [relationship, setRelationship] = useState<Contact['relationship']>('friend');
  const [frequency, setFrequency] = useState<Contact['frequency']>('weekly');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setIsSubmitting(true);
    try {
      await api.addContact({ name, relationship, frequency });
      toast({ title: 'Contact added!', description: `${name} has been added to your people.` });
      onSuccess();
    } catch (error) {
      toast({ title: 'Error adding contact', variant: 'destructive' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/20 backdrop-blur-sm animate-in fade-in">
      <div className="bg-white rounded-3xl w-full max-w-md overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200">
        <div className="flex justify-between items-center p-6 border-b border-slate-100">
          <h2 className="text-xl font-bold text-slate-800">Add Contact</h2>
          <button onClick={onClose} className="p-2 text-slate-400 hover:bg-slate-100 rounded-full transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-600">Name</label>
            <input 
              type="text" 
              autoFocus
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Jane Doe"
              className="w-full px-4 py-3 bg-slate-50 border-none rounded-xl focus:ring-2 focus:ring-blue-200 focus:bg-white transition-all outline-none"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-600">Relationship</label>
            <div className="grid grid-cols-2 gap-2">
              {(['friend', 'family', 'colleague', 'mentor'] as const).map(type => (
                <button
                  key={type}
                  type="button"
                  onClick={() => setRelationship(type)}
                  className={`py-2 px-3 rounded-xl text-sm font-medium capitalize transition-all ${
                    relationship === type 
                      ? 'bg-blue-500 text-white shadow-md' 
                      : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  {type}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-600">How often do you want to connect?</label>
            <select
              value={frequency}
              onChange={(e) => setFrequency(e.target.value as Contact['frequency'])}
              className="w-full px-4 py-3 bg-slate-50 border-none rounded-xl focus:ring-2 focus:ring-blue-200 focus:bg-white transition-all outline-none appearance-none"
            >
              <option value="weekly">Weekly</option>
              <option value="biweekly">Bi-weekly</option>
              <option value="monthly">Monthly</option>
            </select>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={isSubmitting || !name.trim()}
              className="w-full py-3.5 bg-blue-500 text-white rounded-xl font-semibold hover:bg-blue-600 disabled:opacity-50 flex items-center justify-center gap-2 transition-colors"
            >
              {isSubmitting && <Loader2 className="w-5 h-5 animate-spin" />}
              Save Contact
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
