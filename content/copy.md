# The whole portfolio, word for word

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

## Everywhere

The name in the corner, the link labels, the footer.

### site.name

Ben Silver

### site.githubLabel

github.com/ben-silv

### site.linkedinLabel

linkedin.com/in/bhsilver

### site.footerNote

Reach me at

## Home

The first page anyone lands on.

### home.title

> Browser tab and search results. Not shown on the page.

Ben Silver — computer science and biology at Tufts

### home.description

> Search results and link previews. Not shown on the page.

Ben Silver is a rising junior at Tufts University studying computer science
with a focus in biological sciences, with mass cytometry research at Mass
General.

### home.identity

Rising junior at Tufts, studying computer science with a focus in biological
sciences.

### home.summary

I like problems where the answer has to reach a person at the end of it. Most
of my work sits between software and biology. I'm looking for a Summer 2027
internship.

### home.education[0].label

Studying at

### home.education[0].value

> Studying at

Tufts University

### home.education[0].note

> Studying at

BA Computer Science, focus in Biological Sciences

### home.education[1].label

Graduating

### home.education[1].value

> Graduating

May 2028

### home.education[1].note

> Graduating

Third year this autumn

### home.education[2].label

Standing

### home.education[2].value

> Standing

Dean's List

### home.education[2].note

> Standing

3.9 GPA, every semester

### home.doors[0].label

Research

### home.doors[0].desc

> Research

Mass cytometry at Mass General, and flexible electrode arrays before that.
What the work produced, not how it was done.

### home.doors[1].label

Projects

### home.doors[1].desc

> Projects

CraveCast and EpiAlert. Two health tools, both built for a moment where
getting it wrong costs somebody something.

### home.doors[2].label

About

### home.doors[2].desc

> About

Where I came from, how the computer science and the biology ended up in the
same place, and where I'd like to take it.

### home.doors[3].label

Contact

### home.doors[3].desc

> Contact

<span class="mark">silverbenh1@gmail.com</span> is the fastest way to reach me.

### home.doors[4].label

Hobbies

### home.doors[4].desc

> Hobbies

Leatherworking mostly, then bikes. None of it has anything to do with work.

## Research page

### research.title

> Browser tab and search results. Not shown on the page.

Research — Ben Silver

### research.description

> Search results and link previews. Not shown on the page.

Mass cytometry at Mass General's Vaccine and Immunotherapy Center, and
flexible bioelectronics at Sonkusale Research Labs.

### research.heading

Research

### research.lead

Two labs so far. Both come down to the same question: can you trust what the
instrument told you, and can someone else get the same answer tomorrow?

### research.positions[0].name

Mass cytometry at the Vaccine &amp; Immunotherapy Center

### research.positions[0].org

> Mass cytometry at the Vaccine &amp; Immunotherapy Center

Massachusetts General Hospital, since July 2026

### research.positions[0].bullets

> Mass cytometry at the Vaccine &amp; Immunotherapy Center

Built a Python pipeline that identifies immune cell populations across vaccine
stimulations. It replaced work that was being done by hand, on datasets of
over a million cells with fifty-plus parameters each.

Handles the whole preprocessing path in one pass: FCS parsing, arcsinh
transformation, and dimensionality reduction with PCA and UMAP.

Added biological validation metrics to the existing clustering, so the
population assignments hold up when someone checks them.

Now extending it to new datasets, using X-shift to track changes in population
abundance and reusing the Shannon and Simpson diversity notebooks I wrote for
the first project.

### research.positions[0].facts[0].label

Working with

### research.positions[0].facts[0].value

> Working with

Richard Dzeng<br>Ethan Rabinowitz

### research.positions[0].facts[1].label

Scale

### research.positions[0].facts[1].value

> Scale

Fifty-plus parameters per cell, past a million events per dataset

### research.positions[0].facts[2].label

Method

### research.positions[0].facts[2].value

> Method

Python, NumPy, scikit-learn, FlowSOM, OMIQ, UMAP and PCA

### research.positions[1].name

Flexible electrode arrays at Sonkusale Research Labs

### research.positions[1].org

> Flexible electrode arrays at Sonkusale Research Labs

Tufts University, February to May 2026

### research.positions[1].bullets

> Flexible electrode arrays at Sonkusale Research Labs

Developed and validated fabrication protocols for flexible electrode arrays,
built for wearable point-of-care diagnostics.

Characterised the signal across physiological conditions on the bench, which
is how the failure points got found rather than guessed at.

Learned lab safety and protocol well enough to run bench work on my own.

### research.positions[1].facts[0].label

Domain

### research.positions[1].facts[0].value

> Domain

Flexible bioelectronics for wearable, point-of-care diagnostics

### research.positions[1].images[0].alt

> Dosing an array on the bench — Read aloud in place of the picture. Describe what is in the shot.

A gloved hand holding a syringe over a flexible electrode array, its five
leads taped down to the bench with yellow tape

### research.positions[1].images[0].caption

Dosing an array on the bench

### research.positions[1].images[1].alt

> The lab it happened in — Read aloud in place of the picture. Describe what is in the shot.

Ben in gloves in the Sonkusale lab, with the bench behind him: a probe
station, reagent bottles, tools and finished arrays

### research.positions[1].images[1].caption

The lab it happened in

## Projects page

### projects.title

> Browser tab and search results. Not shown on the page.

Projects — Ben Silver

### projects.description

> Search results and link previews. Not shown on the page.

CraveCast, a craving forecaster for addiction recovery, and EpiAlert, allergen
detection and epinephrine mapping for travellers.

### projects.heading

Projects

### projects.lead

Both of these started with a problem someone I know actually had. Neither is a
demo.

### projects.items[0].name

CraveCast

### projects.items[0].when

> CraveCast

September 2026

### projects.items[0].paragraphs

> CraveCast

CraveCast predicts high-risk windows for people in recovery, so they get a
warning before a craving hits rather than a log of it afterwards.

The prediction combines the peer-reviewed ADARP study with kernel density
estimation over a person's own logged cravings. It starts from the study's
population-level risk windows and gets more accurate as it learns from their
entries. Building it taught me the parts of machine learning that aren't in
the paper: choosing a bandwidth, deciding what counts as a signal, and working
out how to tell whether a prediction is any good.

It's a single-file HTML app on GitHub Pages. It works fully offline, with no
sign-up and no tracking, so nothing leaves the browser. That constraint shaped
most of the architecture.

The idea came from a lung transplant observership at Mass General. COPD is one
of the most common reasons people need a lung transplant, and smoking is its
leading cause. Most recovery apps are either a plain logbook or a clinical
dashboard, so I added streaks and unlockables — something people would keep
opening.

### projects.items[0].facts[0].label

Built with

### projects.items[0].facts[0].value

> Built with

HTML, JavaScript, Python, kernel density estimation

### projects.items[0].facts[1].label

Status

### projects.items[0].facts[1].value

> Status

Live, and open source

### projects.items[0].actions[0].label

Open the app

### projects.items[0].actions[1].label

Read the source

### projects.items[1].name

EpiAlert

### projects.items[1].when

> EpiAlert

May 2026

### projects.items[1].paragraphs

> EpiAlert

EpiAlert reads a photo of a meal, flags likely allergens and gives a
risk-level warning. It also maps nearby pharmacies and hospitals that stock
epinephrine auto-injectors.

It's a full-stack web app: Python and Flask, with the Claude Vision API doing
the photo analysis and the Google Maps API the map. It remembers your
allergies, and it's simple enough for a child to use at the table.

I grew up in Taiwan with a nut allergy. You learn over time that pad thai
often has crushed peanuts in it and that a lot of Indian curries are thickened
with cashews, but a kid doesn't know that and won't ask a waiter. It's a first
check and not a verdict, and it's most useful travelling, when you can't be
sure the question got across.

I cut a peer-response feed late in development. Crowd-sourced safety data is a
liability when the failure mode is anaphylaxis.

### projects.items[1].facts[0].label

Built with

### projects.items[1].facts[0].value

> Built with

Python, Flask, Claude Vision API, Google Maps API

### projects.items[1].facts[1].label

Status

### projects.items[1].facts[1].value

> Status

Repository private, happy to walk through it

### projects.items[1].actions[0].label

Ask me for a demo

## About page

### about.title

> Browser tab and search results. Not shown on the page.

About — Ben Silver

### about.description

> Search results and link previews. Not shown on the page.

Computer science and biology at Tufts, research computing at Tufts Technology
Services, and where Ben Silver would like this to go next.

### about.heading

About

### about.paragraphs

I came to Tufts for computer science and added a focus in biological sciences
once biology turned out to be the part I couldn't stop reading about. The two
looked unrelated for about a year, and then stopped being unrelated at all.

I grew up in a Taiwanese-American household, where the answer to most
questions was to take the lid off and look. That's still how I work. A bike
that shifts badly gets stripped down, a knife that won't cut gets a whetstone,
and a dataset with a million immune cells in it gets a pipeline until the
clusters mean something.

At Tufts Technology Services I build tooling for research computing. I helped
launch and test a new site that puts every research computing request in one
place, running on ColdFront, so researchers can manage their own storage. I
also replaced a request workflow that staff had been typing out by hand with
one that takes a paste and formats it from templates — about 25% faster per
request, and one format for everything.

What I'm interested in is using data to find patterns and make predictions.
Data is one big haystack and computer science is the magnet. Biotech and
healthcare data are where I'd most like that to land, though the same work
applies to data science and analysis anywhere.

### about.sideHeading

What I'm working on

### about.current[0].where

Massachusetts General Hospital, Vaccine &amp; Immunotherapy Center

### about.current[0].what

> Massachusetts General Hospital, Vaccine &amp; Immunotherapy Center

Mass cytometry research, since July 2026

### about.current[1].where

On my own time

### about.current[1].what

> On my own time

CraveCast and EpiAlert

### about.current[2].where

Tufts Technology Services

### about.current[2].what

> Tufts Technology Services

Research Computing Student Specialist, since April 2025

### about.pointer

Research and projects each have a page of their own. The corner button puts
all of it on one screen, from wherever you are.

## Contact page

### contact.title

> Browser tab and search results. Not shown on the page.

Contact — Ben Silver

### contact.description

> Search results and link previews. Not shown on the page.

Email, GitHub and LinkedIn for Ben Silver.

### contact.heading

Contact

### contact.lead

Email is the fastest way to reach me. I read everything, and I'd rather hear
from a person than a form.

### contact.actions[0].label

Email me

### contact.actions[1].label

Download resume

### contact.rows[0].label

GitHub

### contact.rows[0].value

> GitHub

github.com/ben-silv

### contact.rows[1].label

LinkedIn

### contact.rows[1].value

> LinkedIn

linkedin.com/in/bhsilver

### contact.rows[2].label

Based in

### contact.rows[2].value

> Based in

Medford and Boston, Massachusetts

### contact.rows[3].label

Usually replies

### contact.rows[3].value

> Usually replies

Within a day or two, sooner if it is about research

## Hobbies page

### hobbies.title

> Browser tab and search results. Not shown on the page.

Hobbies — Ben Silver

### hobbies.description

> Search results and link previews. Not shown on the page.

Leatherworking, bikes, gear trading, whetstones and model rocketry. Nothing to
do with work.

### hobbies.heading

Hobbies

### hobbies.lead

None of this is a transferable skill. It's just what I do when nobody's paying
me.

### hobbies.feature.name

Leatherworking

### hobbies.feature.blurb

The one I could talk about for an hour. It's slow work, and the details are
the whole thing: even stitching, matching cuts, edges finished properly. A
mistake is permanent the second you make it.

### hobbies.feature.compare.label

The same wallet, a year apart

### hobbies.feature.compare.items[0].tag

The first one

### hobbies.feature.compare.items[0].note

> The first one

Two years of pocket wear on it, but the stitching wandered and the edges were
never finished properly to begin with.

### hobbies.feature.compare.items[0].alt

> The first one — Read aloud in place of the picture. Describe what is in the shot.

The first wallet, standing open: dark scuffed outer leather, uneven white
stitching and rough unburnished edges

### hobbies.feature.compare.items[1].tag

A year later

### hobbies.feature.compare.items[1].note

> A year later

Same pattern, same blue and tan. Even stitch spacing, square corners, edges
that hold their shape.

### hobbies.feature.compare.items[1].alt

> A year later — Read aloud in place of the picture. Describe what is in the shot.

The second wallet in the same pose: navy outer leather with a tan interior,
regular white saddle stitching and clean burnished edges

### hobbies.feature.tiles[0].caption

Six card slots, all the same size, which is the hard part

### hobbies.feature.tiles[0].alt

> Six card slots, all the same size, which is the hard part — Read aloud in place of the picture. Describe what is in the shot.

The second wallet open flat, showing six tan card slots stitched in white
thread

### hobbies.feature.tiles[1].caption

Patterns I draw in Inkscape, cut in paper and fitted before anything touches
the leather

### hobbies.feature.tiles[1].alt

> Patterns I draw in Inkscape, cut in paper and fitted before anything touches the leather — Read aloud in place of the picture. Describe what is in the shot.

Six paper pattern pieces laid out on a sheet of black leather over a gridded
cutting mat

### hobbies.feature.tiles[2].caption

Ten seconds of a finished one

### hobbies.feature.tiles[2].alt

> Ten seconds of a finished one — Read aloud in place of the picture. Describe what is in the shot.

A short clip of a finished leather wallet being opened and turned over in the
hand

### hobbies.feature.note

I draw my own patterns and prototype them in paper first, checking the
measurements before anything gets cut. Most of what improved between those two
wallets is that I stopped guessing.

### hobbies.second.name

Bikes

### hobbies.second.blurb

I ride a 2024 Niner AIR 9, and most of what's on it now I put there myself:
brakes bled and upgraded, a dropper post fitted, headset and gears adjusted,
and the cassette swapped from SRAM SX to NX. The fixing is the half I like
best. That extends to cable ends that match the frame, which nobody notices
but me.

### hobbies.second.shots[0].caption

The Niner, most of it upgraded from where it started

### hobbies.second.shots[0].alt

> The Niner, most of it upgraded from where it started — Read aloud in place of the picture. Describe what is in the shot.

A silver and blue Niner hardtail mountain bike leaning against a tree on a
wooded trail

### hobbies.second.shots[1].caption

The other half of the hobby

### hobbies.second.shots[1].alt

> The other half of the hobby — Read aloud in place of the picture. Describe what is in the shot.

A tool tray of bike gear: hex keys, cable cutters, screwdrivers, a brake
rotor, bleed kit and bagged spares

### hobbies.restLabel

Also, with less to show for them

### hobbies.rest[0].name

Gear trading

### hobbies.rest[0].body

> Gear trading

Hunting marketplace listings for bike parts. I'll find the used one — usually
half the price, and in better shape than the listing suggests.

### hobbies.rest[1].name

Knife sharpening

### hobbies.rest[1].body

> Knife sharpening

Whetstones and a consistent angle, until the edge bites paper. The one I'm
proudest of is my grandfather's deba, the knife he filleted fish with, brought
back from blunt.

### hobbies.rest[2].name

Taiwanese food

### hobbies.rest[2].body

> Taiwanese food

Danzai noodles first, Taiwanese pork chop rice second. I'll argue about both.

### hobbies.rest[3].name

Model rocketry

### hobbies.rest[3].body

> Model rocketry

The L1 certification rocket with Tufts SEDS — designed, cut, assembled and
flown.

### hobbies.hunting.before

Currently hunting for

### hobbies.hunting.highlight

a used wheelset that isn't a scam

### hobbies.hunting.after

and a shoulder of veg-tan I can justify.

## At a glance

The panel behind the corner button.

### glance.button

At a glance

### glance.heading

At a glance

### glance.lead

Everything on one screen, for anyone who has two minutes rather than ten. The
full version of each is a page of its own.

### glance.columns[0].heading

Studying

### glance.columns[0].items[0].head

Tufts University, class of 2028

### glance.columns[0].items[0].body

> Tufts University, class of 2028

BA Computer Science, focus in Biological Sciences. Rising junior.

### glance.columns[0].items[1].head

Dean's List, 3.9 GPA

### glance.columns[0].items[1].body

> Dean's List, 3.9 GPA

Every semester so far.

### glance.columns[1].heading

Research

### glance.columns[1].link.label

> Research

The full research page

### glance.columns[1].items[0].head

Mass General, Vaccine &amp; Immunotherapy Center

### glance.columns[1].items[0].body

> Mass General, Vaccine &amp; Immunotherapy Center

A Python pipeline that identifies immune cell populations, on datasets of over
a million cells.

### glance.columns[1].items[1].head

Sonkusale Research Labs

### glance.columns[1].items[1].body

> Sonkusale Research Labs

Fabrication protocols the group can repeat, from benchtop signal
characterisation.

### glance.columns[2].heading

Projects

### glance.columns[2].link.label

> Projects

The full projects page

### glance.columns[2].items[0].head

CraveCast

### glance.columns[2].items[0].body

> CraveCast

Predicts high-risk windows for people in recovery. Offline, live, open source.

### glance.columns[2].items[1].head

EpiAlert

### glance.columns[2].items[1].body

> EpiAlert

Reads a photo of a meal for allergens, with the nearest epinephrine on the
same screen.

### glance.columns[3].heading

Also

### glance.columns[3].link.label

> Also

More on the about page

### glance.columns[3].items[0].head

Tufts Technology Services

### glance.columns[3].items[0].body

> Tufts Technology Services

Research computing requests in one place, and a request workflow about 25%
faster, for 500+ daily users.

### glance.columns[3].items[1].head

Teaching and building

### glance.columns[3].items[1].body

> Teaching and building

Python workshops for thirty-odd students, and an L1 certification rocket that
flew.

### glance.actions[0].label

Download resume

### glance.actions[1].label

Contact

## 404 page

What someone sees at an address that does not exist.

### notFound.title

> Browser tab and search results. Not shown on the page.

Page not found — Ben Silver

### notFound.heading

That page doesn't exist.

### notFound.lead

Which is on me, not you. Everything lives behind one of these.
