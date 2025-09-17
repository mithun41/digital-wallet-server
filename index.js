const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const { registerUser, loginUser } = require("./controllers/authControllers");
const { connectDB } = require("./config/db");

dotenv.config();
const app = express();
app.use(cors());
app.use(express.json());

const startServer = async () => {
  try {
    await connectDB();

    // Routes
    app.post("/api/register", registerUser);
    app.post("/api/login", loginUser);

    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
  } catch (err) {
    console.error("❌ DB connection failed:", err);
  }
};

startServer();
