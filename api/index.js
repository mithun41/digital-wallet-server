const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const { connectDB } = require("../config/db");
const { registerUser, loginUser } = require("../controllers/authControllers");
const authRoutes = require("../routes/authRoutes");
const cardRoutes = require("../routes/cardRoutes");
const transactionRoutes = require("../routes/transactionRoutes");
const userRoute = require("../routes/userRoute");
const fingerprintRoutes = require("../routes/fingerprintRoutes");
const loanRoutes = require("../routes/loanRoutes");
const educationRoutes = require("../routes/eduRoutes");

dotenv.config();
const app = express();

app.use(cors());
app.use(express.json());

// 🔹 Connect DB immediately (before handling requests)
connectDB().catch((err) => {
  console.error("❌ Initial DB connection failed:", err);
});

// Routes
// app.post("/api/register", registerUser);
// app.post("/api/login", loginUser);
app.use("/api/users", userRoute);
app.use("/api", authRoutes);
// 🔹 New card routes
app.use("/api/cards", cardRoutes);
app.use("/api/transactions", transactionRoutes);
// 🔹 Loan routes
app.use("/api/loans", loanRoutes);

//fingerprint
app.use("/api/fingerprint", fingerprintRoutes);
 
//education
app.use("/api/education", educationRoutes);

app.get("/", (req, res) => {
  res.send("🚀 Digital Wallet API is running...");
});

module.exports = app;
