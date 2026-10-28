const toggle = document.querySelector('.menu-toggle');
const nav = document.querySelectorAll('.nav-left, .nav-right');

toggle.addEventListener('click', () => {
  const open = !document.querySelector('.nav-right').classList.contains('open');
  nav.forEach(group => group.classList.toggle('open', open));
  toggle.setAttribute('aria-expanded', String(open));
  toggle.setAttribute('aria-label', open ? 'Close navigation' : 'Open navigation');
});

document.querySelectorAll('.nav-left a, .nav-right a').forEach(link => {
  link.addEventListener('click', () => {
    nav.forEach(group => group.classList.remove('open'));
    toggle.setAttribute('aria-expanded', 'false');
  });
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
