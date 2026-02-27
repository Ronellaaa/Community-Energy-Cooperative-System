

import "dotenv/config";
import express from "express";
import cors from "cors";
import path from "path";
import connectDB from "./config/db.js";
import authRoutes from "./routes/feature-2/authRoutes.js";
import fundingRecordRoutes from "./routes/finance-payments/fundingRecordRoute.js";
import memberPaymentRoutes from "./routes/finance-payments/memberPaymentRoute.js";
import maintenanceExpenseRoutes from "./routes/finance-payments/maintenanceExpenseRoute.js";
import fundingSourceRoutes from "./routes/finance-payments/fundingSourceRoute.js";
// import decisionRoutes from "./routes/decisionRoutes.js";
// import meetingRoutes from "./routes/meetingRoutes.js";
// import membershipRoutes from "./routes/feature-2/membershipRoutes.js";
import adminRoutes from "./routes/feature-2/adminRoutes.js";
import communityRoutes from "./routes/feature-2/communityRoutes.js";
import joinRequestRoutes from "./routes/feature-2/joinRequestRoutes.js";
import officerRoutes from "./routes/feature-2/officerRoutes.js";
import projectRoutes from "./routes/feature-1/projectRoutes.js";
import { errorHandler } from "./middleware/errorMiddleware.js";

const app = express();

app.use(cors({
  origin: "http://localhost:5173",
  credentials: true,
}));

app.use(express.json());

const PORT = process.env.PORT || 5050;
connectDB();

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

//project-builder route 
app.use("/api/projects", projectRoutes);

app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

export default app;


