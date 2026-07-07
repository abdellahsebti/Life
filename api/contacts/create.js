import { z } from 'zod';
import { requireAuth } from '../utils/auth.js';

const schema = z.object({
  name: z.string().min(1, 'Name is required').max(100),
  relationship: z.enum(['friend', 'family', 'colleague', 'mentor']),
  frequency_days: z.number().int().min(1).max(365),
  notes: z.string().max(500).optional().default(''),
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

  const { name, relationship, frequency_days, notes } = parsed.data;

  const { data, error } = await supabase
    .from('contacts')
    .insert({
      user_id: user.id,
      name,
      relationship,
      frequency_days,
      notes,
      last_contacted: new Date().toISOString(),
    })
    .select()
    .single();

  if (error) {
    return res.status(500).json({ error: error.message });
  }

  return res.status(201).json(data);
}
