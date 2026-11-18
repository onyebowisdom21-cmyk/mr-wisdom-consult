# Mr Wisdom Tech Media and Business Consult

Next.js 16 site with a Supabase-backed public catalog, owner dashboard, contact intake, and live-catalog AI advisor.

## Run locally

1. Install Node.js 20.9 or later.
2. Install dependencies with `npm install`.
3. Copy `.env.example` to `.env.local` and set the Supabase URL, anon key, service-role key, Google Gemini API key, and site URL. Never expose the service-role or Google API key in `NEXT_PUBLIC_*` variables.
4. Apply `supabase/schema.sql` in the Supabase SQL Editor.
5. Create the owner's account in Supabase Auth, then grant dashboard access by running the SQL below in the Supabase SQL Editor. Replace the placeholder with the exact Auth email:

   ```sql
   insert into public.admins (user_id)
   select id from auth.users
   where lower(email) = lower('YOUR_ADMIN_EMAIL')
   on conflict (user_id) do nothing;
   ```

   The email must already exist under **Authentication → Users**. The dashboard is at `/admin/login`; sign in with that account's email and password. Only users in `public.admins` can add, edit or delete catalog content.
6. Start the development server with `npm run dev`, or build and serve production with `npm run build` and `npm run start`.

The public pages read only published rows. The admin dashboard is available at `/admin/login`; it supports content CRUD and review of contact and chat inquiries.

To share a WhatsApp Channel update on the site, open **News & announcements** in the admin dashboard, copy the post text into a new news item, and add the WhatsApp post URL as its source. New news items are drafts by default; review the summary, content and links, then set **Published** to `true` to make the item public. Channel posts are not automatically imported.

Set `NEXT_PUBLIC_WHATSAPP_NUMBER` and `NEXT_PUBLIC_CALL_NUMBER` to the international-format contact number digits (without `+`) to show WhatsApp and tap-to-call links on the contact page and site footer.

## AI advisor troubleshooting

The advisor uses Google's Gemini API directly, with `gemini-3.1-flash-lite` by default. Google currently offers a limited free tier for selected Gemini models; quotas may vary, and free-tier content may be used to improve Google products. Do not send sensitive customer information through the free tier. Set `GOOGLE_GENERATIVE_AI_API_KEY` in `.env.local` or as a server-only environment variable on the hosting provider. Never expose the key through a `NEXT_PUBLIC_*` variable. Restart the local server after changing `.env.local`.

## Deploy to Vercel

Import the project into Vercel as a Next.js project and add the environment variables from `.env.example` in the project settings. Apply the Supabase schema before directing traffic to the deployment. Set `NEXT_PUBLIC_SITE_URL` to the canonical production domain and configure a strong random `REVALIDATE_SECRET` if external cache revalidation is used.

The repository ignores `.env.local` and the Vercel upload ignore list excludes local environment files so deployment does not upload local secrets.
