# The Grove List

A static HTML/JS local business directory for Southern Hillsborough County, FL. Backed by Supabase for listings data. Deployed via Netlify and Vercel.

## Stack

- Vanilla HTML/CSS/JS — no build step
- Supabase (anon key) for listings
- Google Analytics 4
- Google reCAPTCHA v2 (submit form)

## Dev setup

```bash
# Serve locally
python3 -m http.server 8767

# Run tests
bun test
```

## Testing

- Framework: Vitest + jsdom
- Run: `bun test`
- Test directory: `test/`
- See TESTING.md for full conventions

Test expectations:
- 100% test coverage is the goal — tests make vibe coding safe
- When writing new functions, write a corresponding test
- When fixing a bug, write a regression test
- When adding error handling, write a test that triggers the error
- When adding a conditional (if/else), write tests for BOTH paths
- Never commit code that makes existing tests fail
