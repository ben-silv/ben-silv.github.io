#!/usr/bin/env python3
"""Render the site from src/content.json.

    python tools/render.py

Writes index.html, research.html, projects.html, about.html, contact.html,
hobbies.html and 404.html into the repository root. Nothing else touches those
files by hand — edit src/content.json and run this again.

Standard library only, so it runs anywhere Python 3 does, including the
GitHub Actions runner.
"""

import json
import os
import sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
CONTENT = os.path.join(ROOT, "src", "content.json")

FONTS = ("https://fonts.googleapis.com/css2?"
         "family=Bricolage+Grotesque:opsz,wght@12..96,600;12..96,800"
         "&family=Instrument+Sans:wght@400;500;600&display=swap")


def esc(text):
    """Escape a string for use in an HTML attribute."""
    return (str(text).replace("&", "&amp;").replace("<", "&lt;")
            .replace(">", "&gt;").replace('"', "&quot;"))


def head(c, page, canonical, body_class=""):
    site = c["site"]
    return f"""<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>{esc(page['title'])}</title>
<meta name="description" content="{esc(page['description'])}">
<link rel="canonical" href="{esc(canonical)}">
<meta property="og:type" content="website">
<meta property="og:title" content="{esc(page['title'])}">
<meta property="og:description" content="{esc(page['description'])}">
<meta property="og:url" content="{esc(canonical)}">
<meta name="twitter:card" content="summary">
<link rel="icon" href="assets/favicon.svg" type="image/svg+xml">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="{FONTS}">
<link rel="stylesheet" href="src/styles/tokens.css">
<link rel="stylesheet" href="src/styles/motion.css">
<link rel="stylesheet" href="src/styles/main.css">
</head>
<body{(' class="' + body_class + '"') if body_class else ''}>
<a class="skip" href="#content">Skip to content</a>
<div class="page">
"""


def masthead(c, active_home=False):
    s = c["site"]
    mark = ("<span class=\"wordmark\">%s</span>" % esc(s["name"])) if active_home else \
           ("<a class=\"wordmark\" href=\"index.html\">%s</a>" % esc(s["name"]))
    return f"""  <header class="masthead">
    {mark}
    <nav class="masthead__links" aria-label="Elsewhere">
      <a class="is-primary" href="{esc(s['resume'])}">Resume</a>
      <a href="{esc(s['github'])}">GitHub</a>
      <a href="{esc(s['linkedin'])}">LinkedIn</a>
      <a href="mailto:{esc(s['email'])}">Email</a>
    </nav>
  </header>
"""


def glance_section(c, inline=True):
    g = c["glance"]
    s = c["site"]
    cols = []
    for col in g["columns"]:
        accent = (" glance__col--" + col["accent"]) if col.get("accent") else ""
        items = "".join(
            f"""        <div><strong>{i['head']}</strong><span>{i['body']}</span></div>\n"""
            for i in col["items"])
        link = ""
        if col.get("link"):
            link = (f"""      <a class="glance__more" href="{esc(col['link']['href'])}">"""
                    f"""{esc(col['link']['label'])}</a>\n""")
        cols.append(f"""    <section class="glance__col{accent}">
      <h3>{col['heading']}</h3>
      <div class="glance__items">
{items}      </div>
{link}    </section>
""")

    actions = "".join(
        f"""        <a class="btn{' btn--primary' if a.get('primary') else ' btn--on-dark'}" """
        f"""href="{esc(a['href'])}">{esc(a['label'])}</a>\n"""
        for a in g["actions"])

    cls = "glance glance--inline" if inline else "glance"
    return f"""  <section class="{cls}" id="glance" aria-labelledby="glance-title">
    <div class="glance__head">
      <div>
        <h2 class="glance__title" id="glance-title">{esc(g['heading'])}</h2>
        <p class="glance__lead">{esc(g['lead'])}</p>
      </div>
    </div>
    <div class="glance__grid">
{"".join(cols)}    </div>
    <div class="glance__foot">
      <p>{esc(s['footerNote'])} <a class="mark" href="mailto:{esc(s['email'])}">{esc(s['email'])}</a></p>
      <div class="actions">
{actions}      </div>
    </div>
  </section>
"""


def door_button(c, animated=False):
    label = c["glance"]["button"]
    cls = "door-button lead-door" if animated else "door-button"
    return f"""  <a class="{cls}" href="#glance" data-glance-open>
    {esc(label)}
    <span class="door-button__mark" aria-hidden="true">
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"><path d="M12 5v14"></path><path d="M5 12h14"></path></svg>
    </span>
  </a>
  <div id="glance-root"></div>
"""


def tail(c):
    g = dict(c["glance"])
    g["email"] = c["site"]["email"]
    g["footerNote"] = c["site"]["footerNote"]
    blob = json.dumps(g, ensure_ascii=False).replace("</", "<\\/")
    return f"""</div>
<script type="application/json" id="glance-data">{blob}</script>
<script src="https://unpkg.com/react@18/umd/react.production.min.js" crossorigin defer></script>
<script src="https://unpkg.com/react-dom@18/umd/react-dom.production.min.js" crossorigin defer></script>
<script src="src/js/app.js" defer></script>
</body>
</html>
"""


def facts(items):
    return "".join(
        f"""      <div class="fact"><p>{esc(f['label'])}</p><p>{f['value']}</p></div>\n"""
        for f in items)


def actions(items, on_dark=False):
    out = []
    for a in items:
        cls = "btn btn--primary" if a.get("primary") else ("btn btn--on-dark" if on_dark else "btn")
        out.append(f"""        <a class="{cls}" href="{esc(a['href'])}">{esc(a['label'])}</a>\n""")
    return "".join(out)


# --- pages -----------------------------------------------------------------

def render_home(c):
    h = c["home"]
    edu = "".join(
        f"""      <div>
        <dt>{esc(e['label'])}</dt>
        <dd class="big">{e['value']}</dd>
        <dd class="note">{e['note']}</dd>
      </div>\n"""
        for e in h["education"])
    doors = "".join(
        f"""      <a class="door" href="{esc(d['href'])}">
        <span class="door__label">{esc(d['label'])}</span>
        <span class="door__desc">{d['desc']}</span>
      </a>\n"""
        for d in h["doors"])

    return (head(c, h, c["site"]["baseUrl"])
            + masthead(c, active_home=True)
            + f"""  <main class="main main--home" id="content">
    <span class="rule lead-rule"></span>
    <h1 class="name lead-name">{esc(c['site']['name'])}</h1>
    <p class="identity lead-identity">{esc(h['identity'])}</p>
    <p class="summary lead-summary">{esc(h['summary'])}</p>

    <dl class="education lead-education">
{edu}    </dl>

    <nav class="doors lead-nav" aria-label="Sections">
{doors}    </nav>
  </main>
"""
            + glance_section(c)
            + door_button(c, animated=True)
            + tail(c))


def render_research(c):
    r = c["research"]
    blocks = []
    for i, p in enumerate(r["positions"]):
        cls = "entry entry--lead entry--research" if p["lead"] else "entry"
        name_cls = "entry__name" if p["lead"] else "entry__name entry__name--minor"
        if p.get("bullets"):
            body = ("""        <ul class="bullets">\n"""
                    + "".join(f"""          <li><span class="tick" aria-hidden="true"></span><span>{b}</span></li>\n"""
                              for b in p["bullets"])
                    + """        </ul>\n""")
        else:
            body = "".join(f"""        <p class="entry__text">{t}</p>\n""" for t in p.get("paragraphs", []))
        blocks.append(f"""    <article class="{cls} enter-{i + 1}">
      <div class="entry__body">
        <h2 class="{name_cls}">{p['name']}</h2>
        <p class="entry__org">{p['org']}</p>
{body}      </div>
      <div class="entry__side">
{facts(p['facts'])}      </div>
    </article>
""")

    return (head(c, r, c["site"]["baseUrl"] + "research.html")
            + masthead(c)
            + f"""  <main class="main" id="content">
    <div class="page-head enter">
      <h1 class="page-title">{esc(r['heading'])}</h1>
      <p class="page-lead">{esc(r['lead'])}</p>
    </div>
{"".join(blocks)}  </main>
"""
            + glance_section(c) + door_button(c) + tail(c))


def render_projects(c):
    p = c["projects"]
    blocks = []
    for i, item in enumerate(p["items"]):
        cls = "entry entry--lead entry--project" if item["lead"] else "entry"
        paras = "".join(f"""        <p class="entry__text">{t}</p>\n""" for t in item["paragraphs"])
        blocks.append(f"""    <article class="{cls} enter-{i + 1}">
      <div class="entry__body">
        <h2 class="entry__name">{esc(item['name'])}</h2>
        <p class="entry__org">{esc(item['when'])}</p>
{paras}        <div class="actions">
{actions(item['actions'])}        </div>
      </div>
      <div class="entry__side">
{facts(item['facts'])}      </div>
    </article>
""")

    return (head(c, p, c["site"]["baseUrl"] + "projects.html")
            + masthead(c)
            + f"""  <main class="main" id="content">
    <div class="page-head enter">
      <h1 class="page-title">{esc(p['heading'])}</h1>
      <p class="page-lead">{esc(p['lead'])}</p>
    </div>
{"".join(blocks)}  </main>
"""
            + glance_section(c) + door_button(c) + tail(c))


def render_about(c):
    a = c["about"]
    paras = "".join(f"""      <p>{t}</p>\n""" for t in a["paragraphs"])
    stack = "".join(
        f"""        <div class="stack__item{(' stack__item--' + s['accent']) if s['accent'] else ''}">
          <p>{s['where']}</p>
          <p>{s['what']}</p>
        </div>\n"""
        for s in a["current"])

    return (head(c, a, c["site"]["baseUrl"] + "about.html")
            + masthead(c)
            + f"""  <main class="main" id="content">
    <div class="split">
      <div class="split__main prose enter">
        <h1 class="page-title">{esc(a['heading'])}</h1>
{paras}      </div>
      <div class="split__side enter-1">
        <h2 class="entry__name entry__name--minor">{esc(a['sideHeading'])}</h2>
        <div class="stack">
{stack}        </div>
        <p class="pointer">{esc(a['pointer'])}</p>
      </div>
    </div>
  </main>
"""
            + glance_section(c) + door_button(c) + tail(c))


def render_contact(c):
    k = c["contact"]
    rows = "".join(
        f"""        <div><p>{esc(r['label'])}</p><p>{esc(r['value'])}</p></div>\n"""
        for r in k["rows"])

    return (head(c, k, c["site"]["baseUrl"] + "contact.html")
            + masthead(c)
            + f"""  <main class="main" id="content">
    <div class="split">
      <div class="split__main enter">
        <h1 class="page-title">{esc(k['heading'])}</h1>
        <p class="summary">{esc(k['lead'])}</p>
        <a class="email-big" href="mailto:{esc(c['site']['email'])}">{esc(c['site']['email'])}</a>
        <div class="actions">
{actions(k['actions'])}        </div>
      </div>
      <div class="split__side enter-1">
        <div class="rows">
{rows}        </div>
      </div>
    </div>
  </main>
"""
            + glance_section(c) + door_button(c) + tail(c))


def slot(item, extra=""):
    """A photo or video placeholder, or the real media once a src is set."""
    if item.get("src"):
        if item.get("video"):
            return (f"""        <video class="slot{extra}" controls preload="metadata" """
                    f"""aria-label="{esc(item.get('alt') or item['label'])}">"""
                    f"""<source src="{esc(item['src'])}"></video>\n""")
        return (f"""        <img class="slot{extra}" src="{esc(item['src'])}" """
                f"""alt="{esc(item.get('alt') or item['label'])}" loading="lazy">\n""")

    play = ""
    cls = extra
    if item.get("video"):
        cls += " slot--video"
        play = ("""          <span class="play" aria-hidden="true">"""
                """<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">"""
                """<path d="M8 5.5v13l11-6.5Z"></path></svg></span>\n""")
    return f"""        <div class="slot{cls}">
{play}          <strong>{esc(item['label'])}</strong>
          <span>{esc(item['hint'])}</span>
        </div>\n"""


def render_hobbies(c):
    hb = c["hobbies"]
    f = hb["feature"]
    s = hb["second"]
    tiles = "".join(slot(t) for t in f["tiles"])
    shots = "".join(slot(t) for t in s["shots"])
    rest = "".join(
        f"""        <div><h3>{esc(r['name'])}</h3><p>{esc(r['body'])}</p></div>\n"""
        for r in hb["rest"])

    return (head(c, hb, c["site"]["baseUrl"] + "hobbies.html", body_class="hobbies")
            + masthead(c)
            + f"""  <main class="main" id="content">
    <div class="page-head enter">
      <h1 class="page-title">{esc(hb['heading'])}</h1>
      <p class="page-lead">{esc(hb['lead'])}</p>
    </div>

    <section class="feature enter-1" aria-labelledby="feature-title">
      <div class="feature__head">
        <h2 class="feature__name" id="feature-title">{esc(f['name'])}</h2>
        <p class="feature__blurb">{esc(f['blurb'])}</p>
      </div>
      <div class="gallery">
{slot(f['hero'], extra=' gallery__hero slot--hero')}        <div class="gallery__grid">
{tiles}        </div>
      </div>
      <p class="feature__note">{esc(f['note'])}</p>
    </section>

    <section class="second enter-2" aria-labelledby="second-title">
      <div class="second__head">
        <h2 class="second__name" id="second-title">{esc(s['name'])}</h2>
        <p class="feature__blurb">{esc(s['blurb'])}</p>
      </div>
      <div class="pair">
{shots}      </div>
    </section>

    <section class="rest enter-3" aria-labelledby="rest-title">
      <p class="rest__label" id="rest-title">{esc(hb['restLabel'])}</p>
      <div class="rest__grid">
{rest}      </div>
    </section>

    <p class="hunting">
      <span>{esc(hb['hunting']['before'])}</span>
      <strong>{esc(hb['hunting']['highlight'])}</strong>
      <span>{esc(hb['hunting']['after'])}</span>
    </p>
  </main>
"""
            + glance_section(c) + door_button(c) + tail(c))


def render_404(c):
    n = c["notFound"]
    doors = "".join(
        f"""      <a class="door" href="{esc(d['href'])}">
        <span class="door__label">{esc(d['label'])}</span>
      </a>\n"""
        for d in c["home"]["doors"])
    page = {"title": n["title"], "description": "Page not found."}
    html = (head(c, page, c["site"]["baseUrl"])
            + masthead(c)
            + f"""  <main class="main" id="content">
    <h1 class="page-title">{esc(n['heading'])}</h1>
    <p class="summary">{esc(n['lead'])}</p>
    <nav class="doors" aria-label="Sections">
{doors}    </nav>
  </main>
</div>
</body>
</html>
""")
    # A 404 is served at whatever path was asked for, which may be nested, so
    # its own links have to be absolute rather than relative.
    for rel in ("src/", "assets/", "resume.pdf", "index.html", "research.html",
                "projects.html", "about.html", "contact.html", "hobbies.html"):
        html = html.replace('href="%s' % rel, 'href="/%s' % rel)
    return html


PAGES = {
    "index.html": render_home,
    "research.html": render_research,
    "projects.html": render_projects,
    "about.html": render_about,
    "contact.html": render_contact,
    "hobbies.html": render_hobbies,
    "404.html": render_404,
}


def main():
    with open(CONTENT, encoding="utf-8") as fh:
        content = json.load(fh)

    for name, fn in PAGES.items():
        html = fn(content)
        with open(os.path.join(ROOT, name), "w", encoding="utf-8", newline="\n") as fh:
            fh.write(html)
        print("wrote %-16s %6d bytes" % (name, len(html.encode("utf-8"))))
    return 0


if __name__ == "__main__":
    sys.exit(main())
