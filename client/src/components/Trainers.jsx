import { useEffect, useState } from "react";
import useReveal from "../hooks/useReveal";
import { getTrainers } from "../api/api";

const FALLBACK = [
  { _id: "1", name: "Rohan Mehta", role: "Head of Strength", photo: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=500&q=80" },
  { _id: "2", name: "Priya Nair", role: "CrossFit Coach", photo: "https://images.unsplash.com/photo-1594381898411-846e7d193883?w=500&q=80" },
  { _id: "3", name: "Arjun Patel", role: "Boxing Coach", photo: "https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?w=500&q=80" },
  { _id: "4", name: "Sana Sheikh", role: "Nutrition Lead", photo: "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=500&q=80" },
];

export default function Trainers() {
  const [headRef, headIn] = useReveal();
  const [rowRef, rowIn] = useReveal();
  const [trainers, setTrainers] = useState(FALLBACK);

  useEffect(() => {
    getTrainers()
      .then((data) => {
        if (Array.isArray(data) && data.length) setTrainers(data);
      })
      .catch(() => {});
  }, []);

  return (
    <section id="trainers">
      <div className="wrap">
        <div className={`sec-head reveal ${headIn ? "in-view" : ""}`} ref={headRef}>
          <h2>
            Your
            <br />
            Coaches
          </h2>
          <p>Certified trainers who've competed, coached and lived this — not just taught it.</p>
        </div>
        <div className={`trainers-row reveal ${rowIn ? "in-view" : ""}`} ref={rowRef}>
          {trainers.map((t) => (
            <div className="trainer-card trainer-card-3d" key={t._id}>
              <div className="trainer-photo-wrap">
                <img className="trainer-photo" src={t.photo} alt={t.name} />
                <div className="trainer-3d-overlay"></div>
                <div className="trainer-cert-badge">CERTIFIED PRO</div>
              </div>
              <div className="trainer-info">
                <h3>{t.name}</h3>
                <div className="role">{t.role.toUpperCase()}</div>
                <div className="trainer-sub">1-on-1 & Group Sessions Available</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
