const express = require("express");
const {
  startFingerprintRegistration,
  verifyFingerprintRegistration,
  startFingerprintLogin,
  verifyFingerprintLogin,
} = require("../controllers/fingerprintController");
const { protectByToken } = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/register/start", protectByToken, startFingerprintRegistration);
router.post("/register/verify", protectByToken, verifyFingerprintRegistration);
router.post("/login/start", startFingerprintLogin);
router.post("/login/verify", verifyFingerprintLogin);

module.exports = router;
