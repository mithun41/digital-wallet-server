const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const { connectDB } = require("../config/db");
const { registerUser, loginUser } = require("../controllers/authControllers");
const { SendMoney } = require("../controllers/sendMoney");

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
    // app.post('/api/send_money', SendMoney)

    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
  } catch (err) {
    console.error("❌ DB connection failed:", err);
  }
};

startServer();
