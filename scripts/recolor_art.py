"""Recolour storyboard SVG art (vector fills and embedded rasters) from Bloom to Willow & Mist."""
import base64, io, re, sys, glob, os
import numpy as np
from PIL import Image

SRC = "/app/scripts/art_bloom"
DST = "/app/frontend/public/art"
OVERRIDE = {"#e9b468": "#B89366", "#f2c987": "#C9AC7E", "#ecd5d5": "#6E7C68", "#ffffff": "#F1ECE1", "#3a2420": "#2A211B", "#9c3d4f": "#6B2E36"}
OVERRIDE.update({k.lower(): v for k, v in (dict(a.split("=") for a in sys.argv[1:]) if len(sys.argv) > 1 else {}).items()})


def shift(rgb):
    """rgb: float array (...,3) 0-1 -> recoloured."""
    r, g, b = rgb[..., 0], rgb[..., 1], rgb[..., 2]
    mx, mn = rgb.max(-1), rgb.min(-1)
    v, d = mx, mx - mn
    s = np.where(mx > 0, d / np.maximum(mx, 1e-6), 0)
    h = np.zeros_like(mx)
    m = d > 1e-6
    rc = np.where(m, (mx - r) / np.maximum(d, 1e-6), 0); gc = np.where(m, (mx - g) / np.maximum(d, 1e-6), 0); bc = np.where(m, (mx - b) / np.maximum(d, 1e-6), 0)
    h = np.where(r == mx, bc - gc, np.where(g == mx, 2 + rc - bc, 4 + gc - rc))
    h = (h / 6.0) % 1.0 * 360
    H, S, V = h.copy(), s.copy(), v.copy()
    pink = ((h >= 290) | (h < 14)) & (s > 0.10)
    light = ((h >= 290) | (h < 14)) & (s > 0.03) & (v > 0.78) & (s < 0.4)
    pink = pink | light
    H = np.where(light, 75, H); S = np.where(light, s * 0.45, S); V = np.where(light, v * 0.93, V)
    deep = pink & ~light
    H = np.where(deep, 352, H); S = np.where(deep, np.minimum(s, 0.55) * 0.85, S); V = np.where(deep, v * 0.78, V)
    blue = (h >= 165) & (h < 290) & (s > 0.06)
    H = np.where(blue, 88, H); S = np.where(blue, s * 0.5, S); V = np.where(blue, v * 0.9, V)
    green = (h >= 68) & (h < 165) & (s > 0.06)
    H = np.where(green, 86, H); S = np.where(green, s * 0.65, S); V = np.where(green, v * 0.82, V)
    gold = (h >= 38) & (h < 68) & (s > 0.25)
    H = np.where(gold, 37, H); S = np.where(gold, s * 0.78, S); V = np.where(gold, v * 0.84, V)
    # back to rgb
    i = np.floor(H / 60) % 6; f = H / 60 - np.floor(H / 60)
    p, q, t = V * (1 - S), V * (1 - S * f), V * (1 - S * (1 - f))
    out = np.stack([np.choose(i.astype(int), [V, q, p, p, t, V]), np.choose(i.astype(int), [t, V, V, q, p, p]), np.choose(i.astype(int), [p, p, t, V, V, q])], -1)
    return np.clip(out, 0, 1)


def hexmap(m):
    hx = m.group(0).lower()
    if hx in OVERRIDE:
        return OVERRIDE[hx]
    rgb = np.array([[int(hx[1:3], 16), int(hx[3:5], 16), int(hx[5:7], 16)]], float) / 255
    o = (shift(rgb)[0] * 255).round().astype(int)
    return "#%02X%02X%02X" % tuple(o)


def imgmap(m):
    mime, data = m.group(1), m.group(2)
    im = Image.open(io.BytesIO(base64.b64decode(data)))
    has_a = im.mode in ("RGBA", "LA", "P")
    im = im.convert("RGBA")
    a = np.asarray(im).astype(float) / 255
    a[..., :3] = shift(a[..., :3])
    out = Image.fromarray((a * 255).round().astype(np.uint8), "RGBA")
    buf = io.BytesIO()
    if mime == "jpeg" and not has_a:
        out.convert("RGB").save(buf, "JPEG", quality=90); mime = "jpeg"
    else:
        out.save(buf, "PNG", optimize=True); mime = "png"
    return f"data:image/{mime};base64," + base64.b64encode(buf.getvalue()).decode()


def bbox(d):
    n = [float(x) for x in re.findall(r"-?\d*\.?\d+(?:e-?\d+)?", d)]
    xs, ys = n[0::2], n[1::2]
    return min(xs), min(ys), max(xs), max(ys)


def inject(s, fill, fn, recolor=None):
    m = re.search(r'<path([^>]*)fill="' + fill + r'"([^>]*)/>', s)
    if not m:
        print("  no element with", fill); return s
    tag = m.group(0)
    d = re.search(r' d="([^"]+)"', tag).group(1)
    tr = re.search(r' transform="([^"]+)"', tag)
    tr = f' transform="{tr.group(1)}"' if tr else ""
    x0, y0, x1, y1 = bbox(d)
    cid = "clip" + fill[1:]
    new = tag.replace(f'fill="{fill}"', f'fill="{recolor}"') if recolor else tag
    extra = f'<g{tr}><clipPath id="{cid}"><path d="{d}"/></clipPath><g clip-path="url(#{cid})">{fn(x0, y0, x1, y1)}</g></g>'
    return s.replace(tag, new + extra, 1)


def pines(x0, y0, x1, y1):
    w, h = x1 - x0, y1 - y0
    out = [f'<defs><radialGradient id="mistg" cx=".5" cy=".42" r=".55"><stop offset="0" stop-color="#E6E1D6" stop-opacity=".75"/><stop offset=".6" stop-color="#C9CEC1" stop-opacity=".25"/><stop offset="1" stop-color="#C9CEC1" stop-opacity="0"/></radialGradient>'
           f'<linearGradient id="mistb" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#C9CEC1" stop-opacity="0"/><stop offset="1" stop-color="#C9CEC1" stop-opacity=".55"/></linearGradient></defs>',
           f'<rect x="{x0}" y="{y0}" width="{w}" height="{h}" fill="url(#mistg)"/>']
    import random
    rnd = random.Random(7)
    for layer, (col, op, base, hmin, hmax) in enumerate([("#6E7C68", .55, .80, .22, .36), ("#3E4C42", .9, .9, .28, .46), ("#26302A", 1, 1.0, .30, .5)]):
        x = x0 - w * .05
        while x < x1:
            tw = w * rnd.uniform(.07, .11); th = h * rnd.uniform(hmin, hmax); by = y0 + h * base
            out.append(f'<path d="M{x:.1f} {by:.1f} L{x + tw / 2:.1f} {by - th:.1f} L{x + tw:.1f} {by:.1f} Z" fill="{col}" opacity="{op}"/>')
            x += tw * rnd.uniform(.55, .9)
        if layer == 0:
            out.append(f'<rect x="{x0}" y="{y0 + h * .55}" width="{w}" height="{h * .3}" fill="url(#mistb)"/>')
    return "".join(out)


def rays(x0, y0, x1, y1):
    w, h = x1 - x0, y1 - y0
    g = ('<defs><radialGradient id="glowm" cx=".5" cy=".38" r=".6"><stop offset="0" stop-color="#F0E3BE" stop-opacity=".55"/><stop offset=".55" stop-color="#C9CEC1" stop-opacity=".18"/><stop offset="1" stop-color="#26302A" stop-opacity=".35"/></radialGradient>'
         '<linearGradient id="raym" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#F6E7BF" stop-opacity=".42"/><stop offset="1" stop-color="#F6E7BF" stop-opacity="0"/></linearGradient></defs>')
    g += f'<rect x="{x0}" y="{y0}" width="{w}" height="{h}" fill="url(#glowm)"/>'
    for i, (a, b) in enumerate([(.02, .12), (.2, .3), (.4, .47), (.58, .66)]):
        g += f'<path d="M{x0 + w * a:.1f} {y0:.1f} L{x0 + w * b:.1f} {y0:.1f} L{x0 + w * (b + .55):.1f} {y1:.1f} L{x0 + w * (a + .4):.1f} {y1:.1f} Z" fill="url(#raym)"/>'
    return g


SKIP = {"floral-card.svg", "corner-ochre.svg", "corner-wedgwood.svg"}  # replaced with pressed botanicals
for f in sorted(glob.glob(f"{SRC}/*.svg")):
    name = os.path.basename(f)
    if name in SKIP:
        continue
    s = open(f).read()
    if name in ("welcome-cameo.svg", "meet-cameo.svg"):
        s = re.sub(r"#e3cfc4\b", "#3B473E", s, flags=re.I)
    s = re.sub(r"#[0-9a-fA-F]{6}\b", hexmap, s)
    s = re.sub(r"data:image/(png|jpeg|jpg);base64,([A-Za-z0-9+/=\s]+)", imgmap, s)
    if name == "meet-cameo.svg" or name == "weave-hoop.svg":
        # keep the twig-free versions: strip twig strokes again
        pass
    if name == "welcome-cameo.svg":
        s = re.sub(r'fill="#C4CAB2"', 'fill="#33403A"', s, count=1)
        s = inject(s, "#C7CBC2", pines, recolor="#4A5A4F")
    if name == "meet-cameo.svg":
        s = inject(s, "#6E7C68", rays)
    open(f"{DST}/{name}", "w").write(s)
    print("recoloured", name)
