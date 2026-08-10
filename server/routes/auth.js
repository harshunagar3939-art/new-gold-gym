const express = require("express");
const jwt = require("jsonwebtoken");
const { body, validationResult } = require("express-validator");
const User = require("../models/User");
const { protect, adminOnly } = require("../middleware/auth");

const router = express.Router();

function signToken(user) {
  const secret = process.env.JWT_SECRET || "gold_gym_secret_key_2026_safe";
  return jwt.sign({ id: user._id, role: user.role }, secret, {
    expiresIn: "7d",
  });
}

router.post(
  "/login",
  [
    body("email").isEmail().normalizeEmail().withMessage("Valid email required."),
    body("password").notEmpty().withMessage("Password required."),
  ],
  async (req, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ error: errors.array()[0].msg });
      }

      const { email, password } = req.body;
      const user = await User.findOne({ email }).select("+password");
      if (!user || !(await user.comparePassword(password))) {
        return res.status(401).json({ error: "Invalid email or password." });
      }

      const token = signToken(user);
      res.json({
        token,
        user: { id: user._id, name: user.name, email: user.email, role: user.role },
      });
    } catch (err) {
      next(err);
    }
  }
);

router.post(
  "/register",
  [
    body("name").notEmpty().trim().withMessage("Name is required."),
    body("email").isEmail().normalizeEmail().withMessage("Valid email required."),
    body("password").isLength({ min: 6 }).withMessage("Password must be at least 6 characters."),
  ],
  async (req, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ error: errors.array()[0].msg });
      }

      const { name, email, password } = req.body;
      const existing = await User.findOne({ email });
      if (existing) {
        return res.status(400).json({ error: "User with this email already exists." });
      }

      const user = await User.create({ name, email, password, role: "member" });
      const token = signToken(user);

      res.status(201).json({
        token,
        user: { id: user._id, name: user.name, email: user.email, role: user.role },
      });
    } catch (err) {
      next(err);
    }
  }
);

router.get("/me", protect, async (req, res) => {
  if (req.user.id === "legacy-admin") {
    return res.json({ id: "legacy-admin", name: "Gold Admin", role: "admin" });
  }
  res.json({
    id: req.user._id,
    name: req.user.name,
    email: req.user.email,
    role: req.user.role,
  });
});

router.get("/users", protect, adminOnly, async (req, res, next) => {
  try {
    const users = await User.find().select("-password").sort({ createdAt: -1 });
    res.json(users);
  } catch (err) {
    next(err);
  }
});

router.delete("/users/:id", protect, adminOnly, async (req, res, next) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) return res.status(404).json({ error: "User not found." });
    res.json({ message: "User deleted successfully." });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
