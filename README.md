# Nexora Exchange

A React, TypeScript, and Vite cryptocurrency exchange interface. Supabase Auth and account-data code are wired locally; the migration and admin Edge Function still need to be deployed to the Supabase project. Trading and balances remain simulated demo data, not real financial activity.

## Run locally

```sh
npm install
npm run dev
```

Check the production build with `npm run build`.

## Connect Supabase

1. Create a project at [supabase.com](https://supabase.com/). In **Project Settings → API**, copy the project URL and the **publishable key** (or legacy `anon` key). Never use the `service_role` key in frontend code.
2. Install the Supabase JavaScript client:

   ```sh
   npm install @supabase/supabase-js
   ```

3. Create `.env.local` in the project root. These `VITE_` values are public to the browser, so only put the URL and publishable/anon key here:

   ```env
   VITE_SUPABASE_URL=https://YOUR_PROJECT.supabase.co
   VITE_SUPABASE_PUBLISHABLE_KEY=YOUR_SUPABASE_PUBLISHABLE_KEY
   ```

   `.local` files are already ignored by Git. Restart the dev server after changing environment variables.

4. The first database migration is in `supabase/migrations/20261001000000_initial_schema.sql`. It creates the profile and dashboard tables, applies per-user RLS, and creates a default `user` profile when someone signs up. The Supabase CLI and `supabase/config.toml` are already included. From the project root, run:

   ```sh
   npx supabase login
   npx supabase link --project-ref cvvfzgzuxyhbskdwemln
   npx supabase db push
   npx supabase functions deploy admin-user-management
   ```

   `supabase login` opens an authentication flow. Review the migration before pushing it. After registering the account you want to administer the site, promote it once in Supabase **SQL Editor** by replacing the example email:

   ```sql
   update public.profiles
   set role = 'admin'
   where id = (select id from auth.users where email = 'you@example.com');
   ```

   Never grant client-side users permission to edit their profile `role`. The admin Edge Function uses Supabase's server-side service-role environment variable; never copy that key into `.env.local` or browser code.

5. Initialize the client in a shared module (for example `src/lib/supabase.ts`):

   ```ts
   import { createClient } from "@supabase/supabase-js";

   export const supabase = createClient(
   import.meta.env["VITE_SUPABASE_URL"],
   import.meta.env["VITE_SUPABASE_PUBLISHABLE_KEY"],
   );
   ```

6. Registration and login use `supabase.auth.signUp({ email, password })` and `supabase.auth.signInWithPassword({ email, password })` in `src/lib/supabase-auth.ts`. Never save passwords or password hashes in `profiles` or `account_data`; Supabase Auth stores and verifies credentials. A user's simulated dashboard state is saved to `account_data` with their authenticated user ID. RLS ensures a normal user can only read or change their own row. Existing browser-local demo accounts are not automatically migrated.
7. Move admin actions to a Supabase Edge Function or trusted server endpoint. It must verify the caller's access token and confirm their `profiles.role` is `admin` before listing users, viewing their data, changing account status, or deleting accounts. Use the service-role key only in that server-side environment. Set an admin's role through a trusted operator/server process, never from a client request.

## Admin and data safety

The current `/admin` page and sign-in checks are demo-only: they read browser `localStorage`, so users are not shared across browsers and client-side checks are not security controls. Replacing the storage calls with Supabase is required for persistent multi-user accounts and admin management.

The balances, funding history, and trades in this project are simulated. A user can alter browser data, so do not treat these values as real money or production trading records. A real exchange needs trusted server-side order processing and an auditable ledger; never accept client-submitted balances as authoritative. Configure Supabase Auth email confirmation, password recovery, and redirect URLs before deployment.
