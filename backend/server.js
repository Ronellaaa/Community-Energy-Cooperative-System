import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import connectDB from "./config/db.js";
import projectRoutes from "./routes/feature-1/projectRoutes.js";
import { errorHandler } from "./middleware/errorMiddleware.js";

dotenv.config();

// Connect Database
connectDB();

const app = express();

// Enable CORS (important for React frontend)
app.use(cors({
  origin: "http://localhost:5173",
  credentials: true,
}));

// Parse JSON body
app.use(express.json());

// Routes
app.use("/api/projects", projectRoutes);

// Error handler
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});