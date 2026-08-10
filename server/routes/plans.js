const express = require("express");
const { body, validationResult } = require("express-validator");
const Plan = require("../models/Plan");
const { protect, adminOnly } = require("../middleware/auth");

const router = express.Router();

router.get("/", async (req, res, next) => {
  try {
    const plans = await Plan.find().sort({ price: 1 });
    res.json(plans);
  } catch (err) {
    next(err);
  }
});

router.post(
  "/",
  protect,
  adminOnly,
  [
    body("key").trim().notEmpty().withMessage("Key required."),
    body("name").trim().notEmpty().withMessage("Name required."),
    body("price").isNumeric().withMessage("Price must be a number."),
    body("features").isArray({ min: 1 }).withMessage("At least one feature required."),
  ],
  async (req, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) return res.status(400).json({ error: errors.array()[0].msg });

      const plan = await Plan.create(req.body);
      res.status(201).json(plan);
    } catch (err) {
      next(err);
    }
  }
);

router.put(
  "/:id",
  protect,
  adminOnly,
  [
    body("name").optional().trim().notEmpty(),
    body("price").optional().isNumeric(),
    body("features").optional().isArray({ min: 1 }),
  ],
  async (req, res, next) => {
    try {
      const plan = await Plan.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
      if (!plan) return res.status(404).json({ error: "Plan not found." });
      res.json(plan);
    } catch (err) {
      next(err);
    }
  }
);

router.delete("/:id", protect, adminOnly, async (req, res, next) => {
  try {
    const plan = await Plan.findByIdAndDelete(req.params.id);
    if (!plan) return res.status(404).json({ error: "Plan not found." });
    res.json({ message: "Plan deleted." });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
