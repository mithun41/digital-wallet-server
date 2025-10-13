const express = require("express");
const { addCard, getCardsByPhone } = require("../controllers/cardController");
const { protectByToken } = require("../middleware/authMiddleware"); // ✅ must use curly braces

const router = express.Router();

router.post("/", protectByToken, addCard); // ✅ protectByToken must be a function
router.get("/by-phone/:phone", protectByToken, getCardsByPhone);

module.exports = router;
