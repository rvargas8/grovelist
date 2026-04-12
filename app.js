// Daily Scripture — app.js
// Powered by API.Bible (https://scripture.api.bible)

// API calls are proxied through /.netlify/functions/bible to keep the key server-side.
// Set API_BIBLE_KEY in your Netlify dashboard: Site Settings → Environment Variables.

// ── Verse of the Day pool (103 well-known verses, rotates by day of year) ──
const DAILY_VERSE_REFS = [
  'JHN.3.16',   'PSA.23.1',   'ROM.8.28',   'PHP.4.13',   'JER.29.11',
  'PRO.3.5',    'ISA.40.31',  'MAT.11.28',  'ROM.12.2',   'GAL.5.22',
  'EPH.6.10',   'HEB.11.1',   'JAS.1.5',    '1JN.4.19',   'ROM.6.23',
  'GEN.1.1',    'PSA.119.105','MAT.28.19',  'MRK.16.15',  'JHN.14.6',
  'ACT.1.8',    'ROM.3.23',   'EPH.2.8',    '1PE.2.24',   'REV.21.4',
  'PSA.91.1',   'ISA.41.10',  'JHN.10.10',  'ROM.5.8',    '2TI.3.16',
  'MAT.6.33',   'LUK.1.37',   'JHN.8.32',   'ROM.10.9',   '1CO.13.13',
  'GAL.2.20',   'PHP.4.7',    'COL.3.23',   '2TI.1.7',    'HEB.4.12',
  'PSA.46.1',   'PRO.22.6',   'ISA.53.5',   'JHN.15.5',   'ACT.2.38',
  'ROM.8.1',    '1CO.10.13',  'EPH.4.32',   'PHP.1.6',    '1TH.5.18',
  'PSA.34.8',   'ISA.55.8',   'JHN.11.25',  'ROM.8.38',   '2CO.5.17',
  'GAL.6.9',    'EPH.3.20',   'HEB.12.1',   'JAS.4.7',    '1JN.1.9',
  'PSA.100.4',  'PRO.16.3',   'JHN.1.1',    'ROM.12.1',   '1CO.15.57',
  'DEU.31.6',   'JOS.1.9',    'PSA.27.1',   'MAT.5.16',   'JHN.13.34',
  'ROM.15.13',  '2CO.12.9',   'EPH.5.20',   'COL.1.17',   'REV.3.20',
  'PSA.37.4',   'PRO.4.23',   'ISA.26.3',   'JHN.6.35',   'ACT.4.12',
  'ROM.8.31',   '1CO.6.19',   'GAL.5.1',    'PHP.4.19',   '1TH.4.17',
  'PSA.73.26',  'PRO.18.24',  'ISA.43.2',   'JHN.16.33',  '2TI.2.15',
  'MAT.22.37',  'LUK.6.31',   'JHN.4.24',   '1CO.2.9',    'HEB.13.8',
  'PSA.55.22',  'ISA.40.28',  'JHN.3.30',   'ACT.16.31',  'ROM.1.16',
  'NUM.6.24',   'PSA.143.8',  'ISA.9.6',
];

// ── Bible books (all 66, sequential reading plan) ─────────────────────────
const BIBLE_BOOKS = [
  { id: 'GEN', name: 'Genesis',         chapters: 50 },
  { id: 'EXO', name: 'Exodus',          chapters: 40 },
  { id: 'LEV', name: 'Leviticus',       chapters: 27 },
  { id: 'NUM', name: 'Numbers',         chapters: 36 },
  { id: 'DEU', name: 'Deuteronomy',     chapters: 34 },
  { id: 'JOS', name: 'Joshua',          chapters: 24 },
  { id: 'JDG', name: 'Judges',          chapters: 21 },
  { id: 'RUT', name: 'Ruth',            chapters: 4  },
  { id: '1SA', name: '1 Samuel',        chapters: 31 },
  { id: '2SA', name: '2 Samuel',        chapters: 24 },
  { id: '1KI', name: '1 Kings',         chapters: 22 },
  { id: '2KI', name: '2 Kings',         chapters: 25 },
  { id: '1CH', name: '1 Chronicles',    chapters: 29 },
  { id: '2CH', name: '2 Chronicles',    chapters: 36 },
  { id: 'EZR', name: 'Ezra',            chapters: 10 },
  { id: 'NEH', name: 'Nehemiah',        chapters: 13 },
  { id: 'EST', name: 'Esther',          chapters: 10 },
  { id: 'JOB', name: 'Job',             chapters: 42 },
  { id: 'PSA', name: 'Psalms',          chapters: 150 },
  { id: 'PRO', name: 'Proverbs',        chapters: 31 },
  { id: 'ECC', name: 'Ecclesiastes',    chapters: 12 },
  { id: 'SNG', name: 'Song of Solomon', chapters: 8  },
  { id: 'ISA', name: 'Isaiah',          chapters: 66 },
  { id: 'JER', name: 'Jeremiah',        chapters: 52 },
  { id: 'LAM', name: 'Lamentations',    chapters: 5  },
  { id: 'EZK', name: 'Ezekiel',         chapters: 48 },
  { id: 'DAN', name: 'Daniel',          chapters: 12 },
  { id: 'HOS', name: 'Hosea',           chapters: 14 },
  { id: 'JOL', name: 'Joel',            chapters: 3  },
  { id: 'AMO', name: 'Amos',            chapters: 9  },
  { id: 'OBA', name: 'Obadiah',         chapters: 1  },
  { id: 'JON', name: 'Jonah',           chapters: 4  },
  { id: 'MIC', name: 'Micah',           chapters: 7  },
  { id: 'NAM', name: 'Nahum',           chapters: 3  },
  { id: 'HAB', name: 'Habakkuk',        chapters: 3  },
  { id: 'ZEP', name: 'Zephaniah',       chapters: 3  },
  { id: 'HAG', name: 'Haggai',          chapters: 2  },
  { id: 'ZEC', name: 'Zechariah',       chapters: 14 },
  { id: 'MAL', name: 'Malachi',         chapters: 4  },
  { id: 'MAT', name: 'Matthew',         chapters: 28 },
  { id: 'MRK', name: 'Mark',            chapters: 16 },
  { id: 'LUK', name: 'Luke',            chapters: 24 },
  { id: 'JHN', name: 'John',            chapters: 21 },
  { id: 'ACT', name: 'Acts',            chapters: 28 },
  { id: 'ROM', name: 'Romans',          chapters: 16 },
  { id: '1CO', name: '1 Corinthians',   chapters: 16 },
  { id: '2CO', name: '2 Corinthians',   chapters: 13 },
  { id: 'GAL', name: 'Galatians',       chapters: 6  },
  { id: 'EPH', name: 'Ephesians',       chapters: 6  },
  { id: 'PHP', name: 'Philippians',     chapters: 4  },
  { id: 'COL', name: 'Colossians',      chapters: 4  },
  { id: '1TH', name: '1 Thessalonians', chapters: 5  },
  { id: '2TH', name: '2 Thessalonians', chapters: 3  },
  { id: '1TI', name: '1 Timothy',       chapters: 6  },
  { id: '2TI', name: '2 Timothy',       chapters: 4  },
  { id: 'TIT', name: 'Titus',           chapters: 3  },
  { id: 'PHM', name: 'Philemon',        chapters: 1  },
  { id: 'HEB', name: 'Hebrews',         chapters: 13 },
  { id: 'JAS', name: 'James',           chapters: 5  },
  { id: '1PE', name: '1 Peter',         chapters: 5  },
  { id: '2PE', name: '2 Peter',         chapters: 3  },
  { id: '1JN', name: '1 John',          chapters: 5  },
  { id: '2JN', name: '2 John',          chapters: 1  },
  { id: '3JN', name: '3 John',          chapters: 1  },
  { id: 'JUD', name: 'Jude',            chapters: 1  },
  { id: 'REV', name: 'Revelation',      chapters: 22 },
];

// Build flat array of all 1,189 Bible chapters
const ALL_CHAPTERS = [];
for (const book of BIBLE_BOOKS) {
  for (let c = 1; c <= book.chapters; c++) {
    ALL_CHAPTERS.push({
      bookId: book.id,
      bookName: book.name,
      chapter: c,
      chapterId: `${book.id}.${c}`,
      label: `${book.name} ${c}`,
    });
  }
}

// ── State ─────────────────────────────────────────────────────────────────
let selectedBibleId = localStorage.getItem('selectedBibleId') || null;

// ── Helpers ───────────────────────────────────────────────────────────────
function getDayOfYear() {
  const now = new Date();
  const start = new Date(now.getFullYear(), 0, 0);
  return Math.floor((now - start) / (1000 * 60 * 60 * 24));
}

async function apiFetch(path) {
  const res = await fetch(`/.netlify/functions/bible?path=${encodeURIComponent(path)}`);
  if (!res.ok) {
    const body = await res.text().catch(() => '');
    throw new Error(`API ${res.status}: ${body}`);
  }
  return res.json();
}

function stripHtml(html) {
  const el = document.createElement('div');
  el.innerHTML = html;
  return el.textContent || el.innerText || '';
}

function show(el) { el.classList.remove('hidden'); }
function hide(el) { el.classList.add('hidden'); }

// ── Translations ───────────────────────────────────────────────────────────
async function loadTranslations() {
  const select = document.getElementById('translationSelect');
  try {
    const data = await apiFetch('/bibles');

    // Filter to English bibles
    let bibles = data.data.filter(
      (b) => b.language && (b.language.id === 'eng' || b.language.name === 'English')
    );

    // Sort: prioritize common translations first
    const PRIORITY = ['KJV', 'KJVA', 'NIV', 'ESV', 'NKJV', 'NLT', 'NASB', 'ASV', 'WEB', 'YLT', 'MSG'];
    bibles.sort((a, b) => {
      const ai = PRIORITY.indexOf(a.abbreviation);
      const bi = PRIORITY.indexOf(b.abbreviation);
      if (ai === -1 && bi === -1) return a.name.localeCompare(b.name);
      if (ai === -1) return 1;
      if (bi === -1) return -1;
      return ai - bi;
    });

    select.innerHTML = '';
    for (const bible of bibles) {
      const opt = document.createElement('option');
      opt.value = bible.id;
      opt.textContent = `${bible.abbreviation} — ${bible.name}`;
      select.appendChild(opt);
    }

    // Restore saved selection or default to first
    const saved = localStorage.getItem('selectedBibleId');
    if (saved && bibles.find((b) => b.id === saved)) {
      select.value = saved;
      selectedBibleId = saved;
    } else {
      selectedBibleId = bibles[0]?.id ?? null;
      if (selectedBibleId) select.value = selectedBibleId;
    }
  } catch (err) {
    select.innerHTML = '<option value="">Could not load translations — check your API key</option>';
    console.error('loadTranslations error:', err);
  }
}

// ── Verse of the Day ───────────────────────────────────────────────────────
async function loadVerseOfTheDay() {
  const loading = document.getElementById('votdLoading');
  const content = document.getElementById('votdContent');
  const textEl  = document.getElementById('votdText');
  const refEl   = document.getElementById('votdRef');

  show(loading);
  hide(content);

  if (!selectedBibleId) {
    loading.innerHTML = '<p class="error-msg">No translation selected.</p>';
    return;
  }

  const day = getDayOfYear();
  const verseId = DAILY_VERSE_REFS[day % DAILY_VERSE_REFS.length];

  try {
    const params = new URLSearchParams({
      'content-type': 'text',
      'include-notes': 'false',
      'include-titles': 'false',
      'include-chapter-numbers': 'false',
      'include-verse-numbers': 'false',
      'include-verse-spans': 'false',
    });
    const data = await apiFetch(`/bibles/${selectedBibleId}/verses/${verseId}?${params}`);
    const verse = data.data;

    textEl.textContent = `"${stripHtml(verse.content).trim()}"`;
    refEl.textContent  = `— ${verse.reference}`;

    hide(loading);
    show(content);
  } catch (err) {
    loading.innerHTML = '<p class="error-msg">Could not load today\'s verse. Please check your API key.</p>';
    console.error('loadVerseOfTheDay error:', err);
  }
}

// ── Daily Reading Plan ─────────────────────────────────────────────────────
function renderReadingPlan() {
  const day = getDayOfYear();
  document.getElementById('dayNumber').textContent = Math.min(day, 365);

  const startIdx = ((day - 1) * 3) % ALL_CHAPTERS.length;
  const todayChapters = [0, 1, 2].map(
    (offset) => ALL_CHAPTERS[(startIdx + offset) % ALL_CHAPTERS.length]
  );

  const container = document.getElementById('readingCards');
  container.innerHTML = '';

  for (const ch of todayChapters) {
    const card = document.createElement('div');
    card.className = 'reading-card';
    card.innerHTML = `
      <div class="reading-card-label">${ch.label}</div>
      <button
        type="button"
        class="reading-card-btn"
        data-chapter-id="${ch.chapterId}"
        data-label="${ch.label}"
      >Read</button>
    `;
    container.appendChild(card);
  }

  container.addEventListener('click', (e) => {
    const btn = e.target.closest('[data-chapter-id]');
    if (btn) loadChapter(btn.dataset.chapterId, btn.dataset.label);
  });
}

async function loadChapter(chapterId, label) {
  const view    = document.getElementById('chapterView');
  const titleEl = document.getElementById('chapterTitle');
  const bodyEl  = document.getElementById('chapterBody');

  titleEl.textContent = label;
  bodyEl.innerHTML = '<div class="chapter-loading"><span class="spinner"></span> Loading…</div>';
  show(view);
  view.scrollIntoView({ behavior: 'smooth', block: 'start' });

  if (!selectedBibleId) return;

  try {
    const params = new URLSearchParams({
      'content-type': 'html',
      'include-notes': 'false',
      'include-titles': 'true',
      'include-chapter-numbers': 'false',
      'include-verse-numbers': 'true',
      'include-verse-spans': 'false',
    });
    const data = await apiFetch(`/bibles/${selectedBibleId}/chapters/${chapterId}?${params}`);
    // Content is trusted HTML from API.Bible
    bodyEl.innerHTML = data.data.content;
  } catch (err) {
    bodyEl.innerHTML = '<p class="error-msg">Could not load chapter. Please try again.</p>';
    console.error('loadChapter error:', err);
  }
}

// ── Search ─────────────────────────────────────────────────────────────────
let searchTimeout;

async function handleSearch(query) {
  const resultsEl = document.getElementById('searchResults');

  if (!query.trim()) {
    hide(resultsEl);
    return;
  }

  if (!selectedBibleId) return;

  show(resultsEl);
  resultsEl.innerHTML = '<div class="search-loading"><span class="spinner"></span> Searching…</div>';

  try {
    const params = new URLSearchParams({ query: query.trim(), limit: '20' });
    const data = await apiFetch(`/bibles/${selectedBibleId}/search?${params}`);
    const results = data.data;
    const verses = results.verses ?? [];

    if (verses.length === 0) {
      resultsEl.innerHTML = `<p class="no-results">No results found for "<em>${query}</em>". Try a different keyword or verse reference (e.g. "John 3:16").</p>`;
      return;
    }

    const total = results.total ?? verses.length;
    resultsEl.innerHTML = `<p class="results-count">${total.toLocaleString()} result${total !== 1 ? 's' : ''}</p>`;

    const list = document.createElement('ul');
    list.className = 'search-result-list';

    for (const verse of verses.slice(0, 20)) {
      const text = stripHtml(verse.text || verse.content || '').trim();
      const li = document.createElement('li');
      li.className = 'search-result-item';
      li.innerHTML = `
        <span class="result-ref">${verse.reference}</span>
        <p class="result-text">"${text}"</p>
      `;
      list.appendChild(li);
    }

    resultsEl.appendChild(list);
  } catch (err) {
    resultsEl.innerHTML = '<p class="error-msg">Search failed. Please try again.</p>';
    console.error('handleSearch error:', err);
  }
}

// ── Init ───────────────────────────────────────────────────────────────────
async function init() {
  await loadTranslations();

  document.getElementById('translationSelect').addEventListener('change', (e) => {
    selectedBibleId = e.target.value;
    localStorage.setItem('selectedBibleId', selectedBibleId);
    loadVerseOfTheDay();
    hide(document.getElementById('chapterView'));
    hide(document.getElementById('searchResults'));
  });

  loadVerseOfTheDay();
  renderReadingPlan();

  document.getElementById('chapterClose').addEventListener('click', () => {
    hide(document.getElementById('chapterView'));
  });

  document.getElementById('searchForm').addEventListener('submit', (e) => {
    e.preventDefault();
    handleSearch(document.getElementById('searchInput').value);
  });

  document.getElementById('searchInput').addEventListener('input', (e) => {
    clearTimeout(searchTimeout);
    searchTimeout = setTimeout(() => handleSearch(e.target.value), 450);
  });
}

document.addEventListener('DOMContentLoaded', init);
