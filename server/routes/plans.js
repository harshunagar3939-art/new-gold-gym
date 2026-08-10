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

const mongoose = require("mongoose");

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
      const id = req.params.id;
      let plan;
      if (mongoose.Types.ObjectId.isValid(id)) {
        plan = await Plan.findByIdAndUpdate(id, req.body, { new: true, runValidators: true });
      }
      if (!plan && (req.body.key || id)) {
        const searchKey = req.body.key || id;
        plan = await Plan.findOneAndUpdate({ $or: [{ key: searchKey }, { name: req.body.name || searchKey }] }, req.body, { new: true, upsert: true });
      }
      if (!plan) {
        plan = await Plan.create(req.body);
      }
      res.json(plan);
    } catch (err) {
      next(err);
    }
  }
);

router.delete("/:id", protect, adminOnly, async (req, res, next) => {
  try {
    const id = req.params.id;
    if (mongoose.Types.ObjectId.isValid(id)) {
      await Plan.findByIdAndDelete(id);
    } else {
      await Plan.deleteMany({ $or: [{ key: id }, { _id: id }] });
    }
    res.json({ message: "Plan deleted." });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
