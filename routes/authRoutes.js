const express = require("express");
const {
  registerUser,
  loginUser,
  getMe,
  resetPin,
  updateProfile,
  getAllUsers,
  updateUserStatus,
  resetUserPin,
  startFingerprintRegistration,
  verifyFingerprintRegistration,
  startFingerprintLogin,
  verifyFingerprintLogin,
} = require("../controllers/authControllers");
const { protectByToken } = require("../middleware/authMiddleware");
const { adminProtect } = require("../middleware/adminMiddleware");

const router = express.Router();

// Public
router.post("/register", registerUser);
router.post("/login", loginUser);

// Protected user routes
router.get("/me", protectByToken, getMe);
router.put("/update-profile", protectByToken, updateProfile);
router.post("/reset-pin", protectByToken, resetPin);

// Admin routes
router.get("/admin/users", protectByToken, adminProtect, getAllUsers);
router.patch(
  "/admin/users/:id/status",
  protectByToken,
  adminProtect,
  updateUserStatus
);
router.post(
  "/admin/users/:id/reset-pin",
  protectByToken,
  adminProtect,
  resetUserPin
);
module.exports = router;
