import { useEffect, useRef, useState } from "react";
import DumbbellRig, { PLATES } from "./DumbbellRig";

function clamp01(n) {
  return Math.max(0, Math.min(1, n));
}

function localProgress(progress, start, end) {
  return clamp01((progress - start) / (end - start));
}

function easeOutCubic(t) {
  return 1 - Math.pow(1 - t, 3);
}

export default function Hero() {
  const sectionRef = useRef(null);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    let ticking = false;

    function computeProgress() {
      const el = sectionRef.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const scrollable = rect.height - window.innerHeight;
      const p = scrollable > 0 ? clamp01(-rect.top / scrollable) : 0;
      setProgress(p);
      ticking = false;
    }

    function onScroll() {
      if (!ticking) {
        window.requestAnimationFrame(computeProgress);
        ticking = true;
      }
    }

    computeProgress();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  const LOAD_END = 0.55;
  const LIFT_START = 0.5;
  const LIFT_END = 0.85;
  const TEXT_START = 0.4;
  const TEXT_END = 0.75;

  const liftLocal = easeOutCubic(localProgress(progress, LIFT_START, LIFT_END));
  const rigTranslateY = -liftLocal * 380;
  const rigRotate = -liftLocal * 18;
  const rigOpacity = 1 - clamp01((progress - 0.8) / 0.15);
  const textLocal = easeOutCubic(localProgress(progress, TEXT_START, TEXT_END));
  const cueOpacity = 1 - clamp01(progress / 0.12);

  function platesFor(side) {
    return PLATES.map((plate, i) => {
      const stageStart = (i / PLATES.length) * LOAD_END * 0.8;
      const stageEnd = stageStart + 0.16;
      const localP = easeOutCubic(localProgress(progress, stageStart, stageEnd));
      const restingGap = 6 + PLATES.slice(0, i).reduce((sum, p) => sum + p.w + 4, 0);
      const startX = side * 520;
      const restX = side * (26 + restingGap);
      const x = startX + (restX - startX) * localP;
      return { ...plate, x, opacity: 0.15 + 0.85 * localP, key: `${side}-${i}` };
    });
  }

  return (
    <div className="hero-scroll-section" ref={sectionRef}>
      <div className="hero-sticky">
        <div className="hero-grid-bg"></div>
        <div className="hero-eyebrow eyebrow">Surat's Strength Lab</div>

        <DumbbellRig
          scrollPlates={{ left: platesFor(-1), right: platesFor(1) }}
          style={{
            transform: `translateY(${rigTranslateY}px) rotate(${rigRotate}deg)`,
            opacity: rigOpacity,
          }}
        />

        <div
          className="hero-headline"
          style={{
            opacity: textLocal,
            transform: `translate(-50%, ${(1 - textLocal) * 40}px)`,
          }}
        >
          <h1>
            BUILD YOUR
            <br />
            <span className="outline">BEST</span> <span className="fill">BODY</span>
          </h1>
          <p>
            NEW GOLD GYM is where discipline meets iron. Strength training, conditioning and
            coaching built around one goal — your transformation.
          </p>
          <div className="hero-actions">
            <a href="#pricing" className="btn-primary">
              Start Free Trial
            </a>
            <a href="#programs" className="btn-ghost">
              View Programs →
            </a>
          </div>
        </div>

        <div className="scroll-cue" style={{ opacity: cueOpacity }}>
          <span>Scroll to load up</span>
          <div className="line"></div>
        </div>
      </div>
    </div>
  );
}
