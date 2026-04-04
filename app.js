/* The Grove List - App */

const SUPABASE_URL = 'https://ndjgquqdaskpllcunpjp.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5kamdxdXFkYXNrcGxsY3VucGpwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzM2ODg1NDgsImV4cCI6MjA4OTI2NDU0OH0.lqk4xpVWOo-80Agds4g3_te958a8CiknFwcmMTzihwo';

const sb = window.supabase ? window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY) : null;

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
  },
  {
    id: 'la-reina-balloons',
    name: 'La Reina Balloons',
    category: 'Service',
    description: 'Custom balloon décor for birthdays, baby showers, weddings, and any celebration in the Southshore area. Every arrangement is handcrafted — from organic arches and balloon walls to marquee designs and custom backdrops. The quality and attention to detail shows in every setup.',
    phone: '(813) 400-7909',
    website: 'mailto:iris@lareinaballoons.com',
    is_featured: true,
    grove_note: 'Handcrafted balloon art that turns any event into a moment.'
  },
  {
    id: 'henry-adames-realtor',
    name: 'Henry M. Adames — Bilingual REALTOR®',
    category: 'Service',
    description: 'Bilingual Realtor® serving Tampa Bay Area, Brandon, Riverview, Valrico, Plant City, and all of Florida. Helps buyers, sellers, investors, and families relocating. Fluent in English and Spanish — call or message anytime.',
    phone: '(347) 863-1486',
    website: 'https://instagram.com/1dealllc/',
    is_featured: false,
    grove_note: ''
  }
];

/* State */
let allListings = [...FALLBACK_LISTINGS];
let _suggestionsEl = null;
let _activeSuggestionIdx = -1;

/* DOM */
const listingsGrid = document.getElementById('listingsGrid');
const listingsCount = document.getElementById('listingsCount');
const emptyState = document.getElementById('emptyState');
const searchForm = document.getElementById('searchForm');
const searchInput = document.getElementById('searchInput');
const categoryBtns = document.querySelectorAll('.category-btn');

/* Active category — driven by client-side clicks or initial PAGE_CATEGORY from URL */
let _activeCategory = window.PAGE_CATEGORY || 'all';

function getCurrentCategory() {
  return _activeCategory;
}

/* Fetch listings from Supabase (source of truth).
   Shows fallback immediately so there's never a blank state. */
async function loadListings() {
  const cat = getCurrentCategory();
  renderListings(allListings, '', cat); /* show fallback immediately */
  if (!sb) return;
  if (listingsGrid) listingsGrid.setAttribute('data-loading', '');
  try {
    const { data, error } = await sb
      .from('listings')
      .select('id, name, category, description, phone, website, is_featured, grove_note')
      .order('is_featured', { ascending: false });
    if (!error && data && data.length > 0) {
      /* Merge: keep any FALLBACK_LISTINGS entries not yet in Supabase (by id) */
      const supabaseIds = new Set(data.map(l => l.id));
      const localOnly = FALLBACK_LISTINGS.filter(l => !supabaseIds.has(l.id));
      allListings = [...data, ...localOnly];
      const term = searchInput?.value || '';
      renderListings(allListings, term, getCurrentCategory());
    }
    /* If empty or error, fallback stays shown */
  } catch (e) {
    /* Network error — fallback stays shown */
  } finally {
    if (listingsGrid) listingsGrid.removeAttribute('data-loading');
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

  if (listingsCount) listingsCount.textContent = '';
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
        renderListings(allListings, '', getCurrentCategory());
      };
    }
  }
  if (!listingsGrid) return;
  listingsGrid.innerHTML = filtered.length
    ? `<div class="listings-grid">${filtered.map(item => renderCard(item)).join('')}</div>`
    : '';
}

function formatPhone(phone) {
  const digits = String(phone).replace(/\D/g, '');
  if (digits.length === 10) {
    return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
  }
  if (digits.length === 11 && digits[0] === '1') {
    return `(${digits.slice(1, 4)}) ${digits.slice(4, 7)}-${digits.slice(7)}`;
  }
  return phone;
}

function renderCard(item) {
  const featured = item.is_featured ? '<span class="grove-pick-badge">Grove Pick</span>' : '';
  const groveNote = (item.grove_note || '').trim();
  const groveNoteHtml = groveNote ? `<p class="card-grove-note">${escapeHtml(groveNote)}</p>` : '';
  const phoneDigits = item.phone ? String(item.phone).replace(/\D/g, '').slice(0, 15) : '';
  const phoneDisplay = phoneDigits
    ? `<a href="tel:${phoneDigits}" class="card-link">${escapeHtml(formatPhone(item.phone))}</a>`
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
  hideSuggestions();
  renderListings(allListings, searchInput.value || '', getCurrentCategory());
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
  renderListings(allListings, term, getCurrentCategory());
  showSuggestions(term);
}, 200));

/* Autocomplete dropdown */
function initSearchDropdown() {
  if (!searchInput) return;
  const pill = searchInput.closest('.search-pill');
  if (!pill) return;

  const wrapper = document.createElement('div');
  wrapper.className = 'search-input-wrapper';
  pill.parentNode.insertBefore(wrapper, pill);
  wrapper.appendChild(pill);

  const dropdown = document.createElement('ul');
  dropdown.id = 'searchSuggestions';
  dropdown.className = 'search-suggestions hidden';
  dropdown.setAttribute('role', 'listbox');
  dropdown.setAttribute('aria-label', 'Search suggestions');
  wrapper.appendChild(dropdown);
  _suggestionsEl = dropdown;

  document.addEventListener('click', (e) => {
    if (!wrapper.contains(e.target)) hideSuggestions();
  });

  searchInput.addEventListener('keydown', (e) => {
    const items = _suggestionsEl ? _suggestionsEl.querySelectorAll('.search-suggestion-item') : [];
    if (!items.length) return;
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      _activeSuggestionIdx = Math.min(_activeSuggestionIdx + 1, items.length - 1);
      updateActiveSuggestion(items);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      _activeSuggestionIdx = Math.max(_activeSuggestionIdx - 1, -1);
      updateActiveSuggestion(items);
    } else if (e.key === 'Enter' && _activeSuggestionIdx >= 0 && items[_activeSuggestionIdx]) {
      e.preventDefault();
      items[_activeSuggestionIdx].dispatchEvent(new MouseEvent('mousedown', { bubbles: true }));
    } else if (e.key === 'Escape') {
      hideSuggestions();
    }
  });
}

function updateActiveSuggestion(items) {
  items.forEach((item, i) => {
    item.setAttribute('aria-selected', i === _activeSuggestionIdx ? 'true' : 'false');
  });
}

function hideSuggestions() {
  if (_suggestionsEl) _suggestionsEl.classList.add('hidden');
  _activeSuggestionIdx = -1;
}

function showSuggestions(term) {
  if (!_suggestionsEl) return;
  _activeSuggestionIdx = -1;

  if (!term || !term.trim()) {
    hideSuggestions();
    return;
  }

  const q = term.trim().toLowerCase();
  const cat = getCurrentCategory();
  const matches = allListings
    .filter(l => {
      if (cat !== 'all' && l.category !== cat) return false;
      return (
        (l.name || '').toLowerCase().includes(q) ||
        (l.category || '').toLowerCase().includes(q) ||
        (l.description || '').toLowerCase().includes(q)
      );
    })
    .slice(0, 7);

  if (!matches.length) {
    hideSuggestions();
    return;
  }

  _suggestionsEl.innerHTML = matches.map(l => `
    <li class="search-suggestion-item" role="option" aria-selected="false" data-id="${escapeHtml(safeId(l.id))}">
      <span class="suggestion-name">${highlightMatch(l.name, q)}</span>
      <span class="suggestion-category">${escapeHtml(l.category || '')}</span>
    </li>
  `).join('');

  _suggestionsEl.querySelectorAll('.search-suggestion-item').forEach(item => {
    item.addEventListener('mousedown', (e) => {
      e.preventDefault();
      const listing = allListings.find(l => safeId(l.id) === item.dataset.id);
      if (listing) {
        searchInput.value = listing.name;
        hideSuggestions();
        renderListings(allListings, listing.name, getCurrentCategory());
        const card = document.getElementById(`listing-${safeId(listing.id)}`);
        if (card) card.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    });
  });

  _suggestionsEl.classList.remove('hidden');
}

function highlightMatch(text, q) {
  if (!text) return '';
  const idx = text.toLowerCase().indexOf(q.toLowerCase());
  if (idx === -1) return escapeHtml(text);
  return (
    escapeHtml(text.slice(0, idx)) +
    '<mark class="suggestion-highlight">' +
    escapeHtml(text.slice(idx, idx + q.length)) +
    '</mark>' +
    escapeHtml(text.slice(idx + q.length))
  );
}

/* About section scroll */
document.getElementById('aboutScrollBtn')?.addEventListener('click', () => {
  const cards = document.getElementById('aboutCards');
  if (cards) cards.scrollBy({ left: 300, behavior: 'smooth' });
});

/* Highlight the active category button and update the heading */
function applyActiveCategory() {
  const cat = getCurrentCategory();
  categoryBtns.forEach(btn => {
    btn.classList.toggle('active', btn.dataset.category === cat);
  });
  const heading = document.querySelector('.listings-heading');
  if (heading) {
    heading.textContent = cat === 'all' ? 'Around the Grove' : cat;
  }
}
applyActiveCategory();

/* Client-side category filtering — intercept all category button clicks */
categoryBtns.forEach(btn => {
  btn.addEventListener('click', (e) => {
    e.preventDefault();
    const cat = btn.dataset.category || 'all';
    _activeCategory = cat;
    applyActiveCategory();
    const term = searchInput ? searchInput.value || '' : '';
    renderListings(allListings, term, cat);
    /* Scroll to listings */
    const listingsSection = document.querySelector('.listings-section');
    if (listingsSection) listingsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
  });
});

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

initSearchDropdown();
loadListings();
