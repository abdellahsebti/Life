import { z } from 'zod';
import { requireAuth } from '../utils/auth.js';

const schema = z.object({
  mood: z.number().int().min(1).max(5),
  energy: z.number().int().min(1).max(10),
  note: z.string().max(500).optional().default(''),
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

  const { mood, energy, note } = parsed.data;
  const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD

  // Upsert — one log per day per user
  const { data, error } = await supabase
    .from('daily_logs')
    .upsert(
      { user_id: user.id, log_date: today, mood, energy, note },
      { onConflict: 'user_id,log_date' }
    )
    .select()
    .single();

  if (error) {
    return res.status(500).json({ error: error.message });
  }

  return res.status(201).json(data);
}
