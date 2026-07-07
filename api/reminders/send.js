import { supabaseAdmin } from '../utils/supabase.js';
import { resend } from '../utils/resend.js';

export default async function handler(req, res) {
  // Allow Vercel Cron (GET) and manual trigger (POST)
  if (req.method !== 'POST' && req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Protect the cron endpoint with a shared secret
  if (!process.env.CRON_SECRET) {
    console.error('CRON_SECRET environment variable is not set — refusing to proceed');
    return res.status(500).json({ error: 'Server misconfiguration' });
  }
  const cronSecret = req.headers['authorization'];
  if (cronSecret !== `Bearer ${process.env.CRON_SECRET}`) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD

  // Get all user profiles (emails live in auth.users; we join via profiles)
  const { data: allProfiles, error: profilesError } = await supabaseAdmin
    .from('profiles')
    .select('id, email, full_name');

  if (profilesError) {
    console.error('Error fetching profiles:', profilesError);
    return res.status(500).json({ error: profilesError.message });
  }

  // Get the user IDs that already logged today
  const { data: todayLogs, error: logsError } = await supabaseAdmin
    .from('daily_logs')
    .select('user_id')
    .eq('log_date', today);

  if (logsError) {
    console.error('Error fetching logs:', logsError);
    return res.status(500).json({ error: logsError.message });
  }

  const loggedUserIds = new Set((todayLogs ?? []).map((l) => l.user_id));
  const usersToRemind = (allProfiles ?? []).filter((p) => !loggedUserIds.has(p.id));

  if (usersToRemind.length === 0) {
    return res.status(200).json({ message: 'Everyone has checked in today!', sent: 0 });
  }

  // Send reminder emails in parallel (batch-safe with Resend)
  const results = await Promise.allSettled(
    usersToRemind.map((profile) =>
      resend.emails.send({
        from: 'LifePulse <reminders@yourdomain.com>',
        to: profile.email,
        subject: '🌟 Time for your daily LifePulse check-in!',
        html: `
          <div style="font-family:sans-serif;max-width:480px;margin:auto;padding:24px;background:#f0f9ff;border-radius:16px;">
            <h2 style="color:#3b82f6;margin-top:0;">Hey ${profile.full_name ?? 'there'}! 👋</h2>
            <p style="font-size:16px;color:#334155;line-height:1.6;">
              Don't forget to check in your mood and see who you need to reach out to today in
              <strong>LifePulse</strong>! 🌟
            </p>
            <p style="font-size:16px;color:#334155;line-height:1.6;">
              A quick 30-second check-in makes a big difference over time.
            </p>
            <a href="${process.env.VITE_APP_URL ?? 'https://yourapp.vercel.app'}/dashboard"
               style="display:inline-block;margin-top:8px;padding:12px 24px;background:#3b82f6;color:#fff;border-radius:999px;text-decoration:none;font-weight:600;">
              Check In Now
            </a>
            <p style="margin-top:24px;font-size:12px;color:#94a3b8;">
              You're receiving this because you signed up for LifePulse reminders.
            </p>
          </div>
        `,
      })
    )
  );

  const sent = results.filter((r) => r.status === 'fulfilled').length;
  const failed = results.filter((r) => r.status === 'rejected').length;

  console.log(`Reminder emails: ${sent} sent, ${failed} failed`);
  return res.status(200).json({ sent, failed });
}
