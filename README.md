# GoalStreak

GoalStreak is a React app for recording dated goal check-ins. It works with
local browser storage by default and can use Supabase plus Google OAuth to sync
one account across devices.

## Run locally

```bash
npm install
npm run dev
```

Without Supabase environment variables, the header shows **Local only** and all
data remains in this browser.

## Add Supabase and Google login

### 1. Create the database

1. Create a project at [Supabase](https://supabase.com/dashboard).
2. Open **SQL Editor**, paste [`supabase/schema.sql`](supabase/schema.sql), and
   run it.

The schema enables Row Level Security. Every goal and check-in has a `user_id`,
and authenticated users can only access rows whose `user_id` matches their
Supabase Auth ID.

### 2. Configure Google OAuth

1. In [Google Auth Platform](https://console.cloud.google.com/auth), create a
   web OAuth client.
2. Add `http://localhost:5173` and your production site as authorized
   JavaScript origins.
3. Add the Supabase callback URL shown under **Supabase > Authentication >
   Providers > Google** as an authorized redirect URI. It looks like:

   ```text
   https://YOUR_PROJECT_REF.supabase.co/auth/v1/callback
   ```

4. In Supabase, enable the Google provider and enter Google's client ID and
   client secret.
5. Under **Authentication > URL Configuration**, set your production URL as the
   Site URL. Add `http://localhost:5173/**` and your production URL to the
   redirect allow list.
6. Under **Authentication > Settings**, enable manual identity linking while
   migrating anyone who used the earlier anonymous-auth version of this app.

The app no longer creates anonymous users. Manual linking is only retained so
an existing anonymous session can be upgraded to Google without changing its
user ID or losing its rows.

### 3. Add local environment variables

Copy `.env.example` to `.env.local` and use the values from **Supabase > Project
Settings > API**:

```bash
VITE_SUPABASE_URL=https://YOUR_PROJECT_REF.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=YOUR_PUBLISHABLE_KEY
```

Only use the publishable key in this frontend. Never put a Supabase secret or
service-role key in a `VITE_` variable.

Restart `npm run dev`, then select **Sign in with Google**.

## What happens to existing browser data?

On the first successful account connection, local goals and check-ins are
uploaded under that Supabase user ID. The unclaimed local copy is removed only
after the upload succeeds. The app then keeps a per-user browser cache for
offline fallback, while Supabase remains the source used across devices.

## Deploy with Vercel

1. Import this repository into Vercel using the repository root as the project
   directory.
2. Add `VITE_SUPABASE_URL` and `VITE_SUPABASE_PUBLISHABLE_KEY` to the Vercel
   project environment variables.
3. Deploy once and copy the production URL.
4. Add that URL to the Supabase Site URL and redirect allow list, and to the
   Google OAuth client's authorized JavaScript origins.

Useful checks before deployment:

```bash
npm run lint
npm run build
```
