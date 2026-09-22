# Editing the site

Everything you can see on the site is a string in one file: `src/content.json`.
Change a string there, run one command, and the pages rebuild. You never need
to open an `.html` file.

```sh
python tools/render.py     # rebuild
python tools/check.py      # make sure nothing broke
```

Then commit and push. The deploy runs itself.

---

## The easy way

Open `content/experiences.md` and write whatever you want — bullets,
half-sentences, typos, three words and a link. That file is a scratchpad and
nothing in it is published as written.

When you want it live, say **"update the site from my notes."** Your notes get
rewritten as impact-first copy, dropped into `src/content.json`, and the pages
regenerate. `content/experiences.md` is left exactly as you typed it.

## The direct way

Edit `src/content.json` yourself. It is plain JSON: every value between quotes
is text that appears on the site. Two rules and nothing else —

1. Keep the quotes and the commas. If you delete one, `tools/check.py` will
   tell you before anything ships.
2. An apostrophe is fine. A double quote inside a string needs a backslash:
   `"he said \"no\""`.

### Where each thing lives

| You want to change | Edit |
| --- | --- |
| The line under your name on the home page | `home.identity` |
| The paragraph under that | `home.summary` |
| University, graduation, GPA | `home.education` |
| The list of sections on the home page, and their blurbs | `home.doors` |
| A research position | `research.positions` |
| A project | `projects.items` |
| The about page | `about.paragraphs`, `about.current` |
| Email, GitHub, LinkedIn anywhere on the site | `site` |
| The corner summary panel | `glance.columns` |
| Hobbies | `hobbies` |
| Page titles and Google descriptions | each section's `title` and `description` |

`home.doors` is also the order the sections appear in. Move an entry up, and it
moves up on the page.

Each research position has a `lead` (one sentence: what the work established),
`bullets` (outcomes, not steps), and `facts` (the small label/value pairs down
the side). Projects are the same shape, plus `actions` for the buttons.

---

## Adding photos and video

Drop the files anywhere under `content/` — a folder per subject is easiest,
which is what `content/leatherworking/` is — and say **"put the new photos in."**
They get rotated, cropped if they need it, resized, stripped of their metadata
(which includes where the photo was taken) and written into `assets/`, and the
right slots in `src/content.json` get filled in.

To do it by hand:

```sh
python tools/images.py content/bikes/frame.jpeg assets/bike-frame.jpg --max 900 --square
```

`--max` is the longest side in pixels, `--square` centre-crops to 1:1, and
`--crop left,top,right,bottom` takes fractions between 0 and 1 if you want to
cut something out of the frame first. That script is the one thing here that
needs Pillow (`pip install Pillow`); it is for authoring only and the deploy
never runs it.

Then point a slot at the file in `src/content.json`:

```json
{
  "caption": "Six card slots, all the same size, which is the whole trick",
  "src": "assets/leather-wallet-inside.jpg",
  "alt": "The second wallet open flat, showing six tan card slots stitched in white thread"
}
```

and run `python tools/render.py`. Nothing else is needed — the page works out
the dimensions from the file itself, so there are no pixel sizes to keep in
step.

`alt` is not optional. `tools/check.py` fails the build without it, and it is
what a screen reader reads out. Describe what is in the shot, not "photo of
leatherworking."

### Where the slots are

- `hobbies.feature.compare.items` — the two wallets, side by side. Each has a
  `tag` and a `note` under it, which is where the comparison gets made.
- `hobbies.feature.tiles` — the row of three under them. One of them has
  `"video": true` and expects an `.mp4`.
- `hobbies.second.shots` — bikes. Empty, waiting for photos.
- `research.positions[n].images` — the small strip at the foot of a research
  entry. Two per row is about right; they are meant to stay small.

A slot with nothing in `src` renders nothing at all, so an empty one costs you
nothing while you wait to take the picture. Everything under `hobbies.rest` is
text only on purpose — those are the ones without much to show.

Video is left alone rather than re-encoded, so export it small before dropping
it in: ten seconds or so, and a few megabytes rather than thirty. It is set to
load only its first frame until somebody presses play, so a big one will not
slow the page down, but it will still be a big download for anyone who does.

---

## Changing a colour

`src/styles/tokens.css` holds the palette. Every colour is named twice: once
near the top for daylight, and once in the dark block below it for night. The
dark block is written out twice on purpose — the comment there explains why —
so if you change one copy, change the other.

Nothing else in the site has a hex code in it. If you want the orange on the
hobbies page to be a different orange, `--pulse` is the only place to edit.

Keep an eye on contrast when you do. The current values clear WCAG AA on every
page in both themes, and that is easy to lose by half a shade.

---

## Adding or removing a section

Adding a whole new page means editing `tools/render.py`, which is more than a
copy change. Adding an item to an existing list is not — copy the block above
it, including the braces, change the text, add a comma between them.

To take a section off the home page without deleting its page, remove its entry
from `home.doors`. The page stays reachable by URL and from the summary panel.

---

## If something breaks

Run `python tools/check.py`. It reads every generated page and reports:

- unbalanced or unclosed tags
- links and images pointing at files that do not exist
- images with no `alt` text
- the few copy patterns this design rules out

If it prints `all pages check out`, the site is fine to push. If it does not,
it names the page and the problem, and the deploy would have failed anyway —
better to catch it here.
