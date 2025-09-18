const express = require("express");
const app = express();

const PORT = process.env.PORT || 5000;
app.get("/", (req, res) => {
  res.send("🚀 Digital Wallet API is running...");
});
app.listen(PORT, () => {
  console.log(`🚀 Server running locally on port ${PORT}`);
});
