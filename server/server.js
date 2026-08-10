require("dotenv").config();
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const connectDB = require("./config/db");
const errorHandler = require("./middleware/errorHandler");

const authRouter = require("./routes/auth");
const leadsRouter = require("./routes/leads");
const programsRouter = require("./routes/programs");
const trainersRouter = require("./routes/trainers");
const plansRouter = require("./routes/plans");
const statsRouter = require("./routes/stats");

const app = express();

if (!process.env.JWT_SECRET) {
  console.warn("[server] Warning: JWT_SECRET not set. Auth will fail.");
}

app.use(helmet());
app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    credentials: true,
  })
);
app.use(express.json({ limit: "10kb" }));

const Program = require("./models/Program");
const Trainer = require("./models/Trainer");
const Plan = require("./models/Plan");

let seeded = false;
async function autoSeedIfEmpty() {
  if (seeded) return;
  try {
    const progCount = await Program.countDocuments();
    if (progCount === 0) {
      const programs = [
        { order: 1, title: "Strength Training", description: "Barbell fundamentals, progressive overload and powerlifting technique." },
        { order: 2, title: "CrossFit Conditioning", description: "High-intensity functional workouts that build engine and grit." },
        { order: 3, title: "Boxing & Combat", description: "Pad work, bag rounds and footwork drills with certified coaches." },
        { order: 4, title: "Personal Coaching", description: "One-on-one programming built around your goals and recovery." },
        { order: 5, title: "Mobility & Recovery", description: "Stretch labs and recovery sessions to keep you training pain-free." },
        { order: 6, title: "Nutrition Coaching", description: "Meal planning and macro coaching that fits an Indian kitchen." },
      ];
      await Program.insertMany(programs);
      console.log("[auto-seed] Programs initialized.");
    }

    const trainerCount = await Trainer.countDocuments();
    if (trainerCount === 0) {
      const trainers = [
        { name: "Rohan Mehta", role: "Head of Strength", photo: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=500&q=80" },
        { name: "Priya Nair", role: "CrossFit Coach", photo: "https://images.unsplash.com/photo-1594381898411-846e7d193883?w=500&q=80" },
        { name: "Arjun Patel", role: "Boxing Coach", photo: "https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?w=500&q=80" },
        { name: "Sana Sheikh", role: "Nutrition Lead", photo: "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=500&q=80" },
      ];
      await Trainer.insertMany(trainers);
      console.log("[auto-seed] Trainers initialized.");
    }

    const planCount = await Plan.countDocuments();
    if (planCount === 0) {
      const plans = [
        { key: "basic", name: "Basic", price: 999, period: "/mo", featured: false, features: ["Full gym floor access", "Locker room & showers", "Standard hours (6AM–10PM)"] },
        { key: "gold", name: "Gold", price: 1999, period: "/mo", featured: true, features: ["Everything in Basic", "24/7 access", "4 group classes / week", "Nutrition check-ins"] },
        { key: "elite", name: "Elite", price: 3499, period: "/mo", featured: false, features: ["Everything in Gold", "2 personal training sessions", "Recovery lab access", "Priority booking"] },
      ];
      await Plan.insertMany(plans);
      console.log("[auto-seed] Plans initialized.");
    }
    seeded = true;
  } catch (err) {
    console.warn("[auto-seed] Notice:", err.message);
  }
}

// On Vercel each request may hit a fresh (or reused, warm) serverless
// instance, so we ensure the DB connection is ready before every request
// instead of connecting once at boot.
app.use(async (req, res, next) => {
  try {
    await connectDB();
    autoSeedIfEmpty().catch(() => {});
    next();
  } catch (err) {
    res.status(503).json({ error: "Database connection failed." });
  }
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: { error: "Too many login attempts. Try again later." },
});

const leadLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 10,
  message: { error: "Too many submissions. Try again later." },
});

app.get("/", (req, res) => {
  res.json({ status: "ok", message: "New Gold Gym API is running." });
});

app.use("/api/auth", authLimiter, authRouter);
app.use("/api/leads", leadLimiter, leadsRouter);
app.use("/api/programs", programsRouter);
app.use("/api/trainers", trainersRouter);
app.use("/api/plans", plansRouter);
app.use("/api/stats", statsRouter);

app.use((req, res) => {
  res.status(404).json({ error: "Route not found." });
});

app.use(errorHandler);

const PORT = process.env.PORT || 5000;

// Vercel imports this file as a serverless function and calls the exported
// app directly — it must NOT call app.listen(). Only start a normal
// listening server when run locally (e.g. `npm run dev` / `node server.js`).
if (!process.env.VERCEL) {
  connectDB().then(() => {
    app.listen(PORT, () => {
      console.log(`[server] New Gold Gym API listening on port ${PORT}`);
    });
  });
}

module.exports = app;
