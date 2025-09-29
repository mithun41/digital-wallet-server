const express = require("express");
require("dotenv").config();
const { addMoney } = require("./controllers/sendMoney");
const app = express();
const cors = require("cors");
const { connectDB } = require("./config/db");


const PORT = process.env.PORT || 5000;

app.use(cors())
app.use(express.json())

connectDB().then(() => {
  console.log("Database connected, starting server...");

app.post('/send_money', addMoney)

app.get("/", (req, res) => {
  res.send("🚀 Digital Wallet API is running...");
});
app.listen(PORT, () => {
  console.log(`🚀 Server running locally on port ${PORT}`);
});
}).catch (err => {
  console.error("Failed to connect DB:", err);
})