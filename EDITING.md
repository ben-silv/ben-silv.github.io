# How to edit this site

Every piece of text lives in plain HTML. There's no build step, no framework to
learn, and no database. Open a file, change the words between the tags, save,
commit, push — the site rebuilds itself in about a minute.

Editable sections are wrapped in comments so they're easy to find:

```html
<!-- EDIT: headline and intro ==================================== -->
   ...the bit you change...
<!-- /EDIT -->
```

Search any file for `EDIT:` to jump between them.

---

## Where each thing lives

| What you want to change | File | Look for |
|---|---|---|
| Big headline on the front page | `index.html` | `EDIT: headline and intro` |
| The "Now" note (update this monthly) | `index.html` | `EDIT: the "Now" note` |
| GPA, degree, graduation date | `index.html` | `EDIT: at a glance` |
| The three "Selected work" links | `index.html` | `EDIT: selected work list` |
| Research intro paragraph | `research.html` | `EDIT: page header` |
| MGH / VIC position | `research.html` | `EDIT: research position 1` |
| Sonkusale position | `research.html` | `EDIT: research position 2` |
| Tufts Technology Services role | `research.html` | `EDIT: research position 3` |
| CraveCast write-up and links | `projects.html` | `EDIT: project 1 — CraveCast` |
| Epialert write-up | `projects.html` | `EDIT: project 2 — Epialert` |
| Your personal narrative | `about.html` | `EDIT: about narrative` |
| Degree, coursework, clubs | `about.html` | `EDIT: education` |
| Hobbies | `about.html` | `EDIT: hobbies` |
| Contact copy and email address | `contact.html` | `EDIT: contact copy and email` |
| "Based in" / "Open to" | `contact.html` | `EDIT: contact margin notes` |
| Google search result text | every page | `EDIT: page title and description` |
| Tagline under your name | every page | `EDIT: sidebar tagline` |
| Email / GitHub / LinkedIn links | every page | `EDIT: sidebar contact links` |
| Colours, fonts, spacing | `styles/main.css` | section `1. TOKENS` |
| Your résumé | replace `resume.pdf` | — |

---

## The three patterns you'll reuse

### 1. A paragraph

```html
<p class="prose">Your sentence goes here.</p>
```

### 2. A margin note

The small grey items in the right-hand column. Each one is a label and a value:

```html
<div class="note">
  <span class="note__label">Dates</span>
  <span class="note__value">July 2026 — present</span>
</div>
```

Use `<br>` for line breaks inside a value. Keep these short — two or three
lines. They're meant to be glanced at, not read.

### 3. A whole new entry (job, project, anything)

Copy an existing `<article class="row row--ruled">` block and change the text.
The structure is always: a content column, then its notes.

```html
<article class="row row--ruled">
  <div class="col">
    <h2 class="entry__title">Job title</h2>
    <p class="entry__org">Where it was</p>
    <p class="prose" style="margin-top: 16px;">What you did.</p>
  </div>
  <div class="notes">
    <div class="note">
      <span class="note__label">Dates</span>
      <span class="note__value">Month Year — Month Year</span>
    </div>
  </div>
</article>
```

---

## Two things to watch

**The sidebar is repeated in all five pages.** It's the block between
`<aside class="sidebar">` and `</aside>`. If you change a nav item or a contact
link, change it in `index.html`, `research.html`, `projects.html`, `about.html`
and `contact.html`. This is the one cost of having no build step — it keeps
everything else simple, and the sidebar rarely changes.

**Write `&amp;` instead of a bare `&`.** So: `Vaccine &amp; Immunotherapy
Center`. It renders as a normal `&`.

---

## Adding a sixth page

1. Copy `contact.html` to `newpage.html`.
2. Change `<body data-page="contact">` to `<body data-page="newpage">`.
3. Add a nav link to the sidebar **in all six files**:
   ```html
   <a class="nav__link" data-nav="newpage" href="newpage.html"><span class="nav__num">05</span>New page<span class="nav__dot"></span></a>
   ```
4. In `styles/main.css`, add `newpage` to the three selector lists in the
   sidebar section (search for `data-page="contact"` — there are three places,
   for the text colour, the number colour and the dot).

---

## Previewing before you publish

Double-clicking an HTML file works for a quick look. To see it exactly as
GitHub will serve it:

```bash
cd ben-silv.github.io
python -m http.server 8000
```

Then open <http://localhost:8000>. Press `Ctrl+C` to stop.

---

## Publishing a change

```bash
git add -A
git commit -m "Update the Now note"
git push
```

Live at <https://ben-silv.github.io> within a minute or so. If it looks stale,
hard-refresh with `Ctrl+Shift+R`.
