# TODOS — The Grove List

---

## Logo — Remove White Background

**What:** Replace `orange.png` with a transparent-background version.

**Why:** The current logo has a white box visible against the header, making it look pasted-on rather than integrated.

**How:** Go to [remove.bg](https://remove.bg), upload `orange.png`, download the transparent PNG, replace `orange.png` in the project, redeploy.

**Pros:** Logo integrates cleanly into the header. Works on any background color if the design ever changes.

**Cons:** None — takes 60 seconds.

**Depends on:** Nothing.

---

## Individual Business Pages (SEO)

**What:** Create a dedicated page per business (e.g. `/rello-runs`) with full details, structured data, and SEO metadata.

**Why:** Right now all businesses share one page. Google can't rank "Rello Runs Academy Riverview FL" as a separate result. Individual pages let each business rank for its own name + location — free organic traffic from new movers searching Google.

**Pros:**
- Each business gets a shareable URL they can post themselves
- Compounds as a free acquisition channel over time
- Businesses feel more invested in their listing

**Cons:**
- Requires a build tool (11ty, Astro) or server-side rendering — meaningful complexity step up
- Not needed for the realtor pitch (the directory page is sufficient to show realtors)

**Context:** Deferred from launch planning. Start here after you have 10+ real listings in Supabase and at least 1 confirmed realtor/HOA partner. The realtor pitch validates distribution before investing in SEO infrastructure.

**Depends on:** Supabase migration complete, 10+ real verified listings, realtor distribution confirmed.

---

## reCAPTCHA Domain — Add localhost to Allowed Domains

**What:** Add `localhost` to the allowed domains in Google reCAPTCHA console so the submit form can be tested locally.

**Why:** Submit form shows "localhost is not in the list for this site key" in local development, blocking QA of the full submission flow. Found by /qa on 2026-04-04.

**How:** Go to https://www.google.com/recaptcha/admin → find the site key → add `localhost` to the domain list.

**Deferred:** Low priority until you need to test submit flow locally. Production should work fine if production domain is already listed.

**Depends on:** Google reCAPTCHA console access.
