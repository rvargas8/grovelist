'use strict';

/**
 * Limits browser-driven abuse of serverless endpoints from random websites.
 * Skipped during `netlify dev` (NETLIFY_DEV=true).
 */
exports.assertAllowedOrigin = function assertAllowedOrigin(event) {
  if (process.env.NETLIFY_DEV === 'true') return { ok: true };

  const allow = buildAllowlist();
  const origin = getRequestOrigin(event);
  if (!origin) return { ok: false };
  if (allow.has(origin)) return { ok: true };
  return { ok: false };
};

exports.getJsonHeaders = function getJsonHeaders() {
  return {
    'Content-Type': 'application/json; charset=utf-8',
    'X-Content-Type-Options': 'nosniff',
  };
};

function buildAllowlist() {
  const out = new Set();
  for (const o of ['https://thegrovelist.com', 'https://www.thegrovelist.com']) {
    out.add(o);
  }
  for (const o of (process.env.ALLOWED_SITE_ORIGINS || '').split(',')) {
    const s = o.trim();
    if (s) out.add(s);
  }
  for (const key of ['DEPLOY_PRIME_URL', 'DEPLOY_URL', 'URL']) {
    const raw = process.env[key];
    if (!raw) continue;
    try {
      out.add(new URL(raw).origin);
    } catch (_) {}
  }
  return out;
}

function getRequestOrigin(event) {
  const h = event.headers || {};
  const origin = (h.origin || h.Origin || '').trim();
  if (origin) return origin;
  const referer = (h.referer || h.Referer || '').trim();
  if (!referer) return '';
  try {
    return new URL(referer).origin;
  } catch (_) {
    return '';
  }
}
