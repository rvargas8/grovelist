# Security Notes — The Grove List

## SQL Injection

**This site is not vulnerable to SQL injection** for the following reasons:

1. **No raw SQL** — The app uses Supabase's JavaScript client. All database access goes through Supabase's REST API, which uses parameterized queries. User input is never concatenated into SQL strings.

2. **Read-only from client** — The frontend only performs `SELECT` operations. There is no form that writes to the database from the browser.

3. **Fixed queries** — The Supabase query uses fixed column names and no user-controlled values in the query itself:
   ```js
   .from('listings')
   .select('id, name, category, description, phone, website, is_featured')
   .order('is_featured', { ascending: false })
   ```

## Other Protections

- **XSS** — All user-facing and database-sourced data is escaped with `escapeHtml()` before being inserted into the DOM.
- **URL safety** — Website links are validated with `isSafeUrl()` to allow only `http://` and `https://`. Blocks `javascript:`, `data:`, `vbscript:`, etc.
- **ID sanitization** — Card IDs use `safeId()` to allow only alphanumeric, hyphen, and underscore characters.
- **Phone links** — Tel hrefs use only digits (0–15 chars) stripped from input.
- **Security headers** — `_headers` (Netlify) and `netlify.toml` add X-Frame-Options, X-Content-Type-Options, CSP, etc.
- **rel="noopener noreferrer"** — Used on external links to reduce tab-nabbing and referrer leakage.

## Supabase Row Level Security (RLS)

If you enable Supabase writes later, configure RLS in the Supabase dashboard:

1. Enable RLS on the `listings` table.
2. For anon read: `CREATE POLICY "Allow public read" ON listings FOR SELECT USING (true);`
3. For anon insert (if adding a form): restrict who can insert, or use a service role for admin-only inserts.

The anon key in the client is meant to be public. Security is enforced by RLS policies in the database.
