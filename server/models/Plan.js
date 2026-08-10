const mongoose = require("mongoose");

const planSchema = new mongoose.Schema(
  {
    key: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    price: { type: Number, required: true },
    period: { type: String, default: "/mo" },
    featured: { type: Boolean, default: false },
    features: { type: [String], default: [] },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Plan", planSchema);
