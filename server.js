const express = require("express");
const mongoose = require("mongoose");
const multer = require("multer");
const cors = require("cors");
const dotenv = require("dotenv");
const path = require("path");
const fs = require("fs");
const Application = require("./models/Application");

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// Ensure upload folder exists
const uploadDir = process.env.UPLOAD_DIR || "uploads";
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Serve uploaded files
app.use("/uploads", express.static(path.join(__dirname, uploadDir)));

// Multer configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    const uniqueName = Date.now() + "_" + file.originalname;
    cb(null, uniqueName);
  },
});

const upload = multer({ storage });

// Connect to MongoDB
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.error(err));

// Test route
app.get("/", (req, res) => res.send("Server is running"));
// Get all applications
app.get("/applications", async (req, res) => {
  try {
    const applications = await Application.find().sort({ createdAt: -1 }); // newest first
    res.json(applications);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error fetching applications" });
  }
});
// Update application status
app.patch("/applications/:id/status", async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body; // expected value: "Approved" or "Rejected" etc.

    if (!status) {
      return res.status(400).json({ message: "Status is required" });
    }

    const application = await Application.findByIdAndUpdate(
      id,
      { status },
      { new: true }
    );

    if (!application) {
      return res.status(404).json({ message: "Application not found" });
    }

    res.json({ message: `Status updated to ${status}`, application });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error updating status" });
  }
});


// Apply route
app.post(
  "/apply",
  upload.fields([
    { name: "photo", maxCount: 1 },
    { name: "passportImage", maxCount: 1 },
    { name: "certificate", maxCount: 1 },
  ]),
  async (req, res) => {
    try {
      const { name, phone, country, passport, experience } = req.body;

      if (!req.files.photo || !req.files.passportImage) {
        return res.status(400).json({ message: "Photo and passport are required" });
      }

      const photoURL = req.files.photo[0].path.replace(/\\/g, "/");
      const passportURL = req.files.passportImage[0].path.replace(/\\/g, "/");
      const certificateURL = req.files.certificate ? req.files.certificate[0].path.replace(/\\/g, "/") : "";

      const application = new Application({
        name,
        phone,
        country,
        passport,
        experience,
        photoURL,
        passportURL,
        certificateURL,
      });

      await application.save();

      res.status(201).json({ message: "Application submitted successfully!" });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Error submitting application" });
    }
  }
);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
