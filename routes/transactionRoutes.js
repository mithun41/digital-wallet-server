const express = require("express");
const { protectByToken } = require("../middleware/authMiddleware");
const {
  sendMoney,
  addMoney,
  cashout,
  flexiload,
  getTransactions,
} = require("../controllers/transactionController");
const router = express.Router();

router.post("/send", protectByToken, sendMoney);
router.get("/", protectByToken, getTransactions);
module.exports = router;
