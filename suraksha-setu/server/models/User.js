const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    phone: { type: String, required: true, unique: true, trim: true },
    passwordHash: { type: String, required: true },
    fullName: { type: String, default: "" },
    dob: { type: String, default: "" },
    scores: { type: Object, default: {} },
  },
  { timestamps: true },
);

module.exports = mongoose.model("User", userSchema);
