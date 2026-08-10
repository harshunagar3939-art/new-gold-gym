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

// On Vercel each request may hit a fresh (or reused, warm) serverless
// instance, so we ensure the DB connection is ready before every request
// instead of connecting once at boot.
app.use(async (req, res, next) => {
  try {
    await connectDB();
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
