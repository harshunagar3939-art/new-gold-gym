const express = require("express");
const { body, validationResult } = require("express-validator");
const mongoose = require("mongoose");
const Review = require("../models/Review");
const { protect, adminOnly } = require("../middleware/auth");

const router = express.Router();

// GET all approved or all reviews
router.get("/", async (req, res, next) => {
  try {
    const { status } = req.query;
    const filter = status ? { status } : {};
    const reviews = await Review.find(filter).sort({ createdAt: -1 });
    res.json(reviews);
  } catch (err) {
    next(err);
  }
});

// POST new user review (Public)
router.post(
  "/",
  [
    body("name").trim().notEmpty().withMessage("Name required."),
    body("comment").trim().notEmpty().withMessage("Comment required."),
    body("rating").optional().isInt({ min: 1, max: 5 }),
    body("role").optional().trim(),
  ],
  async (req, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) return res.status(400).json({ error: errors.array()[0].msg });

      const review = await Review.create({
        name: req.body.name,
        rating: req.body.rating || 5,
        comment: req.body.comment,
        role: req.body.role || "Member",
        status: "approved", // Auto-approved for instant satisfaction
      });
      res.status(201).json(review);
    } catch (err) {
      next(err);
    }
  }
);

// PATCH update status or content (Admin)
router.patch("/:id", protect, adminOnly, async (req, res, next) => {
  try {
    const id = req.params.id;
    let review;
    if (mongoose.Types.ObjectId.isValid(id)) {
      review = await Review.findByIdAndUpdate(id, req.body, { new: true });
    }
    res.json(review || { _id: id, ...req.body });
  } catch (err) {
    next(err);
  }
});

// DELETE review (Admin)
router.delete("/:id", protect, adminOnly, async (req, res, next) => {
  try {
    const id = req.params.id;
    if (mongoose.Types.ObjectId.isValid(id)) {
      await Review.findByIdAndDelete(id);
    }
    res.json({ message: "Review deleted." });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
