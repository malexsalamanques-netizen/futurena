# futureña

Observatorio independiente de narrativas de futuros desde Latinoamérica.

Static site. Plain HTML / CSS / JS. Hosted on GitHub Pages.

---

## Structure

```
futurena/
├── index.html          # Page skeleton
├── styles.css          # All styles
├── script.js           # Grid render, search, filter, ES/EN toggle
├── content.json        # ← ALL CONTENT LIVES HERE (edit this to add bites)
├── 404.html
├── CNAME               # custom domain (punycode form of futureña.com)
├── .nojekyll           # tell GitHub Pages not to run Jekyll
├── assets/             # logotype + thumbnails you host yourself
└── README.md
```

---

## Adding a new bite (the everyday workflow)

1. Open `content.json`.
2. Copy the most recent object inside `"modules"` and paste it at the top of the array.
3. Edit the fields. The schema:

```json
{
  "id": "008",
  "type": "bite",
  "date": "2026-05-20",
  "thumbnail": "https://source-site.com/og-image.jpg",
  "thumbnail_alt": {
    "es": "Descripción corta de la imagen para accesibilidad.",
    "en": "Short alt text for accessibility."
  },
  "title": {
    "es": "Tu encuadre del bite en español.",
    "en": "Your framing of the bite in English."
  },
  "essay": {
    "es": "Mini ensayo de 2 a 4 frases que conecta el bite con la tesis de futureña.",
    "en": "2–4 sentence mini essay connecting the bite to futureña's thesis."
  },
  "url": "https://source-site.com/the-original-page",
  "source": "source-site.com",
  "tags": ["tag1", "tag2", "tag3"],
  "size": "standard"
}
```

4. Commit. Push. Done. GitHub Pages redeploys in about a minute.

### Thumbnails

Two options:

- **Easiest**: paste a remote image URL (e.g. the source page's `og:image`). Risk: if the source removes the image, your tile breaks.
- **Robust**: download the image, drop it into `assets/img/`, and reference it as `"thumbnail": "assets/img/your-image.jpg"`. Recommended for anything you want to last.

Thumbnails are cropped to a 4:3 ratio. Width ≥ 1200px gives the best quality.

### Sizes

- `"size": "standard"` (default) — 1 column, 4 of 12 grid units on desktop.
- `"size": "wide"` — 2 columns. Use sparingly for hero bites.

---

## Asking me to help write a mini essay

When you find a new bite, share me the URL and tell me to add it. I'll read the page, write a bilingual mini essay that positions it within the futureña frame (not just a summary), pick tags, and append it to `content.json`. You review, commit, push.

---

## Search

Live, client-side. Searches across title, essay, tags, and source. Filters compose with the search query.

Keyboard:
- `/` focuses the search input from anywhere on the page.
- `Esc` clears search.

---

## Bilingual toggle

The button in the top-right swaps ES/EN. The user's choice is remembered in `localStorage`. Both languages live inside each module's object, so adding new content means writing both versions (or pasting machine translations to start).

Adding a new UI string:
1. Add a key/value to both `I18N.es` and `I18N.en` in `script.js`.
2. Add `data-i18n="your-key"` to the element in `index.html`.

For attributes (like `placeholder`), use `data-i18n-attr="placeholder:your-key"`.

---

## Local preview

This is a static site that uses `fetch()` to load `content.json`. Opening `index.html` directly from your file system via `file://` will be blocked by browsers' CORS policy. Run a local server instead.

```bash
cd futurena
python3 -m http.server 8000
# then open http://localhost:8000
```

Or with Node:

```bash
npx serve .
```

---

## Deploying to GitHub Pages with futureña.com

### One-time setup

1. **Create the repo on GitHub**. Name it `futurena` (or whatever you prefer). Make it public.
2. **Push this folder**:
   ```bash
   cd futurena
   git init
   git add .
   git commit -m "First commit"
   git branch -M main
   git remote add origin git@github.com:YOUR_USERNAME/futurena.git
   git push -u origin main
   ```
3. **Enable Pages**: repo → Settings → Pages → Source: `Deploy from a branch` → branch `main`, folder `/ (root)` → Save.
4. **Custom domain (the punycode subtlety)**:
   - The domain `futureña.com` contains a non-ASCII character (the ñ). DNS only understands ASCII, so the real domain at the protocol level is the punycode form: **`xn--futurea-9za.com`**.
   - The `CNAME` file in this repo already contains `xn--futurea-9za.com`. GitHub Pages requires the punycode form here.
   - In GitHub Settings → Pages → Custom domain: enter `xn--futurea-9za.com`. GitHub will display it as the IDN-decoded form in the UI.
5. **Configure DNS at your domain registrar**:

   For an apex domain (`futureña.com`), add four `A` records pointing to GitHub Pages:
   ```
   A   @   185.199.108.153
   A   @   185.199.109.153
   A   @   185.199.110.153
   A   @   185.199.111.153
   ```
   And an optional `AAAA` set for IPv6:
   ```
   AAAA  @  2606:50c0:8000::153
   AAAA  @  2606:50c0:8001::153
   AAAA  @  2606:50c0:8002::153
   AAAA  @  2606:50c0:8003::153
   ```
   And a `CNAME` for `www`:
   ```
   CNAME  www  YOUR_USERNAME.github.io
   ```
   Some registrars accept the Unicode form `futureña.com` in their DNS UI and store it as punycode behind the scenes. Either way works.

6. **Enable HTTPS**: back in Settings → Pages, check "Enforce HTTPS" once GitHub has finished issuing the certificate (can take an hour after DNS propagates).

### Updating content

```bash
# edit content.json (or anything else)
git add content.json
git commit -m "Add bite: <short description>"
git push
```

Pages redeploys automatically.

---

## What's not here (yet)

- Per-bite permalink pages. Right now bites link out to the source. If you later want each bite to have its own page on futureña, we'd add a router and a template.
- RSS feed. Easy to add when you want one — `content.json` is already structured for it.
- Email signup. The footer mailto link is the minimum-viable version.
