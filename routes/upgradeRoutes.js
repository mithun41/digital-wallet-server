// routes/upgradeRoutes.js
const express = require("express");
const router = express.Router();
const {
  applyUpgradeRequest,
  getUpgradeRequests,
  approveMerchantRequest,
  rejectMerchantRequest,
} = require("../controllers/upgradeController");
const { protectByToken } = require("../middleware/authMiddleware");

// ---- User Routes ----
router.post("/user/applyupgrade", protectByToken, applyUpgradeRequest);
router.get("/user/upgrade-requests", protectByToken, getUpgradeRequests);

// ---- Admin Routes ----
router.put("/admin/merchant/approve/:id", protectByToken, approveMerchantRequest);
router.delete("/admin/merchant/reject/:id", protectByToken, rejectMerchantRequest);

module.exports = router;
