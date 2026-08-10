const mongoose = require("mongoose");

const leadSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    phone: { type: String, required: true, trim: true },
    email: { type: String, trim: true, lowercase: true },
    goal: {
      type: String,
      enum: ["weight-loss", "muscle-gain", "general-fitness", "sport-specific", "other"],
      default: "general-fitness",
    },
    message: { type: String, trim: true },
    plan: { type: String, enum: ["basic", "gold", "elite", "trial"], default: "trial" },
    status: { type: String, enum: ["new", "contacted", "converted", "closed"], default: "new" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Lead", leadSchema);
