import os
D = "/app/frontend/public/art"
FERN_LEAF = "c-{a} -1 -{b} 2 -{c} 6 {d} 1 {e} 0 {c} -6z"


def fern(x0, y0, x1, y1, n, col, stem="#4A5641", s=1.0):
    """Pressed fern frond along a gentle curve from (x0,y0) to (x1,y1)."""
    out = [f'<path d="M{x0} {y0} Q{(x0 + x1) / 2 + 10 * s} {(y0 + y1) / 2} {x1} {y1}" fill="none" stroke="{stem}" stroke-width="{1.2 * s}" stroke-linecap="round"/>']
    for i in range(1, n):
        t = i / n
        mx = (1 - t) ** 2 * x0 + 2 * (1 - t) * t * ((x0 + x1) / 2 + 10 * s) + t * t * x1
        my = (1 - t) ** 2 * y0 + 2 * (1 - t) * t * ((y0 + y1) / 2) + t * t * y1
        L = (1 - t * 0.75) * 11 * s
        out.append(f'<ellipse cx="{mx - L * .55:.1f}" cy="{my - L * .15:.1f}" rx="{L * .62:.1f}" ry="{L * .22:.1f}" transform="rotate(-28 {mx:.1f} {my:.1f})" fill="{col}" fill-opacity=".9"/>')
        out.append(f'<ellipse cx="{mx + L * .55:.1f}" cy="{my - L * .15:.1f}" rx="{L * .62:.1f}" ry="{L * .22:.1f}" transform="rotate(28 {mx:.1f} {my:.1f})" fill="{col}" fill-opacity=".8"/>')
    return "".join(out)


def leaf(cx, cy, rx, ry, rot, col, vein="#4A3A2E"):
    return (f'<g transform="rotate({rot} {cx} {cy})"><path d="M{cx - rx} {cy} Q{cx} {cy - ry * 2} {cx + rx} {cy} Q{cx} {cy + ry * 2} {cx - rx} {cy}Z" fill="{col}"/>'
            f'<path d="M{cx - rx * 1.15} {cy} L{cx + rx * .9} {cy}" stroke="{vein}" stroke-width=".7" opacity=".7"/></g>')


def sprig(x, y, col):  # dried wildflower: stem + three tiny seed heads
    return (f'<path d="M{x} {y} q-2 -10 1 -20 M{x} {y - 8} q5 -4 8 -11 M{x} {y - 6} q-6 -3 -9 -9" fill="none" stroke="#4A3A2E" stroke-width=".9" stroke-linecap="round"/>'
            f'<circle cx="{x + 1}" cy="{y - 21}" r="2.2" fill="{col}"/><circle cx="{x + 8.5}" cy="{y - 19.5}" r="1.8" fill="{col}"/><circle cx="{x - 9.5}" cy="{y - 15.5}" r="1.7" fill="{col}"/>')


svgs = {
    "floral-card.svg": ("8 62 40 36", fern(14, 96, 44, 64, 8, "#9AA38A", s=0.75) + leaf(20, 76, 7, 3, -40, "#C99A4A") + sprig(36, 97, "#B07F45")),
    "corner-ochre.svg": ("222 0 72 96", fern(292, 2, 236, 90, 11, "#9AA38A") + leaf(270, 40, 11, 4.5, 35, "#B5853F") + leaf(252, 18, 9, 3.6, -20, "#8E6A3E") + sprig(284, 92, "#C99A4A")),
    "corner-wedgwood.svg": ("222 0 72 78", '<path d="M292 2 C 272 18 252 38 236 74" fill="none" stroke="#4A3A2E" stroke-width="1.1"/>'
                            + "".join(leaf(292 - 14 * i - 4, 6 + 17 * i, 10 - i, 2.6, 62 + i * 4, c) for i, c in enumerate(["#9AA38A", "#7F8A6E", "#9AA38A", "#B5853F"]))
                            + leaf(262, 20, 10, 4, 40, "#C99A4A") + sprig(240, 76, "#9AA38A")),
}
for name, (vb, body) in svgs.items():
    x, y, w, h = vb.split()
    open(f"{D}/{name}", "w").write(f'<svg xmlns="http://www.w3.org/2000/svg" width="{w}" height="{h}" viewBox="{vb}">{body}</svg>')
    print("wrote", name)
