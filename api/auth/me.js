import { requireAuth } from '../utils/auth.js';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const auth = await requireAuth(req, res);
  if (!auth) return;

  const { user } = auth;
  return res.status(200).json({
    id: user.id,
    email: user.email,
    name: user.user_metadata?.full_name ?? null,
    created_at: user.created_at,
  });
}
