const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  fullName: { type: String, required: true },
  dateOfBirth: { type: String, required: true },
  passportNumber: { type: String, required: true, unique: true },
  expiryDate: { type: String, required: true },
  workField: { type: String, required: true },
  description: { type: String, default: "" },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("User", userSchema);