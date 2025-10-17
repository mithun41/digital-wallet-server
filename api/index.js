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
const reportRoutes = require('../routes/reportRoutes');
const liveChat = require("../controllers/socketio");
const PORT = process.env.PORT || 5000;;
const loanRoutes = require("../routes/loanRoutes");
const { education } = require("../controllers/eduControllers");

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

// report                   
app.use("/api/report", reportRoutes);

//fingerprint
app.use("/api/fingerprint", fingerprintRoutes);
 
//education
app.use("/api/education", education);

// live chat
const server = liveChat(app)

app.get("/", (req, res) => {
  res.send("🚀 Digital Wallet API is running...");
});

server.listen(PORT, () => {
  console.log(`🚀 Server running locally on port ${PORT}`);
});

module.exports = app;
