// server.js (local dev only)
require("dotenv").config();
const express = require('express')
const app = express();
const http = require('http')
const { PayBill } = require("./controllers/transactionController");
const { protectByToken } = require("./middleware/authMiddleware");
const { Server } = require("socket.io");
const cors = require("cors");

const PORT = process.env.PORT || 5000;

app.use(cors())
// app.use(express.json())

app.post('/api/pay-bill', protectByToken, PayBill)



const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173", // তোমার React frontend URL
    methods: ["GET", "POST"]
  }
});

// যখন কোনো ইউজার connect করবে
io.on("connection", (socket) => {
  console.log("User connected:", socket.id);

  socket.on('join_room', (data) => {
    socket.join(data)
    console.log(`user data ${data}`);
  })

  // ইউজার মেসেজ পাঠালে
  socket.on("send_message", (data) => {
    // অন্যদের কাছে পাঠানো হবে
    io.to(data.room).emit("receive_message", data);
    console.log(data);
  });

  // disconnect হলে
  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);
  });
});


server.listen(PORT, () => {
  console.log(`🚀 Server running locally on port ${PORT}`);
});
