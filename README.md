# LifePulse

A personal wellness and connection tracker that combines a daily mood/energy journal with a social contact tracker. Built with React + Vite, Tailwind CSS, Recharts, and date-fns.

## Features

- **Dashboard** — Daily mood check-in (emoji selector + energy slider), 7-day mood trend bar chart, and a "Who to reach out to" panel with overdue/fresh contact badges
- **My People** — Visual bubble network of contacts color-coded by relationship type, with a clean list-view toggle. Log interactions and add new contacts via modals
- **Insights** — Area chart overlaying mood and energy over 30 days, plus a correlation insight card

## Tech Stack

- [React 19](https://react.dev/) + [Vite](https://vitejs.dev/) (TypeScript)
- [Tailwind CSS v4](https://tailwindcss.com/)
- [Lucide React](https://lucide.dev/) — icons
- [Recharts](https://recharts.org/) — data visualization
- [date-fns](https://date-fns.org/) — date formatting
- [Wouter](https://github.com/molefrog/wouter) — client-side routing
- Mock data layer (`src/services/api.ts`) — simulates async network calls, ready to swap for a real backend

## Prerequisites

- [Node.js](https://nodejs.org/) v18 or later
- npm (comes with Node.js — no other package manager needed)

## Getting Started

### 1. Clone the repository

```bash
git clone https://github.com/abdellahsebti/Life.git
cd Life
```

### 2. Install dependencies

```bash
npm install
```

### 3. Start the development server

```bash
npm run dev
```

The app will be available at **http://localhost:5173**

### 4. Build for production

```bash
npm run build
```

Output is placed in `dist/`. Serve it with any static file host or:

```bash
npm run preview
```

## Project Structure

```
src/
├── App.tsx                         # Root component, routing, tab state
├── index.css                       # Global styles & CSS design tokens
├── main.tsx                        # Entry point
├── data/
│   └── mockData.ts                 # 30 days of logs + 6-8 sample contacts
├── services/
│   └── api.ts                      # Mock async API layer (300 ms simulated delay)
├── components/
│   ├── Layout.tsx                  # Responsive shell — sidebar (desktop) + bottom nav (mobile)
│   ├── Dashboard/
│   │   ├── DailyCheckIn.tsx        # Mood emoji selector, energy slider, note textarea
│   │   ├── TodaySummary.tsx        # Today's mood & energy summary cards
│   │   ├── ContactReminders.tsx    # Who to reach out to, color-coded badges
│   │   └── MoodTrend.tsx           # Last-7-days bar chart (Recharts)
│   ├── Contacts/
│   │   ├── RelationshipBubbles.tsx # Floating bubble network with hover tooltips
│   │   ├── SimpleContactList.tsx   # Minimal list fallback view
│   │   ├── AddContactModal.tsx     # Add contact form modal
│   │   └── LogInteractionModal.tsx # Log an interaction form modal
│   └── Insights/
│       └── InsightsView.tsx        # Area chart + correlation insight card
└── pages/
    └── not-found.tsx               # 404 page
```

## Connecting a Real Backend

All data flows through `src/services/api.ts`, which returns mock data with a simulated 300 ms delay. To connect a real API:

1. Replace the mock functions in `src/services/api.ts` with real `fetch` calls
2. Keep the same function signatures — no component changes needed
3. Update the base URL to point to your API server

## Available Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start the dev server at http://localhost:5173 |
| `npm run build` | Type-check and build for production |
| `npm run preview` | Preview the production build locally |
| `npm run typecheck` | Run TypeScript type checks only |

## License

MIT
