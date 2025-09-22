const express = require("express");
const {
  registerUser,
  loginUser,
  getMe,
} = require("../controllers/authControllers");
const {
  registerUser,
  loginUser,
  resetPin,
} = require("../controllers/authControllers");

const router = express.Router();

router.post("/register", registerUser);
router.post("/login", loginUser);
router.get("/me", getMe);

router.post("/reset-pin", resetPin);
module.exports = router;
