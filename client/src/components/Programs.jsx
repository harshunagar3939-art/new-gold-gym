import { useEffect, useState } from "react";
import useReveal from "../hooks/useReveal";
import { getPrograms } from "../api/api";

const FALLBACK = [
  { _id: "1", order: 1, title: "Strength Training", description: "Barbell fundamentals, progressive overload and powerlifting technique." },
  { _id: "2", order: 2, title: "CrossFit Conditioning", description: "High-intensity functional workouts that build engine and grit." },
  { _id: "3", order: 3, title: "Boxing & Combat", description: "Pad work, bag rounds and footwork drills with certified coaches." },
  { _id: "4", order: 4, title: "Personal Coaching", description: "One-on-one programming built around your goals and recovery." },
  { _id: "5", order: 5, title: "Mobility & Recovery", description: "Stretch labs and recovery sessions to keep you training pain-free." },
  { _id: "6", order: 6, title: "Nutrition Coaching", description: "Meal planning and macro coaching that fits an Indian kitchen." },
];

export default function Programs() {
  const [headRef, headIn] = useReveal();
  const [gridRef, gridIn] = useReveal();
  const [programs, setPrograms] = useState(FALLBACK);
  const [activeCard, setActiveCard] = useState(null);
  const [tiltStyle, setTiltStyle] = useState({});

  useEffect(() => {
    let mounted = true;
    const fetchPrograms = () => {
      getPrograms().then((data) => {
        if (mounted && Array.isArray(data)) setPrograms(data);
      });
    };
    fetchPrograms();
    window.addEventListener("focus", fetchPrograms);
    window.addEventListener("ngg_data_updated", fetchPrograms);
    window.addEventListener("storage", fetchPrograms);
    return () => {
      mounted = false;
      window.removeEventListener("focus", fetchPrograms);
      window.removeEventListener("ngg_data_updated", fetchPrograms);
      window.removeEventListener("storage", fetchPrograms);
    };
  }, []);

  function handleMouseMove(e, id) {
    const card = e.currentTarget;
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    const rotateX = ((y - centerY) / centerY) * -12;
    const rotateY = ((x - centerX) / centerX) * 12;

    setTiltStyle({
      [id]: {
        transform: `perspective(1000px) rotateX(${rotateX.toFixed(2)}deg) rotateY(${rotateY.toFixed(2)}deg) translateZ(14px)`,
        background: `radial-gradient(600px circle at ${x}px ${y}px, rgba(201, 162, 75, 0.15), rgba(22, 22, 22, 0.95))`,
      },
    });
    setActiveCard(id);
  }

  function handleMouseLeave(id) {
    setTiltStyle({
      [id]: {
        transform: "perspective(1000px) rotateX(0deg) rotateY(0deg) translateZ(0px)",
        background: undefined,
      },
    });
    setActiveCard(null);
  }

  return (
    <section id="programs">
      <div className="wrap">
        <div className={`sec-head reveal ${headIn ? "in-view" : ""}`} ref={headRef}>
          <h2>
            Train With
            <br />
            Purpose
          </h2>
          <p>Six core programs engineered for total strength, functional hypertrophy, and elite endurance.</p>
        </div>
        <div className={`programs-grid reveal ${gridIn ? "in-view" : ""}`} ref={gridRef}>
          {programs.map((p) => {
            const style = tiltStyle[p._id] || {};
            return (
              <div
                className={`program-card program-card-3d ${activeCard === p._id ? "active-3d" : ""}`}
                key={p._id}
                style={style}
                onMouseMove={(e) => handleMouseMove(e, p._id)}
                onMouseLeave={() => handleMouseLeave(p._id)}
              >
                <div className="idx">{String(p.order).padStart(2, "0")}</div>
                <div>
                  <h3>{p.title}</h3>
                  <p>{p.description}</p>
                </div>
                <div className="arrow">↗</div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
