import express from "express";
import fundingRecordRoutes from "./routes/finance-payments/fundingRecordRoute.js";
import memberPaymentRoutes from "./routes/finance-payments/memberPaymentRoute.js";
import maintenanceExpenseRoutes from "./routes/finance-payments/maintenanceExpenseRoute.js";
import fundingSourceRoutes from "./routes/finance-payments/fundingSourceRoute.js";
import dotenv from "dotenv";
import connectDb from "./config/db.js";

dotenv.config();
const PORT = process.env.PORT || 5050;
const app = express();
connectDb();
app.use(express.json());

app.use("/api/funding-records", fundingRecordRoutes);
app.use("/api/member-payments", memberPaymentRoutes);
app.use("/api/maintenance-expenses", maintenanceExpenseRoutes);
app.use("/api/funding-sources", fundingSourceRoutes);

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

export default app;
