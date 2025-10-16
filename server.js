// server.js (local dev only)
require("dotenv").config();
const express = require('express')
const app = express();

const { PayBill } = require("./controllers/transactionController");
const { protectByToken } = require("./middleware/authMiddleware");
const cors = require("cors");
const liveChat = require("./controllers/socketio");

const PORT = process.env.PORT || 5000;

app.use(cors())
// app.use(express.json())

app.post('/api/pay-bill', protectByToken, PayBill)

const server = liveChat(app)

server.listen(PORT, () => {
  console.log(`🚀 Server running locally on port ${PORT}`);
});
