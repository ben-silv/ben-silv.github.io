# ben-silv.github.io

Ben Silver's portfolio. Static HTML, one small React island, no bundler.

Live at <https://ben-silv.github.io>.

## How it fits together

Every word on the site lives in `src/content.json`. A Python script reads that
file and writes the seven HTML pages. Nothing else generates markup, so a copy
change never means touching a template.

```
content/experiences.md   Ben's scratchpad. Notes, not copy. Never rendered.
src/content.json         Every user-facing string. The site reads this.
tools/render.py          content.json -> the .html files at the repo root
tools/check.py           refuses to ship a broken page
src/styles/tokens.css    six colours, two typefaces, the spacing scale
src/styles/motion.css    every keyframe, and the reduced-motion switch
src/styles/main.css      layout and components
src/js/app.js            the only script: button pointer tracking + At a glance
assets/                  favicon, and photos once Ben adds them
resume.pdf               linked from the masthead of every page
```

The generated pages — `index.html`, `research.html`, `projects.html`,
`about.html`, `contact.html`, `hobbies.html`, `404.html` — are committed so the
site works even if the workflow is ever disabled. They are output, not source:
edit `src/content.json` and re-render rather than editing them by hand.

## Running it

No install step. Python 3 is the only requirement.

```sh
python tools/render.py     # rebuild the pages from content.json
python tools/check.py      # tag balance, dead links, missing alt text
python -m http.server 8801 # then open http://localhost:8801
```

`tools/check.py` exits non-zero on a problem, and the deploy workflow runs it
before publishing, so a broken page stops the deploy instead of reaching the
site.

## Deploying

Push to `main`. `.github/workflows/deploy.yml` renders, checks, and publishes
the repository root to GitHub Pages. There is no build artifact to keep in sync.

## Light and dark

Two palettes, one set of names. `src/styles/tokens.css` defines the six colours
twice — once for daylight and once for night — and every rule in the site reads
the names, never the hex.

The switch in the masthead stores a choice in `localStorage`. Without a stored
choice the site follows the operating system. The script that applies it is
inline in the `<head>` rather than in `src/js/app.js`, because it has to run
before the first paint or a visitor who chose dark gets a white flash on every
page load; it is also self-contained, so the switch cannot be broken by a
script that fails to arrive. The button is hidden in the markup and unhidden by
that script, so nobody meets a switch that cannot switch.

Both themes pass WCAG AA on every page. `tools/check.py` does not measure
contrast — if you change a colour, check it.

## At a glance

The corner button on every page opens a one-screen summary. Without JavaScript
it is an ordinary link to a summary section at the foot of the page; with
JavaScript that section is hidden and the same content opens as a dialog. React
18 comes from a CDN and is used for this one component — if it fails to load,
the link still works.

## Editing

See [EDITING.md](EDITING.md).
