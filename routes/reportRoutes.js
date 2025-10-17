const express = require("express");
const { protectByToken } = require("../middleware/authMiddleware");

const { adminProtect } = require("../middleware/adminMiddleware");
const { userReport } = require("../controllers/reportcontrollers");


const router = express.Router();


router.post("/", userReport )

module.exports = router;