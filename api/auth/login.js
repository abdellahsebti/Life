import { z } from 'zod';
import { supabaseAnon } from '../utils/supabase.js';

const schema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const parsed = schema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.flatten().fieldErrors });
  }

  const { email, password } = parsed.data;
  const { data, error } = await supabaseAnon.auth.signInWithPassword({ email, password });

  if (error) {
    return res.status(401).json({ error: error.message });
  }

  return res.status(200).json({
    user: data.user,
    session: data.session,
  });
}
