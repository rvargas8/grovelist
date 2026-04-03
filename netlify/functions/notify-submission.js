/**
 * Sends admin notification for a new submission.
 * Expects { id: "<submission uuid>" }. Loads the row from Supabase with the
 * service role (secrets stay server-side). Requires env:
 * RESEND_API_KEY, NOTIFY_EMAIL, SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY
 */

'use strict';

const { assertAllowedOrigin, getJsonHeaders } = require('./_allowed-origin');

/* UUID (default Supabase gen_random_uuid) or slug / numeric id */
const SAFE_SUBMISSION_ID =
  /^(?:[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}|[a-zA-Z0-9_-]{1,128})$/i;

function escapeHtml(value) {
  if (value == null) return '';
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function subjectSafe(value) {
  return String(value || 'Unknown Business')
    .replace(/[\r\n\u2028\u2029]+/g, ' ')
    .slice(0, 200);
}

exports.handler = async (event) => {
  const headers = getJsonHeaders();

  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, headers, body: JSON.stringify({ error: 'Method not allowed' }) };
  }

  const gate = assertAllowedOrigin(event);
  if (!gate.ok) {
    return { statusCode: 403, headers, body: JSON.stringify({ error: 'Forbidden' }) };
  }

  const rawBody = event.body || '';
  if (rawBody.length > 4096) {
    return { statusCode: 400, headers, body: JSON.stringify({ error: 'Invalid request' }) };
  }

  let body;
  try {
    body = JSON.parse(rawBody);
  } catch {
    return { statusCode: 400, headers, body: JSON.stringify({ error: 'Invalid request' }) };
  }

  const id = body.id != null ? String(body.id).trim() : '';
  if (!id || !SAFE_SUBMISSION_ID.test(id)) {
    return { statusCode: 400, headers, body: JSON.stringify({ error: 'Invalid request' }) };
  }

  const apiKey = process.env.RESEND_API_KEY;
  const notifyEmail = process.env.NOTIFY_EMAIL;
  const supabaseUrl = (process.env.SUPABASE_URL || '').replace(/\/+$/, '');
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!apiKey || !notifyEmail || !supabaseUrl || !serviceRoleKey) {
    console.error('Missing RESEND_API_KEY, NOTIFY_EMAIL, SUPABASE_URL, or SUPABASE_SERVICE_ROLE_KEY');
    return { statusCode: 500, headers, body: JSON.stringify({ error: 'Server misconfiguration' }) };
  }

  let submission;
  try {
    const res = await fetch(
      `${supabaseUrl}/rest/v1/submissions?id=eq.${encodeURIComponent(id)}&select=name,category,description,phone,website,submitter_contact,status`,
      {
        headers: {
          apikey: serviceRoleKey,
          Authorization: `Bearer ${serviceRoleKey}`,
          Accept: 'application/json'
        }
      }
    );

    if (!res.ok) {
      console.error('Supabase fetch failed:', res.status, await res.text());
      return { statusCode: 502, headers, body: JSON.stringify({ error: 'Upstream error' }) };
    }

    const rows = await res.json();
    if (!Array.isArray(rows) || rows.length !== 1) {
      return { statusCode: 404, headers, body: JSON.stringify({ error: 'Not found' }) };
    }

    submission = rows[0];
    if (submission.status !== 'pending') {
      /* Idempotent no-op: row exists but notification path is only for new pending rows */
      return { statusCode: 200, headers, body: JSON.stringify({ success: true, skipped: true }) };
    }
  } catch (e) {
    console.error('Supabase load error:', e);
    return { statusCode: 502, headers, body: JSON.stringify({ error: 'Upstream error' }) };
  }

  const name = submission.name;
  const category = submission.category;
  const description = submission.description;
  const phone = submission.phone;
  const website = submission.website;
  const submitter_contact = submission.submitter_contact;

  const en = escapeHtml;
  const html = `
    <div style="font-family:sans-serif;max-width:560px;margin:0 auto;">
      <h2 style="color:#bf5a38;margin-bottom:4px;">New Business Submission</h2>
      <p style="color:#888;font-size:14px;margin-top:0;">Someone submitted their business to The Grove List</p>
      <hr style="border:none;border-top:1px solid #e6e0d8;margin:20px 0;">
      <table style="width:100%;border-collapse:collapse;font-size:15px;">
        <tr><td style="padding:8px 0;color:#888;width:140px;">Business Name</td><td style="padding:8px 0;font-weight:600;color:#2d2d2d;">${en(name) || '—'}</td></tr>
        <tr><td style="padding:8px 0;color:#888;">Category</td><td style="padding:8px 0;color:#2d2d2d;">${en(category) || '—'}</td></tr>
        <tr><td style="padding:8px 0;color:#888;">Description</td><td style="padding:8px 0;color:#2d2d2d;">${en(description) || '—'}</td></tr>
        <tr><td style="padding:8px 0;color:#888;">Phone</td><td style="padding:8px 0;color:#2d2d2d;">${en(phone) || '—'}</td></tr>
        <tr><td style="padding:8px 0;color:#888;">Website</td><td style="padding:8px 0;color:#2d2d2d;">${en(website) || '—'}</td></tr>
        <tr><td style="padding:8px 0;color:#888;">Their Contact</td><td style="padding:8px 0;color:#2d2d2d;">${en(submitter_contact) || '—'}</td></tr>
      </table>
      <hr style="border:none;border-top:1px solid #e6e0d8;margin:20px 0;">
      <a href="https://thegrovelist.com/admin.html" style="display:inline-block;background:#bf5a38;color:#fff;text-decoration:none;padding:10px 24px;border-radius:2px;font-weight:600;font-size:15px;">Review in Admin →</a>
      <p style="color:#aaa;font-size:12px;margin-top:24px;">The Grove List · thegrovelist.com</p>
    </div>
  `;

  try {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        from: 'The Grove List <onboarding@resend.dev>',
        to: [notifyEmail],
        subject: `New submission: ${subjectSafe(name)}`,
        html
      })
    });

    if (!res.ok) {
      const err = await res.text();
      console.error('Resend error:', err);
      return { statusCode: 500, headers, body: JSON.stringify({ error: 'Email failed to send' }) };
    }

    return { statusCode: 200, headers, body: JSON.stringify({ success: true }) };
  } catch (err) {
    console.error('Network error:', err);
    return { statusCode: 500, headers, body: JSON.stringify({ error: 'Email failed to send' }) };
  }
};
