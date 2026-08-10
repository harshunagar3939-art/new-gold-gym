import { useEffect, useRef, useState } from "react";
import useReveal from "../hooks/useReveal";

const DEFAULT_STATS = [
  { label: "Active Members", key: "activeMembers", value: 2400 },
  { label: "Expert Coaches", key: "expertCoaches", value: 18 },
  { label: "Weekly Classes", key: "weeklyClasses", value: 45 },
  { label: "Years Running", key: "yearsRunning", value: 12 },
];

function Counter({ target }) {
  const [ref, inView] = useReveal(0.5);
  const [display, setDisplay] = useState(0);
  const started = useRef(false);

  useEffect(() => {
    if (!inView || started.current) return;
    started.current = true;
    const duration = 1400;
    const start = performance.now();

    function tick(now) {
      const p = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - p, 3);
      setDisplay(Math.floor(eased * target));
      if (p < 1) requestAnimationFrame(tick);
      else setDisplay(target);
    }
    requestAnimationFrame(tick);
  }, [inView, target]);

  return (
    <div className="num" ref={ref}>
      {display.toLocaleString()}+
    </div>
  );
}

export default function Stats() {
  const [stats, setStats] = useState(DEFAULT_STATS);

  useEffect(() => {
    try {
      const saved = localStorage.getItem("gold_site_stats");
      if (saved) {
        const parsed = JSON.parse(saved);
        setStats([
          { label: "Active Members", key: "activeMembers", value: Number(parsed.activeMembers) || 2400 },
          { label: "Expert Coaches", key: "expertCoaches", value: Number(parsed.expertCoaches) || 18 },
          { label: "Weekly Classes", key: "weeklyClasses", value: Number(parsed.weeklyClasses) || 45 },
          { label: "Years Running", key: "yearsRunning", value: Number(parsed.yearsRunning) || 12 },
        ]);
      }
    } catch {}
  }, []);

  return (
    <section className="stats-band">
      <div className="wrap stats-grid">
        {stats.map((s) => (
          <div className="stat-item" key={s.label}>
            <Counter target={s.value} />
            <div className="lbl">{s.label}</div>
          </div>
        ))}
      </div>
    </section>
  );
}

