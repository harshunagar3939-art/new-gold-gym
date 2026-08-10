const express = require("express");
const Lead = require("../models/Lead");
const Program = require("../models/Program");
const Trainer = require("../models/Trainer");
const Plan = require("../models/Plan");
const { protect, adminOnly } = require("../middleware/auth");

const router = express.Router();

router.get("/", protect, adminOnly, async (req, res, next) => {
  try {
    const [totalLeads, newLeads, programs, trainers, plans] = await Promise.all([
      Lead.countDocuments(),
      Lead.countDocuments({ status: "new" }),
      Program.countDocuments(),
      Trainer.countDocuments(),
      Plan.countDocuments(),
    ]);

    res.json({ totalLeads, newLeads, programs, trainers, plans });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
