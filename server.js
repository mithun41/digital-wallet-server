const app = require("./api/index");

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running locally on port ${PORT}`);
});

// const express = require("express");
// const app = express();

// const PORT = process.env.PORT || 5000;
// app.get("/", (req, res) => {
//   res.send("🚀 Digital Wallet API is running...");
// });
// app.listen(PORT, () => {
//   console.log(`🚀 Server running locally on port ${PORT}`);
// });


// JWT_SECRET = 6b2a9649cabb716557e998ebee1e46026c5453b3a104735af1dab2cb381385d044f60bf2b480e87f37cef518fe93ba54ea4c99e56516b19ec07999faab23b848
