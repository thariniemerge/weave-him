import "@/App.css";
import { useEffect, useRef, useState } from "react";
import { BrowserRouter, Routes, Route, useLocation, Navigate } from "react-router-dom";
import { MotionConfig } from "framer-motion";
import { Toaster } from "sonner";
import { AnswersProvider } from "./lib/store";
import { PORTRAITS, portraitSrc } from "./content";
import Welcome from "./pages/Welcome";
import Strand from "./pages/Strand";
import Weaving from "./pages/Weaving";
import Meet from "./pages/Meet";
import Tell from "./pages/Tell";
import CardPage from "./pages/CardPage";
import Bands from "./pages/Bands";
import { Layout } from "./components/weave/Layout";
import { PageStack } from "./components/weave/PageStack";
import { IntroVeil, introWanted } from "./components/weave/IntroVeil";

function AnimatedRoutes() {
  const location = useLocation();
  const [intro, setIntro] = useState(introWanted);
  const [introOpen, setIntroOpen] = useState(false);
  const stage = useRef(null);
  useEffect(() => { if (!location.pathname.startsWith("/h/")) document.title = "Weave Him"; window.scrollTo(0, 0); }, [location.pathname]);
  // the five raw-willow weaving states load during the intro; his expression frames load only on the weaving screen
  useEffect(() => { PORTRAITS.forEach((p) => { new Image().src = portraitSrc(p.slug, "-weave"); }); }, []);
  if (location.pathname.startsWith("/card/")) return <Routes><Route path="/card/:id" element={<CardPage />} /></Routes>;
  return (
    <>
    <div ref={stage} className={intro ? `intro-stage${introOpen ? " is-open" : ""}` : undefined}>
    <Layout>
      <PageStack location={location} render={(loc) => (
        <Routes location={loc}>
          <Route path="/" element={<Welcome />} />
          <Route path="/strand/:n" element={<Strand />} />
          <Route path="/bands" element={<Bands />} />
          <Route path="/weaving" element={<Weaving />} />
          <Route path="/meet/:id" element={<Meet />} />
          <Route path="/h/:id" element={<Meet isPublic />} />
          <Route path="/tell/:id" element={<Tell />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      )} />
    </Layout>
    </div>
    {intro && <IntroVeil stageRef={stage} onOpen={() => setIntroOpen(true)} onDone={() => setIntro(false)} />}
    </>
  );
}

export default function App() {
  return (
    <MotionConfig reducedMotion="user">
      <AnswersProvider>
        <BrowserRouter>
          <AnimatedRoutes />
          <Toaster position="bottom-center" toastOptions={{ style: { background: "#F1ECE1", border: "1px solid #A8823F", color: "#2A211B", fontFamily: "'Cormorant Garamond', serif", fontSize: 18 } }} />
        </BrowserRouter>
      </AnswersProvider>
    </MotionConfig>
  );
}
