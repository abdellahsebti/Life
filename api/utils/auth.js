import { createClient } from '@supabase/supabase-js';

/**
 * Verifies the Bearer JWT from the Authorization header.
 * Returns { user, supabase } on success, or sends a 401 and returns null.
 */
export async function requireAuth(req, res) {
  const authHeader = req.headers['authorization'] ?? '';
  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;

  if (!token) {
    res.status(401).json({ error: 'Missing authorization token' });
    return null;
  }

  // Create a client scoped to this user's token (respects RLS)
  const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_ANON_KEY,
    {
      auth: { persistSession: false },
      global: { headers: { Authorization: `Bearer ${token}` } },
    }
  );

  const { data, error } = await supabase.auth.getUser(token);

  if (error || !data?.user) {
    res.status(401).json({ error: 'Invalid or expired token' });
    return null;
  }

  return { user: data.user, supabase };
}
