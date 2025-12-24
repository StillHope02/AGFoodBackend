const mongoose = require("mongoose");

const applicationSchema = new mongoose.Schema({
  name: { type: String, required: true },
  phone: { type: String, required: true },
  country: { type: String, required: true },
  email: { type: String, required: true },
  // passport: { type: String, required: true },
  experience: { type: String, required: true },
  photoURL: { type: String, required: true },
  passportURL: { type: String, required: true },
  certificateURL: { type: String, default: "" },
  status: { type: String, default: "Pending" },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Application", applicationSchema);
