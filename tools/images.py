#!/usr/bin/env python3
"""Turn a photo off a phone into a web asset.

    python tools/images.py content/leatherworking/new1.jpeg assets/leather-x.jpg --max 1100 --square

Phone photos arrive at 3000px and several megabytes, often with an orientation
flag instead of actual rotation. This applies the rotation, crops if asked,
resizes, strips the metadata (which includes where the photo was taken) and
saves a progressive JPEG.

Local authoring only — it needs Pillow and is not part of the build. The deploy
runs tools/render.py and tools/check.py, both standard library, and never this.
"""

import argparse
import os
import sys

try:
    from PIL import Image, ImageOps
except ImportError:
    sys.exit("This one needs Pillow:  pip install Pillow")


def convert(src, dest, longest, square=False, crop=None, quality=82):
    im = ImageOps.exif_transpose(Image.open(src)).convert("RGB")

    if crop:
        l, t, r, b = crop
        im = im.crop((int(l * im.width), int(t * im.height),
                      int(r * im.width), int(b * im.height)))
    if square:
        side = min(im.width, im.height)
        im = im.crop(((im.width - side) // 2, (im.height - side) // 2,
                      (im.width + side) // 2, (im.height + side) // 2))

    im.thumbnail((longest, longest), Image.LANCZOS)

    os.makedirs(os.path.dirname(dest) or ".", exist_ok=True)
    im.save(dest, "JPEG", quality=quality, optimize=True, progressive=True)

    print("%-34s %sx%s  %.0fkB  (from %.1fMB)"
          % (os.path.basename(dest), im.width, im.height,
             os.path.getsize(dest) / 1e3, os.path.getsize(src) / 1e6))


def main():
    ap = argparse.ArgumentParser(description=__doc__)
    ap.add_argument("src")
    ap.add_argument("dest")
    ap.add_argument("--max", type=int, default=1200, help="longest side, px")
    ap.add_argument("--square", action="store_true", help="centre-crop to 1:1")
    ap.add_argument("--crop", help="left,top,right,bottom as 0-1 fractions")
    ap.add_argument("--quality", type=int, default=82)
    args = ap.parse_args()

    crop = [float(n) for n in args.crop.split(",")] if args.crop else None
    convert(args.src, args.dest, args.max, args.square, crop, args.quality)


if __name__ == "__main__":
    main()
