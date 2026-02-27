import dotenv from "dotenv";
import express from "express";
import path from "path";
import cors from 'cors';
import { fileURLToPath } from "url";
import connectDB from "./config/feature-3/db.js";
import creditRoutes from "./routes/feature-3/credit.js";
import billRoutes from "./routes/feature-3/billRoutes.js"; 
import adminBillRoutes from "./routes/feature-3/adminBillRoutes.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, ".env") });

const app = express();

app.use(cors({
  origin: 'http://localhost:5173', // Your frontend URL
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true })); // Add this for form data

// Create uploads directory if it doesn't exist
import fs from 'fs';
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir);
}

// Routes
app.use("/api/credit", creditRoutes);
app.use("/api/bills", billRoutes); // Add bill routes
app.use('/api/admin', adminBillRoutes);  // Admin routes

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    message: err.message || 'Something went wrong!'
  });
});

const PORT = process.env.PORT || 5000;

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

startServer();