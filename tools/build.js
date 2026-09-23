/*
 * Nabodiganta static site builder (SEO). Needs only Node.js — no npm install.
 *
 * Run from the project root after changing the menu, footer or page SEO info:
 *
 *     node tools/build.js
 *
 * What it does (safe to run any number of times):
 *   1. Writes the shared header + footer as real HTML into every page, so search engines
 *      and visitors without JavaScript see all navigation links.
 *   2. Writes each page's SEO <head> block: title, description, canonical URL,
 *      Open Graph / Twitter tags, icons and JSON-LD structured data.
 *   3. Generates sitemap.xml and robots.txt.
 *
 * Everything it manages sits between <!-- build:xxx --> ... <!-- /build:xxx --> markers.
 * Edit the page content freely; edit the header/footer/SEO here.
 */
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');

// >>> Change this to your real domain before going live <<<
const SITE_URL = 'https://www.nabodiganta.org';

// true  = public URLs without ".html" (/about instead of /about.html).
//         Right for Cloudflare Pages, Vercel (cleanUrls) and Netlify. The deploy copy in dist/
//         also gets its internal links rewritten to match (see tools/dist.js).
// false = keep ".html" URLs (e.g. classic shared hosting / cPanel).
const CLEAN_URLS = true;

const ORG = {
  name: 'Nabodiganta',
  nameBn: 'নবদিগন্ত',
  tagline: 'People · Opportunity · Brighter Tomorrow',
  founded: '2026',
  phone: '+880 9612-000000',
  email: 'info@nabodiganta.org',
  street: 'Ramjibonpur, Sajanpur -980, Gopalpur',
  city: 'Tangail',
  postcode: '', // add the real postcode, e.g. '1990' — left empty it is simply skipped
  // Add real profile URLs here; they are used in the footer and in structured data (sameAs)
  social: {
    Facebook: '',
    YouTube: '',
    LinkedIn: '',
    X: '',
  },
};

const NAV = [
  {
    id: 'about', label: 'Who We Are', href: 'about.html',
    intro: 'A Bangladeshi development organisation founded in 2026 to create opportunity for people living in poverty.',
    links: [['Our Story', 'about.html#story'], ['Mission & Values', 'about.html#mission'],
      ['Our Journey', 'about.html#journey'], ['Where We Work', 'about.html#where'],
      ['Leadership', 'about.html#leadership'], ['Accountability', 'about.html#accountability']],
  },
  {
    id: 'programs', label: 'What We Do', href: 'programs.html',
    intro: 'Holistic programmes that tackle poverty from every side — from a child’s first classroom to a family’s first loan.',
    links: [['Education', 'programs.html#education'], ['Health & Nutrition', 'programs.html#health'],
      ['Microfinance', 'programs.html#microfinance'], ['Women Empowerment', 'programs.html#women'],
      ['Climate & Disaster', 'programs.html#climate'], ['Ultra-Poor Graduation', 'programs.html#ultra-poor'],
      ['Water & Sanitation', 'programs.html#wash'], ['Skills & Migration', 'programs.html#skills'],
      ['Agriculture', 'programs.html#agriculture']],
  },
  {
    id: 'media', label: 'Media', href: 'notices.html',
    intro: 'Official notices, stories from the field, photos and videos of our work across Bangladesh.',
    links: [['Notice Board', 'notices.html'], ['Blog & Stories', 'blog.html'],
      ['Photo Gallery', 'gallery.html#photos'], ['Video Gallery', 'gallery.html#videos']],
  },
  {
    id: 'contact', label: 'Get Involved', href: 'contact.html',
    intro: 'Donate, volunteer, partner with us or build your career in development.',
    links: [['Donate', 'contact.html#donate'], ['Volunteer', 'contact.html#volunteer'],
      ['Careers', 'contact.html#volunteer'], ['Contact Us', 'contact.html#contact']],
  },
];

// Per-page SEO. Titles ~50–60 chars, descriptions ~140–160 chars.
const PAGES = {
  'index.html': {
    nav: 'home', priority: '1.0', changefreq: 'weekly',
    title: 'Nabodiganta | Development NGO in Bangladesh',
    description: 'Nabodiganta is a Bangladeshi NGO creating opportunity for people living in poverty through education, health, microfinance, women empowerment and climate resilience.',
    crumbs: [],
  },
  'about.html': {
    nav: 'about', priority: '0.8', changefreq: 'monthly',
    title: 'About Us: Our Story, Mission & Roadmap | Nabodiganta',
    description: 'Nabodiganta is a new Bangladeshi NGO founded in 2026. Learn our story, mission and values, our roadmap to 2030 and the districts where we are starting.',
    crumbs: [['Who We Are', 'about.html']],
  },
  'programs.html': {
    nav: 'programs', priority: '0.9', changefreq: 'monthly',
    title: 'What We Do: Education, Health & Microfinance | Nabodiganta',
    description: "Explore Nabodiganta's programmes in Bangladesh: education, health and nutrition, microfinance, women empowerment, climate resilience, WASH, skills and agriculture.",
    crumbs: [['What We Do', 'programs.html']],
  },
  'notices.html': {
    nav: 'media', priority: '0.7', changefreq: 'daily',
    title: 'Notice Board: Jobs, Tenders & Announcements | Nabodiganta',
    description: 'Official Nabodiganta notices: job circulars, tender notices, scholarship results, publications and general announcements.',
    crumbs: [['Media', 'notices.html'], ['Notice Board', 'notices.html']],
  },
  'blog.html': {
    nav: 'media', priority: '0.8', changefreq: 'weekly',
    title: 'Blog & Stories from the Field | Nabodiganta',
    description: 'Stories of change from communities across Bangladesh and reflections from Nabodiganta staff on education, health, microfinance and climate.',
    crumbs: [['Media', 'notices.html'], ['Blog', 'blog.html']],
  },
  'blog-post.html': {
    nav: 'media', priority: null, changefreq: null, // dynamic posts: list them in the sitemap from your backend
    canonical: 'blog-post.html?slug=flood-response-kurigram',
    ogType: 'article',
    image: 'assets/img/blog-1.jpg',
    title: '72 Hours in Kurigram: Our First Flood Response | Nabodiganta Blog',
    description: "Boats, dry food and clean water: how Nabodiganta's flood response reached 2,500 families in Kurigram within the first three days.",
    crumbs: [['Blog', 'blog.html'], ['72 Hours in Kurigram', 'blog-post.html?slug=flood-response-kurigram']],
    article: { date: '2026-08-28', author: 'Farzana Rahman' },
  },
  'gallery.html': {
    nav: 'media', priority: '0.6', changefreq: 'weekly',
    title: 'Photo & Video Gallery | Nabodiganta',
    description: "Photos and videos of Nabodiganta's work in classrooms, clinics, farms and relief points across Bangladesh.",
    crumbs: [['Media', 'notices.html'], ['Gallery', 'gallery.html']],
  },
  '404.html': {
    nav: '', priority: null, changefreq: null, noindex: true,
    title: 'Page Not Found | Nabodiganta',
    description: 'Sorry, we could not find that page. Explore our programmes, stories and ways to get involved.',
    crumbs: [],
  },
  'contact.html': {
    nav: 'contact', priority: '0.8', changefreq: 'monthly',
    title: 'Donate, Volunteer & Contact Us | Nabodiganta',
    description: 'Support Nabodiganta: donate via bKash, Nagad or bank transfer, volunteer your time and skills, or contact our head office in Tangail.',
    crumbs: [['Get Involved', 'contact.html']],
  },
};

const DEFAULT_IMAGE = 'assets/img/og-image.png';

const e = (s = '') => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#x27;' })[c]);
const url = (p = '') => {
  let page = p.replace(/^index\.html/, '');
  if (CLEAN_URLS) page = page.replace(/\.html(?=$|[?#])/, '');
  return `${SITE_URL.replace(/\/+$/, '')}/${page}`;
};
const today = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};

const CHEVRON = '<svg class="w-3 h-3" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="3" viewBox="0 0 24 24"><path d="m6 9 6 6 6-6"/></svg>';

// ---------------------------------------------------------------- header / footer
function headerHtml(active) {
  const desktop = NAV.map((n) => {
    const on = n.id === active;
    const cls = on ? 'border-sun-400 text-forest-700' : 'border-transparent hover:border-leaf-400 hover:text-forest-700';
    const links = n.links.map(([t, h]) => `<li><a href="${h}" class="block bg-white px-5 py-4 font-medium hover:bg-forest-700 hover:text-white">${e(t)}</a></li>`).join('');
    return `
        <li class="has-mega h-full flex items-center">
          <a href="${n.href}" class="h-full flex items-center gap-1.5 px-4 text-[15px] font-semibold border-b-4 ${cls}"${on ? ' aria-current="page"' : ''}>${e(n.label)} ${CHEVRON}</a>
          <div class="mega hidden absolute left-0 right-0 top-full bg-white border-t border-forest-100 shadow-xl">
            <div class="max-w-7xl mx-auto px-4 py-10 grid grid-cols-12 gap-10">
              <div class="col-span-4 border-l-4 border-sun-400 pl-6">
                <p class="font-serif text-3xl text-forest-700">${e(n.label)}</p>
                <p class="mt-3 text-gray-600">${e(n.intro)}</p>
                <a href="${n.href}" class="inline-block mt-5 text-sm font-bold uppercase tracking-wide text-forest-700 link-line">Explore ${e(n.label)} →</a>
              </div>
              <ul class="col-span-8 grid grid-cols-3 gap-px bg-forest-100 border border-forest-100 self-start">${links}</ul>
            </div>
          </div>
        </li>`;
  }).join('');

  const mobile = NAV.map((n) => {
    const links = n.links.map(([t, h]) => `<a href="${h}" class="block px-8 py-2.5 text-sm hover:text-forest-700">${e(t)}</a>`).join('');
    return `
      <details class="border-b border-forest-100"${n.id === active ? ' open' : ''}>
        <summary class="list-none flex justify-between items-center px-4 py-4 font-semibold cursor-pointer">${e(n.label)} ${CHEVRON}</summary>
        <div class="bg-cream pb-2">${links}</div>
      </details>`;
  }).join('');

  return `<a href="#main" class="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-[200] bg-sun-400 text-forest-900 px-4 py-2 font-bold">Skip to content</a>
  <div class="bg-forest-900 text-forest-100 text-xs">
    <div class="max-w-7xl mx-auto px-4 h-10 flex items-center justify-between gap-4">
      <span class="hidden sm:block font-bangla" lang="bn">নবদিগন্ত — মানুষ, সম্ভাবনা, আলোকিত আগামী</span>
      <nav class="flex items-center gap-5 ml-auto" aria-label="Quick links">
        <a href="notices.html" class="hover:text-white">Notices</a>
        <a href="blog.html" class="hover:text-white">Blog</a>
        <a href="contact.html#volunteer" class="hover:text-white">Careers</a>
        <a href="contact.html#contact" class="hover:text-white">Contact</a>
      </nav>
    </div>
  </div>
  <header class="sticky top-0 z-50 bg-white border-b border-forest-100 shadow-sm">
    <div class="max-w-7xl mx-auto px-4 h-20 lg:h-24 flex items-center justify-between gap-6">
      <a href="index.html" class="flex items-center gap-3 min-w-0" aria-label="Nabodiganta home">
        <img src="assets/img/logo-mark.png" alt="Nabodiganta logo" width="56" height="56" class="h-12 sm:h-14 w-auto shrink-0">
        <span class="leading-none min-w-0">
          <span class="block font-serif text-2xl sm:text-[28px] text-forest-700">Nabodiganta</span>
          <span class="hidden sm:block mt-1 text-[10px] font-semibold uppercase tracking-[0.22em] text-leaf-600">${e(ORG.tagline)}</span>
        </span>
      </a>
      <nav class="hidden lg:block h-full" aria-label="Main">
        <ul class="flex h-full items-stretch">${desktop}
        </ul>
      </nav>
      <div class="flex items-center gap-2">
        <a href="contact.html#donate" class="hidden sm:inline-flex items-center bg-sun-400 hover:bg-sun-500 text-forest-900 px-6 py-3 text-sm font-bold uppercase tracking-wide">Donate</a>
        <button id="menuBtn" type="button" class="lg:hidden w-12 h-12 bg-forest-700 text-white flex items-center justify-center" aria-label="Open menu" aria-controls="mobileMenu" aria-expanded="false">
          <svg class="w-6 h-6" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24"><path d="M4 6h16M4 12h16M4 18h16"/></svg>
        </button>
      </div>
    </div>
    <nav id="mobileMenu" class="hidden lg:hidden border-t border-forest-100 bg-white max-h-[75vh] overflow-y-auto" aria-label="Mobile">${mobile}
      <a href="contact.html#donate" class="block px-4 py-4 font-bold uppercase bg-sun-400 text-forest-900 text-center">Donate Now</a>
    </nav>
  </header>`;
}

function footerHtml() {
  const year = new Date().getFullYear();
  const cols = NAV.map((n) => `
      <nav aria-label="${e(n.label)}">
        <h2 class="font-serif text-xl text-white mb-4">${e(n.label)}</h2>
        <ul class="space-y-2 text-sm">${n.links.map(([t, h]) => `<li><a href="${h}" class="hover:text-sun-400">${e(t)}</a></li>`).join('')}</ul>
      </nav>`).join('');
  const icons = { Facebook: 'f', YouTube: '▶', LinkedIn: 'in', X: 'X' };
  const social = Object.entries(ORG.social).map(([s, link]) =>
    `<a href="${e(link) || '#'}" class="w-10 h-10 bg-forest-800 hover:bg-sun-400 hover:text-forest-900 flex items-center justify-center text-sm font-bold" aria-label="Nabodiganta on ${s}"` +
    `${link ? ' rel="noopener" target="_blank"' : ''}>${icons[s]}</a>`).join('');
  const tel = ORG.phone.replace(/[ -]/g, '');

  return `<section class="bg-sun-400" aria-label="Newsletter">
    <div class="max-w-7xl mx-auto px-4 py-10 grid lg:grid-cols-2 gap-6 items-center">
      <div>
        <p class="font-serif text-3xl text-forest-900">Stay connected with Nabodiganta</p>
        <p class="text-forest-800 mt-1">Get stories, notices and updates from the field in your inbox.</p>
      </div>
      <form class="flex" data-newsletter>
        <label for="newsletterEmail" class="sr-only">Email address</label>
        <input id="newsletterEmail" type="email" required placeholder="Your email address" class="flex-1 min-w-0 px-5 py-4 bg-white focus:outline-none">
        <button class="bg-forest-700 hover:bg-forest-800 text-white px-6 font-bold uppercase text-sm">Subscribe</button>
      </form>
    </div>
  </section>
  <footer class="bg-forest-900 text-forest-100">
    <div class="max-w-7xl mx-auto px-4 py-16 grid gap-10 md:grid-cols-2 lg:grid-cols-6">
      <div class="lg:col-span-2">
        <a href="index.html" class="inline-block bg-white p-4"><img src="assets/img/logo.png" alt="Nabodiganta — ${e(ORG.tagline)}" width="117" height="96" loading="lazy" class="h-24 w-auto"></a>
        <p class="mt-5 text-sm leading-relaxed">A non-profit development organisation working across Bangladesh to create opportunity for people living in poverty — through education, health, microfinance and climate resilience.</p>
        <address class="not-italic text-sm mt-5 space-y-1">
          <p>${e(ORG.street)}, ${e(ORG.city)}${ORG.postcode ? ' ' + e(ORG.postcode) : ''}, Bangladesh</p>
          <p><a href="tel:${tel}" class="hover:text-sun-400">${e(ORG.phone)}</a> · <a href="mailto:${ORG.email}" class="hover:text-sun-400">${e(ORG.email)}</a></p>
        </address>
        <div class="flex gap-2 mt-5">${social}</div>
      </div>${cols}
    </div>
    <div class="border-t border-forest-800">
      <div class="max-w-7xl mx-auto px-4 py-5 flex flex-col sm:flex-row justify-between gap-2 text-xs text-forest-200">
        <p>&copy; ${year} Nabodiganta. Registered with the NGO Affairs Bureau, Government of Bangladesh.</p>
        <p>Privacy Policy · Safeguarding · Complaints</p>
      </div>
    </div>
  </footer>`;
}

// ---------------------------------------------------------------- <head> SEO block
function orgSchema() {
  const sameAs = Object.values(ORG.social).filter(Boolean);
  const data = {
    '@type': 'NGO',
    '@id': url() + '#organization',
    name: ORG.name,
    alternateName: ORG.nameBn,
    slogan: ORG.tagline,
    url: url(),
    logo: url('assets/img/logo.png'),
    image: url(DEFAULT_IMAGE),
    description: PAGES['index.html'].description,
    foundingDate: ORG.founded,
    areaServed: { '@type': 'Country', name: 'Bangladesh' },
    email: ORG.email,
    telephone: ORG.phone,
    address: {
      '@type': 'PostalAddress',
      streetAddress: ORG.street,
      addressLocality: ORG.city,
      ...(ORG.postcode && { postalCode: ORG.postcode }),
      addressCountry: 'BD',
    },
  };
  if (sameAs.length) data.sameAs = sameAs;
  return data;
}

function schemaFor(name, p) {
  const graph = [];
  if (name === 'index.html') {
    graph.push(orgSchema());
    graph.push({ '@type': 'WebSite', '@id': url() + '#website', url: url(), name: ORG.name, inLanguage: 'en', publisher: { '@id': url() + '#organization' } });
  }
  if (p.crumbs.length) {
    const items = [['Home', 'index.html'], ...p.crumbs];
    // drop consecutive duplicate URLs (e.g. Media -> Notice Board share a page)
    const dedup = items.filter((c, i) => i === 0 || c[1] !== items[i - 1][1]);
    graph.push({ '@type': 'BreadcrumbList', itemListElement: dedup.map(([t, h], i) => ({ '@type': 'ListItem', position: i + 1, name: t, item: url(h) })) });
  }
  if (name === 'contact.html') {
    graph.push({ '@type': 'ContactPage', url: url(name), name: p.title, about: { '@id': url() + '#organization' } });
  }
  const out = [];
  if (graph.length) out.push(`<script type="application/ld+json">${JSON.stringify({ '@context': 'https://schema.org', '@graph': graph })}</script>`);
  if (p.article) {
    const article = {
      '@context': 'https://schema.org', '@type': 'BlogPosting',
      headline: p.title.split(' | ')[0], description: p.description,
      image: [url(p.image || DEFAULT_IMAGE)], datePublished: p.article.date,
      author: { '@type': 'Person', name: p.article.author },
      publisher: { '@type': 'Organization', name: ORG.name, logo: { '@type': 'ImageObject', url: url('assets/img/logo.png') } },
      url: url(p.canonical), mainEntityOfPage: url(p.canonical),
    };
    // id lets api.js update this block when a post is loaded from the API
    out.push(`<script type="application/ld+json" id="ld-article">${JSON.stringify(article)}</script>`);
  }
  return out.join('\n  ');
}

function headHtml(name, p) {
  const canonical = url(p.canonical || name);
  const image = url(p.image || DEFAULT_IMAGE);
  const t = e(p.title);
  const d = e(p.description);
  return `<title>${t}</title>
  <meta name="description" content="${d}">
  <meta name="robots" content="${p.noindex ? 'noindex, follow' : 'index, follow, max-image-preview:large'}">
  ${p.noindex ? '' : `<link rel="canonical" href="${canonical}">`}
  <meta name="theme-color" content="#084a27">
  <link rel="icon" type="image/png" sizes="32x32" href="assets/img/favicon-32.png">
  <link rel="apple-touch-icon" sizes="180x180" href="assets/img/apple-touch-icon.png">
  <link rel="manifest" href="site.webmanifest">
  <meta property="og:site_name" content="Nabodiganta">
  <meta property="og:type" content="${p.ogType || 'website'}">
  <meta property="og:title" content="${t}">
  <meta property="og:description" content="${d}">
  <meta property="og:url" content="${canonical}">
  <meta property="og:image" content="${image}">
  <meta property="og:image:alt" content="Nabodiganta — ${e(ORG.tagline)}">
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="${t}">
  <meta name="twitter:description" content="${d}">
  <meta name="twitter:image" content="${image}">
  ${schemaFor(name, p)}`;
}

// ---------------------------------------------------------------- injection helpers
// Replace <!-- build:key -->...<!-- /build:key --> or, on first run, the matched placeholder.
function putBlock(doc, key, content, firstTimePattern) {
  const block = `<!-- build:${key} -->\n  ${content}\n  <!-- /build:${key} -->`;
  const marked = new RegExp(`<!-- build:${key} -->[\\s\\S]*?<!-- /build:${key} -->`);
  if (marked.test(doc)) return doc.replace(marked, () => block);
  if (!firstTimePattern.test(doc)) throw new Error(`Could not place '${key}' block — markers/placeholder missing`);
  return doc.replace(firstTimePattern, () => block);
}

function buildPage(name, p) {
  const file = path.join(ROOT, name);
  let doc = fs.readFileSync(file, 'utf8');

  // SEO head: first run replaces everything from <title> up to (not incl.) the fonts preconnect
  doc = putBlock(doc, 'seo', headHtml(name, p), /<title>[\s\S]*?(?=\s*<link rel="preconnect")/);
  doc = putBlock(doc, 'header', headerHtml(p.nav), /<div id="site-header"><\/div>/);
  doc = putBlock(doc, 'footer', footerHtml(), /<div id="site-footer"><\/div>/);

  // Small, idempotent hygiene fixes
  doc = doc.replace(/(<link rel="preconnect" href="https:\/\/fonts.googleapis.com">)(?!\s*<link rel="preconnect" href="https:\/\/fonts.gstatic.com")/,
    '$1\n  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>');
  doc = doc.replace(/<main(?![^>]*\bid=)/, '<main id="main"');
  doc = doc.replace(/class="([^"]*\bfont-bangla\b[^"]*)"(?![^>]*\blang=)/g, 'class="$1" lang="bn"');
  doc = doc.replace(/<nav class="text-sm text-forest-100">/g, '<nav class="text-sm text-forest-100" aria-label="Breadcrumb">');

  fs.writeFileSync(file, doc, 'utf8');
  console.log(`  built ${name}`);
}

function buildSitemap() {
  const date = today();
  const rows = Object.entries(PAGES).filter(([, p]) => p.priority).map(([name, p]) => `
  <url>
    <loc>${url(name)}</loc>
    <lastmod>${date}</lastmod>
    <changefreq>${p.changefreq}</changefreq>
    <priority>${p.priority}</priority>
  </url>`).join('');
  fs.writeFileSync(path.join(ROOT, 'sitemap.xml'),
    `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${rows}\n</urlset>\n`, 'utf8');
  fs.writeFileSync(path.join(ROOT, 'robots.txt'),
    `User-agent: *\nAllow: /\n\nSitemap: ${url('sitemap.xml')}\n`, 'utf8');
  console.log('  wrote sitemap.xml, robots.txt');
}

module.exports = { CLEAN_URLS, PAGES };

if (require.main === module) {
  console.log(`Building for ${SITE_URL}`);
  for (const [name, p] of Object.entries(PAGES)) buildPage(name, p);
  buildSitemap();
  console.log('Done.');
}
