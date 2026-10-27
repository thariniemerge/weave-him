import { createContext, useContext, useEffect, useState } from "react";
import { SLIDERS } from "../content";

const KEY = "weave-him-answers";
const blank = () => ({ q1: null, q2: null, q3: null, q4: null, q7: null, remembers: [], sliders: Object.fromEntries(SLIDERS.map((s) => [s.key, s.def])) });
const Ctx = createContext(null);

export function AnswersProvider({ children }) {
  const [answers, setAnswers] = useState(() => {
    try { return { ...blank(), ...JSON.parse(sessionStorage.getItem(KEY) || "{}") }; } catch { return blank(); }
  });
  useEffect(() => { sessionStorage.setItem(KEY, JSON.stringify(answers)); }, [answers]);
  const set = (k, v) => setAnswers((a) => ({ ...a, [k]: v }));
  const reset = () => { sessionStorage.removeItem("weave-him-last"); setAnswers(blank()); };
  return <Ctx.Provider value={{ answers, set, reset }}>{children}</Ctx.Provider>;
}

export const useAnswers = () => useContext(Ctx);
