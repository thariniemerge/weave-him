import "@/App.css";
import { useEffect } from "react";
import { BrowserRouter, Routes, Route, useLocation, Navigate } from "react-router-dom";
import { AnimatePresence, MotionConfig } from "framer-motion";
import { Toaster } from "sonner";
import { AnswersProvider } from "./lib/store";
import Welcome from "./pages/Welcome";
import Strand from "./pages/Strand";
import Weaving from "./pages/Weaving";
import Meet from "./pages/Meet";
import Tell from "./pages/Tell";
import CardPage from "./pages/CardPage";
import { Layout } from "./components/weave/Layout";
import { musicForRoute } from "./lib/sound";

function AnimatedRoutes() {
  const location = useLocation();
  useEffect(() => { if (!location.pathname.startsWith("/h/")) document.title = "Weave Him"; musicForRoute(location.pathname); }, [location.pathname]);
  if (location.pathname.startsWith("/card/")) return <Routes><Route path="/card/:id" element={<CardPage />} /></Routes>;
  return (
    <Layout>
    <AnimatePresence mode="wait" onExitComplete={() => window.scrollTo(0, 0)}>
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<Welcome />} />
        <Route path="/strand/:n" element={<Strand />} />
        <Route path="/weaving" element={<Weaving />} />
        <Route path="/meet/:id" element={<Meet />} />
        <Route path="/h/:id" element={<Meet isPublic />} />
        <Route path="/tell/:id" element={<Tell />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AnimatePresence>
    </Layout>
  );
}

export default function App() {
  return (
    <MotionConfig reducedMotion="user">
      <AnswersProvider>
        <BrowserRouter>
          <AnimatedRoutes />
          <Toaster position="top-center" toastOptions={{ style: { background: "#FFFCF7", border: "1px solid #C9A45C", color: "#3A2420", fontFamily: "'Cormorant Garamond', serif", fontSize: 18 } }} />
        </BrowserRouter>
      </AnswersProvider>
    </MotionConfig>
  );
}
