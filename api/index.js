const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const { connectDB } = require("../config/db");
const { registerUser, loginUser } = require("../controllers/authControllers");

dotenv.config();
const app = express();
app.use(cors());
app.use(express.json());

// Routes
app.post("/api/register", registerUser);
app.post("/api/login", loginUser);

// ✅ Export for Vercel
module.exports = app;
