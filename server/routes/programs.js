const express = require("express");
const { body, validationResult } = require("express-validator");
const Program = require("../models/Program");
const { protect, adminOnly } = require("../middleware/auth");

const router = express.Router();

router.get("/", async (req, res, next) => {
  try {
    const programs = await Program.find().sort({ order: 1 });
    res.json(programs);
  } catch (err) {
    next(err);
  }
});

router.post(
  "/",
  protect,
  adminOnly,
  [
    body("title").trim().notEmpty().withMessage("Title required."),
    body("description").trim().notEmpty().withMessage("Description required."),
    body("order").optional().isInt({ min: 0 }),
  ],
  async (req, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) return res.status(400).json({ error: errors.array()[0].msg });

      const program = await Program.create(req.body);
      res.status(201).json(program);
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
    body("title").optional().trim().notEmpty(),
    body("description").optional().trim().notEmpty(),
    body("order").optional().isInt({ min: 0 }),
  ],
  async (req, res, next) => {
    try {
      const id = req.params.id;
      let program;
      if (mongoose.Types.ObjectId.isValid(id)) {
        program = await Program.findByIdAndUpdate(id, req.body, { new: true, runValidators: true });
      }
      if (!program && req.body.title) {
        program = await Program.findOneAndUpdate({ title: req.body.title }, req.body, { new: true, upsert: true });
      }
      if (!program) {
        program = await Program.create(req.body);
      }
      res.json(program);
    } catch (err) {
      next(err);
    }
  }
);

router.delete("/:id", protect, adminOnly, async (req, res, next) => {
  try {
    const id = req.params.id;
    if (mongoose.Types.ObjectId.isValid(id)) {
      await Program.findByIdAndDelete(id);
    } else {
      await Program.deleteMany({ $or: [{ _id: id }, { title: req.query.title || "" }] });
    }
    res.json({ message: "Program deleted." });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
