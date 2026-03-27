/* The Grove List - App */

const SUPABASE_URL = 'https://ndjgquqdaskpllcunpjp.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5kamdxdXFkYXNrcGxsY3VucGpwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzM2ODg1NDgsImV4cCI6MjA4OTI2NDU0OH0.lqk4xpVWOo-80Agds4g3_te958a8CiknFwcmMTzihwo';

const supabase = window.supabase ? window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY) : null;

/* Fallback listings — shown immediately and if Supabase is unavailable.
   Keep to Grove Picks only so the fallback is always credible. */
const FALLBACK_LISTINGS = [
  {
    id: 'rello-runs',
    name: 'Rello Runs Academy',
    category: 'Sports',
    description: 'Basketball academy focused on faith, teamwork, and encouragement. Expert coaching, private training, homeschool P.E., camps, and 3v3 leagues for young athletes in Riverview.',
    phone: '',
    website: 'https://relloruns.com',
    is_featured: true,
    grove_note: 'The kind of place where kids learn more than layups.'
  },
  {
    id: 'italian-kitchen',
    name: 'Italian Kitchen Grill & Cafe',
    category: 'Restaurant',
    description: 'Fresh homemade Italian cuisine in Riverview. Stone oven baked pastas, seafood risotto, specialty dishes from Sicily to Florence. Family-friendly, wine menu, pickup and delivery.',
    phone: '(813) 671-0953',
    website: 'https://italiankitchencafe.com',
    is_featured: true,
    grove_note: 'Homemade pasta and Mediterranean flavors. Great for family dinner.'
  },
  {
    id: 'beauty-doctors',
    name: 'The Beauty Doctors',
    category: 'Health',
    description: 'Medical aesthetics and beauty services in Gibsonton. Skincare, injectables, and treatments from experienced practitioners who know the community.',
    phone: '(813) 731-5298',
    website: 'https://thebeautydoctorsflorida.com',
    is_featured: true,
    grove_note: 'Expert care in a welcoming, local setting.'
  },
  {
    id: 'apollo-beach-racquet',
    name: 'Apollo Beach Racquet and Fitness Club',
    category: 'Sports',
    description: 'Tennis and pickleball in Apollo Beach. Courts, lessons, clinics, and social play for all ages and skill levels.',
    phone: '(813) 641-1922',
    website: 'https://www.abrfc.com',
    is_featured: true,
    grove_note: 'Where the community comes to play.'
  },
  {
    id: 'tampa-bay-shine',
    name: 'Tampa Bay Shine',
    category: 'Service',
    description: 'Professional residential and commercial cleaning serving Southern Hillsborough County and the greater Tampa Bay area. Specializing in house cleaning, deep cleaning, move-in/move-out cleaning, Airbnb turnovers, office cleaning, and professional window cleaning (interior and exterior) for a streak-free finish. All 5-star reviews.',
    phone: '',
    website: 'https://tampabayshine.com',
    is_featured: false,
    grove_note: 'Reliable, detail-oriented cleaning with all 5-star reviews. Easy online booking.'
  }
];

/* State */
let allListings = [...FALLBACK_LISTINGS];

/* DOM */
const listingsGrid = document.getElementById('listingsGrid');
const listingsCount = document.getElementById('listingsCount');
const emptyState = document.getElementById('emptyState');
const searchForm = document.getElementById('searchForm');
const searchInput = document.getElementById('searchInput');
const categoryBtns = document.querySelectorAll('.category-btn');

/* Fetch listings from Supabase (source of truth).
   Shows fallback immediately so there's never a blank state. */
async function loadListings() {
  const urlCat = new URLSearchParams(window.location.search).get('category') || 'all';
  renderListings(allListings, '', urlCat); /* show fallback immediately */
  if (!supabase) return;
  try {
    const { data, error } = await supabase
      .from('listings')
      .select('id, name, category, description, phone, website, is_featured, grove_note')
      .order('is_featured', { ascending: false });
    if (!error && data && data.length > 0) {
      allListings = data;
      const term = searchInput?.value || '';
      const activeCategory = document.querySelector('.category-btn.active')?.dataset.category || 'all';
      renderListings(allListings, term, activeCategory);
    }
    /* If empty or error, fallback stays shown */
  } catch (e) {
    /* Network error — fallback stays shown */
  }
}

/* Render cards */
function renderListings(listings, searchTerm = '', categoryFilter = 'all') {
  let filtered = [...listings];
  if (categoryFilter !== 'all') {
    filtered = filtered.filter(l => l.category === categoryFilter);
  }
  if (searchTerm.trim()) {
    const q = searchTerm.trim().toLowerCase();
    filtered = filtered.filter(l =>
      (l.name || '').toLowerCase().includes(q) ||
      (l.description || '').toLowerCase().includes(q) ||
      (l.category || '').toLowerCase().includes(q)
    );
  }

  if (listingsCount) listingsCount.textContent = `${filtered.length} business${filtered.length !== 1 ? 'es' : ''} found`;
  if (emptyState) {
    const term = searchTerm.trim();
    const msg = term
      ? `No matches for \u201c${term}\u201d \u2014 try a different search, or browse by category below.`
      : 'No businesses match this category. Try a different filter.';
    const p = emptyState.querySelector('.empty-state-msg');
    if (p) p.textContent = msg;
    emptyState.classList.toggle('hidden', filtered.length > 0);
    const clearBtn = document.getElementById('clearSearchBtn');
    if (clearBtn) {
      clearBtn.onclick = () => {
        if (searchInput) { searchInput.value = ''; searchInput.focus(); }
        searchTerm = '';
        activeCategory = 'All';
        document.querySelectorAll('.category-btn').forEach(b => b.classList.toggle('active', b.dataset.category === 'All'));
        renderListings();
      };
    }
  }
  if (!listingsGrid) return;
  const picks = filtered.filter(l => l.is_featured);
  const discovers = filtered.filter(l => !l.is_featured);
  let html = '';
  if (picks.length > 0) {
    html += `<div class="listings-section-group"><h3 class="section-label">Our Picks</h3><div class="listings-grid">${picks.map(item => renderCard(item)).join('')}</div></div>`;
  }
  if (discovers.length > 0) {
    html += `<div class="listings-section-group"><h3 class="section-label">Worth Discovering</h3><div class="listings-grid">${discovers.map(item => renderCard(item)).join('')}</div></div>`;
  }
  listingsGrid.innerHTML = html || '';
}

function renderCard(item) {
  const featured = item.is_featured ? '<span class="grove-pick-badge">Grove Pick</span>' : '';
  const groveNote = (item.grove_note || '').trim();
  const groveNoteHtml = groveNote ? `<p class="card-grove-note">${escapeHtml(groveNote)}</p>` : '';
  const phoneDigits = item.phone ? String(item.phone).replace(/\D/g, '').slice(0, 15) : '';
  const phoneDisplay = phoneDigits
    ? `<a href="tel:${phoneDigits}" class="card-link">${escapeHtml(item.phone)}</a>`
    : '<span class="card-placeholder">—</span>';
  const websiteDisplay = item.website && isSafeUrl(item.website)
    ? `<a href="${escapeHtml(item.website)}" class="card-link card-website-link" target="_blank" rel="noopener noreferrer">${escapeHtml(formatWebsiteDisplay(item.website))}</a>`
    : '<span class="card-placeholder">—</span>';

  const cardId = safeId(item.id);
  return `
    <article class="listing-card ${item.is_featured ? 'featured' : ''}" ${cardId ? `id="listing-${escapeHtml(cardId)}"` : ''}>
      <p class="card-category">${escapeHtml(item.category || 'Other')}</p>
      ${featured}
      <h3 class="card-name">${escapeHtml(item.name)}</h3>
      ${groveNoteHtml}
      <p class="card-description">${escapeHtml(item.description || '—')}</p>
      <p class="card-phone">${phoneDisplay}</p>
      <p class="card-website">${websiteDisplay}</p>
    </article>
  `;
}

function formatWebsiteDisplay(url) {
  try {
    const u = url.replace(/^https?:\/\//, '').replace(/\/$/, '');
    return u || '—';
  } catch (_) { return url; }
}

/* Safe URL: only http(s). Blocks javascript:, data:, vbscript:, etc. */
function isSafeUrl(url) {
  if (typeof url !== 'string' || !url.trim()) return false;
  const t = url.trim().toLowerCase();
  return t.startsWith('https://') || t.startsWith('http://');
}

function escapeHtml(str) {
  if (str == null) return '';
  const s = String(str);
  const div = document.createElement('div');
  div.textContent = s;
  return div.innerHTML;
}

function safeId(id) {
  if (id == null) return '';
  return String(id).replace(/[^a-zA-Z0-9_-]/g, '');
}

/* Search */
searchForm?.addEventListener('submit', (e) => {
  e.preventDefault();
  const term = searchInput.value || '';
  const activeCategory = document.querySelector('.category-btn.active')?.dataset.category || 'all';
  renderListings(allListings, term, activeCategory);
});

function debounce(fn, ms) {
  let t;
  return function () {
    clearTimeout(t);
    t = setTimeout(() => fn(), ms);
  };
}
searchInput?.addEventListener('input', debounce(() => {
  const term = searchInput.value || '';
  const activeCategory = document.querySelector('.category-btn.active')?.dataset.category || 'all';
  renderListings(allListings, term, activeCategory);
}, 250));

/* About section scroll */
document.getElementById('aboutScrollBtn')?.addEventListener('click', () => {
  const cards = document.getElementById('aboutCards');
  if (cards) cards.scrollBy({ left: 300, behavior: 'smooth' });
});

/* On load: highlight the active category link based on URL */
function applyCategoryFromUrl() {
  const params = new URLSearchParams(window.location.search);
  const cat = params.get('category') || 'all';
  categoryBtns.forEach(btn => {
    btn.classList.toggle('active', btn.dataset.category === cat);
  });
  /* Update the section heading to reflect the active category */
  const heading = document.querySelector('.listings-heading');
  if (heading && cat !== 'all') {
    heading.textContent = cat;
  }
}
applyCategoryFromUrl();

/* Email obfuscation: build mailto from data attributes to deter scrapers */
document.querySelectorAll('[data-email-user][data-email-domain]').forEach(el => {
  el.href = `mailto:${el.dataset.emailUser}@${el.dataset.emailDomain}`;
});

/* Cookie consent banner */
(function () {
  if (localStorage.getItem('cookie_consent')) return;
  const banner = document.getElementById('cookieBanner');
  if (!banner) return;
  banner.classList.remove('hidden');
  document.getElementById('cookieAccept')?.addEventListener('click', () => {
    localStorage.setItem('cookie_consent', '1');
    banner.classList.add('hidden');
  });
})();

loadListings();
