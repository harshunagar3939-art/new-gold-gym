import { useEffect, useState } from "react";
import useReveal from "../hooks/useReveal";
import { getPlans } from "../api/api";

const FALLBACK = [
  {
    key: "basic",
    name: "Basic",
    price: 999,
    period: "/mo",
    featured: false,
    features: ["Full gym floor access", "Locker room & showers", "Standard hours (6AM–10PM)"],
  },
  {
    key: "gold",
    name: "Gold",
    price: 1999,
    period: "/mo",
    featured: true,
    features: ["Everything in Basic", "24/7 access", "4 group classes / week", "Nutrition check-ins"],
  },
  {
    key: "elite",
    name: "Elite",
    price: 3499,
    period: "/mo",
    featured: false,
    features: ["Everything in Gold", "2 personal training sessions", "Recovery lab access", "Priority booking"],
  },
];

export default function Pricing({ onSelectPlan }) {
  const [headRef, headIn] = useReveal();
  const [gridRef, gridIn] = useReveal();
  const [plans, setPlans] = useState(FALLBACK);
  const [isYearly, setIsYearly] = useState(false);
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
    return () => {
      mounted = false;
      window.removeEventListener("focus", fetchPlans);
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
            <p>Flexible plans. Zero hidden admission fees. Upgrade or pause anytime.</p>
            {/* BILLING TOGGLE SWITCH */}
            <div className="pricing-toggle-wrap">
              <span className={!isYearly ? "toggle-label active" : "toggle-label"}>Monthly</span>
              <button
                type="button"
                className={`pricing-toggle-switch ${isYearly ? "yearly" : ""}`}
                onClick={() => setIsYearly((v) => !v)}
                aria-label="Toggle Billing Period"
              >
                <span className="pricing-toggle-knob"></span>
              </button>
              <span className={isYearly ? "toggle-label active" : "toggle-label"}>
                Yearly <span className="discount-tag">SAVE 20%</span>
              </span>
            </div>
          </div>
        </div>

        <div className={`pricing-grid reveal ${gridIn ? "in-view" : ""}`} ref={gridRef}>
          {plans.map((p) => {
            const rawPrice = p.price || 999;
            const finalPrice = isYearly ? Math.round(rawPrice * 0.8 * 12) : rawPrice;
            const periodStr = isYearly ? "/yr" : p.period || "/mo";

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
                  ₹{finalPrice.toLocaleString()}
                  <sup>{periodStr}</sup>
                </div>
                <div className="per">{isYearly ? "Billed annually (Save 20%)" : "Billed monthly"}</div>
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
