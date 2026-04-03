# Security Notes — The Grove List

## SQL Injection

**This site is not vulnerable to SQL injection** for the usual reasons:

1. **No raw SQL** — The app uses Supabase's JavaScript client. Database access goes through Supabase's REST API (parameterized).
2. **Fixed query shapes** — Client code uses fixed table and column names; user data is bound as values, not concatenated into SQL.

## Client vs server writes

- **Public site (`app.js`, category pages)** — Reads `listings` from Supabase (plus static fallback).
- **`submit.html`** — Inserts into `submissions` after server-side reCAPTCHA verification.
- **`admin.html`** — Authenticated Supabase users review submissions and manage listings.

RLS must match this model (anon read on listings, controlled insert on submissions, authenticated admin writes).

## Other protections

- **XSS** — Listing and admin UI escape user- and DB-sourced text before DOM insertion; website `href` values are restricted to `http:` / `https:` where applicable.
- **Security headers** — `netlify.toml` (and `_headers` / `vercel.json` where used) set frame options, CSP, etc.
- **Submission notify** — `notify-submission` Netlify function accepts only a submission **id**, loads the row with **SUPABASE_SERVICE_ROLE_KEY**, HTML-escapes fields for email, and ignores non-`pending` rows for mail (idempotent no-op). It does **not** trust client-provided name/description for email body.

## Netlify function environment variables

Set these in the Netlify UI (Site settings → Environment variables):

| Variable | Purpose |
|----------|---------|
| `RESEND_API_KEY` | Send notification email |
| `NOTIFY_EMAIL` | Inbox that receives new submission alerts |
| `RECAPTCHA_SECRET_KEY` | Server-side reCAPTCHA verification |
| `SUPABASE_URL` | Same project URL as the browser (e.g. `https://xxx.supabase.co`) |
| `SUPABASE_SERVICE_ROLE_KEY` | **Secret** — used only in `notify-submission` to read a submission by id. Never expose this in client bundles. |

## Supabase Row Level Security (RLS)

The anon key in the browser is public by design. **Enforcement is in Postgres policies:** e.g. public `SELECT` on `listings`, anon `INSERT` on `submissions` only, no broad anon `SELECT` on `submissions`, and `UPDATE`/`DELETE` on sensitive tables limited to authenticated admin roles.

Review policies in the Supabase dashboard whenever you change tables or client flows.
