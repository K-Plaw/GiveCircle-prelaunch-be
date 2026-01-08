import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cors from "cors";
import notifyRoutes from "./routes/notify.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Base route (prevents "Cannot GET /")
app.get("/", (req, res) => {
  res.send("GiveCircle API is running 🚀");
});

// API routes
app.use("/api", notifyRoutes);

// MongoDB connection
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB connected"))
  .catch(err => {
    console.error("MongoDB connection error:", err);
    process.exit(1);
  });

// Start server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
