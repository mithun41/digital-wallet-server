const express = require("express");
const { protectByToken } = require("../middleware/authMiddleware");
const { adminProtect } = require("../middleware/adminMiddleware");
const  {education}  = require("../routes/eduRoutes");
const router = express.Router();

router.post('/', education)

module.exports = router;