import { requireAuth } from '../utils/auth.js';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const auth = await requireAuth(req, res);
  if (!auth) return;

  const { user, supabase } = auth;

  const { data, error } = await supabase
    .from('daily_logs')
    .select('*')
    .eq('user_id', user.id)
    .order('log_date', { ascending: true });

  if (error) {
    return res.status(500).json({ error: error.message });
  }

  return res.status(200).json(data);
}
