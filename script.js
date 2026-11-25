
// Keep clean roster URLs on the published site, while preserving direct file links in local previews.
if (window.location.protocol === 'file:') {
  document.querySelectorAll('a[href]').forEach(link => {
    const href = link.getAttribute('href');
    if (/^(?:roster\/)?players\/[^/]+\/$/.test(href)) {
      link.setAttribute('href', `${href}index.html`);
    } else if (/(?:^|\/)gallery\/$/.test(href)) {
      link.setAttribute('href', `${href}index.html`);
    }
  });
}
const toggle = document.querySelector('.menu-toggle');
const mobileNavigation = document.querySelector('.header-navigation');
const siteHeader = document.querySelector('.site-header');

// Keep the header available on upward scrolls while letting it get out of the way on descent.
let previousScrollY = window.scrollY;
let scrollTicking = false;
window.addEventListener('scroll', () => {
  if (scrollTicking) return;
  scrollTicking = true;
  window.requestAnimationFrame(() => {
    const currentScrollY = Math.max(0, window.scrollY);
    const delta = currentScrollY - previousScrollY;
    if (document.body.classList.contains('mobile-menu-open') || currentScrollY <= 80) {
      siteHeader?.classList.remove('is-hidden-on-scroll');
    } else if (delta > 4) {
      siteHeader?.classList.add('is-hidden-on-scroll');
    } else if (delta < -4) {
      siteHeader?.classList.remove('is-hidden-on-scroll');
    }
    previousScrollY = currentScrollY;
    scrollTicking = false;
  });
}, { passive: true });

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
  const frameCanvas = pageLoader.querySelector('#loader-frame');
  if (frameCanvas) {
    const context = frameCanvas.getContext('2d', { alpha: true });
    const framePrefix = pageLoader.dataset.framePrefix;
    const frameCount = 107;
    const frameRate = 30;
    const playbackRate = 1.16;
    const frameCache = new Map();
    const frameRequests = new Map();
    let currentFrame = 0;
    let nextFrameTime = 0;

    const hideLoader = () => {
      pageLoader.classList.add('is-hidden');
      window.setTimeout(() => {
        document.body.classList.remove('is-loading');
        pageLoader.remove();
      }, 500);
    };
    const loadFrame = index => {
      if (index < 0 || index >= frameCount) return Promise.resolve(null);
      if (frameCache.has(index)) return Promise.resolve(frameCache.get(index));
      if (frameRequests.has(index)) return frameRequests.get(index);
      const image = new Image();
      const request = new Promise(resolve => {
        image.onload = () => {
          frameCache.set(index, image);
          frameRequests.delete(index);
          resolve(image);
        };
        image.onerror = () => {
          frameRequests.delete(index);
          resolve(null);
        };
        image.src = `${framePrefix}${String(index).padStart(6, '0')}.png`;
      });
      frameRequests.set(index, request);
      return request;
    };
    const drawFrame = index => {
      const image = frameCache.get(index);
      if (!image || !context) return false;
      const width = window.innerWidth;
      const height = window.innerHeight;
      const pixelRatio = window.devicePixelRatio || 1;
      const pixelWidth = Math.round(width * pixelRatio);
      const pixelHeight = Math.round(height * pixelRatio);
      if (frameCanvas.width !== pixelWidth || frameCanvas.height !== pixelHeight) {
        frameCanvas.width = pixelWidth;
        frameCanvas.height = pixelHeight;
      }
      context.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
      context.clearRect(0, 0, width, height);
      const mobileScale = window.matchMedia('(max-width: 650px)').matches ? 1.425 : 3;
      const scale = Math.min(width / image.naturalWidth, height / image.naturalHeight) / mobileScale;
      const drawWidth = image.naturalWidth * scale;
      const drawHeight = image.naturalHeight * scale;
      context.drawImage(image, (width - drawWidth) / 2, (height - drawHeight) / 2, drawWidth, drawHeight);
      return true;
    };
    const preloadAhead = from => {
      for (let i = from; i < Math.min(frameCount, from + 12); i++) loadFrame(i);
    };

    Promise.all(Array.from({ length: 8 }, (_, i) => loadFrame(i))).then(initialFrames => {
      if (!initialFrames[0] || !drawFrame(0)) {
        hideLoader();
        return;
      }
      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        window.setTimeout(hideLoader, 350);
        return;
      }
      const playbackStartedAt = performance.now();
      const play = now => {
        const displayTick = Math.floor((now - playbackStartedAt) * frameRate / 1000);
        const targetFrame = Math.min(frameCount - 1, Math.floor(displayTick * playbackRate));
        if (targetFrame > currentFrame && frameCache.has(targetFrame)) {
          currentFrame = targetFrame;
          drawFrame(currentFrame);
          for (const index of frameCache.keys()) if (index < currentFrame - 3) frameCache.delete(index);
        }
        if (currentFrame === frameCount - 1) {
          hideLoader();
          return;
        }
        preloadAhead(currentFrame + 1);
        window.requestAnimationFrame(play);
      };
      preloadAhead(8);
      window.requestAnimationFrame(play);
    });
  } else window.setTimeout(() => {
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
