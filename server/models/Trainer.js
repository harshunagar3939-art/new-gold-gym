const mongoose = require("mongoose");

const trainerSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    role: { type: String, required: true },
    photo: { type: String, required: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Trainer", trainerSchema);
