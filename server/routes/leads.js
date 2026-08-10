const express = require("express");
const { body, validationResult } = require("express-validator");
const Lead = require("../models/Lead");
const { protect, adminOnly } = require("../middleware/auth");

const router = express.Router();

router.post(
  "/",
  [
    body("name").trim().notEmpty().withMessage("Name is required."),
    body("phone").trim().notEmpty().withMessage("Phone is required."),
    body("email").optional({ checkFalsy: true }).isEmail().withMessage("Invalid email."),
  ],
  async (req, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ error: errors.array()[0].msg });
      }

      const { name, phone, email, goal, message, plan } = req.body;
      const lead = await Lead.create({ name, phone, email, goal, message, plan });
      res.status(201).json(lead);
    } catch (err) {
      next(err);
    }
  }
);

router.get("/", protect, adminOnly, async (req, res, next) => {
  try {
    const { status, page = 1, limit = 50 } = req.query;
    const filter = status ? { status } : {};
    const skip = (Math.max(1, Number(page)) - 1) * Number(limit);

    const [leads, total] = await Promise.all([
      Lead.find(filter).sort({ createdAt: -1 }).skip(skip).limit(Number(limit)),
      Lead.countDocuments(filter),
    ]);

    res.json({ leads, total, page: Number(page), pages: Math.ceil(total / Number(limit)) });
  } catch (err) {
    next(err);
  }
});

router.patch(
  "/:id",
  protect,
  adminOnly,
  [body("status").isIn(["new", "contacted", "converted", "closed"]).withMessage("Invalid status.")],
  async (req, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ error: errors.array()[0].msg });
      }

      const lead = await Lead.findByIdAndUpdate(req.params.id, { status: req.body.status }, { new: true });
      if (!lead) return res.status(404).json({ error: "Lead not found." });
      res.json(lead);
    } catch (err) {
      next(err);
    }
  }
);

router.delete("/:id", protect, adminOnly, async (req, res, next) => {
  try {
    const lead = await Lead.findByIdAndDelete(req.params.id);
    if (!lead) return res.status(404).json({ error: "Lead not found." });
    res.json({ message: "Lead deleted." });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
