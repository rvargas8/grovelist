'use strict';

const { assertAllowedOrigin, getJsonHeaders } = require('./_allowed-origin');

exports.handler = async (event) => {
  const headers = getJsonHeaders();

  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, headers, body: JSON.stringify({ success: false, error: 'Method not allowed' }) };
  }

  const gate = assertAllowedOrigin(event);
  if (!gate.ok) {
    return { statusCode: 403, headers, body: JSON.stringify({ success: false, error: 'Forbidden' }) };
  }

  const rawBody = event.body || '';
  if (rawBody.length > 4096) {
    return { statusCode: 400, headers, body: JSON.stringify({ success: false, error: 'Invalid request' }) };
  }

  let token;
  try {
    const body = JSON.parse(rawBody);
    token = body.token;
  } catch {
    return { statusCode: 400, headers, body: JSON.stringify({ success: false, error: 'Invalid request' }) };
  }

  if (!token || typeof token !== 'string') {
    return { statusCode: 400, headers, body: JSON.stringify({ success: false, error: 'Missing token' }) };
  }

  const trimmed = token.trim();
  if (trimmed.length < 10 || trimmed.length > 4000) {
    return { statusCode: 400, headers, body: JSON.stringify({ success: false, error: 'Invalid request' }) };
  }

  const secret = process.env.RECAPTCHA_SECRET_KEY;
  if (!secret) {
    return { statusCode: 500, headers, body: JSON.stringify({ success: false, error: 'Server misconfiguration' }) };
  }

  try {
    const params = new URLSearchParams();
    params.set('secret', secret);
    params.set('response', trimmed);

    const response = await fetch('https://www.google.com/recaptcha/api/siteverify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: params.toString(),
    });

    const data = await response.json();
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ success: Boolean(data.success) }),
    };
  } catch (err) {
    console.error('reCAPTCHA verify error:', err);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ success: false, error: 'Verification failed' }),
    };
  }
};
