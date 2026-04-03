exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  let submission;
  try {
    submission = JSON.parse(event.body);
  } catch {
    return { statusCode: 400, body: JSON.stringify({ error: 'Invalid request' }) };
  }

  const apiKey = process.env.RESEND_API_KEY;
  const notifyEmail = process.env.NOTIFY_EMAIL;

  if (!apiKey || !notifyEmail) {
    console.error('Missing RESEND_API_KEY or NOTIFY_EMAIL env vars');
    return { statusCode: 500, body: JSON.stringify({ error: 'Server misconfiguration' }) };
  }

  const { name, category, description, phone, website, submitter_contact } = submission;

  const html = `
    <div style="font-family:sans-serif;max-width:560px;margin:0 auto;">
      <h2 style="color:#bf5a38;margin-bottom:4px;">New Business Submission</h2>
      <p style="color:#888;font-size:14px;margin-top:0;">Someone submitted their business to The Grove List</p>
      <hr style="border:none;border-top:1px solid #e6e0d8;margin:20px 0;">
      <table style="width:100%;border-collapse:collapse;font-size:15px;">
        <tr><td style="padding:8px 0;color:#888;width:140px;">Business Name</td><td style="padding:8px 0;font-weight:600;color:#2d2d2d;">${name || '—'}</td></tr>
        <tr><td style="padding:8px 0;color:#888;">Category</td><td style="padding:8px 0;color:#2d2d2d;">${category || '—'}</td></tr>
        <tr><td style="padding:8px 0;color:#888;">Description</td><td style="padding:8px 0;color:#2d2d2d;">${description || '—'}</td></tr>
        <tr><td style="padding:8px 0;color:#888;">Phone</td><td style="padding:8px 0;color:#2d2d2d;">${phone || '—'}</td></tr>
        <tr><td style="padding:8px 0;color:#888;">Website</td><td style="padding:8px 0;color:#2d2d2d;">${website || '—'}</td></tr>
        <tr><td style="padding:8px 0;color:#888;">Their Contact</td><td style="padding:8px 0;color:#2d2d2d;">${submitter_contact || '—'}</td></tr>
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
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        from: 'The Grove List <onboarding@resend.dev>',
        to: [notifyEmail],
        subject: `New submission: ${name || 'Unknown Business'}`,
        html
      })
    });

    if (!res.ok) {
      const err = await res.text();
      console.error('Resend error:', err);
      return { statusCode: 500, body: JSON.stringify({ error: 'Email failed to send' }) };
    }

    return { statusCode: 200, body: JSON.stringify({ success: true }) };
  } catch (err) {
    console.error('Network error:', err);
    return { statusCode: 500, body: JSON.stringify({ error: err.message }) };
  }
};
