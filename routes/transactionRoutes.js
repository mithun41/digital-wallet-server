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

router.post("/send-money", protectByToken, sendMoney);
router.post("/cashout", protectByToken, cashout);
router.get("/", protectByToken, getTransactions);
module.exports = router;
