# LifePulse

A personal wellness and connection tracker that combines a daily mood/energy journal with a social contact tracker. Built with React + Vite, Tailwind CSS, Recharts, and date-fns.

## Features

- **Dashboard** — Daily mood check-in (emoji selector + energy slider), 7-day mood trend bar chart, and a "Who to reach out to" panel with overdue/fresh contact badges
- **My People** — Visual bubble network of contacts color-coded by relationship type, with a clean list-view toggle. Log interactions and add new contacts via modals
- **Insights** — Area chart overlaying mood and energy over 30 days, plus an AI-style correlation insight card

## Tech Stack

- [React](https://react.dev/) + [Vite](https://vitejs.dev/) (TypeScript)
- [Tailwind CSS v4](https://tailwindcss.com/)
- [Lucide React](https://lucide.dev/) — icons
- [Recharts](https://recharts.org/) — data visualization
- [date-fns](https://date-fns.org/) — date formatting
- [Wouter](https://github.com/molefrog/wouter) — client-side routing
- Mock data layer (`src/services/api.ts`) — simulates async network calls so the app is ready to wire up a real backend

## Prerequisites

- [Node.js](https://nodejs.org/) v18 or later
- [pnpm](https://pnpm.io/) v8 or later

Install pnpm if you don't have it:

```bash
npm install -g pnpm
```

## Getting Started

### 1. Clone the repository

```bash
git clone https://github.com/abdellahsebti/Life.git
cd Life
```

### 2. Install dependencies

```bash
pnpm install
```

### 3. Start the development server

```bash
pnpm --filter @workspace/lifepulse run dev
```

The app will be available at **http://localhost:19080** (or whichever port is assigned).

> **Note:** The port is controlled by the `PORT` environment variable. If you want to use a different port, set it before running:
> ```bash
> PORT=3000 pnpm --filter @workspace/lifepulse run dev
> ```
> You'll also need to set `BASE_PATH=/` (or your desired base path):
> ```bash
> PORT=3000 BASE_PATH=/ pnpm --filter @workspace/lifepulse run dev
> ```

### 4. Build for production

```bash
pnpm --filter @workspace/lifepulse run build
```

Output is placed in `artifacts/lifepulse/dist/public/`.

## Project Structure

```
artifacts/lifepulse/src/
├── App.tsx                         # Root component, routing, tab state
├── index.css                       # Global styles & CSS design tokens
├── data/
│   └── mockData.ts                 # 30 days of logs + 6-8 sample contacts
├── services/
│   └── api.ts                      # Mock async API layer (300ms simulated delay)
├── components/
│   ├── Layout.tsx                  # Responsive shell — sidebar (desktop) + bottom nav (mobile)
│   ├── Dashboard/
│   │   ├── DailyCheckIn.tsx        # Mood emoji selector, energy slider, note textarea
│   │   ├── TodaySummary.tsx        # Today's mood & energy summary cards
│   │   ├── ContactReminders.tsx    # Who to reach out to, color-coded badges
│   │   └── MoodTrend.tsx           # Last-7-days bar chart (Recharts)
│   ├── Contacts/
│   │   ├── RelationshipBubbles.tsx # Floating bubble network, hover tooltips
│   │   ├── SimpleContactList.tsx   # Minimal list fallback view
│   │   ├── AddContactModal.tsx     # Add contact form modal
│   │   └── LogInteractionModal.tsx # Log an interaction form modal
│   └── Insights/
│       └── InsightsView.tsx        # Area chart + correlation insight card
└── pages/
    └── not-found.tsx               # 404 page
```

## Connecting a Real Backend

The app is architected for easy backend integration. All data flows through `src/services/api.ts`, which currently returns mock data with a simulated delay. To connect a real API:

1. Replace the `Promise`-based mock functions in `src/services/api.ts` with real `fetch` calls to your backend endpoints
2. Keep the same function signatures — the components won't need to change
3. Update the base URL to point to your API server

## Running the Full Monorepo (optional)

This app lives inside a pnpm monorepo. To run all services:

```bash
# Install all workspace dependencies
pnpm install

# Type-check all packages
pnpm run typecheck

# Run the frontend only
pnpm --filter @workspace/lifepulse run dev

# Run the API server (optional — not required for the frontend)
pnpm --filter @workspace/api-server run dev
```

## License

MIT
