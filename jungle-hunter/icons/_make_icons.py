#!/usr/bin/env python3
"""Generates icon-192.png and icon-512.png using only stdlib (struct + zlib).

Produces a stylized hunter icon: green rounded background, gold sun,
tree silhouette, deer silhouette, gold crosshair, and a banner.
"""
import math, struct, zlib, os

W = 512
GREEN_BG_TOP = (31, 122, 82)
GREEN_BG_BOT = (10, 31, 21)
GOLD = (244, 196, 48)
GOLD_DARK = (184, 134, 11)
DARK = (10, 31, 21)
TREE_DARK = (21, 95, 63)
TREE_MID = (31, 122, 82)
TRUNK = (90, 58, 31)
DEER = (42, 26, 10)


def lerp(a, b, t): return int(a + (b - a) * t)
def lerpc(c1, c2, t): return (lerp(c1[0], c2[0], t), lerp(c1[1], c2[1], t), lerp(c1[2], c2[2], t))


def make_image(size):
    pixels = bytearray(size * size * 4)
    for y in range(size):
        for x in range(size):
            i = (y * size + x) * 4
            # Background gradient
            t = y / size
            r, g, b = lerpc(GREEN_BG_TOP, GREEN_BG_BOT, t)
            pixels[i:i+4] = bytes([r, g, b, 255])
    return pixels


def in_rounded_rect(x, y, rx, ry, rw, rh, radius):
    # axis-aligned rounded rect inside check, returns 1 if outside
    cx = max(rx + radius, min(rx + rw - radius, x))
    cy = max(ry + radius, min(ry + rh - radius, y))
    return (x - cx) ** 2 + (y - cy) ** 2 <= radius * radius


def set_pixel(pixels, size, x, y, color, alpha=255):
    if x < 0 or y < 0 or x >= size or y >= size:
        return
    i = (int(y) * size + int(x)) * 4
    if alpha == 255:
        pixels[i] = color[0]; pixels[i+1] = color[1]; pixels[i+2] = color[2]; pixels[i+3] = 255
    else:
        a = alpha / 255
        pixels[i] = int(pixels[i] * (1 - a) + color[0] * a)
        pixels[i+1] = int(pixels[i+1] * (1 - a) + color[1] * a)
        pixels[i+2] = int(pixels[i+2] * (1 - a) + color[2] * a)
        pixels[i+3] = 255


def fill_circle(pixels, size, cx, cy, r, color):
    r2 = r * r
    for y in range(int(cy - r - 1), int(cy + r + 2)):
        for x in range(int(cx - r - 1), int(cx + r + 2)):
            d2 = (x - cx) ** 2 + (y - cy) ** 2
            if d2 <= r2:
                set_pixel(pixels, size, x, y, color)
            elif d2 <= (r + 1) ** 2:
                # smooth edge
                d = math.sqrt(d2)
                a = max(0, 1 - (d - r))
                set_pixel(pixels, size, x, y, color, int(a * 255))


def fill_ellipse(pixels, size, cx, cy, rx, ry, color):
    for y in range(int(cy - ry - 1), int(cy + ry + 2)):
        for x in range(int(cx - rx - 1), int(cx + rx + 2)):
            v = ((x - cx) / rx) ** 2 + ((y - cy) / ry) ** 2
            if v <= 1:
                set_pixel(pixels, size, x, y, color)


def fill_rect(pixels, size, x0, y0, w, h, color):
    for y in range(int(y0), int(y0 + h)):
        for x in range(int(x0), int(x0 + w)):
            set_pixel(pixels, size, x, y, color)


def fill_rounded_rect(pixels, size, x0, y0, w, h, radius, color):
    for y in range(int(y0), int(y0 + h)):
        for x in range(int(x0), int(x0 + w)):
            cx = max(x0 + radius, min(x0 + w - radius, x))
            cy = max(y0 + radius, min(y0 + h - radius, y))
            d2 = (x - cx) ** 2 + (y - cy) ** 2
            if d2 <= radius ** 2:
                set_pixel(pixels, size, x, y, color)


def stroke_circle(pixels, size, cx, cy, r, color, thickness=4):
    inner = (r - thickness) ** 2
    outer = r * r
    for y in range(int(cy - r - 1), int(cy + r + 2)):
        for x in range(int(cx - r - 1), int(cx + r + 2)):
            d2 = (x - cx) ** 2 + (y - cy) ** 2
            if inner <= d2 <= outer:
                set_pixel(pixels, size, x, y, color)


def stroke_line(pixels, size, x1, y1, x2, y2, color, thickness=4):
    # Thick line via squared distance to segment
    dx = x2 - x1
    dy = y2 - y1
    L2 = dx * dx + dy * dy
    if L2 == 0:
        return
    t_thick = thickness / 2
    minx, maxx = min(x1, x2) - thickness, max(x1, x2) + thickness
    miny, maxy = min(y1, y2) - thickness, max(y1, y2) + thickness
    for y in range(int(miny), int(maxy + 1)):
        for x in range(int(minx), int(maxx + 1)):
            t = ((x - x1) * dx + (y - y1) * dy) / L2
            t = max(0, min(1, t))
            px = x1 + t * dx
            py = y1 + t * dy
            d = math.hypot(x - px, y - py)
            if d <= t_thick:
                set_pixel(pixels, size, x, y, color)


def make_icon(size):
    pixels = make_image(size)
    # Apply rounded-rect mask: pixels outside the rounded rect become fully transparent black
    radius = int(size * 0.18)
    for y in range(size):
        for x in range(size):
            cx = max(radius, min(size - radius, x))
            cy = max(radius, min(size - radius, y))
            d2 = (x - cx) ** 2 + (y - cy) ** 2
            if d2 > radius * radius:
                i = (y * size + x) * 4
                pixels[i:i+4] = bytes([0, 0, 0, 0])

    s = size / 512.0
    # Sun
    fill_circle(pixels, size, int(380 * s), int(140 * s), int(50 * s), GOLD)
    # Tree
    fill_rect(pixels, size, int(120 * s), int(290 * s), int(22 * s), int(80 * s), TRUNK)
    fill_circle(pixels, size, int(131 * s), int(270 * s), int(62 * s), TREE_DARK)
    fill_circle(pixels, size, int(105 * s), int(240 * s), int(32 * s), TREE_MID)
    fill_circle(pixels, size, int(160 * s), int(245 * s), int(34 * s), TREE_MID)
    # Deer (centered around 280, 320)
    cx, cy = 280, 320
    fill_ellipse(pixels, size, int(cx * s), int(cy * s), int(68 * s), int(32 * s), DEER)
    fill_ellipse(pixels, size, int((cx + 55) * s), int((cy - 8) * s), int(22 * s), int(18 * s), DEER)
    # Antlers
    stroke_line(pixels, size, int((cx + 62) * s), int((cy - 22) * s), int((cx + 75) * s), int((cy - 52) * s), DEER, max(3, int(6 * s)))
    stroke_line(pixels, size, int((cx + 75) * s), int((cy - 52) * s), int((cx + 66) * s), int((cy - 50) * s), DEER, max(3, int(6 * s)))
    stroke_line(pixels, size, int((cx + 62) * s), int((cy - 22) * s), int((cx + 80) * s), int((cy - 36) * s), DEER, max(3, int(6 * s)))
    stroke_line(pixels, size, int((cx + 70) * s), int((cy - 16) * s), int((cx + 96) * s), int((cy - 28) * s), DEER, max(3, int(6 * s)))
    # Legs
    for lx in [-44, -22, 14, 36]:
        fill_rect(pixels, size, int((cx + lx) * s), int((cy + 22) * s), int(8 * s), int(28 * s), DEER)
    # Crosshair
    crx, cry = 256, 256
    stroke_circle(pixels, size, int(crx * s), int(cry * s), int(60 * s), GOLD, max(3, int(6 * s)))
    stroke_line(pixels, size, int((crx - 72) * s), int(cry * s), int((crx - 30) * s), int(cry * s), GOLD, max(3, int(6 * s)))
    stroke_line(pixels, size, int((crx + 30) * s), int(cry * s), int((crx + 72) * s), int(cry * s), GOLD, max(3, int(6 * s)))
    stroke_line(pixels, size, int(crx * s), int((cry - 72) * s), int(crx * s), int((cry - 30) * s), GOLD, max(3, int(6 * s)))
    stroke_line(pixels, size, int(crx * s), int((cry + 30) * s), int(crx * s), int((cry + 72) * s), GOLD, max(3, int(6 * s)))
    # Title strip
    fill_rounded_rect(pixels, size, int(56 * s), int(420 * s), int(400 * s), int(56 * s), int(14 * s), DARK)
    # Border on title strip
    for off in range(max(2, int(3 * s))):
        stroke_line(pixels, size, int(56 * s) + off, int(420 * s) + off, int(456 * s) - off, int(420 * s) + off, GOLD, 1)
        stroke_line(pixels, size, int(56 * s) + off, int(476 * s) - off, int(456 * s) - off, int(476 * s) - off, GOLD, 1)
        stroke_line(pixels, size, int(56 * s) + off, int(420 * s) + off, int(56 * s) + off, int(476 * s) - off, GOLD, 1)
        stroke_line(pixels, size, int(456 * s) - off, int(420 * s) + off, int(456 * s) - off, int(476 * s) - off, GOLD, 1)
    # Letter blocks for "JUNGLE HUNTER" - simplified pixel font (just gold dashes hinting at text)
    # We'll render bold gold dashes pattern
    bx = int(76 * s); by = int(440 * s); bh = int(18 * s)
    for i, w in enumerate([18, 10, 18, 18, 8, 18, 8, 28, 18, 8, 18, 18, 18, 18]):
        fill_rect(pixels, size, bx, by, int(w * s), bh, GOLD)
        bx += int((w + 4) * s)
        if i == 6:
            bx += int(8 * s)  # space between words

    return pixels


def write_png(path, pixels, size):
    def chunk(tag, data):
        return (struct.pack('>I', len(data)) + tag + data +
                struct.pack('>I', zlib.crc32(tag + data) & 0xffffffff))

    raw = bytearray()
    for y in range(size):
        raw.append(0)  # filter type 0
        raw += pixels[y * size * 4: (y + 1) * size * 4]

    with open(path, 'wb') as f:
        f.write(b'\x89PNG\r\n\x1a\n')
        ihdr = struct.pack('>IIBBBBB', size, size, 8, 6, 0, 0, 0)
        f.write(chunk(b'IHDR', ihdr))
        f.write(chunk(b'IDAT', zlib.compress(bytes(raw), 9)))
        f.write(chunk(b'IEND', b''))


if __name__ == '__main__':
    here = os.path.dirname(os.path.abspath(__file__))
    for sz in (192, 512):
        print(f'Generating icon-{sz}.png ...')
        px = make_icon(sz)
        write_png(os.path.join(here, f'icon-{sz}.png'), px, sz)
    print('Done.')
