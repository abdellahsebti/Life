/** Shared utilities for rendering contact avatars and status badges. */

export function getInitials(name: string): string {
  return name
    .trim()
    .split(/\s+/)
    .map((w) => w[0])
    .join('')
    .toUpperCase()
    .slice(0, 2) || '?';
}

const AVATAR_PALETTE = [
  { bg: 'bg-blue-100',   text: 'text-blue-700'   },
  { bg: 'bg-violet-100', text: 'text-violet-700'  },
  { bg: 'bg-emerald-100',text: 'text-emerald-700' },
  { bg: 'bg-orange-100', text: 'text-orange-700'  },
  { bg: 'bg-rose-100',   text: 'text-rose-700'    },
  { bg: 'bg-amber-100',  text: 'text-amber-700'   },
  { bg: 'bg-indigo-100', text: 'text-indigo-700'  },
  { bg: 'bg-teal-100',   text: 'text-teal-700'    },
];

export function getAvatarColor(name: string): { bg: string; text: string } {
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash += name.charCodeAt(i);
  return AVATAR_PALETTE[hash % AVATAR_PALETTE.length];
}

export type ContactStatus = 'overdue' | 'due-soon' | 'fresh';

export function getContactStatus(
  lastContacted: string,
  frequency: 'weekly' | 'biweekly' | 'monthly',
): ContactStatus {
  const THRESHOLDS = { weekly: 7, biweekly: 14, monthly: 30 };
  const days = Math.floor(
    (Date.now() - new Date(lastContacted).getTime()) / 86_400_000,
  );
  const max = THRESHOLDS[frequency];
  if (days > max + 3) return 'overdue';
  if (days > max - 2) return 'due-soon';
  return 'fresh';
}

export const STATUS_META = {
  overdue:  { label: 'Overdue',  dot: 'bg-rose-500',   badge: 'border-rose-200   bg-rose-50   text-rose-700'   },
  'due-soon': { label: 'Due Soon', dot: 'bg-amber-400',  badge: 'border-amber-200  bg-amber-50  text-amber-700'  },
  fresh:    { label: 'Fresh',    dot: 'bg-emerald-400', badge: 'border-emerald-200 bg-emerald-50 text-emerald-700' },
} as const;
