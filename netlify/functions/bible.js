// Proxy for API.Bible — keeps the API key out of client-side code.
// Reads API_BIBLE_KEY from Netlify environment variables.
//
// Usage: /.netlify/functions/bible?path=/bibles
//   The `path` param is the full API.Bible path (including any query string).

const API_BASE = 'https://rest.api.bible/v1';

exports.handler = async (event) => {
  const apiKey = process.env.API_BIBLE_KEY;
  if (!apiKey) {
    return {
      statusCode: 500,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: 'API_BIBLE_KEY environment variable is not set' }),
    };
  }

  const path = event.queryStringParameters?.path || '';
  if (!path || !path.startsWith('/')) {
    return {
      statusCode: 400,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: 'Missing or invalid path parameter' }),
    };
  }

  const url = `${API_BASE}${path}`;

  try {
    const res = await fetch(url, {
      headers: { 'api-key': apiKey },
    });
    const body = await res.text();
    return {
      statusCode: res.status,
      headers: { 'Content-Type': 'application/json' },
      body,
    };
  } catch (err) {
    return {
      statusCode: 502,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: `Upstream request failed: ${err.message}` }),
    };
  }
};
