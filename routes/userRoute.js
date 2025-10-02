const express = require("express");
const router = express.Router();
const { checkUserByPhone } = require("../controllers/userController");

// POST /api/users/check-user
router.post("/check-user", checkUserByPhone);

module.exports = router;
