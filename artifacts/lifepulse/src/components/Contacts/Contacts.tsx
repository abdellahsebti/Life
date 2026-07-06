import React, { useState, useEffect } from 'react';
import { api } from '@/services/api';
import { Contact } from '@/data/mockData';
import { Loader2, Plus, LayoutGrid, List } from 'lucide-react';
import RelationshipBubbles from './RelationshipBubbles';
import SimpleContactList from './SimpleContactList';
import AddContactModal from './AddContactModal';
import LogInteractionModal from './LogInteractionModal';

export default function ContactsView() {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'bubbles' | 'list'>('bubbles');
  
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);

  const fetchContacts = async () => {
    setLoading(true);
    try {
      const data = await api.fetchContacts();
      setContacts(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchContacts();
  }, []);

  if (loading) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">My People</h1>
          <p className="text-slate-500 mt-1">Keep track of the relationships that matter most.</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="bg-slate-100 p-1 rounded-xl flex items-center">
            <button 
              onClick={() => setViewMode('bubbles')}
              className={`p-2 rounded-lg transition-all ${viewMode === 'bubbles' ? 'bg-white shadow-sm text-blue-600' : 'text-slate-500 hover:text-slate-700'}`}
            >
              <LayoutGrid className="w-5 h-5" />
            </button>
            <button 
              onClick={() => setViewMode('list')}
              className={`p-2 rounded-lg transition-all ${viewMode === 'list' ? 'bg-white shadow-sm text-blue-600' : 'text-slate-500 hover:text-slate-700'}`}
            >
              <List className="w-5 h-5" />
            </button>
          </div>
          <button 
            onClick={() => setIsAddModalOpen(true)}
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2.5 rounded-xl font-medium flex items-center gap-2 transition-colors shadow-sm"
          >
            <Plus className="w-5 h-5" />
            <span className="hidden sm:inline">Add Contact</span>
          </button>
        </div>
      </header>

      {viewMode === 'bubbles' ? (
        <RelationshipBubbles contacts={contacts} onContactClick={setSelectedContact} />
      ) : (
        <div className="max-w-2xl mx-auto">
          <SimpleContactList contacts={contacts} onContactClick={setSelectedContact} />
        </div>
      )}

      <AddContactModal 
        isOpen={isAddModalOpen} 
        onClose={() => setIsAddModalOpen(false)} 
        onSuccess={() => {
          setIsAddModalOpen(false);
          fetchContacts();
        }}
      />

      {selectedContact && (
        <LogInteractionModal 
          isOpen={true}
          contact={selectedContact}
          onClose={() => setSelectedContact(null)}
          onSuccess={() => {
            setSelectedContact(null);
            fetchContacts();
          }}
        />
      )}
    </div>
  );
}
