"""Server-side share card: static layers (rendered from the client card) + dynamic text drawn to match its CSS."""
import io
import math
from functools import lru_cache
from pathlib import Path
from PIL import Image, ImageDraw, ImageFilter, ImageFont

ASSETS = Path(__file__).parent / "card_assets"
W, H = 1080, 1920


@lru_cache(maxsize=None)
def _layers():
    return Image.open(ASSETS / "base.png").convert("RGBA"), Image.open(ASSETS / "overlay.png").convert("RGBA")


@lru_cache(maxsize=256)
def font(kind: str, size: float):
    files = {"cg": "CormorantGaramond.woff2", "cgi": "CormorantGaramond-Italic.woff2",
             "cg600": "CormorantGaramond.woff2", "sc600": "CormorantSC-600.woff2"}
    f = ImageFont.truetype(str(ASSETS / "fonts" / files[kind]), size=round(size * 64) / 64)
    if kind == "cg600":
        f.set_variation_by_axes([600])
    elif kind in ("cg", "cgi"):
        f.set_variation_by_axes([500])
    return f


def text_width(text, f, ls):
    return sum(f.getlength(c) for c in text) + ls * len(text)


def content_baseline(f, line_top, lh):
    a, d = f.getmetrics()
    return line_top + (lh - (a + d)) / 2 + a


def draw_line(mask, text, f, x, baseline, ls):
    d = ImageDraw.Draw(mask)
    for c in text:
        d.text((x, baseline), c, font=f, fill=255, anchor="ls")
        x += f.getlength(c) + ls


def fit(texts, kind, mx, mn, step, width, ls_em):
    s = mx
    while s > mn and max(text_width(t, font(kind, s), s * ls_em) for t in texts) > width * 1.01:
        s -= step
    return s


def paint(card, mask, color, shadows=()):
    for (dx, dy, blur, rgba) in shadows:
        sh = mask.filter(ImageFilter.GaussianBlur(blur / 2)) if blur else mask
        layer = Image.new("RGBA", card.size, rgba[:3] + (0,))
        alpha = sh.point(lambda v, a=rgba[3]: int(v * a))
        layer.putalpha(alpha)
        card.alpha_composite(layer, (dx, dy))
    solid = Image.new("RGBA", card.size, color + (0,))
    solid.putalpha(mask)
    card.alpha_composite(solid)


def hexrgb(h):
    h = h.lstrip("#")
    return tuple(int(h[i:i + 2], 16) for i in (0, 2, 4))


def star(mask, cx, cy, r, inner):
    pts = []
    for i in range(8):
        ang = -math.pi / 2 + i * math.pi / 4
        rad = r if i % 2 == 0 else inner
        pts.append((cx + rad * math.cos(ang), cy + rad * math.sin(ang)))
    ImageDraw.Draw(mask).polygon(pts, fill=255)


def render_card(name: str, number: str, line1: str, line2: str, woven, site: str, credit: str) -> bytes:
    base, over = _layers()
    card = base.copy()
    new = lambda: Image.new("L", (W, H), 0)  # noqa: E731

    # Name
    nm = name.upper()
    s = fit([nm], "cg", 104, 40, 2, 440, 0.06)
    f, ls = font("cg", s), s * 0.06
    m = new()
    draw_line(m, nm, f, (W + ls - text_width(nm, f, ls)) / 2, content_baseline(f, 932, s), ls)
    paint(card, m, hexrgb("f6e9cf"), [(0, 4, 18, (20, 10, 5, .75)), (0, 0, 1, (255, 240, 210, .6))])

    # Strands under the name
    s = fit([line1, line2], "sc600", 20, 12, 1, 400, 0.12)
    f, ls, lh = font("sc600", s), s * 0.12, s * 1.45
    m = new()
    for i, t in enumerate([line1, line2]):
        draw_line(m, t, f, 540 - text_width(t, f, ls) / 2, content_baseline(f, 1070 + i * lh, lh), ls)
    paint(card, m, hexrgb("ecd9b4"), [(0, 2, 8, (10, 5, 3, .8))])

    # His number 04✦17
    f, ls = font("cg", 112), 2.24
    a, b = number[:2], number[2:]
    wa, wb, wst = text_width(a, f, ls), text_width(b, f, ls), 28.875
    x0 = 540 - (wa + 3.36 + wst + 3.36 + wb) / 2
    bl = 1575 + f.getmetrics()[0]
    m = new()
    draw_line(m, a, f, x0, bl, ls)
    draw_line(m, b, f, x0 + wa + 3.36 + wst + 3.36, bl, ls)
    paint(card, m, hexrgb("3A2420"))
    m = new()
    star(m, x0 + wa + 3.36 + 13.5, 1606, 12, 4.8)
    paint(card, m, hexrgb("9C3D4F"))

    # Woven from (two caps lines) + site line
    l1, l2 = f"{woven[0]}, {woven[1]},".upper(), f"& {woven[2]}".upper()
    s = fit([l1, l2], "cg600", 29, 16, 1, 524, 0.04)
    f, ls, lh = font("cg600", s), s * 0.04, s * 1.08
    m = new()
    for i, t in enumerate([l1, l2]):
        draw_line(m, t, f, 348, content_baseline(f, 1738 + i * lh, lh), ls)
    paint(card, m, hexrgb("3A2420"))
    url = f"(Weave yours at {site})"
    s2 = fit([url], "sc600", 19, 11, 1, 524, 0.12)
    f2 = font("sc600", s2)
    a2, d2 = f2.getmetrics()
    m = new()
    draw_line(m, url, f2, 348, 1738 + 2 * lh + 8 + a2, s2 * 0.12)
    paint(card, m, hexrgb("5A3D34"))

    # Credit line
    f = font("cgi", 21)
    a3, d3 = f.getmetrics()
    m = new()
    draw_line(m, credit, f, 540 - text_width(credit, f, 0.42) / 2, 1872 + (48 - (a3 + d3)) / 2 + a3, 0.42)
    paint(card, m, hexrgb("cdb79c"))

    card.alpha_composite(over)
    out = io.BytesIO()
    card.convert("RGB").save(out, "PNG", optimize=False, compress_level=6)
    return out.getvalue()


def og_jpeg(png: bytes) -> bytes:
    im = Image.open(io.BytesIO(png)).convert("RGB").resize((720, 1280), Image.LANCZOS)
    buf = io.BytesIO()
    im.save(buf, "JPEG", quality=82, optimize=True)
    return buf.getvalue()
