// Site behaviour: mobile menu, hero slider, tabs, lightbox, newsletter.
// The header/footer HTML itself is written into each page by tools/build.py (better for SEO),
// so edit the menu there and run:  python tools/build.py

// Hero slider (only runs on pages that have [data-slider])
function initSlider(root) {
  const slides = [...root.querySelectorAll('.slide')];
  const dots = [...root.querySelectorAll('[data-dot]')];
  if (slides.length < 2) return;
  let i = 0;
  let timer;
  const setDot = (d, on) => {
    d?.classList.toggle('bg-sun-400', on);
    d?.classList.toggle('w-12', on);
    d?.classList.toggle('bg-white/60', !on);
    d?.classList.toggle('w-6', !on);
  };
  const go = (n) => {
    slides[i].classList.remove('is-active');
    setDot(dots[i], false);
    i = (n + slides.length) % slides.length;
    slides[i].classList.add('is-active');
    setDot(dots[i], true);
  };
  const start = () => { clearInterval(timer); timer = setInterval(() => go(i + 1), 6000); };
  dots.forEach((d, n) => d.addEventListener('click', () => { go(n); start(); }));
  root.querySelector('[data-prev]')?.addEventListener('click', () => { go(i - 1); start(); });
  root.querySelector('[data-next]')?.addEventListener('click', () => { go(i + 1); start(); });
  start();
}

// Simple tabs: buttons with [data-tab="x"], panels with [data-panel="x"]
function initTabs(root) {
  const btns = root.querySelectorAll('[data-tab]');
  const panels = root.querySelectorAll('[data-panel]');
  const show = (key) => {
    btns.forEach((b) => {
      const on = b.dataset.tab === key;
      b.classList.toggle('bg-sun-400', on);
      b.classList.toggle('text-forest-900', on);
    });
    panels.forEach((p) => p.classList.toggle('hidden', p.dataset.panel !== key));
  };
  const fromHash = () => [...btns].find((b) => '#' + b.dataset.tab === location.hash)?.dataset.tab;
  btns.forEach((b) => b.addEventListener('click', () => show(b.dataset.tab)));
  window.addEventListener('hashchange', () => { const k = fromHash(); if (k) show(k); });
  show(fromHash() || btns[0]?.dataset.tab);
}

// Lightbox for photos ([data-lightbox]) and YouTube videos ([data-video]).
// Uses event delegation, so items rendered later by api.js work too.
function openModal(inner, caption) {
  const m = document.createElement('div');
  m.className = 'fixed inset-0 z-[100] bg-forest-900/95 flex flex-col items-center justify-center p-4';
  m.innerHTML = `
    <button class="absolute top-4 right-4 w-12 h-12 bg-sun-400 text-forest-900 text-2xl font-bold" aria-label="Close">×</button>
    <div class="w-full max-w-5xl">${inner}</div>
    ${caption ? `<p class="mt-4 text-white text-center max-w-3xl">${caption}</p>` : ''}`;
  const close = () => { m.remove(); document.removeEventListener('keydown', onKey); };
  const onKey = (e) => e.key === 'Escape' && close();
  m.addEventListener('click', (e) => { if (e.target === m || e.target.closest('button')) close(); });
  document.addEventListener('keydown', onKey);
  document.body.appendChild(m);
}

document.addEventListener('click', (e) => {
  const photo = e.target.closest('[data-lightbox]');
  const video = e.target.closest('[data-video]');
  if (photo) {
    const src = photo.dataset.src;
    openModal(`<div class="photo w-full aspect-[3/2] bg-contain bg-no-repeat" style="--img:url('${src}')"></div>`, photo.dataset.caption);
  } else if (video) {
    const id = video.dataset.video;
    openModal(
      id
        ? `<div class="aspect-video"><iframe class="w-full h-full" src="https://www.youtube-nocookie.com/embed/${encodeURIComponent(id)}?autoplay=1" allow="autoplay; encrypted-media; picture-in-picture" allowfullscreen></iframe></div>`
        : `<div class="photo photo-dark aspect-video flex items-center justify-center text-white font-serif text-3xl">Video coming soon</div>`,
      video.dataset.caption
    );
  }
});

document.addEventListener('DOMContentLoaded', () => {
  const btn = document.getElementById('menuBtn');
  const menu = document.getElementById('mobileMenu');
  btn?.addEventListener('click', () => {
    const open = menu.classList.toggle('hidden') === false;
    btn.setAttribute('aria-expanded', String(open));
  });

  document.querySelectorAll('[data-slider]').forEach(initSlider);
  document.querySelectorAll('[data-tabs]').forEach(initTabs);

  // Newsletter (static placeholder — POST to your API later)
  document.querySelectorAll('[data-newsletter]').forEach((form) => form.addEventListener('submit', (e) => {
    e.preventDefault();
    form.reset();
    alert('Thank you for subscribing!');
  }));
});
