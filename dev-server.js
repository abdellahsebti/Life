/**
 * Local development API server.
 * Runs the Vercel-style handlers on port 3001.
 * Vite proxies /api/* → http://localhost:3001 during development.
 */
import express from 'express';

// ── Auth ──────────────────────────────────────────────────────────────────────
import loginHandler     from './api/auth/login.js';
import registerHandler  from './api/auth/register.js';
import meHandler        from './api/auth/me.js';

// ── Logs ──────────────────────────────────────────────────────────────────────
import logsIndexHandler  from './api/logs/index.js';
import logsCreateHandler from './api/logs/create.js';

// ── Contacts ──────────────────────────────────────────────────────────────────
import contactsIndexHandler    from './api/contacts/index.js';
import contactsCreateHandler   from './api/contacts/create.js';
import contactsInteractHandler from './api/contacts/interact.js';

// ── Reminders ─────────────────────────────────────────────────────────────────
import remindersHandler from './api/reminders/send.js';

// ─────────────────────────────────────────────────────────────────────────────

const app = express();
app.use(express.json());

/**
 * Wrap a Vercel-style handler for Express.
 * Catches both synchronous throws and async rejections so the dev server
 * always returns a deterministic response instead of hanging or crashing.
 */
const h = (handler) => (req, res, next) => {
  try {
    const result = handler(req, res);
    if (result && typeof result.catch === 'function') {
      result.catch((err) => {
        console.error('[api error]', err);
        if (!res.headersSent) res.status(500).json({ error: err.message ?? 'Internal server error' });
      });
    }
  } catch (err) {
    console.error('[api error]', err);
    if (!res.headersSent) res.status(500).json({ error: err.message ?? 'Internal server error' });
  }
};

// Auth
app.post('/api/auth/login',    h(loginHandler));
app.post('/api/auth/register', h(registerHandler));
app.get ('/api/auth/me',       h(meHandler));

// Logs
app.get ('/api/logs',         h(logsIndexHandler));
app.post('/api/logs/create',  h(logsCreateHandler));

// Contacts
app.get ('/api/contacts',          h(contactsIndexHandler));
app.post('/api/contacts/create',   h(contactsCreateHandler));
app.post('/api/contacts/interact', h(contactsInteractHandler));

// Reminders / cron
app.get ('/api/reminders/send', h(remindersHandler));
app.post('/api/reminders/send', h(remindersHandler));

// Catch-all — helps surface typos quickly
app.use('/api', (req, res) => {
  res.status(404).json({ error: `No API route: ${req.method} ${req.path}` });
});

const PORT = 3001;
app.listen(PORT, () => {
  console.log(`[api] dev server → http://localhost:${PORT}`);
});
