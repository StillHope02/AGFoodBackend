// // const express = require("express");
// // const mongoose = require("mongoose");
// // const multer = require("multer");
// // const cors = require("cors");
// // const dotenv = require("dotenv");
// // const path = require("path");
// // const fs = require("fs");
// // const Application = require("./models/Application");

// // dotenv.config();

// // const app = express();
// // app.use(cors());
// // app.use(express.json());

// // // Ensure upload folder exists
// // const uploadDir = process.env.UPLOAD_DIR || "uploads";
// // if (!fs.existsSync(uploadDir)) {
// //   fs.mkdirSync(uploadDir, { recursive: true });
// // }

// // // Serve uploaded files
// // app.use("/uploads", express.static(path.join(__dirname, uploadDir)));

// // // Multer configuration
// // const storage = multer.diskStorage({
// //   destination: (req, file, cb) => cb(null, uploadDir),
// //   filename: (req, file, cb) => {
// //     const uniqueName = Date.now() + "_" + file.originalname;
// //     cb(null, uniqueName);
// //   },
// // });

// // const upload = multer({ storage });

// // // Connect to MongoDB
// // mongoose
// //   .connect(process.env.MONGO_URI)
// //   .then(() => console.log("MongoDB connected"))
// //   .catch((err) => console.error(err));

// // // Test route
// // app.get("/", (req, res) => res.send("Server is running"));
// // // Get all applications
// // app.get("/applications", async (req, res) => {
// //   try {
// //     const applications = await Application.find().sort({ createdAt: -1 }); // newest first
// //     res.json(applications);
// //   } catch (err) {
// //     console.error(err);
// //     res.status(500).json({ message: "Error fetching applications" });
// //   }
// // });
// // // Update application status
// // app.patch("/applications/:id/status", async (req, res) => {
// //   try {
// //     const { id } = req.params;
// //     const { status } = req.body; // expected value: "Approved" or "Rejected" etc.

// //     if (!status) {
// //       return res.status(400).json({ message: "Status is required" });
// //     }

// //     const application = await Application.findByIdAndUpdate(
// //       id,
// //       { status },
// //       { new: true }
// //     );

// //     if (!application) {
// //       return res.status(404).json({ message: "Application not found" });
// //     }

// //     res.json({ message: `Status updated to ${status}`, application });
// //   } catch (err) {
// //     console.error(err);
// //     res.status(500).json({ message: "Error updating status" });
// //   }
// // });


// // // Apply route
// // app.post(
// //   "/apply",
// //   upload.fields([
// //     { name: "photo", maxCount: 1 },
// //     { name: "passportImage", maxCount: 1 },
// //     { name: "certificate", maxCount: 1 },
// //   ]),
// //   async (req, res) => {
// //     try {
// //       const { name, phone, country, passport, experience } = req.body;

// //       if (!req.files.photo || !req.files.passportImage) {
// //         return res.status(400).json({ message: "Photo and passport are required" });
// //       }

// //       const photoURL = req.files.photo[0].path.replace(/\\/g, "/");
// //       const passportURL = req.files.passportImage[0].path.replace(/\\/g, "/");
// //       const certificateURL = req.files.certificate ? req.files.certificate[0].path.replace(/\\/g, "/") : "";

// //       const application = new Application({
// //         name,
// //         phone,
// //         country,
// //         passport,
// //         experience,
// //         photoURL,
// //         passportURL,
// //         certificateURL,
// //       });

// //       await application.save();

// //       res.status(201).json({ message: "Application submitted successfully!" });
// //     } catch (err) {
// //       console.error(err);
// //       res.status(500).json({ message: "Error submitting application" });
// //     }
// //   }
// // );

// // const PORT = process.env.PORT || 5000;
// // app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
// // ============================================
// // SERVER.JS - Complete Backend Code
// // ============================================
// require('dotenv').config(); // MUST BE FIRST LINE!

// const express = require("express");
// const mongoose = require("mongoose");
// const cors = require("cors");
// const PDFDocument = require("pdfkit");
// const multer = require("multer");
// const path = require("path");
// const fs = require("fs");

// const app = express();
// app.use(cors());
// app.use(express.json());

// // Ensure upload folder exists
// const uploadDir = process.env.UPLOAD_DIR || "uploads";
// if (!fs.existsSync(uploadDir)) {
//   fs.mkdirSync(uploadDir, { recursive: true });
// }

// // Serve uploaded files
// app.use("/uploads", express.static(path.join(__dirname, uploadDir)));

// // Multer configuration for file uploads
// const storage = multer.diskStorage({
//   destination: (req, file, cb) => cb(null, uploadDir),
//   filename: (req, file, cb) => {
//     const uniqueName = Date.now() + "_" + file.originalname;
//     cb(null, uniqueName);
//   },
// });
// const upload = multer({ storage });

// // ============================================
// // USER MODEL
// // ============================================
// const userSchema = new mongoose.Schema({
//   fullName: { type: String, required: true },
//   dateOfBirth: { type: String, required: true },
//   passportNumber: { type: String, required: true, unique: true },
//   expiryDate: { type: String, required: true },
//   workField: { type: String, required: true },
//   description: { type: String, default: "" },
//   createdAt: { type: Date, default: Date.now },
// });

// const User = mongoose.model("User", userSchema);

// // ============================================
// // APPLICATION MODEL (from your existing code)
// // ============================================
// const applicationSchema = new mongoose.Schema({
//   name: { type: String, required: true },
//   phone: { type: String, required: true },
//   country: { type: String, required: true },
//   passport: { type: String, required: true },
//   experience: { type: String, required: true },
//   photoURL: { type: String, required: true },
//   passportURL: { type: String, required: true },
//   certificateURL: { type: String, default: "" },
//   status: { type: String, default: "Pending" },
//   createdAt: { type: Date, default: Date.now },
// });

// const Application = mongoose.model("Application", applicationSchema);

// // ============================================
// // MONGODB CONNECTION
// // ============================================
// mongoose
//   .connect(process.env.MONGO_URI)
//   .then(async () => {
//     console.log("✅ MongoDB connected successfully");

//     // Fix old index issues - remove all old indexes
//     try {
//       const collection = mongoose.connection.db.collection('users');

//       // Drop username index
//       await collection.dropIndex('username_1').catch(() => {});
//       console.log('✅ Removed username index');

//       // Drop email index
//       await collection.dropIndex('email_1').catch(() => {});
//       console.log('✅ Removed email index');

//       // Drop any other old indexes except _id and passportNumber
//       const indexes = await collection.indexes();
//       for (const index of indexes) {
//         if (index.name !== '_id_' && index.name !== 'passportNumber_1') {
//           await collection.dropIndex(index.name).catch(() => {});
//           console.log(`✅ Removed index: ${index.name}`);
//         }
//       }

//       console.log('✅ All old indexes cleaned up!');
//     } catch (err) {
//       console.log('ℹ️ Index cleanup completed');
//     }
//   })
//   .catch((err) => {
//     console.error("❌ MongoDB connection error:", err);
//     process.exit(1);
//   });

// // ============================================
// // TEST ROUTE
// // ============================================
// app.get("/", (req, res) => {
//   res.json({ 
//     message: "AG Food Server is running", 
//     endpoints: {
//       users: "/api/users",
//       applications: "/applications"
//     }
//   });
// });

// // ============================================
// // USER MANAGEMENT ROUTES
// // ============================================

// // GET ALL USERS WITH SEARCH
// app.get("/api/users", async (req, res) => {
//   try {
//     const { q } = req.query;
//     let query = {};

//     if (q) {
//       query = {
//         $or: [
//           { fullName: { $regex: q, $options: "i" } },
//           { passportNumber: { $regex: q, $options: "i" } },
//           { workField: { $regex: q, $options: "i" } },
//         ],
//       };
//     }

//     const users = await User.find(query).sort({ createdAt: -1 });
//     res.json(users);
//   } catch (err) {
//     console.error("Error fetching users:", err);
//     res.status(500).json({ message: "Error fetching users", error: err.message });
//   }
// });

// // GET SINGLE USER
// app.get("/api/users/:id", async (req, res) => {
//   try {
//     const user = await User.findById(req.params.id);
//     if (!user) {
//       return res.status(404).json({ message: "User not found" });
//     }
//     res.json(user);
//   } catch (err) {
//     console.error("Error fetching user:", err);
//     res.status(500).json({ message: "Error fetching user", error: err.message });
//   }
// });

// // CREATE NEW USER
// app.post("/api/users", async (req, res) => {
//   try {
//     const { fullName, dateOfBirth, passportNumber, expiryDate, workField, description } = req.body;

//     // Validation
//     if (!fullName || !dateOfBirth || !passportNumber || !expiryDate || !workField) {
//       return res.status(400).json({ 
//         message: "Missing required fields",
//         missingFields: [
//           !fullName && "fullName",
//           !dateOfBirth && "dateOfBirth",
//           !passportNumber && "passportNumber",
//           !expiryDate && "expiryDate",
//           !workField && "workField"
//         ].filter(Boolean)
//       });
//     }

//     // Check if passport number already exists
//     const existingUser = await User.findOne({ passportNumber });
//     if (existingUser) {
//       return res.status(400).json({ message: "Passport number already exists" });
//     }

//     const newUser = new User({
//       fullName,
//       dateOfBirth,
//       passportNumber,
//       expiryDate,
//       workField,
//       description: description || "",
//     });

//     await newUser.save();
//     res.status(201).json({ 
//       message: "User created successfully", 
//       user: newUser 
//     });
//   } catch (err) {
//     console.error("Error creating user:", err);
//     res.status(500).json({ message: "Error creating user", error: err.message });
//   }
// });

// // UPDATE USER
// app.put("/api/users/:id", async (req, res) => {
//   try {
//     const { fullName, dateOfBirth, passportNumber, expiryDate, workField, description } = req.body;

//     // Validation
//     if (!fullName || !dateOfBirth || !passportNumber || !expiryDate || !workField) {
//       return res.status(400).json({ message: "All required fields must be filled" });
//     }

//     // Check if passport number is being changed to one that already exists
//     const existingUser = await User.findOne({ 
//       passportNumber, 
//       _id: { $ne: req.params.id } 
//     });

//     if (existingUser) {
//       return res.status(400).json({ message: "Passport number already exists" });
//     }

//     const updatedUser = await User.findByIdAndUpdate(
//       req.params.id,
//       {
//         fullName,
//         dateOfBirth,
//         passportNumber,
//         expiryDate,
//         workField,
//         description: description || "",
//       },
//       { new: true, runValidators: true }
//     );

//     if (!updatedUser) {
//       return res.status(404).json({ message: "User not found" });
//     }

//     res.json({ 
//       message: "User updated successfully", 
//       user: updatedUser 
//     });
//   } catch (err) {
//     console.error("Error updating user:", err);
//     res.status(500).json({ message: "Error updating user", error: err.message });
//   }
// });

// // DELETE USER
// app.delete("/api/users/:id", async (req, res) => {
//   try {
//     const deletedUser = await User.findByIdAndDelete(req.params.id);

//     if (!deletedUser) {
//       return res.status(404).json({ message: "User not found" });
//     }

//     res.json({ 
//       message: "User deleted successfully",
//       user: deletedUser 
//     });
//   } catch (err) {
//     console.error("Error deleting user:", err);
//     res.status(500).json({ message: "Error deleting user", error: err.message });
//   }
// });

// // GENERATE PDF FOR USER
// app.get("/api/users/:id/pdf", async (req, res) => {
//   try {
//     const user = await User.findById(req.params.id);

//     if (!user) {
//       return res.status(404).json({ message: "User not found" });
//     }

//     // Create PDF
//     const doc = new PDFDocument({ size: "A4", margin: 50 });

//     // Set response headers
//     res.setHeader("Content-Type", "application/pdf");
//     res.setHeader(
//       "Content-Disposition",
//       `attachment; filename="${user.fullName.replace(/\s+/g, "_")}_JobOffer.pdf"`
//     );

//     // Pipe PDF to response
//     doc.pipe(res);

//     // Header with green background
//     doc.rect(0, 0, doc.page.width, 120).fill("#166534");

//     // Title
//     doc.fillColor("#FFFFFF")
//        .fontSize(24)
//        .font("Helvetica-Bold")
//        .text("CANADIAN IMMIGRATION CONSULTANCY", 50, 30, { align: "center" });

//     doc.fontSize(18)
//        .text("JOB OFFER AND AGREEMENT LETTER", 50, 65, { align: "center" });

//     // Date
//     doc.fontSize(10)
//        .text(`Date: ${new Date().toLocaleDateString()}`, 50, 95, { align: "right" });

//     // Reset to black for content
//     doc.fillColor("#000000");

//     // User Information Section
//     let yPos = 160;

//     doc.fontSize(14)
//        .font("Helvetica-Bold")
//        .text("APPLICANT INFORMATION", 50, yPos);

//     yPos += 30;
//     doc.fontSize(11).font("Helvetica");

//     const userInfo = [
//       { label: "Full Name", value: user.fullName },
//       { label: "Date of Birth", value: user.dateOfBirth },
//       { label: "Passport No", value: user.passportNumber },
//       { label: "Expiry Date", value: user.expiryDate },
//       { label: "Work Field", value: user.workField },
//     ];

//     userInfo.forEach(({ label, value }) => {
//       doc.font("Helvetica-Bold").text(`${label}:`, 50, yPos, { continued: true });
//       doc.font("Helvetica").text(` ${value}`, { width: 450 });
//       yPos += 25;
//     });

//     if (user.description) {
//       yPos += 10;
//       doc.font("Helvetica-Bold").text("Description:", 50, yPos);
//       yPos += 20;
//       doc.font("Helvetica").text(user.description, 50, yPos, { width: 500 });
//       yPos += doc.heightOfString(user.description, { width: 500 }) + 20;
//     }

//     // Job Offer Details
//     yPos += 30;
//     doc.fontSize(14)
//        .font("Helvetica-Bold")
//        .text("EMPLOYMENT OFFER", 50, yPos);

//     yPos += 30;
//     doc.fontSize(11).font("Helvetica");

//     const offerText = `The Canadian Natural Resources EDEN FOOD Company are pleased to offer you employment in Canadian Natural Resources EDEN FOOD COMPANY Mountain Ave, Banff, ABT2P418, CANADA. The employment is subjected to the following terms and conditions.

// DESIGNATION: ${user.workField}

// CONTRACT PERIOD: This contract will be valid for a period of 2 years from the date of joining and is renewable after the completion of the first 2 years.

// REMUNERATION AND PERQUISITIES:
// We are offering Basic Monthly Salary 2800 Canadian Dollars with 200 Dollars Bonus and Total salary is 3000 Canadian Dollars.

// BENEFITS:
// • Housing: Suitable housing facility will be provided by the company
// • Medical: Medical coverage as per company rules and regulations
// • Transport: Transport will be provided for official usage
// • Annual Leave: One calendar month for each complete year of employment
// • Leave Passage: Return air passage for economy class (employee + family)
// • Visa Expenses: Will be reimbursed upon joining

// Company Owner: Mr. SARDAR JAGMOHAN SINGH
// Mobile No: +1 343 501 3133 / +44 7441 929399`;

//     doc.text(offerText, 50, yPos, { width: 500, align: "justify" });

//     // Approval Stamp
//     yPos = doc.page.height - 150;
//     doc.fontSize(20)
//        .font("Helvetica-Bold")
//        .fillColor("#16a34a")
//        .text("APPROVED", doc.page.width - 200, yPos, { 
//          align: "center",
//          width: 150 
//        });

//     // Draw stamp circle
//     doc.circle(doc.page.width - 125, yPos + 15, 50)
//        .lineWidth(3)
//        .stroke("#16a34a");

//     // Footer
//     doc.fontSize(8)
//        .fillColor("#666666")
//        .text(
//          "For EDEN FOOD - This is a computer generated document",
//          50,
//          doc.page.height - 50,
//          { align: "center" }
//        );

//     // Finalize PDF
//     doc.end();
//   } catch (err) {
//     console.error("Error generating PDF:", err);
//     res.status(500).json({ message: "Error generating PDF", error: err.message });
//   }
// });

// // ============================================
// // APPLICATION ROUTES (Your existing routes)
// // ============================================

// // Get all applications
// app.get("/applications", async (req, res) => {
//   try {
//     const applications = await Application.find().sort({ createdAt: -1 });
//     res.json(applications);
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ message: "Error fetching applications" });
//   }
// });

// // Update application status
// app.patch("/applications/:id/status", async (req, res) => {
//   try {
//     const { id } = req.params;
//     const { status } = req.body;

//     if (!status) {
//       return res.status(400).json({ message: "Status is required" });
//     }

//     const application = await Application.findByIdAndUpdate(
//       id,
//       { status },
//       { new: true }
//     );

//     if (!application) {
//       return res.status(404).json({ message: "Application not found" });
//     }

//     res.json({ message: `Status updated to ${status}`, application });
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ message: "Error updating status" });
//   }
// });

// // Apply route
// app.post(
//   "/apply",
//   upload.fields([
//     { name: "photo", maxCount: 1 },
//     { name: "passportImage", maxCount: 1 },
//     { name: "certificate", maxCount: 1 },
//   ]),
//   async (req, res) => {
//     try {
//       const { name, phone, country, passport, experience } = req.body;

//       if (!req.files.photo || !req.files.passportImage) {
//         return res.status(400).json({ message: "Photo and passport are required" });
//       }

//       const photoURL = req.files.photo[0].path.replace(/\\/g, "/");
//       const passportURL = req.files.passportImage[0].path.replace(/\\/g, "/");
//       const certificateURL = req.files.certificate ? req.files.certificate[0].path.replace(/\\/g, "/") : "";

//       const application = new Application({
//         name,
//         phone,
//         country,
//         passport,
//         experience,
//         photoURL,
//         passportURL,
//         certificateURL,
//       });

//       await application.save();

//       res.status(201).json({ message: "Application submitted successfully!" });
//     } catch (err) {
//       console.error(err);
//       res.status(500).json({ message: "Error submitting application" });
//     }
//   }
// );

// // ============================================
// // START SERVER
// // ============================================
// const PORT = process.env.PORT || 5000;
// app.listen(PORT, () => {
//   console.log(`🚀 Server running on port ${PORT}`);
//   console.log(`📊 User Management API: http://localhost:${PORT}/api/users`);
//   console.log(`📋 Applications API: http://localhost:${PORT}/applications`);
// });
// ============================================
// SERVER.JS - Complete Backend Code
// ============================================
require('dotenv').config(); // MUST BE FIRST LINE!

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const PDFDocument = require("pdfkit");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

const app = express();

// CORS Configuration - Allow all origins for development
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));

app.use(express.json());

// Ensure upload folder exists
const uploadDir = process.env.UPLOAD_DIR || "uploads";
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Serve uploaded files
app.use("/uploads", express.static(path.join(__dirname, uploadDir)));

// Multer configuration for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    const uniqueName = Date.now() + "_" + file.originalname;
    cb(null, uniqueName);
  },
});
const upload = multer({ storage });

// ============================================
// USER MODEL
// ============================================
const userSchema = new mongoose.Schema({
  fullName: { type: String, required: true },
  dateOfBirth: { type: String, required: true },
  passportNumber: { type: String, required: true, unique: true },
  expiryDate: { type: String, required: true },
  workField: { type: String, required: true },
  description: { type: String, default: "" },
  createdAt: { type: Date, default: Date.now },
});

const User = mongoose.model("User", userSchema);

// ============================================
// APPLICATION MODEL (from your existing code)
// ============================================
const applicationSchema = new mongoose.Schema({
  name: { type: String, required: true },
  phone: { type: String, required: true },
  country: { type: String, required: true },
  email: { type: String, required: true },
  passportNumber: { type: String, required: true },
   jobPosition: { type: String, required: true },
  // passport: { type: String, required: true },
  experience: { type: String, required: true },
  photoURL: { type: String, required: true },
  passportURL: { type: String, required: true },
  certificateURL: { type: String, default: "" },
  status: { type: String, default: "Pending" },
  createdAt: { type: Date, default: Date.now },
});

const Application = mongoose.model("Application", applicationSchema);

// ============================================
// MONGODB CONNECTION
// ============================================
mongoose
  .connect(process.env.MONGO_URI)
  .then(async () => {
    console.log("✅ MongoDB connected successfully");

    // Fix old index issues - remove all old indexes
    try {
      const collection = mongoose.connection.db.collection('users');

      // Drop username index
      await collection.dropIndex('username_1').catch(() => { });
      console.log('✅ Removed username index');

      // Drop email index
      await collection.dropIndex('email_1').catch(() => { });
      console.log('✅ Removed email index');

      // Drop any other old indexes except _id and passportNumber
      const indexes = await collection.indexes();
      for (const index of indexes) {
        if (index.name !== '_id_' && index.name !== 'passportNumber_1') {
          await collection.dropIndex(index.name).catch(() => { });
          console.log(`✅ Removed index: ${index.name}`);
        }
      }

      console.log('✅ All old indexes cleaned up!');
    } catch (err) {
      console.log('ℹ️ Index cleanup completed');
    }
  })
  .catch((err) => {
    console.error("❌ MongoDB connection error:", err);
    process.exit(1);
  });

// ============================================
// TEST ROUTE
// ============================================
app.get("/", (req, res) => {
  res.json({
    message: "AG Food Server is running",
    endpoints: {
      users: "/api/users",
      applications: "/applications"
    }
  });
});

// ============================================
// USER MANAGEMENT ROUTES
// ============================================
// ============================================
// CHECK STATUS API ROUTE
// ============================================

// Add this route to your server.js
// ============================================
// CHECK STATUS API ROUTE - WITH JOB POSITION
// ============================================

// Add this route to your server.js

app.get("/api/check-status/:passportNumber", async (req, res) => {
  try {
    const { passportNumber } = req.params;

    console.log("🔍 Checking status for passport:", passportNumber);

    // Find application by passport number
    const application = await Application.findOne({ 
      passportNumber: passportNumber.toUpperCase() 
    });

    if (!application) {
      return res.status(404).json({ 
        message: "No application found with this passport number" 
      });
    }

    console.log("✅ Found application:", application._id);

    // If approved, find matching user for PDF generation
    let userId = null;
    if (application.status === "Approved") {
      const user = await User.findOne({ 
        fullName: application.name,
        passportNumber: application.passportNumber 
      });
      userId = user ? user._id : null;
    }

    // Return application details - INCLUDE jobPosition
    res.json({
      name: application.name,
      email: application.email,
      phone: application.phone,
      country: application.country,
      jobPosition: application.jobPosition, // ✅ ADDED
      experience: application.experience,
      status: application.status,
      createdAt: application.createdAt,
      userId: userId, // Important for PDF generation
    });

  } catch (err) {
    console.error("❌ Error checking status:", err);
    res.status(500).json({ 
      message: "Error checking status", 
      error: err.message 
    });
  }
});
// app.get("/api/check-status/:passportNumber", async (req, res) => {
//   try {
//     const { passportNumber } = req.params;

//     console.log("🔍 Checking status for passport:", passportNumber);

//     // First, find the application by passport number (stored in User model)
//     const user = await User.findOne({ passportNumber: passportNumber.toUpperCase() });

//     if (!user) {
//       return res.status(404).json({
//         message: "No application found with this passport number"
//       });
//     }

//     // Find matching application by name (since applications don't have passport field)
//     const application = await Application.findOne({ name: user.fullName });

//     if (!application) {
//       return res.status(404).json({
//         message: "Application record not found"
//       });
//     }

//     console.log("✅ Found application:", application._id);

//     // Return application details with user ID for PDF generation
//     res.json({
//       name: user.fullName,
//       email: application.email,
//       phone: application.phone,
//       country: application.country,
//       experience: application.experience,
//       status: application.status,
//       createdAt: application.createdAt,
//       userId: user._id, // Important for PDF generation
//     });

//   } catch (err) {
//     console.error("❌ Error checking status:", err);
//     res.status(500).json({
//       message: "Error checking status",
//       error: err.message
//     });
//   }
// });


// // ============================================
// // ALTERNATIVE: If you want to check by email instead
// // ============================================
app.get("/api/check-status-by-email/:email", async (req, res) => {
  try {
    const { email } = req.params;

    const application = await Application.findOne({ email });

    if (!application) {
      return res.status(404).json({
        message: "No application found with this email"
      });
    }

    // Find user by name to get passport details
    const user = await User.findOne({ fullName: application.name });

    res.json({
      name: application.name,
      email: application.email,
      phone: application.phone,
      country: application.country,
      experience: application.experience,
      status: application.status,
      createdAt: application.createdAt,
      userId: user ? user._id : null,
      passportNumber: user ? user.passportNumber : "Not available",
    });

  } catch (err) {
    console.error("❌ Error checking status:", err);
    res.status(500).json({
      message: "Error checking status",
      error: err.message
    });
  }
});

// GET ALL USERS WITH SEARCH
app.get("/api/users", async (req, res) => {
  try {
    const { q } = req.query;
    let query = {};

    if (q) {
      query = {
        $or: [
          { fullName: { $regex: q, $options: "i" } },
          { passportNumber: { $regex: q, $options: "i" } },
          { workField: { $regex: q, $options: "i" } },
        ],
      };
    }

    const users = await User.find(query).sort({ createdAt: -1 });
    res.json(users);
  } catch (err) {
    console.error("Error fetching users:", err);
    res.status(500).json({ message: "Error fetching users", error: err.message });
  }
});

// GET SINGLE USER
app.get("/api/users/:id", async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.json(user);
  } catch (err) {
    console.error("Error fetching user:", err);
    res.status(500).json({ message: "Error fetching user", error: err.message });
  }
});

// CREATE NEW USER
app.post("/api/users", async (req, res) => {
  try {
    const { fullName, dateOfBirth, passportNumber, expiryDate, workField, description } = req.body;

    // Validation
    if (!fullName || !dateOfBirth || !passportNumber || !expiryDate || !workField) {
      return res.status(400).json({
        message: "Missing required fields",
        missingFields: [
          !fullName && "fullName",
          !dateOfBirth && "dateOfBirth",
          !passportNumber && "passportNumber",
          !expiryDate && "expiryDate",
          !workField && "workField"
        ].filter(Boolean)
      });
    }

    // Check if passport number already exists
    const existingUser = await User.findOne({ passportNumber });
    if (existingUser) {
      return res.status(400).json({ message: "Passport number already exists" });
    }

    const newUser = new User({
      fullName,
      dateOfBirth,
      passportNumber,
      expiryDate,
      workField,
      description: description || "",
    });

    await newUser.save();
    res.status(201).json({
      message: "User created successfully",
      user: newUser
    });
  } catch (err) {
    console.error("Error creating user:", err);
    res.status(500).json({ message: "Error creating user", error: err.message });
  }
});

// UPDATE USER
app.put("/api/users/:id", async (req, res) => {
  try {
    const { fullName, dateOfBirth, passportNumber, expiryDate, workField, description } = req.body;

    // Validation
    if (!fullName || !dateOfBirth || !passportNumber || !expiryDate || !workField) {
      return res.status(400).json({ message: "All required fields must be filled" });
    }

    // Check if passport number is being changed to one that already exists
    const existingUser = await User.findOne({
      passportNumber,
      _id: { $ne: req.params.id }
    });

    if (existingUser) {
      return res.status(400).json({ message: "Passport number already exists" });
    }

    const updatedUser = await User.findByIdAndUpdate(
      req.params.id,
      {
        fullName,
        dateOfBirth,
        passportNumber,
        expiryDate,
        workField,
        description: description || "",
      },
      { new: true, runValidators: true }
    );

    if (!updatedUser) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({
      message: "User updated successfully",
      user: updatedUser
    });
  } catch (err) {
    console.error("Error updating user:", err);
    res.status(500).json({ message: "Error updating user", error: err.message });
  }
});

// DELETE USER
app.delete("/api/users/:id", async (req, res) => {
  try {
    const deletedUser = await User.findByIdAndDelete(req.params.id);

    if (!deletedUser) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({
      message: "User deleted successfully",
      user: deletedUser
    });
  } catch (err) {
    console.error("Error deleting user:", err);
    res.status(500).json({ message: "Error deleting user", error: err.message });
  }
});

// GENERATE PDF FOR USER
app.get("/api/users/:id/pdf", async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Create PDF
    const doc = new PDFDocument({ size: "A4", margin: 50 });

    // Set response headers
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="${user.fullName.replace(/\s+/g, "_")}_JobOffer.pdf"`
    );

    // Pipe PDF to response
    doc.pipe(res);

    // Header with green background
    doc.rect(0, 0, doc.page.width, 120).fill("#166534");

    // Title
    doc.fillColor("#FFFFFF")
      .fontSize(24)
      .font("Helvetica-Bold")
      .text("CANADIAN IMMIGRATION CONSULTANCY", 50, 30, { align: "center" });

    doc.fontSize(18)
      .text("JOB OFFER AND AGREEMENT LETTER", 50, 65, { align: "center" });

    // Date
    doc.fontSize(10)
      .text(`Date: ${new Date().toLocaleDateString()}`, 50, 95, { align: "right" });

    // Reset to black for content
    doc.fillColor("#000000");

    // User Information Section
    let yPos = 160;

    doc.fontSize(14)
      .font("Helvetica-Bold")
      .text("APPLICANT INFORMATION", 50, yPos);

    yPos += 30;
    doc.fontSize(11).font("Helvetica");

    const userInfo = [
      { label: "Full Name", value: user.fullName },
      { label: "Date of Birth", value: user.dateOfBirth },
      { label: "Passport No", value: user.passportNumber },
      { label: "Expiry Date", value: user.expiryDate },
      { label: "Work Field", value: user.workField },
    ];

    userInfo.forEach(({ label, value }) => {
      doc.font("Helvetica-Bold").text(`${label}:`, 50, yPos, { continued: true });
      doc.font("Helvetica").text(` ${value}`, { width: 450 });
      yPos += 25;
    });

    if (user.description) {
      yPos += 10;
      doc.font("Helvetica-Bold").text("Description:", 50, yPos);
      yPos += 20;
      doc.font("Helvetica").text(user.description, 50, yPos, { width: 500 });
      yPos += doc.heightOfString(user.description, { width: 500 }) + 20;
    }

    // Job Offer Details
    yPos += 30;
    doc.fontSize(14)
      .font("Helvetica-Bold")
      .text("EMPLOYMENT OFFER", 50, yPos);

    yPos += 30;
    doc.fontSize(11).font("Helvetica");

    const offerText = `The Canadian Natural Resources EDEN FOOD Company are pleased to offer you employment in Canadian Natural Resources EDEN FOOD COMPANY Mountain Ave, Banff, ABT2P418, CANADA. The employment is subjected to the following terms and conditions.

DESIGNATION: ${user.workField}

CONTRACT PERIOD: This contract will be valid for a period of 2 years from the date of joining and is renewable after the completion of the first 2 years.

REMUNERATION AND PERQUISITIES:
We are offering Basic Monthly Salary 2800 Canadian Dollars with 200 Dollars Bonus and Total salary is 3000 Canadian Dollars.

BENEFITS:
• Housing: Suitable housing facility will be provided by the company
• Medical: Medical coverage as per company rules and regulations
• Transport: Transport will be provided for official usage
• Annual Leave: One calendar month for each complete year of employment
• Leave Passage: Return air passage for economy class (employee + family)
• Visa Expenses: Will be reimbursed upon joining

Company Owner: Mr. SARDAR JAGMOHAN SINGH
Mobile No: +1 343 501 3133 / +44 7441 929399`;

    doc.text(offerText, 50, yPos, { width: 500, align: "justify" });

    // Approval Stamp
    yPos = doc.page.height - 150;
    doc.fontSize(20)
      .font("Helvetica-Bold")
      .fillColor("#16a34a")
      .text("APPROVED", doc.page.width - 200, yPos, {
        align: "center",
        width: 150
      });

    // Draw stamp circle
    doc.circle(doc.page.width - 125, yPos + 15, 50)
      .lineWidth(3)
      .stroke("#16a34a");

    // Footer
    doc.fontSize(8)
      .fillColor("#666666")
      .text(
        "For EDEN FOOD - This is a computer generated document",
        50,
        doc.page.height - 50,
        { align: "center" }
      );

    // Finalize PDF
    doc.end();
  } catch (err) {
    console.error("Error generating PDF:", err);
    res.status(500).json({ message: "Error generating PDF", error: err.message });
  }
});

// ============================================
// APPLICATION ROUTES (Your existing routes)
// ============================================

// Get all applications
app.get("/applications", async (req, res) => {
  try {
    const applications = await Application.find().sort({ createdAt: -1 });
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
    const { status } = req.body;

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

// ============================================
// OFFER LETTER ROUTES
// ============================================

// Serve offer letter HTML page
app.get("/offer-letter", (req, res) => {
  const htmlContent = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Job Offer Letter - AG Food</title>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/qrcodejs/1.0.0/qrcode.min.js"></script>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
            font-family: 'Georgia', serif;
            background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
            padding: 20px;
            min-height: 100vh;
        }
        .container {
            max-width: 800px;
            margin: 0 auto;
            background: white;
            box-shadow: 0 10px 40px rgba(0,0,0,0.1);
            border-radius: 15px;
            overflow: hidden;
        }
        .header {
            background: linear-gradient(135deg, #166534 0%, #15803d 100%);
            color: white;
            padding: 30px;
            text-align: center;
        }
        .header h1 {
            font-size: 24px;
            margin-bottom: 5px;
            text-transform: uppercase;
            letter-spacing: 2px;
        }
        .header .subtitle {
            font-size: 18px;
            font-weight: 600;
            margin-top: 10px;
            border-top: 2px solid rgba(255,255,255,0.3);
            padding-top: 10px;
        }
        .logos {
            display: flex;
            justify-content: space-around;
            align-items: center;
            padding: 20px;
            background: #f9fafb;
            border-bottom: 3px solid #166534;
        }
        .flag {
            width: 80px;
            height: 50px;
            background: linear-gradient(90deg, #ff0000 33%, white 33%, white 66%, #ff0000 66%);
            border: 1px solid #ddd;
            border-radius: 5px;
            position: relative;
        }
        .maple-leaf {
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            font-size: 30px;
        }
        .checkmark {
            width: 60px;
            height: 60px;
            background: #16a34a;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
            font-size: 32px;
        }
        .eden-logo {
            font-size: 36px;
            font-weight: bold;
            color: #84cc16;
            font-style: italic;
        }
        .content { padding: 40px; }
        .date {
            text-align: right;
            font-size: 14px;
            color: #666;
            margin-bottom: 20px;
        }
        .profile-section {
            display: flex;
            gap: 30px;
            margin-bottom: 30px;
            padding: 20px;
            background: #f9fafb;
            border-radius: 10px;
            border-left: 4px solid #166534;
        }
        .profile-photo {
            width: 150px;
            height: 150px;
            border-radius: 10px;
            overflow: hidden;
            border: 3px solid #166534;
            box-shadow: 0 4px 10px rgba(0,0,0,0.1);
        }
        .profile-photo img {
            width: 100%;
            height: 100%;
            object-fit: cover;
        }
        .profile-details { flex: 1; }
        .detail-row {
            display: flex;
            margin-bottom: 12px;
            font-size: 15px;
        }
        .detail-label {
            font-weight: bold;
            width: 150px;
            color: #374151;
        }
        .detail-value { color: #1f2937; }
        .letter-body {
            line-height: 1.8;
            color: #374151;
            margin-bottom: 30px;
        }
        .letter-body h3 {
            color: #166534;
            margin-top: 25px;
            margin-bottom: 15px;
            font-size: 16px;
            text-transform: uppercase;
            border-bottom: 2px solid #166534;
            padding-bottom: 5px;
        }
        .letter-body p {
            margin-bottom: 15px;
            text-align: justify;
        }
        .letter-body ul {
            margin-left: 20px;
            margin-bottom: 15px;
        }
        .letter-body li { margin-bottom: 8px; }
        .approved-stamp {
            text-align: center;
            margin: 30px 0;
        }
        .stamp {
            display: inline-block;
            border: 5px solid #16a34a;
            border-radius: 50%;
            padding: 20px 30px;
            transform: rotate(-15deg);
            box-shadow: 0 4px 15px rgba(22, 101, 52, 0.3);
        }
        .stamp-text {
            font-size: 32px;
            font-weight: bold;
            color: #16a34a;
            text-transform: uppercase;
        }
        .qr-section {
            background: #f9fafb;
            padding: 30px;
            border-radius: 10px;
            text-align: center;
            margin-top: 30px;
            border: 2px dashed #166534;
        }
        .qr-section h3 {
            color: #166534;
            margin-bottom: 15px;
            font-size: 18px;
        }
        .qr-section p {
            color: #666;
            margin-bottom: 20px;
            font-size: 14px;
        }
        #qrcode {
            display: inline-block;
            padding: 15px;
            background: white;
            border-radius: 10px;
            box-shadow: 0 4px 15px rgba(0,0,0,0.1);
        }
        .footer {
            background: #166534;
            color: white;
            text-align: center;
            padding: 20px;
            font-size: 12px;
        }
        .signature-section {
            margin-top: 40px;
            text-align: right;
        }
        .signature-line {
            border-top: 2px solid #374151;
            width: 250px;
            margin-left: auto;
            margin-top: 60px;
            padding-top: 10px;
        }
        .contact-info {
            background: #fef3c7;
            padding: 15px;
            border-radius: 8px;
            margin-top: 20px;
            border-left: 4px solid #f59e0b;
        }
        .contact-info p {
            margin: 5px 0;
            font-size: 14px;
        }
        @media (max-width: 768px) {
            .profile-section {
                flex-direction: column;
                align-items: center;
            }
            .profile-photo {
                width: 120px;
                height: 120px;
            }
            .detail-row { flex-direction: column; }
            .detail-label {
                width: 100%;
                margin-bottom: 5px;
            }
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>Canadian Immigration Consultancy</h1>
            <div class="subtitle">Job Offer and Agreement Letter</div>
        </div>

        <div class="logos">
            <div class="logo-item">
                <div class="flag"><span class="maple-leaf">🍁</span></div>
            </div>
            <div class="logo-item">
                <div class="checkmark">✓</div>
                <div style="margin-top: 5px; font-weight: bold; color: #16a34a;">Thank You</div>
            </div>
            <div class="logo-item">
                <div class="eden-logo">eden</div>
                <div style="font-size: 12px; color: #84cc16;">food for change</div>
            </div>
        </div>

        <div class="content">
            <div class="date">Date: <span id="currentDate"></span></div>

            <div class="profile-section">
                <div class="profile-photo">
                    <img id="applicantPhoto" src="" alt="Applicant Photo">
                </div>
                <div class="profile-details">
                    <div class="detail-row">
                        <span class="detail-label">► Full Name</span>
                        <span class="detail-value">: <span id="applicantName"></span></span>
                    </div>
                    <div class="detail-row">
                        <span class="detail-label">► Date of Birth</span>
                        <span class="detail-value">: 01/04/1979</span>
                    </div>
                    <div class="detail-row">
                        <span class="detail-label">► Passport No</span>
                        <span class="detail-value">: <span id="passportNo"></span></span>
                    </div>
                    <div class="detail-row">
                        <span class="detail-label">► Expiry Date</span>
                        <span class="detail-value">: 08/10/2034</span>
                    </div>
                    <div class="detail-row">
                        <span class="detail-label">► Work</span>
                        <span class="detail-value">: <span id="workField"></span></span>
                    </div>
                </div>
            </div>

            <div class="letter-body">
                <p>
                    The Canadian Natural Resources <strong>EDEN FOOD Company</strong> are pleased to offer you employment in 
                    Canadian Natural Resources EDEN FOOD COMPANY Mountain Ave, Banff, ABT2P418, CANADA. 
                    The employment is subjected to the following terms and conditions.
                </p>

                <h3>Designation</h3>
                <p><strong id="designation">Packing</strong></p>

                <h3>Contract Period</h3>
                <p>This contract will be valid for a period of 2 years from the date of joining and is renewable after the completion of the first 2 years.</p>

                <h3>Remuneration and Perquisities</h3>
                <p>We are offering Basic Monthly Salary <strong>2800 Canadian Dollars</strong> with <strong>200 Dollars Bonus</strong> and Total salary is <strong>3000 Canadian Dollars</strong>.</p>

                <h3>Benefits</h3>
                <ul>
                    <li><strong>Housing:</strong> Suitable housing facility will be provided by the company</li>
                    <li><strong>Medical:</strong> Medical coverage as per company rules and regulations</li>
                    <li><strong>Transport:</strong> Transport will be provided for official usage</li>
                    <li><strong>Annual Leave:</strong> One calendar month for each complete year of employment</li>
                    <li><strong>Leave Passage:</strong> Return air passage for economy class (employee + family)</li>
                    <li><strong>Visa Expenses:</strong> Will be reimbursed upon joining</li>
                </ul>

                <div class="contact-info">
                    <p><strong>Company Owner:</strong> Mr. SARDAR JAGMOHAN SINGH</p>
                    <p><strong>Mobile No:</strong> +1 343 501 3133 / +44 7441 929399</p>
                </div>
            </div>

            <div class="approved-stamp">
                <div class="stamp">
                    <div class="stamp-text">Approved</div>
                </div>
            </div>

            <div class="qr-section">
                <h3>🔒 Verification QR Code</h3>
                <p>Scan this QR code to verify the authenticity of this offer letter</p>
                <div id="qrcode"></div>
                <p style="margin-top: 15px; font-size: 12px; color: #666;">
                    QR Code contains: Applicant Name & Passport Number
                </p>
            </div>

            <div class="signature-section">
                <div class="signature-line">
                    <div style="font-style: italic; font-size: 18px; margin-bottom: 5px;">Jagmohan Singh</div>
                    <div style="font-size: 12px; color: #666;">Authorized Signatory</div>
                    <div style="font-size: 12px; color: #666;">For EDEN FOOD</div>
                </div>
            </div>
        </div>

        <div class="footer">
            For EDEN FOOD - This is a computer generated document
        </div>
    </div>

    <script>
        function getUrlParameter(name) {
            const urlParams = new URLSearchParams(window.location.search);
            return urlParams.get(name);
        }

        async function loadApplicantData() {
            const passportNumber = getUrlParameter('passport');
            
            if (!passportNumber) {
                alert('No passport number provided');
                return;
            }

            try {
                const response = await fetch(\`/api/offer-letter-data/\${passportNumber}\`);
                const data = await response.json();

                if (!response.ok) throw new Error(data.message);

                document.getElementById('applicantName').textContent = data.name;
                document.getElementById('passportNo').textContent = passportNumber;
                document.getElementById('workField').textContent = data.jobPosition || 'Packing';
                document.getElementById('designation').textContent = data.jobPosition || 'Packing';
                
                const today = new Date();
                document.getElementById('currentDate').textContent = today.toLocaleDateString('en-GB');

                // Set photo
                if (data.photoURL) {
                    document.getElementById('applicantPhoto').src = \`/\${data.photoURL}\`;
                } else {
                    document.getElementById('applicantPhoto').src = 'https://via.placeholder.com/150?text=Photo';
                }

                // Generate QR Code
                const qrData = \`Name: \${data.name}\\nPassport: \${passportNumber}\\nPosition: \${data.jobPosition || 'Packing'}\\nStatus: Approved\`;
                
                new QRCode(document.getElementById('qrcode'), {
                    text: qrData,
                    width: 150,
                    height: 150,
                    colorDark: '#166534',
                    colorLight: '#ffffff',
                    correctLevel: QRCode.CorrectLevel.H
                });

            } catch (error) {
                console.error('Error loading data:', error);
                alert('Error loading offer letter: ' + error.message);
            }
        }

        window.onload = loadApplicantData;
    </script>
</body>
</html>
  `;

  res.send(htmlContent);
});

// API endpoint to get offer letter data
app.get("/api/offer-letter-data/:passportNumber", async (req, res) => {
  try {
    const { passportNumber } = req.params;

    const application = await Application.findOne({ 
      passportNumber: passportNumber.toUpperCase() 
    });

    if (!application) {
      return res.status(404).json({ message: "Application not found" });
    }

    if (application.status !== "Approved") {
      return res.status(403).json({ message: "Application not approved yet" });
    }

    res.json({
      name: application.name,
      email: application.email,
      phone: application.phone,
      country: application.country,
      jobPosition: application.jobPosition,
      experience: application.experience,
      photoURL: application.photoURL,
      passportURL: application.passportURL,
    });

  } catch (err) {
    console.error("Error fetching offer letter data:", err);
    res.status(500).json({ message: "Error loading data", error: err.message });
  }
});
// Apply route
// Apply route - FIXED VERSION
app.post(
  "/apply",
  upload.fields([
    { name: "photo", maxCount: 1 },
    { name: "passportImage", maxCount: 1 },
    { name: "certificate", maxCount: 1 },
  ]),
  async (req, res) => {
    try {
      console.log("📝 Request body:", req.body);
      console.log("📎 Files received:", req.files ? Object.keys(req.files) : "No files");

      // Extract form data - INCLUDE jobPosition
      const { name, email, phone, passportNumber, country, jobPosition, experience } = req.body;

      // Validate text fields
      if (!name || !email || !phone || !passportNumber || !country || !jobPosition || !experience) {
        console.log("❌ Missing text fields");
        return res.status(400).json({ 
          message: "All fields are required",
          missing: {
            name: !name,
            email: !email,
            phone: !phone,
            passportNumber: !passportNumber,
            country: !country,
            jobPosition: !jobPosition, // ✅ ADDED
            experience: !experience
          }
        });
      }

      // Validate files
      if (!req.files || !req.files.photo || !req.files.passportImage) {
        console.log("❌ Missing required files");
        return res.status(400).json({ 
          message: "Profile photo and passport image are required",
          filesReceived: req.files ? Object.keys(req.files) : []
        });
      }

      // Check if passport number already exists
      const existingApplication = await Application.findOne({ 
        passportNumber: passportNumber.toUpperCase() 
      });
      
      if (existingApplication) {
        return res.status(400).json({ 
          message: "An application with this passport number already exists" 
        });
      }

      // Process file URLs
      const photoURL = req.files.photo[0].path.replace(/\\/g, "/");
      const passportURL = req.files.passportImage[0].path.replace(/\\/g, "/");
      const certificateURL = req.files.certificate 
        ? req.files.certificate[0].path.replace(/\\/g, "/") 
        : "";

      console.log("✅ All validations passed, creating application...");

      // Create new application - INCLUDE jobPosition
      const application = new Application({
        name,
        email,
        phone,
        passportNumber: passportNumber.toUpperCase(),
        country,
        jobPosition, // ✅ ADDED
        experience,
        photoURL,
        passportURL,
        certificateURL,
      });

      // Save to database
      await application.save();

      console.log("✅ Application saved successfully:", application._id);

      res.status(201).json({ 
        message: "Application submitted successfully!",
        applicationId: application._id
      });

    } catch (err) {
      console.error("❌ Error in /apply route:");
      console.error("Error name:", err.name);
      console.error("Error message:", err.message);
      console.error("Full error:", err);
      
      res.status(500).json({ 
        message: "Error submitting application",
        error: err.message,
        errorType: err.name
      });
    }
  }
);
// app.post(
//   "/apply",
//   upload.fields([
//     { name: "photo", maxCount: 1 },
//     { name: "passportImage", maxCount: 1 },
//     { name: "certificate", maxCount: 1 },
//   ]),
//   async (req, res) => {
//     try {
//       console.log("📝 Request body:", req.body);
//       console.log("📎 Files received:", req.files ? Object.keys(req.files) : "No files");

//       // Extract form data - INCLUDE passportNumber
//       const { name, email, phone, passportNumber, country, experience } = req.body;

//       // Validate text fields
//       if (!name || !email || !phone || !passportNumber || !country || !experience) {
//         console.log("❌ Missing text fields");
//         return res.status(400).json({ 
//           message: "All fields are required",
//           missing: {
//             name: !name,
//             email: !email,
//             phone: !phone,
//             passportNumber: !passportNumber, // ✅ ADDED
//             country: !country,
//             experience: !experience
//           }
//         });
//       }

//       // Validate files
//       if (!req.files || !req.files.photo || !req.files.passportImage) {
//         console.log("❌ Missing required files");
//         return res.status(400).json({ 
//           message: "Profile photo and passport image are required",
//           filesReceived: req.files ? Object.keys(req.files) : []
//         });
//       }

//       // Check if passport number already exists
//       const existingApplication = await Application.findOne({ 
//         passportNumber: passportNumber.toUpperCase() 
//       });
      
//       if (existingApplication) {
//         return res.status(400).json({ 
//           message: "An application with this passport number already exists" 
//         });
//       }

//       // Process file URLs
//       const photoURL = req.files.photo[0].path.replace(/\\/g, "/");
//       const passportURL = req.files.passportImage[0].path.replace(/\\/g, "/");
//       const certificateURL = req.files.certificate 
//         ? req.files.certificate[0].path.replace(/\\/g, "/") 
//         : "";

//       console.log("✅ All validations passed, creating application...");

//       // Create new application - INCLUDE passportNumber
//       const application = new Application({
//         name,
//         email,
//         phone,
//         passportNumber: passportNumber.toUpperCase(), // ✅ ADDED
//         country,
//         experience,
//         photoURL,
//         passportURL,
//         certificateURL,
//       });

//       // Save to database
//       await application.save();

//       console.log("✅ Application saved successfully:", application._id);

//       res.status(201).json({ 
//         message: "Application submitted successfully!",
//         applicationId: application._id
//       });

//     } catch (err) {
//       console.error("❌ Error in /apply route:");
//       console.error("Error name:", err.name);
//       console.error("Error message:", err.message);
//       console.error("Full error:", err);
      
//       res.status(500).json({ 
//         message: "Error submitting application",
//         error: err.message,
//         errorType: err.name
//       });
//     }
//   }
// );
// app.post(
//   "/apply",
//   upload.fields([
//     { name: "photo", maxCount: 1 },
//     { name: "passportImage", maxCount: 1 },
//     { name: "certificate", maxCount: 1 },
//   ]),
//   async (req, res) => {
//     try {
//       console.log("📝 Request body:", req.body);
//       console.log("📎 Files received:", req.files);

//       const { name, email, phone, country, experience } = req.body;

//       // Validate text fields first
//       if (!name || !email || !phone || !country || !experience) {
//         return res.status(400).json({
//           message: "All text fields are required",
//           received: { name, email, phone, country, experience }
//         });
//       }

//       // Validate required files
//       if (!req.files || !req.files.photo || !req.files.passportImage) {
//         return res.status(400).json({
//           message: "Photo and passport image are required",
//           filesReceived: req.files ? Object.keys(req.files) : []
//         });
//       }

//       // Process file paths
//       const photoURL = req.files.photo[0].path.replace(/\\/g, "/");
//       const passportURL = req.files.passportImage[0].path.replace(/\\/g, "/");
//       const certificateURL = req.files.certificate
//         ? req.files.certificate[0].path.replace(/\\/g, "/")
//         : "";

//       // Create application
//       const application = new Application({
//         name,
//         email,
//         phone,
//         country,
//         experience,
//         photoURL,
//         passportURL,
//         certificateURL,
//       });

//       await application.save();

//       console.log("✅ Application saved successfully");
//       res.status(201).json({
//         message: "Application submitted successfully!",
//         applicationId: application._id
//       });

//     } catch (err) {
//       console.error("❌ Error in /apply route:", err);

//       // Send detailed error for debugging
//       res.status(500).json({
//         message: "Error submitting application",
//         error: err.message,
//         stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
//       });
//     }
//   }
// );
// app.post(
//   "/apply",
//   upload.fields([
//     { name: "photo", maxCount: 1 },
//     { name: "passportImage", maxCount: 1 },
//     { name: "certificate", maxCount: 1 },
//   ]),
//   async (req, res) => {
//     try {
//       // const { name, phone, country, passport, experience } = req.body;
//       const { name, email, phone, country, experience } = req.body;


//       // if (!req.files.photo || !req.files.passportImage) {
//       //   return res.status(400).json({ message: "Photo and passport are required" });
//       // }
//        if (!name || !email || !phone || !country || !experience) {
//         return res.status(400).json({ message: "All fields are required" });
//       }

//       // const photoURL = req.files.photo[0].path.replace(/\\/g, "/");
//       // const passportURL = req.files.passportImage[0].path.replace(/\\/g, "/");
//       // const certificateURL = req.files.certificate ? req.files.certificate[0].path.replace(/\\/g, "/") : "";

//       // const application = new Application({
//       //   name,
//       //   phone,
//       //   country,
//       //   passport,
//       //   experience,
//       //   photoURL,
//       //   passportURL,
//       //   certificateURL,
//       // });
//        const photoURL = req.files.photo[0].path.replace(/\\/g, "/");
//       const passportURL = req.files.passportImage[0].path.replace(/\\/g, "/");
//       const certificateURL = req.files.certificate
//         ? req.files.certificate[0].path.replace(/\\/g, "/")
//         : "";

//       const application = new Application({
//         name,
//         email,        
//         phone,
//         country,
//         experience,
//         photoURL,
//         passportURL,
//         certificateURL,
//       });

//       await application.save();

//       res.status(201).json({ message: "Application submitted successfully!" });
//     } catch (err) {
//       console.error(err);
//       res.status(500).json({ message: "Error submitting application" });
//     }
//   }
// );

// ============================================
// START SERVER
// ============================================
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📊 User Management API: http://localhost:${PORT}/api/users`);
  console.log(`📋 Applications API: http://localhost:${PORT}/applications`);
});