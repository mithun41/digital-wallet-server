const express = require("express");
const { protectByToken } = require("../middleware/authMiddleware");
const { adminProtect } = require("../middleware/adminMiddleware");
const { education } = require("../controllers/eduControllers");
const router = express.Router();

router.post('/',education)

module.exports = router;