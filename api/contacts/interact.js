import { z } from 'zod';
import { requireAuth } from '../utils/auth.js';

const schema = z.object({
  contact_id: z.string().uuid(),
  type: z.enum(['call', 'text', 'in-person', 'email', 'video', 'other']),
  note: z.string().max(500).optional().default(''),
  interaction_date: z.string().optional(), // ISO date string; defaults to today
});

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const auth = await requireAuth(req, res);
  if (!auth) return;

  const { user, supabase } = auth;

  const parsed = schema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.flatten().fieldErrors });
  }

  const { contact_id, type, note, interaction_date } = parsed.data;
  const date = interaction_date ?? new Date().toISOString();

  // Verify the contact belongs to this user
  const { data: contact, error: contactError } = await supabase
    .from('contacts')
    .select('id')
    .eq('id', contact_id)
    .eq('user_id', user.id)
    .single();

  if (contactError || !contact) {
    return res.status(404).json({ error: 'Contact not found' });
  }

  // Insert the interaction
  const { error: insertError } = await supabase
    .from('interactions')
    .insert({ contact_id, user_id: user.id, type, note, interaction_date: date });

  if (insertError) {
    return res.status(500).json({ error: insertError.message });
  }

  // Update last_contacted on the contact
  const { data: updatedContact, error: updateError } = await supabase
    .from('contacts')
    .update({ last_contacted: date })
    .eq('id', contact_id)
    .eq('user_id', user.id)
    .select()
    .single();

  if (updateError) {
    return res.status(500).json({ error: updateError.message });
  }

  return res.status(200).json(updatedContact);
}
