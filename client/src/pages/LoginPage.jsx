import { useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import AmbientDumbbell from "../components/AmbientDumbbell";
import { useAuth } from "../context/AuthContext";

export default function LoginPage() {
  const { login, registerUser, user, isAdmin } = useAuth();
  const navigate = useNavigate();
  const [isRegister, setIsRegister] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  if (user && isAdmin) {
    return <Navigate to="/admin" replace />;
  }

  if (user && !isAdmin) {
    return <Navigate to="/" replace />;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setSubmitting(true);

    try {
      if (isRegister) {
        if (!name.trim()) {
          setError("Please enter your name.");
          setSubmitting(false);
          return;
        }
        const newUser = await registerUser(name, email, password);
        navigate("/");
      } else {
        const loggedIn = await login(email, password);
        navigate(loggedIn.role === "admin" ? "/admin" : "/");
      }
    } catch (err) {
      setError(err.response?.data?.error || "Authentication failed. Please check credentials.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="auth-page">
      <AmbientDumbbell variant="full" />
      <div className="auth-card">
        <Link to="/" className="auth-logo">
          NEW GOLD<span>•</span>GYM
        </Link>

        <div className="auth-tabs">
          <button
            type="button"
            className={`auth-tab-btn ${!isRegister ? "active" : ""}`}
            onClick={() => {
              setIsRegister(false);
              setError("");
            }}
          >
            Sign In
          </button>
          <button
            type="button"
            className={`auth-tab-btn ${isRegister ? "active" : ""}`}
            onClick={() => {
              setIsRegister(true);
              setError("");
            }}
          >
            Register
          </button>
        </div>

        <h1>{isRegister ? "Join New Gold Gym" : "Account Login"}</h1>
        <p className="auth-sub">
          {isRegister
            ? "Create your member account to access training & plans."
            : "Sign in with your email to access member account or admin panel."}
        </p>

        <form onSubmit={handleSubmit} className="auth-form">
          {error && <div className="auth-error">{error}</div>}

          {isRegister && (
            <label>
              Full Name
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="John Doe"
                required
              />
            </label>
          )}

          <label>
            Email Address
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="user@example.com"
              required
              autoComplete="email"
            />
          </label>
          <label>
            Password
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              autoComplete="current-password"
            />
          </label>

          <button type="submit" className="btn-primary auth-submit" disabled={submitting}>
            {submitting ? "Processing..." : isRegister ? "Create Account" : "Sign In"}
          </button>
        </form>

        <Link to="/" className="auth-back">
          ← Back to Home Page
        </Link>
      </div>
    </div>
  );
}
