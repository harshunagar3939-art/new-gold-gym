const express = require("express");
const { body, validationResult } = require("express-validator");
const Trainer = require("../models/Trainer");
const { protect, adminOnly } = require("../middleware/auth");

const router = express.Router();

router.get("/", async (req, res, next) => {
  try {
    const trainers = await Trainer.find().sort({ createdAt: 1 });
    res.json(trainers);
  } catch (err) {
    next(err);
  }
});

router.post(
  "/",
  protect,
  adminOnly,
  [
    body("name").trim().notEmpty().withMessage("Name required."),
    body("role").trim().notEmpty().withMessage("Role required."),
    body("photo").optional().isURL().withMessage("Photo must be a valid URL."),
  ],
  async (req, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) return res.status(400).json({ error: errors.array()[0].msg });

      const trainer = await Trainer.create(req.body);
      res.status(201).json(trainer);
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
    body("role").optional().trim().notEmpty(),
    body("photo").optional().isURL(),
  ],
  async (req, res, next) => {
    try {
      const trainer = await Trainer.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
      if (!trainer) return res.status(404).json({ error: "Trainer not found." });
      res.json(trainer);
    } catch (err) {
      next(err);
    }
  }
);

router.delete("/:id", protect, adminOnly, async (req, res, next) => {
  try {
    const trainer = await Trainer.findByIdAndDelete(req.params.id);
    if (!trainer) return res.status(404).json({ error: "Trainer not found." });
    res.json({ message: "Trainer deleted." });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
