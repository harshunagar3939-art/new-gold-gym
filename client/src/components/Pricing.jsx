import { useEffect, useState } from "react";
import useReveal from "../hooks/useReveal";
import { getPlans } from "../api/api";

const FALLBACK = [
  {
    key: "basic",
    name: "3 Month Plan",
    price: 2500,
    period: "/Yr",
    featured: false,
    features: ["Full gym floor access", "Locker room & showers", "Standard hours (6AM–10PM)"],
  },
  {
    key: "gold",
    name: "6 Month Plan",
    price: 3500,
    period: "/Yr",
    featured: false,
    features: ["Everything in Basic", "24/7 access", "4 group classes / week", "Nutrition check-ins"],
  },
  {
    key: "elite",
    name: "1 Year Plan",
    price: 4500,
    period: "/Yr",
    featured: true,
    features: ["Everything in Gold", "2 personal training sessions", "Recovery lab access", "Priority booking"],
  },
];

export default function Pricing({ onSelectPlan }) {
  const [headRef, headIn] = useReveal();
  const [gridRef, gridIn] = useReveal();
  const [plans, setPlans] = useState(FALLBACK);
  const [hoveredKey, setHoveredKey] = useState(null);

  useEffect(() => {
    let mounted = true;
    const fetchPlans = () => {
      getPlans().then((data) => {
        if (mounted && Array.isArray(data)) setPlans(data);
      });
    };
    fetchPlans();
    window.addEventListener("focus", fetchPlans);
    window.addEventListener("ngg_data_updated", fetchPlans);
    window.addEventListener("storage", fetchPlans);
    return () => {
      mounted = false;
      window.removeEventListener("focus", fetchPlans);
      window.removeEventListener("ngg_data_updated", fetchPlans);
      window.removeEventListener("storage", fetchPlans);
    };
  }, []);

  return (
    <section id="pricing">
      <div className="wrap">
        <div className={`sec-head reveal ${headIn ? "in-view" : ""}`} ref={headRef}>
          <div>
            <h2>
              Pick Your
              <br />
              Membership
            </h2>
          </div>
          <div className="pricing-head-right">
            <p>Flexible annual plans. Zero hidden admission fees. Upgrade or pause anytime.</p>
          </div>
        </div>

        <div className={`pricing-grid reveal ${gridIn ? "in-view" : ""}`} ref={gridRef}>
          {plans.map((p) => {
            const rawPrice = p.price || 999;
            const periodStr = p.period ? p.period : "/yr";

            return (
              <div
                className={`price-card price-card-3d ${p.featured ? "featured" : ""} ${
                  hoveredKey === p.key ? "hovered-3d" : ""
                }`}
                key={p.key || p._id}
                onMouseEnter={() => setHoveredKey(p.key)}
                onMouseLeave={() => setHoveredKey(null)}
              >
                {p.featured && <div className="featured-sparkle">★ BEST VALUE</div>}
                <h3>{p.name}</h3>
                <div className="price">
                  ₹{rawPrice.toLocaleString()}
                  <sup>{periodStr}</sup>
                </div>
                <div className="per">Billed annually</div>
                <ul>
                  {p.features?.map((f, i) => (
                    <li key={i} className="price-feature-item">
                      <span className="feature-check">✓</span> {f}
                    </li>
                  ))}
                </ul>
                <button
                  className={p.featured ? "btn-primary price-btn" : "btn-ghost price-btn"}
                  onClick={() => onSelectPlan(p.key || p.name.toLowerCase())}
                >
                  Choose {p.name}
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
