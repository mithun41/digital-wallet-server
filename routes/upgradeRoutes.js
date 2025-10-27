const express = require("express");
const router = express.Router();
const {
  applyUpgradeRequest,
  getUpgradeRequests,
  approveMerchantRequest,
  rejectMerchantRequest,
} = require("../controllers/upgradeController");
const { protectByToken } = require("../middleware/authMiddleware");
const { adminProtect } = require("../middleware/adminMiddleware");

// ---- User Routes ----
router.post("/user/applyupgrade", protectByToken, applyUpgradeRequest);
router.get(
  "/user/upgrade-requests",
  protectByToken,
  adminProtect,
  getUpgradeRequests
);

// ---- Admin Routes ----
router.put(
  "/admin/merchant/approve/:id",
  protectByToken,
  adminProtect,
  approveMerchantRequest
);
router.delete(
  "/admin/merchant/reject/:id",
  protectByToken,
  adminProtect,
  rejectMerchantRequest
);

module.exports = router;
