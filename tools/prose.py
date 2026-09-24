#!/usr/bin/env python3
"""The whole site's text as one editable file, and back again.

    python tools/prose.py export     src/content.json  ->  content/copy.md
    python tools/prose.py import     content/copy.md   ->  src/content.json

src/content.json already holds every word on the site, but JSON is a miserable
thing to write prose in: escaped quotes, no wrapping, and structure in the way
of the sentence. copy.md is the same words laid out to be read and rewritten,
with a heading over each one saying where it appears.

content.json stays the thing the site is built from. copy.md is a view of it
you can edit and push back, so the two are never out of step for longer than
one command.

Named prose.py rather than copy.py so it cannot shadow the standard
library's copy module for anything else in this folder.

Standard library only. render.py refreshes the file; the deploy does not ship it.
"""

import io
import json
import os
import re
import sys
import textwrap

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
CONTENT = os.path.join(ROOT, "src", "content.json")
COPY = os.path.join(ROOT, "content", "copy.md")

# Paths, not prose. Editing these in a text file is how links get broken.
SKIP_KEYS = {"_comment", "href", "src", "baseUrl", "resume", "github", "linkedin",
             "email", "accent"}

SECTIONS = [
    ("site", "Everywhere", "The name in the corner, the link labels, the footer."),
    ("home", "Home", "The first page anyone lands on."),
    ("research", "Research page", None),
    ("projects", "Projects page", None),
    ("about", "About page", None),
    ("contact", "Contact page", None),
    ("hobbies", "Hobbies page", None),
    ("glance", "At a glance", "The panel behind the corner button."),
    ("notFound", "404 page", "What someone sees at an address that does not exist."),
]

NOTES = {
    "title": "Browser tab and search results. Not shown on the page.",
    "description": "Search results and link previews. Not shown on the page.",
    "alt": "Read aloud in place of the picture. Describe what is in the shot.",
}

HEADER = """# The whole portfolio, word for word

Every word the site shows is below, with a heading over each one saying where
it appears. Rewrite anything you like, then run:

    python tools/prose.py import
    python tools/render.py

Four things worth knowing:

- **Leave the `###` headings alone.** They are how each block finds its way back.
- **A blank line inside a block starts a new item** — a new bullet, a new
  paragraph. Delete one and the two run together; add one and they split.
- **A few blocks contain HTML**, like `<span class="mark">` or `<br>`. Keep the
  tags and change the words around them.
- Nothing here is unrecoverable. `git diff` shows exactly what you changed.

Captions live here. The photographs they point at do not — see EDITING.md.

---
"""


# --- reading the content ----------------------------------------------------

def label_of(node):
    """Something to identify a list item by, when it has one."""
    if isinstance(node, dict):
        for key in ("name", "label", "heading", "head", "where", "tag", "caption"):
            if isinstance(node.get(key), str) and node[key].strip():
                return re.sub(r"<[^>]+>", "", node[key]).strip()
    return None


def walk(node, path, out, context=None):
    """Collect (path, value, context) for every string worth editing."""
    if isinstance(node, dict):
        for key, value in node.items():
            if key in SKIP_KEYS:
                continue
            walk(value, "%s.%s" % (path, key) if path else key, out, context)
    elif isinstance(node, list):
        if node and all(isinstance(v, str) for v in node):
            out.append((path, list(node), context))
            return
        for i, value in enumerate(node):
            walk(value, "%s[%d]" % (path, i), out, label_of(value) or context)
    elif isinstance(node, str):
        out.append((path, node, context))


def resolve(root, path):
    """The container and final key for a dotted path, so it can be written to."""
    node = root
    parts = re.findall(r"[^.\[\]]+|\[\d+\]", path)
    for part in parts[:-1]:
        node = node[int(part[1:-1])] if part.startswith("[") else node[part]
    last = parts[-1]
    return node, (int(last[1:-1]) if last.startswith("[") else last)


# --- export -----------------------------------------------------------------

def wrap(text):
    """Fold a line to something readable, and leave markup alone.

    textwrap breaks on any space, including the one inside <span class="...">.
    That reads back identically, but it looks broken to whoever is editing, so
    blocks with tags in them stay on one line.
    """
    if "<" in text:
        return text
    return textwrap.fill(text, width=78, break_long_words=False,
                         break_on_hyphens=False)


def export():
    with io.open(CONTENT, encoding="utf-8") as fh:
        data = json.load(fh)

    found = []
    walk(data, "", found)

    grouped = {}
    for path, value, context in found:
        top = path.split(".")[0].split("[")[0]
        grouped.setdefault(top, []).append((path, value, context))

    out = [HEADER]
    order = [s[0] for s in SECTIONS]
    for top in order + [k for k in grouped if k not in order]:
        items = grouped.get(top)
        if not items:
            continue
        title, blurb = next(((t, b) for k, t, b in SECTIONS if k == top), (top, None))
        out.append("\n## %s\n" % title)
        if blurb:
            out.append("\n%s\n" % blurb)
        for path, value, context in items:
            out.append("\n### %s\n" % path)
            key = path.rsplit(".", 1)[-1]
            block = [b.strip() for b in (value if isinstance(value, list) else [value])]
            # no point captioning a block with its own contents
            if context in block:
                context = None
            bits = [b for b in (context, NOTES.get(key)) if b]
            if bits:
                out.append("\n> %s\n" % " — ".join(bits))
            out.append("\n" + "\n\n".join(wrap(b) for b in block) + "\n")

    with io.open(COPY, "w", encoding="utf-8", newline="\n") as fh:
        fh.write("".join(out))
    print("wrote %s, %d blocks" % (os.path.relpath(COPY, ROOT).replace("\\", "/"),
                                   len(found)))


# --- import -----------------------------------------------------------------

def parse(text):
    """Every '### path' heading, and the blocks of text under it.

    A '## Section' heading closes the block above it and starts nothing, or the
    section title lands on the end of the last sentence before it.
    """
    collected = {}
    path, buf = None, []
    for line in text.splitlines():
        if line.startswith("### "):
            if path:
                collected[path] = buf
            path, buf = line[4:].strip(), []
        elif line.startswith("#"):
            if path:
                collected[path] = buf
            path, buf = None, []
        elif path is not None and not line.lstrip().startswith(">"):
            buf.append(line)
    if path:
        collected[path] = buf
    return {p: [c.strip() for c in re.split(r"\n\s*\n", "\n".join(b).strip()) if c.strip()]
            for p, b in collected.items()}


def apply():
    with io.open(CONTENT, encoding="utf-8") as fh:
        data = json.load(fh)
    if not os.path.exists(COPY):
        sys.exit("no content/copy.md yet — run: python tools/prose.py export")
    with io.open(COPY, encoding="utf-8") as fh:
        blocks = parse(fh.read())

    changed, unknown, emptied = [], [], []
    for path, chunks in blocks.items():
        try:
            holder, key = resolve(data, path)
            before = holder[key]
        except (KeyError, IndexError, ValueError, TypeError):
            unknown.append(path)
            continue

        if not chunks:
            emptied.append(path)
            continue

        # every value here is prose, so however it got wrapped in the file it
        # goes back as one line
        flat = [" ".join(c.split()) for c in chunks]
        after = flat if isinstance(before, list) else " ".join(flat)

        if after != before:
            holder[key] = after
            changed.append(path)

    for path in unknown:
        print("skipped, no such setting: %s" % path)
    for path in emptied:
        print("skipped, left blank: %s" % path)

    if not changed:
        print("nothing changed")
        return 0

    with io.open(CONTENT, "w", encoding="utf-8", newline="\n") as fh:
        fh.write(json.dumps(data, indent=2, ensure_ascii=False) + "\n")
    print("updated %d block%s:" % (len(changed), "" if len(changed) == 1 else "s"))
    for path in changed:
        print("  " + path)
    print("\nnow run: python tools/render.py")
    return 0


if __name__ == "__main__":
    mode = sys.argv[1] if len(sys.argv) > 1 else ""
    if mode == "export":
        export()
    elif mode == "import":
        sys.exit(apply())
    else:
        sys.exit(__doc__)
