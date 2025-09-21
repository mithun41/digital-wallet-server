const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const { connectDB } = require("../config/db");
const authRoutes = require("../routes/authRoutes");

dotenv.config();
const app = express();

app.use(cors());
app.use(express.json());

// 🔹 Connect DB
connectDB();

app.use("/api", authRoutes);

app.get("/", (req, res) => {
  res.send("🚀 Digital Wallet API is running...");
});

app.listen(process.env.PORT || 5000, () => {
  console.log(`Server running on port ${process.env.PORT || 5000}`);
});
