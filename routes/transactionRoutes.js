const express = require("express");
const { protectByToken } = require("../middleware/authMiddleware");
const {
  sendMoney,
  cashout,
  flexiload,
  getTransactions,
  addMoney,
  getAllTransactions,
  refundTransaction,
} = require("../controllers/transactionController");
const { adminProtect } = require("../middleware/adminMiddleware");
const router = express.Router();

router.post("/add-money", protectByToken, addMoney);
router.post("/send-money", protectByToken, sendMoney);
router.post("/cashout", protectByToken, cashout);
router.get("/", protectByToken, getTransactions);
router.get("/admin", protectByToken, adminProtect, getAllTransactions);
router.post("/:id/refund", protectByToken, adminProtect, refundTransaction);
module.exports = router;
