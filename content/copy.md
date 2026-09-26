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

Ben Silver is a junior at Tufts University studying computer science with a
focus in biological sciences, with mass cytometry research at Mass General.

### home.identity

Junior at Tufts, studying computer science

### home.summary

Currently looking for a Summer 2027 internship

### home.education[0].label

Studying at

### home.education[0].value

> Studying at

Tufts University

### home.education[0].note

> Studying at

BA Computer Science

### home.education[1].label

Graduating

### home.education[1].value

> Graduating

May 2028

### home.education[1].note

> Graduating

Junior this fall

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

Mass cytometry at Mass General, and flexible electrode arrays at Sonkusale
Research Labs (Tufts) before that

### home.doors[1].label

Projects

### home.doors[1].desc

> Projects

CraveCast and TRACE. Two health tools both built with the intention to help
make people's lives easier and safer.

### home.doors[2].label

About

### home.doors[2].desc

> About

My academic interests and how I spend my time.

### home.doors[3].label

Contact

### home.doors[3].desc

> Contact

<span class="mark">silverbenh1@gmail.com</span> is the fastest way to reach me.

### home.doors[4].label

Hobbies

### home.doors[4].desc

> Hobbies

Leatherworking mostly, then bikes and more. Always developing new skills.

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

Applying what I learn in school to make a real difference has always been my
ultimate goal. I've spent time working in a physical lab and also in silico,
and the latter fascinates me: data can be used to reveal more data, an
interesting recursion.

### research.positions[0].name

Mass cytometry at the Vaccine &amp; Immunotherapy Center

### research.positions[0].org

> Mass cytometry at the Vaccine &amp; Immunotherapy Center

Massachusetts General Hospital, since July 2026

### research.positions[0].bullets

> Mass cytometry at the Vaccine &amp; Immunotherapy Center

Current mass cytometry clustering algorithms require manual inputs, the goal
of the project was to explore ways to minimize manual inputs. This would open
up the use of these mass cytometry tools to more people and help standardize
how the tools are used.

We built a Python pipeline that identifies immune cell populations across
vaccine stimulations to use as a tool to investigate how to augment these
algorithms to make them more user friendly. It handles the whole preprocessing
path in one pass: FCS parsing, arcsinh transformation, and dimensionality
reduction with PCA and UMAP.

We are looking to add biological validation metrics to the existing
clustering, so the population assignments are not just based in math, but also
in real biology.

Now extending it to new datasets (Flu & ALS), using X-shift to track changes
in population abundance and adapting the Shannon and Simpson diversity
notebooks I wrote for the first project.

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

Python, NumPy, scikit-learn, FlowSOM, OMIQ, X-shift, UMAP and PCA

### research.positions[1].name

Flexible electrode arrays at Sonkusale Research Labs

### research.positions[1].org

> Flexible electrode arrays at Sonkusale Research Labs

Tufts University, February to May 2026

### research.positions[1].bullets

> Flexible electrode arrays at Sonkusale Research Labs

I developed and validated fabrication protocols for flexible electrode arrays
built for wearable point-of-care diagnostics, and learned about our
microneedling project designed to work alongside the arrays.

At the bench, I characterised the signal across physiological conditions on
the bench and documented how different fabrication protocols affected the
results.

### research.positions[1].facts[0].label

Domain

### research.positions[1].facts[0].value

> Domain

Flexible bioelectronics for wearable, point-of-care diagnostics

### research.positions[1].images[0].alt

> Fabrication of sensors: carefully applying silver epoxy onto Polyimide. — Read aloud in place of the picture. Describe what is in the shot.

A gloved hand holding a syringe over a flexible electrode array, its five
leads taped down to the bench with yellow tape

### research.positions[1].images[0].caption

Fabrication of sensors: carefully applying silver epoxy onto Polyimide.

### research.positions[1].images[1].alt

> Average day in the lab — Read aloud in place of the picture. Describe what is in the shot.

Ben in gloves in the Sonkusale lab, with the bench behind him: a probe
station, reagent bottles, tools and finished arrays

### research.positions[1].images[1].caption

Average day in the lab

## Projects page

### projects.title

> Browser tab and search results. Not shown on the page.

Projects — Ben Silver

### projects.description

> Search results and link previews. Not shown on the page.

CraveCast, a craving forecaster for addiction recovery, and TRACE, allergen
detection for travellers and kids.

### projects.heading

Projects

### projects.lead

Two projects inspired by my life experiences.

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
entries.

It's a single-file HTML app on GitHub Pages. It works fully offline, with no
sign-up and no tracking, so nothing leaves the browser.

The idea came from a lung transplant observership at Mass General. COPD is one
of the most common reasons people need a lung transplant, and smoking is its
leading cause. Most recovery apps are either a plain logbook or a technical
dashboard, which make logging a chore. People attempting to break addiction
don't need any more hindrances, so I made a gamified version by adding streaks
and unlockables to encourage users to keep tracking.

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

TRACE

### projects.items[1].when

> TRACE

May 2026

### projects.items[1].paragraphs

> TRACE

TRACE takes a photo of a meal, flags likely allergens and gives a risk-level
warning.

It's a full-stack web app built with Python and Flask, with the Claude Vision
API handling the photo analysis. It remembers your allergies, and it's simple
enough for a child to use.

I grew up in Taiwan with a nut allergy. As a shy kid, navigating that in a
foreign country was hard and I'd often avoid asking about allergens out of
embarrassment or fear of getting the question wrong. Unfortunately, that's not
unique to being abroad; kids everywhere struggle to speak up for themselves.

Outside of just children, travellers also face issues with allergens when
encountering new foods abroad or struggling to communicate in a different
language. TRACE helps provide one extra level of comfort by giving you
guidance on how likely a food is to have an allergen.

### projects.items[1].facts[0].label

Built with

### projects.items[1].facts[0].value

> Built with

Python, Flask, Claude Vision API

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

I came to Tufts completely undecided on what I wanted to do with the rest of
my life. Over the past two years, I've spent my time exploring different
paths, eventually landing on Computer Science.

What fascinates me most is using data to uncover new discoveries, whether
that's predicting addiction craving times or analyzing large datasets to find
patterns in ALS and flu patients. I love learning different methods of
prediction and machine learning, and finding new ways to apply them.

Outside of classes and CS work, I'm an active member of the Tufts NSDC,
Taiwanese Association of Students at Tufts University, and Tufts SEDS. I also
work for Tufts Technology Services, helping researchers with their storage
needs.

One thing I love doing is picking up new hobbies. From leatherworking
(specifically wallet making) to mountain biking to knife sharpening and
restoration, I'm always adding some new random skill to my arsenal.

### about.sideHeading

What I'm working on

### about.current[0].where

Massachusetts General Hospital, Vaccine &amp; Immunotherapy Center

### about.current[0].what

> Massachusetts General Hospital, Vaccine &amp; Immunotherapy Center

Mass cytometry research (in silico), since July 2026

### about.current[1].where

On my own time

### about.current[1].what

> On my own time

CraveCast and TRACE

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

Medford, Massachusetts

### contact.rows[3].label

Usually replies

### contact.rows[3].value

> Usually replies

Within a day

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

What I like to do on a rainy Sunday afternoon

### hobbies.feature.name

Leatherworking

### hobbies.feature.blurb

My favorite of them all. The intense concentration it takes to get everything
perfect puts me in the zone and clears my mind of any distractions. Ask me
anything about leatherworking and be ready for 30 minutes of random
leatherworking facts you never asked for!

### hobbies.feature.compare.label

The same wallet, a year apart

### hobbies.feature.compare.items[0].tag

The first one

### hobbies.feature.compare.items[0].note

> The first one

It looks worn down, but that's just the skill level I was at back then.
Nothing lines up evenly, and the leather was fraying from day one.

### hobbies.feature.compare.items[0].alt

> The first one — Read aloud in place of the picture. Describe what is in the shot.

The first wallet, standing open: dark scuffed outer leather, uneven white
stitching and rough unburnished edges

### hobbies.feature.compare.items[1].tag

A year later

### hobbies.feature.compare.items[1].note

> A year later

Same pattern, same blue and tan but wildly different in quality. Cleaner
edges, more consistent stitching, and overall a more professional look.

### hobbies.feature.compare.items[1].alt

> A year later — Read aloud in place of the picture. Describe what is in the shot.

The second wallet in the same pose: navy outer leather with a tan interior,
regular white saddle stitching and clean burnished edges

### hobbies.feature.tiles[0].caption

Two (almost) perfectly symmetrical halves of the wallet.

### hobbies.feature.tiles[0].alt

> Two (almost) perfectly symmetrical halves of the wallet. — Read aloud in place of the picture. Describe what is in the shot.

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

Ten seconds of the wallet I made for my dad

### hobbies.feature.tiles[2].alt

> Ten seconds of the wallet I made for my dad — Read aloud in place of the picture. Describe what is in the shot.

A short clip of a finished leather wallet being opened and turned over in the
hand

### hobbies.feature.note

I draw my own patterns in Inkscape and prototype them in paper first, checking
the measurements before anything gets cut. You'll find me on YouTube
constantly learning new ways to get cleaner stitching, cuts, and edges.

### hobbies.second.name

Bikes

### hobbies.second.blurb

I ride a 2024 Niner AIR 9, and half the parts are upgraded from stock: brakes
bled and upgraded, a dropper post fitted, headset and drivetrain adjusted, and
the cassette upgraded. As annoying as it is when something breaks, I enjoy
spending my Sunday afternoon tweaking parts to get rid of the smallest squeak.

### hobbies.second.shots[0].caption

My upgraded Niner Air 9 2-Star, feel free to ask me about the specs if you are
interested :)

### hobbies.second.shots[0].alt

> My upgraded Niner Air 9 2-Star, feel free to ask me about the specs if you are interested :) — Read aloud in place of the picture. Describe what is in the shot.

A silver and blue Niner hardtail mountain bike leaning against a tree on a
wooded trail

### hobbies.second.shots[1].caption

My favorite part of the hobby.

### hobbies.second.shots[1].alt

> My favorite part of the hobby. — Read aloud in place of the picture. Describe what is in the shot.

A tool tray of bike gear: hex keys, cable cutters, screwdrivers, a brake
rotor, bleed kit and bagged spares

### hobbies.restLabel

Also, with less to show for them

### hobbies.rest[0].name

Gear trading

### hobbies.rest[0].body

> Gear trading

Hunting marketplace listings for anything from bike parts to furniture. I will
spend 2 hours searching just to save 10 dollars on a nightstand.

### hobbies.rest[1].name

Knife sharpening

### hobbies.rest[1].body

> Knife sharpening

Sharpening with whetstones and restoring knives. My most recent is my
grandfather's rusted deba all sharpened, sanded and polished to nearly brand
new, without losing the rustic feel.

### hobbies.rest[2].name

Taiwanese food

### hobbies.rest[2].body

> Taiwanese food

1. Danzai noodles 2. Taiwanese pork chop rice

### hobbies.rest[3].name

Tufts SEDS

### hobbies.rest[3].body

> Tufts SEDS

The L1 certification rocket with Tufts SEDS — designed, cut, assembled and
flown.

### hobbies.hunting.before

Currently hunting for

### hobbies.hunting.highlight

a Herman Miller Aeron under $100 that isn't a scam

### hobbies.hunting.after

and a pair of skis to try skiing this winter.

## At a glance

The panel behind the corner button.

### glance.button

At a glance

### glance.heading

At a glance

### glance.lead

An overview of everything I've done so far. Click into the links for more
detail.

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

TRACE

### glance.columns[2].items[1].body

> TRACE

Reads a photo of a meal for allergens and alerts you of likelihood.

### glance.columns[3].heading

Also

### glance.columns[3].link.label

> Also

More on the about page

### glance.columns[3].items[0].head

Tufts Technology Services

### glance.columns[3].items[0].body

> Tufts Technology Services

Research computing requests in one place, and a request workflow eliminating
wait times for 500+ daily users and researchers.

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
