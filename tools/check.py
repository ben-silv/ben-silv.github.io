#!/usr/bin/env python3
"""Check the rendered site.

    python tools/check.py

Fails loudly rather than shipping a broken page: unbalanced tags, dead local
links, missing alt text, and the copy patterns this site deliberately avoids.
Standard library only, so it also runs in CI.
"""

import html.parser
import json
import os
import re
import sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
PAGES = ["index.html", "research.html", "projects.html", "about.html",
         "contact.html", "hobbies.html", "404.html"]

VOID = {"area", "base", "br", "col", "embed", "hr", "img", "input",
        "link", "meta", "param", "source", "track", "wbr"}


class Balance(html.parser.HTMLParser):
    def __init__(self):
        super().__init__(convert_charrefs=True)
        self.stack = []
        self.errors = []

    def handle_starttag(self, tag, attrs):
        if tag not in VOID:
            self.stack.append(tag)

    def handle_endtag(self, tag):
        if tag in VOID:
            return
        if not self.stack:
            self.errors.append("stray </%s>" % tag)
        elif self.stack[-1] != tag:
            self.errors.append("line %d: expected </%s>, found </%s>"
                               % (self.getpos()[0], self.stack[-1], tag))
        else:
            self.stack.pop()


def check_page(name):
    problems = []
    path = os.path.join(ROOT, name)
    if not os.path.exists(path):
        return ["missing entirely"]

    with open(path, encoding="utf-8") as fh:
        doc = fh.read()

    parser = Balance()
    parser.feed(doc)
    problems += parser.errors
    if parser.stack:
        problems.append("never closed: %s" % ", ".join(parser.stack))

    # local links and assets resolve
    for attr in ("href", "src"):
        for target in re.findall(r'%s="([^"]+)"' % attr, doc):
            if target.startswith(("http", "mailto:", "#", "data:")):
                continue
            local = target.split("#")[0].split("?")[0].lstrip("/")
            if local and not os.path.exists(os.path.join(ROOT, local)):
                problems.append("dead %s: %s" % (attr, target))

    # images carry alt text
    for tag in re.findall(r"<img\b[^>]*>", doc):
        if 'alt="' not in tag:
            problems.append("image without alt text")

    # the patterns this design rules out
    if "text-transform: uppercase" in doc:
        problems.append("all-caps label")
    if re.search(r">[^<]{1,40}\s(→|&rarr;)\s*<", doc):
        problems.append("arrow appended to link text")

    # structure the site depends on. The 404 is the one page with no summary
    # panel and no corner button — it is a dead end by design.
    needed = ['id="content"', "skip"]
    if name != "404.html":
        needed += ["glance", "data-glance-open"]
    for token in needed:
        if token not in doc:
            problems.append("missing %s" % token)

    return problems


def main():
    with open(os.path.join(ROOT, "src", "content.json"), encoding="utf-8") as fh:
        json.load(fh)  # a syntax error here should stop the build

    failed = False
    for name in PAGES:
        problems = check_page(name)
        print(("ok   " if not problems else "FAIL ") + name.ljust(16)
              + ("; ".join(problems) if problems else ""))
        failed = failed or bool(problems)

    for extra in ["src/styles/tokens.css", "src/styles/motion.css",
                  "src/styles/main.css", "src/js/app.js", "resume.pdf",
                  "assets/favicon.svg", "content/experiences.md"]:
        if not os.path.exists(os.path.join(ROOT, extra)):
            print("FAIL missing " + extra)
            failed = True

    print("\n" + ("something is broken" if failed else "all pages check out"))
    return 1 if failed else 0


if __name__ == "__main__":
    sys.exit(main())
