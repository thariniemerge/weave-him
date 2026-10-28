import { createContext, useContext, useEffect, useLayoutEffect, useState } from "react";

// One choreographed crossfade between every screen, in CSS (transform and opacity only): the leaving screen
// lifts away while the arriving one rises in, both stacked in the same grid cell so nothing is pushed and
// there is never an empty frame. The arriving screen is fully rendered before the first frame paints.
const LEAVE_MS = 320;
export const StageCtx = createContext("idle");
export const useStage = () => useContext(StageCtx);

export function PageStack({ location, render }) {
  const [items, setItems] = useState([{ key: location.pathname, loc: location, stage: "idle" }]);
  useLayoutEffect(() => {
    setItems((cur) => {
      const last = cur[cur.length - 1];
      if (last.key === location.pathname) return cur;
      return [{ ...last, stage: "leave" }, { key: location.pathname, loc: location, stage: "enter" }];
    });
  }, [location.pathname]); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => {
    if (!items.some((i) => i.stage === "leave")) return;
    // the leaving screen goes when its fade has really finished (animationend); the timer is only a safety net
    const t = setTimeout(() => setItems((c) => c.filter((i) => i.stage !== "leave")), LEAVE_MS * 3);
    return () => clearTimeout(t);
  }, [items]);
  const done = (key) => (e) => {
    if (e.target === e.currentTarget) setItems((c) => c.filter((i) => !(i.key === key && i.stage === "leave")));
  };
  return items.map((i) => (
    <div key={i.key} className={`page-cell page-${i.stage}`} aria-hidden={i.stage === "leave" || undefined} data-testid={`page-cell-${i.stage}`}
      onAnimationEnd={i.stage === "leave" ? done(i.key) : undefined}>
      <StageCtx.Provider value={i.stage}>{render(i.loc)}</StageCtx.Provider>
    </div>
  ));
}

// Keeps something mounted for the leave animation after `show` turns false; returns "enter" | "leave" | null
export function useLinger(show) {
  const [state, setState] = useState(show ? "idle" : null);
  useLayoutEffect(() => {
    if (show) setState((s) => (s === "idle" ? s : "enter"));
    else setState((s) => (s ? "leave" : null));
  }, [show]);
  useEffect(() => {
    if (state !== "leave") return;
    const t = setTimeout(() => setState(null), LEAVE_MS);
    return () => clearTimeout(t);
  }, [state]);
  return state;
}
