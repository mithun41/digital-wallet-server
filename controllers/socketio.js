// controllers/socketio.js
const http = require("http");
const { Server } = require("socket.io");

let io;

function liveChat(app) {
  const server = http.createServer(app);

  io = new Server(server, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"],
    },
  });

  const users = {}; // { socket.id: { name, role, room } }

  io.on("connection", (socket) => {
    console.log("🟢 User connected:", socket.id);

    // 🔹 যখন কেউ রুমে যোগ দেবে
    socket.on("join_room", ({ name, role, room }) => {
      users[socket.id] = { name, role, room };

      socket.join(room);
    //   console.log(`${name} (${role}) joined room ${room}`);

      // যদি user হয়, তাহলে admin-দের জানাও নতুন user এসেছে
      if (role === "user") {
        for (let [id, u] of Object.entries(users)) {
          if (u.role === "admin") {
            io.to(id).emit("user_list", getUserList(users));
          }
        }
      }

      if (role === "admin") {
        socket.emit("user_list", getUserList(users)); // এইখানেই check করবে
      }
    });

    // 🔹 ইউজার বা অ্যাডমিন মেসেজ পাঠাবে
    socket.on("send_message", (data) => {
      const sender = users[socket.id];

      if (!sender) return;

      // 🧑‍💻 যদি ইউজার হয় → মেসেজ যাবে শুধু অ্যাডমিনদের কাছে
      if (sender.role === "user") {
        // console.log("ok");
        for (let [id, u] of Object.entries(users)) {
          if (u.role === "admin") {
            io.to(id).emit("receive_message", {
              ...data,
              fromSocket: socket.id,
              fromName: sender.name,
            });
          }
        }
      }

    //   console.log(data);

      // 👨‍💼 যদি অ্যাডমিন হয় → নির্দিষ্ট ইউজারের কাছে পাঠাবে
      if (sender.role === "admin" && data.toSocket) {
        io.to(data.toSocket).emit("receive_message", {
          ...data,
          fromSocket: socket.id,
          fromName: "Admin",
        });
      }
    });

    // 🔹 ইউজার ডিসকানেক্ট হলে
    socket.on("disconnect", () => {
      console.log("🔴 Disconnected:", socket.id);
      delete users[socket.id];

      // admin-দের আপডেট করা ইউজার লিস্ট পাঠাও
      for (let [id, u] of Object.entries(users)) {
        if (u.role === "admin") {
          io.to(id).emit("user_list", getUserList(users));
        }
      }
    });
  });

  // helper function
  function getUserList(users) {
    return Object.entries(users)
      .filter(([_, u]) => u.role === "user")
      .map(([id, u]) => ({
        socketId: id,
        name: u.name,
      }));
  }

  return server;
}

module.exports = liveChat;
