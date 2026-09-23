/*
 * Creates dist/ — the folder you deploy (Cloudflare Pages, Netlify, Vercel or any web host).
 * Runs automatically as the last step of `npm run build`.
 *
 * It copies only public files (no node_modules, src, tools, config) and, for the deploy copy only:
 *   - makes asset paths absolute (/assets/...), so the 404 page works at any URL
 *   - when CLEAN_URLS is on, rewrites internal links  about.html -> /about,  index.html -> /
 * Your source .html files are left unchanged, so they still open directly from disk.
 */
const fs = require('fs');
const path = require('path');
const { CLEAN_URLS, PAGES } = require('./build.js');

const ROOT = path.resolve(__dirname, '..');
const DIST = path.join(ROOT, 'dist');

const PUBLIC = [...Object.keys(PAGES), 'assets', 'sitemap.xml', 'robots.txt', 'site.webmanifest', '_headers', '_redirects'];
const pageNames = Object.keys(PAGES).map((p) => p.replace(/\.html$/, '')).join('|');

// href="about.html#x" -> href="/about#x",  href="index.html" -> href="/"
const linkRe = new RegExp(`(href=")(?:\\./)?(${pageNames})\\.html(?=[#?"$])`, 'g');
const cleanLinks = (s) => s.replace(linkRe, (_, attr, name) => `${attr}/${name === 'index' ? '' : name}`);
// src="assets/..." -> src="/assets/..."  (also href, data-src, and the manifest link)
const absoluteAssets = (s) => s.replace(/((?:src|href|data-src)=")(assets\/|site\.webmanifest)/g, '$1/$2');

function transform(file, text) {
  const ext = path.extname(file);
  if (ext === '.html') {
    let out = absoluteAssets(text);
    if (CLEAN_URLS) out = cleanLinks(out);
    return out;
  }
  if (ext === '.js' && CLEAN_URLS) return cleanLinks(text); // links built by api.js
  if (file.endsWith('site.webmanifest')) return text.replace('"start_url": "index.html"', '"start_url": "/"');
  return text;
}

function copy(src, dest) {
  const stat = fs.statSync(src);
  if (stat.isDirectory()) {
    fs.mkdirSync(dest, { recursive: true });
    for (const f of fs.readdirSync(src)) copy(path.join(src, f), path.join(dest, f));
    return;
  }
  if (/\.(html|js|webmanifest)$/.test(src)) fs.writeFileSync(dest, transform(src, fs.readFileSync(src, 'utf8')), 'utf8');
  else fs.copyFileSync(src, dest);
}

fs.rmSync(DIST, { recursive: true, force: true });
fs.mkdirSync(DIST);
for (const item of PUBLIC) {
  const src = path.join(ROOT, item);
  if (fs.existsSync(src)) copy(src, path.join(DIST, item));
}
console.log(`dist/ ready (${CLEAN_URLS ? 'clean URLs' : '.html URLs'}) — deploy this folder.`);
