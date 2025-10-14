// server.js (local dev only)
require("dotenv").config();
const app = require("./api/index");
const { PayBill } = require("./controllers/transactionController");
const { protectByToken } = require("./middleware/authMiddleware");

const PORT = process.env.PORT || 5000;



app.listen(PORT, () => {
  console.log(`🚀 Server running locally on port ${PORT}`);
});
