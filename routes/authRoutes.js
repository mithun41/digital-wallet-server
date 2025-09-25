const express = require("express");
const {
  registerUser,
  loginUser,
  getMe,
  resetPin,
  updateProfile,
} = require("../controllers/authControllers");
const { protectByToken } = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/register", registerUser);
router.post("/login", loginUser);
router.get("/me", protectByToken, getMe);
router.post("/reset-pin", protectByToken, resetPin);
router.put("/update-profile", protectByToken, updateProfile);
module.exports = router;
