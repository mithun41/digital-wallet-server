const express = require("express");
const { protectByToken } = require("../middleware/authMiddleware");
const {
  sendMoney,
  cashout,
  flexiload,
  getTransactions,
  addMoney,
} = require("../controllers/transactionController");
const router = express.Router();

router.post("/add-money", protectByToken, addMoney);
router.post("/send-money", protectByToken, sendMoney);
router.post("/cashout", protectByToken, cashout);
router.get("/", protectByToken, getTransactions);
module.exports = router;
