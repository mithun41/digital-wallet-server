const express = require("express");
const { protectByToken } = require("../middleware/authMiddleware");
const { adminProtect } = require("../middleware/adminMiddleware");
const { education } = require("../controllers/eduControllers"); // ✅ ঠিক করা হলো
const router = express.Router();

// Optionally you can protect the route
// router.post('/', protectByToken, adminProtect, education);
router.post("/", education);

module.exports = router;
