const express = require("express");
require("dotenv").config();
const { addMoney } = require("./controllers/addMoney");
const app = express();
const cors = require("cors");
const { connectDB } = require("./config/db");
const { registerUser, singleUser, loginUser, getMe } = require("./controllers/authControllers");


const PORT = process.env.PORT || 5000;

app.use(cors())
app.use(express.json())

connectDB().then(() => {
  console.log("Database connected, starting server...");

app.post('/add_money', addMoney)
app.post("/api/register", registerUser);
app.post("/api/login", loginUser);
app.put('/api/singleUser', singleUser)
app.get('/api/me', getMe)

app.get("/", (req, res) => {
  res.send("🚀 Digital Wallet API is running...");
});


app.listen(PORT, () => {
  console.log(`🚀 Server running locally on port ${PORT}`);
});
}).catch (err => {
  console.error("Failed to connect DB:", err);
})