const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const { connectDB } = require("../config/db");
const authRoutes = require("../routes/authRoutes");

dotenv.config();
const app = express();

app.use(cors());
app.use(express.json());

// DB connect
connectDB();

// Routes
app.use("/api", authRoutes);

app.get("/", (req, res) => {
  res.send("🚀 Digital Wallet API is running...");
});

module.exports = app;
