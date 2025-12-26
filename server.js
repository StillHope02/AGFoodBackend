// require('dotenv').config(); // MUST BE FIRST LINE!

// const express = require("express");
// const mongoose = require("mongoose");
// const cors = require("cors");
// const PDFDocument = require("pdfkit");
// const multer = require("multer");
// const path = require("path");
// const fs = require("fs");

// const app = express();

// // CORS Configuration - Allow all origins for development
// app.use(cors({
//   origin: '*',
//   methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
//   allowedHeaders: ['Content-Type', 'Authorization'],
//   credentials: true
// }));

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
//   email: { type: String, required: true },
//   passportNumber: { type: String, required: true },
//    jobPosition: { type: String, required: true },
//    profilePictureURL: { type: String, required: true },
//   // passport: { type: String, required: true },
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
//       await collection.dropIndex('username_1').catch(() => { });
//       console.log('✅ Removed username index');

//       // Drop email index
//       await collection.dropIndex('email_1').catch(() => { });
//       console.log('✅ Removed email index');

//       // Drop any other old indexes except _id and passportNumber
//       const indexes = await collection.indexes();
//       for (const index of indexes) {
//         if (index.name !== '_id_' && index.name !== 'passportNumber_1') {
//           await collection.dropIndex(index.name).catch(() => { });
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



// app.get("/api/check-status/:passportNumber", async (req, res) => {
//   try {
//     const { passportNumber } = req.params;

//     console.log("🔍 Checking status for passport:", passportNumber);

//     // Find application by passport number
//     const application = await Application.findOne({ 
//       passportNumber: passportNumber.toUpperCase() 
//     });

//     if (!application) {
//       return res.status(404).json({ 
//         message: "No application found with this passport number" 
//       });
//     }

//     console.log("✅ Found application:", application._id);

//     // If approved, find matching user for PDF generation
//     let userId = null;
//     if (application.status === "Approved") {
//       const user = await User.findOne({ 
//         fullName: application.name,
//         passportNumber: application.passportNumber 
//       });
//       userId = user ? user._id : null;
//     }

//     // Return application details - INCLUDE jobPosition
//       res.json({
//       name: application.name,
//       email: application.email,
//       phone: application.phone,
//       country: application.country,
//       jobPosition: application.jobPosition,
//       experience: application.experience,
//       status: application.status,
//       createdAt: application.createdAt,
//       userId: userId,
//       profilePictureURL: application.profilePictureURL, // ✅ ADDED
//       photoURL: application.photoURL,                   // optional, if still needed
//       passportURL: application.passportURL,
//       certificateURL: application.certificateURL,
//     });


//   } catch (err) {
//     console.error("❌ Error checking status:", err);
//     res.status(500).json({ 
//       message: "Error checking status", 
//       error: err.message 
//     });
//   }
// });

// app.get("/api/check-status-by-email/:email", async (req, res) => {
//   try {
//     const { email } = req.params;

//     const application = await Application.findOne({ email });

//     if (!application) {
//       return res.status(404).json({
//         message: "No application found with this email"
//       });
//     }

//     // Find user by name to get passport details
//     const user = await User.findOne({ fullName: application.name });

//     res.json({
//       name: application.name,
//       email: application.email,
//       phone: application.phone,
//       country: application.country,
//       experience: application.experience,
//       status: application.status,
//       createdAt: application.createdAt,
//       userId: user ? user._id : null,
//       passportNumber: user ? user.passportNumber : "Not available",
//     });

//   } catch (err) {
//     console.error("❌ Error checking status:", err);
//     res.status(500).json({
//       message: "Error checking status",
//       error: err.message
//     });
//   }
// });

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
//       .fontSize(24)
//       .font("Helvetica-Bold")
//       .text("CANADIAN IMMIGRATION CONSULTANCY", 50, 30, { align: "center" });

//     doc.fontSize(18)
//       .text("JOB OFFER AND AGREEMENT LETTER", 50, 65, { align: "center" });

//     // Date
//     doc.fontSize(10)
//       .text(`Date: ${new Date().toLocaleDateString()}`, 50, 95, { align: "right" });

//     // Reset to black for content
//     doc.fillColor("#000000");

//     // User Information Section
//     let yPos = 160;

//     doc.fontSize(14)
//       .font("Helvetica-Bold")
//       .text("APPLICANT INFORMATION", 50, yPos);

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
//       .font("Helvetica-Bold")
//       .text("EMPLOYMENT OFFER", 50, yPos);

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
//       .font("Helvetica-Bold")
//       .fillColor("#16a34a")
//       .text("APPROVED", doc.page.width - 200, yPos, {
//         align: "center",
//         width: 150
//       });

//     // Draw stamp circle
//     doc.circle(doc.page.width - 125, yPos + 15, 50)
//       .lineWidth(3)
//       .stroke("#16a34a");

//     // Footer
//     doc.fontSize(8)
//       .fillColor("#666666")
//       .text(
//         "For EDEN FOOD - This is a computer generated document",
//         50,
//         doc.page.height - 50,
//         { align: "center" }
//       );

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

// // ============================================
// // PDF GENERATION ROUTE - FIXED FOR AUTO DOWNLOAD
// // ============================================

// app.get("/api/generate-offer-pdf/:passportNumber", async (req, res) => {
//   try {
//     const { passportNumber } = req.params;

//     console.log("📄 Generating PDF for passport:", passportNumber);

//     // Find application
//     const application = await Application.findOne({ 
//       passportNumber: passportNumber.toUpperCase() 
//     });

//     if (!application) {
//       return res.status(404).json({ message: "Application not found" });
//     }

//     if (application.status !== "Approved") {
//       return res.status(403).json({ message: "Application not approved" });
//     }

//     // Create PDF document
//     const doc = new PDFDocument({ 
//       size: "A4", 
//       margin: 50,
//       info: {
//         Title: `Job Offer - ${application.name}`,
//         Author: 'EDEN FOOD Company',
//         Subject: 'Job Offer Letter',
//         Keywords: 'canada, job, offer, employment',
//         Creator: 'EDEN FOOD HR System',
//         CreationDate: new Date()
//       }
//     });

//     // Set response headers for download
//     const fileName = `Job_Offer_${application.name.replace(/\s+/g, '_')}_${passportNumber}.pdf`;
    
//     res.setHeader("Content-Type", "application/pdf");
//     res.setHeader("Content-Disposition", `attachment; filename="${fileName}"`);
//     res.setHeader("Cache-Control", "no-cache, no-store, must-revalidate");
//     res.setHeader("Pragma", "no-cache");
//     res.setHeader("Expires", "0");

//     // Pipe PDF to response
//     doc.pipe(res);

//     // ==================== PDF DESIGN ====================
    
//     // Header with green background
//     doc.rect(0, 0, doc.page.width, 150)
//        .fill("#14532d"); // Dark green
    
//     // Canadian Flag
//     doc.fillColor("#FFFFFF")
//        .fontSize(36)
//        .text("🍁", 50, 30);
    
//     // Title
//     doc.fontSize(28)
//        .font("Helvetica-Bold")
//        .fillColor("#FFFFFF")
//        .text("CANADIAN IMMIGRATION CONSULTANCY", 100, 35);
    
//     doc.fontSize(20)
//        .text("JOB OFFER AND AGREEMENT LETTER", 100, 75, { align: "center" });
    
//     // Approved Stamp
//     doc.fillColor("#22c55e") // Green
//        .fontSize(18)
//        .text("✓ APPROVED", doc.page.width - 150, 110, { align: "right" });
    
//     // Date
//     doc.fontSize(12)
//        .fillColor("#FFFFFF")
//        .text(`Date: ${new Date().toLocaleDateString('en-CA')}`, 50, 115, { align: "right" });

//     // Reset color
//     doc.fillColor("#000000");
    
//     // ==================== APPLICANT INFO ====================
//     let yPos = 180;
    
//     doc.fontSize(16)
//        .font("Helvetica-Bold")
//        .text("APPLICANT INFORMATION", 50, yPos);
    
//     yPos += 30;
//     doc.fontSize(12).font("Helvetica");
    
//     const infoRows = [
//       { label: "Full Name", value: application.name },
//       { label: "Passport Number", value: passportNumber },
//       { label: "Date of Birth", value: "01/04/1979" },
//       { label: "Email", value: application.email },
//       { label: "Phone", value: application.phone },
//       { label: "Country", value: application.country },
//       { label: "Job Position", value: application.jobPosition || "Packing" },
//       { label: "Experience", value: application.experience },
//     ];
    
//     infoRows.forEach((row, index) => {
//       const x = 50 + (index % 2) * 250;
//       const rowY = yPos + Math.floor(index / 2) * 25;
      
//       doc.font("Helvetica-Bold")
//          .text(`${row.label}:`, x, rowY, { continued: true })
//          .font("Helvetica")
//          .text(` ${row.value}`);
//     });
    
//     yPos += 120;
    
//     // ==================== OFFER DETAILS ====================
//     doc.moveTo(50, yPos - 10)
//        .lineTo(doc.page.width - 50, yPos - 10)
//        .strokeColor("#14532d")
//        .lineWidth(2)
//        .stroke();
    
//     doc.fontSize(16)
//        .font("Helvetica-Bold")
//        .text("EMPLOYMENT OFFER DETAILS", 50, yPos);
    
//     yPos += 30;
    
//     const offerDetails = `
// The Canadian Natural Resources EDEN FOOD Company is pleased to offer you employment at our facility in Banff, Alberta, Canada.

// DESIGNATION: ${application.jobPosition || "Packing"}

// CONTRACT PERIOD: 2 years (renewable)

// REMUNERATION PACKAGE:
// • Basic Monthly Salary: 2800 CAD
// • Monthly Bonus: 200 CAD
// • Total Monthly Salary: 3000 CAD

// BENEFITS INCLUDED:
// 1. Housing: Suitable accommodation provided
// 2. Medical: Full medical coverage as per company policy
// 3. Transport: Provided for official duties
// 4. Annual Leave: 30 days per year
// 5. Air Passage: Return economy class tickets for employee and family
// 6. Visa Expenses: Reimbursed upon joining

// COMPANY DETAILS:
// EDEN FOOD Company
// Mountain Ave, Banff, AB T2P 418, CANADA
// Owner: Mr. SARDAR JAGMOHAN SINGH
// Contact: +1 343 501 3133 | +44 7441 929399

// TERMS & CONDITIONS:
// 1. This offer is valid for 90 days from the date of issue
// 2. Employment is subject to successful medical examination
// 3. All documents must be verified by Canadian authorities
// 4. The company will assist with work permit processing
// `;
    
//     doc.fontSize(11)
//        .font("Helvetica")
//        .text(offerDetails, 50, yPos, {
//          width: 500,
//          lineGap: 5,
//          align: "justify"
//        });
    
//     yPos = doc.page.height - 200;
    
//     // ==================== SIGNATURE SECTION ====================
//     doc.moveTo(50, yPos)
//        .lineTo(300, yPos)
//        .strokeColor("#000000")
//        .lineWidth(1)
//        .stroke();
    
//     doc.fontSize(12)
//        .font("Helvetica-Bold")
//        .text("Jagmohan Singh", 50, yPos + 10);
    
//     doc.fontSize(10)
//        .font("Helvetica")
//        .text("Authorized Signatory", 50, yPos + 25);
    
//     doc.text("EDEN FOOD Company", 50, yPos + 40);
    
//     // QR Code Placeholder
//     doc.rect(doc.page.width - 150, yPos - 20, 100, 100)
//        .strokeColor("#14532d")
//        .lineWidth(1)
//        .stroke();
    
//     doc.fontSize(9)
//        .fillColor("#666666")
//        .text("Scan to verify", doc.page.width - 150, yPos + 85, {
//          width: 100,
//          align: "center"
//        });
    
//     doc.fontSize(8)
//        .text("Reference ID: " + application._id, 50, doc.page.height - 50);
    
//     doc.text("Computer Generated Document - EDEN FOOD HR System", 
//        doc.page.width - 50, doc.page.height - 50, { align: "right" });
    
//     // Finalize PDF
//     doc.end();
    
//     console.log("✅ PDF generated successfully for:", application.name);

//   } catch (err) {
//     console.error("❌ Error generating PDF:", err);
//     res.status(500).json({ 
//       message: "Error generating PDF", 
//       error: err.message 
//     });
//   }
// });

// // ============================================
// // SIMPLE HTML OFFER PAGE (Optional)
// // ============================================
// app.get("/offer-letter", async (req, res) => {
//   try {
//     const passportNumber = req.query.passport;
    
//     if (!passportNumber) {
//       return res.send(`
//         <!DOCTYPE html>
//         <html>
//         <head><title>Error</title></head>
//         <body style="text-align:center; padding:50px;">
//           <h1>Passport number required</h1>
//           <p>Add ?passport=YOUR_PASSPORT to URL</p>
//         </body>
//         </html>
//       `);
//     }
    
//     // Simple redirect page
//     res.send(`
//     <!DOCTYPE html>
//     <html>
//     <head>
//       <title>Downloading Offer Letter...</title>
//       <style>
//         body {
//           font-family: Arial, sans-serif;
//           background: linear-gradient(135deg, #f0fdf4, #dcfce7);
//           height: 100vh;
//           display: flex;
//           align-items: center;
//           justify-content: center;
//           text-align: center;
//           padding: 20px;
//         }
//         .container {
//           background: white;
//           padding: 40px;
//           border-radius: 20px;
//           box-shadow: 0 10px 30px rgba(0,0,0,0.1);
//           max-width: 500px;
//         }
//         .loader {
//           border: 5px solid #f3f3f3;
//           border-top: 5px solid #16a34a;
//           border-radius: 50%;
//           width: 60px;
//           height: 60px;
//           animation: spin 1s linear infinite;
//           margin: 20px auto;
//         }
//         @keyframes spin {
//           0% { transform: rotate(0deg); }
//           100% { transform: rotate(360deg); }
//         }
//         .success {
//           color: #16a34a;
//           font-size: 24px;
//           margin: 20px 0;
//         }
//         .note {
//           background: #f0fdf4;
//           padding: 15px;
//           border-radius: 10px;
//           margin: 20px 0;
//           border-left: 4px solid #16a34a;
//         }
//         .btn {
//           display: inline-block;
//           background: #16a34a;
//           color: white;
//           padding: 12px 24px;
//           text-decoration: none;
//           border-radius: 8px;
//           font-weight: bold;
//           margin: 10px;
//           transition: all 0.3s;
//         }
//         .btn:hover {
//           background: #15803d;
//           transform: translateY(-2px);
//         }
//       </style>
//     </head>
//     <body>
//       <div class="container">
//         <div class="loader"></div>
//         <div class="success">✅ Offer Letter Downloading...</div>
        
//         <h2>EDEN FOOD Company</h2>
//         <p>Your job offer letter is being downloaded automatically.</p>
        
//         <div class="note">
//           <p><strong>Passport:</strong> ${passportNumber}</p>
//           <p>If download doesn't start automatically, click below:</p>
//         </div>
        
//         <div>
//           <a href="/api/generate-offer-pdf/${passportNumber}" class="btn">
//             📥 Download Offer Letter
//           </a>
//           <a href="javascript:window.print()" class="btn" style="background:#3b82f6;">
//             🖨️ Print Page
//           </a>
//         </div>
        
//         <p style="margin-top: 20px; font-size: 14px; color: #666;">
//           File: Job_Offer_${passportNumber}.pdf
//         </p>
//       </div>
      
//       <script>
//         // Auto-download after 1 second
//         setTimeout(() => {
//           window.location.href = "/api/generate-offer-pdf/${passportNumber}";
//         }, 1000);
        
//         // Fallback after 5 seconds
//         setTimeout(() => {
//           document.getElementById('manualLink').style.display = 'block';
//         }, 5000);
//       </script>
//     </body>
//     </html>
//     `);
    
//   } catch (err) {
//     console.error("❌ Error in offer page:", err);
//     res.status(500).send("Server error");
//   }
// });
// // Apply route
// // Apply route - FIXED VERSION

// app.post(
//   "/apply",
//   upload.fields([
//     { name: "profilePicture", maxCount: 1 }, // ✅ NEW
//     { name: "photo", maxCount: 1 },
//     { name: "passportImage", maxCount: 1 },
//     { name: "certificate", maxCount: 1 },
//   ]),
//   async (req, res) => {
//     try {
//       console.log("📝 Request body:", req.body);
//       console.log("📎 Files received:", req.files ? Object.keys(req.files) : "No files");

//       // Extract form data
//       const { name, email, phone, passportNumber, country, jobPosition, experience } = req.body;

//       // Validate text fields
//       if (!name || !email || !phone || !passportNumber || !country || !jobPosition || !experience) {
//         return res.status(400).json({ 
//           message: "All fields are required",
//           missing: {
//             name: !name,
//             email: !email,
//             phone: !phone,
//             passportNumber: !passportNumber,
//             country: !country,
//             jobPosition: !jobPosition,
//             experience: !experience
//           }
//         });
//       }

//       // Validate required files
//       if (
//         !req.files || 
//         !req.files.profilePicture || // ✅ NEW
//         !req.files.photo || 
//         !req.files.passportImage
//       ) {
//         return res.status(400).json({ 
//           message: "Profile picture, profile photo and passport image are required",
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
//       const profilePictureURL = req.files.profilePicture[0].path.replace(/\\/g, "/"); // ✅ NEW
//       const photoURL = req.files.photo[0].path.replace(/\\/g, "/");
//       const passportURL = req.files.passportImage[0].path.replace(/\\/g, "/");
//       const certificateURL = req.files.certificate 
//         ? req.files.certificate[0].path.replace(/\\/g, "/") 
//         : "";

//       // Create new application
//       const application = new Application({
//         name,
//         email,
//         phone,
//         passportNumber: passportNumber.toUpperCase(),
//         country,
//         jobPosition,
//         experience,
//         profilePictureURL, // ✅ NEW
//         photoURL,
//         passportURL,
//         certificateURL,
//       });

//       await application.save();

//       res.status(201).json({ 
//         message: "Application submitted successfully!",
//         applicationId: application._id
//       });

//     } catch (err) {
//       console.error("❌ Error in /apply route:", err);
//       res.status(500).json({ 
//         message: "Error submitting application",
//         error: err.message,
//         errorType: err.name
//       });
//     }
//   }
// );

// const PORT = process.env.PORT || 5000;
// app.listen(PORT, () => {
//   console.log(`🚀 Server running on port ${PORT}`);
//   console.log(`📊 User Management API: http://localhost:${PORT}/api/users`);
//   console.log(`📋 Applications API: http://localhost:${PORT}/applications`);
// });


require('dotenv').config(); // MUST BE FIRST LINE!

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const PDFDocument = require("pdfkit");
const multer = require("multer");
const nodemailer = require("nodemailer");
const path = require("path");
const fs = require("fs");

const app = express();

// CORS Configuration
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

// Multer configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    const uniqueName = Date.now() + "_" + file.originalname;
    cb(null, uniqueName);
  },
});
const upload = multer({ storage });

// ============================================
// EMAIL CONFIGURATION
// ============================================
const transporter = nodemailer.createTransport({
  service: 'gmail', // or 'outlook', 'yahoo', etc.
  auth: {
    user: process.env.EMAIL_USER, // Your email
    pass: process.env.EMAIL_PASSWORD // Your app password
  }
});

// Function to send application email
async function sendApplicationEmail(applicationData, files) {
  try {
    const {
      name,
      email,
      phone,
      passportNumber,
      country,
      jobPosition,
      experience
    } = applicationData;

    // Create absolute file paths for attachments
    const attachments = [];

    if (files.profilePicture && files.profilePicture[0]) {
      attachments.push({
        filename: `ProfilePicture_${name}.${files.profilePicture[0].originalname.split('.').pop()}`,
        path: path.join(__dirname, files.profilePicture[0].path)
      });
    }

    if (files.photo && files.photo[0]) {
      attachments.push({
        filename: `Photo_${name}.${files.photo[0].originalname.split('.').pop()}`,
        path: path.join(__dirname, files.photo[0].path)
      });
    }

    if (files.passportImage && files.passportImage[0]) {
      attachments.push({
        filename: `Passport_${name}.${files.passportImage[0].originalname.split('.').pop()}`,
        path: path.join(__dirname, files.passportImage[0].path)
      });
    }

    if (files.certificate && files.certificate[0]) {
      attachments.push({
        filename: `Certificate_${name}.${files.certificate[0].originalname.split('.').pop()}`,
        path: path.join(__dirname, files.certificate[0].path)
      });
    }

    // HTML Email Template
    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body {
            font-family: Arial, sans-serif;
            background-color: #f4f4f4;
            margin: 0;
            padding: 0;
          }
          .container {
            max-width: 600px;
            margin: 20px auto;
            background: white;
            border-radius: 10px;
            overflow: hidden;
            box-shadow: 0 4px 6px rgba(0,0,0,0.1);
          }
          .header {
            background: linear-gradient(135deg, #166534 0%, #22c55e 100%);
            color: white;
            padding: 30px;
            text-align: center;
          }
          .header h1 {
            margin: 0;
            font-size: 24px;
          }
          .content {
            padding: 30px;
          }
          .info-row {
            display: flex;
            padding: 12px 0;
            border-bottom: 1px solid #e5e7eb;
          }
          .info-label {
            font-weight: bold;
            color: #166534;
            width: 180px;
            flex-shrink: 0;
          }
          .info-value {
            color: #374151;
          }
          .images-section {
            margin-top: 30px;
            padding-top: 20px;
            border-top: 2px solid #e5e7eb;
          }
          .images-section h3 {
            color: #166534;
            margin-bottom: 15px;
          }
          .image-grid {
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            gap: 15px;
            margin-top: 15px;
          }
          .image-item {
            text-align: center;
          }
          .image-item img {
            width: 100%;
            height: 200px;
            object-fit: cover;
            border-radius: 8px;
            border: 2px solid #e5e7eb;
          }
          .image-item p {
            margin: 8px 0 0 0;
            font-size: 12px;
            color: #6b7280;
          }
          .footer {
            background: #f9fafb;
            padding: 20px;
            text-align: center;
            font-size: 12px;
            color: #6b7280;
          }
          .badge {
            display: inline-block;
            background: #dcfce7;
            color: #166534;
            padding: 4px 12px;
            border-radius: 12px;
            font-size: 12px;
            font-weight: bold;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🍁 New Job Application Received</h1>
            <p style="margin: 10px 0 0 0; opacity: 0.9;">AG Food Packing Company - Canada</p>
          </div>
          
          <div class="content">
            <div style="text-align: center; margin-bottom: 20px;">
              <span class="badge">NEW APPLICATION</span>
            </div>

            <h2 style="color: #166534; margin-bottom: 20px;">Applicant Details</h2>
            
            <div class="info-row">
              <div class="info-label">Full Name:</div>
              <div class="info-value">${name}</div>
            </div>
            
            <div class="info-row">
              <div class="info-label">Email:</div>
              <div class="info-value">${email}</div>
            </div>
            
            <div class="info-row">
              <div class="info-label">WhatsApp Number:</div>
              <div class="info-value">${phone}</div>
            </div>
            
            <div class="info-row">
              <div class="info-label">Passport Number:</div>
              <div class="info-value"><strong>${passportNumber}</strong></div>
            </div>
            
            <div class="info-row">
              <div class="info-label">Current Country:</div>
              <div class="info-value">${country}</div>
            </div>
            
            <div class="info-row">
              <div class="info-label">Job Position:</div>
              <div class="info-value"><strong>${jobPosition}</strong></div>
            </div>
            
            <div class="info-row">
              <div class="info-label">Experience:</div>
              <div class="info-value">${experience}</div>
            </div>

            <div class="images-section">
              <h3>📎 Attached Documents</h3>
              <p style="color: #6b7280; font-size: 14px;">
                All images are attached to this email. Please review the documents carefully.
              </p>
              <ul style="color: #374151; margin-top: 10px;">
                ${files.profilePicture ? '<li>✅ Profile Picture</li>' : ''}
                ${files.photo ? '<li>✅ Profile Photo</li>' : ''}
                ${files.passportImage ? '<li>✅ Passport Copy</li>' : ''}
                ${files.certificate ? '<li>✅ Experience Certificate/CV</li>' : ''}
              </ul>
            </div>
          </div>

          <div class="footer">
            <p><strong>AG Food Packing Company</strong></p>
            <p>Mountain Ave, Banff, AB T2P 418, Canada</p>
            <p>This is an automated notification from your application system.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    // Email options
    const mailOptions = {
      from: `"AG Food Applications" <${process.env.EMAIL_USER}>`,
      to: process.env.ADMIN_EMAIL || process.env.EMAIL_USER,
      subject: `🍁 New Application: ${name} - ${jobPosition}`,
      html: htmlContent,
      attachments: attachments
    };

    // Send email
    const info = await transporter.sendMail(mailOptions);
    console.log('✅ Email sent successfully:', info.messageId);
    return true;

  } catch (error) {
    console.error('❌ Error sending email:', error);
    throw error;
  }
}

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
// APPLICATION MODEL
// ============================================
const applicationSchema = new mongoose.Schema({
  name: { type: String, required: true },
  phone: { type: String, required: true },
  country: { type: String, required: true },
  email: { type: String, required: true },
  passportNumber: { type: String, required: true },
  jobPosition: { type: String, required: true },
  profilePictureURL: { type: String, required: true },
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

    // Cleanup old indexes
    try {
      const collection = mongoose.connection.db.collection('users');
      await collection.dropIndex('username_1').catch(() => { });
      await collection.dropIndex('email_1').catch(() => { });
      
      const indexes = await collection.indexes();
      for (const index of indexes) {
        if (index.name !== '_id_' && index.name !== 'passportNumber_1') {
          await collection.dropIndex(index.name).catch(() => { });
        }
      }
      console.log('✅ Index cleanup completed');
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
// APPLICATION ROUTES
// ============================================

// Apply route with EMAIL notification
app.post(
  "/apply",
  upload.fields([
    { name: "profilePicture", maxCount: 1 },
    { name: "photo", maxCount: 1 },
    { name: "passportImage", maxCount: 1 },
    { name: "certificate", maxCount: 1 },
  ]),
  async (req, res) => {
    try {
      console.log("📝 Request body:", req.body);
      console.log("📎 Files received:", req.files ? Object.keys(req.files) : "No files");

      const { name, email, phone, passportNumber, country, jobPosition, experience } = req.body;

      // Validate text fields
      if (!name || !email || !phone || !passportNumber || !country || !jobPosition || !experience) {
        return res.status(400).json({ 
          message: "All fields are required"
        });
      }

      // Validate required files
      if (!req.files || !req.files.profilePicture || !req.files.photo || !req.files.passportImage) {
        return res.status(400).json({ 
          message: "Profile picture, profile photo and passport image are required"
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
      const profilePictureURL = req.files.profilePicture[0].path.replace(/\\/g, "/");
      const photoURL = req.files.photo[0].path.replace(/\\/g, "/");
      const passportURL = req.files.passportImage[0].path.replace(/\\/g, "/");
      const certificateURL = req.files.certificate 
        ? req.files.certificate[0].path.replace(/\\/g, "/") 
        : "";

      // Create new application
      const application = new Application({
        name,
        email,
        phone,
        passportNumber: passportNumber.toUpperCase(),
        country,
        jobPosition,
        experience,
        profilePictureURL,
        photoURL,
        passportURL,
        certificateURL,
      });

      await application.save();
      console.log("✅ Application saved to database");

      // Send email notification
      try {
        await sendApplicationEmail(req.body, req.files);
        console.log("✅ Email notification sent");
      } catch (emailError) {
        console.error("⚠️ Email failed but application saved:", emailError);
        // Continue even if email fails
      }

      res.status(201).json({ 
        message: "Application submitted successfully!",
        applicationId: application._id
      });

    } catch (err) {
      console.error("❌ Error in /apply route:", err);
      res.status(500).json({ 
        message: "Error submitting application",
        error: err.message
      });
    }
  }
);

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

// Check status by passport
app.get("/api/check-status/:passportNumber", async (req, res) => {
  try {
    const { passportNumber } = req.params;
    const application = await Application.findOne({ 
      passportNumber: passportNumber.toUpperCase() 
    });

    if (!application) {
      return res.status(404).json({ 
        message: "No application found with this passport number" 
      });
    }

    let userId = null;
    if (application.status === "Approved") {
      const user = await User.findOne({ 
        fullName: application.name,
        passportNumber: application.passportNumber 
      });
      userId = user ? user._id : null;
    }

    res.json({
      name: application.name,
      email: application.email,
      phone: application.phone,
      country: application.country,
      jobPosition: application.jobPosition,
      experience: application.experience,
      status: application.status,
      createdAt: application.createdAt,
      userId: userId,
      profilePictureURL: application.profilePictureURL,
      photoURL: application.photoURL,
      passportURL: application.passportURL,
      certificateURL: application.certificateURL,
    });

  } catch (err) {
    console.error("❌ Error checking status:", err);
    res.status(500).json({ 
      message: "Error checking status", 
      error: err.message 
    });
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

// [Rest of your routes: users CRUD, PDF generation, etc.]
// ... (keep all your existing user routes and PDF routes)

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📊 User Management API: http://localhost:${PORT}/api/users`);
  console.log(`📋 Applications API: http://localhost:${PORT}/applications`);
});