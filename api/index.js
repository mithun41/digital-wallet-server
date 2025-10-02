const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const { connectDB } = require("../config/db");
const authRoutes = require("../routes/authRoutes");
const transactionRoutes = require("../routes/transactionRoutes");
const userRoute = require("../routes/userRoute");

dotenv.config();
const app = express();

app.use(cors());
app.use(express.json());

// 🔹 Connect DB immediately (before handling requests)
connectDB().catch((err) => {
  console.error("❌ Initial DB connection failed:", err);
});

// Existing routes

app.use("/api/users", userRoute);
app.use("/api", authRoutes);
app.use("/api/transactions", transactionRoutes);
app.get("/", (req, res) => {
  res.send("🚀 Digital Wallet API is running...");
});

module.exports = app;
