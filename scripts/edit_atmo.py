import os
os.chdir("/app/frontend/src")


def edit(p, pairs):
    s = open(p).read()
    for a, b in pairs:
        assert a in s, (p, a[:60])
        s = s.replace(a, b, 1)
    open(p, 'w').write(s)


edit('components/weave/Layout.jsx', [
    ('import { createPortal } from "react-dom";', 'import { createPortal } from "react-dom";\nimport { useReducedMotion } from "framer-motion";'),
    ('''    <PanelCtx.Provider value={panel}>
      <Ornaments />''', '''    <PanelCtx.Provider value={panel}>
      <div className="mist-layer" aria-hidden />
      <div className="grain-layer" aria-hidden />
      <Ornaments />'''),
    ('<aside className="sticky top-0 h-[100dvh] flex items-center justify-center px-[5vw] py-10" data-testid="art-panel">', '<aside className="forest-panel sticky top-0 h-[100dvh] flex items-center justify-center px-[5vw] py-10" data-testid="art-panel">'),
    ('<div ref={setPanel} className="relative w-full max-w-[min(640px,80vh)] flex flex-col items-center" />', '<div ref={setPanel} className="relative z-10 w-full max-w-[min(640px,80vh)] flex flex-col items-center" />'),
    ('export function Layout({ children }) {', '''const LEAF_COLS = ["#C99A4A", "#B07F45", "#9AA38A", "#8E6A3E", "#C99A4A", "#7F8A6E"];
// A few fallen leaves drifting down (Welcome & Meet only)
export const FallingLeaves = () => {
  const reduce = useReducedMotion();
  if (reduce) return null;
  return createPortal(
    <div aria-hidden data-testid="falling-leaves">
      {LEAF_COLS.map((c, i) => (
        <svg key={i} viewBox="0 0 24 24" className="leaf-fall" width={14 + (i % 3) * 5}
          style={{ left: `${8 + i * 15 + (i % 2) * 4}%`, animationDuration: `${22 + (i * 7) % 13}s`, animationDelay: `${i * 3.7}s` }}>
          <path d="M3 12 Q12 1 21 12 Q12 23 3 12Z" fill={c} opacity=".85" />
          <path d="M2 12 H20" stroke="#4A3A2E" strokeWidth=".8" opacity=".6" />
        </svg>
      ))}
    </div>,
    document.body,
  );
};

export function Layout({ children }) {'''),
])
edit('pages/Welcome.jsx', [('import { PanelOrInline } from "../components/weave/Layout";', 'import { PanelOrInline, FallingLeaves } from "../components/weave/Layout";'), ('    <Page>', '    <Page>\n      <FallingLeaves />')])
edit('pages/Meet.jsx', [('import { PanelOrInline } from "../components/weave/Layout";', 'import { PanelOrInline, FallingLeaves } from "../components/weave/Layout";')])
s = open('pages/Meet.jsx').read()
i = s.index('export default function Meet')
j = s.index('    <Page', s.index('return (', s.index('if (!h)', i)))
k = s.index('>', j) + 1
s = s[:k] + '\n      <FallingLeaves />' + s[k:]
open('pages/Meet.jsx', 'w').write(s)
open('index.css', 'a').write('''
.forest-panel p, .forest-panel .f-sc { color: #C9CEC1; }
.forest-panel img[src*="/art/"] { filter: drop-shadow(0 18px 40px rgba(0,0,0,.45)); }
''')
print("ok")
