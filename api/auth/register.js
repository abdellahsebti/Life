import { z } from 'zod';
import { supabaseAnon } from '../utils/supabase.js';

const schema = z.object({
  email: z.string().email(),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  name: z.string().min(1, 'Name is required'),
});

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const parsed = schema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.flatten().fieldErrors });
  }

  const { email, password, name } = parsed.data;

  const { data, error } = await supabaseAnon.auth.signUp({
    email,
    password,
    options: { data: { full_name: name } },
  });

  if (error) {
    return res.status(400).json({ error: error.message });
  }

  // If email confirmation is disabled in Supabase, session is returned immediately
  return res.status(201).json({
    user: data.user,
    session: data.session,
  });
}
