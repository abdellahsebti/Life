import { Resend } from 'resend';

// Lazy singleton — only instantiated when a reminder is actually sent,
// so importing this module won't crash if RESEND_API_KEY isn't set yet.
let _resend = null;

export function getResend() {
  if (!_resend) {
    if (!process.env.RESEND_API_KEY) {
      throw new Error('RESEND_API_KEY is not set. Add it to your environment secrets.');
    }
    _resend = new Resend(process.env.RESEND_API_KEY);
  }
  return _resend;
}

// Keep a named export for backward compat — now a proxy object.
export const resend = {
  get emails() { return getResend().emails; },
};
