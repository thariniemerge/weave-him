import { useLayoutEffect, useRef, useState } from "react";

// Shrinks font size until the element's content fits its box.
export function useFitText(deps, { max, min = 10, step = 2, width, height }) {
  const ref = useRef(null);
  const [size, setSize] = useState(max);
  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    let s = max;
    const fits = () => {
      const kids = el.children.length ? [...el.children] : [el];
      const w = Math.max(...kids.map((k) => k.scrollWidth));
      const W = width === "auto" ? el.clientWidth : width;
      return (!W || w <= W) && (!height || el.scrollHeight <= height);
    };
    el.style.fontSize = `${s}px`;
    while (s > min && !fits()) { s -= step; el.style.fontSize = `${s}px`; }
    setSize(s);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
  return [ref, size];
}
