#!/usr/bin/env python3
"""Take the audio track out of an MP4.

    python tools/mute.py content/leatherworking/walletvid.mp4 assets/leather-wallet.mp4

A phone clip of someone working carries whatever was being said in the room,
and none of these are here to be listened to. Muting in the markup only asks
the player nicely; this removes the track, so there is nothing to unmute.

How: an MP4 keeps a description of each track in a "trak" box, and a box named
"free" is one every player skips. Renaming the audio trak to free, in place, is
a four-byte edit — every other byte, and so every offset in the file, stays
exactly where it was. The audio samples are left stranded in the media blob
with nothing pointing at them; on a phone clip that is a few hundred kilobytes
of a very much larger file, and reclaiming them would mean rewriting every
offset in it.

Standard library only. No encoder needed, and the picture is never re-encoded.
"""

import shutil
import sys


def boxes(buf, start, end):
    """Walk the boxes between two offsets, yielding (type, offset, size)."""
    pos = start
    while pos + 8 <= end:
        size = int.from_bytes(buf[pos:pos + 4], "big")
        kind = buf[pos + 4:pos + 8]
        if size == 1:                       # 64-bit size follows the header
            size = int.from_bytes(buf[pos + 8:pos + 16], "big")
        elif size == 0:                     # runs to the end of its parent
            size = end - pos
        if size < 8 or pos + size > end:
            return
        yield kind, pos, size
        pos += size


def handler_of(buf, trak_start, trak_end):
    """The four-character handler of a trak: vide, soun, and so on."""
    for kind, off, size in boxes(buf, trak_start, trak_end):
        if kind != b"mdia":
            continue
        for k2, o2, s2 in boxes(buf, off + 8, off + size):
            if k2 == b"hdlr":
                return buf[o2 + 16:o2 + 20]
    return None


def mute(src, dest):
    if src != dest:
        shutil.copyfile(src, dest)

    with open(dest, "rb") as fh:
        buf = bytearray(fh.read())

    dropped = 0
    for kind, off, size in boxes(buf, 0, len(buf)):
        if kind != b"moov":
            continue
        for k2, o2, s2 in boxes(buf, off + 8, off + size):
            if k2 == b"trak" and handler_of(buf, o2 + 8, o2 + s2) == b"soun":
                buf[o2 + 4:o2 + 8] = b"free"
                dropped += 1

    if not dropped:
        print("no audio track in %s — left alone" % src)
        return 0

    with open(dest, "wb") as fh:
        fh.write(buf)
    print("removed %d audio track%s from %s" % (dropped, "" if dropped == 1 else "s", dest))
    return dropped


if __name__ == "__main__":
    if len(sys.argv) not in (2, 3):
        sys.exit(__doc__)
    source = sys.argv[1]
    mute(source, sys.argv[2] if len(sys.argv) == 3 else source)
