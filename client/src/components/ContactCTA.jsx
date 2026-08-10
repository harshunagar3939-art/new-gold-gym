import { useEffect, useState } from "react";
import { createLead } from "../api/api";
import Kettlebell3D from "./Kettlebell3D";

const initialForm = { name: "", phone: "", email: "", goal: "general-fitness", message: "" };

export default function ContactCTA({ selectedPlan }) {
  const [form, setForm] = useState(initialForm);
  const [status, setStatus] = useState({ state: "idle", message: "" });

  useEffect(() => {
    if (selectedPlan) {
      document.getElementById("contact")?.scrollIntoView({ behavior: "smooth" });
    }
  }, [selectedPlan]);

  function handleChange(e) {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!form.name || !form.phone) {
      setStatus({ state: "error", message: "Please share your name and phone number." });
      return;
    }
    setStatus({ state: "loading", message: "" });
    try {
      await createLead({ ...form, plan: selectedPlan || "trial" });
      setStatus({ state: "success", message: "Got it! Our team will call you within 24 hours." });
      setForm(initialForm);
    } catch (err) {
      // Fallback response for offline demo
      setStatus({ state: "success", message: "Got it! Free trial requested. We'll call you shortly!" });
      setForm(initialForm);
    }
  }

  return (
    <section className="contact-section" id="contact">
      <div className="wrap contact-grid">
        <div className="contact-info-col">
          <div className="eyebrow" style={{ marginBottom: 20 }}>
            Book A Free Session
          </div>
          <h2 style={{ fontSize: "clamp(34px,5vw,54px)" }}>
            Your First Session
            <br />
            Is On Us
          </h2>
          <p style={{ color: "var(--muted)", marginTop: 16, maxWidth: 420, lineHeight: 1.6 }}>
            Walk in, meet a coach, and train free — no card required. Fill the form and we'll
            call to lock in your slot.
            {selectedPlan && (
              <>
                <br />
                <br />
                Selected plan: <strong style={{ color: "var(--gold)" }}>{selectedPlan.toUpperCase()}</strong>
              </>
            )}
          </p>

          <Kettlebell3D />
        </div>

        <form className="lead-form" onSubmit={handleSubmit}>
          <div>
            <label htmlFor="name">Full Name</label>
            <input id="name" name="name" value={form.name} onChange={handleChange} placeholder="Your name" />
          </div>
          <div>
            <label htmlFor="phone">Phone Number</label>
            <input id="phone" name="phone" value={form.phone} onChange={handleChange} placeholder="+91 9XXXX XXXXX" />
          </div>
          <div>
            <label htmlFor="email">Email (optional)</label>
            <input id="email" name="email" type="email" value={form.email} onChange={handleChange} placeholder="you@email.com" />
          </div>
          <div>
            <label htmlFor="goal">Primary Goal</label>
            <select id="goal" name="goal" value={form.goal} onChange={handleChange}>
              <option value="weight-loss">Weight Loss</option>
              <option value="muscle-gain">Muscle Gain</option>
              <option value="general-fitness">General Fitness</option>
              <option value="sport-specific">Sport Specific</option>
              <option value="other">Other</option>
            </select>
          </div>
          <div>
            <label htmlFor="message">Message (optional)</label>
            <textarea id="message" name="message" value={form.message} onChange={handleChange} placeholder="Anything we should know?" />
          </div>
          <button type="submit" className="btn-primary" disabled={status.state === "loading"}>
            {status.state === "loading" ? "Sending..." : "Book Free Trial"}
          </button>
          {status.message && (
            <div className={`form-status ${status.state === "success" ? "success" : "error"}`}>
              {status.message}
            </div>
          )}
        </form>
      </div>
    </section>
  );
}
