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
      await collection.dropIndex('username_1').catch(() => {});
      console.log('✅ Removed username index');
      
      // Drop email index
      await collection.dropIndex('email_1').catch(() => {});
      console.log('✅ Removed email index');
      
      // Drop any other old indexes except _id and passportNumber
      const indexes = await collection.indexes();
      for (const index of indexes) {
        if (index.name !== '_id_' && index.name !== 'passportNumber_1') {
          await collection.dropIndex(index.name).catch(() => {});
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
      console.log("📎 Files received:", req.files);

      const { name, email, phone, country, experience } = req.body;

      // Validate text fields first
      if (!name || !email || !phone || !country || !experience) {
        return res.status(400).json({ 
          message: "All text fields are required",
          received: { name, email, phone, country, experience }
        });
      }

      // Validate required files
      if (!req.files || !req.files.photo || !req.files.passportImage) {
        return res.status(400).json({ 
          message: "Photo and passport image are required",
          filesReceived: req.files ? Object.keys(req.files) : []
        });
      }

      // Process file paths
      const photoURL = req.files.photo[0].path.replace(/\\/g, "/");
      const passportURL = req.files.passportImage[0].path.replace(/\\/g, "/");
      const certificateURL = req.files.certificate 
        ? req.files.certificate[0].path.replace(/\\/g, "/") 
        : "";

      // Create application
      const application = new Application({
        name,
        email,
        phone,
        country,
        experience,
        photoURL,
        passportURL,
        certificateURL,
      });

      await application.save();

      console.log("✅ Application saved successfully");
      res.status(201).json({ 
        message: "Application submitted successfully!",
        applicationId: application._id
      });

    } catch (err) {
      console.error("❌ Error in /apply route:", err);
      
      // Send detailed error for debugging
      res.status(500).json({ 
        message: "Error submitting application",
        error: err.message,
        stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
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