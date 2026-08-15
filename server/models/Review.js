const mongoose = require("mongoose");

const reviewSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    rating: { type: Number, required: true, min: 1, max: 5, default: 5 },
    comment: { type: String, required: true },
    role: { type: String, default: "Member" },
    status: { type: String, enum: ["approved", "pending"], default: "approved" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Review", reviewSchema);
