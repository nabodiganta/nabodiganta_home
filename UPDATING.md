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

## Deploying

`npm run build` creates a **`dist/`** folder — that folder *is* the website. It contains only public files, with clean links (`/about` instead of `about.html`). Every host uses the same two settings:

| Setting | Value |
|---|---|
| Build command | `npm run build` |
| Output / publish directory | `dist` |

**With Git (recommended — every push redeploys automatically).** Push this project to GitHub, then:

- **Cloudflare Pages:** dashboard → Workers & Pages → Create → Pages → Connect to Git → pick the repo → framework preset *None*, build command `npm run build`, output directory `dist` → Save and Deploy. (Node version comes from `.node-version`.)
- **Netlify:** Add new site → Import an existing project → pick the repo. Settings are read from `netlify.toml` automatically → Deploy.
- **Vercel:** Add New → Project → import the repo. Settings are read from `vercel.json` automatically → Deploy.

**Without Git (manual).** Run `npm run build`, then:

- **Cloudflare Pages:** Create → Pages → *Upload assets* → drag the `dist` folder.
- **Netlify:** open app.netlify.com/drop → drag the `dist` folder.
- **Vercel:** `npx vercel deploy dist --prod`

Repeat for every update.

**Classic hosting (cPanel / FTP):** set `CLEAN_URLS = false` in `tools/build.js`, run `npm run build`, upload the *contents* of `dist/` into `public_html`.

**After the first deploy:**
1. Add your custom domain in the host's dashboard (Custom domains).
2. Put that domain in `SITE_URL` in `tools/build.js`, run `npm run build`, deploy again.
3. Submit `https://your-domain/sitemap.xml` in Google Search Console.
