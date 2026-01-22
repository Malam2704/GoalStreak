# GoalStreak

A minimal, modern to-do list built with Vite + React. Tasks save locally in your browser (localStorage), ready for future upgrades like Supabase.

## Getting started

```bash
npm install
npm run dev
```

## Build

```bash
npm run build
npm run preview
```

## Data mode

Local storage is the default. To try Supabase later:

1. Apply the schema in `supabase/schema.sql`.
2. Install the client: `npm install @supabase/supabase-js`.
3. Create a client and assign `globalThis.supabase = createClient(...)`.
4. Set `VITE_DATA_MODE=supabase` in `.env`.
