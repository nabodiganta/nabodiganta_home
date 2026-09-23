// API layer — ready for dynamic content later.
//
// Right now API_BASE is empty, so nothing is fetched and the static HTML stays as-is.
// When your backend is ready:
//   1. Set API_BASE, e.g. 'https://api.nabodiganta.org/v1'
//   2. Make the endpoints below return the JSON shapes shown next to them.
// Any element with data-api="<key>" is filled by the matching renderer.
// Add data-limit="3" to an element to show only the first N items (e.g. home page previews).

const API_BASE = '';

const ENDPOINTS = {
  stats: '/stats',       // [{ value: "12M+", label: "People reached" }]
  programs: '/programs', // [{ title, summary, slug, image? }]
  notices: '/notices',   // [{ title, date: "2026-09-20", category, url?, file? (PDF), isNew? }]
  blog: '/blog',         // [{ title, slug, date, category, excerpt, author, image? }]
  photos: '/photos',     // [{ src, caption, album? }]
  videos: '/videos',     // [{ youtubeId, title, date?, thumb? }]
  post: '/blog/:slug',   // { title, date, category, author, image?, html }  (used by blog-post.html?slug=...)
};

const esc = (s = '') => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);
const fmtDate = (d) => {
  const t = new Date(d);
  return isNaN(t) ? esc(d) : t.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
};
// Real <img> inside a gradient slot: indexable, has alt text, lazy-loaded, removes itself if broken
const pic = (src, alt = '') => (src ? `<img src="${esc(src)}" alt="${esc(alt)}" loading="lazy" decoding="async" onerror="this.remove()">` : '');
const isoDate = (d) => { const t = new Date(d); return isNaN(t) ? '' : t.toISOString().slice(0, 10); };
const time = (d) => `<time datetime="${isoDate(d)}">${fmtDate(d)}</time>`;

const RENDERERS = {
  stats: (items) =>
    items.map((s) => `<div class="p-8 bg-forest-700">
        <p class="font-serif text-5xl text-sun-400">${esc(s.value)}</p>
        <p class="mt-2 text-sm uppercase tracking-wider text-forest-100">${esc(s.label)}</p>
      </div>`).join(''),

  programs: (items) =>
    items.map((p) => `<a href="programs.html#${esc(p.slug)}" class="tile group relative block aspect-square overflow-hidden">
        <div class="photo absolute inset-0">${pic(p.image, p.title)}</div>
        <div class="absolute inset-0 bg-gradient-to-t from-forest-900/90 via-forest-900/30 to-transparent"></div>
        <div class="absolute inset-x-0 bottom-0 p-6 text-white">
          <h3 class="font-serif text-2xl">${esc(p.title)}</h3>
          <p class="mt-2 text-sm text-forest-100 line-clamp-2">${esc(p.summary)}</p>
          <span class="mt-3 inline-block w-10 h-1 bg-sun-400 group-hover:w-20 transition-all"></span>
        </div>
      </a>`).join(''),

  notices: (items) =>
    items.map((n) => {
      const d = new Date(n.date);
      return `<li><a href="${esc(n.url || '#')}" class="flex gap-4 items-start p-4 bg-white hover:bg-forest-50">
        <span class="w-16 shrink-0 text-center border-2 border-forest-700">
          <span class="block bg-forest-700 text-white text-[10px] font-bold uppercase py-0.5">${isNaN(d) ? '' : d.toLocaleString('en', { month: 'short' })}</span>
          <span class="block font-serif text-2xl text-forest-700 py-1">${isNaN(d) ? '' : d.getDate()}</span>
        </span>
        <span class="flex-1">
          <span class="text-[11px] font-bold uppercase tracking-wider text-leaf-600">${esc(n.category)}</span>
          ${n.isNew ? '<span class="ml-2 bg-sun-400 text-forest-900 text-[10px] font-bold px-1.5 py-0.5 uppercase">New</span>' : ''}
          <span class="block mt-1 font-semibold leading-snug">${esc(n.title)}</span>
        </span>
      </a></li>`;
    }).join(''),

  // Full notice board table (notices.html) — same /notices endpoint, add `file` for a PDF link
  noticeRows: (items) =>
    items.map((n, i) => `<tr data-category="${esc(n.category)}" class="hover:bg-forest-50">
        <td class="px-4 py-4 text-gray-500">${i + 1}</td>
        <td class="px-4 py-4 whitespace-nowrap">${time(n.date)}</td>
        <td class="px-4 py-4 font-semibold">${esc(n.title)} ${n.isNew ? '<span class="ml-1 bg-sun-400 text-forest-900 text-[10px] font-bold px-1.5 py-0.5 uppercase">New</span>' : ''}</td>
        <td class="px-4 py-4"><span class="text-xs font-bold uppercase tracking-wider text-leaf-600">${esc(n.category)}</span></td>
        <td class="px-4 py-4 text-right"><a href="${esc(n.file || n.url || '#')}" class="inline-block bg-forest-700 hover:bg-forest-800 text-white text-xs font-bold uppercase px-3 py-2">View</a></td>
      </tr>`).join(''),

  blog: (items) =>
    items.map((b) => `<article class="group bg-white flex flex-col border border-forest-100 hover:shadow-xl transition-shadow">
        <a href="blog-post.html?slug=${esc(b.slug)}" class="block aspect-[16/10] overflow-hidden tile"><div class="photo w-full h-full">${pic(b.image, b.title)}</div></a>
        <div class="p-6 flex-1 flex flex-col">
          <p class="text-xs font-bold uppercase tracking-wider text-leaf-600">${esc(b.category)} · ${time(b.date)}</p>
          <h3 class="mt-3 font-serif text-2xl leading-snug"><a href="blog-post.html?slug=${esc(b.slug)}" class="group-hover:text-forest-600">${esc(b.title)}</a></h3>
          <p class="mt-3 text-gray-600 text-sm flex-1">${esc(b.excerpt)}</p>
          <p class="mt-5 pt-4 border-t border-forest-100 text-xs text-gray-500">By ${esc(b.author)}</p>
        </div>
      </article>`).join(''),

  photos: (items) =>
    items.map((p) => `<button type="button" data-lightbox data-src="${esc(p.src)}" data-caption="${esc(p.caption)}" class="tile group relative block aspect-square overflow-hidden text-left">
        <div class="photo absolute inset-0">${pic(p.src, p.caption)}</div>
        <span class="absolute inset-0 bg-forest-900/0 group-hover:bg-forest-900/60 transition-colors"></span>
        <span class="absolute inset-x-0 bottom-0 p-4 text-white text-sm font-semibold opacity-0 group-hover:opacity-100 transition-opacity">${esc(p.caption)}</span>
      </button>`).join(''),

  videos: (items) =>
    items.map((v) => `<button type="button" data-video="${esc(v.youtubeId)}" data-caption="${esc(v.title)}" class="group text-left bg-white border border-forest-100">
        <span class="relative block aspect-video overflow-hidden">
          <span class="photo photo-dark absolute inset-0">${pic(v.thumb || `https://img.youtube.com/vi/${v.youtubeId}/hqdefault.jpg`, `Video: ${v.title}`)}</span>
          <span class="absolute inset-0 flex items-center justify-center">
            <span class="w-16 h-16 bg-sun-400 group-hover:scale-110 transition-transform flex items-center justify-center">
              <svg class="w-7 h-7 text-forest-900 ml-1" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
            </span>
          </span>
        </span>
        <span class="block p-5">
          <span class="block font-serif text-xl leading-snug">${esc(v.title)}</span>
          ${v.date ? `<span class="block mt-2 text-xs text-gray-500">${time(v.date)}</span>` : ''}
        </span>
      </button>`).join(''),
};

async function getJSON(path) {
  const res = await fetch(API_BASE + path);
  if (!res.ok) throw new Error(res.status);
  return res.json();
}

async function loadSection(el) {
  const key = el.dataset.api;
  const render = RENDERERS[el.dataset.render || key]; // data-render lets one endpoint use a different layout
  if (!ENDPOINTS[key] || !render) return;
  try {
    let data = await getJSON(ENDPOINTS[key]);
    if (!Array.isArray(data) || !data.length) return;
    if (el.dataset.limit) data = data.slice(0, Number(el.dataset.limit));
    el.innerHTML = render(data);
    el.dispatchEvent(new CustomEvent('api:loaded', { bubbles: true }));
  } catch (err) {
    // Keep the static fallback content if the API fails.
    console.warn(`[api] ${key} failed, using static content`, err);
  }
}

// Keep <title>, description, canonical, Open Graph and Article schema in sync with the loaded post
function updateSeo(p, slug) {
  const url = new URL(`blog-post.html?slug=${encodeURIComponent(slug)}`, document.baseURI).href;
  const image = p.image ? new URL(p.image, document.baseURI).href : null;
  const desc = p.excerpt || p.title;
  const set = (sel, val) => { const el = document.head.querySelector(sel); if (el && val) el.setAttribute(el.tagName === 'LINK' ? 'href' : 'content', val); };

  document.title = `${p.title} | Nabodiganta Blog`;
  set('meta[name="description"]', desc);
  set('link[rel="canonical"]', url);
  set('meta[property="og:title"]', p.title);
  set('meta[property="og:description"]', desc);
  set('meta[property="og:url"]', url);
  set('meta[property="og:image"]', image);
  set('meta[name="twitter:title"]', p.title);
  set('meta[name="twitter:description"]', desc);
  set('meta[name="twitter:image"]', image);

  const ld = document.getElementById('ld-article');
  if (ld) {
    const data = JSON.parse(ld.textContent);
    Object.assign(data, { headline: p.title, description: desc, datePublished: isoDate(p.date), url, mainEntityOfPage: url });
    data.author = { '@type': 'Person', name: p.author };
    if (image) data.image = [image];
    ld.textContent = JSON.stringify(data);
  }
}

// Single blog post page: blog-post.html?slug=my-post
async function loadPost() {
  const root = document.querySelector('[data-api-post]');
  const slug = new URLSearchParams(location.search).get('slug');
  if (!root || !slug) return;
  try {
    const p = await getJSON(ENDPOINTS.post.replace(':slug', encodeURIComponent(slug)));
    root.querySelector('[data-post="title"]').textContent = p.title;
    root.querySelector('[data-post="meta"]').innerHTML = `${esc(p.category)} · ${time(p.date)} · By ${esc(p.author)}`;
    if (p.image) root.querySelector('[data-post="image"]').innerHTML = pic(p.image, p.title);
    root.querySelector('[data-post="body"]').innerHTML = p.html; // trusted HTML from your own CMS
    updateSeo(p, slug);
  } catch (err) {
    console.warn('[api] post failed, using static content', err);
  }
}

document.addEventListener('DOMContentLoaded', () => {
  if (!API_BASE) return;
  document.querySelectorAll('[data-api]').forEach(loadSection);
  loadPost();
});
