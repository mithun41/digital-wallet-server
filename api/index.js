const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const { connectDB } = require("../config/db");
const authRoutes = require("../routes/authRoutes");
const sendManyRoutes = require("../routes/sendManyRoutes");
const cardRoutes = require("../routes/cardRoutes"); // <-- add this

dotenv.config();
const app = express();

app.use(cors());
app.use(express.json());

// 🔹 Connect DB immediately (before handling requests)
connectDB().catch((err) => {
  console.error("❌ Initial DB connection failed:", err);
});

// Existing routes
app.use("/api", authRoutes);
app.use("/api/send-many", sendManyRoutes);

// 🔹 New card routes
app.use("/api/cards", cardRoutes);

app.get("/", (req, res) => {
  res.send("🚀 Digital Wallet API is running...");
});

module.exports = app;
