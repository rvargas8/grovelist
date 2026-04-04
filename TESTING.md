# Testing — The Grove List

## Philosophy

100% test coverage is the key to great vibe coding. Tests let you move fast, trust your instincts, and ship with confidence — without them, vibe coding is just yolo coding. With tests, it's a superpower.

## Framework

- **Vitest** v2.1.0 — fast, ESM-native test runner
- **jsdom** v25 — browser environment simulation for DOM tests
- **Runtime:** Node.js (via Bun)

## How to run

```bash
bun test           # run all tests once
bun test --watch   # watch mode
```

## Test layers

| Layer | When to write | Location |
|-------|---------------|----------|
| **Unit** | Pure functions (formatPhone, escapeHtml, isSafeUrl, etc.) | `test/` |
| **Integration** | DOM interactions, Supabase mock flows | `test/` |
| **Smoke / E2E** | Full browser flows | Future: Playwright |

## Conventions

- File naming: `test/{feature}.regression-{N}.test.js`
- Use `describe` + `it` blocks
- Assertions: `expect(actual).toBe(expected)` or `.toEqual()` for objects
- Always include the regression comment header:
  ```js
  // Regression: ISSUE-NNN — what broke
  // Found by /qa on YYYY-MM-DD
  ```
- Pure functions only in unit tests — mock DOM/Supabase in integration tests

## Current test files

| File | Tests | Covers |
|------|-------|--------|
| `test/app.regression-001.test.js` | 15 | `formatPhone`, `isSafeUrl`, `formatWebsiteDisplay`, loading state guard |
