# Mitra Magang ITS Admin

## Setup

1. Update `.env.local` with your Supabase project URL and anon key if needed.
2. Install dependencies:

```bash
npm install
```

3. Run the development server:

```bash
npm run dev
```

## Pages

- `/` - Admin login
- `/dashboard` - Dashboard management

## Notes

- Login checks the `admins` table using username/email and password.
- Add/Edit Partner buttons are active; Export Data remains disabled for now.
- Admin API routes use `SUPABASE_SERVICE_ROLE_KEY` when present; add it to `.env.local` to allow write actions when RLS is enabled.
