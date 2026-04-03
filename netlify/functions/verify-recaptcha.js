exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  let token;
  try {
    const body = JSON.parse(event.body);
    token = body.token;
  } catch {
    return { statusCode: 400, body: JSON.stringify({ success: false, error: 'Invalid request' }) };
  }

  if (!token) {
    return { statusCode: 400, body: JSON.stringify({ success: false, error: 'Missing token' }) };
  }

  const secret = process.env.RECAPTCHA_SECRET_KEY;
  if (!secret) {
    return { statusCode: 500, body: JSON.stringify({ success: false, error: 'Server misconfiguration' }) };
  }

  try {
    const response = await fetch(
      `https://www.google.com/recaptcha/api/siteverify?secret=${secret}&response=${token}`,
      { method: 'POST' }
    );
    const data = await response.json();
    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ success: data.success })
    };
  } catch (err) {
    return {
      statusCode: 500,
      body: JSON.stringify({ success: false, error: 'Verification failed' })
    };
  }
};
