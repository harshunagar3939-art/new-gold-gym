import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import AmbientDumbbell from "./AmbientDumbbell";

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const { user, isAdmin, logout } = useAuth();
  const location = useLocation();
  const isHome = location.pathname === "/";

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    setMenuOpen(false);
  }, [location.pathname]);

  const homePrefix = isHome ? "" : "/";

  return (
    <header style={{ borderBottomColor: scrolled ? "rgba(201,162,75,0.3)" : undefined }}>
      <nav>
        <Link to="/" className="logo">
          <AmbientDumbbell variant="mini" className="nav-dumbbell" />
          NEW GOLD<span>•</span>GYM
        </Link>
        <ul className="nav-links">
          <li>
            <a href={`${homePrefix}#programs`}>Programs</a>
          </li>
          <li>
            <a href={`${homePrefix}#muscle-map`} className="nav-3d-link">💪 Muscle 3D Map</a>
          </li>
          <li>
            <a href={`${homePrefix}#trainers`}>Trainers</a>
          </li>
          <li>
            <a href={`${homePrefix}#pricing`}>Pricing</a>
          </li>
          <li>
            <a href={`${homePrefix}#contact`}>Contact</a>
          </li>
        </ul>
        <div className="nav-actions">
          {isAdmin ? (
            <Link to="/admin" className="nav-login nav-admin-badge">
              ⚡ Admin Panel
            </Link>
          ) : user ? (
            <div className="nav-user-chip">
              <span className="nav-user-name">Hi, {user.name.split(" ")[0]}</span>
              <button type="button" className="nav-login nav-logout-btn" onClick={logout}>
                Logout
              </button>
            </div>
          ) : (
            <Link to="/login" className="nav-login">
              Login
            </Link>
          )}
          <a href={`${homePrefix}#pricing`} className="nav-cta">
            Join Now
          </a>
        </div>
        <button className="burger" aria-label="Menu" onClick={() => setMenuOpen((v) => !v)}>
          <span></span>
          <span></span>
          <span></span>
        </button>
      </nav>
      {menuOpen && (
        <div className="mobile-menu">
          <a href={`${homePrefix}#programs`} onClick={() => setMenuOpen(false)}>
            Programs
          </a>
          <a href={`${homePrefix}#trainers`} onClick={() => setMenuOpen(false)}>
            Trainers
          </a>
          <a href={`${homePrefix}#pricing`} onClick={() => setMenuOpen(false)}>
            Pricing
          </a>
          <a href={`${homePrefix}#contact`} onClick={() => setMenuOpen(false)}>
            Contact
          </a>
          {isAdmin ? (
            <Link to="/admin" onClick={() => setMenuOpen(false)}>
              Admin Panel
            </Link>
          ) : user ? (
            <button type="button" onClick={() => { logout(); setMenuOpen(false); }}>
              Logout
            </button>
          ) : (
            <Link to="/login" onClick={() => setMenuOpen(false)}>
              Login
            </Link>
          )}
        </div>
      )}
    </header>
  );
}
