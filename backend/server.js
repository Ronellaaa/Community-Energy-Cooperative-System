import express from "express";
import cors from "cors";
import path from "path";
import dotenv from "dotenv";
import fs from "fs";
import { fileURLToPath } from "url";
import { errorHandler } from "./middleware/errorMiddleware.js";

//DB connection
import connectDB from "./config/db.js";
// Feature 1 routes
import projectRoutes from "./routes/feature-1/projectRoutes.js";

//feature 2 routes
import authRoutes from "./routes/feature-2/authRoutes.js";
// import decisionRoutes from "./routes/decisionRoutes.js";
// import meetingRoutes from "./routes/meetingRoutes.js";
// import membershipRoutes from "./routes/feature-2/membershipRoutes.js";
import adminRoutes from "./routes/feature-2/adminRoutes.js";
import communityRoutes from "./routes/feature-2/communityRoutes.js";
import joinRequestRoutes from "./routes/feature-2/joinRequestRoutes.js";
import officerRoutes from "./routes/feature-2/officerRoutes.js";

//Feature 3 routes
import fundingRecordRoutes from "./routes/finance-payments/fundingRecordRoute.js";
import memberPaymentRoutes from "./routes/finance-payments/memberPaymentRoute.js";
import maintenanceExpenseRoutes from "./routes/finance-payments/maintenanceExpenseRoute.js";
import fundingSourceRoutes from "./routes/finance-payments/fundingSourceRoute.js";

//Feature 4 routes
import creditRoutes from "./routes/feature-3/credit.js";
import billRoutes from "./routes/feature-3/billRoutes.js";
import paymentSlipRoutes from "./routes/feature-3/paymentSlipRoutes.js";
import memberPaymentSlipRoutes from "./routes/feature-3/member.payment.slip.routes.js";
import adminBillRoutes from "./routes/feature-3/adminBillRoutes.js";
import qrRoutes from "./routes/feature-3/qrRoutes.js";
import meterReadingRoutes from "./routes/feature-3/manager.reading.routes.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, ".env") });

const app = express();

const allowedOrigins = new Set([
  "http://localhost:5173",
  "http://localhost:5174",
  "http://localhost:5175",
  "http://localhost:5176",
  "https://frontend-onellas-projects.vercel.app",
  "https://frontend-cqzj2x87r-onellas-projects.vercel.app",
  "https://frontend-5q3y9jh98-onellas-projects.vercel.app",
  "https://frontend-fr3q17l0x-onellas-projects.vercel.app",
]);

app.use(
  cors({
    origin(origin, callback) {
      if (!origin) return callback(null, true);

      const isAllowedPreview =
        /^https:\/\/frontend-[a-z0-9-]+-onellas-projects\.vercel\.app$/.test(origin);

      if (allowedOrigins.has(origin) || isAllowedPreview) {
        return callback(null, true);
      }

      return callback(new Error("Not allowed by CORS"));
    },
    credentials: true,
  }),
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const uploadsDir = path.join(__dirname, "uploads");
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir);
}

const PORT = process.env.PORT || 5050;
const startServer = async () => {
  try {
    await connectDB();
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
      console.log(`Uploads directory: ${uploadsDir}`);
    });
  } catch (err) {
    console.error("Failed to start server:", err.message);
    process.exit(1);
  }
};
//project-builder route
app.use("/api/projects", projectRoutes);

// membership-community routes
app.use("/uploads", express.static(path.resolve("uploads")));
app.use("/api/auth", authRoutes);
app.use("/api/communities", communityRoutes);
app.use("/api/join-requests", joinRequestRoutes);
app.use("/api/officer", officerRoutes);
app.use("/api/admin", adminRoutes);

//finance-payments routes
app.use("/api/funding-records", fundingRecordRoutes);
app.use("/api/member-payments", memberPaymentRoutes);
app.use("/api/maintenance-expenses", maintenanceExpenseRoutes);
app.use("/api/funding-sources", fundingSourceRoutes);

//payment-slip, qr, meter-reading routes
app.use("/api/credit", creditRoutes);
app.use("/api/bills", billRoutes); 
app.use("/api/payment-slips", paymentSlipRoutes);
app.use("/api/member-payment-slips", memberPaymentSlipRoutes); 
app.use("/api/admin", adminBillRoutes); 
app.use("/api/qr", qrRoutes);
app.use("/api", meterReadingRoutes);

app.use(errorHandler);

// app.use((err, req, res, next) => {
//   console.error(err.stack);
//   res.status(500).json({
//     success: false,
//     message: err.message || 'Something went wrong!'
//   });
// });
startServer();

export default app;
