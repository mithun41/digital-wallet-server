const express = require("express");
const {
  applyLoan,
  getUserLoans,
  getAllLoans,
  approveLoan,
  rejectLoan,
  repayLoan,
} = require("../controllers/loanControllers");
const { protectByToken } = require("../middleware/authMiddleware");
const { adminProtect } = require("../middleware/adminMiddleware");

const router = express.Router();

// ===== User Routes =====
router.post("/user/apply", protectByToken, applyLoan);
router.get("/user/my", protectByToken, getUserLoans);
router.put("/user/repay/:id", protectByToken, repayLoan);

// ===== Admin Routes =====
router.get("/admin/all", protectByToken, adminProtect, getAllLoans);
router.put("/admin/approve/:id", protectByToken, adminProtect, approveLoan);
router.put("/admin/reject/:id", protectByToken, adminProtect, rejectLoan);

module.exports = router;
