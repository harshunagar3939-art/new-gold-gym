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
              <svg className="nav-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                <circle cx="12" cy="7" r="4" />
              </svg>
              <span>Login</span>
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
          <a href={`${homePrefix}#muscle-map`} onClick={() => setMenuOpen(false)}>
            💪 Muscle 3D Map
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
            <Link to="/admin" className="mobile-login-link" onClick={() => setMenuOpen(false)}>
              ⚡ Admin Panel
            </Link>
          ) : user ? (
            <button type="button" className="mobile-logout-btn" onClick={() => { logout(); setMenuOpen(false); }}>
              Logout ({user.name.split(" ")[0]})
            </button>
          ) : (
            <Link to="/login" className="mobile-login-link" onClick={() => setMenuOpen(false)}>
              <svg className="nav-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                <circle cx="12" cy="7" r="4" />
              </svg>
              Login
            </Link>
          )}
        </div>
      )}
    </header>
  );
}
