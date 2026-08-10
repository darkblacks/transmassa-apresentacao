import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

import "./css/global.css";
import "./css/app.css";
import "./css/slides.css";
import "./css/components.css";
import "./css/dashboard.css";

import TopMenu from "./components/layout/Topmenu";
import Slide1 from "./slides/Slide1";
import Slide2 from "./slides/Slide2";
import Slide3 from "./slides/Slide3";
import Slide4 from "./slides/Slide4";
import Slide5 from "./slides/Slide5";
import SlideTruck from "./slides/SlideTruck";
import Slide6 from "./slides/Slide6";
import Slide7 from "./slides/Slide7";
import Slide8 from "./slides/Slide8";

export default function App() {
  const [currentSlide, setCurrentSlide] = useState(0);

  const slides = useMemo(
    () => [
      <Slide1 />,
      <Slide2 />,
      <Slide3 />,
      <Slide4 />,
      <Slide5 />,
      <SlideTruck />,
      <Slide6 />,
      <Slide7 />,
      <Slide8 />,
    ],
    []
  );

  const totalSlides = slides.length;

  function handlePrev() {
    setCurrentSlide((prev) => Math.max(prev - 1, 0));
  }

  function handleNext() {
    setCurrentSlide((prev) => Math.min(prev + 1, totalSlides - 1));
  }

  function handleGoToSlide(index: number) {
    setCurrentSlide(index);
  }

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "ArrowRight") handleNext();
      if (event.key === "ArrowLeft") handlePrev();
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [totalSlides]);

  return (
    <main className="app-shell">
      <TopMenu
        currentSlide={currentSlide}
        totalSlides={totalSlides}
        onPrev={handlePrev}
        onNext={handleNext}
        onGoToSlide={handleGoToSlide}
      />

      <section className="presentation-stage">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentSlide}
            className="slide-frame"
            initial={{ opacity: 0, x: 80, scale: 0.985 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: -80, scale: 0.985 }}
            transition={{ duration: 0.45, ease: "easeOut" }}
          >
            {slides[currentSlide]}
          </motion.div>
        </AnimatePresence>
      </section>
    </main>
  );
}
