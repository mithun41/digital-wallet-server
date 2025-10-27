const express = require("express");
const { protectByToken } = require("../middleware/authMiddleware");
const { adminProtect } = require("../middleware/adminMiddleware");
const {
  userReport,
  getAllReports,
  updateReport,
  getUserReports,
} = require("../controllers/reportControllers");

const router = express.Router();

// User
router.post("/", protectByToken, userReport);
router.get("/my-reports", getUserReports);

// Admin
router.get("/all", protectByToken, getAllReports);
router.put("/update/:id", protectByToken, adminProtect, updateReport);

module.exports = router;
