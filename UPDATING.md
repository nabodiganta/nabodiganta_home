# Updating the Nabodiganta website

All commands run in the project folder (`E:\SR Project\NGO_Fronend`).

**First time on a new computer:** install [Node.js](https://nodejs.org), then run `npm install` once.

## What to do after each kind of change

| You changed… | Edit this | Then run |
|---|---|---|
| Menu links, footer, address, phone, email, social links | `tools/build.js` (`ORG`, `NAV`) | `npm run build` |
| A page's Google title / description / share text | `tools/build.js` (`PAGES`) | `npm run build` |
| Your domain name | `SITE_URL` in `tools/build.js` | `npm run build` |
| Text or sections inside a page (outside the `<!-- build:… -->` markers) | That `.html` file | Nothing — unless you used a **new** Tailwind class, then `npm run build` |
| Added a new Tailwind class anywhere | Any `.html` or `.js` file | `npm run build` (or keep `npm run dev` running while you edit) |
| Colours, fonts | `tailwind.config.js` | `npm run build` |
| Custom CSS | `src/styles.css` (never `assets/css/site.css`) | `npm run build` |
| Added a new page | Create `newpage.html` (copy an existing page), add it to `PAGES` in `tools/build.js` | `npm run build` |
| Photos | Put the file in `assets/img/` with the same name used in the page; update its `alt` text to describe the photo | Nothing |
| Connecting the API | `API_BASE` in `assets/js/api.js` | Nothing |

When in doubt, run `npm run build` — it is always safe to run again.

## Don't edit by hand

- Anything between `<!-- build:seo -->`, `<!-- build:header -->`, `<!-- build:footer -->` and their closing markers — it is overwritten by `npm run build`. Change it in `tools/build.js` instead.
- `assets/css/site.css`, `sitemap.xml`, `robots.txt` — generated files.

## Uploading to the server

Run `npm run build` first, then upload:

- all `.html` files
- `assets/`
- `sitemap.xml`, `robots.txt`, `site.webmanifest`

Do **not** upload `node_modules/`, `src/`, `tools/`, `package.json`, `tailwind.config.js`.

After the first upload, submit `https://your-domain/sitemap.xml` in Google Search Console.
