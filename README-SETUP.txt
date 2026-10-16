JONES VAULT v11 — PRIVATE ACCESS (BETA)

1. In Supabase Project Settings > API, copy the Project URL and the publishable key (or legacy anon public key). NEVER use a secret or service_role key.
2. Open auth-config.js and replace the two placeholders with those values. The public/publishable key is designed for browser use.
3. In Supabase Authentication > URL Configuration set Site URL to https://jonesvault.vercel.app and add https://jonesvault.vercel.app/** to Redirect URLs.
4. Enable Email auth; disable public signups. In Authentication > Users invite ONLY your own email for now.
5. Commit the v11 files (contents of this folder) into the ROOT of your existing GitHub repo, replacing the v10 files. Vercel should redeploy automatically.
6. Open https://jonesvault.vercel.app in an incognito window: a sign-in screen should appear. Follow a FRESH invite link privately, set a strong password, then sign in.
7. Test logout, failed login, reload, and invite acceptance. Do not paste invitation links into chats.

SECURITY LIMITATIONS — READ BEFORE USE
This is a browser UI authentication gate, not server-side protection of static HTML, CSS, SVG, or JS. Anyone can fetch those public assets from Vercel. Do not put private content or secrets in the website source.
Existing watchlists, notes and scenarios STILL use browser localStorage and DO NOT sync to Supabase. They are NOT protected by Supabase RLS. A subsequent release must implement Supabase tables and Row Level Security for truly shared, protected data.
Session is kept in sessionStorage (per tab) and credentials are sent only to your configured Supabase project. Test all flows before storing sensitive information.
The exposed invitation link from the previous conversation should be revoked using Supabase's supported Auth API/admin tooling; never paste the replacement link into chat.

No backend secrets are included in this package.
