
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
