# ben-silv.github.io

Personal site — research, projects, and background.
Live at <https://ben-silv.github.io>.

**To change the text, read [EDITING.md](EDITING.md).** It maps every piece of
copy to the file and marker where it lives.

## What this is

Five static HTML pages sharing one stylesheet. No build step, no bundler, no
dependencies to install. The only JavaScript is a small React island that
powers the light/dark toggle — if it fails to load, the site still works.

```
index.html          00 — Home
research.html       01 — Research
projects.html       02 — Projects
about.html          03 — About
contact.html        04 — Contact
404.html            Not-found page

styles/main.css     Everything visual. Colours are tokens at the top.
js/app.js           Theme toggle (React 18 via CDN).
assets/favicon.svg
resume.pdf          Linked from every page.
```

## How it's put together

- **Active nav state is pure CSS.** Each page sets `data-page` on `<body>`;
  the stylesheet matches that against `data-nav` on each link. No JavaScript.
- **Dark mode** follows the system setting until the visitor picks one, then
  remembers the choice in `localStorage`. A tiny inline script in each `<head>`
  applies the saved theme before first paint, so there's no white flash.
- **The right-hand margin column** carries dates, collaborators and figures, so
  they stay out of the prose. Below 960px it drops underneath the content it
  belongs to; below 820px the sidebar becomes a top bar.
- **Accessibility:** semantic landmarks, a skip link, visible focus rings,
  44px minimum hit targets, `prefers-reduced-motion` respected, and text
  contrast at WCAG AA or better in both themes.

## Running it locally

```bash
python -m http.server 8000
```

<http://localhost:8000>

## Deploying

Pushing to `main` publishes the site. `.github/workflows/deploy.yml` uploads
the repository root to GitHub Pages — this requires **Settings → Pages →
Source → GitHub Actions**.

If you'd rather skip Actions entirely, set **Source** to **Deploy from a
branch → `main` / `(root)`** and delete the workflow file. Both work; the
branch option is one less moving part.
