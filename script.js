
// Keep clean roster URLs on the published site, while preserving direct file links in local previews.
if (window.location.protocol === 'file:') {
  document.querySelectorAll('a[href]').forEach(link => {
    const href = link.getAttribute('href');
    if (/^(?:roster\/)?players\/[^/]+\/$/.test(href)) {
      link.setAttribute('href', `${href}index.html`);
    }
  });
}
const toggle = document.querySelector('.menu-toggle');
const mobileNavigation = document.querySelector('.header-navigation');

// Rotate a shuffled deck through the homepage roster preview so every profile
// gets a turn before the same cycle repeats.
const rosterPreview = document.querySelector('.roster-preview');
const roster = window.CRRIHC_ROSTER || {};
if (rosterPreview && Object.keys(roster).length) {
  const players = Object.values(roster);
  const validSlugs = new Set(players.map(player => player.slug));
  const deckKey = 'crrihc-home-roster-cycle-v1';
  const shuffledPlayers = excluded => {
    const pool = players.filter(player => !excluded.has(player.slug));
    for (let i = pool.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [pool[i], pool[j]] = [pool[j], pool[i]];
    }
    return pool;
  };
  let deck = [];
  try {
    const savedDeck = JSON.parse(window.localStorage.getItem(deckKey) || '[]');
    if (Array.isArray(savedDeck)) deck = savedDeck.filter(slug => validSlugs.has(slug));
  } catch (_) {}
  const selected = [];
  while (selected.length < 4 && players.length) {
    deck = deck.filter(slug => !selected.some(player => player.slug === slug));
    if (!deck.length) deck = shuffledPlayers(new Set(selected.map(player => player.slug))).map(player => player.slug);
    const slug = deck.shift();
    const player = players.find(candidate => candidate.slug === slug);
    if (player) selected.push(player);
  }
  try { window.localStorage.setItem(deckKey, JSON.stringify(deck)); } catch (_) {}

  const isLocalFile = window.location.protocol === 'file:';
  rosterPreview.replaceChildren();
  selected.forEach((player, index) => {
    const card = document.createElement('a');
    card.className = 'profile-tile';
    card.href = `roster/players/${player.slug}/${isLocalFile ? 'index.html' : ''}`;
    const photo = player.photo || 'temp-player-image.png';
    const hasNumber = Boolean(player.number);
    const number = hasNumber ? String(player.number).padStart(2, '0') : '—';
    const role = player.position || player.role || 'Player';
    const image = document.createElement('div');
    image.className = `profile-image${index ? ` tone-${['two','three','four'][((index - 1) % 3)]}` : ''}`;
    const numberMark = document.createElement('span');
    numberMark.className = 'tile-number';
    numberMark.textContent = number;
    const portrait = document.createElement('img');
    portrait.className = 'profile-photo';
    if (photo === 'temp-player-image.png') portrait.classList.add('is-placeholder');
    portrait.src = `assets/${photo}`;
    portrait.alt = `${player.name}, Chester Road Reapers ${role.toLowerCase()}`;
    portrait.onerror = () => {
      portrait.onerror = null;
      portrait.src = 'assets/temp-player-image.png';
      portrait.classList.add('is-placeholder');
    };
    image.append(numberMark, portrait);
    const caption = document.createElement('div');
    caption.className = 'profile-caption';
    const text = document.createElement('div');
    const name = document.createElement('strong');
    name.textContent = player.name;
    const detail = document.createElement('span');
    detail.textContent = `${role}${hasNumber ? ` · #${player.number}` : ''}`;
    const arrow = document.createElement('b');
    arrow.textContent = '↗︎';
    text.append(name, detail);
    caption.append(text, arrow);
    card.append(image, caption);
    rosterPreview.append(card);
  });
}

function setMobileMenuOpen(open) {
  if (!toggle || !mobileNavigation) return;
  mobileNavigation.classList.toggle('open', open);
  document.body.classList.toggle('mobile-menu-open', open);
  toggle.setAttribute('aria-expanded', String(open));
  toggle.setAttribute('aria-label', open ? 'Close navigation' : 'Open navigation');
}

toggle?.addEventListener('click', () => {
  setMobileMenuOpen(toggle.getAttribute('aria-expanded') !== 'true');
});

mobileNavigation?.querySelectorAll('a').forEach(link => {
  link.addEventListener('click', () => setMobileMenuOpen(false));
});

document.addEventListener('click', event => {
  if (mobileNavigation?.classList.contains('open') && !event.target.closest('.site-header')) {
    setMobileMenuOpen(false);
  }
});

const pageLoader = document.querySelector('#site-loader');
if (pageLoader) {
  document.body.classList.add('is-loading');
  window.setTimeout(() => {
    pageLoader.classList.add('is-hidden');
    document.body.classList.remove('is-loading');
    window.setTimeout(() => pageLoader.remove(), 500);
  }, 1600);
}

document.addEventListener('keydown', event => {
  if (event.key !== 'Escape' || !mobileNavigation?.classList.contains('open')) return;
  setMobileMenuOpen(false);
  toggle.focus();
});
